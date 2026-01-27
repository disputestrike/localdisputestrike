/**
 * previewAnalysisService.ts - Cheap AI Preview Analysis for Free Tier
 * 
 * Uses gpt-4.1-nano (~$0.20/call) to provide aggregate counts only.
 * NO specific account names, amounts, or method details exposed.
 * Designed to be a lead magnet that converts to paid plans.
 */

import Anthropic from '@anthropic-ai/sdk';
import { safeJsonParse } from './utils/json';
import OpenAI from 'openai';

const anthropic: Anthropic | null = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai: OpenAI | null = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface AccountPreviewItem {
  name: string;
  last4: string;
  balance: string;
  status: string;
  /** e.g. "Unpaid Balance" or "Past Due" */
  amountType?: string;
}

export interface PreviewAnalysisResult {
  totalViolations: number;
  deletionPotential: number;
  categories: {
    latePayments: number;
    collections: number;
    inquiries: number;
    publicRecords: number;
    accountErrors: number;
    other: number;
  };
  bureauBreakdown: {
    experian: number;
    equifax: number;
    transunion: number;
  };
  estimatedScoreIncrease: string;
  /** Up to 10 partial previews: name, last4, balance, status only. */
  accountPreviews?: AccountPreviewItem[];
}

const PREVIEW_SYSTEM_PROMPT = `You are an AGGRESSIVE credit report violation detector. Your job is to find EVERY SINGLE negative item.

**CRITICAL: Count EVERY negative item across ALL bureaus. If an account appears on 3 bureaus, count it 3 times.**

Return a JSON object with this exact structure:
{
  "totalViolations": <number - COUNT EVERY NEGATIVE ITEM>,
  "deletionPotential": <number 0-100>,
  "categories": {
    "latePayments": <number - count EVERY late payment marker>,
    "collections": <number - count EVERY collection>,
    "inquiries": <number - count EVERY hard inquiry>,
    "publicRecords": <number>,
    "accountErrors": <number - count charge-offs here>,
    "other": <number>
  },
  "bureauBreakdown": {
    "experian": <number>,
    "equifax": <number>,
    "transunion": <number>
  },
  "estimatedScoreIncrease": "<range like 50-150>",
  "accountPreviews": [
    { "name": "<EXACT creditor name>", "last4": "<last 4 digits>", "balance": "<balance>", "status": "<status>", "amountType": "Unpaid Balance" }
  ],
  "creditScore": <number if found>
}

**COUNTING RULES - BE AGGRESSIVE:**
1. totalViolations = SUM of ALL negative items across ALL bureaus
2. If same account is negative on 3 bureaus = 3 violations
3. If account has 12 late payment markers = 12 violations
4. Count EVERY "30 day late", "60 day late", "90 day late" as separate violations
5. Count EVERY collection account
6. Count EVERY charge-off
7. Count EVERY hard inquiry
8. accountPreviews: Extract up to 20 REAL accounts with EXACT names

**WHAT COUNTS AS A VIOLATION:**
- Each late payment marker (30/60/90/120 days) = 1 violation
- Each collection account = 1 violation per bureau
- Each charge-off = 1 violation per bureau  
- Each hard inquiry = 1 violation
- Each public record = 1 violation per bureau
- Each repossession = 1 violation per bureau
- Payment history showing "1" "2" "3" etc = count each as late payment

**EXAMPLE:** If you see an account with payment history "111111222233" that's 6 30-day lates, 4 60-day lates, 2 90-day lates = 12 violations just from that one account.

BE AGGRESSIVE - FIND EVERYTHING!`;

/**
 * AGGRESSIVE keyword-based violation counting using ALL 90 dispute methods.
 * Counts EVERY instance of EVERY violation keyword.
 */
