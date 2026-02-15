/**
 * Dispute Prioritizer
 * Scores and ranks accounts for dispute rounds
 */

import type { Conflict } from './conflictDetector';
import type { MatchedGroup } from './bureauMatcher';

export interface ScoredAccount {
  account_group: MatchedGroup;
  conflicts: Conflict[];
  total_score: number;
  success_probability: number;
  creditor: string;
  balance: number;
  status: string;
  bureaus: string[];
}

function getPrimaryAccount(group: MatchedGroup): Record<string, unknown> | null {
  return group.EX || group.EQ || group.TU || null;
}

function estimateSuccess(conflicts: Conflict[]): number {
  if (!conflicts.length) return 0.5;
  if (conflicts.some((c) => c.type === 'IMPOSSIBLE_TIMELINE')) return 0.95;
  if (conflicts.some((c) => c.type === 'BALANCE_CONFLICT')) return 0.75;
  if (conflicts.some((c) => c.type === 'STATUS_CONFLICT') || conflicts.some((c) => c.type === 'PAYMENT_STATUS_CONFLICT')) return 0.75;
  if (conflicts.some((c) => c.type === 'LATE_PAYMENT_CONFLICT')) return 0.6;
  return 0.5;
}

export function prioritize(accountsWithConflicts: Array<{ account_group: MatchedGroup; conflicts: Conflict[] }>): ScoredAccount[] {
  const scored: ScoredAccount[] = [];

  for (const item of accountsWithConflicts) {
    const primary = getPrimaryAccount(item.account_group);
    if (!primary) continue;

    const balance = typeof primary.balance === 'number' ? primary.balance : parseFloat(String(primary.balance || '0').replace(/[$,]/g, '')) || 0;
    const status = String(primary.status || primary.payment_status || primary.paymentStatus || '').toLowerCase();
    const creditor = String(primary.accountName || primary.creditor_name || 'Unknown');
    const bureaus = (['TU', 'EQ', 'EX'] as const).filter((b) => item.account_group[b] != null);

    let score = 0;
    for (const c of item.conflicts) {
      score += Math.min(c.severity, 10);
    }
    score = Math.min(score, 50);

    if (balance > 5000) score += 20;
    else if (balance > 2000) score += 15;
    else if (balance > 500) score += 10;
    else if (balance > 0) score += 5;

    if (status.includes('open') || status.includes('past due')) score += 20;
    else if (status.includes('charge') || status.includes('collection')) score += 15;
    else if (status.includes('repo') || status.includes('foreclosure')) score += 18;

    const lastActivity = primary.lastActivity;
    if (lastActivity) {
      const d = lastActivity instanceof Date ? lastActivity : new Date(String(lastActivity));
      if (!isNaN(d.getTime())) {
        const daysAgo = (Date.now() - d.getTime()) / (24 * 60 * 60 * 1000);
        if (daysAgo < 365) score += 15;
        else if (daysAgo < 730) score += 10;
        else if (daysAgo < 1095) score += 5;
      }
    }

    score += bureaus.length * 3;

    const successProb = estimateSuccess(item.conflicts);

    scored.push({
      account_group: item.account_group,
      conflicts: item.conflicts,
      total_score: score,
      success_probability: successProb,
      creditor,
      balance,
      status,
      bureaus,
    });
  }

  scored.sort((a, b) => b.total_score - a.total_score);
  return scored;
}
