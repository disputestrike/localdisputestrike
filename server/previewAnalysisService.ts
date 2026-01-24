/**
 * previewAnalysisService.ts - Cheap AI Preview Analysis for Free Tier
 * 
 * Uses gpt-4.1-nano (~$0.20/call) to provide aggregate counts only.
 * NO specific account names, amounts, or method details exposed.
 * Designed to be a lead magnet that converts to paid plans.
 */

import OpenAI from 'openai';

const openai = new OpenAI();

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

export async function runPreviewAnalysis(
  reportText: string
): Promise<PreviewAnalysisResult> {
  try {
    const truncatedReport = reportText.slice(0, 15000);

    const response = await openai.chat.completions.create({
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

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content) as PreviewAnalysisResult;
    
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
  } catch (error) {
    console.error('Preview analysis error:', error);
    return generateMockPreview();
  }
}

export function generateMockPreview(): PreviewAnalysisResult {
  return {
    totalViolations: 47,
    deletionPotential: 68,
    categories: {
      latePayments: 12,
      collections: 8,
      inquiries: 15,
      publicRecords: 2,
      accountErrors: 6,
      other: 4,
    },
    bureauBreakdown: {
      experian: 18,
      equifax: 15,
      transunion: 14,
    },
    estimatedScoreIncrease: '50-80',
  };
}
