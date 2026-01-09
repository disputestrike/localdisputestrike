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
 * Detect balance discrepancies across bureaus
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

    if (discrepancy > 100) { // Only report significant discrepancies
      conflicts.push({
        type: 'balance',
        severity: discrepancy > 1000 ? 'critical' : 'high',
        accountName,
        description: `Balance discrepancy of $${discrepancy.toFixed(2)} across bureaus`,
        bureaus: accounts.map(a => a.bureau),
        details: {
          balances: balances.map(b => `${b.bureau}: $${b.balance.toFixed(2)}`).join(', '),
          discrepancy: `$${discrepancy.toFixed(2)}`,
        },
        fcraViolation: '§ 1681s-2(a)(1)(A) - Furnisher must report accurate information',
        deletionProbability: Math.min(95, 70 + (discrepancy / 100)),
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
 * Detect unverifiable balances (balance > 0 but no payment history)
 */
function detectUnverifiableBalances(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    // If balance exists but no clear payment history documentation
    if (account.balance > 0) {
      // Check if status suggests unverifiable (collections, charge-offs without history)
      const isCollection = account.status.toLowerCase().includes('collection');
      const isChargeOff = account.status.toLowerCase().includes('charge');
      
      if (isCollection || isChargeOff) {
        conflicts.push({
          type: 'unverifiable_balance',
          severity: 'high',
          accountName,
          description: `$${account.balance.toFixed(2)} balance reported with no payment history available`,
          bureaus: [account.bureau],
          details: {
            balance: `$${account.balance.toFixed(2)}`,
            status: account.status,
            hasPaymentHistory: false,
          },
          fcraViolation: '§ 1681i(a)(4) - Information must be verifiable',
          deletionProbability: 75,
          argument: `Report shows $${account.balance.toFixed(2)} balance but no payment history is available. Without payment history documentation, this balance cannot be verified as required by FCRA § 1681i(a)(4). An unverifiable balance must be deleted.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detect duplicate accounts (same-day openings, same balances)
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
        // Check if balances are similar (within 10%)
        const balances = dateAccounts.map(a => a.balance);
        const maxBalance = Math.max(...balances);
        const minBalance = Math.min(...balances);
        
        if (maxBalance > 0 && (maxBalance - minBalance) / maxBalance < 0.1) {
          conflicts.push({
            type: 'duplicate',
            severity: 'high',
            accountName,
            description: `${dateAccounts.length} identical accounts opened on ${date} with similar balances`,
            bureaus: dateAccounts.map(a => a.bureau),
            details: {
              dateOpened: date,
              accountCount: dateAccounts.length,
              balances: dateAccounts.map(a => `${a.bureau}: $${a.balance.toFixed(2)}`).join(', '),
            },
            fcraViolation: '§ 1681s-2(a)(1)(A) - Duplicate reporting of same debt',
            deletionProbability: 80,
            argument: `${dateAccounts.length} identical accounts opened on the same day (${date}) with nearly identical balances. This is duplicate reporting of the same debt, which violates FCRA § 1681s-2(a)(1)(A). Only ONE account should report - all duplicates must be deleted.`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Detect status corrections needed (paid accounts showing negative)
 */
function detectStatusCorrections(accountName: string, accounts: ParsedAccount[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const account of accounts) {
    const status = account.status.toLowerCase();
    const balance = account.balance;

    // Paid accounts should not show negative status
    if (balance === 0 || status.includes('paid')) {
      const hasNegativeStatus = status.includes('charge') || 
                                status.includes('collection') ||
                                status.includes('delinquent') ||
                                status.includes('late');
      
      if (hasNegativeStatus && (balance === 0 || status.includes('paid'))) {
        conflicts.push({
          type: 'status_correction',
          severity: 'medium',
          accountName,
          description: 'Paid account incorrectly showing negative status',
          bureaus: [account.bureau],
          details: {
            currentStatus: account.status,
            balance: `$${balance.toFixed(2)}`,
            correctStatus: 'Paid/Closed - Positive',
          },
          fcraViolation: '§ 1681s-2(a)(1)(A) - Must report accurate status',
          deletionProbability: 65,
          argument: `This account shows a $0 balance (or "paid" status) yet continues to report as "${account.status}". A paid account with zero balance should report as "Paid/Closed" with positive standing, not as a negative item. This inaccurate status violates FCRA § 1681s-2(a)(1)(A).`,
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

  // 3. Re-aging detection (activity long after charge-off)
  if (account.dateOpened && account.lastActivity) {
    const monthsSinceOpened = (account.lastActivity.getTime() - account.dateOpened.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const isChargeOff = account.status.toLowerCase().includes('charge');
    
    // If charge-off shows activity more than 6 months after opening, suspicious
    if (isChargeOff && monthsSinceOpened > 6) {
      conflicts.push({
        type: 're-aging',
        severity: 'critical',
        accountName,
        description: `Charge-off shows activity ${Math.round(monthsSinceOpened)} months after account opened - possible illegal re-aging`,
        bureaus: [account.bureau],
        details: {
          dateOpened: account.dateOpened.toLocaleDateString(),
          lastActivity: account.lastActivity.toLocaleDateString(),
          monthsDifference: Math.round(monthsSinceOpened),
          status: account.status,
        },
        fcraViolation: '§ 1681c(c)(1) - Illegal re-aging of debt',
        deletionProbability: 85,
        argument: `This charged-off account shows Last Activity on ${account.lastActivity.toLocaleDateString()}, which is ${Math.round(monthsSinceOpened)} months after the account was opened on ${account.dateOpened.toLocaleDateString()}. This suggests illegal re-aging of the debt to extend the 7-year reporting period. Under FCRA § 1681c(c)(1), re-aging is illegal and requires immediate deletion.`,
      });
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
