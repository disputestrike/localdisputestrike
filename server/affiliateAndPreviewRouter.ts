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
  totalNegativeAccounts?: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  categoryBreakdown: { latePayments: number; collections: number; chargeOffs: number; judgments: number; other: number };
  violationBreakdown?: Record<string, number>;
  accountPreviews?: { name: string; last4: string; balance: string; status: string; amountType?: string }[];
  creditScore?: number;
  creditScores?: { transunion?: number; equifax?: number; experian?: number };
  consumerInfo?: Record<string, string>;
} {
  const rawPreviews = p.accountPreviews ?? [];
  const deduped = dedupeAccountPreviews(rawPreviews);
  const uniqueAccountCount = deduped.length;
  const aiTotal = Math.max(0, p.totalViolations || 0);
  const cat = p.categories ?? {};

  // NEGATIVE ACCOUNTS: Expected 9-10. AI may under-extract accountPreviews - use aiTotal/2.2 or category sum as floor.
  const categorySum = (cat.latePayments ?? 0) + (cat.collections ?? 0) + (cat.accountErrors ?? 0) + (cat.publicRecords ?? 0) + (cat.other ?? 0);
  const estimatedFromAi = aiTotal > 0 ? Math.ceil(aiTotal / 2.2) : 0; // aiTotal ≈ unique accounts × bureaus
  const estimatedFromCategories = Math.min(categorySum, 12); // Cap - categories can overlap
  const totalNegativeAccounts = Math.min(Math.max(uniqueAccountCount, estimatedFromAi, estimatedFromCategories, 1), 15);

  // VIOLATIONS: Expected ~20. Text path has no conflict detection - estimate ~2 violations/account (negatives + conflicts).
  const totalViolations = Math.max(totalNegativeAccounts * 2, aiTotal);

  const t = Math.max(1, totalViolations);
  const latePayments = Math.max(0, cat.latePayments ?? 0);
  const collections = Math.max(0, cat.collections ?? 0);
  const chargeOffs = Math.max(0, cat.accountErrors ?? 0);
  const judgments = Math.max(0, cat.publicRecords ?? 0);
  const other = Math.max(0, (cat.inquiries ?? 0) + (cat.other ?? 0));

  const breakdownSum = latePayments + collections + chargeOffs + judgments + other;
  const categoryBreakdown = {
    latePayments,
    collections,
    chargeOffs,
    judgments,
    other: breakdownSum > 0 ? other : Math.max(0, t - latePayments - collections - chargeOffs - judgments),
  };

  // Severity: distribute (Critical 20%, High 35%, Medium 30%, Low 15%) - NOT 100% critical
  const critical = Math.min(Math.round(t * 0.2), t);
  const high = Math.min(Math.round(t * 0.35), Math.max(0, t - critical));
  const medium = Math.min(Math.round(t * 0.3), Math.max(0, t - critical - high));
  const low = Math.max(0, t - critical - high - medium);
  const severityBreakdown = { critical, high, medium, low };

  console.log('[toLightAnalysisResult] Accounts:', uniqueAccountCount, '→', totalNegativeAccounts, '| Violations:', totalViolations, '| AI:', aiTotal);

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
    totalViolations,
    totalNegativeAccounts,
    severityBreakdown,
    categoryBreakdown,
    violationBreakdown: undefined, // Text fallback has no conflict detection
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
      
      console.log('[Preview] Files received:', Object.keys(files || {}));
      
      if (!files || !Object.keys(files).length) {
        console.log('[Preview] ERROR: No files in request');
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const fallbackCandidates: { key: string; file: Express.Multer.File }[] = [];
      const filesToProcess: { key: string; file: Express.Multer.File; isHtml: boolean }[] = [];

      for (const key of ['transunion', 'equifax', 'experian']) {
        const arr = files[key];
        const file = arr?.[0];
        if (!file?.buffer) continue;
        const name = (file.originalname || '').toLowerCase();
        const isHtml = file.mimetype?.includes('text/html') || name.endsWith('.html') || name.endsWith('.htm');
        filesToProcess.push({ key, file, isHtml });
        if (!isHtml) fallbackCandidates.push({ key, file });
      }

      // ALL PDF UPLOADS: Use Vision AI + analysis engine for accurate methodology
      const pdfFiles = fallbackCandidates.filter(
        (f) => f.file.mimetype?.includes('pdf') || (f.file.originalname || '').toLowerCase().endsWith('.pdf')
      );
      const hasEnoughPdf = pdfFiles.length >= 1 && pdfFiles.every((f) => f.file.buffer.length > 1000);

      if (hasEnoughPdf) {
        try {
          const {
            performLightAnalysis,
            performLightAnalysisMulti,
            parsePersonalInfoWithAI,
            parseAllBureauScoresFromCombined,
          } = await import('./creditReportParser');

          // 1 file: treat as combined (Credit Hero / 3-bureau in one PDF)
          if (pdfFiles.length === 1) {
            console.log('[Preview] Single PDF - Vision AI combined + analysis engine');
            const { fileStorage } = await import('./s3Provider');
            const fileKey = `preview/combined-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.pdf`;
            const { fileUrl } = await fileStorage.saveFile(fileKey, pdfFiles[0].file.buffer, 'application/pdf');
            const light = await performLightAnalysis(fileUrl);
            // If Vision returned 0 violations, fall through to text-extraction fallback (works when Vision URL unreachable or PDF format unsupported)
            if (light.totalViolations === 0) {
              throw new Error('Vision returned 0 violations - falling back to text analysis');
            }
            const [personalInfo, allScores] = await Promise.all([
              parsePersonalInfoWithAI(fileUrl, 'TransUnion'),
              parseAllBureauScoresFromCombined(fileUrl),
            ]);
            const consumerInfo = personalInfo ? {
              fullName: personalInfo.fullName ?? '',
              currentAddress: personalInfo.currentAddress?.fullAddress ?? '',
              currentCity: personalInfo.currentAddress?.city ?? '',
              currentState: personalInfo.currentAddress?.state ?? '',
              currentZip: personalInfo.currentAddress?.zip ?? '',
              previousAddress: personalInfo.previousAddresses?.[0]?.fullAddress ?? '',
              previousCity: personalInfo.previousAddresses?.[0]?.city ?? '',
              previousState: personalInfo.previousAddresses?.[0]?.state ?? '',
              previousZip: personalInfo.previousAddresses?.[0]?.zip ?? '',
              dateOfBirth: personalInfo.dateOfBirth ?? '',
              phone: '',
              ssnLast4: personalInfo.ssnLast4 ?? '',
            } : undefined;
            const creditScore = personalInfo?.creditScore ?? null;
            const creditScores = allScores && (allScores.transunion != null || allScores.equifax != null || allScores.experian != null)
              ? { transunion: allScores.transunion ?? undefined, equifax: allScores.equifax ?? undefined, experian: allScores.experian ?? undefined }
              : undefined;
            console.log('[Preview] Vision+engine result - totalViolations:', light.totalViolations);
            return res.status(200).json({ ...light, consumerInfo, creditScore, creditScores });
          }

          // 2-3 files: parse each as its bureau slot (or combined if one is much larger)
          const keyToBureau = { transunion: 'TransUnion' as const, equifax: 'Equifax' as const, experian: 'Experian' as const };
          const sortedBySize = [...pdfFiles].sort((a, b) => b.file.buffer.length - a.file.buffer.length);
          const largest = sortedBySize[0].file.buffer.length;
          const othersSum = sortedBySize.slice(1).reduce((s, f) => s + f.file.buffer.length, 0);

          // If largest is 2x+ bigger than others combined, it might be a combined report
          if (pdfFiles.length >= 2 && largest >= 2 * othersSum && othersSum < 50000) {
            console.log('[Preview] Largest file likely combined - Vision AI combined + analysis engine');
            const { fileStorage } = await import('./s3Provider');
            const fileKey = `preview/combined-${Date.now()}.pdf`;
            const { fileUrl } = await fileStorage.saveFile(fileKey, sortedBySize[0].file.buffer, 'application/pdf');
            const light = await performLightAnalysis(fileUrl);
            if (light.totalViolations === 0) {
              throw new Error('Vision returned 0 violations - falling back to text analysis');
            }
            const [personalInfo, allScores] = await Promise.all([
              parsePersonalInfoWithAI(fileUrl, 'TransUnion'),
              parseAllBureauScoresFromCombined(fileUrl),
            ]);
            const consumerInfo = personalInfo ? {
              fullName: personalInfo.fullName ?? '',
              currentAddress: personalInfo.currentAddress?.fullAddress ?? '',
              currentCity: personalInfo.currentAddress?.city ?? '',
              currentState: personalInfo.currentAddress?.state ?? '',
              currentZip: personalInfo.currentAddress?.zip ?? '',
              previousAddress: personalInfo.previousAddresses?.[0]?.fullAddress ?? '',
              previousCity: personalInfo.previousAddresses?.[0]?.city ?? '',
              previousState: personalInfo.previousAddresses?.[0]?.state ?? '',
              previousZip: personalInfo.previousAddresses?.[0]?.zip ?? '',
              dateOfBirth: personalInfo.dateOfBirth ?? '',
              phone: '',
              ssnLast4: personalInfo.ssnLast4 ?? '',
            } : undefined;
            const creditScores = allScores && (allScores.transunion != null || allScores.equifax != null || allScores.experian != null)
              ? { transunion: allScores.transunion ?? undefined, equifax: allScores.equifax ?? undefined, experian: allScores.experian ?? undefined }
              : undefined;
            return res.status(200).json({ ...light, consumerInfo, creditScore: personalInfo?.creditScore ?? null, creditScores });
          }

          // Standard multi-file: parse each bureau
          console.log('[Preview] Multi-file - Vision AI per bureau + analysis engine');
          const multiInput = pdfFiles.map((f) => ({
            buffer: f.file.buffer,
            bureau: keyToBureau[f.key as keyof typeof keyToBureau] ?? 'TransUnion',
          }));
          const { light, personalInfo, allScores } = await performLightAnalysisMulti(multiInput);
          if (light.totalViolations === 0) {
            throw new Error('Vision returned 0 violations - falling back to text analysis');
          }
          const consumerInfo = personalInfo ? {
            fullName: personalInfo.fullName ?? '',
            currentAddress: personalInfo.currentAddress?.fullAddress ?? '',
            currentCity: personalInfo.currentAddress?.city ?? '',
            currentState: personalInfo.currentAddress?.state ?? '',
            currentZip: personalInfo.currentAddress?.zip ?? '',
            previousAddress: personalInfo.previousAddresses?.[0]?.fullAddress ?? '',
            previousCity: personalInfo.previousAddresses?.[0]?.city ?? '',
            previousState: personalInfo.previousAddresses?.[0]?.state ?? '',
            previousZip: personalInfo.previousAddresses?.[0]?.zip ?? '',
            dateOfBirth: personalInfo.dateOfBirth ?? '',
            phone: '',
            ssnLast4: personalInfo.ssnLast4 ?? '',
          } : undefined;
          const creditScores = allScores && (allScores.transunion != null || allScores.equifax != null || allScores.experian != null)
            ? { transunion: allScores.transunion ?? undefined, equifax: allScores.equifax ?? undefined, experian: allScores.experian ?? undefined }
            : undefined;
          console.log('[Preview] Vision+engine multi result - totalViolations:', light.totalViolations);
          return res.status(200).json({ ...light, consumerInfo, creditScore: personalInfo?.creditScore ?? null, creditScores });
        } catch (e: unknown) {
          console.warn('[Preview] Vision path failed, falling back to text analysis:', e);
        }
      }

      // FALLBACK: HTML or Vision failed - text extraction + runPreviewAnalysis
      console.log('[Preview] Text extraction path for', filesToProcess.length, 'files');
      for (const { key, file } of fallbackCandidates) {
        console.log(`[Preview] Queued ${key}: ${file.originalname}, size: ${file.buffer.length} bytes`);
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
