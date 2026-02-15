/**
 * Negative Account Detector
 * Rule-based identification of negative accounts per user methodology
 */

import { parseLateCounts, type LateCounts } from './helpers';

export interface AccountData {
  creditor_name?: string;
  accountName?: string;
  account_number?: string;
  accountNumber?: string;
  balance?: number;
  status?: string;
  payment_status?: string;
  paymentStatus?: string;
  late_counts?: string;
  late_counts_normalized?: string;
  paymentHistory?: string;
  remarks?: string;
  account_type?: string;
  accountType?: string;
  bureau?: string;
  [key: string]: unknown;
}

const NEGATIVE_STATUSES = [
  'charge off',
  'charge-off',
  'chargeo',
  'collection',
  'repossession',
  'foreclosure',
  'late over 120',
  'past due',
  'voluntary surrender',
  'placed for collection',
  'charged off',
  'written off',
  'profit',
  'loss',
  'collection/chargeo',
];

const NEGATIVE_REMARK_KEYWORDS = [
  'repossession',
  'foreclosure',
  'voluntary surrender',
  'charge',
  'collection',
  'loss',
  'unpaid balance',
  'derogatory',
  'adverse',
];

const POSITIVE_STATUSES = ['as agreed', 'in good standing', 'paid', 'current', 'ok'];

/**
 * Returns true if account is negative per methodology
 */
export function isNegative(account: AccountData): boolean {
  const status = (account.status || account.payment_status || account.paymentStatus || '').toLowerCase();
  const paymentStatus = (account.payment_status || account.paymentStatus || account.status || '').toLowerCase();
  const remarks = (account.remarks || '').toLowerCase();
  const accountType = (account.account_type || account.accountType || '').toLowerCase();

  // Automatic negatives by status
  for (const neg of NEGATIVE_STATUSES) {
    if (status.includes(neg) || paymentStatus.includes(neg)) return true;
  }

  // Late counts: any non-zero 30/60/90 = negative
  const lateStr =
    account.late_counts ||
    account.late_counts_normalized ||
    account.paymentHistory ||
    '';
  const lates = parseLateCounts(lateStr);
  if (lates.day30 > 0 || lates.day60 > 0 || lates.day90 > 0) {
    return true;
  }

  // Remarks with negative keywords
  for (const kw of NEGATIVE_REMARK_KEYWORDS) {
    if (remarks.includes(kw)) return true;
  }

  // Balance > 0 and NOT in good standing, and it's a collection
  const balance = typeof account.balance === 'number' ? account.balance : 0;
  if (balance > 0) {
    const isPositive = POSITIVE_STATUSES.some((p) => status.includes(p) || paymentStatus.includes(p));
    if (!isPositive && accountType === 'collection') return true;
  }

  return false;
}

/**
 * Classify severity: CRITICAL, HIGH, MODERATE, LOW
 */
export function classifySeverity(account: AccountData): 'critical' | 'high' | 'medium' | 'low' {
  const status = (account.status || '').toLowerCase();
  const balance = typeof account.balance === 'number' ? account.balance : 0;
  const lateStr = account.late_counts || account.late_counts_normalized || account.paymentHistory || '';
  const lates = parseLateCounts(lateStr);

  // CRITICAL: Repo/foreclosure + high balance
  if ((status.includes('repo') || status.includes('foreclosure')) && balance > 5000) {
    return 'critical';
  }

  // HIGH: Charge-off/collection + balance > 2000
  if ((status.includes('charge') || status.includes('collection')) && balance > 2000) {
    return 'high';
  }

  // HIGH: 3+ x 90-day lates
  if (lates.day90 >= 3) return 'high';

  // MODERATE: Any balance with negative status
  if (balance > 500) return 'medium';

  return 'low';
}

/**
 * Classify category for breakdown
 */
export function classifyCategory(account: AccountData): 'collections' | 'chargeOffs' | 'latePayments' | 'judgments' | 'other' {
  const blob = [
    account.status,
    account.payment_status || account.paymentStatus,
    account.accountType || account.account_type,
    account.negativeReason,
    account.accountName || account.creditor_name,
    account.remarks,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const collectionAgencies = [
    'tsi', 'transworld', 'midland', 'portfolio', 'cavalry', 'lvnv',
    'encore', 'jefferson', 'convergent', 'enhanced', 'afni', 'allied',
    'ic system', 'nca', 'pro collect', 'innovative', 'fst financia',
    'receivables', 'credence', 'radius', 'resurgent',
  ];

  if (blob.includes('collection') || collectionAgencies.some((a) => blob.includes(a))) {
    return 'collections';
  }
  if (
    blob.includes('charge off') ||
    blob.includes('charged off') ||
    blob.includes('chargeoff') ||
    blob.includes('written off') ||
    blob.includes('profit') ||
    blob.includes('loss write')
  ) {
    return 'chargeOffs';
  }
  if (
    blob.includes('late') ||
    blob.includes('past due') ||
    blob.includes('delinquent') ||
    blob.includes('days late')
  ) {
    return 'latePayments';
  }
  if (
    blob.includes('judgment') ||
    blob.includes('lien') ||
    blob.includes('bankrupt') ||
    blob.includes('foreclosure') ||
    blob.includes('repossession') ||
    blob.includes('repo')
  ) {
    return 'judgments';
  }
  return 'other';
}
