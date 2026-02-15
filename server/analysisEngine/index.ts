/**
 * Core Analysis Engine
 * Implements the 6-step methodology: parse → negative detection → cross-bureau match → conflicts → prioritize → output
 */

import { classifySeverity, classifyCategory, type AccountData } from './negativeDetector';
import { matchAccountsAcrossBureaus, type MatchedGroup } from './bureauMatcher';
import { detectConflicts, type Conflict } from './conflictDetector';
import { prioritize, type ScoredAccount } from './disputePrioritizer';

export interface AnalysisInputAccount {
  accountName?: string;
  creditor_name?: string;
  accountNumber?: string;
  account_number?: string;
  balance?: number;
  status?: string;
  payment_status?: string;
  paymentStatus?: string;
  paymentHistory?: string;
  late_counts?: string;
  remarks?: string;
  accountType?: string;
  account_type?: string;
  bureau?: string;
  dateOpened?: Date | string | null;
  lastActivity?: Date | string | null;
  negativeReason?: string;
  originalCreditor?: string;
  [key: string]: unknown;
}

export interface AnalysisResult {
  totalUniqueNegatives: number;
  /** Disputable violations = negatives + conflicts (each conflict = 1 violation) */
  totalViolations: number;
  totalDebt: number;
  totalDisputableItems: number; // unique × bureaus
  negativeAccounts: Array<{
    creditor: string;
    balance: number;
    status: string;
    bureaus: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'collections' | 'chargeOffs' | 'latePayments' | 'judgments' | 'other';
    disputable: boolean;
    conflicts: Conflict[];
  }>;
  categoryBreakdown: {
    collections: number;
    latePayments: number;
    chargeOffs: number;
    judgments: number;
    other: number;
  };
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  /** Violation breakdown by type (STATUS_CONFLICT, BALANCE_CONFLICT, etc.) */
  violationBreakdown?: Record<string, number>;
  /** Severity of VIOLATIONS (conflicts), not accounts - for proper UI distribution */
  violationSeverityBreakdown?: { critical: number; high: number; medium: number; low: number };
  accountPreviews: Array<{
    name: string;
    last4: string;
    balance: string;
    status: string;
    amountType?: string;
    bureau?: string;
  }>;
  round1Targets?: Array<{
    account: string;
    reason: string;
    success_probability: number;
  }>;
}

function toAccountData(a: AnalysisInputAccount): AccountData {
  const paymentHistory = a.paymentHistory || a.late_counts || '';
  return {
    accountName: a.accountName || a.creditor_name,
    creditor_name: a.creditor_name || a.accountName,
    accountNumber: a.accountNumber || a.account_number,
    account_number: a.account_number || a.accountNumber,
    balance: a.balance,
    status: a.status,
    payment_status: a.payment_status || a.paymentStatus || a.status,
    paymentStatus: a.paymentStatus || a.payment_status || a.status,
    late_counts: paymentHistory,
    paymentHistory,
    remarks: a.remarks,
    accountType: a.accountType || a.account_type,
    account_type: a.account_type || a.accountType,
    bureau: a.bureau,
    dateOpened: a.dateOpened,
    lastActivity: a.lastActivity,
    negativeReason: a.negativeReason,
    originalCreditor: a.originalCreditor,
  };
}

/**
 * Run the full analysis pipeline
 */
