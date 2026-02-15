/**
 * Duplicate Account Finder
 * Groups accounts by: normalized creditor name + dateOpened + balance
 * Same creditor + open date + balance = duplicate group (counts as 1 dispute for round limits)
 */

export interface AccountForDuplicateCheck {
  id: number;
  accountName: string | null;
  dateOpened: string | null;
  balance: string | number | null;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 50);
}

function toKey(acc: AccountForDuplicateCheck): string {
  const name = normalize(acc.accountName || '');
  const date = (acc.dateOpened || '').toString().trim();
  const bal = typeof acc.balance === 'number' ? acc.balance : parseFloat(String(acc.balance || 0)) || 0;
  return `${name}|${date}|${bal}`;
}

export interface DuplicateGroup {
  accountIds: number[];
  key: string;
  count: number;
}

/**
 * Find duplicate account groups (same creditor + dateOpened + balance)
 */
export function findDuplicateGroups(accounts: AccountForDuplicateCheck[]): DuplicateGroup[] {
  const byKey = new Map<string, number[]>();

  for (const acc of accounts) {
    const key = toKey(acc);
    const list = byKey.get(key) || [];
    list.push(acc.id);
    byKey.set(key, list);
  }

  const groups: DuplicateGroup[] = [];
  for (const [key, ids] of byKey) {
    if (ids.length > 1) {
      groups.push({ accountIds: ids, key, count: ids.length });
    }
  }
  return groups;
}

/**
 * Get set of account IDs that are part of a duplicate group
 */
export function getDuplicateAccountIds(accounts: AccountForDuplicateCheck[]): Set<number> {
  const groups = findDuplicateGroups(accounts);
  const set = new Set<number>();
  for (const g of groups) {
    g.accountIds.forEach(id => set.add(id));
  }
  return set;
}
