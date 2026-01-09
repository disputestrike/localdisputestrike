import { describe, it, expect } from 'vitest';
import {
  analyzeAccounts,
  generateExhibitSection,
  generateSummaryTable,
  generateConsequencesSection,
  generateMailingInstructions,
  postProcessLetter,
  generateCoverPage,
  AccountData,
} from './letterPostProcessor';

describe('Letter Post-Processor', () => {
  const mockAccounts: AccountData[] = [
    {
      id: 1,
      accountName: 'Test Collection',
      creditorName: 'ABC Collections',
      accountNumber: '123456',
      accountType: 'Collection',
      status: 'Open',
      balance: '1500',
      dateOpened: '2025-02-20',
      lastActivity: '2025-02-01', // IMPOSSIBLE: before dateOpened
    },
    {
      id: 2,
      accountName: 'Credit Card',
      creditorName: 'Big Bank',
      accountNumber: '789012',
      accountType: 'Credit Card',
      status: 'Charged Off',
      balance: '5000',
      dateOpened: '2020-01-15',
      lastActivity: '2024-12-01',
    },
    {
      id: 3,
      accountName: 'Auto Loan',
      creditorName: 'Car Finance',
      accountNumber: '345678',
      accountType: 'Installment',
      status: 'Late',
      balance: '500',
      dateOpened: null,
      lastActivity: 'Unknown',
    },
  ];

  describe('analyzeAccounts', () => {
    it('should detect impossible timeline when lastActivity < dateOpened', () => {
      const analysis = analyzeAccounts(mockAccounts);
      
      expect(analysis.hasImpossibleTimeline).toBe(true);
      expect(analysis.impossibleTimelineAccounts).toHaveLength(1);
      expect(analysis.impossibleTimelineAccounts[0].id).toBe(1);
    });

    it('should assign CRITICAL severity to impossible timeline accounts', () => {
      const analysis = analyzeAccounts(mockAccounts);
      
      expect(analysis.severityGrades.get(1)).toBe('CRITICAL');
    });

    it('should assign HIGH severity to accounts with missing dates', () => {
      const analysis = analyzeAccounts(mockAccounts);
      
      expect(analysis.severityGrades.get(3)).toBe('HIGH');
    });

    it('should assign HIGH severity to high balance accounts', () => {
      const analysis = analyzeAccounts(mockAccounts);
      
      // Account 2 has $5000 balance, should be HIGH
      expect(analysis.severityGrades.get(2)).toBe('HIGH');
    });
  });

  describe('generateExhibitSection', () => {
    it('should include exhibit labels A, B, C', () => {
      const section = generateExhibitSection('transunion', 'January 8, 2026');
      
      expect(section).toContain('Exhibit A');
      expect(section).toContain('Exhibit B');
      expect(section).toContain('Exhibit C');
    });

    it('should include checkbox characters', () => {
      const section = generateExhibitSection('equifax', 'January 8, 2026');
      
      expect(section).toContain('☐');
    });

    it('should include the bureau name', () => {
      const section = generateExhibitSection('experian', 'January 8, 2026');
      
      expect(section).toContain('Experian');
    });
  });

  describe('generateSummaryTable', () => {
    it('should include table headers', () => {
      const analysis = analyzeAccounts(mockAccounts);
      const table = generateSummaryTable(mockAccounts, analysis);
      
      expect(table).toContain('ACCOUNT');
      expect(table).toContain('DEMAND');
      expect(table).toContain('BASIS');
    });

    it('should include DELETE demand for each account', () => {
      const analysis = analyzeAccounts(mockAccounts);
      const table = generateSummaryTable(mockAccounts, analysis);
      
      expect(table).toContain('DELETE');
    });

    it('should flag impossible timeline accounts', () => {
      const analysis = analyzeAccounts(mockAccounts);
      const table = generateSummaryTable(mockAccounts, analysis);
      
      expect(table).toContain('IMPOSSIBLE TIMELINE');
    });
  });

  describe('generateConsequencesSection', () => {
    it('should include CFPB', () => {
      const section = generateConsequencesSection();
      
      expect(section).toContain('Consumer Financial Protection Bureau (CFPB)');
    });

    it('should include FTC', () => {
      const section = generateConsequencesSection();
      
      expect(section).toContain('Federal Trade Commission (FTC)');
    });

    it('should include State Attorney General', () => {
      const section = generateConsequencesSection();
      
      expect(section).toContain('State Attorney General');
    });

    it('should include statutory damages citation', () => {
      const section = generateConsequencesSection();
      
      expect(section).toContain('§ 1681n');
      expect(section).toContain('$100 to $1,000');
    });
  });

  describe('generateMailingInstructions', () => {
    it('should include certified mail instructions', () => {
      const instructions = generateMailingInstructions('transunion');
      
      expect(instructions).toContain('Certified Mail');
      expect(instructions).toContain('Return Receipt');
    });

    it('should include correct bureau address', () => {
      const tuInstructions = generateMailingInstructions('transunion');
      expect(tuInstructions).toContain('Chester, PA');
      
      const eqInstructions = generateMailingInstructions('equifax');
      expect(eqInstructions).toContain('Atlanta, GA');
      
      const exInstructions = generateMailingInstructions('experian');
      expect(exInstructions).toContain('Allen, TX');
    });

    it('should not include platform branding (letters come from user)', () => {
      const instructions = generateMailingInstructions('transunion');
      
      // Letters are personal correspondence from the user, not the platform
      expect(instructions).not.toContain('DisputeStrike');
      expect(instructions).toContain('HOW TO MAIL THIS LETTER');
    });
  });

  describe('postProcessLetter', () => {
    const rawLetter = `Dear TransUnion,

I am writing to dispute inaccurate information on my credit report.

Account 1: ABC Collections - This account is inaccurate.

Sincerely,
John Doe`;

    it('should add summary table if missing', () => {
      const processed = postProcessLetter(rawLetter, mockAccounts, 'transunion', 'John Doe');
      
      expect(processed).toContain('SUMMARY OF DEMANDS');
    });

    it('should add exhibit section if missing', () => {
      const processed = postProcessLetter(rawLetter, mockAccounts, 'transunion', 'John Doe');
      
      expect(processed).toContain('Exhibit A');
      expect(processed).toContain('ENCLOSURES');
    });

    it('should add consequences section with agency threats if missing', () => {
      const processed = postProcessLetter(rawLetter, mockAccounts, 'transunion', 'John Doe');
      
      expect(processed).toContain('CFPB');
    });

    it('should add mailing instructions', () => {
      const processed = postProcessLetter(rawLetter, mockAccounts, 'transunion', 'John Doe');
      
      expect(processed).toContain('HOW TO MAIL THIS LETTER');
    });
  });

  describe('generateCoverPage', () => {
    it('should include account count', () => {
      const cover = generateCoverPage(mockAccounts, 'transunion', 'John Doe');
      
      expect(cover).toContain('3 total');
    });

    it('should include severity breakdown', () => {
      const cover = generateCoverPage(mockAccounts, 'transunion', 'John Doe');
      
      expect(cover).toContain('CRITICAL ERRORS');
      expect(cover).toContain('HIGH PRIORITY');
    });

    it('should warn about impossible timeline if detected', () => {
      const cover = generateCoverPage(mockAccounts, 'transunion', 'John Doe');
      
      expect(cover).toContain('IMPOSSIBLE TIMELINE DETECTED');
    });

    it('should include bureau name', () => {
      const cover = generateCoverPage(mockAccounts, 'equifax', 'John Doe');
      
      expect(cover).toContain('Equifax');
    });
  });
});
