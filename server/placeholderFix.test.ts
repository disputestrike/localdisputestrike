import { describe, it, expect } from 'vitest';
import { replacePlaceholders, postProcessLetter, generateCoverPage, analyzeAccounts, UserData, AccountData } from './letterPostProcessor';

describe('Placeholder Replacement - CRITICAL FOUNDATION', () => {
  const testUserData: UserData = {
    fullName: 'Benjamin Peter',
    address: '1234 Oak Street\nApartment 101\nDallas, TX 75201',
    previousAddress: '5678 Elm Avenue\nHouston, TX 77001',
    phone: '555-123-4567',
    email: 'ben@example.com',
    dob: '1985-03-15',
    ssn4: '1234',
  };

  it('should replace [Your Name] with actual name', () => {
    const input = 'Dear Bureau,\n\n[Your Name] is disputing the following accounts.';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('Benjamin Peter');
    expect(result).not.toContain('[Your Name]');
  });

  it('should replace [Your Address] with actual address', () => {
    const input = 'My address is [Your Address].';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('1234 Oak Street');
    expect(result).not.toContain('[Your Address]');
  });

  it('should replace [Your Street Address] with actual address', () => {
    const input = '[Your Street Address]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('1234 Oak Street');
    expect(result).not.toContain('[Your Street Address]');
  });

  it('should replace [Date] with today\'s date', () => {
    const input = 'Date: [Date]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).not.toContain('[Date]');
    // Should contain a formatted date like "January 8, 2026"
    expect(result).toMatch(/\w+ \d+, \d{4}/);
  });

  it('should replace [Your DOB] with actual DOB', () => {
    const input = 'Date of Birth: [Your DOB]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('1985-03-15');
    expect(result).not.toContain('[Your DOB]');
  });

  it('should replace [Your SSN - Last 4 Digits] with masked SSN', () => {
    const input = 'SSN: [Your SSN - Last 4 Digits]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('XXX-XX-1234');
    expect(result).not.toContain('[Your SSN - Last 4 Digits]');
  });

  it('should replace [Your Phone Number] with actual phone', () => {
    const input = 'Phone: [Your Phone Number]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('555-123-4567');
    expect(result).not.toContain('[Your Phone Number]');
  });

  it('should replace [Your Email Address] with actual email', () => {
    const input = 'Email: [Your Email Address]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).toContain('ben@example.com');
    expect(result).not.toContain('[Your Email Address]');
  });

  it('should handle case-insensitive placeholders', () => {
    const input = '[your name] and [YOUR NAME] and [Your Name]';
    const result = replacePlaceholders(input, testUserData);
    expect(result).not.toContain('[');
    expect(result).not.toContain(']');
    // Should have the name three times
    expect(result.match(/Benjamin Peter/g)?.length).toBe(3);
  });

  it('should remove DOB line if DOB not provided', () => {
    const userWithoutDob: UserData = { ...testUserData, dob: undefined };
    const input = 'Date of Birth: [Your DOB]\nNext line';
    const result = replacePlaceholders(input, userWithoutDob);
    expect(result).not.toContain('[Your DOB]');
    expect(result).not.toContain('Date of Birth:');
  });

  it('should remove SSN line if SSN not provided', () => {
    const userWithoutSsn: UserData = { ...testUserData, ssn4: undefined };
    const input = 'SSN: [Your SSN - Last 4 Digits]\nNext line';
    const result = replacePlaceholders(input, userWithoutSsn);
    expect(result).not.toContain('[Your SSN - Last 4 Digits]');
  });

  it('should clean up any remaining bracket placeholders', () => {
    const input = '[Your Random Field] should be removed';
    const result = replacePlaceholders(input, testUserData);
    expect(result).not.toContain('[Your Random Field]');
  });
});

describe('Account Analysis', () => {
  it('should detect impossible timeline (Last Activity < Date Opened)', () => {
    const accounts: AccountData[] = [
      {
        id: 1,
        creditorName: 'Test Creditor',
        accountNumber: '12345',
        dateOpened: '2025-02-20',
        lastActivity: '2025-02-01', // 19 days BEFORE opening - IMPOSSIBLE
        balance: 1000,
        status: 'Open',
      },
    ];

    const analysis = analyzeAccounts(accounts);
    expect(analysis.hasImpossibleTimeline).toBe(true);
    expect(analysis.impossibleTimelineAccounts.length).toBe(1);
    expect(analysis.severityGrades.get(1)).toBe('CRITICAL');
  });

  it('should mark high balance accounts as HIGH priority', () => {
    const accounts: AccountData[] = [
      {
        id: 1,
        creditorName: 'Test Creditor',
        accountNumber: '12345',
        dateOpened: '2024-01-01',
        lastActivity: '2025-01-01',
        balance: 5000, // High balance
        status: 'Open',
      },
    ];

    const analysis = analyzeAccounts(accounts);
    expect(analysis.severityGrades.get(1)).toBe('HIGH');
  });

  it('should mark charged-off + past due as CRITICAL', () => {
    const accounts: AccountData[] = [
      {
        id: 1,
        creditorName: 'Test Creditor',
        accountNumber: '12345',
        dateOpened: '2024-01-01',
        lastActivity: '2025-01-01',
        balance: 100,
        status: 'Account charged off. $100 past due.',
      },
    ];

    const analysis = analyzeAccounts(accounts);
    expect(analysis.severityGrades.get(1)).toBe('CRITICAL');
  });
});

