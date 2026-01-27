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
 * OPTIMIZED: Uses maximum tokens and aggressive extraction prompts
 */
async function extractWithOpenAI(buffer: Buffer): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[pdfParsingService] OpenAI API key not configured');
    return '';
  }

  try {
    console.log('[pdfParsingService] Starting OpenAI PDF extraction (AGGRESSIVE MODE)...');
    const startTime = Date.now();
    
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

      // Use GPT-4o with AGGRESSIVE extraction prompt
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an EXPERT credit report OCR system. Your ONLY job is to extract EVERY SINGLE piece of text from this credit report PDF.

**CRITICAL INSTRUCTIONS:**
1. Extract EVERY account - there may be 30, 50, or even 100+ accounts
2. Extract EVERY line of text you can see
3. Do NOT summarize - output the RAW TEXT
4. Include ALL numbers, dates, balances, account numbers
5. Extract EVERY negative item: collections, charge-offs, late payments, repos, foreclosures
6. Include payment history grids/patterns if visible
7. Extract ALL creditor names EXACTLY as shown

**OUTPUT FORMAT:**
Just output all the text you can extract, organized by section:
- PERSONAL INFO
- CREDIT SCORES  
- ACCOUNTS (list EVERY account with ALL details)
- COLLECTIONS
- PUBLIC RECORDS
- INQUIRIES

**THERE IS NO LIMIT - EXTRACT EVERYTHING YOU CAN SEE!**`
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
                text: 'OCR this entire credit report. Extract EVERY account, EVERY balance, EVERY date, EVERY creditor name. Output ALL text - do not summarize. I need the complete raw data for ALL accounts.',
              },
            ],
          },
        ],
        max_tokens: 16000, // Max allowed by GPT-4o
        temperature: 0, // Deterministic for accuracy
      });

      const extractedText = response.choices[0]?.message?.content || '';
      const elapsed = Date.now() - startTime;
      console.log(`[pdfParsingService] OpenAI extracted ${extractedText.length} chars in ${elapsed}ms`);

      // Clean up: delete the uploaded file (ignore errors)
      openai.files.delete(file.id).catch(() => {});

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
 * Alternative: Use Anthropic Claude for PDF extraction
 * Claude can handle PDFs natively via base64
 */
async function extractWithClaude(buffer: Buffer): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.warn('[pdfParsingService] Anthropic API key not configured');
    return '';
  }

  try {
    console.log('[pdfParsingService] Starting Claude PDF extraction (AGGRESSIVE)...');
    const startTime = Date.now();
    
    // Convert PDF buffer to base64
    const base64Pdf = buffer.toString('base64');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64Pdf,
                },
              },
              {
                type: 'text',
                text: `You are an EXPERT credit report OCR system. Extract EVERY SINGLE piece of text from this credit report PDF.

**CRITICAL INSTRUCTIONS:**
1. Extract EVERY account - there may be 30, 50, or even 100+ accounts
2. Extract EVERY line of text you can see
3. Do NOT summarize - output the RAW TEXT
4. Include ALL numbers, dates, balances, account numbers
5. Extract EVERY negative item: collections, charge-offs, late payments, repos, foreclosures
6. Include payment history grids/patterns if visible
7. Extract ALL creditor names EXACTLY as shown

**OUTPUT FORMAT:**
Just output all the text you can extract, organized by section:
- PERSONAL INFO
- CREDIT SCORES  
- ACCOUNTS (list EVERY account with ALL details)
- COLLECTIONS
- PUBLIC RECORDS
- INQUIRIES

**THERE IS NO LIMIT - EXTRACT EVERYTHING YOU CAN SEE!**`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[pdfParsingService] Claude API error:', response.status, errorText);
      return '';
    }

    const data = await response.json() as { content?: Array<{ type: string; text?: string }> };
    const extractedText = data.content?.[0]?.text || '';
    const elapsed = Date.now() - startTime;
    console.log(`[pdfParsingService] Claude extracted ${extractedText.length} chars in ${elapsed}ms`);
    return extractedText;

  } catch (e) {
    console.error('[pdfParsingService] Claude extraction failed:', e);
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
 * 3. If still no valid text, use Claude (best for image-based PDFs)
 * 4. Fallback to OpenAI file upload
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
  // Try Claude first (best for PDFs)
  console.log('[pdfParsingService] Text extraction returned no valid content - attempting Claude extraction...');
  
  let fromClaude = await extractWithClaude(buffer);
  if (fromClaude && fromClaude.length > 500) {
    console.log(`[pdfParsingService] Claude extraction succeeded (${fromClaude.length} chars)`);
    return fromClaude;
  }
  
  // Step 4: Fallback to OpenAI file upload
  console.log('[pdfParsingService] Claude failed, trying OpenAI file upload...');
  let fromOpenAI = await extractWithOpenAI(buffer);
  
  if (fromOpenAI && fromOpenAI.length > 500) {
    console.log(`[pdfParsingService] OpenAI extraction succeeded (${fromOpenAI.length} chars)`);
    return fromOpenAI;
  }
  
  // Return whatever we got (might be empty)
  console.warn('[pdfParsingService] All extraction methods returned minimal content');
  const best = [fromParse, fromPdfJs, fromClaude, fromOpenAI].sort((a, b) => b.length - a.length)[0];
  return best || '';
}

/**
 * Force AI extraction (Claude first, then OpenAI)
 * Use this when you know the PDF is image-based
 */
export async function extractTextWithOCR(buffer: Buffer): Promise<string> {
  // Try Claude first - best for PDFs
  let result = await extractWithClaude(buffer);
  if (result && result.length > 500) {
    return result;
  }
  
  // Fallback to OpenAI
  result = await extractWithOpenAI(buffer);
  return result || '';
}
