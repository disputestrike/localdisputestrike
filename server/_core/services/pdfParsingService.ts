/**
 * PDF Text Extraction Service
 *
 * Dual extractor: pdf-parse first, then pdfjs-dist if empty. Uses whichever
 * returns more text. Per Source Bible §5 (Technical Architecture): PDF text
 * extraction library + AI analysis. Works on buffers (multer memory storage).
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = (typeof pdfParseModule === 'function' ? pdfParseModule : pdfParseModule.default) as (buf: Buffer) => Promise<{ text: string }>;

/** Extract text via pdf-parse. Returns '' on error. */
async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return (data?.text || '').trim();
  } catch (e) {
    console.warn('[pdfParsingService] pdf-parse failed:', e);
    return '';
  }
}

/** Extract text via pdfjs-dist (Mozilla PDF.js). Returns '' on error. */
async function extractWithPdfJsDist(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist');
    const { getDocument } = pdfjs;
    const doc = await getDocument({ data: new Uint8Array(buffer) }).promise;
    const numPages = doc.numPages;
    let text = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = (content.items as { str?: string }[])
        .map((item) => item.str || '')
        .join(' ');
      text += pageText + '\n';
    }
    return text.trim();
  } catch (e) {
    console.warn('[pdfParsingService] pdfjs-dist failed:', e);
    return '';
  }
}

/**
 * Extract text from a PDF buffer. Uses pdf-parse first, then pdfjs-dist if
 * little or no text. Returns whichever yields more. Per Source Bible §5:
 * PDF extraction library + AI analysis.
 */
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  const fromParse = await extractWithPdfParse(buffer);
  if (fromParse.length > 100) return fromParse;
  const fromPdfJs = await extractWithPdfJsDist(buffer);
  return fromParse.length >= fromPdfJs.length ? fromParse : fromPdfJs;
}
