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
        description: `Cross-bureau date conflict: ${monthsDiff}-month discrepancy in Last Activity dates`,
        bureaus: accounts.map(a => a.bureau),
        details: {
          dates: lastActivityDates.map(d => `${d.bureau}: ${d.date.toLocaleDateString()}`).join(', '),
          daysDifference: daysDiff,
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Furnisher must report accurate information',
        deletionProbability: Math.min(95, 70 + (daysDiff / 10)),
        argument: `CROSS-BUREAU DATE CONFLICT:\n${lastActivityDates.map(d => `• ${d.bureau}: Last Activity ${d.date.toLocaleDateString()}`).join('\n')}\n\nThis account shows a ${monthsDiff}-month discrepancy (${daysDiff} days) in "Last Activity" dates across bureaus. An account cannot have three different "last activity" dates. This proves the furnisher lacks accurate records and cannot verify the information being reported.`,
        methodNumber: 1,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 2: Impossible Timeline
// ============================================
function detectImpossibleTimeline(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  if (account.dateOpened && account.lastActivity) {
    if (account.lastActivity < account.dateOpened) {
      const daysDiff = Math.round((account.dateOpened.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      conflicts.push({
        type: 'impossible_timeline',
        severity: 'critical',
        accountName,
        description: `IMPOSSIBLE TIMELINE: Activity ${daysDiff} days BEFORE account opened`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
          daysDifference: daysDiff,
        },
        fcraViolation: '§ 1681i(a)(5)(A) - Logically impossible timeline requires immediate deletion',
        deletionProbability: 100,
        argument: `CRITICAL ERROR - IMPOSSIBLE TIMELINE:\n• Date Opened: ${account.dateOpened.toLocaleDateString()}\n• Last Activity: ${account.lastActivity.toLocaleDateString()}\n\nThis account shows activity ${daysDiff} days BEFORE it was opened. This is physically impossible - an account cannot have activity before it exists. This alone proves the furnisher's records are completely unreliable and requires IMMEDIATE DELETION under FCRA § 1681i(a)(5)(A).`,
        methodNumber: 2,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 3: Re-Aging Violations
// ============================================
function detectReagingViolation(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const status = account.status.toLowerCase();
  const rawData = (account.rawData || '').toLowerCase();
  
  const isChargeOff = status.includes('charge') || status.includes('written off');
  const isClosed = status.includes('closed');
  
  if (account.lastActivity && account.dateOpened && (isChargeOff || isClosed)) {
    const now = new Date();
    const monthsSinceLastActivity = (now.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const monthsSinceOpened = (account.lastActivity.getTime() - account.dateOpened.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Charged-off account showing recent activity is re-aging
    if (monthsSinceLastActivity < 6 && monthsSinceOpened > 12) {
      conflicts.push({
        type: 're-aging',
        severity: 'critical',
        accountName,
        description: `ILLEGAL RE-AGING: Charged-off account shows activity ${Math.round(monthsSinceOpened)} months after opening`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
          status: account.status,
        },
        fcraViolation: '§ 1681s-2(a)(8) - Illegal re-aging of debt',
        deletionProbability: 95,
        argument: `ILLEGAL RE-AGING VIOLATION:\n• Date Opened: ${account.dateOpened.toLocaleDateString()}\n• Status: ${account.status}\n• Last Activity: ${account.lastActivity.toLocaleDateString()}\n\nA charged-off/closed account cannot have legitimate "activity" years after the delinquency. This manipulation extends the 7-year reporting period and is a CRITICAL violation of FCRA § 1681s-2(a)(8) requiring immediate deletion.`,
        methodNumber: 3,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 4: Missing Critical Dates
// ============================================
function detectMissingDates(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const missingFields: string[] = [];
  
  if (!account.dateOpened) missingFields.push('Date Opened');
  if (!account.lastActivity) missingFields.push('Last Activity');
  
  // Check raw data for DOFD
  const rawData = (account.rawData || '').toLowerCase();
  if (!rawData.includes('first delinquency') && !rawData.includes('dofd')) {
    missingFields.push('Date of First Delinquency');
  }
  
  if (missingFields.length >= 2 && account.balance > 0) {
    conflicts.push({
      type: 'missing_dates',
      severity: 'high',
      accountName,
      description: `Missing critical dates: ${missingFields.join(', ')}`,
      bureaus: [account.bureau],
      details: {
        missingFields,
        balance: `$${account.balance.toFixed(2)}`,
      },
      fcraViolation: '§ 1681e(b) - Bureau must ensure maximum possible accuracy',
      deletionProbability: 75,
      argument: `MISSING CRITICAL DATES:\nThis account is missing: ${missingFields.join(', ')}\n\nWithout these dates, the reporting period cannot be verified. The account may exceed the 7-year FCRA limit. Compliance cannot be confirmed without proper date documentation. Under § 1681e(b), the bureau must ensure maximum possible accuracy - which is impossible without these critical dates.`,
      methodNumber: 4,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 5: Last Activity Predates Date Opened
// ============================================
function detectLastActivityPredatesOpened(accountName: string, account: ParsedAccount): Conflict[] {
  // This is essentially the same as Method 2, but checking DOFD specifically
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for DOFD in raw data
  const dofdMatch = rawData.match(/first\s*delinquency[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i);
  
  if (dofdMatch && account.dateOpened) {
    const dofd = new Date(dofdMatch[1]);
    if (!isNaN(dofd.getTime()) && dofd < account.dateOpened) {
      const daysDiff = Math.round((account.dateOpened.getTime() - dofd.getTime()) / (1000 * 60 * 60 * 24));
      conflicts.push({
        type: 'last_activity_predates_opened',
        severity: 'critical',
        accountName,
        description: `Delinquency ${daysDiff} days BEFORE account opened`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          dofd: dofd.toLocaleDateString(),
          daysDifference: daysDiff,
        },
        fcraViolation: '§ 1681i(a)(5)(A) - Impossible timeline',
        deletionProbability: 100,
        argument: `CRITICAL ERROR - DELINQUENCY BEFORE ACCOUNT EXISTED:\n• Date Opened: ${account.dateOpened.toLocaleDateString()}\n• Date of First Delinquency: ${dofd.toLocaleDateString()}\n\nThe account shows delinquency ${daysDiff} days BEFORE it was opened. An account cannot be delinquent before it exists. This proves the furnisher's data is completely unreliable.`,
        methodNumber: 5,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 6: Beyond 7-Year Limit
// ============================================
function detectBeyond7YearLimit(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for DOFD
  const dofdMatch = rawData.match(/first\s*delinquency[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i);
  let dofd: Date | null = null;
  
  if (dofdMatch) {
    dofd = new Date(dofdMatch[1]);
  } else if (account.dateOpened) {
    // Use date opened as proxy if no DOFD
    dofd = account.dateOpened;
  }
  
  if (dofd && !isNaN(dofd.getTime())) {
    const now = new Date();
    const yearsSince = (now.getTime() - dofd.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearsSince > 7) {
      const yearsMonths = `${Math.floor(yearsSince)} years, ${Math.round((yearsSince % 1) * 12)} months`;
      conflicts.push({
        type: 'beyond_7_year',
        severity: 'critical',
        accountName,
        description: `FCRA 7-YEAR LIMIT EXCEEDED: Account is ${yearsMonths} old`,
        bureaus: [account.bureau],
        details: {
          dofd: dofd.toLocaleDateString(),
          yearsSince: yearsSince.toFixed(1),
        },
        fcraViolation: '§ 1681c(a)(4) - 7-year reporting limit',
        deletionProbability: 100,
        argument: `FCRA 7-YEAR LIMIT EXCEEDED:\n• Date of First Delinquency: ${dofd.toLocaleDateString()}\n• Current Date: ${now.toLocaleDateString()}\n• Time Elapsed: ${yearsMonths}\n\nUnder FCRA § 1681c(a)(4), negative information must be removed 7 years from the date of first delinquency. This account exceeds the legal limit and MUST be deleted immediately.`,
        methodNumber: 6,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 7: Inconsistent Charge-Off Dates
// ============================================
function detectInconsistentChargeoffDates(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const chargeoffDates: { bureau: string; date: Date }[] = [];
  
  for (const account of accounts) {
    const rawData = (account.rawData || '').toLowerCase();
    const chargeoffMatch = rawData.match(/charge[\s-]*off[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i);
    if (chargeoffMatch) {
      const date = new Date(chargeoffMatch[1]);
      if (!isNaN(date.getTime())) {
        chargeoffDates.push({ bureau: account.bureau, date });
      }
    }
  }
  
  if (chargeoffDates.length >= 2) {
    const dates = chargeoffDates.map(d => d.date.getTime());
    const maxDate = Math.max(...dates);
    const minDate = Math.min(...dates);
    const monthsDiff = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsDiff >= 1) {
      conflicts.push({
        type: 'inconsistent_chargeoff_dates',
        severity: 'high',
        accountName,
        description: `Inconsistent charge-off dates: ${monthsDiff}-month discrepancy`,
        bureaus: accounts.map(a => a.bureau),
        details: {
          dates: chargeoffDates.map(d => `${d.bureau}: ${d.date.toLocaleDateString()}`).join(', '),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Inaccurate information',
        deletionProbability: 80,
        argument: `INCONSISTENT CHARGE-OFF DATES:\n${chargeoffDates.map(d => `• ${d.bureau}: ${d.date.toLocaleDateString()}`).join('\n')}\n\nAn account has ONE charge-off date - it cannot be charged off in multiple different months. This ${monthsDiff}-month discrepancy proves inaccurate records.`,
        methodNumber: 7,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 8: Opening Date Conflicts with History
// ============================================
function detectOpeningDateConflicts(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Check for "first payment never received" with late payment history
  const firstPaymentNever = rawData.includes('first payment never') || rawData.includes('no payment received');
  const hasLatePayments = rawData.includes('30 days') || rawData.includes('60 days') || rawData.includes('90 days');
  
  if (firstPaymentNever && hasLatePayments) {
    conflicts.push({
      type: 'opening_date_conflicts',
      severity: 'high',
      accountName,
      description: 'Opening date conflicts: "First payment never received" but shows late payment history',
      bureaus: [account.bureau],
      details: {
        status: account.status,
        rawData: rawData.substring(0, 200),
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 80,
      argument: `CONTRADICTORY PAYMENT HISTORY:\nThe account shows "First payment never received" but also reports late payment history (30/60/90 days late).\n\nAn account cannot be "30 days late" if "first payment never received." These are mutually exclusive statuses that prove the data is fabricated or corrupted.`,
      methodNumber: 8,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 9: Closed Account Showing Activity
// ============================================
function detectClosedAccountActivity(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const status = account.status.toLowerCase();
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for closed date
  const closedMatch = rawData.match(/closed[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i);
  
  if (closedMatch && account.lastActivity) {
    const closedDate = new Date(closedMatch[1]);
    if (!isNaN(closedDate.getTime()) && account.lastActivity > closedDate) {
      const monthsAfter = Math.round((account.lastActivity.getTime() - closedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      conflicts.push({
        type: 'closed_account_activity',
        severity: 'high',
        accountName,
        description: `Closed account shows activity ${monthsAfter} months after closure`,
        bureaus: [account.bureau],
        details: {
          closedDate: closedDate.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Inaccurate information',
        deletionProbability: 85,
        argument: `ACTIVITY AFTER CLOSURE:\n• Date Closed: ${closedDate.toLocaleDateString()}\n• Last Activity: ${account.lastActivity.toLocaleDateString()}\n\nClosed accounts cannot have activity ${monthsAfter} months after closure. This is either re-aging or fraudulent reporting.`,
        methodNumber: 9,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 10: Future-Dated Entries
// ============================================
function detectFutureDatedEntries(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const now = new Date();
  
  if (account.lastActivity && account.lastActivity > now) {
    const daysFuture = Math.round((account.lastActivity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    conflicts.push({
      type: 'future_dated',
      severity: 'critical',
      accountName,
      description: `FUTURE-DATED ENTRY: Last Activity is ${daysFuture} days in the future`,
      bureaus: [account.bureau],
      details: {
        lastActivity: account.lastActivity.toLocaleDateString(),
        currentDate: now.toLocaleDateString(),
      },
      fcraViolation: '§ 1681i(a)(5)(A) - Impossible data',
      deletionProbability: 100,
      argument: `CRITICAL ERROR - FUTURE-DATED ENTRY:\n• Last Activity: ${account.lastActivity.toLocaleDateString()}\n• Current Date: ${now.toLocaleDateString()}\n\nThis account shows activity that hasn't occurred yet - ${daysFuture} days in the future. This proves data corruption or system error and requires immediate deletion.`,
      methodNumber: 10,
    });
  }
  
  if (account.dateOpened && account.dateOpened > now) {
    conflicts.push({
      type: 'future_dated',
      severity: 'critical',
      accountName,
      description: `FUTURE-DATED ENTRY: Date Opened is in the future`,
      bureaus: [account.bureau],
      details: {
        dateOpened: account.dateOpened.toLocaleDateString(),
        currentDate: now.toLocaleDateString(),
      },
      fcraViolation: '§ 1681i(a)(5)(A) - Impossible data',
      deletionProbability: 100,
      argument: `CRITICAL ERROR - Account shows opening date in the future. This is impossible and proves corrupted data.`,
      methodNumber: 10,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 11: Impossible Charge-Off Timeline
// ============================================
function detectImpossibleChargeoffTimeline(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for past due date and last activity
  const pastDueMatch = rawData.match(/past\s*due\s*(?:as\s*of)?[:\s]*(\w+\s+\d{4}|\d{1,2}[\/-]\d{2,4})/i);
  
  if (pastDueMatch && account.lastActivity) {
    const pastDueDate = new Date(pastDueMatch[1]);
    if (!isNaN(pastDueDate.getTime())) {
      const monthsDiff = (pastDueDate.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsDiff > 6) {
        conflicts.push({
          type: 'impossible_chargeoff_timeline',
          severity: 'critical',
          accountName,
          description: `Impossible charge-off timeline: Past due ${Math.round(monthsDiff)} months after last activity`,
          bureaus: [account.bureau],
          details: {
            pastDueDate: pastDueDate.toLocaleDateString(),
            lastActivity: account.lastActivity.toLocaleDateString(),
          },
          fcraViolation: '§ 1681i(a)(5)(A) - Impossible timeline',
          deletionProbability: 95,
          argument: `IMPOSSIBLE CHARGE-OFF TIMELINE:\n• Last Activity: ${account.lastActivity.toLocaleDateString()}\n• Past Due As Of: ${pastDueDate.toLocaleDateString()}\n\nAccount cannot have a "past due" status ${Math.round(monthsDiff)} months after its last activity. This impossible timeline renders the entry unverifiable.`,
          methodNumber: 11,
        });
      }
    }
  }
  return conflicts;
}

// ============================================
// METHOD 12: Payment Activity After Charge-Off
// ============================================
function detectPaymentAfterChargeoff(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  const chargeoffMatch = rawData.match(/charge[\s-]*off[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i);
  const paymentMatch = rawData.match(/payment[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i);
  
  if (chargeoffMatch && paymentMatch) {
    const chargeoffDate = new Date(chargeoffMatch[1]);
    const paymentDate = new Date(paymentMatch[1]);
    
    if (!isNaN(chargeoffDate.getTime()) && !isNaN(paymentDate.getTime()) && paymentDate > chargeoffDate) {
      conflicts.push({
        type: 'payment_after_chargeoff',
        severity: 'high',
        accountName,
        description: 'Payment activity reported after charge-off date',
        bureaus: [account.bureau],
        details: {
          chargeoffDate: chargeoffDate.toLocaleDateString(),
          paymentDate: paymentDate.toLocaleDateString(),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Inaccurate information',
        deletionProbability: 80,
        argument: `PAYMENT AFTER CHARGE-OFF:\n• Charge-Off Date: ${chargeoffDate.toLocaleDateString()}\n• Payment Date: ${paymentDate.toLocaleDateString()}\n\nCharged-off accounts are closed. They cannot accept payments after charge-off without a status change. This proves inaccurate reporting.`,
        methodNumber: 12,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 13: Inconsistent Delinquency Progression
// ============================================
function detectInconsistentDelinquency(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for delinquency pattern that skips or goes backwards
  const has30 = rawData.includes('30 day');
  const has60 = rawData.includes('60 day');
  const has90 = rawData.includes('90 day');
  const has120 = rawData.includes('120 day');
  
  // Check for skipped stages (e.g., 30 then 90 with no 60)
  if ((has30 && has90 && !has60) || (has60 && has120 && !has90)) {
    conflicts.push({
      type: 'inconsistent_delinquency',
      severity: 'high',
      accountName,
      description: 'Delinquency progression skips stages (30→90 without 60)',
      bureaus: [account.bureau],
      details: {
        has30, has60, has90, has120,
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 75,
      argument: `INCONSISTENT DELINQUENCY PROGRESSION:\nThe payment history shows delinquency that skips stages or goes backwards. Delinquency must progress 30→60→90→120 days. Skipping stages proves fabricated or corrupted data.`,
      methodNumber: 13,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 14: Account Age Exceeds Credit History
// ============================================
function detectAccountAgeExceedsHistory(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  // This would require knowing the consumer's credit history start date
  // For now, flag accounts opened before 2010 as potentially suspicious
  if (account.dateOpened) {
    const year = account.dateOpened.getFullYear();
    if (year < 2005) {
      conflicts.push({
        type: 'account_age_exceeds_history',
        severity: 'high',
        accountName,
        description: `Account opened in ${year} - verify this predates your credit history`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          year,
        },
        fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
        deletionProbability: 70,
        argument: `POTENTIAL MIXED FILE:\nThis account shows opening date of ${account.dateOpened.toLocaleDateString()} (${year}). If this predates your credit history or you were a minor at that time, this may be a mixed file error - information from a different consumer with a similar name.`,
        methodNumber: 14,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 15: Statute of Limitations Expired
// ============================================
function detectStatuteOfLimitations(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for last payment date
  const lastPaymentMatch = rawData.match(/last\s*payment[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i);
  
  if (lastPaymentMatch) {
    const lastPayment = new Date(lastPaymentMatch[1]);
    if (!isNaN(lastPayment.getTime())) {
      const now = new Date();
      const yearsSince = (now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      // Most states have 3-6 year SOL
      if (yearsSince > 4) {
        conflicts.push({
          type: 'statute_of_limitations',
          severity: 'medium',
          accountName,
          description: `Potential SOL expired: ${yearsSince.toFixed(1)} years since last payment`,
          bureaus: [account.bureau],
          details: {
            lastPayment: lastPayment.toLocaleDateString(),
            yearsSince: yearsSince.toFixed(1),
          },
          fcraViolation: 'State law + § 1681e(b)',
          deletionProbability: 60,
          argument: `STATUTE OF LIMITATIONS POTENTIALLY EXPIRED:\n• Last Payment: ${lastPayment.toLocaleDateString()}\n• Years Since: ${yearsSince.toFixed(1)}\n\nWhile time-barred debts can report for 7 years under FCRA, reporting them without notation that the debt is legally uncollectable may be misleading. Many furnishers agree to delete time-barred debts rather than report them inaccurately.`,
          methodNumber: 15,
        });
      }
    }
  }
  return conflicts;
}

// ============================================
// METHOD 16: Unverifiable Balance
// ============================================
function detectUnverifiableBalance(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  const noPaymentHistory = rawData.includes('first payment never') || 
                           rawData.includes('no payment') ||
                           !rawData.includes('payment history');
  
  if (noPaymentHistory && account.balance > 0) {
    conflicts.push({
      type: 'unverifiable_balance',
      severity: 'high',
      accountName,
      description: `Unverifiable balance: $${account.balance.toFixed(2)} with no payment history`,
      bureaus: [account.bureau],
      details: {
        balance: `$${account.balance.toFixed(2)}`,
        paymentHistory: 'None/First payment never received',
      },
      fcraViolation: '§ 1681i(a)(4) - Unverifiable information',
      deletionProbability: 80,
      argument: `UNVERIFIABLE BALANCE:\n• Balance: $${account.balance.toFixed(2)}\n• Payment History: "First payment never received" or no records\n\nWithout payment history, this balance cannot be verified. How was $${account.balance.toFixed(2)} calculated with zero payments? Under FCRA § 1681i(a)(4), unverifiable information must be deleted.`,
      methodNumber: 16,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 17: Balance Discrepancies Across Bureaus
// ============================================
function detectBalanceDiscrepancies(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const balances = accounts.map(a => ({ bureau: a.bureau, balance: a.balance }));
  const uniqueBalances = Array.from(new Set(balances.map(b => b.balance)));
  
  if (uniqueBalances.length > 1 && uniqueBalances.some(b => b > 0)) {
    const maxBalance = Math.max(...uniqueBalances);
    const minBalance = Math.min(...uniqueBalances.filter(b => b > 0));
    const discrepancy = maxBalance - minBalance;
    
    if (discrepancy > 100) {
      conflicts.push({
        type: 'balance',
        severity: discrepancy > 1000 ? 'critical' : 'high',
        accountName,
        description: `Balance discrepancy: $${discrepancy.toFixed(2)} difference across bureaus`,
        bureaus: accounts.map(a => a.bureau),
        details: {
          balances: balances.map(b => `${b.bureau}: $${b.balance.toFixed(2)}`).join(', '),
          discrepancy: `$${discrepancy.toFixed(2)}`,
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate information required',
        deletionProbability: Math.min(95, 70 + (discrepancy / 100)),
        argument: `IRRECONCILABLE BALANCE DISCREPANCY:\n${balances.map(b => `• ${b.bureau}: $${b.balance.toFixed(2)}`).join('\n')}\n\nThis debt cannot simultaneously be $${minBalance.toFixed(2)} AND $${maxBalance.toFixed(2)}. The $${discrepancy.toFixed(2)} discrepancy proves the furnisher lacks accurate records.`,
        methodNumber: 17,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 18: Balance Increases Post-Charge-Off
// ============================================
function detectBalanceIncreasePostChargeoff(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  const status = account.status.toLowerCase();
  
  if (status.includes('charge') || status.includes('written off')) {
    // Look for original balance vs current
    const originalMatch = rawData.match(/original[:\s]*\$?([\d,]+)/i);
    const chargeoffMatch = rawData.match(/charge[\s-]*off[:\s]*\$?([\d,]+)/i);
    
    if (originalMatch && account.balance) {
      const originalBalance = parseFloat(originalMatch[1].replace(/,/g, ''));
      if (account.balance > originalBalance) {
        const increase = account.balance - originalBalance;
        conflicts.push({
          type: 'balance_increase_post_chargeoff',
          severity: 'critical',
          accountName,
          description: `Balance increased $${increase.toFixed(2)} after charge-off`,
          bureaus: [account.bureau],
          details: {
            originalBalance: `$${originalBalance.toFixed(2)}`,
            currentBalance: `$${account.balance.toFixed(2)}`,
            increase: `$${increase.toFixed(2)}`,
          },
          fcraViolation: '§ 1681s-2(a)(1)(A) - Inaccurate information',
          deletionProbability: 90,
          argument: `ILLEGAL BALANCE INCREASE POST-CHARGE-OFF:\n• Original Balance: $${originalBalance.toFixed(2)}\n• Current Balance: $${account.balance.toFixed(2)}\n• Increase: $${increase.toFixed(2)}\n\nUnder GAAP, charged-off accounts are fixed amounts. Balance cannot increase after charge-off unless illegally adding unauthorized fees.`,
          methodNumber: 18,
        });
      }
    }
  }
  return conflicts;
}

// ============================================
// METHOD 19: Payment History Doesn't Support Balance
// ============================================
function detectPaymentHistoryMismatch(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for payment amounts
  const paymentsMatch = rawData.match(/(\d+)\s*payments?\s*(?:of|@)\s*\$?([\d,]+)/i);
  const originalMatch = rawData.match(/original[:\s]*\$?([\d,]+)/i);
  
  if (paymentsMatch && originalMatch && account.balance > 0) {
    const numPayments = parseInt(paymentsMatch[1]);
    const paymentAmount = parseFloat(paymentsMatch[2].replace(/,/g, ''));
    const originalBalance = parseFloat(originalMatch[1].replace(/,/g, ''));
    const totalPaid = numPayments * paymentAmount;
    const expectedBalance = originalBalance - totalPaid;
    
    if (account.balance > expectedBalance + 100) {
      conflicts.push({
        type: 'payment_history_mismatch',
        severity: 'high',
        accountName,
        description: `Payment math doesn't work: Expected ~$${expectedBalance.toFixed(2)}, showing $${account.balance.toFixed(2)}`,
        bureaus: [account.bureau],
        details: {
          originalBalance: `$${originalBalance.toFixed(2)}`,
          totalPaid: `$${totalPaid.toFixed(2)}`,
          expectedBalance: `$${expectedBalance.toFixed(2)}`,
          actualBalance: `$${account.balance.toFixed(2)}`,
        },
        fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
        deletionProbability: 80,
        argument: `PAYMENT HISTORY DOESN'T SUPPORT BALANCE:\n• Original: $${originalBalance.toFixed(2)}\n• Payments: ${numPayments} × $${paymentAmount.toFixed(2)} = $${totalPaid.toFixed(2)}\n• Expected Balance: $${expectedBalance.toFixed(2)}\n• Reported Balance: $${account.balance.toFixed(2)}\n\nThe math doesn't work. After $${totalPaid.toFixed(2)} in payments, balance should be ~$${expectedBalance.toFixed(2)}, not $${account.balance.toFixed(2)}.`,
        methodNumber: 19,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 20: Zero Balance Showing Negative
// ============================================
function detectZeroBalanceNegative(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const status = account.status.toLowerCase();
  
  if (account.balance === 0 && (status.includes('charge') || status.includes('collection') || status.includes('delinquent'))) {
    conflicts.push({
      type: 'zero_balance_negative',
      severity: 'medium',
      accountName,
      description: 'Zero balance but showing negative status',
      bureaus: [account.bureau],
      details: {
        balance: '$0',
        status: account.status,
      },
      fcraViolation: '§ 1681s-2(a)(1)(A) - Misleading information',
      deletionProbability: 65,
      argument: `ZERO BALANCE WITH NEGATIVE STATUS:\n• Balance: $0\n• Status: ${account.status}\n\nIf balance is $0, the account should report as "Paid" or "Closed," not as a negative item. This misleading reporting damages credit scores without justification.`,
      methodNumber: 20,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 21: Unverifiable Deficiency Balance
// ============================================
function detectUnverifiableDeficiency(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  const accountType = (account.accountType || '').toLowerCase();
  
  const isRepo = rawData.includes('repossess') || rawData.includes('repo') || accountType.includes('auto');
  const hasDeficiency = rawData.includes('deficiency') || (account.balance > 0 && isRepo);
  
  if (isRepo && hasDeficiency && account.balance > 0) {
    conflicts.push({
      type: 'unverifiable_deficiency',
      severity: 'high',
      accountName,
      description: `Unverifiable deficiency balance: $${account.balance.toFixed(2)} without sale documentation`,
      bureaus: [account.bureau],
      details: {
        balance: `$${account.balance.toFixed(2)}`,
        accountType: account.accountType || 'Auto/Repo',
      },
      fcraViolation: '§ 1681i(a)(4) - Unverifiable information',
      deletionProbability: 80,
      argument: `UNVERIFIABLE DEFICIENCY BALANCE:\n• Reported Deficiency: $${account.balance.toFixed(2)}\n\nUnder state law, creditor must provide: sale price, auction costs, and deficiency calculation. Without this documentation, the $${account.balance.toFixed(2)} deficiency is unverifiable and must be deleted.`,
      methodNumber: 21,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 22: Collection Exceeds Original Debt
// ============================================
function detectCollectionExceedsOriginal(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  const isCollection = (account.accountType || '').toLowerCase().includes('collection') || 
                       account.status.toLowerCase().includes('collection');
  
  if (isCollection) {
    const originalMatch = rawData.match(/original[:\s]*\$?([\d,]+)/i);
    if (originalMatch && account.balance > 0) {
      const originalBalance = parseFloat(originalMatch[1].replace(/,/g, ''));
      if (account.balance > originalBalance * 1.25) {
        const increase = account.balance - originalBalance;
        const percentIncrease = ((account.balance / originalBalance) - 1) * 100;
        conflicts.push({
          type: 'collection_exceeds_original',
          severity: 'high',
          accountName,
          description: `Collection exceeds original by ${percentIncrease.toFixed(0)}% ($${increase.toFixed(2)})`,
          bureaus: [account.bureau],
          details: {
            originalBalance: `$${originalBalance.toFixed(2)}`,
            collectionBalance: `$${account.balance.toFixed(2)}`,
            increase: `$${increase.toFixed(2)}`,
            percentIncrease: `${percentIncrease.toFixed(0)}%`,
          },
          fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate information required',
          deletionProbability: 80,
          argument: `COLLECTION EXCEEDS ORIGINAL DEBT:\n• Original Creditor Balance: $${originalBalance.toFixed(2)}\n• Collection Agency Balance: $${account.balance.toFixed(2)}\n• Markup: ${percentIncrease.toFixed(0)}% ($${increase.toFixed(2)})\n\nCollection agency cannot report higher balance without itemized breakdown of authorized fees/interest.`,
          methodNumber: 22,
        });
      }
    }
  }
  return conflicts;
}

// ============================================
// METHOD 23: Anomalous Utilization Rates
// ============================================
function detectAnomalousUtilization(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  const limitMatch = rawData.match(/(?:credit\s*)?limit[:\s]*\$?([\d,]+)/i);
  if (limitMatch && account.balance > 0) {
    const creditLimit = parseFloat(limitMatch[1].replace(/,/g, ''));
    if (creditLimit > 0) {
      const utilization = (account.balance / creditLimit) * 100;
      if (utilization > 100) {
        conflicts.push({
          type: 'anomalous_utilization',
          severity: 'medium',
          accountName,
          description: `Anomalous utilization: ${utilization.toFixed(0)}% (balance exceeds limit)`,
          bureaus: [account.bureau],
          details: {
            creditLimit: `$${creditLimit.toFixed(2)}`,
            balance: `$${account.balance.toFixed(2)}`,
            utilization: `${utilization.toFixed(0)}%`,
          },
          fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
          deletionProbability: 60,
          argument: `ANOMALOUS UTILIZATION RATE:\n• Credit Limit: $${creditLimit.toFixed(2)}\n• Reported Balance: $${account.balance.toFixed(2)}\n• Utilization: ${utilization.toFixed(0)}%\n\nCannot exceed 100% utilization unless over-limit was authorized. This requires explanation and documentation.`,
          methodNumber: 23,
        });
      }
    }
  }
  return conflicts;
}

// ============================================
// METHOD 24: Lack of Standing to Report
// ============================================
function detectLackOfStanding(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const isCollection = (account.accountType || '').toLowerCase().includes('collection') || 
                       account.status.toLowerCase().includes('collection');
  
  if (isCollection && account.balance > 0) {
    conflicts.push({
      type: 'lack_of_standing',
      severity: 'high',
      accountName,
      description: 'Collection agency must prove standing to report',
      bureaus: [account.bureau],
      details: {
        creditor: account.accountName,
        originalCreditor: account.originalCreditor || 'Not disclosed',
        balance: `$${account.balance.toFixed(2)}`,
      },
      fcraViolation: '§ 1681s-2(a)(2) - Furnisher must prove standing',
      deletionProbability: 75,
      argument: `LACK OF STANDING TO REPORT:\n• Collection Agency: ${account.accountName}\n• Original Creditor: ${account.originalCreditor || 'Not disclosed'}\n• Balance: $${account.balance.toFixed(2)}\n\nUnder FCRA § 1681s-2(a)(2), furnisher must prove standing. Collection agency must provide purchase agreement or assignment documentation proving they own this debt.`,
      methodNumber: 24,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 25: Original Creditor Not Reporting
// ============================================
function detectOriginalCreditorNotReporting(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const isCollection = (account.accountType || '').toLowerCase().includes('collection');
  
  if (isCollection && account.originalCreditor && account.balance > 0) {
    conflicts.push({
      type: 'original_creditor_not_reporting',
      severity: 'high',
      accountName,
      description: 'Collection reports debt that original creditor does not report',
      bureaus: [account.bureau],
      details: {
        collector: account.accountName,
        originalCreditor: account.originalCreditor,
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 75,
      argument: `ORIGINAL CREDITOR NOT REPORTING:\n• Collection Agency: ${account.accountName}\n• Claims Original Creditor: ${account.originalCreditor}\n\nIf the original creditor doesn't report this debt, it suggests the debt was invalid, settled, or doesn't exist. The collector cannot verify a debt the original creditor won't acknowledge.`,
      methodNumber: 25,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 26: Multiple Collectors Same Debt
// ============================================
function detectMultipleCollectors(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const collections = accounts.filter(a => 
    (a.accountType || '').toLowerCase().includes('collection') ||
    a.status.toLowerCase().includes('collection')
  );
  
  if (collections.length >= 2) {
    // Check if same original creditor
    const originalCreditors = collections.map(a => a.originalCreditor).filter(Boolean);
    const uniqueOriginals = Array.from(new Set(originalCreditors));
    
    if (uniqueOriginals.length === 1 || collections.every(c => Math.abs(c.balance - collections[0].balance) < 100)) {
      conflicts.push({
        type: 'multiple_collectors',
        severity: 'high',
        accountName,
        description: 'Same debt reported by multiple collection agencies',
        bureaus: accounts.map(a => a.bureau),
        details: {
          collectors: collections.map(c => c.accountName).join(', '),
          balances: collections.map(c => `$${c.balance.toFixed(2)}`).join(', '),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Double reporting',
        deletionProbability: 85,
        argument: `MULTIPLE COLLECTORS - SAME DEBT:\n${collections.map(c => `• ${c.accountName}: $${c.balance.toFixed(2)}`).join('\n')}\n\nThis is double reporting/credit stacking. The same debt cannot be reported by multiple collectors. One or more entries must be deleted.`,
        methodNumber: 26,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 27: Creditor Name Inconsistencies
// ============================================
function detectCreditorNameInconsistencies(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const names = accounts.map(a => ({ bureau: a.bureau, name: a.accountName }));
  const uniqueNames = Array.from(new Set(names.map(n => n.name.toUpperCase())));
  
  if (uniqueNames.length > 1) {
    // Check if names are significantly different (not just abbreviations)
    const normalized = uniqueNames.map(n => n.replace(/[^A-Z]/g, ''));
    const allSimilar = normalized.every(n => normalized[0].includes(n.substring(0, 5)) || n.includes(normalized[0].substring(0, 5)));
    
    if (!allSimilar) {
      conflicts.push({
        type: 'creditor_name_inconsistencies',
        severity: 'high',
        accountName,
        description: 'Creditor name varies significantly across bureaus',
        bureaus: accounts.map(a => a.bureau),
        details: {
          names: names.map(n => `${n.bureau}: "${n.name}"`).join(', '),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate information required',
        deletionProbability: 75,
        argument: `CREDITOR NAME INCONSISTENCIES:\n${names.map(n => `• ${n.bureau}: "${n.name}"`).join('\n')}\n\nAccount cannot be verified when creditor name varies significantly. This creates ambiguity about the actual owner/reporter.`,
        methodNumber: 27,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 28: Mixed Files / Wrong Consumer
// ============================================
function detectMixedFiles(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  // This would require consumer input to verify
  // Flag accounts with unusual characteristics
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for state indicators that might not match consumer's history
  const stateMatch = rawData.match(/\b(california|texas|florida|new york|illinois)\b/i);
  
  if (stateMatch && account.balance > 5000) {
    conflicts.push({
      type: 'mixed_files',
      severity: 'critical',
      accountName,
      description: `Verify this account belongs to you (shows ${stateMatch[1]} connection)`,
      bureaus: [account.bureau],
      details: {
        stateIndicator: stateMatch[1],
        balance: `$${account.balance.toFixed(2)}`,
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 85,
      argument: `POTENTIAL MIXED FILE:\nThis account shows a connection to ${stateMatch[1]}. If you have never lived in ${stateMatch[1]} or had accounts there, this may be a mixed file error - information from a different consumer with a similar name.\n\nUnder § 1681e(b), bureaus must follow reasonable procedures to ensure maximum possible accuracy.`,
      methodNumber: 28,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 29: Duplicate Reporting
// ============================================
function detectDuplicateAccounts(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Check for same bureau reporting same account multiple times
  const byBureau: Record<string, ParsedAccount[]> = {};
  for (const account of accounts) {
    if (!byBureau[account.bureau]) byBureau[account.bureau] = [];
    byBureau[account.bureau].push(account);
  }
  
  for (const [bureau, bureauAccounts] of Object.entries(byBureau)) {
    if (bureauAccounts.length >= 2) {
      // Check if balances are identical or very close
      const balances = bureauAccounts.map(a => a.balance);
      const allSimilar = balances.every(b => Math.abs(b - balances[0]) < 50);
      
      if (allSimilar) {
        conflicts.push({
          type: 'duplicate',
          severity: 'high',
          accountName,
          description: `Duplicate reporting: ${bureauAccounts.length} instances on ${bureau}`,
          bureaus: [bureau],
          details: {
            instances: bureauAccounts.length,
            balances: balances.map(b => `$${b.toFixed(2)}`).join(', '),
          },
          fcraViolation: '§ 1681s-2(a)(1)(A) - Double reporting',
          deletionProbability: 85,
          argument: `DUPLICATE REPORTING:\n${bureau} shows ${bureauAccounts.length} instances of this account with similar balances.\n\nThis is unlikely to be ${bureauAccounts.length} separate legitimate accounts. This is duplicate reporting of a single debt, artificially inflating the negative impact on the credit score.`,
          methodNumber: 29,
        });
      }
    }
  }
  return conflicts;
}

// ============================================
// METHOD 30: Status Corrections (Paid Accounts Showing Negative)
// ============================================
function detectStatusCorrections(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const status = account.status.toLowerCase();
  const rawData = (account.rawData || '').toLowerCase();
  
  const isPaid = account.balance === 0 || rawData.includes('paid') || rawData.includes('settled');
  const isNegative = status.includes('charge') || status.includes('collection') || status.includes('delinquent');
  const hasGoodHistory = rawData.includes('100%') || rawData.includes('never late') || rawData.includes('on time');
  
  if (isPaid && isNegative && hasGoodHistory) {
    conflicts.push({
      type: 'status_correction',
      severity: 'medium',
      accountName,
      description: 'Paid account with good history showing negative status',
      bureaus: [account.bureau],
      details: {
        balance: `$${account.balance.toFixed(2)}`,
        status: account.status,
      },
      fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate status required',
      deletionProbability: 70,
      argument: `STATUS CORRECTION NEEDED:\n• Balance: $${account.balance.toFixed(2)} (Paid)\n• Payment History: Good standing\n• Current Status: ${account.status}\n\nPaid accounts with perfect payment history should report as "Positive Closure" or "Account Closed in Good Standing," not as a negative item.`,
      methodNumber: 30,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 31: Contradictory Status Designations
// ============================================
function detectContradictoryStatus(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const status = account.status.toLowerCase();
  const rawData = (account.rawData || '').toLowerCase();
  
  const isChargeOff = status.includes('charge') || rawData.includes('charge off');
  const isGoodStanding = status.includes('good standing') || rawData.includes('current') || rawData.includes('pays as agreed');
  const isOpen = status.includes('open') && !status.includes('closed');
  
  if ((isChargeOff && isGoodStanding) || (isChargeOff && isOpen)) {
    conflicts.push({
      type: 'contradictory_status',
      severity: 'high',
      accountName,
      description: 'Contradictory status: Account shows mutually exclusive statuses',
      bureaus: [account.bureau],
      details: {
        status: account.status,
        rawData: rawData.substring(0, 200),
      },
      fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate information required',
      deletionProbability: 80,
      argument: `CONTRADICTORY STATUS DESIGNATIONS:\nThis account shows mutually exclusive statuses:\n• ${account.status}\n\nAn account cannot be both "charged off" (worst status) and "good standing" or "open" simultaneously. This contradiction proves the data is unreliable.`,
      methodNumber: 31,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 32: Incorrect Account Type Classification
// ============================================
function detectIncorrectAccountType(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const accountType = (account.accountType || '').toLowerCase();
  const rawData = (account.rawData || '').toLowerCase();
  
  // Check for mismatched types
  const isChildSupport = rawData.includes('child support') || rawData.includes('support');
  const isCollection = accountType.includes('collection');
  
  if (isChildSupport && isCollection) {
    conflicts.push({
      type: 'incorrect_account_type',
      severity: 'high',
      accountName,
      description: 'Incorrect account type: Child support classified as collection',
      bureaus: [account.bureau],
      details: {
        reportedType: account.accountType,
        actualType: 'Government obligation (Child Support)',
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 75,
      argument: `INCORRECT ACCOUNT TYPE CLASSIFICATION:\n• Reported As: ${account.accountType || 'Collection'}\n• Actual Type: Government obligation (Child Support)\n\nChild support is a government obligation, not a private collection account. Reporting it as both creates legal ambiguity and misrepresents the nature of the obligation.`,
      methodNumber: 32,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 33: Late Payments After Payoff
// ============================================
function detectLatePaymentsAfterPayoff(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for paid date and late payments after
  const paidMatch = rawData.match(/paid[:\s]*(\w+\s+\d{4}|\d{1,2}[\/-]\d{2,4})/i);
  const lateMatch = rawData.match(/(\d+)\s*days?\s*late[:\s]*(\w+\s+\d{4}|\d{1,2}[\/-]\d{2,4})/i);
  
  if (paidMatch && lateMatch) {
    const paidDate = new Date(paidMatch[1]);
    const lateDate = new Date(lateMatch[2]);
    
    if (!isNaN(paidDate.getTime()) && !isNaN(lateDate.getTime()) && lateDate > paidDate) {
      conflicts.push({
        type: 'late_payments_after_payoff',
        severity: 'high',
        accountName,
        description: 'Late payments reported after account was paid off',
        bureaus: [account.bureau],
        details: {
          paidDate: paidDate.toLocaleDateString(),
          lateDate: lateDate.toLocaleDateString(),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Impossible timeline',
        deletionProbability: 85,
        argument: `LATE PAYMENTS AFTER PAYOFF:\n• Date Paid: ${paidDate.toLocaleDateString()}\n• Late Payment Reported: ${lateDate.toLocaleDateString()}\n\nCannot show late payments AFTER account was paid off. Late payments after payoff date is an impossible timeline.`,
        methodNumber: 33,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 34: Disputed Status Not Reflected
// ============================================
function detectDisputedStatusNotReflected(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  const isDisputed = rawData.includes('disputed') || rawData.includes('consumer disputes');
  const isVerified = rawData.includes('verified') || rawData.includes('accurate');
  
  if (isDisputed && isVerified) {
    conflicts.push({
      type: 'disputed_status_not_reflected',
      severity: 'medium',
      accountName,
      description: 'Account shows "Disputed" but also reported as "Verified"',
      bureaus: [account.bureau],
      details: {
        status: account.status,
      },
      fcraViolation: '§ 1681i(a)(3) - Disputed status must be noted',
      deletionProbability: 65,
      argument: `DISPUTED STATUS NOT PROPERLY REFLECTED:\nThe account shows "Disputed by Consumer" notation but is also reported as "Verified as accurate."\n\nUnder FCRA § 1681i(a)(3), when an account is under dispute, the bureau must note "Disputed" status prominently. Reporting as verified while showing disputed notation is contradictory.`,
      methodNumber: 34,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 35: Account Number Conflicts
// ============================================
function detectAccountNumberConflicts(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const accountNumbers = accounts
    .filter(a => a.accountNumber)
    .map(a => ({ bureau: a.bureau, number: a.accountNumber! }));
  
  if (accountNumbers.length >= 2) {
    const uniqueNumbers = Array.from(new Set(accountNumbers.map(n => n.number)));
    if (uniqueNumbers.length > 1) {
      conflicts.push({
        type: 'account_number_conflicts',
        severity: 'high',
        accountName,
        description: 'Account number varies across bureaus',
        bureaus: accounts.map(a => a.bureau),
        details: {
          numbers: accountNumbers.map(n => `${n.bureau}: ${n.number}`).join(', '),
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate information required',
        deletionProbability: 80,
        argument: `ACCOUNT NUMBER CONFLICTS:\n${accountNumbers.map(n => `• ${n.bureau}: ${n.number}`).join('\n')}\n\nAccount number discrepancy makes verification impossible. Cannot confirm if this is the same account or two different accounts.`,
        methodNumber: 35,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 36: Same Account Number Different Debts
// ============================================
function detectSameNumberDifferentDebts(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for multiple debt types with same account number
  const types: string[] = [];
  if (rawData.includes('child support')) types.push('Child Support');
  if (rawData.includes('collection')) types.push('Collection');
  if (rawData.includes('open account')) types.push('Open Account');
  if (rawData.includes('installment')) types.push('Installment');
  
  if (types.length >= 2) {
    conflicts.push({
      type: 'same_number_different_debts',
      severity: 'high',
      accountName,
      description: `Same account number used for different debt types: ${types.join(', ')}`,
      bureaus: [account.bureau],
      details: {
        types,
        accountNumber: account.accountNumber,
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 80,
      argument: `SAME ACCOUNT NUMBER - DIFFERENT DEBTS:\nAccount #${account.accountNumber || 'XXXXX'} appears as:\n${types.map(t => `• ${t}`).join('\n')}\n\nSame account number cannot represent different types of debt. This suggests database corruption, account number recycling, or mixed file error.`,
      methodNumber: 36,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 37: Failure to Provide MOV
// ============================================
function detectFailureToProvideMOV(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Check if previously disputed and verified without MOV
  const previouslyDisputed = rawData.includes('previously disputed') || rawData.includes('dispute');
  const verified = rawData.includes('verified');
  
  if (previouslyDisputed && verified) {
    conflicts.push({
      type: 'failure_to_provide_mov',
      severity: 'high',
      accountName,
      description: 'Bureau verified without providing Method of Verification',
      bureaus: [account.bureau],
      details: {
        status: 'Previously disputed, verified without MOV',
      },
      fcraViolation: '§ 1681i(a)(7) - Right to MOV',
      deletionProbability: 75,
      argument: `FAILURE TO PROVIDE METHOD OF VERIFICATION:\nThis account was previously disputed and the bureau responded "Verified as accurate" without providing:\n1. Who they contacted\n2. What documentation was reviewed\n3. What verification process was used\n\nUnder FCRA § 1681i(a)(7), you have the right to request the method of verification. Without MOV, you cannot confirm "verification" actually occurred.`,
      methodNumber: 37,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 38: Inadequate Reinvestigation
// ============================================
function detectInadequateReinvestigation(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Check for verified but issues remain
  const verified = rawData.includes('verified');
  const hasImpossibleTimeline = account.lastActivity && account.dateOpened && account.lastActivity < account.dateOpened;
  
  if (verified && hasImpossibleTimeline) {
    conflicts.push({
      type: 'inadequate_reinvestigation',
      severity: 'high',
      accountName,
      description: 'Bureau "verified" account but impossible timeline still exists',
      bureaus: [account.bureau],
      details: {
        issue: 'Impossible timeline not addressed',
        dateOpened: account.dateOpened?.toLocaleDateString(),
        lastActivity: account.lastActivity?.toLocaleDateString(),
      },
      fcraViolation: '§ 1681i(a)(1)(A) - Adequate reinvestigation required',
      deletionProbability: 80,
      argument: `INADEQUATE REINVESTIGATION:\nThe bureau "verified" this account, but the impossible timeline still exists:\n• Date Opened: ${account.dateOpened?.toLocaleDateString()}\n• Last Activity: ${account.lastActivity?.toLocaleDateString()}\n\nThe bureau's "verification" did not address the specific dispute raised. This constitutes inadequate reinvestigation under § 1681i(a)(1)(A). The fact that the impossible timeline still exists proves no actual investigation occurred.`,
      methodNumber: 38,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 39: Impossible Payment Patterns
// ============================================
function detectImpossiblePaymentPatterns(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for perfect payment patterns (same amount, same date, no variation)
  const paymentPattern = rawData.match(/(\$\d+)\s*(?:monthly|every month|×\s*\d+\s*months)/i);
  
  if (paymentPattern && (rawData.includes('24 month') || rawData.includes('36 month'))) {
    conflicts.push({
      type: 'impossible_payment_patterns',
      severity: 'medium',
      accountName,
      description: 'Impossibly perfect payment pattern (no human variation)',
      bureaus: [account.bureau],
      details: {
        pattern: paymentPattern[0],
      },
      fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
      deletionProbability: 60,
      argument: `IMPOSSIBLY PERFECT PAYMENT PATTERN:\nThe payment history shows exactly the same amount every month for an extended period with no variation.\n\nReal human payment behavior shows variation. Perfect patterns often indicate:\n1. Fabricated payment history\n2. Automated reporting without real data\n3. Template-based rather than actual records`,
      methodNumber: 39,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 40: High Concentration Single Day
// ============================================
function detectHighConcentrationSingleDay(accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Group by opening date
  const byDate: Record<string, ParsedAccount[]> = {};
  for (const account of accounts) {
    if (account.dateOpened) {
      const dateKey = account.dateOpened.toISOString().split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(account);
    }
  }
  
  for (const [date, dateAccounts] of Object.entries(byDate)) {
    if (dateAccounts.length >= 3) {
      const totalBalance = dateAccounts.reduce((sum, a) => sum + a.balance, 0);
      conflicts.push({
        type: 'high_concentration_single_day',
        severity: 'high',
        accountName: `${dateAccounts.length} accounts opened ${date}`,
        description: `${dateAccounts.length} accounts totaling $${totalBalance.toFixed(2)} opened on same day`,
        bureaus: Array.from(new Set(dateAccounts.map(a => a.bureau))),
        details: {
          date,
          count: dateAccounts.length,
          totalBalance: `$${totalBalance.toFixed(2)}`,
          accounts: dateAccounts.map(a => a.accountName).join(', '),
        },
        fcraViolation: '§ 1681e(b) - Maximum possible accuracy',
        deletionProbability: 75,
        argument: `HIGH CONCENTRATION - SINGLE DAY:\nAccounts opened on ${date}:\n${dateAccounts.map(a => `• ${a.accountName}: $${a.balance.toFixed(2)}`).join('\n')}\nTotal: $${totalBalance.toFixed(2)}\n\nOpening ${dateAccounts.length} accounts in a single day totaling $${totalBalance.toFixed(2)} is:\n1. Highly unusual consumer behavior\n2. Potential identity fraud indicator\n3. May indicate synthetic identity\n\nThis pattern demands enhanced verification.`,
        methodNumber: 40,
      });
    }
  }
  return conflicts;
}

// ============================================
// METHOD 41: Synchronized Late Payments
// ============================================
function detectSynchronizedLatePayments(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  // This would need multiple accounts to compare - handled in cross-bureau section
  return conflicts;
}

// ============================================
// METHOD 42: Inquiry Without Permissible Purpose
// ============================================
function detectInquiryWithoutPurpose(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const accountType = (account.accountType || '').toLowerCase();
  
  if (accountType.includes('inquiry') || accountType.includes('hard pull')) {
    conflicts.push({
      type: 'inquiry_without_purpose',
      severity: 'medium',
      accountName,
      description: 'Verify this inquiry was authorized',
      bureaus: [account.bureau],
      details: {
        inquiryName: account.accountName,
        date: account.dateOpened?.toLocaleDateString(),
      },
      fcraViolation: '§ 1681b - Permissible purpose required',
      deletionProbability: 60,
      argument: `INQUIRY WITHOUT PERMISSIBLE PURPOSE:\n• Inquiry From: ${account.accountName}\n• Date: ${account.dateOpened?.toLocaleDateString() || 'Unknown'}\n\nIf you did not apply for credit with this company, this inquiry may lack permissible purpose under FCRA § 1681b. Unauthorized inquiries may indicate identity theft.`,
      methodNumber: 42,
    });
  }
  return conflicts;
}

// ============================================
// METHOD 43: Written-Off Amount Conflicts
// ============================================
function detectWrittenOffAmountConflicts(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];
  const rawData = (account.rawData || '').toLowerCase();
  
  // Look for written off amount
  const writtenOffMatch = rawData.match(/written\s*off[:\s]*\$?([\d,]+)/i);
  const pastDueMatch = rawData.match(/past\s*due[:\s]*\$?([\d,]+)/i);
  
  if (writtenOffMatch && account.balance > 0) {
    const writtenOff = parseFloat(writtenOffMatch[1].replace(/,/g, ''));
    const pastDue = pastDueMatch ? parseFloat(pastDueMatch[1].replace(/,/g, '')) : null;
    
    // Check if all three numbers are different
    const amounts = [writtenOff, account.balance];
    if (pastDue) amounts.push(pastDue);
    const uniqueAmounts = Array.from(new Set(amounts));
    
    if (uniqueAmounts.length >= 2 && Math.abs(writtenOff - account.balance) > 100) {
      conflicts.push({
        type: 'written_off_amount_conflicts',
        severity: 'high',
        accountName,
        description: `Written-off amount conflicts: $${writtenOff.toFixed(2)} written off vs $${account.balance.toFixed(2)} balance`,
        bureaus: [account.bureau],
        details: {
          writtenOff: `$${writtenOff.toFixed(2)}`,
          currentBalance: `$${account.balance.toFixed(2)}`,
          pastDue: pastDue ? `$${pastDue.toFixed(2)}` : 'N/A',
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Accurate information required',
        deletionProbability: 80,
        argument: `WRITTEN-OFF AMOUNT CONFLICTS:\n• Written Off: $${writtenOff.toFixed(2)}\n• Current Balance: $${account.balance.toFixed(2)}${pastDue ? `\n• Past Due: $${pastDue.toFixed(2)}` : ''}\n\nThree different dollar amounts for the same account. Which is accurate? This inconsistency proves unreliable data.`,
        methodNumber: 43,
      });
    }
  }
  return conflicts;
}

// ============================================
// GENERATE MULTI-ANGLE ARGUMENT
// ============================================
export function generateMultiAngleArgument(accountName: string, conflicts: Conflict[]): string {
  if (conflicts.length === 0) return '';

  const critical = conflicts.filter(c => c.severity === 'critical');
  const high = conflicts.filter(c => c.severity === 'high');
  const medium = conflicts.filter(c => c.severity === 'medium');

  let argument = '';

  if (critical.length > 0) {
    argument += '**CRITICAL ERRORS REQUIRING IMMEDIATE DELETION:**\n\n';
    critical.forEach((c, i) => {
      argument += `${i + 1}. [Method ${c.methodNumber || '?'}] ${c.argument || c.description}\n\n`;
    });
  }

  if (high.length > 0) {
    argument += '**HIGH PRIORITY VIOLATIONS:**\n\n';
    high.forEach((c, i) => {
      argument += `${i + 1}. [Method ${c.methodNumber || '?'}] ${c.argument || c.description}\n\n`;
    });
  }

  if (medium.length > 0) {
    argument += '**ADDITIONAL ISSUES:**\n\n';
    medium.forEach((c, i) => {
      argument += `${i + 1}. [Method ${c.methodNumber || '?'}] ${c.argument || c.description}\n\n`;
    });
  }

  const totalViolations = conflicts.length;
  const methodsUsed = Array.from(new Set(conflicts.map(c => c.methodNumber).filter(Boolean)));
  
  argument += `\n**SUMMARY:** This account has ${totalViolations} documented violation${totalViolations > 1 ? 's' : ''} across ${methodsUsed.length} of our 43 detection methods. `;
  
  if (critical.length > 0) {
    argument += `The ${critical.length} CRITICAL error${critical.length > 1 ? 's' : ''} ALONE require${critical.length === 1 ? 's' : ''} immediate deletion. `;
  }
  
  argument += `Under FCRA § 1681i(a)(5)(A), you must delete this account within 30 days or face legal consequences.\n`;

  return argument;
}
