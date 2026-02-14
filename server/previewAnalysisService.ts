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
  /** Single score if report shows one (legacy). */
  creditScore?: number;
  /** Per-bureau scores - each bureau has its OWN number (e.g. TU 587, EQ 573, EX 665). */
  creditScores?: { transunion?: number | null; equifax?: number | null; experian?: number | null };
  /** Consumer info extracted from report - for onboarding prefill */
  consumerInfo?: {
    fullName?: string;
    currentAddress?: string;
    currentCity?: string;
    currentState?: string;
    currentZip?: string;
    previousAddress?: string;
    previousCity?: string;
    previousState?: string;
    previousZip?: string;
    dateOfBirth?: string;
    ssnLast4?: string;
    phone?: string;
  };
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
  "creditScore": <number if only one score on report>,
  "creditScores": {
    "transunion": <number 300-850 or null - TransUnion score ONLY>,
    "equifax": <number 300-850 or null - Equifax score ONLY>,
    "experian": <number 300-850 or null - Experian score ONLY>
  },
  "consumerInfo": {
    "fullName": "<exact legal name from report>",
    "currentAddress": "<street address>",
    "currentCity": "<city>",
    "currentState": "<2-letter state>",
    "currentZip": "<5-digit ZIP>",
    "previousAddress": "<previous street if listed>",
    "previousCity": "<previous city if listed>",
    "previousState": "<previous state if listed>",
    "previousZip": "<previous ZIP if listed>",
    "dateOfBirth": "<YYYY-MM-DD format>",
    "ssnLast4": "<last 4 digits only, e.g. 1234>",
    "phone": "<phone if shown>"
  }
}

**CRITICAL: Extract consumerInfo from the report. Name, full address (street + city + state + zip), DOB, SSN last 4 are ALWAYS on credit reports. Use EXACT values - do not use placeholders. Include currentCity, currentState, currentZip as separate fields.**

**CRITICAL for creditScores:** Combined reports show THREE DIFFERENT scores (one per bureau). Extract each bureau's score from its section. They are often different (e.g. TransUnion 587, Equifax 573, Experian 665). Do NOT use the same number for all three unless the document literally shows one score for all. Use null for a bureau if you cannot find its score.

**COUNTING RULES - INDUSTRY STANDARD, NO DUPLICATES:**
1. Each UNIQUE negative ACCOUNT = 1 base item. Same account on 3 bureaus = 3 disputable items (one per bureau).
2. COLLECTION accounts: 1 per unique collector (TSI, Midland, LVNV, etc.)
3. CHARGE-OFF: 1 per unique account
4. LATE PAYMENTS: Count unique accounts that have late payment history (30/60/90/120), not each late mark separately
5. PUBLIC RECORDS: 1 per unique judgment/lien/bankruptcy
6. HARD INQUIRIES: Count unique inquiries
7. DEDUPLICATE: Same creditor + same last4 = ONE account. Do not double-count.

**WHAT COUNTS (disputable per FCRA):**
- Unique collection account = 1 (×3 if on all bureaus)
- Unique charge-off = 1 (×3 if on all bureaus)
- Account with late payment history = 1 (×3 if on all bureaus)
- totalViolations = sum of (unique accounts × bureaus they appear on)

**DO NOT:**
- Count word mentions - count ACTUAL accounts
- Count same account twice (dedupe by creditor name + last4)
- Inflate - be conservative and realistic

**EXAMPLE:**
- "CAPITAL ONE" collection on TU, EQ, EX = 3 violations (1 account × 3 bureaus)
- "MIDLAND" and "LVNV" collections = 2 unique accounts, if both on 3 bureaus = 6 violations
- Return ALL unique accounts in accountPreviews - we need them for the full analysis