function countViolationsAggressively(reportText: string): {
  total: number;
  latePayments: number;
  collections: number;
  inquiries: number;
  publicRecords: number;
  accountErrors: number;
  other: number;
} {
  const t = reportText.toLowerCase();
  
  // LATE PAYMENTS - count EVERY instance
  const latePatterns = [
    /\b30\s*(?:day|days)\s*(?:late|past\s*due|delinquent)\b/gi,
    /\b60\s*(?:day|days)\s*(?:late|past\s*due|delinquent)\b/gi,
    /\b90\s*(?:day|days)\s*(?:late|past\s*due|delinquent)\b/gi,
    /\b120\s*(?:day|days)\s*(?:late|past\s*due|delinquent)\b/gi,
    /\b150\s*(?:day|days)\s*(?:late|past\s*due|delinquent)\b/gi,
    /\b180\s*(?:day|days)\s*(?:late|past\s*due|delinquent)\b/gi,
    /\bpast\s*due\b/gi,
    /\bdelinquent\b/gi,
    /\blate\s*payment/gi,
    /\bpayment\s*history[:\s]*[^\n]*[123456789]/gi, // Payment history with late markers
  ];
  let latePayments = 0;
  for (const pattern of latePatterns) {
    latePayments += (t.match(pattern) || []).length;
  }
  
  // COLLECTIONS - count EVERY collection account
  const collectionPatterns = [
    /\bcollection\b/gi,
    /\bcollections\b/gi,
    /\bdebt\s*collector/gi,
    /\bplaced\s*for\s*collection/gi,
    /\bsold\s*to\s*collection/gi,
    /\bcollection\s*agency/gi,
    /\bmedical\s*collection/gi,
    /\bpro\s*collect/gi,
    /\bmidland/gi,
    /\bportfolio\s*recovery/gi,
    /\bcavalry/gi,
    /\benhanced\s*recovery/gi,
  ];
  let collections = 0;
  for (const pattern of collectionPatterns) {
    collections += (t.match(pattern) || []).length;
  }
  
  // INQUIRIES - count EVERY hard inquiry
  const inquiryPatterns = [
    /\bhard\s*inquiry/gi,
    /\binquiry\b/gi,
    /\binquiries\b/gi,
    /\bcredit\s*check/gi,
    /\bpulled\s*credit/gi,
  ];
  let inquiries = 0;
  for (const pattern of inquiryPatterns) {
    inquiries += (t.match(pattern) || []).length;
  }
  
  // PUBLIC RECORDS
  const publicRecordPatterns = [
    /\bbankruptcy\b/gi,
    /\bjudgment\b/gi,
    /\btax\s*lien/gi,
    /\bforeclosure\b/gi,
    /\brepossession\b/gi,
    /\brepo\b/gi,
    /\bcivil\s*judgment/gi,
    /\bchapter\s*7\b/gi,
    /\bchapter\s*13\b/gi,
  ];
  let publicRecords = 0;
  for (const pattern of publicRecordPatterns) {
    publicRecords += (t.match(pattern) || []).length;
  }
  
  // ACCOUNT ERRORS (charge-offs, disputes, inaccuracies)
  const errorPatterns = [
    /\bcharge[\s-]*off\b/gi,
    /\bcharged[\s-]*off\b/gi,
    /\bchargeoff\b/gi,
    /\bwritten[\s-]*off\b/gi,
    /\bbad\s*debt\b/gi,
    /\bprofit\s*and\s*loss/gi,
    /\bdisputed\b/gi,
    /\binaccurate\b/gi,
    /\bduplicate\b/gi,
    /\bnot\s*mine\b/gi,
    /\bfraud\b/gi,
    /\bidentity\s*theft/gi,
  ];
  let accountErrors = 0;
  for (const pattern of errorPatterns) {
    accountErrors += (t.match(pattern) || []).length;
  }
  
  // OTHER violations
  const otherPatterns = [
    /\bclosed\s*by\s*creditor/gi,
    /\bsettled\b/gi,
    /\bdefault\b/gi,
    /\bdefaulted\b/gi,
    /\bnegative\b/gi,
    /\badverse\b/gi,
    /\bderogatory\b/gi,
    /\bunpaid\b/gi,
    /\bpast\s*due\s*amount/gi,
    /\bbalance\s*owed/gi,
  ];
  let other = 0;
  for (const pattern of otherPatterns) {
    other += (t.match(pattern) || []).length;
  }
  
  const total = latePayments + collections + inquiries + publicRecords + accountErrors + other;
  
  console.log(`[Preview] Keyword count: late=${latePayments}, collections=${collections}, inquiries=${inquiries}, publicRecords=${publicRecords}, errors=${accountErrors}, other=${other}, TOTAL=${total}`);
  
  return { total, latePayments, collections, inquiries, publicRecords, accountErrors, other };
}

/**
 * Fallback when no AI API key: aggressive keyword-based violation count.
 */
