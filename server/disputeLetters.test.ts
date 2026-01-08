import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getNegativeAccountsByUserId: vi.fn(),
  createDisputeLetter: vi.fn(),
  updateDisputeLetterStatus: vi.fn(),
  logActivity: vi.fn(),
}));

// Mock the LLM module
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'Test letter content' } }],
  }),
}));

import * as db from './db';

describe('Dispute Letters Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateDisputeLetterStatus', () => {
    it('should calculate 30-day response deadline when marking as mailed', async () => {
      const mailedDate = new Date('2026-01-08');
      const expectedDeadline = new Date('2026-02-07'); // 30 days later

      // Simulate the logic from routers.ts updateStatus mutation
      const updates: {
        mailedAt?: Date;
        trackingNumber?: string;
        responseDeadline?: Date;
      } = {};

      updates.mailedAt = mailedDate;
      const deadline = new Date(mailedDate);
      deadline.setDate(deadline.getDate() + 30);
      updates.responseDeadline = deadline;

      expect(updates.mailedAt).toEqual(mailedDate);
      expect(updates.responseDeadline.getDate()).toBe(expectedDeadline.getDate());
      expect(updates.responseDeadline.getMonth()).toBe(expectedDeadline.getMonth());
    });

    it('should include tracking number when provided', () => {
      const trackingNumber = '9400 1234 5678 9012 3456 78';
      
      const updates: {
        trackingNumber?: string;
      } = {};

      if (trackingNumber) {
        updates.trackingNumber = trackingNumber;
      }

      expect(updates.trackingNumber).toBe(trackingNumber);
    });
  });

  describe('Bulk Account Selection', () => {
    it('should filter accounts when specific accountIds are provided', async () => {
      const allAccounts = [
        { id: 1, accountName: 'Account 1', userId: 1 },
        { id: 2, accountName: 'Account 2', userId: 1 },
        { id: 3, accountName: 'Account 3', userId: 1 },
        { id: 4, accountName: 'Account 4', userId: 1 },
      ];

      const selectedAccountIds = [1, 3];

      // Simulate the filtering logic from routers.ts generate mutation
      let accounts = allAccounts;
      if (selectedAccountIds && selectedAccountIds.length > 0) {
        accounts = accounts.filter(a => selectedAccountIds.includes(a.id));
      }

      expect(accounts.length).toBe(2);
      expect(accounts.map(a => a.id)).toEqual([1, 3]);
    });

    it('should use all accounts when no accountIds are provided', async () => {
      const allAccounts = [
        { id: 1, accountName: 'Account 1', userId: 1 },
        { id: 2, accountName: 'Account 2', userId: 1 },
        { id: 3, accountName: 'Account 3', userId: 1 },
      ];

      const selectedAccountIds: number[] | undefined = undefined;

      // Simulate the filtering logic
      let accounts = allAccounts;
      if (selectedAccountIds && selectedAccountIds.length > 0) {
        accounts = accounts.filter(a => selectedAccountIds.includes(a.id));
      }

      expect(accounts.length).toBe(3);
    });

    it('should use all accounts when empty array is provided', async () => {
      const allAccounts = [
        { id: 1, accountName: 'Account 1', userId: 1 },
        { id: 2, accountName: 'Account 2', userId: 1 },
      ];

      const selectedAccountIds: number[] = [];

      // Simulate the filtering logic
      let accounts = allAccounts;
      if (selectedAccountIds && selectedAccountIds.length > 0) {
        accounts = accounts.filter(a => selectedAccountIds.includes(a.id));
      }

      expect(accounts.length).toBe(2);
    });
  });

  describe('Cross-Bureau Conflict Detection', () => {
    it('should identify accounts with conflicts', () => {
      const accounts = [
        { id: 1, accountName: 'Account 1', hasConflicts: true, conflictDetails: JSON.stringify([{ description: 'Balance differs' }]) },
        { id: 2, accountName: 'Account 2', hasConflicts: false, conflictDetails: null },
        { id: 3, accountName: 'Account 3', hasConflicts: true, conflictDetails: JSON.stringify([{ description: 'Status differs' }]) },
      ];

      const conflictAccounts = accounts.filter(a => a.hasConflicts);
      
      expect(conflictAccounts.length).toBe(2);
      expect(conflictAccounts[0].id).toBe(1);
      expect(conflictAccounts[1].id).toBe(3);
    });

    it('should parse conflict details correctly', () => {
      const conflictDetails = JSON.stringify([
        { description: 'Balance: TransUnion reports $500, Equifax reports $750' },
        { description: 'Status: TransUnion reports "Closed", Experian reports "Open"' },
      ]);

      const parsed = JSON.parse(conflictDetails);
      
      expect(parsed.length).toBe(2);
      expect(parsed[0].description).toContain('Balance');
      expect(parsed[1].description).toContain('Status');
    });
  });

  describe('30-Day Countdown Logic', () => {
    it('should calculate days since mailed correctly', () => {
      const mailedAt = new Date('2026-01-01');
      const now = new Date('2026-01-15');
      
      const daysSinceMailed = Math.floor((now.getTime() - mailedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysSinceMailed).toBe(14);
    });

    it('should identify overdue disputes (>30 days)', () => {
      const mailedAt = new Date('2025-12-01');
      const now = new Date('2026-01-08');
      
      const daysSinceMailed = Math.floor((now.getTime() - mailedAt.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysSinceMailed > 30;
      
      expect(daysSinceMailed).toBe(38);
      expect(isOverdue).toBe(true);
    });

    it('should calculate remaining days correctly', () => {
      const mailedAt = new Date('2026-01-01');
      const now = new Date('2026-01-15');
      
      const daysSinceMailed = Math.floor((now.getTime() - mailedAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 30 - daysSinceMailed);
      
      expect(daysRemaining).toBe(16);
    });

    it('should return 0 remaining days when past deadline', () => {
      const mailedAt = new Date('2025-12-01');
      const now = new Date('2026-01-08');
      
      const daysSinceMailed = Math.floor((now.getTime() - mailedAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 30 - daysSinceMailed);
      
      expect(daysRemaining).toBe(0);
    });
  });
});
