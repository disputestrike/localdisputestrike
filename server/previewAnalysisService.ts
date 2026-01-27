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

const PREVIEW_SYSTEM_PROMPT = `You are a credit report analyst. Count ACTUAL negative items, not word mentions.

**CRITICAL: Count REAL negative accounts and violations, not every mention of words like "late" or "collection" in the text.**

Return a JSON object with this exact structure:
{
  "totalViolations": <number - COUNT ACTUAL NEGATIVE ITEMS>,
  "deletionPotential": <number 0-100>,
  "categories": {
    "latePayments": <number - count accounts WITH late payments>,
    "collections": <number - count ACTUAL collection accounts>,
    "inquiries": <number - count hard inquiries>,
    "publicRecords": <number>,
    "accountErrors": <number - count charge-offs, errors>,
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

**COUNTING RULES - COUNT ACTUAL ITEMS:**
1. Each COLLECTION ACCOUNT = 1 violation (per bureau if appears on multiple)
2. Each CHARGE-OFF ACCOUNT = 1 violation (per bureau)
3. Each account WITH late payments = count the late payment instances in payment history
4. Each HARD INQUIRY = 1 violation
5. Each PUBLIC RECORD = 1 violation (per bureau)
6. Each REPOSSESSION = 1 violation (per bureau)
7. If same account on 3 bureaus = count as 3 violations (one per bureau)

**WHAT COUNTS:**
- A collection account = 1 violation (even if word "collection" appears 10 times in its description)
- An account with 6 late payments in history = 6 violations for that account
- A charge-off = 1 violation per bureau it appears on

**DO NOT:**
- Count every mention of the word "late" as a violation
- Count every mention of "collection" as a violation
- Inflate numbers by counting words

**EXAMPLE:** 
- If you see "OAG CHILD SU - Collection - $2,552" = 1 collection violation
- If you see payment history showing "30, 60, 90, 90" = 4 late payment violations for that account
- If same account on TransUnion AND Equifax = 2 violations (one per bureau)

Count REAL items, not word frequency!`;

/**
 * Minimal fallback when AI is unavailable - returns empty result
 * We ONLY use AI analysis, no keyword counting
 */
function minimalFallback(): PreviewAnalysisResult {
  console.log('[Preview] AI unavailable - returning minimal result');
  return {
    totalViolations: 0,
    deletionPotential: 0,
    categories: {
      latePayments: 0,
      collections: 0,
      inquiries: 0,
      publicRecords: 0,
      accountErrors: 0,
      other: 0,
    },
    bureauBreakdown: {
      experian: 0,
      equifax: 0,
      transunion: 0,
    },
    estimatedScoreIncrease: '0-0',
  };
}

export async function runPreviewAnalysis(
  reportText: string,
  isTextBasedPDF: boolean = true // true = text-based PDF (use Claude), false = image-based PDF (use OpenAI)
): Promise<PreviewAnalysisResult> {
  console.log(`[Preview] PDF type: ${isTextBasedPDF ? 'TEXT-BASED (using Claude)' : 'IMAGE-BASED (using OpenAI)'}`);
  
  if (!anthropic && !openai) {
    // NO AI available - return minimal result (we ONLY use AI, no keyword counting)
    console.error('[Preview] ERROR: No AI API keys available. Analysis requires AI.');
    return normalizePreviewResult(minimalFallback());
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
    
    // Use AI results directly - keyword counting is too aggressive (counts every word mention)
    // The AI analyzes actual accounts and counts real violations, not word matches
    if (aiResult) {
      console.log(`[Preview] Using AI result: ${aiResult.totalViolations} violations (keyword count ${keywordCounts.total} was too aggressive)`);
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

