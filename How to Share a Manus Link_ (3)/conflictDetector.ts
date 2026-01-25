/**
 * Cross-Bureau Conflict Detection Engine
 * 
 * Detects ALL 43 dispute strategies for credit report violations
 * These conflicts are the strongest arguments for deletion
 */

import type { ParsedAccount } from './creditReportParser';

export interface Conflict {
  type: 
    // Category 1: Date & Timeline (15)
    | 'cross_bureau_date' | 'impossible_timeline' | 're-aging' | 'missing_dates' 
    | 'last_activity_predates_opened' | 'beyond_7_year' | 'inconsistent_chargeoff_dates'
    | 'opening_date_conflicts' | 'closed_account_activity' | 'future_dated'
    | 'impossible_chargeoff_timeline' | 'payment_after_chargeoff' | 'inconsistent_delinquency'
    | 'account_age_exceeds_history' | 'statute_of_limitations'
    // Category 2: Balance & Payment (8)
    | 'unverifiable_balance' | 'balance' | 'balance_increase_post_chargeoff'
    | 'payment_history_mismatch' | 'zero_balance_negative' | 'unverifiable_deficiency'
    | 'collection_exceeds_original' | 'anomalous_utilization'
    // Category 3: Creditor & Ownership (5)
    | 'lack_of_standing' | 'original_creditor_not_reporting' | 'multiple_collectors'
    | 'creditor_name_inconsistencies' | 'mixed_files'
    // Category 4: Status & Classification (6)
    | 'duplicate' | 'status_correction' | 'contradictory_status' | 'incorrect_account_type'
    | 'late_payments_after_payoff' | 'disputed_status_not_reflected'
    // Category 5: Account Identification (2)
    | 'account_number_conflicts' | 'same_number_different_debts'
    // Category 6: Legal & Procedural (2)
    | 'failure_to_provide_mov' | 'inadequate_reinvestigation'
    // Category 7: Statistical & Pattern (5)
    | 'impossible_payment_patterns' | 'high_concentration_single_day' | 'synchronized_late_payments'
    | 'inquiry_without_purpose' | 'written_off_amount_conflicts'
    // Legacy types
    | 'status' | 'date' | 'previously_disputed' | 'missing_documentation';
  severity: 'critical' | 'high' | 'medium';
  accountName: string;
  description: string;
  bureaus: string[];
  details: Record<string, any>;
  fcraViolation: string;
  deletionProbability: number; // 0-100%
  argument?: string; // Full legal argument for this violation
  methodNumber?: number; // Which of the 43 methods this is
}

export interface ConflictAnalysis {
  conflicts: Conflict[];
  totalConflicts: number;
  criticalConflicts: number;
  highPriorityConflicts: number;
  estimatedDeletions: number;
  methodsUsed: number[]; // Track which of the 43 methods were triggered
}

/**
 * Detect all conflicts across bureaus for a set of accounts
 * Implements ALL 43 dispute detection methods
 */
