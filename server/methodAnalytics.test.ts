import { describe, it, expect } from 'vitest';
import { 
  getMethodTemplate, 
  getTemplatesByCategory, 
  getTemplatesBySeverity,
  getTemplatesByDeletionProbability,
  generateMethodSection,
  ALL_METHOD_TEMPLATES
} from './letterTemplates';

describe('Method Templates', () => {
  describe('ALL_METHOD_TEMPLATES', () => {
    it('should contain exactly 43 templates', () => {
      expect(ALL_METHOD_TEMPLATES.length).toBe(43);
    });

    it('should have unique method numbers from 1 to 43', () => {
      const methodNumbers = ALL_METHOD_TEMPLATES.map(t => t.methodNumber);
      const uniqueNumbers = new Set(methodNumbers);
      expect(uniqueNumbers.size).toBe(43);
      
      for (let i = 1; i <= 43; i++) {
        expect(methodNumbers).toContain(i);
      }
    });

    it('should have all required fields for each template', () => {
      ALL_METHOD_TEMPLATES.forEach(template => {
        expect(template.methodNumber).toBeGreaterThanOrEqual(1);
        expect(template.methodNumber).toBeLessThanOrEqual(43);
        expect(template.methodName).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.fcraViolation).toBeTruthy();
        expect(template.deletionProbability).toBeGreaterThanOrEqual(0);
        expect(template.deletionProbability).toBeLessThanOrEqual(100);
        expect(['critical', 'high', 'medium', 'low']).toContain(template.severity);
        expect(template.legalBasis).toBeTruthy();
        expect(template.demandLanguage).toBeTruthy();
        expect(template.argumentTemplate).toBeTruthy();
        expect(Array.isArray(template.evidenceRequired)).toBe(true);
        expect(template.escalationPath).toBeTruthy();
      });
    });
  });

  describe('getMethodTemplate', () => {
    it('should return template for valid method number', () => {
      const template = getMethodTemplate(1);
      expect(template).toBeDefined();
      expect(template?.methodNumber).toBe(1);
      expect(template?.methodName).toBe('Date Opened Discrepancy');
    });

    it('should return undefined for invalid method number', () => {
      expect(getMethodTemplate(0)).toBeUndefined();
      expect(getMethodTemplate(44)).toBeUndefined();
      expect(getMethodTemplate(-1)).toBeUndefined();
    });

    it('should return correct template for Re-aging Detection (method 10)', () => {
      const template = getMethodTemplate(10);
      expect(template).toBeDefined();
      expect(template?.methodName).toBe('Re-aging Detection');
      expect(template?.severity).toBe('critical');
      expect(template?.deletionProbability).toBe(95);
    });

    it('should return correct template for Impossible Timeline (method 11)', () => {
      const template = getMethodTemplate(11);
      expect(template).toBeDefined();
      expect(template?.methodName).toBe('Impossible Timeline');
      expect(template?.severity).toBe('critical');
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for date_timeline category', () => {
      const templates = getTemplatesByCategory('date_timeline');
      expect(templates.length).toBe(15);
      templates.forEach(t => {
        expect(t.category).toBe('date_timeline');
        expect(t.methodNumber).toBeGreaterThanOrEqual(1);
        expect(t.methodNumber).toBeLessThanOrEqual(15);
      });
    });

    it('should return templates for balance_payment category', () => {
      const templates = getTemplatesByCategory('balance_payment');
      expect(templates.length).toBe(9);
      templates.forEach(t => {
        expect(t.category).toBe('balance_payment');
      });
    });

    it('should return empty array for invalid category', () => {
      const templates = getTemplatesByCategory('invalid_category');
      expect(templates.length).toBe(0);
    });
  });

  describe('getTemplatesBySeverity', () => {
    it('should return all critical severity templates', () => {
      const templates = getTemplatesBySeverity('critical');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.severity).toBe('critical');
      });
    });

    it('should return all high severity templates', () => {
      const templates = getTemplatesBySeverity('high');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.severity).toBe('high');
      });
    });
  });

  describe('getTemplatesByDeletionProbability', () => {
    it('should return templates sorted by deletion probability descending', () => {
      const templates = getTemplatesByDeletionProbability();
      expect(templates.length).toBe(43);
      
      for (let i = 0; i < templates.length - 1; i++) {
        expect(templates[i].deletionProbability).toBeGreaterThanOrEqual(templates[i + 1].deletionProbability);
      }
    });

    it('should have Reporting Period Exceeded (method 15) at or near the top', () => {
      const templates = getTemplatesByDeletionProbability();
      const method15 = templates.find(t => t.methodNumber === 15);
      expect(method15?.deletionProbability).toBe(98);
    });
  });

  describe('generateMethodSection', () => {
    it('should generate section with replaced variables', () => {
      const template = getMethodTemplate(1)!;
      const section = generateMethodSection(template, {
        bureau1: 'TransUnion',
        bureau2: 'Equifax',
        bureau3: 'Experian',
        date1: '01/15/2020',
        date2: '03/22/2020',
        date3: '05/10/2020'
      });

      expect(section).toContain('Method #1');
      expect(section).toContain('Date Opened Discrepancy');
      expect(section).toContain('TransUnion');
      expect(section).toContain('Equifax');
      expect(section).toContain('Experian');
      expect(section).toContain('01/15/2020');
      expect(section).toContain('03/22/2020');
      expect(section).toContain('05/10/2020');
    });

    it('should include severity and deletion probability', () => {
      const template = getMethodTemplate(10)!;
      const section = generateMethodSection(template, {});

      expect(section).toContain('CRITICAL');
      expect(section).toContain('95%');
    });
  });

  describe('Category Distribution', () => {
    it('should have correct number of methods per category', () => {
      const categoryCount: Record<string, number> = {};
      
      ALL_METHOD_TEMPLATES.forEach(t => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
      });

      expect(categoryCount['date_timeline']).toBe(15);
      expect(categoryCount['balance_payment']).toBe(9);
      expect(categoryCount['creditor_ownership']).toBe(5);
      expect(categoryCount['status_classification']).toBe(5);
      expect(categoryCount['account_identification']).toBe(2);
      expect(categoryCount['legal_procedural']).toBe(2);
      expect(categoryCount['statistical_pattern']).toBe(5);
    });
  });

  describe('High-Value Methods', () => {
    it('should have critical methods with high deletion probability', () => {
      const criticalMethods = [10, 11, 12, 15]; // Re-aging, Impossible Timeline, Future Date, Reporting Period Exceeded
      
      criticalMethods.forEach(methodNum => {
        const template = getMethodTemplate(methodNum);
        expect(template?.severity).toBe('critical');
        expect(template?.deletionProbability).toBeGreaterThanOrEqual(85);
      });
    });

    it('should have Re-aging Detection as one of the highest probability methods', () => {
      const template = getMethodTemplate(10);
      expect(template?.deletionProbability).toBeGreaterThanOrEqual(90);
    });
  });
});
