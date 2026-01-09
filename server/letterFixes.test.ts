import { describe, it, expect } from 'vitest';

describe('Letter Generation Fixes', () => {
  describe('System Prompt Updates', () => {
    it('should not contain DisputeForce branding', async () => {
      // Read the routers.ts file to check branding
      const fs = await import('fs');
      const routersContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      
      // Check that DisputeForce is not in the file
      expect(routersContent).not.toContain('DisputeForce');
      
      // Check that DisputeStrike IS in the file
      expect(routersContent).toContain('DisputeStrike');
    });

    it('should include instructions to avoid placeholder text', async () => {
      const fs = await import('fs');
      const routersContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      
      // Check that the system prompt includes instructions about placeholders
      expect(routersContent).toContain('DO NOT use placeholder text');
      expect(routersContent).toContain('[Your Name]');
      expect(routersContent).toContain('[Date]');
    });

    it('should include instructions for single RE: line', async () => {
      const fs = await import('fs');
      const routersContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      
      // Check that the system prompt includes instructions about single RE: line
      expect(routersContent).toContain('ONE RE: line');
      expect(routersContent).toContain('ONE signature block');
    });
  });

  describe('Build Letter Prompt', () => {
    it('should include formatted date in the prompt', async () => {
      const fs = await import('fs');
      const routersContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      
      // Check that the prompt includes date formatting
      expect(routersContent).toContain("toLocaleDateString('en-US'");
      expect(routersContent).toContain("month: 'long'");
      expect(routersContent).toContain("day: 'numeric'");
      expect(routersContent).toContain("year: 'numeric'");
    });

    it('should include explicit instructions to use actual values', async () => {
      const fs = await import('fs');
      const routersContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      
      // Check that the prompt includes explicit instructions
      expect(routersContent).toContain('IMPORTANT: Use these EXACT values');
      expect(routersContent).toContain('Consumer Name:');
      expect(routersContent).toContain('Consumer Address:');
      expect(routersContent).toContain("Today's Date:");
    });
  });

  describe('Email Service Branding', () => {
    it('should use DisputeStrike branding in email service', async () => {
      const fs = await import('fs');
      const emailContent = fs.readFileSync('./server/emailService.ts', 'utf-8');
      
      // Check that DisputeStrike is used
      expect(emailContent).toContain('DisputeStrike');
      expect(emailContent).not.toContain('DisputeForce');
    });
  });

  describe('PDF Generator Branding', () => {
    it('should use DisputeStrike branding in PDF generator', async () => {
      const fs = await import('fs');
      const pdfContent = fs.readFileSync('./server/pdfGenerator.ts', 'utf-8');
      
      // Check that DisputeStrike is used
      expect(pdfContent).toContain('DisputeStrike');
      expect(pdfContent).not.toContain('DisputeForce');
    });
  });

  describe('Email Notifications Branding', () => {
    it('should use DisputeStrike branding in email notifications', async () => {
      const fs = await import('fs');
      const notifContent = fs.readFileSync('./server/emailNotifications.ts', 'utf-8');
      
      // Check that DisputeStrike is used
      expect(notifContent).toContain('DisputeStrike');
      expect(notifContent).not.toContain('DisputeForce');
    });
  });
});
