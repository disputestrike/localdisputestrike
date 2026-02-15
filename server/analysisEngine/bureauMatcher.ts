/**
 * Bureau Matcher
 * Matches same account across TransUnion, Equifax, Experian
 */

import { fuzzyMatch, normalizeCreditorName } from './helpers';

function getBureauCode(account: Record<string, unknown>): 'TU' | 'EQ' | 'EX' {
  const b = String(account.bureau || '').toLowerCase();
  if (b.includes('equifax')) return 'EQ';
  if (b.includes('experian')) return 'EX';
  return 'TU';
}

function toNormalized(account: Record<string, unknown>, bureau: string) {
  const name = (account.accountName || account.creditor_name || '') as string;
  const num = (account.accountNumber || account.account_number || '') as string;
  const last4 = String(num || '').replace(/\D/g, '').slice(-4);
  let balance = 0;
  if (typeof account.balance === 'number') balance = account.balance;
  else if (typeof account.balance === 'string') balance = parseFloat(String(account.balance).replace(/[$,]/g, '')) || 0;
  let dateOpened: Date | null = null;
  const dob = account.dateOpened;
  if (dob instanceof Date) dateOpened = dob;
  else if (typeof dob === 'string') {
    const d = new Date(dob);
    if (!isNaN(d.getTime())) dateOpened = d;
  }
  return { creditorName: name, accountNumber: last4, balance, dateOpened };
}

/**
 * Check if two accounts are the same (cross-bureau)
 */
export function isSameAccount(
  acct1: Record<string, unknown>,
  acct2: Record<string, unknown>,
  bureau1: string,
  bureau2: string
): boolean {
  if (bureau1 === bureau2) return false;
  const n1 = toNormalized(acct1, bureau1);
  const n2 = toNormalized(acct2, bureau2);

  if (n1.accountNumber && n2.accountNumber && n1.accountNumber === n2.accountNumber) {
    const score = fuzzyMatch(normalizeCreditorName(n1.creditorName), normalizeCreditorName(n2.creditorName));
    if (score >= 70) return true;
  }

  const creditorScore = fuzzyMatch(normalizeCreditorName(n1.creditorName), normalizeCreditorName(n2.creditorName));
  if (creditorScore < 75) return false;
  if (Math.abs(n1.balance - n2.balance) > 100) return false;
  if (n1.dateOpened && n2.dateOpened) {
    const diff = Math.abs(n1.dateOpened.getTime() - n2.dateOpened.getTime());
    if (diff > 60 * 24 * 60 * 60 * 1000) return false;
  }
  return true;
}

export interface MatchedGroup {
  TU: Record<string, unknown> | null;
  EQ: Record<string, unknown> | null;
  EX: Record<string, unknown> | null;
}

/**
 * Group accounts that represent the same tradeline across bureaus
 */
export function matchAccountsAcrossBureaus(
  accounts: Array<Record<string, unknown> & { bureau?: string }>
): MatchedGroup[] {
  const tu = accounts.filter((a) => getBureauCode(a) === 'TU');
  const eq = accounts.filter((a) => getBureauCode(a) === 'EQ');
  const ex = accounts.filter((a) => getBureauCode(a) === 'EX');

  const matched: MatchedGroup[] = [];
  const used = new Set<string>();

  const makeKey = (a: Record<string, unknown>, bureau: string) =>
    `${bureau}:${String(a.accountName || a.creditor_name || '').toLowerCase()}:${String(a.accountNumber || a.account_number || '').slice(-4)}`;

  const all = [...tu, ...eq, ...ex];
  for (const account of all) {
    const bureau = getBureauCode(account);
    const k = makeKey(account, bureau);
    if (used.has(k)) continue;

    const group: MatchedGroup = { TU: null, EQ: null, EX: null };
    group[bureau] = account;
    used.add(k);

    const lists: { list: typeof tu; key: keyof MatchedGroup }[] = [
      { list: tu, key: 'TU' },
      { list: eq, key: 'EQ' },
      { list: ex, key: 'EX' },
    ];

    for (const { list, key: bk } of lists) {
      if (group[bk]) continue;
      for (const other of list) {
        const ob = getBureauCode(other);
        if (ob !== bk) continue;
        const ok = makeKey(other, ob);
        if (used.has(ok)) continue;
        const base = group.TU || group.EQ || group.EX;
        if (!base) break;
        const baseBureau = base === group.TU ? 'TU' : base === group.EQ ? 'EQ' : 'EX';
        if (isSameAccount(base, other, baseBureau, ob)) {
          group[bk] = other;
          used.add(ok);
          break;
        }
      }
    }

    matched.push(group);
  }

  return matched;
}
