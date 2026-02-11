/**
 * Conflict Analysis Service
 * Runs all 63 validation methods on user's negative accounts and persists hasConflicts/conflictDetails
 */

import * as db from './db';
import { detectConflicts } from './conflictDetector';
import type { ParsedAccount } from './creditReportParser';

const BUREAU_LABELS: Record<string, 'TransUnion' | 'Equifax' | 'Experian'> = {
  transunion: 'TransUnion',
  equifax: 'Equifax',
  experian: 'Experian',
};

function negativeAccountToParsedAccount(a: {
  accountName: string | null;
  accountNumber: string | null;
  balance: string | number;
  status: string | null;
  dateOpened: string | null;
  lastActivity: string | null;
  accountType: string | null;
  originalCreditor: string | null;
  bureau: string | null;
  rawData: string | null;
}): ParsedAccount {
  const bureau = (a.bureau || 'transunion').toLowerCase();
  const bureauLabel = BUREAU_LABELS[bureau] || 'TransUnion';
  const bal = typeof a.balance === 'string' ? parseFloat(a.balance) || 0 : Number(a.balance) || 0;
  const parseDate = (s: string | null): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  return {
    accountName: a.accountName || 'Not reported',
    accountNumber: a.accountNumber || 'Not reported',
    balance: bal,
    status: a.status || 'Not reported',
    dateOpened: parseDate(a.dateOpened),
    lastActivity: parseDate(a.lastActivity),
    accountType: a.accountType || 'Not reported',
    originalCreditor: a.originalCreditor || undefined,
    bureau: bureauLabel,
    rawData: a.rawData || '{}',
  };
}

/**
 * Run all 63 validation methods on user's negative accounts and update hasConflicts/conflictDetails
 */
export async function runConflictAnalysisForUser(userId: number): Promise<void> {
  const accounts = await db.getNegativeAccountsByUserId(userId);
  if (accounts.length === 0) return;

  const parsedAccounts: ParsedAccount[] = accounts.map(negativeAccountToParsedAccount);
  const analysis = detectConflicts(parsedAccounts);

  console.log(`[ConflictAnalysis] User ${userId}: ${analysis.totalConflicts} conflicts found, ${analysis.methodsUsed.length} of 63 methods triggered`);

  const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

  for (const account of accounts) {
    const acctNorm = normalize(account.accountName || '');
    const accountConflicts = analysis.conflicts.filter((c) => {
      const cNorm = normalize(c.accountName || '');
      return acctNorm === cNorm || acctNorm.includes(cNorm) || cNorm.includes(acctNorm);
    });

    const hasConflicts = accountConflicts.length > 0;
    const conflictDetails = hasConflicts
      ? JSON.stringify(
          accountConflicts.map((c) => ({
            type: c.type,
            description: c.description,
            severity: c.severity,
            methodNumber: c.methodNumber,
          }))
        )
      : null;

    await db.updateNegativeAccountConflicts(account.id, hasConflicts, conflictDetails || '');
  }
}
