/**
 * PDF Text Extraction Service
 *
 * Triple extractor with OCR fallback:
 * 1. pdf-parse (v2 PDFParse) - fastest for text-based PDFs
 * 2. pdfjs-dist - fallback for text extraction
 * 3. OpenAI GPT-4 with PDF file upload - for image-based/scanned PDFs
 * 
 * Automatically detects image-based PDFs and uses AI when needed.
 */

import { createRequire } from 'node:module';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

const require = createRequire(import.meta.url);

/** Extract text via pdf-parse v2 (PDFParse class). Returns '' on error. */
async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy().catch(() => {});
    return (result?.text ?? '').trim();
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
 * Extract text from PDF using OpenAI's file upload and GPT-4
 * This handles image-based/scanned PDFs that have no text layer
 */
async function extractWithOpenAI(buffer: Buffer): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[pdfParsingService] OpenAI API key not configured');
    return '';
  }

  try {
    console.log('[pdfParsingService] Starting OpenAI PDF extraction...');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Save buffer to temp file (OpenAI needs a file path)
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `credit-report-${Date.now()}.pdf`);
    fs.writeFileSync(tempFile, buffer);
    
    try {
      // Upload file to OpenAI
      console.log('[pdfParsingService] Uploading PDF to OpenAI...');
      const file = await openai.files.create({
        file: fs.createReadStream(tempFile),
        purpose: 'assistants',
      });
      
      console.log(`[pdfParsingService] File uploaded: ${file.id}`);

      // Use GPT-4 with the file to extract text
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert credit report data extractor. Your job is to extract ALL text and data from credit report PDFs with perfect accuracy.

Extract and format the following information:
1. Personal Information (name, address, SSN, DOB)
2. Credit Scores (from each bureau if shown)
3. ALL Account Information including:
   - Creditor/Account Name
   - Account Number (full or partial)
   - Account Type
   - Date Opened
   - Credit Limit / Original Amount
   - Current Balance
   - Payment Status
   - Payment History
   - Any remarks or notes
4. Collections and Charge-offs
5. Public Records
6. Inquiries
7. Any negative items or derogatory marks

Format the output as structured text that preserves all data. Do NOT summarize - extract EVERYTHING.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'file',
                file: {
                  file_id: file.id,
                },
              } as any,
              {
                type: 'text',
                text: 'Extract ALL text and data from this credit report PDF. Include every account, every detail, every date, and every balance. Do not summarize - I need the complete raw data.',
              },
            ],
          },
        ],
        max_tokens: 16000,
      });

      const extractedText = response.choices[0]?.message?.content || '';
      console.log(`[pdfParsingService] OpenAI extracted ${extractedText.length} chars`);

      // Clean up: delete the uploaded file
      try {
        await openai.files.del(file.id);
      } catch (e) {
        console.warn('[pdfParsingService] Failed to delete temp file from OpenAI:', e);
      }

      return extractedText;

    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

  } catch (e) {
    console.error('[pdfParsingService] OpenAI extraction failed:', e);
    return '';
  }
}

/**
 * Alternative: Use OpenAI Vision with base64 PDF pages rendered as images
 * Fallback if file upload doesn't work
 */
async function extractWithOpenAIVision(buffer: Buffer): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[pdfParsingService] OpenAI API key not configured');
    return '';
  }

  try {
    console.log('[pdfParsingService] Starting OpenAI Vision extraction...');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert PDF buffer to base64
    const base64Pdf = buffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

    // GPT-4o can process PDFs directly via base64
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert credit report data extractor. Extract ALL text and data from this credit report with perfect accuracy. Include:
- Personal info (name, address, SSN)
- Credit scores
- ALL accounts with full details (creditor, account number, type, dates, balances, status, payment history)
- Collections and charge-offs
- Public records
- Inquiries
Do NOT summarize - extract the complete raw data.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
            {
              type: 'text',
              text: 'Extract ALL text and data from this credit report. Include every account, every detail, every date, and every balance.',
            },
          ],
        },
      ],
      max_tokens: 16000,
    });

    const extractedText = response.choices[0]?.message?.content || '';
    console.log(`[pdfParsingService] OpenAI Vision extracted ${extractedText.length} chars`);
    return extractedText;

  } catch (e) {
    console.error('[pdfParsingService] OpenAI Vision extraction failed:', e);
    return '';
  }
}

/**
 * Check if extracted text looks like valid credit report content
 * Returns false if text is mostly empty or just page markers
 */
function isValidCreditReportText(text: string): boolean {
  if (!text || text.length < 200) return false;
  
  // Check for common credit report keywords
  const keywords = [
    'account', 'balance', 'credit', 'payment', 'status',
    'creditor', 'opened', 'reported', 'collection', 'charge',
    'transunion', 'equifax', 'experian', 'bureau'
  ];
  
  const lowerText = text.toLowerCase();
  const keywordMatches = keywords.filter(kw => lowerText.includes(kw)).length;
  
  // Should have at least 3 credit-related keywords
  return keywordMatches >= 3;
}

/**
 * Extract text from a PDF buffer.
 * 
 * Strategy:
 * 1. Try pdf-parse first (fastest)
 * 2. If little/no text, try pdfjs-dist
 * 3. If still no valid text, use OpenAI (for scanned/image PDFs)
 */
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  console.log('[pdfParsingService] Starting PDF text extraction...');
  
  // Step 1: Try pdf-parse
  const fromParse = await extractWithPdfParse(buffer);
  if (isValidCreditReportText(fromParse)) {
    console.log(`[pdfParsingService] pdf-parse succeeded (${fromParse.length} chars)`);
    return fromParse;
  }
  
  // Step 2: Try pdfjs-dist
  const fromPdfJs = await extractWithPdfJsDist(buffer);
  if (isValidCreditReportText(fromPdfJs)) {
    console.log(`[pdfParsingService] pdfjs-dist succeeded (${fromPdfJs.length} chars)`);
    return fromPdfJs;
  }
  
  // Step 3: Text extraction failed - this is likely an image-based PDF
  // Use OpenAI to extract text
  console.log('[pdfParsingService] Text extraction returned no valid content - attempting OpenAI extraction...');
  
  // Try file upload method first
  let fromOpenAI = await extractWithOpenAI(buffer);
  
  // If file upload fails, try vision method
  if (!fromOpenAI || fromOpenAI.length < 100) {
    console.log('[pdfParsingService] File upload method failed, trying Vision method...');
    fromOpenAI = await extractWithOpenAIVision(buffer);
  }
  
  if (fromOpenAI && fromOpenAI.length > 100) {
    console.log(`[pdfParsingService] OpenAI extraction succeeded (${fromOpenAI.length} chars)`);
    return fromOpenAI;
  }
  
  // Return whatever we got (might be empty)
  console.warn('[pdfParsingService] All extraction methods returned minimal content');
  const best = [fromParse, fromPdfJs, fromOpenAI].sort((a, b) => b.length - a.length)[0];
  return best || '';
}

/**
 * Force OpenAI extraction
 * Use this when you know the PDF is image-based
 */
export async function extractTextWithOCR(buffer: Buffer): Promise<string> {
  let result = await extractWithOpenAI(buffer);
  if (!result || result.length < 100) {
    result = await extractWithOpenAIVision(buffer);
  }
  return result;
}
