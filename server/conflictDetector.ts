/**
 * Cross-Bureau Conflict Detection Engine
 * 
 * Detects conflicts and inconsistencies across credit bureaus
 * These conflicts are the strongest arguments for deletion
 */

import type { ParsedAccount } from './creditReportParser';

export interface Conflict {
  type: 'balance' | 'status' | 'date' | 're-aging' | 'impossible_timeline' | 'unverifiable_balance' | 'duplicate' | 'status_correction' | 'previously_disputed' | 'missing_documentation';
  severity: 'critical' | 'high' | 'medium';
  accountName: string;
  description: string;
  bureaus: string[];
  details: Record<string, any>;
  fcraViolation: string;
  deletionProbability: number; // 0-100%
  argument?: string; // Full legal argument for this violation
}

export interface ConflictAnalysis {
  conflicts: Conflict[];
  totalConflicts: number;
  criticalConflicts: number;
  highPriorityConflicts: number;
  estimatedDeletions: number;
}

/**
 * Detect all conflicts across bureaus for a set of accounts
 */
export function detectConflicts(accounts: ParsedAccount[]): ConflictAnalysis {
  const conflicts: Conflict[] = [];

  // Group accounts by name (same account across bureaus)
  const accountGroups = groupAccountsByName(accounts);

  for (const [accountName, groupAccounts] of Object.entries(accountGroups)) {
    if (groupAccounts.length < 2) continue; // Need at least 2 bureaus to compare

    // Detect balance discrepancies
    const balanceConflicts = detectBalanceDiscrepancies(accountName, groupAccounts);
    conflicts.push(...balanceConflicts);

    // Detect status conflicts
    const statusConflicts = detectStatusConflicts(accountName, groupAccounts);
    conflicts.push(...statusConflicts);

    // Detect date conflicts
    const dateConflicts = detectDateConflicts(accountName, groupAccounts);
    conflicts.push(...dateConflicts);

    // Detect re-aging violations
    const reAgingConflicts = detectReAgingViolations(accountName, groupAccounts);
    conflicts.push(...reAgingConflicts);

    // Detect impossible timelines
    const timelineConflicts = detectImpossibleTimelines(accountName, groupAccounts);
    conflicts.push(...timelineConflicts);

    // Detect unverifiable balances
    const unverifiableConflicts = detectUnverifiableBalances(accountName, groupAccounts);
    conflicts.push(...unverifiableConflicts);

    // Detect duplicate accounts
    const duplicateConflicts = detectDuplicateAccounts(accountName, groupAccounts);
    conflicts.push(...duplicateConflicts);

    // Detect status corrections needed (paid accounts showing negative)
    const statusCorrectionConflicts = detectStatusCorrections(accountName, groupAccounts);
    conflicts.push(...statusCorrectionConflicts);

    // Detect previously disputed accounts still showing errors
    const previouslyDisputedConflicts = detectPreviouslyDisputed(accountName, groupAccounts);
    conflicts.push(...previouslyDisputedConflicts);
  }

  // Also check single-bureau accounts for violations
  for (const [accountName, groupAccounts] of Object.entries(accountGroups)) {
    // These violations can be detected on single accounts
    for (const account of groupAccounts) {
      const singleAccountConflicts = detectSingleAccountViolations(accountName, account);
      conflicts.push(...singleAccountConflicts);
    }
  }

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
  };
}

/**
 * Group accounts by name (fuzzy matching to handle variations)
 */
function groupAccountsByName(accounts: ParsedAccount[]): Record<string, ParsedAccount[]> {
  const groups: Record<string, ParsedAccount[]> = {};

  for (const account of accounts) {
    // Normalize account name for grouping
    const normalizedName = normalizeAccountName(account.accountName);
    
    if (!groups[normalizedName]) {
      groups[normalizedName] = [];
    }
    groups[normalizedName].push(account);
  }

  return groups;
}

/**
 * Normalize account name for comparison
 */
function normalizeAccountName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/INC|LLC|CORP|COMPANY|CO/g, '')
    .trim();
}

/**
 * Detect balance discrepancies across bureaus - CRITICAL for A+ letters
 */
