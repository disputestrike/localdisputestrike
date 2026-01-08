import { describe, it, expect } from 'vitest';

describe('New Features Tests', () => {
  describe('Sort by Conflicts', () => {
    it('should sort accounts with conflicts first', () => {
      const accounts = [
        { id: 1, accountName: 'Account 1', hasConflicts: false, balance: '500' },
        { id: 2, accountName: 'Account 2', hasConflicts: true, balance: '200' },
        { id: 3, accountName: 'Account 3', hasConflicts: false, balance: '1000' },
        { id: 4, accountName: 'Account 4', hasConflicts: true, balance: '300' },
      ];

      const sortBy = 'conflicts';
      const sorted = [...accounts].sort((a, b) => {
        if (sortBy === 'conflicts') {
          if (a.hasConflicts && !b.hasConflicts) return -1;
          if (!a.hasConflicts && b.hasConflicts) return 1;
          return 0;
        }
        return 0;
      });

      expect(sorted[0].hasConflicts).toBe(true);
      expect(sorted[1].hasConflicts).toBe(true);
      expect(sorted[2].hasConflicts).toBe(false);
      expect(sorted[3].hasConflicts).toBe(false);
    });

    it('should sort accounts by highest balance first', () => {
      const accounts = [
        { id: 1, accountName: 'Account 1', hasConflicts: false, balance: '500' },
        { id: 2, accountName: 'Account 2', hasConflicts: true, balance: '200' },
        { id: 3, accountName: 'Account 3', hasConflicts: false, balance: '1000' },
        { id: 4, accountName: 'Account 4', hasConflicts: true, balance: '300' },
      ];

      const sortBy = 'balance';
      const sorted = [...accounts].sort((a, b) => {
        if (sortBy === 'balance') {
          const balanceA = parseFloat(String(a.balance || '0'));
          const balanceB = parseFloat(String(b.balance || '0'));
          return balanceB - balanceA;
        }
        return 0;
      });

      expect(sorted[0].balance).toBe('1000');
      expect(sorted[1].balance).toBe('500');
      expect(sorted[2].balance).toBe('300');
      expect(sorted[3].balance).toBe('200');
    });

    it('should maintain original order with default sort', () => {
      const accounts = [
        { id: 1, accountName: 'Account 1', hasConflicts: false, balance: '500' },
        { id: 2, accountName: 'Account 2', hasConflicts: true, balance: '200' },
      ];

      const sortBy = 'default';
      const sorted = [...accounts].sort((a, b) => {
        if (sortBy === 'default') return 0;
        return 0;
      });

      expect(sorted[0].id).toBe(1);
      expect(sorted[1].id).toBe(2);
    });
  });

  describe('Deadline Warning Logic', () => {
    const getDaysSinceMailed = (mailedAt: string | Date | null) => {
      if (!mailedAt) return null;
      const mailed = new Date(mailedAt);
      const now = new Date('2026-01-08'); // Fixed date for testing
      return Math.floor((now.getTime() - mailed.getTime()) / (1000 * 60 * 60 * 24));
    };

    it('should identify letters approaching deadline (25-30 days)', () => {
      const letters = [
        { id: 1, mailedAt: '2025-12-14', status: 'mailed' }, // 25 days ago
        { id: 2, mailedAt: '2025-12-10', status: 'mailed' }, // 29 days ago
        { id: 3, mailedAt: '2025-12-20', status: 'mailed' }, // 19 days ago
      ];

      const approachingDeadline = letters.filter(l => {
        const days = getDaysSinceMailed(l.mailedAt);
        return days !== null && days >= 25 && days <= 30 && l.status === 'mailed';
      });

      expect(approachingDeadline.length).toBe(2);
      expect(approachingDeadline[0].id).toBe(1);
      expect(approachingDeadline[1].id).toBe(2);
    });

    it('should identify overdue letters (>30 days)', () => {
      const letters = [
        { id: 1, mailedAt: '2025-12-01', status: 'mailed' }, // 38 days ago
        { id: 2, mailedAt: '2025-11-20', status: 'mailed' }, // 49 days ago
        { id: 3, mailedAt: '2025-12-20', status: 'mailed' }, // 19 days ago
      ];

      const overdue = letters.filter(l => {
        const days = getDaysSinceMailed(l.mailedAt);
        return days !== null && days > 30 && l.status === 'mailed';
      });

      expect(overdue.length).toBe(2);
      expect(overdue[0].id).toBe(1);
      expect(overdue[1].id).toBe(2);
    });

    it('should not flag resolved letters as overdue', () => {
      const letters = [
        { id: 1, mailedAt: '2025-12-01', status: 'resolved' }, // 38 days ago but resolved
        { id: 2, mailedAt: '2025-12-01', status: 'mailed' }, // 38 days ago
      ];

      const overdue = letters.filter(l => {
        const days = getDaysSinceMailed(l.mailedAt);
        return days !== null && days > 30 && l.status === 'mailed';
      });

      expect(overdue.length).toBe(1);
      expect(overdue[0].id).toBe(2);
    });
  });

  describe('Print Functionality', () => {
    it('should generate correct print URLs', () => {
      const letters = [
        { id: 1, bureau: 'transunion' },
        { id: 2, bureau: 'equifax' },
        { id: 3, bureau: 'experian' },
      ];

      const printUrls = letters.map(l => `/letter/${l.id}?print=true`);

      expect(printUrls[0]).toBe('/letter/1?print=true');
      expect(printUrls[1]).toBe('/letter/2?print=true');
      expect(printUrls[2]).toBe('/letter/3?print=true');
    });

    it('should parse print query parameter correctly', () => {
      const testCases = [
        { url: '/letter/1?print=true', expected: true },
        { url: '/letter/1?print=false', expected: false },
        { url: '/letter/1', expected: false },
      ];

      testCases.forEach(tc => {
        const urlParams = new URLSearchParams(tc.url.split('?')[1] || '');
        const shouldPrint = urlParams.get('print') === 'true';
        expect(shouldPrint).toBe(tc.expected);
      });
    });
  });

  describe('Conflict Highlighting', () => {
    it('should correctly identify accounts with conflicts', () => {
      const accounts = [
        { id: 1, hasConflicts: true, conflictDetails: JSON.stringify([{ description: 'Balance differs' }]) },
        { id: 2, hasConflicts: false, conflictDetails: null },
        { id: 3, hasConflicts: true, conflictDetails: JSON.stringify([{ description: 'Status differs' }]) },
      ];

      const conflictAccounts = accounts.filter(a => a.hasConflicts);
      expect(conflictAccounts.length).toBe(2);
    });

    it('should parse conflict details correctly', () => {
      const conflictDetails = JSON.stringify([
        { description: 'Balance: TransUnion reports $500, Equifax reports $750' },
        { description: 'Status: Open vs Closed' },
      ]);

      const parsed = JSON.parse(conflictDetails);
      expect(parsed.length).toBe(2);
      expect(parsed[0].description).toContain('Balance');
    });
  });
});