function keywordPreviewFallback(reportText: string): PreviewAnalysisResult {
  const counts = countViolationsAggressively(reportText);
  const totalViolations = counts.total;
  const deletionPotential = totalViolations > 0 ? Math.min(100, 40 + Math.floor(totalViolations / 2)) : 30;
  return {
    totalViolations,
    deletionPotential,
    categories: {
      latePayments: counts.latePayments,
      collections: counts.collections,
      inquiries: counts.inquiries,
      publicRecords: counts.publicRecords,
      accountErrors: counts.accountErrors,
      other: counts.other,
    },
    bureauBreakdown: {
      experian: Math.floor(totalViolations / 3),
      equifax: Math.floor(totalViolations / 3),
      transunion: totalViolations - 2 * Math.floor(totalViolations / 3),
    },
    estimatedScoreIncrease: totalViolations > 20 ? '80-150' : totalViolations > 10 ? '50-100' : '30-60',
  };
}

export async function runPreviewAnalysis(
  reportText: string,
  isTextBasedPDF: boolean = true // true = text-based PDF (use Claude), false = image-based PDF (use OpenAI)
): Promise<PreviewAnalysisResult> {
  // ALWAYS run keyword counting first as a baseline
  const keywordCounts = countViolationsAggressively(reportText);
  console.log(`[Preview] Keyword baseline: ${keywordCounts.total} violations found`);
  console.log(`[Preview] PDF type: ${isTextBasedPDF ? 'TEXT-BASED (using Claude)' : 'IMAGE-BASED (using OpenAI)'}`);
  
  if (!anthropic && !openai) {
    return normalizePreviewResult(keywordPreviewFallback(reportText));
  }
  
  const startTime = Date.now();
  
  try {
    // INCREASED: Allow more text for better analysis (was 15000)
    const truncatedReport = reportText.slice(0, 30000);
    let aiResult: PreviewAnalysisResult | null = null;

    // ROUTING: Text-based PDFs → Claude, Image-based PDFs → OpenAI
    const useClaude = isTextBasedPDF && anthropic;
    const useOpenAI = !isTextBasedPDF && openai;
    
    // Fallback: if preferred AI not available, use the other
    if (useClaude && !anthropic) {
      console.log('[Preview] Claude not available, falling back to OpenAI for text-based PDF');
    }
    if (useOpenAI && !openai) {
      console.log('[Preview] OpenAI not available, falling back to Claude for image-based PDF');
    }

    // Try preferred AI first, then fallback
    if (useClaude || (!useOpenAI && anthropic)) {
      console.log('[Preview] Using Anthropic Claude for analysis (TEXT-BASED PDF)...');
      console.log('[Preview] Report text length:', truncatedReport.length);
      
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000, // INCREASED from 2000
        temperature: 0.1, // LOWERED for more consistent results
        system: PREVIEW_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Extract ALL negative accounts from this credit report. Return the REAL account names, balances, and statuses you find:\n\n${truncatedReport}`,
          },
        ],
      });

      const content = response.content?.[0] as { text?: string } | undefined;
      let text = typeof content?.text === 'string' ? content.text : '';
      const aiTime = Date.now() - startTime;
      console.log(`[Preview] Anthropic response: ${text.length} chars in ${aiTime}ms`);
      
      if (text) {
        // Strip markdown code blocks (Claude sometimes returns ```json ... ```)
        if (text.includes('```')) {
          text = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        }
        aiResult = safeJsonParse(text, {} as PreviewAnalysisResult);
        console.log('[Preview] AI result - totalViolations:', aiResult.totalViolations, 'accountPreviews:', aiResult.accountPreviews?.length || 0);
      }
    } else if (useOpenAI || (!useClaude && openai)) {
      console.log('[Preview] Using OpenAI for analysis (IMAGE-BASED PDF)...');
      console.log('[Preview] Report text length:', truncatedReport.length);
      
      const response = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: PREVIEW_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Extract ALL negative accounts from this credit report. Return the REAL account names, balances, and statuses you find:\n\n${truncatedReport}`,
          },
        ],
        temperature: 0.1, // LOWERED for consistency
        max_tokens: 4000, // INCREASED from 2000
        response_format: { type: 'json_object' },
      });
      
      const aiTime = Date.now() - startTime;
      console.log(`[Preview] OpenAI response received in ${aiTime}ms`);

      let content = response.choices[0]?.message?.content ?? '';
      if (content) {
        if (content.includes('```')) {
          content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        }
        aiResult = safeJsonParse(content, {} as PreviewAnalysisResult);
        console.log('[Preview] AI result - totalViolations:', aiResult.totalViolations, 'accountPreviews:', aiResult.accountPreviews?.length || 0);
      }
    }
    
    // BOOST: Use the HIGHER of AI count or keyword count
    // This ensures we never undercount violations
    if (aiResult) {
      const aiTotal = aiResult.totalViolations || 0;
      const keywordTotal = keywordCounts.total;
      
      // Use keyword counts if they're higher than AI
      if (keywordTotal > aiTotal) {
        console.log(`[Preview] BOOSTING: AI found ${aiTotal}, keywords found ${keywordTotal} - using keyword count`);
        aiResult.totalViolations = keywordTotal;
        aiResult.categories = {
          latePayments: Math.max(aiResult.categories?.latePayments || 0, keywordCounts.latePayments),
          collections: Math.max(aiResult.categories?.collections || 0, keywordCounts.collections),
          inquiries: Math.max(aiResult.categories?.inquiries || 0, keywordCounts.inquiries),
          publicRecords: Math.max(aiResult.categories?.publicRecords || 0, keywordCounts.publicRecords),
          accountErrors: Math.max(aiResult.categories?.accountErrors || 0, keywordCounts.accountErrors),
          other: Math.max(aiResult.categories?.other || 0, keywordCounts.other),
        };
      }
      
      return normalizePreviewResult(aiResult);
    }
    
    // Fallback to keyword-only if AI failed
    return normalizePreviewResult(keywordPreviewFallback(reportText));
  } catch (error) {
    console.error('Preview analysis error:', error);
    // On error, still return keyword-based results
    return normalizePreviewResult(keywordPreviewFallback(reportText));
  }
}