export function detectConflicts(accounts: ParsedAccount[]): ConflictAnalysis {
  const conflicts: Conflict[] = [];
  const methodsUsed = new Set<number>();

  // Group accounts by name (same account across bureaus)
  const accountGroups = groupAccountsByName(accounts);

  // ============================================
  // CROSS-BUREAU DETECTION (requires 2+ bureaus)
  // ============================================
  for (const [accountName, groupAccounts] of Object.entries(accountGroups)) {
    if (groupAccounts.length >= 2) {
      // Method 1: Cross-bureau date conflicts
      const dateConflicts = detectCrossBureauDateConflicts(accountName, groupAccounts);
      conflicts.push(...dateConflicts);
      if (dateConflicts.length > 0) methodsUsed.add(1);

      // Method 7: Inconsistent charge-off dates
      const chargeoffConflicts = detectInconsistentChargeoffDates(accountName, groupAccounts);
      conflicts.push(...chargeoffConflicts);
      if (chargeoffConflicts.length > 0) methodsUsed.add(7);

      // Method 17: Balance discrepancies across bureaus
      const balanceConflicts = detectBalanceDiscrepancies(accountName, groupAccounts);
      conflicts.push(...balanceConflicts);
      if (balanceConflicts.length > 0) methodsUsed.add(17);

      // Method 27: Creditor name inconsistencies
      const nameConflicts = detectCreditorNameInconsistencies(accountName, groupAccounts);
      conflicts.push(...nameConflicts);
      if (nameConflicts.length > 0) methodsUsed.add(27);

      // Method 35: Account number conflicts
      const accountNumConflicts = detectAccountNumberConflicts(accountName, groupAccounts);
      conflicts.push(...accountNumConflicts);
      if (accountNumConflicts.length > 0) methodsUsed.add(35);

      // Method 29: Duplicate reporting
      const duplicateConflicts = detectDuplicateAccounts(accountName, groupAccounts);
      conflicts.push(...duplicateConflicts);
      if (duplicateConflicts.length > 0) methodsUsed.add(29);

      // Method 26: Multiple collectors same debt
      const multiCollectorConflicts = detectMultipleCollectors(accountName, groupAccounts);
      conflicts.push(...multiCollectorConflicts);
      if (multiCollectorConflicts.length > 0) methodsUsed.add(26);
    }
  }

  // ============================================
  // SINGLE ACCOUNT DETECTION (works on any account)
  // ============================================
  for (const [accountName, groupAccounts] of Object.entries(accountGroups)) {
    for (const account of groupAccounts) {
      // Method 2: Impossible timeline (activity before opening)
      const impossibleTimeline = detectImpossibleTimeline(accountName, account);
      conflicts.push(...impossibleTimeline);
      if (impossibleTimeline.length > 0) methodsUsed.add(2);

      // Method 3: Re-aging violations
      const reaging = detectReagingViolation(accountName, account);
      conflicts.push(...reaging);
      if (reaging.length > 0) methodsUsed.add(3);

      // Method 4: Missing critical dates
      const missingDates = detectMissingDates(accountName, account);
      conflicts.push(...missingDates);
      if (missingDates.length > 0) methodsUsed.add(4);

      // Method 5: Last activity predates date opened
      const lastActivityPredates = detectLastActivityPredatesOpened(accountName, account);
      conflicts.push(...lastActivityPredates);
      if (lastActivityPredates.length > 0) methodsUsed.add(5);

      // Method 6: Beyond 7-year limit
      const beyond7Year = detectBeyond7YearLimit(accountName, account);
      conflicts.push(...beyond7Year);
      if (beyond7Year.length > 0) methodsUsed.add(6);

      // Method 8: Opening date conflicts with history
      const openingConflicts = detectOpeningDateConflicts(accountName, account);
      conflicts.push(...openingConflicts);
      if (openingConflicts.length > 0) methodsUsed.add(8);

      // Method 9: Closed account showing activity
      const closedActivity = detectClosedAccountActivity(accountName, account);
      conflicts.push(...closedActivity);
      if (closedActivity.length > 0) methodsUsed.add(9);

      // Method 10: Future-dated entries
      const futureDated = detectFutureDatedEntries(accountName, account);
      conflicts.push(...futureDated);
      if (futureDated.length > 0) methodsUsed.add(10);

      // Method 11: Impossible charge-off timeline
      const impossibleChargeoff = detectImpossibleChargeoffTimeline(accountName, account);
      conflicts.push(...impossibleChargeoff);
      if (impossibleChargeoff.length > 0) methodsUsed.add(11);

      // Method 12: Payment activity after charge-off
      const paymentAfterChargeoff = detectPaymentAfterChargeoff(accountName, account);
      conflicts.push(...paymentAfterChargeoff);
      if (paymentAfterChargeoff.length > 0) methodsUsed.add(12);

      // Method 13: Inconsistent delinquency progression
      const delinquencyProgression = detectInconsistentDelinquency(accountName, account);
      conflicts.push(...delinquencyProgression);
      if (delinquencyProgression.length > 0) methodsUsed.add(13);

      // Method 14: Account age exceeds credit history
      const accountAgeExceeds = detectAccountAgeExceedsHistory(accountName, account);
      conflicts.push(...accountAgeExceeds);
      if (accountAgeExceeds.length > 0) methodsUsed.add(14);

      // Method 15: Statute of limitations expired
      const solExpired = detectStatuteOfLimitations(accountName, account);
      conflicts.push(...solExpired);
      if (solExpired.length > 0) methodsUsed.add(15);

      // Method 16: Unverifiable balance
      const unverifiableBalance = detectUnverifiableBalance(accountName, account);
      conflicts.push(...unverifiableBalance);
      if (unverifiableBalance.length > 0) methodsUsed.add(16);

      // Method 18: Balance increases post-charge-off
      const balanceIncrease = detectBalanceIncreasePostChargeoff(accountName, account);
      conflicts.push(...balanceIncrease);
      if (balanceIncrease.length > 0) methodsUsed.add(18);

      // Method 19: Payment history doesn't support balance
      const paymentMismatch = detectPaymentHistoryMismatch(accountName, account);
      conflicts.push(...paymentMismatch);
      if (paymentMismatch.length > 0) methodsUsed.add(19);

      // Method 20: Zero balance showing negative
      const zeroBalanceNegative = detectZeroBalanceNegative(accountName, account);
      conflicts.push(...zeroBalanceNegative);
      if (zeroBalanceNegative.length > 0) methodsUsed.add(20);

      // Method 21: Unverifiable deficiency balance
      const unverifiableDeficiency = detectUnverifiableDeficiency(accountName, account);
      conflicts.push(...unverifiableDeficiency);
      if (unverifiableDeficiency.length > 0) methodsUsed.add(21);

      // Method 22: Collection exceeds original debt
      const collectionExceeds = detectCollectionExceedsOriginal(accountName, account);
      conflicts.push(...collectionExceeds);
      if (collectionExceeds.length > 0) methodsUsed.add(22);

      // Method 23: Anomalous utilization rates
      const anomalousUtil = detectAnomalousUtilization(accountName, account);
      conflicts.push(...anomalousUtil);
      if (anomalousUtil.length > 0) methodsUsed.add(23);

      // Method 24: Lack of standing to report
      const lackStanding = detectLackOfStanding(accountName, account);
      conflicts.push(...lackStanding);
      if (lackStanding.length > 0) methodsUsed.add(24);

      // Method 25: Original creditor not reporting
      const originalNotReporting = detectOriginalCreditorNotReporting(accountName, account);
      conflicts.push(...originalNotReporting);
      if (originalNotReporting.length > 0) methodsUsed.add(25);

      // Method 28: Mixed files / wrong consumer
      const mixedFiles = detectMixedFiles(accountName, account);
      conflicts.push(...mixedFiles);
      if (mixedFiles.length > 0) methodsUsed.add(28);

      // Method 30: Status corrections (paid accounts showing negative)
      const statusCorrections = detectStatusCorrections(accountName, account);
      conflicts.push(...statusCorrections);
      if (statusCorrections.length > 0) methodsUsed.add(30);

      // Method 31: Contradictory status designations
      const contradictoryStatus = detectContradictoryStatus(accountName, account);
      conflicts.push(...contradictoryStatus);
      if (contradictoryStatus.length > 0) methodsUsed.add(31);

      // Method 32: Incorrect account type classification
      const incorrectType = detectIncorrectAccountType(accountName, account);
      conflicts.push(...incorrectType);
      if (incorrectType.length > 0) methodsUsed.add(32);

      // Method 33: Late payments on paid/current accounts
      const lateOnPaid = detectLatePaymentsAfterPayoff(accountName, account);
      conflicts.push(...lateOnPaid);
      if (lateOnPaid.length > 0) methodsUsed.add(33);

      // Method 34: Disputed status not reflected
      const disputedNotReflected = detectDisputedStatusNotReflected(accountName, account);
      conflicts.push(...disputedNotReflected);
      if (disputedNotReflected.length > 0) methodsUsed.add(34);

      // Method 36: Same account number different debts
      const sameNumDiffDebt = detectSameNumberDifferentDebts(accountName, account);
      conflicts.push(...sameNumDiffDebt);
      if (sameNumDiffDebt.length > 0) methodsUsed.add(36);

      // Method 37: Failure to provide MOV
      const movFailure = detectFailureToProvideMOV(accountName, account);
      conflicts.push(...movFailure);
      if (movFailure.length > 0) methodsUsed.add(37);

      // Method 38: Inadequate reinvestigation
      const inadequateReinvest = detectInadequateReinvestigation(accountName, account);
      conflicts.push(...inadequateReinvest);
      if (inadequateReinvest.length > 0) methodsUsed.add(38);

      // Method 39: Impossible payment patterns
      const impossiblePatterns = detectImpossiblePaymentPatterns(accountName, account);
      conflicts.push(...impossiblePatterns);
      if (impossiblePatterns.length > 0) methodsUsed.add(39);

      // Method 41: Systematic late payment reporting
      const systematicLate = detectSynchronizedLatePayments(accountName, account);
      conflicts.push(...systematicLate);
      if (systematicLate.length > 0) methodsUsed.add(41);

      // Method 42: Inquiry without permissible purpose
      const unauthorizedInquiry = detectInquiryWithoutPurpose(accountName, account);
      conflicts.push(...unauthorizedInquiry);
      if (unauthorizedInquiry.length > 0) methodsUsed.add(42);

      // Method 43: Written-off amount conflicts
      const writtenOffConflicts = detectWrittenOffAmountConflicts(accountName, account);
      conflicts.push(...writtenOffConflicts);
      if (writtenOffConflicts.length > 0) methodsUsed.add(43);
    }
  }

  // Method 40: High concentration of accounts single day (needs all accounts)
  const highConcentration = detectHighConcentrationSingleDay(accounts);
  conflicts.push(...highConcentration);
  if (highConcentration.length > 0) methodsUsed.add(40);

  // Sort by severity and deletion probability
  conflicts.sort((a, b) => {
    if (a.severity !== b.severity) {
      const severityOrder = { critical: 3, high: 2, medium: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return b.deletionProbability - a.deletionProbability;
  });

  const criticalConflicts = conflicts.filter(c => c.severity === 'critical').length;
  const highPriorityConflicts = conflicts.filter(c => c.severity === 'high').length;
  const estimatedDeletions = conflicts.filter(c => c.deletionProbability >= 70).length;

  return {
    conflicts,
    totalConflicts: conflicts.length,
    criticalConflicts,
    highPriorityConflicts,
    estimatedDeletions,
    methodsUsed: Array.from(methodsUsed).sort((a, b) => a - b),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function groupAccountsByName(accounts: ParsedAccount[]): Record<string, ParsedAccount[]> {
  const groups: Record<string, ParsedAccount[]> = {};
  for (const account of accounts) {
    const normalizedName = normalizeAccountName(account.accountName);
    if (!groups[normalizedName]) {
      groups[normalizedName] = [];
    }
    groups[normalizedName].push(account);
  }
  return groups;
}

function normalizeAccountName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/INC|LLC|CORP|COMPANY|CO/g, '')
    .trim();
}

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ============================================
// METHOD 1: Cross-Bureau Date Conflicts
// ============================================
function detectCrossBureauDateConflicts(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const lastActivityDates = accounts
    .filter(a => a.lastActivity)
    .map(a => ({ bureau: a.bureau, date: a.lastActivity! }));

  if (lastActivityDates.length >= 2) {
    const dates = lastActivityDates.map(d => d.date.getTime());
    const maxDate = Math.max(...dates);
    const minDate = Math.min(...dates);
    const daysDiff = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24));

    if (daysDiff > 30) {
      const monthsDiff = Math.round(daysDiff / 30);
      conflicts.push({
        type: 'cross_bureau_date',
        severity: daysDiff > 180 ? 'critical' : 'high',
        accountName,
(Content truncated due to size limit. Use line ranges to read remaining content)