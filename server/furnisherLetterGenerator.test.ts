import { describe, it, expect } from 'vitest';
import {
  FURNISHER_ADDRESSES,
  detectFurnisherType,
  getStandardDisputeReasons,
  lookupFurnisherAddress,
  buildFurnisherLetterPrompt,
} from './furnisherLetterGenerator';

describe('Furnisher Letter Generator', () => {
  describe('FURNISHER_ADDRESSES', () => {
    it('should have addresses for major banks', () => {
      expect(FURNISHER_ADDRESSES['chase']).toBeDefined();
      expect(FURNISHER_ADDRESSES['chase'].name).toBe('JPMorgan Chase Bank, N.A.');
      expect(FURNISHER_ADDRESSES['bank_of_america']).toBeDefined();
      expect(FURNISHER_ADDRESSES['wells_fargo']).toBeDefined();
      expect(FURNISHER_ADDRESSES['capital_one']).toBeDefined();
    });

    it('should have addresses for major collection agencies', () => {
      expect(FURNISHER_ADDRESSES['midland_credit']).toBeDefined();
      expect(FURNISHER_ADDRESSES['portfolio_recovery']).toBeDefined();
      expect(FURNISHER_ADDRESSES['lvnv_funding']).toBeDefined();
    });

    it('should have addresses for auto lenders', () => {
      expect(FURNISHER_ADDRESSES['ally_financial']).toBeDefined();
      expect(FURNISHER_ADDRESSES['toyota_financial']).toBeDefined();
    });

    it('should have addresses for student loan servicers', () => {
      expect(FURNISHER_ADDRESSES['navient']).toBeDefined();
      expect(FURNISHER_ADDRESSES['nelnet']).toBeDefined();
    });
  });

  describe('detectFurnisherType', () => {
    it('should detect collection agencies', () => {
      expect(detectFurnisherType('Midland Credit Management')).toBe('collection');
      expect(detectFurnisherType('Portfolio Recovery Associates')).toBe('collection');
      expect(detectFurnisherType('ABC Collection Agency')).toBe('collection');
      expect(detectFurnisherType('LVNV Funding')).toBe('collection');
    });

    it('should detect medical collections', () => {
      expect(detectFurnisherType('Medical Collections Inc')).toBe('medical');
      expect(detectFurnisherType('ABC Hospital')).toBe('medical');
      expect(detectFurnisherType('Medicredit')).toBe('medical');
    });

    it('should detect auto lenders', () => {
      expect(detectFurnisherType('Toyota Financial Services')).toBe('auto');
      expect(detectFurnisherType('Honda Financial')).toBe('auto');
      expect(detectFurnisherType('Ally Auto')).toBe('auto');
    });

    it('should detect student loan servicers', () => {
      expect(detectFurnisherType('Navient')).toBe('student');
      expect(detectFurnisherType('Nelnet')).toBe('student');
      expect(detectFurnisherType('Great Lakes Education')).toBe('student');
    });

    it('should detect banks', () => {
      expect(detectFurnisherType('Chase Bank')).toBe('bank');
      expect(detectFurnisherType('Wells Fargo')).toBe('bank');
      expect(detectFurnisherType('Capital One')).toBe('bank');
      expect(detectFurnisherType('Citibank')).toBe('bank');
    });

    it('should return other for unknown furnishers', () => {
      expect(detectFurnisherType('Random Company LLC')).toBe('other');
      expect(detectFurnisherType('XYZ Corp')).toBe('other');
    });
  });

  describe('getStandardDisputeReasons', () => {
    it('should return universal dispute reasons', () => {
      const reasons = getStandardDisputeReasons('Credit Card', 'Open');
      expect(reasons.length).toBeGreaterThanOrEqual(2);
      expect(reasons[0]).toContain('dispute the accuracy');
      expect(reasons[1]).toContain('validation');
    });

    it('should include collection-specific reasons for collections', () => {
      const reasons = getStandardDisputeReasons('Collection', 'In Collections');
      expect(reasons.some(r => r.includes('chain of assignment'))).toBe(true);
      expect(reasons.some(r => r.includes('original obligation'))).toBe(true);
    });

    it('should include charge-off specific reasons', () => {
      const reasons = getStandardDisputeReasons('Credit Card', 'Charged Off');
      expect(reasons.some(r => r.includes('charge-off'))).toBe(true);
    });

    it('should include late payment specific reasons', () => {
      const reasons = getStandardDisputeReasons('Auto Loan', 'Late 30 Days');
      expect(reasons.some(r => r.includes('late payment'))).toBe(true);
    });
  });

  describe('lookupFurnisherAddress', () => {
    it('should find Chase address', () => {
      const result = lookupFurnisherAddress('Chase Bank');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('JPMorgan Chase Bank, N.A.');
      expect(result?.address).toContain('Wilmington');
    });

    it('should find Midland Credit address', () => {
      const result = lookupFurnisherAddress('Midland Credit Management');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Midland Credit Management, Inc.');
      expect(result?.address).toContain('San Diego');
    });

    it('should find Capital One address', () => {
      const result = lookupFurnisherAddress('Capital One');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Capital One');
    });

    it('should return null for unknown furnishers', () => {
      const result = lookupFurnisherAddress('Unknown Company XYZ');
      expect(result).toBeNull();
    });

    it('should use dispute address when available', () => {
      const result = lookupFurnisherAddress('Chase');
      expect(result).not.toBeNull();
      // Chase has a disputeAddress, so it should use that
      expect(result?.address).toContain('5299');
    });
  });

  describe('buildFurnisherLetterPrompt', () => {
    const baseAccount = {
      accountNumber: '1234567890',
      accountType: 'Collection',
      balance: '1500.00',
      status: 'In Collections',
      dateOpened: '2023-01-15',
      lastActivity: '2023-06-01',
      originalCreditor: 'Original Bank',
    };

    it('should build a complete prompt for collection agency', () => {
      const prompt = buildFurnisherLetterPrompt(
        'John Doe',
        '123 Main St, City, ST 12345',
        'Midland Credit Management',
        '350 Camino de la Reina, San Diego, CA 92108',
        baseAccount,
        ['I dispute this debt', 'Request validation'],
        true
      );

      expect(prompt).toContain('John Doe');
      expect(prompt).toContain('Midland Credit Management');
      expect(prompt).toContain('1234567890');
      expect(prompt).toContain('Collection');
      expect(prompt).toContain('COLLECTION AGENCY');
      expect(prompt).toContain('FDCPA');
    });

    it('should build a prompt for regular creditor (not collection)', () => {
      const prompt = buildFurnisherLetterPrompt(
        'Jane Smith',
        '456 Oak Ave, Town, ST 67890',
        'Chase Bank',
        'P.O. Box 15299, Wilmington, DE 19850',
        { ...baseAccount, accountType: 'Credit Card', status: 'Charged Off' },
        ['I dispute the balance', 'Request documentation'],
        false
      );

      expect(prompt).toContain('Jane Smith');
      expect(prompt).toContain('Chase Bank');
      expect(prompt).not.toContain('COLLECTION AGENCY');
    });

    it('should include all account details', () => {
      const prompt = buildFurnisherLetterPrompt(
        'Test User',
        '789 Pine Rd, Village, ST 11111',
        'Test Furnisher',
        'Test Address',
        baseAccount,
        ['Reason 1'],
        false
      );

      expect(prompt).toContain('1234567890');
      expect(prompt).toContain('Collection');
      expect(prompt).toContain('1500.00');
      expect(prompt).toContain('In Collections');
      expect(prompt).toContain('2023-01-15');
      expect(prompt).toContain('2023-06-01');
      expect(prompt).toContain('Original Bank');
    });

    it('should include all dispute reasons', () => {
      const reasons = ['Reason A', 'Reason B', 'Reason C'];
      const prompt = buildFurnisherLetterPrompt(
        'User',
        'Address',
        'Furnisher',
        'Furnisher Address',
        baseAccount,
        reasons,
        false
      );

      expect(prompt).toContain('1. Reason A');
      expect(prompt).toContain('2. Reason B');
      expect(prompt).toContain('3. Reason C');
    });
  });
});
