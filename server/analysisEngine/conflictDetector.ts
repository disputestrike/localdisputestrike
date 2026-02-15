/**
 * Conflict Detector
 * Detects disputable cross-bureau conflicts
 */

export interface Conflict {
  type: string;
  severity: number;
  description: string;
  bureaus_affected: string[];
  details?: Record<string, string | number>;
}

export interface MatchedGroup {
  TU: Record<string, unknown> | null;
  EQ: Record<string, unknown> | null;
  EX: Record<string, unknown> | null;
}

function getVal(account: Record<string, unknown>, key: string): string {
  const v = account[key];
  if (v == null) return '';
  return String(v);
}

function getStatus(a: Record<string, unknown>): string {
  return (
    getVal(a, 'status') ||
    getVal(a, 'payment_status') ||
    getVal(a, 'paymentStatus') ||
    getVal(a, 'status_normalized') ||
    ''
  ).toLowerCase();
}

function getBalance(a: Record<string, unknown>): number {
  const v = a.balance;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v.replace(/[$,]/g, '')) || 0;
  return 0;
}

function getLateCounts(a: Record<string, unknown>): string {
  return (
    getVal(a, 'late_counts') ||
    getVal(a, 'late_counts_normalized') ||
    getVal(a, 'paymentHistory') ||
    '0/0/0'
  );
}

export function detectConflicts(group: MatchedGroup): Conflict[] {
  const conflicts: Conflict[] = [];
  const bureaus = [
    { key: 'TU' as const, acct: group.TU },
    { key: 'EQ' as const, acct: group.EQ },
    { key: 'EX' as const, acct: group.EX },
  ].filter((x) => x.acct != null) as { key: 'TU' | 'EQ' | 'EX'; acct: Record<string, unknown> }[];

  if (bureaus.length < 2) return conflicts;

  const accounts = bureaus.map((b) => b.acct);

  // 1. STATUS CONFLICT
  const statuses = bureaus.map((b) => ({ bureau: b.key, status: getStatus(b.acct) }));
  const uniqueStatuses = new Set(statuses.map((s) => s.status));
  if (uniqueStatuses.size > 1) {
    const desc = statuses.map((s) => `${s.bureau}: ${s.status || 'N/A'}`).join('; ');
    conflicts.push({
      type: 'STATUS_CONFLICT',
      severity: 8,
      description: `Status varies: ${desc}`,
      bureaus_affected: bureaus.map((b) => b.key),
      details: Object.fromEntries(statuses.map((s) => [s.bureau, s.status])),
    });
  }

  // 2. BALANCE CONFLICT (>$1000 difference)
  const balances = accounts.map((a) => getBalance(a));
  const maxBal = Math.max(...balances);
  const minBal = Math.min(...balances);
  if (maxBal - minBal > 1000) {
    conflicts.push({
      type: 'BALANCE_CONFLICT',
      severity: 9,
      description: `Balance varies by $${(maxBal - minBal).toLocaleString()}`,
      bureaus_affected: bureaus.map((b) => b.key),
      details: Object.fromEntries(bureaus.map((b) => [b.key, `$${getBalance(b.acct).toLocaleString()}`])),
    });
  }

  // 3. LATE PAYMENT CONFLICT
  const lateCounts = bureaus.map((b) => ({ bureau: b.key, counts: getLateCounts(b.acct) }));
  const uniqueLates = new Set(lateCounts.map((l) => l.counts));
  if (uniqueLates.size > 1) {
    conflicts.push({
      type: 'LATE_PAYMENT_CONFLICT',
      severity: 7,
      description: `Late payment counts vary: ${lateCounts.map((l) => `${l.bureau}: ${l.counts}`).join(', ')}`,
      bureaus_affected: bureaus.map((b) => b.key),
      details: Object.fromEntries(lateCounts.map((l) => [l.bureau, l.counts])),
    });
  }

  // 4. IMPOSSIBLE TIMELINE
  for (const { key, acct } of bureaus) {
    const lastActivity = acct.lastActivity;
    const dateOpened = acct.dateOpened;
    let lastDate: Date | null = null;
    let openDate: Date | null = null;
    if (lastActivity instanceof Date) lastDate = lastActivity;
    else if (typeof lastActivity === 'string') {
      const d = new Date(lastActivity);
      if (!isNaN(d.getTime())) lastDate = d;
    }
    if (dateOpened instanceof Date) openDate = dateOpened;
    else if (typeof dateOpened === 'string') {
      const d = new Date(dateOpened);
      if (!isNaN(d.getTime())) openDate = d;
    }
    if (lastDate && openDate && lastDate < openDate) {
      const days = Math.round((openDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      conflicts.push({
        type: 'IMPOSSIBLE_TIMELINE',
        severity: 10,
        description: `Last activity ${days} days before account opened`,
        bureaus_affected: [key],
        details: {
          date_opened: openDate.toISOString().slice(0, 10),
          last_activity: lastDate.toISOString().slice(0, 10),
        },
      });
    }
  }

  // 5. PAYMENT STATUS CONFLICT (one positive, one negative)
  const paymentStatuses = bureaus.map((b) => getStatus(b.acct));
  const positiveTerms = ['as agreed', 'in good standing', 'paid'];
  const negativeTerms = ['charge', 'collection', 'late', 'past due'];
  const hasPositive = paymentStatuses.some((ps) => positiveTerms.some((t) => ps.includes(t)));
  const hasNegative = paymentStatuses.some((ps) => negativeTerms.some((t) => ps.includes(t)));
  if (hasPositive && hasNegative) {
    conflicts.push({
      type: 'PAYMENT_STATUS_CONFLICT',
      severity: 8,
      description: 'Payment status shows conflicting information across bureaus',
      bureaus_affected: bureaus.map((b) => b.key),
      details: Object.fromEntries(bureaus.map((b) => [b.key, getStatus(b.acct)])),
    });
  }

  return conflicts;
}
