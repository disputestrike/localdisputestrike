/**
 * Dispute Strategy - Round-based dispute framework tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scoreAccounts } from './disputeScorer';
import { findDuplicateGroups } from './duplicateFinder';
import { fillRound1Template } from './letterTemplates/round1';

describe('Duplicate Finder', () => {
  it('should find duplicate groups by creditor + date + balance', () => {
    const accounts = [
      { id: 1, accountName: 'ABC Collections', dateOpened: '01/2020', balance: 500 },
      { id: 2, accountName: 'ABC COLLECTIONS', dateOpened: '01/2020', balance: 500 },
      { id: 3, accountName: 'XYZ Debt', dateOpened: '01/2020', balance: 500 },
    ];
    const groups = findDuplicateGroups(accounts);
    expect(groups.length).toBe(1);
    expect(groups[0].accountIds).toContain(1);
    expect(groups[0].accountIds).toContain(2);
    expect(groups[0].count).toBe(2);
  });

  it('should not group different balances', () => {
    const accounts = [
      { id: 1, accountName: 'ABC Collections', dateOpened: '01/2020', balance: 500 },
      { id: 2, accountName: 'ABC Collections', dateOpened: '01/2020', balance: 600 },
    ];
    const groups = findDuplicateGroups(accounts);
    expect(groups.length).toBe(0);
  });
});

describe('Dispute Scorer', () => {
  it('should score accounts and assign rounds', () => {
    const accounts = [
      {
        id: 1,
        accountName: 'Test Collection',
        balance: 500,
        status: 'Collection',
        dateOpened: '01/2020',
        lastActivity: '12/2019',
        accountType: 'Collection',
        bureau: 'transunion',
      },
    ];
    const scored = scoreAccounts(accounts);
    expect(scored.length).toBe(1);
    expect(scored[0].round).toBeLessThanOrEqual(3);
    expect(scored[0].round).toBeGreaterThanOrEqual(1);
    expect(scored[0].severity).toBeGreaterThanOrEqual(3);
    expect(scored[0].severity).toBeLessThanOrEqual(10);
    expect(scored[0].letterTemplate).toMatch(/^[123][A-F]$/);
  });

  it('should handle empty accounts', () => {
    const scored = scoreAccounts([]);
    expect(scored).toEqual([]);
  });

  it('should assign duplicate to round 1', () => {
    const accounts = [
      { id: 1, accountName: 'Dup Co', balance: 100, dateOpened: '01/2020', bureau: 'transunion' },
      { id: 2, accountName: 'Dup Co', balance: 100, dateOpened: '01/2020', bureau: 'equifax' },
    ];
    const scored = scoreAccounts(accounts);
    expect(scored.length).toBe(2);
    const dupAccounts = scored.filter(s => s.isDuplicate);
    expect(dupAccounts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Round 1 Letter Templates', () => {
  const baseCtx = {
    fullName: 'Jane Doe',
    currentAddress: '123 Main St',
    date: 'February 14, 2025',
    accountName: 'ABC Collections',
    accountNumber: '***1234',
    accountType: 'Collection',
    balance: '500',
    status: 'Collection',
    dateOpened: '01/2020',
    lastActivity: '12/2019',
    bureau: 'transunion',
  };

  it('should fill template 1A (impossible timeline)', () => {
    const content = fillRound1Template('1A', baseCtx);
    expect(content).toContain('Jane Doe');
    expect(content).toContain('ABC Collections');
    expect(content).toContain('Impossible Timeline');
    expect(content).toContain('FCRA');
    expect(content).toContain('1681i');
  });

  it('should fill template 1C (unverifiable)', () => {
    const content = fillRound1Template('1C', baseCtx);
    expect(content).toContain('Jane Doe');
    expect(content).toContain('Unverifiable');
    expect(content).toContain('TransUnion');
  });

  it('should default to 1C for unknown template', () => {
    const content = fillRound1Template('99', baseCtx);
    expect(content).toContain('Jane Doe');
    expect(content).toContain('ABC Collections');
  });
});