Count REAL disputable items only!`;

/**
 * Extract consumer info from credit report text using regex patterns.
 * Credit reports have predictable formats - use as fallback when AI returns incomplete data.
 */
function extractConsumerInfoFromText(reportText: string): PreviewAnalysisResult['consumerInfo'] {
  const text = reportText.slice(0, 15000); // Focus on header/personal section
  const info: NonNullable<PreviewAnalysisResult['consumerInfo']> = {};

  // Full name: "Name:" or "Consumer Name:" or "CONSUMER NAME" (often at start)
  const nameMatch = text.match(/(?:Name|Consumer Name|CONSUMER NAME)[:\s]*([A-Za-z\s\-\.]+?)(?:\n|Date of Birth|DOB|Address|$)/i)
    || text.match(/^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:\n|$)/m);
  if (nameMatch?.[1]) {
    const name = nameMatch[1].trim();
    if (name.length >= 3 && name.length <= 80 && !/^\d+$/.test(name)) {
      info.fullName = name;
    }
  }

  // SSN last 4: XXX-XX-1234 or ****1234 or Last 4: 1234
  const ssnMatch = text.match(/(?:XXX-XX-|\*\*\*\*|Last\s*4[:\s]*)(\d{4})\b/)
    || text.match(/(?:SSN|Social Security)[:\s#]*[\d\-*]*(?:(\d{4})\b)/i)
    || text.match(/(\d{4})\s*(?:$|\n|Date of Birth)/);
  if (ssnMatch?.[1]) {
    info.ssnLast4 = ssnMatch[1];
  }

  // Date of Birth: MM/DD/YYYY or YYYY-MM-DD
  const dobMatch = text.match(/(?:Date of Birth|DOB|Birth Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    || text.match(/(?:Date of Birth|DOB)[:\s]*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i)
    || text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (dobMatch?.[1]) {
    let dob = dobMatch[1];
    if (dob.includes('/')) {
      const parts = dob.split('/');
      if (parts.length === 3 && parts[2].length === 2) {
        parts[2] = parseInt(parts[2], 10) > 50 ? `19${parts[2]}` : `20${parts[2]}`;
        dob = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
    info.dateOfBirth = dob;
  }

  // Full address line: "123 Main St, City, ST 12345" or "123 Main St\nCity, ST 12345"
  const fullAddrMatch = text.match(/(\d{1,5}\s+[^\n,]+(?:St|Street|Ave|Avenue|Blvd|Rd|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)[^,\n]*),\s*([A-Za-z\s\-]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i)
    || text.match(/(\d{1,5}\s+[\w\s\.#]+),\s*([A-Za-z\s\-]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
  if (fullAddrMatch) {
    info.currentAddress = fullAddrMatch[1].trim();
    info.currentCity = fullAddrMatch[2].trim();
    info.currentState = fullAddrMatch[3];
    info.currentZip = fullAddrMatch[4];
  } else {
    // Current address: "Current Address:" or "Address:" followed by street
    const addrMatch = text.match(/(?:Current\s*Address|Address|Mailing\s*Address)[:\s]*([^\n]+?)(?:\n|City|,)/i)
      || text.match(/(\d{1,5}\s+[\w\s\.]+(?:St|Street|Ave|Avenue|Blvd|Rd|Drive|Ln|Lane|Way)[^\n]*)/i);
    if (addrMatch?.[1]) {
      const addr = addrMatch[1].trim();
      if (addr.length >= 5 && addr.length <= 120) {
        info.currentAddress = addr;
      }
    }

    // City, State ZIP: "City, ST 12345" or on next line
    const cityStateMatch = text.match(/([A-Za-z\s\-']+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
    if (cityStateMatch) {
      const city = cityStateMatch[1].trim();
      if (city.length >= 2 && city.length <= 50 && !/^\d+$/.test(city)) {
        if (!info.currentCity) info.currentCity = city;
        if (!info.currentState) info.currentState = cityStateMatch[2];
        if (!info.currentZip) info.currentZip = cityStateMatch[3];
      }
    }
  }

  // Phone: (555) 123-4567 or 555-123-4567
  const phoneMatch = text.match(/(?:Phone|Telephone)[:\s]*\(?(\d{3})\)?[\s\-]?(\d{3})[\s\-]?(\d{4})/i)
    || text.match(/\(?(\d{3})\)?[\s\-]?(\d{3})[\s\-]?(\d{4})/);
  if (phoneMatch) {
    info.phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
  }

  // Previous address: "Previous Address:" or "Prior Address:" or second address block
  const prevAddrMatch = text.match(/(?:Previous|Prior|Former)\s*Address[:\s]*([^\n]+?)(?:\n|$)/i)
    || text.match(/(?:Previous|Prior)[:\s]*(\d{1,5}\s+[\w\s\.]+(?:St|Street|Ave|Avenue|Blvd|Rd)[^\n]*)/i);
  if (prevAddrMatch?.[1]) {
    const prev = prevAddrMatch[1].trim();
    if (prev.length >= 5 && prev.length <= 150) {
      info.previousAddress = prev;
    }
  }

  if (Object.keys(info).length === 0) return undefined;
  return info;
}

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
    // NO AI available - throw so user sees error instead of silent 0
    console.error('[Preview] ERROR: No AI API keys available. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
    throw new Error('Analysis service unavailable. Configure ANTHROPIC_API_KEY or OPENAI_API_KEY.');
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
        const parsed = safeJsonParse<PreviewAnalysisResult | null>(text, null);
        if (parsed && typeof parsed === 'object' && typeof (parsed as PreviewAnalysisResult).totalViolations === 'number') {
          aiResult = parsed as PreviewAnalysisResult;
          console.log('[Preview] AI result - totalViolations:', aiResult.totalViolations, 'accountPreviews:', aiResult.accountPreviews?.length || 0);
        } else {
          console.error('[Preview] Claude returned invalid JSON - missing totalViolations');
        }
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
        const parsed = safeJsonParse<PreviewAnalysisResult | null>(content, null);
        if (parsed && typeof parsed === 'object' && typeof (parsed as PreviewAnalysisResult).totalViolations === 'number') {
          aiResult = parsed as PreviewAnalysisResult;
          console.log('[Preview] AI result - totalViolations:', aiResult.totalViolations, 'accountPreviews:', aiResult.accountPreviews?.length || 0);
        } else {
          console.error('[Preview] OpenAI returned invalid JSON structure:', content.substring(0, 500));
        }
      } else {
        console.error('[Preview] OpenAI returned empty response');
      }
    }
    
    // Use AI results ONLY - no keyword counting
    // The AI analyzes actual accounts and counts real violations
    if (aiResult) {
      console.log(`[Preview] Using AI result: ${aiResult.totalViolations} violations`);
      return normalizePreviewResult(aiResult, truncatedReport);
    }
    
    // AI failed - throw so user sees error instead of silent 0
    console.error('[Preview] AI analysis failed - no valid result returned');
    throw new Error('AI could not analyze the report. Please try a different PDF or ensure the file contains readable credit report text.');
  } catch (error) {
    console.error('[Preview] Analysis error:', error);
    // Re-throw so router returns 500/503 instead of silent 0
    if (error instanceof Error) throw error;
    throw new Error('Preview analysis failed. Please try again.');
  }
}

function normalizePreviewResult(result: PreviewAnalysisResult, reportText?: string): PreviewAnalysisResult {
  const raw = result.accountPreviews ?? [];
  console.log('[Preview] Raw accountPreviews from AI:', raw.length, 'accounts');
  if (raw.length > 0) {
    console.log('[Preview] First 3 accounts:', JSON.stringify(raw.slice(0, 3), null, 2));
  }

  // Merge consumerInfo: use regex extraction as fallback when AI returns incomplete/empty
  let consumerInfo = result.consumerInfo;
  console.log('[Preview] AI consumerInfo:', consumerInfo);
  
  if (reportText) {
    const extracted = extractConsumerInfoFromText(reportText);
    console.log('[Preview] Regex extracted consumerInfo:', extracted);
    if (extracted) {
      consumerInfo = { ...extracted, ...(consumerInfo || {}) };
      console.log('[Preview] Merged consumerInfo:', consumerInfo);
    }
  }
  
  if (!consumerInfo || Object.keys(consumerInfo).length === 0) {
    console.warn('[Preview] WARNING: No consumer info extracted - onboarding prefill will be empty!');
  }
  
  // Require name for deduplication; include all accounts so totalViolations matches
  const accountPreviews: AccountPreviewItem[] = raw
    .filter((a): a is AccountPreviewItem => Boolean(a?.name || a?.last4 || a?.balance))
    .slice(0, 50) // Capture enough to match totalViolations (50 accounts × 3 bureaus = 150 max)
    .map((a) => ({
      name: String(a.name || 'Unknown Account').slice(0, 80),
      last4: String(a.last4 || '****').replace(/\D/g, '').slice(-4) || '****',
      balance: String(a.balance ?? '0').slice(0, 24),
      status: String(a.status ?? 'Negative').slice(0, 40),
      amountType: a.amountType ? String(a.amountType).slice(0, 24) : 'Balance',
    }));
  
  console.log('[Preview] Normalized accountPreviews:', accountPreviews.length);
  const clamp = (n: unknown): number | undefined => {
    if (n == null || typeof n !== 'number' || !Number.isFinite(n)) return undefined;
    return Math.max(300, Math.min(850, Math.round(n)));
  };
  const creditScore = clamp(result.creditScore);
  const rawScores = result.creditScores;
  const creditScores =
    rawScores && (rawScores.transunion != null || rawScores.equifax != null || rawScores.experian != null)
      ? {
          transunion: clamp(rawScores.transunion) ?? undefined,
          equifax: clamp(rawScores.equifax) ?? undefined,
          experian: clamp(rawScores.experian) ?? undefined,
        }
      : undefined;
  return {
    totalViolations: Math.max(0, result.totalViolations || 0),
    deletionPotential: Math.max(0, Math.min(100, result.deletionPotential || 50)),
    consumerInfo,
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
    creditScore: creditScore ?? (creditScores ? (creditScores.transunion ?? creditScores.equifax ?? creditScores.experian) : undefined),
    creditScores,
  };
}

