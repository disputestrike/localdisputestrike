/**
 * Affiliate tracking + Free preview upload-and-analyze (Compliance Audit Jan 2026)
 *
 * - POST /api/affiliate/track-click: SmartCredit PID 87529 tracking
 * - POST /api/credit-reports/upload-and-analyze: FREE preview, no $4.95
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractTextFromPDFBuffer } from './_core/services/pdfParsingService';
import {
  runPreviewAnalysis,
  type PreviewAnalysisResult,
} from './previewAnalysisService';

const router = Router();

const SMARTCREDIT_PID = '87529';
const AFFILIATE_COOKIE = 'affiliate_source';
const AFFILIATE_COOKIE_MAX_AGE_DAYS = 30;

// Multer for preview upload (transunion, equifax, experian)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * POST /api/affiliate/track-click
 * Body: { source: 'smartcredit' }
 * Sets cookie + logs. Affiliate source is stored on signup.
 */
router.post('/affiliate/track-click', (req: Request, res: Response) => {
  try {
    const source = (req.body?.source || 'smartcredit') as string;
    if (['smartcredit', 'identityiq', 'direct_upload', 'none'].includes(source)) {
      res.cookie(AFFILIATE_COOKIE, source, {
        maxAge: AFFILIATE_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      if (source === 'smartcredit') {
        console.log(`[Affiliate] track-click source=smartcredit PID=${SMARTCREDIT_PID}`);
      } else {
        console.log(`[Affiliate] track-click source=${source}`);
      }
    }
    res.status(200).json({ ok: true, source });
  } catch (e) {
    console.error('[Affiliate] track-click error:', e);
    res.status(500).json({ error: 'Failed to track' });
  }
});

/**
 * Map PreviewAnalysisResult -> LightAnalysisResult (PreviewResults page contract)
 */
function toLightAnalysisResult(p: PreviewAnalysisResult): {
  totalViolations: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  categoryBreakdown: { latePayments: number; collections: number; chargeOffs: number; judgments: number; other: number };
  accountPreviews?: { name: string; last4: string; balance: string; status: string; amountType?: string }[];
  creditScore?: number;
} {
  const t = Math.max(1, p.totalViolations);
  
  console.log('[toLightAnalysisResult] Input accountPreviews:', p.accountPreviews?.length || 0);
  console.log('[toLightAnalysisResult] Input totalViolations:', p.totalViolations);
  
  const result = {
    totalViolations: p.totalViolations,
    severityBreakdown: {
      critical: Math.floor(t * 0.1),
      high: Math.floor(t * 0.2),
      medium: Math.floor(t * 0.3),
      low: Math.max(0, t - Math.floor(t * 0.6)),
    },
    categoryBreakdown: {
      latePayments: p.categories?.latePayments ?? 0,
      collections: p.categories?.collections ?? 0,
      chargeOffs: Math.floor((p.categories?.accountErrors ?? 0) / 2) + Math.floor((p.categories?.other ?? 0) / 2),
      judgments: p.categories?.publicRecords ?? 0,
      other: (p.categories?.inquiries ?? 0) + (p.categories?.accountErrors ?? 0) + (p.categories?.other ?? 0),
    },
    accountPreviews: p.accountPreviews?.length ? p.accountPreviews : undefined,
    creditScore: p.creditScore,
  };
  
  console.log('[toLightAnalysisResult] Output accountPreviews:', result.accountPreviews?.length || 0);
  
  return result;
}

/**
 * POST /api/credit-reports/upload-and-analyze
 * FormData: transunion, equifax, experian (files). At least one required.
 * Returns LightAnalysisResult-compatible JSON for PreviewResults.
 * FREE preview – no $4.95.
 */
const uploadFields = upload.fields([
  { name: 'transunion', maxCount: 1 },
  { name: 'equifax', maxCount: 1 },
  { name: 'experian', maxCount: 1 },
]);

router.post(
  '/credit-reports/upload-and-analyze',
  (req: Request, res: Response, next: () => void) => {
    uploadFields(req, res, (err: unknown) => {
      if (err) {
        const code = (err as { code?: string })?.code;
        if (code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File too large. Max 50MB per file.' });
        }
        if (code === 'LIMIT_FILE_COUNT' || code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Invalid upload. Use one file per bureau (TransUnion, Equifax, Experian).' });
        }
        console.error('[Preview] Multer error:', err);
        return res.status(400).json({ error: 'Invalid upload. Check file types (PDF/HTML) and sizes.' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [k: string]: Express.Multer.File[] } | undefined;
      
      console.log('[Preview] === INDIVIDUAL FILE UPLOAD ===');
      console.log('[Preview] Files received:', Object.keys(files || {}));
      
      if (!files || !Object.keys(files).length) {
        console.log('[Preview] ERROR: No files in request');
        return res.status(400).json({ error: 'No files uploaded' });
      }

      let combinedText = '';
      const fallbackCandidates: { key: string; file: Express.Multer.File }[] = [];

      for (const key of ['transunion', 'equifax', 'experian']) {
        const arr = files[key];
        const file = arr?.[0];
        if (!file?.buffer) {
          console.log(`[Preview] No file for ${key}`);
          continue;
        }
        
        console.log(`[Preview] Processing ${key}: ${file.originalname}, size: ${file.buffer.length} bytes, mime: ${file.mimetype}`);
        
        const name = (file.originalname || '').toLowerCase();
        const isHtml =
          file.mimetype?.includes('text/html') || name.endsWith('.html') || name.endsWith('.htm');
        if (!isHtml) fallbackCandidates.push({ key, file });
        try {
          if (isHtml) {
            const htmlText = file.buffer.toString('utf8');
            console.log(`[Preview] ${key} HTML text length: ${htmlText.length}`);
            combinedText += `\n\n--- ${key.toUpperCase()} BUREAU ---\n\n` + htmlText;
          } else {
            const text = await extractTextFromPDFBuffer(file.buffer);
            console.log(`[Preview] ${key} PDF text extracted: ${text?.length || 0} chars`);
            if (text && text.length > 0) {
              combinedText += `\n\n--- ${key.toUpperCase()} BUREAU ---\n\n` + text;
            } else {
              console.log(`[Preview] WARNING: ${key} PDF returned no text (may be image-based)`);
            }
          }
        } catch (e) {
          console.warn(`[Preview] parse ${key} failed:`, e);
        }
      }

      let trimmedText = combinedText.trim();
      console.log(`[Preview] Total combined text length: ${trimmedText.length} chars`);

      // If text extraction failed but we have PDF files, try OCR/Vision extraction
      if (trimmedText.length < 100 && fallbackCandidates.length > 0) {
        console.log('[Preview] Text extraction insufficient, trying OCR for image-based PDFs...');
        
        // Dynamic import to avoid circular dependencies
        const { extractTextWithOCR } = await import('./_core/services/pdfParsingService');
        
        for (const { key, file } of fallbackCandidates) {
          try {
            console.log(`[Preview] OCR extraction for ${key}...`);
            const ocrText = await extractTextWithOCR(file.buffer);
            if (ocrText && ocrText.length > 100) {
              console.log(`[Preview] OCR ${key} succeeded: ${ocrText.length} chars`);
              trimmedText += `\n\n--- ${key.toUpperCase()} BUREAU (OCR) ---\n\n` + ocrText;
            } else {
              console.log(`[Preview] OCR ${key} returned insufficient text`);
            }
          } catch (e) {
            console.warn(`[Preview] OCR ${key} failed:`, e);
          }
        }
        
        trimmedText = trimmedText.trim();
        console.log(`[Preview] After OCR, total text length: ${trimmedText.length} chars`);
      }

      if (!trimmedText || trimmedText.length < 100) {
        console.log('[Preview] ERROR: Could not extract text from any PDF');
        return res.status(422).json({
          error: 'Could not read text from your PDFs.',
          message: 'We tried both text extraction and OCR but could not read your files.',
          suggestion: 'Try uploading a different PDF format or use AnnualCreditReport.com.',
        });
      }

      try {
        const preview = await runPreviewAnalysis(trimmedText);
        if (preview.totalViolations === 0) {
          return res.status(422).json({
            error: 'Could not extract violations from this report',
            message: 'This PDF may be corrupted, image-only, or not a credit report.',
            suggestion: 'Try uploading a different PDF or use AnnualCreditReport.com.',
          });
        }
        const light = toLightAnalysisResult(preview);
        return res.status(200).json(light);
      } catch (e: unknown) {
        console.error('[Preview] runPreviewAnalysis error:', e);
        const errMsg = e instanceof Error ? e.message : '';
        if (errMsg.includes('AI API key') || errMsg.includes('API key')) {
          return res.status(503).json({ error: 'Analysis service temporarily unavailable. Please try again later.' });
        }
        return res.status(500).json({ error: 'Preview analysis failed. Please try again.' });
      }
    } catch (e) {
      console.error('[Preview] upload-and-analyze error:', e);
      return res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
  }
);

export default router;
