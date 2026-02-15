/**
 * Cost tracking for Claude API usage
 * Tracks input/output tokens and estimated costs by model
 */

// Approximate pricing per 1M tokens (as of 2025)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
};

export interface UsageRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  timestamp: Date;
  operation: string;
}

const sessionRecords: UsageRecord[] = [];
const MAX_RECORDS = 500;

export function recordUsage(
  model: string,
  inputTokens: number,
  outputTokens: number,
  operation: string
): number {
  const pricing = PRICING[model] ?? PRICING['claude-3-haiku-20240307'];
  const estimatedCostUsd =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output;

  sessionRecords.push({
    model,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
    timestamp: new Date(),
    operation,
  });

  if (sessionRecords.length > MAX_RECORDS) {
    sessionRecords.shift();
  }

  return estimatedCostUsd;
}

export function getSessionTotal(): { totalCostUsd: number; totalCalls: number } {
  const totalCostUsd = sessionRecords.reduce((sum, r) => sum + r.estimatedCostUsd, 0);
  return { totalCostUsd, totalCalls: sessionRecords.length };
}

export function getRecordsByOperation(): Record<string, { cost: number; calls: number }> {
  const byOp: Record<string, { cost: number; calls: number }> = {};
  for (const r of sessionRecords) {
    if (!byOp[r.operation]) byOp[r.operation] = { cost: 0, calls: 0 };
    byOp[r.operation].cost += r.estimatedCostUsd;
    byOp[r.operation].calls += 1;
  }
  return byOp;
}
