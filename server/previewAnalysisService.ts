/**
 * previewAnalysisService.ts - Cheap AI Preview Analysis for Free Tier
 * 
 * Uses gpt-4.1-nano (~$0.20/call) to provide aggregate counts only.
 * NO specific account names, amounts, or method details exposed.
 * Designed to be a lead magnet that converts to paid plans.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic: Anthropic | null = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai: OpenAI | null = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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
}

const PREVIEW_SYSTEM_PROMPT = `You are a credit report analyzer. Your job is to count violations and categorize them.

IMPORTANT: Return ONLY aggregate counts. Do NOT include:
- Specific account names
- Specific dollar amounts
- Specific dates
- Any identifying information

Return a JSON object with this exact structure:
{
  "totalViolations": <number>,
  "deletionPotential": <number 0-100>,
  "categories": {
    "latePayments": <number>,
    "collections": <number>,
    "inquiries": <number>,
    "publicRecords": <number>,
    "accountErrors": <number>,
    "other": <number>
  },
  "bureauBreakdown": {
    "experian": <number>,
    "equifax": <number>,
    "transunion": <number>
  },
  "estimatedScoreIncrease": "<range like 50-80>"
}

Count violations based on:
- Late payments (30, 60, 90+ days)
- Collections accounts
- Hard inquiries (especially recent ones)
- Public records (bankruptcies, liens, judgments)
- Account errors (wrong balances, wrong dates, duplicate accounts)
- Other FCRA violations

Deletion potential is based on how many items have clear FCRA violations or cross-bureau discrepancies.
Score increase estimate is based on typical improvements from removing negative items.`;

/**
 * Fallback when no AI API key: simple keyword-based violation count.
 * Returns aggregate counts only (no account details) for local/dev use.
 */
function keywordPreviewFallback(reportText: string): PreviewAnalysisResult {
  const t = reportText.toLowerCase();
  const latePayments = (t.match(/\b(late|delinquent|past due|30 day|60 day|90 day|120 day)\b/g) || []).length;
  const collections = (t.match(/\b(collection|collections|debt collector)\b/g) || []).length;
  const inquiries = (t.match(/\b(inquiry|inquiries|hard pull)\b/g) || []).length;
  const publicRecords = (t.match(/\b(bankruptcy|judgment|lien|foreclosure|repossession)\b/g) || []).length;
  const accountErrors = (t.match(/\b(charge.?off|charged off|chargeoff|duplicate|dispute|inaccurate)\b/g) || []).length;
  const other = (t.match(/\b(closed by|settled|written off|default)\b/g) || []).length;
  const totalViolations = Math.min(200, latePayments + collections + inquiries + publicRecords + accountErrors + other);
  const deletionPotential = totalViolations > 0 ? Math.min(100, 40 + Math.floor(totalViolations / 2)) : 30;
  return {
    totalViolations,
    deletionPotential,
    categories: {
      latePayments,
      collections,
      inquiries,
      publicRecords,
      accountErrors,
      other,
    },
    bureauBreakdown: {
      experian: Math.floor(totalViolations / 3),
      equifax: Math.floor(totalViolations / 3),
      transunion: totalViolations - 2 * Math.floor(totalViolations / 3),
    },
    estimatedScoreIncrease: totalViolations > 5 ? '40-80' : '20-50',
  };
}

export async function runPreviewAnalysis(
  reportText: string
): Promise<PreviewAnalysisResult> {
  if (!anthropic && !openai) {
    return normalizePreviewResult(keywordPreviewFallback(reportText));
  }
  try {
    const truncatedReport = reportText.slice(0, 15000);

    if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        temperature: 0.3,
        system: PREVIEW_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analyze this credit report and return ONLY aggregate violation counts:\n\n${truncatedReport}`,
          },
        ],
      });

      const content = response.content?.[0] as { text?: string } | undefined;
      let text = typeof content?.text === 'string' ? content.text : '';
      if (!text) {
        throw new Error('No response from Anthropic');
      }
      // Strip markdown code blocks (Claude sometimes returns ```json ... ```)
      if (text.includes('```')) {
        text = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      }
      const result = JSON.parse(text) as PreviewAnalysisResult;
      return normalizePreviewResult(result);
    }

    const response = await openai!.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: PREVIEW_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this credit report and return ONLY aggregate violation counts:\n\n${truncatedReport}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    let content = response.choices[0]?.message?.content ?? '';
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    if (content.includes('```')) {
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    }
    const result = JSON.parse(content) as PreviewAnalysisResult;
    return normalizePreviewResult(result);
  } catch (error) {
    console.error('Preview analysis error:', error);
    throw error;
  }
}

function normalizePreviewResult(result: PreviewAnalysisResult): PreviewAnalysisResult {
  return {
    totalViolations: Math.max(0, Math.min(200, result.totalViolations || 0)),
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
  };
}

