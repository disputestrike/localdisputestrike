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
function dedupeAccountPreviews(
  previews: { name: string; last4: string; balance: string; status: string; amountType?: string }[]
): { name: string; last4: string; balance: string; status: string; amountType?: string }[] {
  const seen = new Set<string>();
  return previews.filter((a) => {
    const key = `${(a.name || '').trim().toLowerCase()}|${(a.last4 || '').replace(/\D/g, '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toLightAnalysisResult(p: PreviewAnalysisResult): {
  totalViolations: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  categoryBreakdown: { latePayments: number; collections: number; chargeOffs: number; judgments: number; other: number };
  accountPreviews?: { name: string; last4: string; balance: string; status: string; amountType?: string }[];
  creditScore?: number;
  creditScores?: { transunion?: number; equifax?: number; experian?: number };
  consumerInfo?: Record<string, string>;
} {
  const rawPreviews = p.accountPreviews ?? [];
  const deduped = dedupeAccountPreviews(rawPreviews);
  const uniqueAccountCount = deduped.length;
  const disputableItemsFromAccounts = uniqueAccountCount * 3;
  const aiTotal = Math.max(0, p.totalViolations || 0);

  // CRITICAL: totalViolations = what we'll actually save (deduped accounts × 3 bureaus)
  // Ensures preview number matches full analysis after payment
  const finalTotal = uniqueAccountCount > 0 ? disputableItemsFromAccounts : aiTotal;

  const t = Math.max(1, finalTotal);
  const cat = p.categories ?? {};
  const latePayments = Math.max(0, cat.latePayments ?? 0);
  const collections = Math.max(0, cat.collections ?? 0);
  const chargeOffs = Math.max(0, cat.accountErrors ?? 0);
  const judgments = Math.max(0, cat.publicRecords ?? 0);
  const other = Math.max(0, (cat.inquiries ?? 0) + (cat.other ?? 0));

  const categorySum = latePayments + collections + chargeOffs + judgments + other;
  const categoryBreakdown = {
    latePayments,
    collections,
    chargeOffs,
    judgments,
    other: categorySum > 0 ? other : Math.max(0, t - latePayments - collections - chargeOffs - judgments),
  };

  const critical = collections + chargeOffs + judgments;
  const high = latePayments;
  const remaining = Math.max(0, t - critical - high);
  const severityBreakdown = {
    critical: Math.min(critical, t),
    high: Math.min(high, Math.max(0, t - critical)),
    medium: Math.floor(remaining * 0.7),
    low: Math.max(0, remaining - Math.floor(remaining * 0.7)),
  };

  console.log('[toLightAnalysisResult] Deduped:', uniqueAccountCount, 'accounts →', disputableItemsFromAccounts, 'disputable items; AI:', aiTotal, '→ final:', finalTotal);

  const consumerInfo = p.consumerInfo
    ? {
        fullName: p.consumerInfo.fullName ?? '',
        currentAddress: p.consumerInfo.currentAddress ?? '',
        currentCity: p.consumerInfo.currentCity ?? '',
        currentState: p.consumerInfo.currentState ?? '',
        currentZip: p.consumerInfo.currentZip ?? '',
        previousAddress: p.consumerInfo.previousAddress ?? '',
        previousCity: p.consumerInfo.previousCity ?? '',
        previousState: p.consumerInfo.previousState ?? '',
        previousZip: p.consumerInfo.previousZip ?? '',
        dateOfBirth: p.consumerInfo.dateOfBirth ?? '',
        phone: p.consumerInfo.phone ?? '',
        ssnLast4: p.consumerInfo.ssnLast4 ?? '',
      }
    : undefined;

  console.log('[toLightAnalysisResult] Passing consumerInfo to client:', consumerInfo);

  return {
    totalViolations: finalTotal,
    severityBreakdown,
    categoryBreakdown,
    accountPreviews: deduped.length ? deduped : undefined,
    creditScore: p.creditScore,
    creditScores: p.creditScores?.transunion != null || p.creditScores?.equifax != null || p.creditScores?.experian != null
      ? {
          transunion: p.creditScores.transunion ?? undefined,
          equifax: p.creditScores.equifax ?? undefined,
          experian: p.creditScores.experian ?? undefined,
        }
      : undefined,
    consumerInfo,
  };
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

// 3-file upload + extraction + AI can take 3–5 minutes; avoid default timeouts
const UPLOAD_ANALYZE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/** Timeout + multer middleware for upload-and-analyze */
const uploadAndAnalyzeMulter = (req: Request, res: Response, next: () => void) => {
  req.setTimeout(UPLOAD_ANALYZE_TIMEOUT_MS);
  res.setTimeout(UPLOAD_ANALYZE_TIMEOUT_MS);
  uploadFields(req, res, (err: unknown) => {
    if (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Max 50MB per file.' });
      }
      if (code === 'LIMIT_FILE_COUNT' || code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Invalid upload. Use 1 combined file (all 3 bureaus) or 3 separate files (TransUnion, Equifax, Experian).' });
      }
      console.error('[Preview] Multer error:', err);
      return res.status(400).json({ error: 'Invalid upload. Check file types (PDF/HTML) and sizes.' });
    }
    next();
  });
};

/** Handler for upload-and-analyze (shared by both route registrations) */
async function handleUploadAndAnalyze(req: Request, res: Response) {
    try {
      const files = req.files as { [k: string]: Express.Multer.File[] } | undefined;
      
      console.log('[Preview] === INDIVIDUAL FILE UPLOAD ===');
      console.log('[Preview] Files received:', Object.keys(files || {}));
      
      if (!files || !Object.keys(files).length) {
        console.log('[Preview] ERROR: No files in request');
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const fallbackCandidates: { key: string; file: Express.Multer.File }[] = [];
      const filesToProcess: { key: string; file: Express.Multer.File; isHtml: boolean }[] = [];

      // Collect all files to process
      for (const key of ['transunion', 'equifax', 'experian']) {
        const arr = files[key];
        const file = arr?.[0];
        if (!file?.buffer) {
          console.log(`[Preview] No file for ${key}`);
          continue;
        }
        
        console.log(`[Preview] Queued ${key}: ${file.originalname}, size: ${file.buffer.length} bytes`);
        
        const name = (file.originalname || '').toLowerCase();
        const isHtml = file.mimetype?.includes('text/html') || name.endsWith('.html') || name.endsWith('.htm');
        filesToProcess.push({ key, file, isHtml });
        if (!isHtml) fallbackCandidates.push({ key, file });
      }

      // PARALLEL PROCESSING - Extract text from all files simultaneously
      console.log(`[Preview] Starting PARALLEL extraction for ${filesToProcess.length} files...`);
      const startTime = Date.now();
      
      // Track if PDFs are text-based (pdf-parse succeeded) or image-based (needed OCR)
      let isTextBasedPDF = true; // Default to true, will be set to false if OCR is needed
      
      const extractionPromises = filesToProcess.map(async ({ key, file, isHtml }) => {
        try {
          if (isHtml) {
            const htmlText = file.buffer.toString('utf8');
            console.log(`[Preview] ${key} HTML: ${htmlText.length} chars`);
            return { key, text: htmlText, success: true, isTextBased: true };
          } else {
            // Check if pdf-parse can extract text (text-based PDF)
            const { extractTextFromPDFBuffer } = await import('./_core/services/pdfParsingService');
            const text = await extractTextFromPDFBuffer(file.buffer);
            const textLength = text?.length || 0;
            console.log(`[Preview] ${key} PDF: ${textLength} chars`);
            
            // If we got good text (>1000 chars), it's likely text-based
            // If we got little text (<1000), it needed OCR (image-based)
            const isTextBased = textLength > 1000;
            if (!isTextBased) {
              isTextBasedPDF = false; // At least one PDF needed OCR
            }
            
            return { key, text: text || '', success: textLength > 0, isTextBased };
          }
        } catch (e) {
          console.warn(`[Preview] ${key} extraction failed:`, e);
          return { key, text: '', success: false, isTextBased: false };
        }
      });

      const results = await Promise.all(extractionPromises);
      const extractionTime = Date.now() - startTime;
      console.log(`[Preview] Parallel extraction completed in ${extractionTime}ms`);

      // Combine results
      let combinedText = '';
      for (const result of results) {
        if (result.text && result.text.length > 0) {
          combinedText += `\n\n--- ${result.key.toUpperCase()} BUREAU ---\n\n` + result.text;
        }
        // If any PDF needed OCR, mark as image-based
        if (!result.isTextBased) {
          isTextBasedPDF = false;
        }
      }

      let trimmedText = combinedText.trim();
      console.log(`[Preview] Total combined text length: ${trimmedText.length} chars`);

      // If text extraction failed but we have PDF files, try OCR/Vision extraction
      if (trimmedText.length < 100 && fallbackCandidates.length > 0) {
        console.log('[Preview] Text extraction insufficient, trying OCR for image-based PDFs...');
        isTextBasedPDF = false; // Definitely image-based if we need OCR
        
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
        console.log('[Preview] Starting AI analysis with text length:', trimmedText.length);
        const preview = await runPreviewAnalysis(trimmedText, isTextBasedPDF);
        console.log('[Preview] Analysis complete - violations:', preview.totalViolations, 'accounts:', preview.accountPreviews?.length || 0);
        
        // Check if AI actually ran and found results
        // If totalViolations is 0 AND no accountPreviews, AI likely failed
        // But if text was extracted successfully (>1000 chars), allow 0 violations (clean report)
        if (preview.totalViolations === 0 && !preview.accountPreviews?.length && trimmedText.length < 1000) {
          console.log('[Preview] Suspicious: 0 violations, no accounts, and low text length');
          return res.status(422).json({
            error: 'Could not extract violations from this report',
            message: 'We could not analyze your credit report. The file may be corrupted or not a valid credit report.',
            suggestion: 'Try uploading a different PDF or use AnnualCreditReport.com.',
          });
        }
        
        // If we got here, either:
        // 1. AI found violations (good)
        // 2. AI found 0 violations but report is clean (also good - allow it)
        const light = toLightAnalysisResult(preview);
        console.log('[Preview] Returning result - totalViolations:', light.totalViolations, 'accountPreviews:', light.accountPreviews?.length || 0);
        return res.status(200).json(light);
      } catch (e: unknown) {
        console.error('[Preview] runPreviewAnalysis error:', e);
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error('[Preview] Error message:', errMsg);
        if (errMsg.includes('API key') || errMsg.includes('unavailable') || errMsg.includes('ANTHROPIC_API') || errMsg.includes('OPENAI_API') || errMsg.includes('Configure')) {
          return res.status(503).json({
            error: 'Analysis service unavailable.',
            message: 'Add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env file, then restart the server.',
            suggestion: 'See .env.example for setup.',
          });
        }
        // Surface the real error so user sees it (e.g. "AI could not analyze the report...")
        const maxLen = process.env.NODE_ENV === 'development' ? 400 : 200;
        const userMessage = errMsg && errMsg.length <= maxLen ? errMsg : (errMsg ? errMsg.slice(0, maxLen) + '…' : 'Preview analysis failed. Please try again.');
        return res.status(500).json({
          error: userMessage || 'Preview analysis failed. Please try again.',
          details: process.env.NODE_ENV === 'development' ? (e instanceof Error ? e.stack : errMsg) : undefined,
        });
      }
    } catch (e) {
      console.error('[Preview] upload-and-analyze error:', e);
      return res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
}

// Register on main router (path: /credit-reports/upload-and-analyze when mounted at /api)
router.post('/credit-reports/upload-and-analyze', uploadAndAnalyzeMulter, handleUploadAndAnalyze);

/** Dedicated router for explicit mount at /api/credit-reports (avoids 404) */
export const uploadAnalyzeRouter = (() => {
  const r = Router();
  r.get('/upload-and-analyze', (_req, res) => {
    res.status(200).json({ ok: true, message: 'Use POST with FormData (transunion, equifax, or experian file field)' });
  });
  r.post('/upload-and-analyze', (req, res, next) => {
    console.log('[Preview] POST /api/credit-reports/upload-and-analyze received');
    uploadAndAnalyzeMulter(req, res, () => {
      handleUploadAndAnalyze(req, res).catch((err) => {
        console.error('[Preview] handleUploadAndAnalyze error:', err);
        res.status(500).json({ error: 'Upload failed. Please try again.' });
      });
    });
  });
  return r;
})();

export default router;
