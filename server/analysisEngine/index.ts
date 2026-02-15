/**
 * Core Analysis Engine
 * Implements the 6-step methodology: parse → negative detection → cross-bureau match → conflicts → prioritize → output
 */

import { isNegative, classifySeverity, classifyCategory, type AccountData } from './negativeDetector';
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
  totalDebt: number;
  totalDisputableItems: number; // unique × bureaus (for UI "violations")
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
  // Step 2: Identify negatives (rule-based filter - Vision AI already extracts negatives, but we reinforce)
  const asAccountData = accounts.map(toAccountData);
  const negatives = asAccountData.filter((a) => isNegative(a));

  // If rule-based finds more than AI provided, use rule-based; else use all (AI already filtered)
  const toProcess = negatives.length > 0 ? negatives : asAccountData;

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

  for (const s of scored) {
    const primary = s.account_group.EX || s.account_group.EQ || s.account_group.TU;
    if (!primary) continue;

    const acctData = toAccountData(primary as AnalysisInputAccount);
    const severity = classifySeverity(acctData);
    const category = classifyCategory(acctData);

    categoryBreakdown[category]++;
    severityBreakdown[severity]++;

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
    accountPreviews.push({
      name: s.creditor,
      last4,
      balance: String(balance),
      status: s.status || 'Negative',
      amountType: (primary.negativeReason as string) || (primary.accountType as string) || 'Negative item',
      bureau: s.bureaus.join(', '),
    });
  }

  // totalUniqueNegatives = number of matched groups (unique accounts)
  const totalUniqueNegatives = negativeAccounts.length;
  const totalDisputableItems = negativeAccounts.reduce((sum, a) => sum + a.bureaus.length, 0);

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
    totalDebt,
    totalDisputableItems,
    negativeAccounts,
    categoryBreakdown,
    severityBreakdown,
    accountPreviews,
    round1Targets,
  };
}
