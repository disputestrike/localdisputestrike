/**
 * Cross-Bureau Conflict Detection Engine
 * 
 * Detects conflicts and inconsistencies across credit bureaus
 * These conflicts are the strongest arguments for deletion
 */

import type { ParsedAccount } from './creditReportParser';

export interface Conflict {
  type: 'balance' | 'status' | 'date' | 're-aging' | 'impossible_timeline';
  severity: 'critical' | 'high' | 'medium';
  accountName: string;
  description: string;
  bureaus: string[];
  details: Record<string, any>;
  fcraViolation: string;
  deletionProbability: number; // 0-100%
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
