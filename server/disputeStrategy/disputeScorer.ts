/**
 * Dispute Scorer
 * Scores each account by severity (3-10) and assigns round (1, 2, or 3)
 * Round 1: Internal logic errors only
 * Round 2: Internal conflicts within bureau
 * Round 3: Cross-bureau
 */

import type { ParsedAccount } from '../creditReportParser';
import { detectConflicts, type Conflict } from '../conflictDetector';
import { getRoundForConflict, getSeverityForConflict } from './conflictRoundMap';
import { findDuplicateGroups, type AccountForDuplicateCheck } from './duplicateFinder';

export interface ScoredAccount {
  id: number;
  accountName: string;
  bureau: string;
  severity: number;       // 3-10
  round: 1 | 2 | 3;
  errorTypes: string[];
  letterTemplate: string;
  isDuplicate: boolean;
  duplicateGroupIds?: number[];
}

export interface ScoredAccountInput {
  id: number;
  accountName: string | null;
  accountNumber?: string | null;
  balance?: string | number | null;
  status?: string | null;
  dateOpened?: string | null;
  lastActivity?: string | null;
  dateClosed?: string | null;
  accountType?: string | null;
  originalCreditor?: string | null;
  bureau?: string | null;
  rawData?: string | null;
}

const BUREAU_LABELS: Record<string, 'TransUnion' | 'Equifax' | 'Experian'> = {
  transunion: 'TransUnion',
  equifax: 'Equifax',
  experian: 'Experian',
};

function toParsedAccount(acc: ScoredAccountInput, bureauOverride?: 'TransUnion' | 'Equifax' | 'Experian'): ParsedAccount {
  const bureau = (acc.bureau || 'transunion').toLowerCase();
  const bureauLabel = bureauOverride || BUREAU_LABELS[bureau] || 'TransUnion';
  const bal = typeof acc.balance === 'string' ? parseFloat(acc.balance) || 0 : Number(acc.balance) || 0;
  const parseDate = (s: string | null | undefined): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  return {
    accountName: acc.accountName || 'Not reported',
    accountNumber: String(acc.accountNumber || 'Not reported'),
    balance: bal,
    status: acc.status || 'Not reported',
    dateOpened: parseDate(acc.dateOpened),
    lastActivity: parseDate(acc.lastActivity),
    accountType: acc.accountType || 'Not reported',
    originalCreditor: acc.originalCreditor || undefined,
    bureau: bureauLabel,
    rawData: acc.rawData || '{}',
  };
}

const ERROR_TO_TEMPLATE: Record<string, string> = {
  impossible_timeline: '1A',
  last_activity_predates_opened: '1A',
  duplicate: '1B',
  unverifiable_balance: '1C',
  beyond_7_year: '1C',
  balance_increase_post_chargeoff: '1D',
  payment_history_mismatch: '1D',
  're-aging': '1F',
  opening_date_conflicts: '1E',
  closed_account_activity: '1E',
  cross_bureau_date: '3A',
  balance: '3A',
  account_number_conflicts: '2A',
  contradictory_status: '2A',
};

function extractFromRaw(rawData: string | null | undefined, key: string): string | null {
  if (!rawData) return null;
  try {
    const obj = JSON.parse(rawData);
    const v = obj?.[key];
    return v != null ? String(v) : null;
  } catch {
    return null;
  }
}

