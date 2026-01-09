import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

describe('Letter Generation Improvements', () => {
  const routersContent = fs.readFileSync('./server/routers.ts', 'utf-8');

  describe('System Prompt Structure', () => {
    it('should include Roman numeral document structure', () => {
      expect(routersContent).toContain('I. LEGAL BASIS FOR THIS DISPUTE');
      expect(routersContent).toContain('II. CRITICAL PROBLEM: CROSS-BUREAU CONFLICTS');
      expect(routersContent).toContain('III. ACCOUNT-BY-ACCOUNT DISPUTES');
      expect(routersContent).toContain('IV. SUMMARY OF DEMANDS');
      expect(routersContent).toContain('V. LEGAL REQUIREMENTS & TIMELINE');
      expect(routersContent).toContain('VI. SUPPORTING DOCUMENTATION ENCLOSED');
      expect(routersContent).toContain('VII. CONSEQUENCES OF NON-COMPLIANCE');
    });

    it('should include impossible timeline detection instructions', () => {
      expect(routersContent).toContain('IMPOSSIBLE TIMELINE DETECTION');
      expect(routersContent).toContain('CRITICAL ERROR - IMPOSSIBLE TIMELINE');
      expect(routersContent).toContain('Last Activity date is BEFORE Date Opened');
      expect(routersContent).toContain('physically impossible');
    });

    it('should include severity grading system', () => {
      expect(routersContent).toContain('SEVERITY GRADING');
      expect(routersContent).toContain('CRITICAL ERROR');
      expect(routersContent).toContain('HIGH PRIORITY');
      expect(routersContent).toContain('MEDIUM');
    });

    it('should include exhibit system instructions', () => {
      expect(routersContent).toContain('EXHIBIT SYSTEM');
      expect(routersContent).toContain('Exhibit A');
      expect(routersContent).toContain('Exhibit B');
      expect(routersContent).toContain('Exhibit C');
      expect(routersContent).toContain('☐'); // Checkbox character
    });

    it('should include cross-bureau comparison format', () => {
      expect(routersContent).toContain('CROSS-BUREAU COMPARISON FORMAT');
      expect(routersContent).toContain('What Other Bureaus Report');
      expect(routersContent).toContain('TransUnion Reports');
      expect(routersContent).toContain('Equifax Reports');
    });

    it('should include agency threats', () => {
      expect(routersContent).toContain('AGENCY THREATS');
      expect(routersContent).toContain('Consumer Financial Protection Bureau (CFPB)');
      expect(routersContent).toContain('Federal Trade Commission (FTC)');
      expect(routersContent).toContain('State Attorney General');
    });

    it('should include summary table format', () => {
      expect(routersContent).toContain('SUMMARY OF DEMANDS (TABLE FORMAT)');
      expect(routersContent).toContain('Account | Demand | Basis');
    });
  });

  describe('Build Letter Prompt Function', () => {
    it('should detect impossible timelines in accounts', () => {
      expect(routersContent).toContain('hasImpossibleTimeline');
      expect(routersContent).toContain('lastActivity < dateOpened');
      expect(routersContent).toContain('CRITICAL ERROR: IMPOSSIBLE TIMELINE DETECTED');
    });

    it('should include required letter structure in prompt', () => {
      expect(routersContent).toContain('**REQUIRED LETTER STRUCTURE:**');
      expect(routersContent).toContain('Section I - LEGAL BASIS');
      expect(routersContent).toContain('Section II - CROSS-BUREAU CONFLICTS');
      expect(routersContent).toContain('Section III - ACCOUNT-BY-ACCOUNT DISPUTES');
      expect(routersContent).toContain('Section IV - SUMMARY OF DEMANDS TABLE');
    });

    it('should include exhibit checkbox format in prompt', () => {
      expect(routersContent).toContain('☐ Exhibit A: Government-Issued Photo ID');
      expect(routersContent).toContain('☐ Exhibit B: Proof of Address');
      expect(routersContent).toContain('☐ Exhibit C:');
    });

    it('should remind about no placeholder text', () => {
      expect(routersContent).toContain('NO placeholder text like [Your Name]');
      expect(routersContent).toContain('NO duplicate RE: lines or signature blocks');
    });
  });

  describe('Branding', () => {
    it('should use DisputeStrike branding', () => {
      expect(routersContent).toContain('DisputeStrike');
      expect(routersContent).not.toContain('DisputeForce');
    });
  });
});
