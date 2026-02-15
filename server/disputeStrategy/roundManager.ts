/**
 * Round Manager
 * Allocates accounts to Round 1/2/3, enforces max 7 per round, provides targets for letter generation
 */

import * as db from '../db';
import { scoreAccountsWithClaude, type ScoredAccount } from './disputeScorer';
import { findDuplicateGroups } from './duplicateFinder';

const MAX_ITEMS_PER_ROUND = 7;

export interface RoundAllocation {
  round1: ScoredAccount[];
  round2: ScoredAccount[];
  round3: ScoredAccount[];
}

export interface Round1Target {
  account: ScoredAccount;
  accountId: number;
  bureau: string;
  letterTemplate: string;
  errorTypes: string[];
}

/**
 * Allocate all accounts to rounds (top 3-5 per round by severity)
 */
export async function allocateAllRounds(userId: number): Promise<RoundAllocation> {
  const accounts = await db.getNegativeAccountsByUserId(userId);
  if (accounts.length === 0) {
    return { round1: [], round2: [], round3: [] };
  }

  const input = accounts.map(a => ({
    id: a.id,
    accountName: a.accountName,
    accountNumber: a.accountNumber,
    balance: a.balance,
    status: a.status,
    dateOpened: a.dateOpened,
    lastActivity: a.lastActivity,
    accountType: a.accountType,
    originalCreditor: a.originalCreditor,
    bureau: a.bureau,
    rawData: a.rawData,
  }));

  const scored = await scoreAccountsWithClaude(input);

  // Deduplicate: for duplicate groups, treat the group as one "slot" (take highest severity)
  const seenDupKeys = new Set<string>();
  const filtered: ScoredAccount[] = [];
  for (const s of scored) {
    if (s.duplicateGroupIds && s.duplicateGroupIds.length > 1) {
      const key = s.duplicateGroupIds.sort((a, b) => a - b).join(',');
      if (seenDupKeys.has(key)) continue;
      seenDupKeys.add(key);
    }
    filtered.push(s);
  }

  const byRound = { 1: [] as ScoredAccount[], 2: [] as ScoredAccount[], 3: [] as ScoredAccount[] };
  for (const s of filtered) {
    byRound[s.round].push(s);
  }

  // Sort each round by severity descending, take top MAX
  const round1 = byRound[1].sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);
  const round2 = byRound[2].sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);
  const round3 = byRound[3].sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);

  return { round1, round2, round3 };
}

/**
 * Get Round 1 targets for letter generation (accounts to dispute in Round 1)
 * Returns one target per account per bureau (each bureau gets its own letter)
 */
export async function getRound1Targets(userId: number): Promise<Round1Target[]> {
  const { round1 } = await allocateAllRounds(userId);
  const targets: Round1Target[] = [];

  for (const s of round1) {
    targets.push({
      account: s,
      accountId: s.id,
      bureau: s.bureau,
      letterTemplate: s.letterTemplate,
      errorTypes: s.errorTypes,
    });
  }
  return targets;
}

/**
 * Get recommended account IDs for Round 1 (for backward compatibility with UI)
 */
export async function getRecommendedAccountIdsForRound1(userId: number): Promise<number[]> {
  const { round1 } = await allocateAllRounds(userId);
  const ids = new Set<number>();
  round1.forEach(s => ids.add(s.id));
  return Array.from(ids);
}

export type Round1Result = 'deleted' | 'verified' | 'no_response';

/**
 * Save Round 1 results and update escalation targets.
 * Called when user records outcomes after 30-day bureau response.
 */
export async function updateAfterRound1Results(
  userId: number,
  results: { accountId: number; result: Round1Result }[]
): Promise<void> {
  const letters = await db.getDisputeLettersByUserId(userId);
  const round1Letters = letters.filter(l => l.round === 1);
  const { safeJsonParse } = await import('../utils/json');

  const accountToLetter = new Map<number, number>();
  for (const letter of round1Letters) {
    const ids = safeJsonParse(letter.accountsDisputed, []) as number[];
    if (!Array.isArray(ids)) continue;
    for (const aid of ids) {
      if (!accountToLetter.has(aid)) accountToLetter.set(aid, letter.id);
    }
  }

  const existing = await db.getUserDisputeOutcomes(userId);
  const existingByAccount = new Map<number, number>();
  for (const o of existing) {
    if (o.accountId && !existingByAccount.has(o.accountId)) existingByAccount.set(o.accountId, o.id);
  }

  for (const { accountId, result } of results) {
    const letterId = accountToLetter.get(accountId);
    if (!letterId) continue;
    const outcome = result === 'deleted' ? 'deleted' : result === 'verified' ? 'verified' : 'no_response';
    const existingId = existingByAccount.get(accountId);
    if (existingId) {
      await db.updateDisputeOutcome(existingId, { outcome });
    } else {
      await db.createDisputeOutcome({
        userId,
        disputeLetterId: letterId,
        accountId,
        outcome,
      });
    }
  }
}