function detectBalanceDiscrepancies(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const balances = accounts.map(a => ({ bureau: a.bureau, balance: a.balance }));
  
  // Check if balances differ
  const uniqueBalances = Array.from(new Set(balances.map(b => b.balance)));
  
  if (uniqueBalances.length > 1 && uniqueBalances.some(b => b > 0)) {
    const maxBalance = Math.max(...uniqueBalances);
    const minBalance = Math.min(...uniqueBalances.filter(b => b > 0));
    const discrepancy = maxBalance - minBalance;

    if (discrepancy > 50) { // Report any significant discrepancy
      // Determine severity based on discrepancy amount
      const severity = discrepancy > 1000 ? 'critical' : discrepancy > 500 ? 'high' : 'medium';
      
      // Build detailed balance breakdown
      const balanceBreakdown = balances
        .filter(b => b.balance > 0)
        .map(b => `• ${b.bureau} reports: $${b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
        .join('\n');
      
      conflicts.push({
        type: 'balance',
        severity,
        accountName,
        description: `IRRECONCILABLE BALANCE DISCREPANCY - $${discrepancy.toLocaleString('en-US', { minimumFractionDigits: 2 })} difference across bureaus`,
        bureaus: accounts.map(a => a.bureau),
        details: {
          balances: balances.map(b => `${b.bureau}: $${b.balance.toFixed(2)}`).join(', '),
          discrepancy: `$${discrepancy.toFixed(2)}`,
          maxBalance: `$${maxBalance.toFixed(2)}`,
          minBalance: `$${minBalance.toFixed(2)}`,
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Furnisher must report accurate information',
        deletionProbability: Math.min(95, 70 + (discrepancy / 100)),
        argument: `IRRECONCILABLE BALANCE DISCREPANCY - INDEFENSIBLE:\n${balanceBreakdown}\n= $${discrepancy.toLocaleString('en-US', { minimumFractionDigits: 2 })} balance discrepancy\n\nA debt cannot simultaneously be $${minBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} AND $${maxBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}. At least one bureau is reporting inaccurate information. Under FCRA § 1681s-2(a)(1)(A), furnishers must report accurate information. This $${discrepancy.toLocaleString('en-US', { minimumFractionDigits: 2 })} discrepancy proves the data is unverifiable and must be deleted from ALL bureaus.`,
      });
    }
  }

  return conflicts;
}

/**
 * Detect status conflicts across bureaus
 */
function detectStatusConflicts(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const statuses = accounts.map(a => ({ bureau: a.bureau, status: a.status.toLowerCase() }));
  
  // Check for contradictory statuses
  const hasChargeOff = statuses.some(s => s.status.includes('charge off') || s.status.includes('charged off'));
  const hasGoodStanding = statuses.some(s => s.status.includes('good standing') || s.status.includes('current'));
  const hasOpen = statuses.some(s => s.status.includes('open') && !s.status.includes('charge'));
  const hasClosed = statuses.some(s => s.status.includes('closed') || s.status.includes('charge off'));

  if ((hasChargeOff && hasGoodStanding) || (hasChargeOff && hasOpen) || (hasOpen && hasClosed)) {
    conflicts.push({
      type: 'status',
      severity: 'critical',
      accountName,
      description: 'Contradictory account status across bureaus',
      bureaus: accounts.map(a => a.bureau),
      details: {
        statuses: statuses.map(s => `${s.bureau}: ${s.status}`).join(', '),
      },
      fcraViolation: '§ 1681s-2(a)(1)(A) - Account cannot have contradictory statuses',
      deletionProbability: 85,
    });
  }

  return conflicts;
}

/**
 * Detect date conflicts across bureaus
 */
function detectDateConflicts(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Check last activity dates
  const lastActivityDates = accounts
    .filter(a => a.lastActivity)
    .map(a => ({ bureau: a.bureau, date: a.lastActivity! }));

  if (lastActivityDates.length >= 2) {
    const dates = lastActivityDates.map(d => d.date.getTime());
    const maxDate = Math.max(...dates);
    const minDate = Math.min(...dates);
    const diffMonths = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths > 6) { // More than 6 months difference
      conflicts.push({
        type: 'date',
        severity: diffMonths > 12 ? 'critical' : 'high',
        accountName,
        description: `Last activity dates differ by ${Math.round(diffMonths)} months`,
        bureaus: lastActivityDates.map(d => d.bureau),
        details: {
          dates: lastActivityDates.map(d => `${d.bureau}: ${d.date.toLocaleDateString()}`).join(', '),
          differenceMonths: Math.round(diffMonths),
        },
        fcraViolation: '§ 1681s-2(a)(5) - Illegal re-aging violation',
        deletionProbability: Math.min(90, 65 + diffMonths * 2),
      });
    }
  }

  return conflicts;
}

/**
 * Detect re-aging violations (activity after charge-off/surrender)
 */
function detectReAgingViolations(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    if (!account.dateOpened || !account.lastActivity) continue;

    const monthsSinceOpened = (account.lastActivity.getTime() - account.dateOpened.getTime()) / (1000 * 60 * 60 * 24 * 30);

    // If account shows activity many years after opening (especially for charge-offs)
    if (monthsSinceOpened > 24 && account.status.toLowerCase().includes('charge')) {
      conflicts.push({
        type: 're-aging',
        severity: 'critical',
        accountName,
        description: `Activity reported ${Math.round(monthsSinceOpened)} months after account opening`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
          monthsDifference: Math.round(monthsSinceOpened),
        },
        fcraViolation: '§ 1681s-2(a)(5) - Illegal re-aging of debt',
        deletionProbability: 80,
      });
    }
  }

  return conflicts;
}

/**
 * Detect impossible timelines (activity before account opened)
 */
function detectImpossibleTimelines(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    if (!account.dateOpened || !account.lastActivity) continue;

    // Check if last activity is BEFORE date opened
    if (account.lastActivity < account.dateOpened) {
      const daysDifference = Math.round((account.dateOpened.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      conflicts.push({
        type: 'impossible_timeline',
        severity: 'critical',
        accountName,
        description: `Activity reported ${daysDifference} days BEFORE account was opened`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
          daysDifference,
        },
        fcraViolation: '§ 1681i(a)(5)(A) - Logically impossible timeline requires deletion',
        deletionProbability: 100, // Automatic win
      });
    }
  }

  return conflicts;
}

/**
 * Get conflicts for a specific account
 */
export function getAccountConflicts(accountName: string, allAccounts: ParsedAccount[]): Conflict[] {
  const normalizedName = normalizeAccountName(accountName);
  const accountGroup = allAccounts.filter(a => normalizeAccountName(a.accountName) === normalizedName);
  
  if (accountGroup.length < 2) return [];

  const analysis = detectConflicts(accountGroup);
  return analysis.conflicts;
}


/**
 * Detect unverifiable balances (balance > 0 but no payment history) - CRITICAL for A+ letters
 */
function detectUnverifiableBalances(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    // If balance exists but no clear payment history documentation
    if (account.balance > 0) {
      const rawData = (account.rawData || '').toLowerCase();
      const status = account.status.toLowerCase();
      
      // Check for indicators of missing payment history
      const noPaymentHistory = rawData.includes('no payment history') ||
                               rawData.includes('first payment never received') ||
                               rawData.includes('no data available') ||
                               rawData.includes('payment history unavailable') ||
                               rawData.includes('n/a') && rawData.includes('payment');
      
      // Check if status suggests unverifiable (collections, charge-offs without history)
      const isCollection = status.includes('collection');
      const isChargeOff = status.includes('charge');
      const isPastDue = status.includes('past due');
      
      if (noPaymentHistory || ((isCollection || isChargeOff || isPastDue) && account.balance > 500)) {
        // Determine specific reason for unverifiability
        let specificReason = 'no payment history documentation';
        if (rawData.includes('first payment never received')) {
          specificReason = '"First Payment Never Received"';
        } else if (rawData.includes('no payment history')) {
          specificReason = '"No Payment History Available"';
        }
        
        conflicts.push({
          type: 'unverifiable_balance',
          severity: 'high',
          accountName,
          description: `UNVERIFIABLE BALANCE - $${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} with ${specificReason}`,
          bureaus: [account.bureau],
          details: {
            balance: `$${account.balance.toFixed(2)}`,
            status: account.status,
            hasPaymentHistory: false,
            specificReason,
          },
          fcraViolation: '§ 1681i(a)(4) - Information must be verifiable',
          deletionProbability: 80,
          argument: `UNVERIFIABLE BALANCE - No Payment History:\nYour report states ${specificReason}, yet you report a balance of $${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.\n\nWithout any payment history—not even a single payment—how was this balance calculated? Under FCRA § 1681i(a)(4), information must be verifiable. A balance reported without supporting payment history documentation is inherently unverifiable and MUST be deleted.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detect duplicate accounts (same-day openings, same balances) - CRITICAL for A+ letters
 */
function detectDuplicateAccounts(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Check if multiple accounts have same date opened AND similar balance
  const accountsWithDates = accounts.filter(a => a.dateOpened);
  
  if (accountsWithDates.length >= 2) {
    // Group by date opened
    const byDate: Record<string, ParsedAccount[]> = {};
    for (const account of accountsWithDates) {
      const dateKey = account.dateOpened!.toISOString().split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(account);
    }

    // Check for duplicates on same day
    for (const [date, dateAccounts] of Object.entries(byDate)) {
      if (dateAccounts.length >= 2) {
        // Check if balances are similar (within 15% or exact match)
        const balances = dateAccounts.map(a => a.balance);
        const maxBalance = Math.max(...balances);
        const minBalance = Math.min(...balances);
        const avgBalance = balances.reduce((a, b) => a + b, 0) / balances.length;
        
        // More lenient matching - same day + similar balance = likely duplicate
        const balanceVariation = maxBalance > 0 ? (maxBalance - minBalance) / maxBalance : 0;
        
        if (maxBalance > 0 && balanceVariation < 0.15) {
          // Build detailed instance breakdown
          const instanceList = dateAccounts.map((a, i) => 
            `• ${a.accountNumber || 'Instance ' + String.fromCharCode(65 + i)} - Balance: $${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${a.bureau})`
          ).join('\n');
          
          const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          
          conflicts.push({
            type: 'duplicate',
            severity: dateAccounts.length >= 3 ? 'critical' : 'high',
            accountName,
            description: `DUPLICATE REPORTING - ${dateAccounts.length} identical accounts opened ${formattedDate}`,
            bureaus: dateAccounts.map(a => a.bureau),
            details: {
              dateOpened: date,
              accountCount: dateAccounts.length,
              balances: dateAccounts.map(a => `${a.bureau}: $${a.balance.toFixed(2)}`).join(', '),
              averageBalance: `$${avgBalance.toFixed(2)}`,
            },
            fcraViolation: '§ 1681s-2(a)(1)(A) - Duplicate reporting of same debt',
            deletionProbability: dateAccounts.length >= 3 ? 90 : 80,
            argument: `DUPLICATE REPORTING - Same Debt Reported Multiple Times:\nGroup opened ${formattedDate}:\n${instanceList}\n\nIt is highly unlikely that ${dateAccounts.length} separate loans of approximately $${avgBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} each were issued on the exact same day to the same consumer. This is duplicate reporting of the same debt, which violates FCRA § 1681s-2(a)(1)(A). Only ONE instance should report - all ${dateAccounts.length - 1} duplicate(s) must be DELETED.`,
          });
        }
      }
    }
  }

  // Also check for accounts with exact same balance even if different dates
  if (accounts.length >= 3) {
    const balanceGroups: Record<string, ParsedAccount[]> = {};
    for (const account of accounts) {
      if (account.balance > 0) {
        const balanceKey = account.balance.toFixed(2);
        if (!balanceGroups[balanceKey]) balanceGroups[balanceKey] = [];
        balanceGroups[balanceKey].push(account);
      }
    }
    
    for (const [balance, sameBalanceAccounts] of Object.entries(balanceGroups)) {
      if (sameBalanceAccounts.length >= 3) {
        const instanceList = sameBalanceAccounts.map((a, i) => 
          `• ${a.accountNumber || 'Instance ' + String.fromCharCode(65 + i)} - $${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${a.bureau})`
        ).join('\n');
        
        conflicts.push({
          type: 'duplicate',
          severity: 'critical',
          accountName,
          description: `SUSPICIOUS DUPLICATE PATTERN - ${sameBalanceAccounts.length} accounts with identical $${balance} balance`,
          bureaus: sameBalanceAccounts.map(a => a.bureau),
          details: {
            accountCount: sameBalanceAccounts.length,
            identicalBalance: `$${balance}`,
          },
          fcraViolation: '§ 1681s-2(a)(1)(A) - Duplicate reporting of same debt',
          deletionProbability: 85,
          argument: `SUSPICIOUS DUPLICATE PATTERN - ${sameBalanceAccounts.length} Identical Balances:\n${instanceList}\n\n${sameBalanceAccounts.length} separate accounts all showing the exact same balance of $${balance} is statistically improbable and strongly indicates duplicate reporting of the same debt. Under FCRA § 1681s-2(a)(1)(A), duplicate reporting is prohibited. All but one instance must be DELETED.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detect status corrections needed (paid accounts showing negative) - CRITICAL for A+ letters
 */
function detectStatusCorrections(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    const status = account.status.toLowerCase();
    const balance = account.balance;
    const rawData = (account.rawData || '').toLowerCase();

    // Check for payment history indicators
    const hasGoodPaymentHistory = rawData.includes('100%') || 
                                   rawData.includes('on time') ||
                                   rawData.includes('never late') ||
                                   rawData.includes('pays as agreed');

    // Paid accounts should not show negative status
    if (balance === 0 || status.includes('paid') || status.includes('closed')) {
      const hasNegativeStatus = status.includes('charge') || 
                                status.includes('collection') ||
                                status.includes('delinquent') ||
                                status.includes('late') ||
                                status.includes('past due');
      
      if (hasNegativeStatus && (balance === 0 || status.includes('paid'))) {
        // Build detailed argument based on payment history
        let argument = '';
        let severity: 'critical' | 'high' | 'medium' = 'medium';
        
        if (hasGoodPaymentHistory) {
          severity = 'high';
          argument = `STATUS CORRECTION REQUIRED - PAID ACCOUNT WITH PERFECT HISTORY:\n• Account: ${accountName}\n• Balance: $0 (all instances)\n• Status: ${account.status}\n• Payment History: 100% on-time\n\nCorrection Needed: This paid account with perfect payment history should NOT appear as a negative tradeline. A $0 balance account with 100% on-time payment history must report as "Paid/Closed - Positive Standing", not as "${account.status}". This misrepresentation violates FCRA § 1681s-2(a)(1)(A).`;
        } else {
          argument = `This account shows a $0 balance (or "paid" status) yet continues to report as "${account.status}". A paid account with zero balance should report as "Paid/Closed" with positive standing, not as a negative item. This inaccurate status violates FCRA § 1681s-2(a)(1)(A).`;
        }
        
        conflicts.push({
          type: 'status_correction',
          severity,
          accountName,
          description: hasGoodPaymentHistory 
            ? 'Paid account with 100% on-time history incorrectly showing negative'
            : 'Paid account incorrectly showing negative status',
          bureaus: [account.bureau],
          details: {
            currentStatus: account.status,
            balance: `$${balance.toFixed(2)}`,
            correctStatus: 'Paid/Closed - Positive',
            hasGoodPaymentHistory,
          },
          fcraViolation: '§ 1681s-2(a)(1)(A) - Must report accurate status',
          deletionProbability: hasGoodPaymentHistory ? 80 : 65,
          argument,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detect previously disputed accounts that still show errors
 */
function detectPreviouslyDisputed(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    const status = account.status.toLowerCase();
    const rawData = (account.rawData || '').toLowerCase();
    
    // Check if account was previously disputed
    const wasDisputed = status.includes('disputed') || 
                        status.includes('consumer disputes') ||
                        status.includes('dispute') ||
                        rawData.includes('consumer disputes') ||
                        rawData.includes('previously disputed') ||
                        rawData.includes('account disputed');
    
    if (wasDisputed) {
      // Check if there are still negative indicators
      const hasNegativeIndicators = status.includes('collection') ||
                                    status.includes('charge') ||
                                    status.includes('delinquent') ||
                                    status.includes('late') ||
                                    account.balance > 0;
      
      if (hasNegativeIndicators) {
        conflicts.push({
          type: 'previously_disputed',
          severity: 'critical',
          accountName,
          description: 'Previously disputed account still reporting with unresolved errors',
          bureaus: [account.bureau],
          details: {
            currentStatus: account.status,
            balance: `$${account.balance.toFixed(2)}`,
            disputeFlag: 'Consumer disputes this account',
          },
          fcraViolation: '§ 1681i(a)(5)(A) - Failed to properly investigate previous dispute',
          deletionProbability: 90,
          argument: `This account shows "${account.status}" and was PREVIOUSLY DISPUTED by the consumer. The dispute flag indicates the consumer challenged this account's accuracy, yet it continues to report with the same negative information. Under FCRA § 1681i(a)(5)(A), if a furnisher cannot verify disputed information within 30 days, it MUST be deleted. The presence of the dispute flag with unchanged negative status proves the investigation was inadequate.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detect violations on single accounts (no cross-bureau comparison needed)
 */
function detectSingleAccountViolations(accountName: string, account: ParsedAccount): Conflict[] {
  const conflicts: Conflict[] = [];

  // 1. Impossible timeline (activity before opened) - already handled but ensure single accounts caught
  if (account.dateOpened && account.lastActivity) {
    if (account.lastActivity < account.dateOpened) {
      const daysDifference = Math.round((account.dateOpened.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      // Only add if not already detected
      conflicts.push({
        type: 'impossible_timeline',
        severity: 'critical',
        accountName,
        description: `Activity reported ${daysDifference} days BEFORE account was opened - PHYSICALLY IMPOSSIBLE`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
          daysDifference,
        },
        fcraViolation: '§ 1681i(a)(5)(A) - Logically impossible timeline requires immediate deletion',
        deletionProbability: 100,
        argument: `This account shows Last Activity on ${account.lastActivity.toLocaleDateString()} but Date Opened on ${account.dateOpened.toLocaleDateString()}. The account had activity ${daysDifference} days BEFORE it was opened. This is physically impossible and proves the furnisher's records are completely unreliable. Under FCRA § 1681i(a)(5)(A), this impossible timeline ALONE requires immediate deletion.`,
      });
    }
  }

  // 2. Missing documentation for collections
  const isCollection = account.accountType?.toLowerCase().includes('collection') || 
                       account.status.toLowerCase().includes('collection');
  if (isCollection && account.balance > 0) {
    conflicts.push({
      type: 'missing_documentation',
      severity: 'high',
      accountName,
      description: 'Collection account lacks required debt validation documentation',
      bureaus: [account.bureau],
      details: {
        accountType: account.accountType || 'Collection',
        balance: `$${account.balance.toFixed(2)}`,
        originalCreditor: account.originalCreditor || 'Not disclosed',
      },
      fcraViolation: '§ 1692g - Debt collector must provide validation',
      deletionProbability: 70,
      argument: `This collection account for $${account.balance.toFixed(2)} lacks proper debt validation documentation. Under FDCPA § 1692g, debt collectors must provide validation upon request. Without original account documentation, payment history, and chain of title, this debt cannot be verified and must be deleted.`,
    });
  }

  // 3. Re-aging detection (activity AFTER account closed/charged-off) - CRITICAL for A+ letters
  const status = account.status.toLowerCase();
  const rawData = (account.rawData || '').toLowerCase();
  
  // Extract closed date from raw data if available
  const closedDateMatch = rawData.match(/closed[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i);
  const chargeOffDateMatch = rawData.match(/charge[\s-]*off[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i);
  
  const isChargeOff = status.includes('charge');
  const isClosed = status.includes('closed');
  
  if (account.lastActivity && (isChargeOff || isClosed)) {
    // Check for re-aging: activity reported AFTER the account should have been frozen
    // For charge-offs, check if last activity is suspiciously recent
    const now = new Date();
    const monthsSinceLastActivity = (now.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // If charge-off/closed account shows activity within last 6 months, it's suspicious
    if (monthsSinceLastActivity < 6 && account.dateOpened) {
      const monthsSinceOpened = (account.lastActivity.getTime() - account.dateOpened.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      // If account was opened more than 12 months ago but shows recent activity, likely re-aging
      if (monthsSinceOpened > 12) {
        const bureauName = account.bureau.charAt(0).toUpperCase() + account.bureau.slice(1);
        
        conflicts.push({
          type: 're-aging',
          severity: 'critical',
          accountName,
          description: `ILLEGAL RE-AGING BY ${bureauName.toUpperCase()} - Activity ${Math.round(monthsSinceOpened)} months after account opened`,
          bureaus: [account.bureau],
          details: {
            dateOpened: account.dateOpened.toLocaleDateString(),
            lastActivity: account.lastActivity.toLocaleDateString(),
            monthsAfterOpening: Math.round(monthsSinceOpened),
            status: account.status,
          },
          fcraViolation: '§ 1681s-2(a)(8) - Illegal re-aging of debt',
          deletionProbability: 90,
          argument: `ILLEGAL RE-AGING BY ${bureauName.toUpperCase()}:\nAccount opened: ${account.dateOpened.toLocaleDateString()}\nYet ${bureauName} reports:\n• Last Activity: ${account.lastActivity.toLocaleDateString()} (${Math.round(monthsSinceOpened)} months AFTER opening!)\n\nThis is illegal re-aging under FCRA § 1681s-2(a)(8). A charged-off/closed account cannot have legitimate "activity" years after the delinquency. This manipulation extends the 7-year reporting period and is a CRITICAL violation requiring immediate deletion.`,
        });
      }
    }
  }
  
  // 4. Check for "past due as of" date that's impossible given last activity
  const pastDueMatch = rawData.match(/past\s*due\s*(?:as\s*of)?[:\s]*(\w+\s+\d{4}|\d{1,2}[\/-]\d{2,4})/i);
  if (pastDueMatch && account.lastActivity) {
    const pastDueDateStr = pastDueMatch[1];
    // Try to parse the past due date
    const pastDueDate = new Date(pastDueDateStr);
    
    if (!isNaN(pastDueDate.getTime())) {
      const monthsDifference = (pastDueDate.getTime() - account.lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      // If past due date is more than 3 months after last activity, it's impossible
      if (monthsDifference > 3) {
        conflicts.push({
          type: 'impossible_timeline',
          severity: 'critical',
          accountName,
          description: `IMPOSSIBLE TIMELINE - "Past due as of ${pastDueDateStr}" but Last Activity was ${account.lastActivity.toLocaleDateString()}`,
          bureaus: [account.bureau],
          details: {
            pastDueDate: pastDueDateStr,
            lastActivity: account.lastActivity.toLocaleDateString(),
            monthsDifference: Math.round(monthsDifference),
          },
          fcraViolation: '§ 1681i(a)(5)(A) - Logically impossible timeline',
          deletionProbability: 95,
          argument: `CRITICAL ERROR - IMPOSSIBLE TIMELINE:\nThe account is reported as "past due as of ${pastDueDateStr}," yet "Last Activity" is ${account.lastActivity.toLocaleDateString()}.\n\nAn account cannot have a "past due" status if its last activity was ${Math.round(monthsDifference)} months prior. This is an impossible timeline that renders the entire entry unverifiable. Under FCRA § 1681i(a)(5)(A), this impossible timeline requires IMMEDIATE DELETION.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Generate comprehensive multi-angle dispute argument for an account
 */
export function generateMultiAngleArgument(accountName: string, conflicts: Conflict[]): string {
  if (conflicts.length === 0) return '';

  // Group by severity
  const critical = conflicts.filter(c => c.severity === 'critical');
  const high = conflicts.filter(c => c.severity === 'high');
  const medium = conflicts.filter(c => c.severity === 'medium');

  let argument = '';

  // Lead with CRITICAL violations (impossible timeline, re-aging)
  if (critical.length > 0) {
    argument += '**CRITICAL ERRORS REQUIRING IMMEDIATE DELETION:**\n\n';
    critical.forEach((c, i) => {
      argument += `${i + 1}. ${c.argument || c.description}\n\n`;
    });
  }

  // Then HIGH priority (cross-bureau, unverifiable)
  if (high.length > 0) {
    argument += '**HIGH PRIORITY VIOLATIONS:**\n\n';
    high.forEach((c, i) => {
      argument += `${i + 1}. ${c.argument || c.description}\n\n`;
    });
  }

  // Then MEDIUM (status corrections)
  if (medium.length > 0) {
    argument += '**ADDITIONAL ISSUES:**\n\n';
    medium.forEach((c, i) => {
      argument += `${i + 1}. ${c.argument || c.description}\n\n`;
    });
  }

  // Add summary
  const totalViolations = conflicts.length;
  const maxDeletionProb = Math.max(...conflicts.map(c => c.deletionProbability));
  
  argument += `\n**SUMMARY:** This account has ${totalViolations} documented violation${totalViolations > 1 ? 's' : ''}. `;
  
  if (critical.length > 0) {
    argument += `The ${critical.length} CRITICAL error${critical.length > 1 ? 's' : ''} ALONE require${critical.length === 1 ? 's' : ''} immediate deletion. `;
  }
  
  argument += `Under FCRA § 1681i(a)(5)(A), you must delete this account within 30 days or face legal consequences.\n`;

  return argument;
}