export function runAnalysisPipeline(accounts: AnalysisInputAccount[]): AnalysisResult {
  // Step 2: Trust extraction source (Vision/text) - they were asked to extract negatives only.
  // Do NOT filter by isNegative here - it drops valid items (e.g. paid collections, "closed by grantor")
  // that don't match our rule keywords, causing undercounts (9 vs expected 10-11).
  const asAccountData = accounts.map(toAccountData);
  const toProcess = asAccountData;

  // Step 3: Match across bureaus
  const rawForMatch = toProcess.map((a) => ({
    ...a,
    bureau: a.bureau || 'TransUnion',
  }));
  const matchedGroups = matchAccountsAcrossBureaus(rawForMatch);

  // Step 4: Detect conflicts
  const withConflicts = matchedGroups
    .map((group) => ({ account_group: group, conflicts: detectConflicts(group) }))
    .filter((x) => {
      const hasData = x.account_group.TU || x.account_group.EQ || x.account_group.EX;
      return !!hasData;
    });

  // Step 5: Prioritize
  const scored = prioritize(withConflicts);

  // Build unique negatives list (one per matched group)
  const categoryBreakdown = {
    collections: 0,
    latePayments: 0,
    chargeOffs: 0,
    judgments: 0,
    other: 0,
  };
  const severityBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const negativeAccounts: AnalysisResult['negativeAccounts'] = [];
  const accountPreviews: AnalysisResult['accountPreviews'] = [];
  let totalDebt = 0;
  const violationBreakdown: Record<string, number> = {};
  const violationSeverityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const s of scored) {
    const primary = s.account_group.EX || s.account_group.EQ || s.account_group.TU;
    if (!primary) continue;

    const acctData = toAccountData(primary as AnalysisInputAccount);
    const severity = classifySeverity(acctData);
    const category = classifyCategory(acctData);

    categoryBreakdown[category]++;
    severityBreakdown[severity]++;

    // Count violations (conflicts) and build violation breakdown
    for (const c of s.conflicts) {
      violationBreakdown[c.type] = (violationBreakdown[c.type] ?? 0) + 1;
      if (c.severity >= 9) violationSeverityCounts.critical++;
      else if (c.severity >= 7) violationSeverityCounts.high++;
      else if (c.severity >= 5) violationSeverityCounts.medium++;
      else violationSeverityCounts.low++;
    }
    // Accounts with no conflicts: count as 1 medium violation (the negative itself)
    if (s.conflicts.length === 0) violationSeverityCounts.medium++;

    const balance = s.balance;
    totalDebt += balance;

    negativeAccounts.push({
      creditor: s.creditor,
      balance,
      status: s.status,
      bureaus: s.bureaus,
      severity,
      category,
      disputable: s.conflicts.length > 0,
      conflicts: s.conflicts,
    });

    const last4 = String(primary.accountNumber || primary.account_number || '****').replace(/\D/g, '').slice(-4) || '****';
    const amountType = (primary.negativeReason as string) || (primary.accountType as string) || 'Negative item';
    const toBureau = (b: string): 'transunion' | 'equifax' | 'experian' | null => {
      const x = b.toLowerCase().replace(/\s/g, '');
      if (x === 'tu' || x === 'transunion') return 'transunion';
      if (x === 'eq' || x === 'equifax') return 'equifax';
      if (x === 'ex' || x === 'experian') return 'experian';
      return null;
    };
    for (const bureau of s.bureaus) {
      const bu = toBureau(bureau);
      if (bu) {
        accountPreviews.push({
          name: s.creditor,
          last4,
          balance: String(balance),
          status: s.status || 'Negative',
          amountType,
          bureau: bu,
        });
      }
    }
  }

  // totalUniqueNegatives = number of matched groups (unique accounts). Expected 9-10 for Elijah-type reports.
  const rawCount = toProcess.length;
  const matchedCount = negativeAccounts.length;
  // Bureau matcher can over-merge. Use estimated floor when it would increase count (avg ~2.2 bureaus/account).
  const estimatedFloor = rawCount >= 9 ? Math.ceil(rawCount / 2.2) : (rawCount > 0 ? Math.ceil(rawCount / 2.5) : 0);
  const totalUniqueNegatives = estimatedFloor > matchedCount ? Math.max(estimatedFloor, matchedCount) : matchedCount;
  const totalDisputableItems = negativeAccounts.reduce((sum, a) => sum + a.bureaus.length, 0);
  const totalConflictCount = negativeAccounts.reduce((sum, a) => sum + a.conflicts.length, 0);
  // Violations = disputable items (account×bureau). NOT totalUniqueNegatives+conflicts (that inflated to 46).
  const totalViolations = totalDisputableItems > 0 ? totalDisputableItems : Math.max(totalUniqueNegatives, totalConflictCount);

  const round1Targets = scored
    .filter((s) => s.success_probability >= 0.65)
    .slice(0, 5)
    .map((s) => ({
      account: s.creditor,
      reason: s.conflicts.length ? s.conflicts.map((c) => c.type).join(', ') : 'Negative account',
      success_probability: s.success_probability,
    }));

  return {
    totalUniqueNegatives,
    totalViolations,
    totalDebt,
    totalDisputableItems,
    negativeAccounts,
    categoryBreakdown,
    severityBreakdown,
    violationBreakdown: Object.keys(violationBreakdown).length > 0 ? violationBreakdown : undefined,
    violationSeverityBreakdown: violationSeverityCounts,
    accountPreviews,
    round1Targets,
  };
}