function normalizePreviewResult(result: PreviewAnalysisResult): PreviewAnalysisResult {
  const raw = result.accountPreviews ?? [];
  console.log('[Preview] Raw accountPreviews from AI:', raw.length, 'accounts');
  if (raw.length > 0) {
    console.log('[Preview] First 3 accounts:', JSON.stringify(raw.slice(0, 3), null, 2));
  }
  
  // More lenient filter - only require name OR last4 OR balance
  // INCREASED limit from 10 to 20 for better preview
  const accountPreviews: AccountPreviewItem[] = raw
    .filter((a): a is AccountPreviewItem => Boolean(a?.name || a?.last4 || a?.balance))
    .slice(0, 20) // INCREASED from 10
    .map((a) => ({
      name: String(a.name || 'Unknown Account').slice(0, 80),
      last4: String(a.last4 || '****').replace(/\D/g, '').slice(-4) || '****',
      balance: String(a.balance ?? '0').slice(0, 24),
      status: String(a.status ?? 'Negative').slice(0, 40),
      amountType: a.amountType ? String(a.amountType).slice(0, 24) : 'Balance',
    }));
  
  console.log('[Preview] Normalized accountPreviews:', accountPreviews.length);
  const creditScore = result.creditScore != null && Number.isFinite(result.creditScore)
    ? Math.max(300, Math.min(850, Math.round(result.creditScore)))
    : undefined;
  return {
    totalViolations: Math.max(0, result.totalViolations || 0), // NO CAP - show real count
    deletionPotential: Math.max(0, Math.min(100, result.deletionPotential || 50)),
    categories: {
      latePayments: Math.max(0, result.categories?.latePayments || 0),
      collections: Math.max(0, result.categories?.collections || 0),
      inquiries: Math.max(0, result.categories?.inquiries || 0),
      publicRecords: Math.max(0, result.categories?.publicRecords || 0),
      accountErrors: Math.max(0, result.categories?.accountErrors || 0),
      other: Math.max(0, result.categories?.other || 0),
    },
    bureauBreakdown: {
      experian: Math.max(0, result.bureauBreakdown?.experian || 0),
      equifax: Math.max(0, result.bureauBreakdown?.equifax || 0),
      transunion: Math.max(0, result.bureauBreakdown?.transunion || 0),
    },
    estimatedScoreIncrease: result.estimatedScoreIncrease || '30-60',
    accountPreviews: accountPreviews.length ? accountPreviews : undefined,
    creditScore,
  };
}