/**
 * Get Round 2 targets: new disputes (severity 6-7) + escalations from Round 1 (verified/no_response)
 */
export async function getRound2Targets(userId: number): Promise<Round1Target[]> {
  const { round2 } = await allocateAllRounds(userId);
  const outcomes = await db.getUserDisputeOutcomes(userId);
  const letters = await db.getDisputeLettersByUserId(userId);
  const round1Letters = letters.filter(l => l.round === 1);
  const { safeJsonParse } = await import('../utils/json');

  const r1AccountIds = new Set<number>();
  for (const l of round1Letters) {
    const ids = safeJsonParse(l.accountsDisputed, []) as number[];
    if (Array.isArray(ids)) ids.forEach(id => r1AccountIds.add(id));
  }

  const escalationIds = new Set<number>();
  for (const o of outcomes) {
    if (!o.accountId) continue;
    if (!r1AccountIds.has(o.accountId)) continue;
    if (o.outcome === 'verified' || o.outcome === 'no_response') escalationIds.add(o.accountId);
  }

  const accounts = await db.getNegativeAccountsByUserId(userId);
  const accountMap = new Map(accounts.map(a => [a.id, a]));
  const scored = scoreAccounts(accounts.map(a => ({
    id: a.id, accountName: a.accountName, accountNumber: a.accountNumber, balance: a.balance,
    status: a.status, dateOpened: a.dateOpened, lastActivity: a.lastActivity, accountType: a.accountType,
    originalCreditor: a.originalCreditor, bureau: a.bureau, rawData: a.rawData,
  })));

  const round2Scored = scored.filter(s => s.round === 2).sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);
  const escalationScored = scored.filter(s => escalationIds.has(s.id)).sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);

  const seen = new Set<number>();
  const targets: Round1Target[] = [];
  for (const s of [...round2Scored, ...escalationScored]) {
    if (seen.has(s.id)) continue;
    if (targets.length >= MAX_ITEMS_PER_ROUND) break;
    seen.add(s.id);
    targets.push({
      account: s,
      accountId: s.id,
      bureau: s.bureau,
      letterTemplate: escalationIds.has(s.id) ? '2C' : '2A',
      errorTypes: s.errorTypes,
    });
  }
  return targets;
}

/**
 * Get Round 3 targets: remaining disputes + CFPB prep from Round 1 verified low-severity
 */
export async function getRound3Targets(userId: number): Promise<Round1Target[]> {
  const { round3 } = await allocateAllRounds(userId);
  const outcomes = await db.getUserDisputeOutcomes(userId);
  const letters = await db.getDisputeLettersByUserId(userId);
  const round1Letters = letters.filter(l => l.round === 1);
  const { safeJsonParse } = await import('../utils/json');

  const r1AccountIds = new Set<number>();
  for (const l of round1Letters) {
    const ids = safeJsonParse(l.accountsDisputed, []) as number[];
    if (Array.isArray(ids)) ids.forEach(id => r1AccountIds.add(id));
  }

  const cfpbIds = new Set<number>();
  for (const o of outcomes) {
    if (!o.accountId) continue;
    if (!r1AccountIds.has(o.accountId)) continue;
    if (o.outcome === 'verified') cfpbIds.add(o.accountId);
  }

  const accounts = await db.getNegativeAccountsByUserId(userId);
  const scored = await scoreAccountsWithClaude(accounts.map(a => ({
    id: a.id, accountName: a.accountName, accountNumber: a.accountNumber, balance: a.balance,
    status: a.status, dateOpened: a.dateOpened, lastActivity: a.lastActivity, accountType: a.accountType,
    originalCreditor: a.originalCreditor, bureau: a.bureau, rawData: a.rawData,
  })));

  const round3Scored = scored.filter(s => s.round === 3).sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);
  const cfpbScored = scored.filter(s => cfpbIds.has(s.id)).sort((a, b) => b.severity - a.severity).slice(0, MAX_ITEMS_PER_ROUND);

  const seen = new Set<number>();
  const targets: Round1Target[] = [];
  for (const s of [...round3Scored, ...cfpbScored]) {
    if (seen.has(s.id)) continue;
    if (targets.length >= MAX_ITEMS_PER_ROUND) break;
    seen.add(s.id);
    targets.push({
      account: s,
      accountId: s.id,
      bureau: s.bureau,
      letterTemplate: cfpbIds.has(s.id) ? '3B-2' : '3A',
      errorTypes: s.errorTypes,
    });
  }
  return targets;
}
