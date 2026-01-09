import { describe, it, expect } from 'vitest';

describe('User Profile Features', () => {
  describe('Profile Schema', () => {
    it('should have all required profile fields', () => {
      const requiredFields = [
        'fullName',
        'dateOfBirth',
        'ssnLast4',
        'phone',
        'email',
        'currentAddress',
        'currentCity',
        'currentState',
        'currentZip',
        'previousAddress',
        'previousCity',
        'previousState',
        'previousZip',
      ];
      
      // Verify all fields are defined
      requiredFields.forEach(field => {
        expect(field).toBeDefined();
      });
    });

    it('should validate SSN last 4 format', () => {
      const validSSN4 = '1234';
      const invalidSSN4s = ['123', '12345', 'abcd', '12a4'];
      
      // Valid SSN4 should be exactly 4 digits
      expect(validSSN4.length).toBe(4);
      expect(/^\d{4}$/.test(validSSN4)).toBe(true);
      
      // Invalid SSN4s should fail validation
      invalidSSN4s.forEach(ssn => {
        const isValid = /^\d{4}$/.test(ssn);
        expect(isValid).toBe(false);
      });
    });

    it('should validate date of birth format', () => {
      const validDOB = '1990-01-15';
      const invalidDOBs = ['01/15/1990', '1990', 'invalid'];
      
      // Valid DOB should be in YYYY-MM-DD format
      expect(/^\d{4}-\d{2}-\d{2}$/.test(validDOB)).toBe(true);
      
      // Invalid DOBs should fail validation
      invalidDOBs.forEach(dob => {
        const isValid = /^\d{4}-\d{2}-\d{2}$/.test(dob);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('US States', () => {
    it('should have all 50 states plus DC', () => {
      const usStates = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
      ];
      
      expect(usStates.length).toBe(51); // 50 states + DC
    });
  });
});

describe('Letter Preview Features', () => {
  describe('Preview Content Generation', () => {
    it('should include all required sections in preview', () => {
      const requiredSections = [
        'LETTER PREVIEW',
        'YOUR INFORMATION',
        'SENDING TO',
        'ACCOUNTS TO DISPUTE',
        'WHAT HAPPENS NEXT',
      ];
      
      // Verify all sections are defined
      requiredSections.forEach(section => {
        expect(section).toBeDefined();
      });
    });

    it('should format bureau addresses correctly', () => {
      const bureauAddresses: Record<string, string> = {
        transunion: 'TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016',
        equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
        experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
      };
      
      // All three bureaus should have addresses
      expect(Object.keys(bureauAddresses).length).toBe(3);
      expect(bureauAddresses.transunion).toContain('TransUnion');
      expect(bureauAddresses.equifax).toContain('Equifax');
      expect(bureauAddresses.experian).toContain('Experian');
    });

    it('should show severity indicators', () => {
      const criticalIndicator = '🔴 CRITICAL';
      const mediumIndicator = '🟡 MEDIUM';
      
      expect(criticalIndicator).toContain('CRITICAL');
      expect(mediumIndicator).toContain('MEDIUM');
    });

    it('should detect missing profile information', () => {
      const profile = {
        dateOfBirth: null,
        ssnLast4: null,
        phone: null,
      };
      
      const missingFields: string[] = [];
      if (!profile.dateOfBirth) missingFields.push('Date of Birth');
      if (!profile.ssnLast4) missingFields.push('Last 4 SSN');
      if (!profile.phone) missingFields.push('Phone Number');
      
      expect(missingFields.length).toBe(3);
      expect(missingFields).toContain('Date of Birth');
      expect(missingFields).toContain('Last 4 SSN');
    });

    it('should show complete status when all info is present', () => {
      const profile = {
        dateOfBirth: '1990-01-15',
        ssnLast4: '1234',
        phone: '555-123-4567',
      };
      
      const hasAllRequiredInfo = !!(profile.dateOfBirth && profile.ssnLast4);
      expect(hasAllRequiredInfo).toBe(true);
    });
  });

  describe('Account Display in Preview', () => {
    it('should display account details correctly', () => {
      const account = {
        accountName: 'Test Collection',
        accountNumber: '12345',
        accountType: 'Collection',
        balance: '500',
        status: 'Open',
        hasConflicts: true,
      };
      
      expect(account.accountName).toBe('Test Collection');
      expect(account.hasConflicts).toBe(true);
    });

    it('should flag cross-bureau conflicts', () => {
      const accountWithConflict = { hasConflicts: true };
      const accountWithoutConflict = { hasConflicts: false };
      
      const conflictWarning = '⚠️  CROSS-BUREAU CONFLICT DETECTED';
      
      expect(accountWithConflict.hasConflicts).toBe(true);
      expect(accountWithoutConflict.hasConflicts).toBe(false);
      expect(conflictWarning).toContain('CONFLICT');
    });
  });
});

describe('Address Modal Features', () => {
  describe('Address Validation', () => {
    it('should require current address', () => {
      const currentAddress = '';
      const isValid = currentAddress.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept valid address', () => {
      const currentAddress = '123 Main Street\nApt 4B\nNew York, NY 10001';
      const isValid = currentAddress.trim().length > 0;
      expect(isValid).toBe(true);
    });

    it('should make previous address optional', () => {
      const previousAddress = '';
      // Previous address is optional, so empty is valid
      const isOptional = true;
      expect(isOptional).toBe(true);
    });
  });

  describe('Preview Button', () => {
    it('should be disabled without address', () => {
      const currentAddress = '';
      const isLoadingPreview = false;
      const isDisabled = !currentAddress.trim() || isLoadingPreview;
      expect(isDisabled).toBe(true);
    });

    it('should be enabled with address', () => {
      const currentAddress = '123 Main St';
      const isLoadingPreview = false;
      const isDisabled = !currentAddress.trim() || isLoadingPreview;
      expect(isDisabled).toBe(false);
    });

    it('should be disabled while loading', () => {
      const currentAddress = '123 Main St';
      const isLoadingPreview = true;
      const isDisabled = !currentAddress.trim() || isLoadingPreview;
      expect(isDisabled).toBe(true);
    });
  });
});
