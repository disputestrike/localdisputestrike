/**
 * Tests for improved A+ conflict detection modules
 */
import { describe, it, expect } from 'vitest';
import { detectConflicts, type ConflictAnalysis } from './conflictDetector';
import type { ParsedAccount } from './creditReportParser';

describe('A+ Conflict Detection Modules', () => {
  describe('Balance Discrepancy Detection', () => {
    it('should detect large balance discrepancies across bureaus', () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: 'TEST CREDITOR',
          accountNumber: '12345',
          balance: 2552,
          status: 'Collection',
          bureau: 'transunion',
          dateOpened: new Date('2023-01-01'),
          lastActivity: new Date('2023-06-01'),
        },
        {
          accountName: 'TEST CREDITOR',
          accountNumber: '12345',
          balance: 10914,
          status: 'Collection',
          bureau: 'equifax',
          dateOpened: new Date('2023-01-01'),
          lastActivity: new Date('2023-06-01'),
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should detect balance discrepancy
      const balanceConflict = result.conflicts.find(c => c.type === 'balance');
      expect(balanceConflict).toBeDefined();
      expect(balanceConflict?.severity).toBe('critical'); // $8362 difference is critical
      expect(balanceConflict?.argument).toContain('IRRECONCILABLE BALANCE DISCREPANCY');
    });
  });

  describe('Duplicate Account Detection', () => {
    it('should detect multiple accounts with same balance', () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: 'OPPLOANS',
          accountNumber: 'LAI036A',
          balance: 3749,
          status: 'Charge-off',
          bureau: 'transunion',
          dateOpened: new Date('2024-04-03'),
          lastActivity: new Date('2024-06-01'),
        },
        {
          accountName: 'OPPLOANS',
          accountNumber: 'LAI036B',
          balance: 3749,
          status: 'Charge-off',
          bureau: 'equifax',
          dateOpened: new Date('2024-04-03'),
          lastActivity: new Date('2024-06-01'),
        },
        {
          accountName: 'OPPLOANS',
          accountNumber: 'LAI036C',
          balance: 3749,
          status: 'Charge-off',
          bureau: 'experian',
          dateOpened: new Date('2024-04-03'),
          lastActivity: new Date('2024-06-01'),
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should detect duplicate pattern
      const duplicateConflict = result.conflicts.find(c => c.type === 'duplicate');
      expect(duplicateConflict).toBeDefined();
      expect(duplicateConflict?.argument).toContain('DUPLICATE REPORTING');
    });
  });

  describe('Status Correction Detection', () => {
    it('should detect paid accounts with negative status', () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: 'NAVY FEDERAL',
          accountNumber: '99999',
          balance: 0,
          status: 'Charge-off',
          bureau: 'transunion',
          dateOpened: new Date('2020-01-01'),
          lastActivity: new Date('2023-01-01'),
          rawData: '100% on time payments',
        },
        {
          accountName: 'NAVY FEDERAL',
          accountNumber: '99999',
          balance: 0,
          status: 'Closed',
          bureau: 'equifax',
          dateOpened: new Date('2020-01-01'),
          lastActivity: new Date('2023-01-01'),
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should detect status correction needed
      const statusConflict = result.conflicts.find(c => c.type === 'status_correction');
      expect(statusConflict).toBeDefined();
      expect(statusConflict?.argument).toContain('paid');
    });
  });

  describe('Unverifiable Balance Detection', () => {
    it('should detect balance with no payment history', () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: 'COLLECTION AGENCY',
          accountNumber: '55555',
          balance: 3001,
          status: 'Collection',
          bureau: 'transunion',
          dateOpened: new Date('2023-01-01'),
          lastActivity: new Date('2023-06-01'),
          rawData: 'First Payment Never Received',
        },
        {
          accountName: 'COLLECTION AGENCY',
          accountNumber: '55555',
          balance: 3001,
          status: 'Collection',
          bureau: 'equifax',
          dateOpened: new Date('2023-01-01'),
          lastActivity: new Date('2023-06-01'),
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should detect unverifiable balance
      const unverifiableConflict = result.conflicts.find(c => c.type === 'unverifiable_balance');
      expect(unverifiableConflict).toBeDefined();
      expect(unverifiableConflict?.argument).toContain('UNVERIFIABLE BALANCE');
    });
  });

  describe('Critical Error Count', () => {
    it('should properly count critical errors', () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: 'IMPOSSIBLE ACCOUNT',
          accountNumber: '11111',
          balance: 5000,
          status: 'Charge-off',
          bureau: 'transunion',
          dateOpened: new Date('2025-02-20'),
          lastActivity: new Date('2025-02-01'), // Activity BEFORE opened - impossible
        },
        {
          accountName: 'IMPOSSIBLE ACCOUNT',
          accountNumber: '11111',
          balance: 5000,
          status: 'Charge-off',
          bureau: 'equifax',
          dateOpened: new Date('2025-02-20'),
          lastActivity: new Date('2025-02-01'),
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should have critical conflicts
      expect(result.criticalConflicts).toBeGreaterThan(0);
      
      // Should detect impossible timeline
      const impossibleConflict = result.conflicts.find(c => c.type === 'impossible_timeline');
      expect(impossibleConflict).toBeDefined();
      expect(impossibleConflict?.severity).toBe('critical');
    });
  });
});