function extractHighBalanceFromRaw(rawData: string | null | undefined): number | null {
  if (!rawData) return null;
  try {
    const obj = JSON.parse(rawData);
    const v = obj?.highBalance ?? obj?.high_balance;
    if (v == null) return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

function pickTemplate(errorTypes: string[]): string {
  for (const t of errorTypes) {
    const tmpl = ERROR_TO_TEMPLATE[t];
    if (tmpl) return tmpl;
  }
  return errorTypes.length > 0 ? '1C' : '1C'; // default unverifiable/request verification
}

/**
 * Score all accounts with optional Claude enrichment (violation detection + prioritization)
 */
export async function scoreAccountsWithClaude(
  accounts: ScoredAccountInput[]
): Promise<ScoredAccount[]> {
  const base = scoreAccounts(accounts);
  const useClaude =
    process.env.USE_CLAUDE_HYBRID !== 'false' &&
    process.env.ANTHROPIC_API_KEY;

  if (!useClaude || base.length === 0) return base;

  try {
    const { isClaudeAvailable, detectViolations, prioritizeForRounds } =
      await import('../claude');

    if (!isClaudeAvailable()) {
      console.log('[DisputeScorer] Claude not available - using rule-based only');
      return base;
    }
    console.log('[DisputeScorer] ========== PHASE 2: CLAUDE HYBRID ==========');

    // 1) Violation detection: for accounts with only unverifiable_balance, ask Claude
    const accountsToEnrich = base.filter(
      (s) =>
        s.errorTypes.length <= 1 &&
        (s.errorTypes.length === 0 || s.errorTypes[0] === 'unverifiable_balance')
    );
    const limit = Math.min(3, accountsToEnrich.length);
    for (let i = 0; i < limit; i++) {
      const s = accountsToEnrich[i];
      const acc = accounts.find((a) => a.id === s.id);
      if (!acc) continue;
      const json = JSON.stringify({
        id: acc.id,
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
        balance: acc.balance,
        status: acc.status,
        dateOpened: acc.dateOpened,
        lastActivity: acc.lastActivity,
        accountType: acc.accountType,
        bureau: acc.bureau,
      });
      const violations = await detectViolations(json);
      if (violations.length > 0) {
        const { getRoundForConflict, getSeverityForConflict } =
          await import('./conflictRoundMap');
        let round = s.round;
        let maxSeverity = s.severity;
        const newTypes: string[] = [...s.errorTypes.filter((t) => t !== 'unverifiable_balance')];
        for (const v of violations) {
          const c = {
            type: v.type,
            severity: v.severity,
            accountName: s.accountName,
            description: v.description,
            bureaus: [acc.bureau || 'transunion'],
            details: {},
            fcraViolation: 'FCRA § 1681i',
            deletionProbability: 50,
          };
          const r = getRoundForConflict(c);
          if (r < round) round = r;
          const sev = getSeverityForConflict(c);
          if (sev > maxSeverity) maxSeverity = Math.min(10, sev);
          if (!newTypes.includes(v.type)) newTypes.push(v.type);
        }
        base[base.findIndex((x) => x.id === s.id)] = {
          ...s,
          round,
          severity: maxSeverity,
          errorTypes: newTypes.length ? newTypes : ['unverifiable_balance'],
          letterTemplate: pickTemplate(newTypes.length ? newTypes : ['unverifiable_balance']),
        };
      }
    }

    // 2) Prioritization: optional Sonnet override of rounds
    const assignments = await prioritizeForRounds(
      JSON.stringify(
        base.map((s) => ({
          accountId: s.id,
          accountName: s.accountName,
          round: s.round,
          severity: s.severity,
          errorTypes: s.errorTypes,
        }))
      )
    );
    if (assignments.length > 0) {
      const byId = new Map(assignments.map((a) => [a.accountId, a]));
      for (let i = 0; i < base.length; i++) {
        const a = byId.get(base[i].id);
        if (a) {
          base[i] = {
            ...base[i],
            round: a.round,
            severity: Math.min(10, Math.max(3, a.severity)),
          };
        }
      }
    }
  } catch (e) {
    console.error('[DisputeScorer] Claude enrichment failed, using rule-based only:', e);
  }

  console.log('[DisputeScorer] ========== END PHASE 2 (Claude) ==========');
  return base;
}

/**
 * Score all accounts and assign rounds (sync, rule-based only)
 */
export function scoreAccounts(accounts: ScoredAccountInput[]): ScoredAccount[] {
  if (accounts.length === 0) return [];

  // Create ParsedAccount for each - we need per-bureau entries if same account appears on multiple bureaus
  const parsedByBureau: ParsedAccount[] = [];
  const accountIdToBureaus = new Map<number, string[]>();

  for (const acc of accounts) {
    const bureau = (acc.bureau || 'transunion').toLowerCase();
    const bureaus = [bureau];
    const existing = accountIdToBureaus.get(acc.id);
    if (existing) {
      if (!existing.includes(bureau)) existing.push(bureau);
    } else {
      accountIdToBureaus.set(acc.id, bureaus);
    }
    parsedByBureau.push(toParsedAccount(acc));
  }

  const conflictAnalysis = detectConflicts(parsedByBureau);

  // Find duplicates
  const dupInput: AccountForDuplicateCheck[] = accounts.map(a => ({
    id: a.id,
    accountName: a.accountName,
    dateOpened: a.dateOpened,
    balance: a.balance,
  }));
  const dupGroups = findDuplicateGroups(dupInput);
  const dupIdsSet = new Set<number>();
  const dupGroupByAccount = new Map<number, number[]>();
  for (const g of dupGroups) {
    g.accountIds.forEach(id => {
      dupIdsSet.add(id);
      dupGroupByAccount.set(id, g.accountIds);
    });
  }

  const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const scored: ScoredAccount[] = [];

  for (const acc of accounts) {
    const acctNorm = normalize(acc.accountName || '');
    const accountConflicts = conflictAnalysis.conflicts.filter(c => {
      const cNorm = normalize(c.accountName || '');
      return acctNorm === cNorm || acctNorm.includes(cNorm) || cNorm.includes(acctNorm);
    });

    let round: 1 | 2 | 3 = 3;
    let maxSeverity = 3;
    const errorTypes: string[] = [];

    for (const c of accountConflicts) {
      const r = getRoundForConflict(c);
      if (r < round) round = r;
      const sev = getSeverityForConflict(c);
      if (sev > maxSeverity) maxSeverity = Math.min(10, sev);
      if (!errorTypes.includes(c.type)) errorTypes.push(c.type);
    }

    // date_opened == date_closed -> Round 1, severity 7
    const dateOpened = acc.dateOpened;
    const dateClosed = (acc as { dateClosed?: string | null }).dateClosed ?? extractFromRaw(acc.rawData, 'dateClosed');
    if (dateOpened && dateClosed && String(dateOpened).trim() === String(dateClosed).trim()) {
      if (round > 1) round = 1;
      if (maxSeverity < 7) maxSeverity = 7;
      if (!errorTypes.includes('date_opened_equals_closed')) errorTypes.unshift('date_opened_equals_closed');
    }

    // balance > high_balance (math error) -> Round 1, severity 9
    const bal = typeof acc.balance === 'string' ? parseFloat(acc.balance) || 0 : Number(acc.balance) || 0;
    const highBal = extractHighBalanceFromRaw(acc.rawData);
    if (highBal != null && bal > highBal && highBal > 0) {
      if (round > 1) round = 1;
      if (maxSeverity < 9) maxSeverity = 9;
      if (!errorTypes.includes('math_error_balance_exceeds_high_balance')) errorTypes.unshift('math_error_balance_exceeds_high_balance');
    }

    // Duplicate -> Round 1, severity 8
    const isDup = dupIdsSet.has(acc.id);
    if (isDup) {
      if (round > 1) round = 1;
      if (maxSeverity < 8) maxSeverity = 8;
      if (!errorTypes.includes('duplicate')) errorTypes.unshift('duplicate');
    }

    // No conflicts -> Round 1 with base "request verification" (severity 5)
    if (errorTypes.length === 0 && !isDup) {
      round = 1;
      maxSeverity = 5;
      errorTypes.push('unverifiable_balance'); // generic verification request
    }

    scored.push({
      id: acc.id,
      accountName: acc.accountName || 'Unknown',
      bureau: (acc.bureau || 'transunion').toLowerCase(),
      severity: maxSeverity,
      round,
      errorTypes,
      letterTemplate: pickTemplate(errorTypes),
      isDuplicate: isDup,
      duplicateGroupIds: dupGroupByAccount.get(acc.id),
    });
  }

  return scored;
}
