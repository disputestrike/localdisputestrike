 * AI Dispute Letter Generator
 * 
 * Generates litigation-grade 10/10 dispute letters using GPT-4
 * Based on the exact templates that got 9.6/10 professional ratings
 */

import { invokeLLM } from './_core/llm';
import type { ParsedAccount } from './creditReportParser';
import type { Conflict } from './conflictDetector';

export interface LetterGenerationInput {
  bureau: 'TransUnion' | 'Equifax' | 'Experian';
  userInfo: {
    name: string;
    currentAddress: string;
    previousAddress?: string;
  };
  accounts: ParsedAccount[];
  conflicts: Conflict[];
}

export interface GeneratedLetter {
  bureau: 'TransUnion' | 'Equifax' | 'Experian';
  content: string;
  accountsDisputed: string[];
  conflictsUsed: number;
  estimatedSuccessRate: number;
}

/**
 * Generate dispute letter for a specific bureau
 */
export async function generateDisputeLetter(input: LetterGenerationInput): Promise<GeneratedLetter> {
  const { bureau, userInfo, accounts, conflicts } = input;

  // Filter conflicts relevant to this bureau
  const bureauConflicts = conflicts.filter(c => c.bureaus.includes(bureau));

  // Build the prompt for GPT-4
  const prompt = buildLetterPrompt(bureau, userInfo, accounts, bureauConflicts);

  // Generate letter using GPT-4
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const messageContent = response.choices[0]?.message?.content;
  const letterContent = typeof messageContent === 'string' ? messageContent : '';

  return {
    bureau,
    content: letterContent,
    accountsDisputed: accounts.map(a => a.accountName),
    conflictsUsed: bureauConflicts.length,
    estimatedSuccessRate: calculateSuccessRate(bureauConflicts),
  };
}

/**
 * System prompt for GPT-4 (defines the 10/10 letter structure)
 */
const SYSTEM_PROMPT = `You are an expert credit dispute attorney who writes A+ litigation-grade FCRA dispute letters.

Your letters MUST attack EACH account from MULTIPLE angles (5-6 violations per account when possible):

**VIOLATION TYPES TO DETECT AND ARGUE:**
1. **IMPOSSIBLE TIMELINE (CRITICAL)** - Activity before account opened = automatic deletion
2. **CROSS-BUREAU CONFLICTS (CRITICAL)** - Different dates, balances, statuses across bureaus
3. **ILLEGAL RE-AGING (CRITICAL)** - Activity after account closed/charged-off
4. **BALANCE DISCREPANCIES (CRITICAL)** - Different balances across bureaus
5. **UNVERIFIABLE BALANCE (HIGH)** - Balance with no payment history documentation
6. **DUPLICATE REPORTING (HIGH)** - Same debt reported multiple times
7. **MISSING DOCUMENTATION (HIGH)** - Collections without debt validation
8. **STATUS CORRECTION (MEDIUM)** - Paid accounts showing negative

**LETTER STRUCTURE (10/10 A+ FORMAT):**

1. **Legal Opening Statement** - Establish FCRA rights immediately
2. **Address & Name Correction** - State correct information upfront
3. **Account-by-Account Analysis** - For EACH disputed account:
   a. "Account Information You Report" (what this bureau shows)
   b. "What Other Bureaus Report" (cross-bureau comparison)
   c. **CRITICAL ERRORS** (impossible timelines, re-aging - lead with these)
   d. **HIGH PRIORITY VIOLATIONS** (cross-bureau conflicts, unverifiable balances)
   e. **ADDITIONAL ISSUES** (status corrections, missing docs)
   f. "LEGAL REQUIREMENT FOR DELETION" (cite specific FCRA sections)
   g. "DEMAND: DELETE IMMEDIATELY" (clear and firm)
4. **Legal Consequences** - CFPB complaint, FTC referral, litigation
5. **30-Day Deadline** - Cite § 1681i(a)(3)(A)
6. **Professional Exhibits** - List supporting documents (A-F)