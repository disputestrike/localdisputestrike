import { describe, it, expect } from 'vitest';
import { replacePlaceholders } from './letterPostProcessor';

describe('Placeholder Replacement - Fixed for AI output patterns', () => {
  const userData = {
    fullName: 'Benjamin Peter',
    address: '1234 Oak Street, Apartment 101, Dallas, TX 75201',
    phone: '555-123-4567',
    email: 'ben@example.com',
    dob: '01/15/1985',
    ssn4: '1234'
  };

  it('should replace "[Your Name] Benjamin Peter" pattern with just the name', () => {
    const input = '[Your Name] Benjamin Peter [Your Street Address] 45444';
    const result = replacePlaceholders(input, userData);
    
    // Should NOT contain brackets or duplicate names
    expect(result).not.toContain('[Your Name]');
    expect(result).not.toContain('[Your Street Address]');
    expect(result).toContain('Benjamin Peter');
    expect(result).toContain('1234 Oak Street');
    // Should not have "Benjamin Peter Benjamin Peter"
    expect(result).not.toContain('Benjamin Peter Benjamin Peter');
  });

  it('should replace "[Your Phone Number] [Your Email Address]" pattern', () => {
    const input = '[Your Phone Number] [Your Email Address]';
    const result = replacePlaceholders(input, userData);
    
    expect(result).not.toContain('[Your Phone Number]');
    expect(result).not.toContain('[Your Email Address]');
    expect(result).toContain('555-123-4567');
    expect(result).toContain('ben@example.com');
  });

  it('should replace "[Date]" with actual date', () => {
    const input = '[Date]';
    const result = replacePlaceholders(input, userData);
    
    expect(result).not.toContain('[Date]');
    // Should contain month name (e.g., "January")
    expect(result).toMatch(/January|February|March|April|May|June|July|August|September|October|November|December/);
  });

  it('should replace DOB and SSN placeholders', () => {
    const input = 'Date of Birth: [Your DOB] Social Security Number: [Your SSN - Last 4 Digits Only, e.g., XXXX]';
    const result = replacePlaceholders(input, userData);
    
    expect(result).not.toContain('[Your DOB]');
    expect(result).not.toContain('[Your SSN');
    expect(result).toContain('01/15/1985');
    expect(result).toContain('XXX-XX-1234');
  });

  it('should handle the exact AI output pattern from the bug report', () => {
    const input = `[Your Name] Benjamin Peter [Your Street Address] 45444

[Your Phone Number] [Your Email Address]

[Date]

Experian P.O. Box 4500 Allen, TX 75013

RE: DISPUTE OF INACCURATE AND UNVERIFIABLE INFORMATION ON CREDIT REPORT – URGENT FCRA VIOLATIONS Consumer Name: Benjamin Peter Date of Birth: [Your DOB] Social Security Number: [Your SSN - Last 4 Digits Only, e.g., XXXX]`;

    const result = replacePlaceholders(input, userData);
    
    // Should not contain ANY bracket placeholders
    expect(result).not.toMatch(/\[Your [^\]]+\]/);
    expect(result).not.toMatch(/\[DOB\]/);
    expect(result).not.toMatch(/\[SSN[^\]]*\]/);
    
    // Should contain actual values
    expect(result).toContain('Benjamin Peter');
    expect(result).toContain('1234 Oak Street');
    expect(result).toContain('555-123-4567');
    expect(result).toContain('ben@example.com');
    expect(result).toContain('01/15/1985');
    expect(result).toContain('XXX-XX-1234');
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalUserData = {
      fullName: 'John Doe',
      address: '123 Main St'
    };
    
    const input = '[Your Name] [Your Address] [Your Phone Number] [Your Email Address] [Your DOB] [Your SSN - Last 4 Digits]';
    const result = replacePlaceholders(input, minimalUserData);
    
    expect(result).toContain('John Doe');
    expect(result).toContain('123 Main St');
    // Missing fields should be removed (empty string)
    expect(result).not.toContain('[Your Phone Number]');
    expect(result).not.toContain('[Your Email Address]');
  });

  it('should clean up any remaining [Your ...] placeholders', () => {
    const input = '[Your Random Placeholder] should be removed';
    const result = replacePlaceholders(input, userData);
    
    expect(result).not.toContain('[Your Random Placeholder]');
    expect(result).toContain('should be removed');
  });
});