describe('Post-Process Letter', () => {
  const testUserData: UserData = {
    fullName: 'Benjamin Peter',
    address: '1234 Oak Street, Dallas, TX 75201',
  };

  const testAccounts: AccountData[] = [
    {
      id: 1,
      creditorName: 'Test Creditor',
      accountNumber: '12345',
      balance: 1000,
      status: 'Open',
    },
  ];

  it('should add Summary of Demands table if missing', () => {
    const rawLetter = 'Dear Bureau,\n\nI dispute these accounts.\n\nSincerely,\nTest User';
    const result = postProcessLetter(rawLetter, testAccounts, 'experian', testUserData);
    expect(result).toContain('SUMMARY OF DEMANDS');
  });

  it('should add Exhibit section if missing', () => {
    const rawLetter = 'Dear Bureau,\n\nI dispute these accounts.\n\nSincerely,\nTest User';
    const result = postProcessLetter(rawLetter, testAccounts, 'experian', testUserData);
    expect(result).toContain('Exhibit A');
    expect(result).toContain('ENCLOSURES CHECKLIST');
  });

  it('should add Consequences section with agency threats if missing', () => {
    const rawLetter = 'Dear Bureau,\n\nI dispute these accounts.\n\nSincerely,\nTest User';
    const result = postProcessLetter(rawLetter, testAccounts, 'experian', testUserData);
    expect(result).toContain('CFPB');
    expect(result).toContain('FTC');
    expect(result).toContain('State Attorney General');
  });

  it('should add mailing instructions', () => {
    const rawLetter = 'Dear Bureau,\n\nI dispute these accounts.\n\nSincerely,\nTest User';
    const result = postProcessLetter(rawLetter, testAccounts, 'experian', testUserData);
    expect(result).toContain('HOW TO MAIL THIS LETTER');
    expect(result).toContain('Certified Mail');
  });

  it('should replace placeholders in the raw letter', () => {
    const rawLetter = 'Dear Bureau,\n\n[Your Name] disputes these accounts.\n\nSincerely,\n[Your Name]';
    const result = postProcessLetter(rawLetter, testAccounts, 'experian', testUserData);
    expect(result).not.toContain('[Your Name]');
    expect(result).toContain('Benjamin Peter');
  });
});

describe('Cover Page Generation', () => {
  const testUserData: UserData = {
    fullName: 'Benjamin Peter',
    address: '1234 Oak Street, Dallas, TX 75201',
  };

  it('should include user name', () => {
    const accounts: AccountData[] = [
      { id: 1, creditorName: 'Test', balance: 1000 },
    ];
    const coverPage = generateCoverPage(accounts, 'experian', testUserData);
    expect(coverPage).toContain('Benjamin Peter');
  });

  it('should include account count', () => {
    const accounts: AccountData[] = [
      { id: 1, creditorName: 'Test1', balance: 1000 },
      { id: 2, creditorName: 'Test2', balance: 2000 },
      { id: 3, creditorName: 'Test3', balance: 3000 },
    ];
    const coverPage = generateCoverPage(accounts, 'experian', testUserData);
    expect(coverPage).toContain('3 total');
  });

  it('should include severity breakdown', () => {
    const accounts: AccountData[] = [
      { id: 1, creditorName: 'Test', balance: 1000 },
    ];
    const coverPage = generateCoverPage(accounts, 'experian', testUserData);
    expect(coverPage).toContain('CRITICAL ERRORS');
    expect(coverPage).toContain('HIGH PRIORITY');
    expect(coverPage).toContain('MEDIUM');
  });

  it('should warn about impossible timeline if detected', () => {
    const accounts: AccountData[] = [
      {
        id: 1,
        creditorName: 'Test',
        dateOpened: '2025-02-20',
        lastActivity: '2025-02-01', // IMPOSSIBLE
        balance: 1000,
      },
    ];
    const coverPage = generateCoverPage(accounts, 'experian', testUserData);
    expect(coverPage).toContain('IMPOSSIBLE TIMELINE DETECTED');
  });
});
