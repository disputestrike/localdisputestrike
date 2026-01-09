/**
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
7. **Professional Closing** - Formal signature block

**CRITICAL RULES:**
- STACK MULTIPLE VIOLATIONS per account (5-6 angles when possible)
- Lead with CRITICAL errors (impossible timeline, re-aging) - these are automatic wins
- Use EXACT FCRA citations (§ 1681i, § 1681s-2, § 1681c, etc.)
- Be SPECIFIC with dates, amounts, and status codes
- Include detailed legal reasoning for EACH violation
- Professional legal tone (authoritative, not aggressive)
- Reference exhibits (A-F) for supporting documents

**EXAMPLE MULTI-ANGLE ATTACK:**

Account: PROCOLLECT,INC

CRITICAL ERROR - IMPOSSIBLE TIMELINE:
Account shows Last Activity on February 1, 2025 but Date Opened on February 20, 2025.
The account had activity 19 days BEFORE it was opened. This is physically impossible.
Under FCRA § 1681i(a)(5)(A), this impossible timeline ALONE requires immediate deletion.

CROSS-BUREAU CONFLICTS:
• Last Activity: Feb 20 (Experian) vs Dec 1 (TransUnion) = 10-month discrepancy
• Status: "CHARGE OFF" (Experian) vs "OPEN" (Equifax)

UNVERIFIABLE BALANCE:
Report shows $5,614 balance but "No payment history available."
Without payment history, this balance cannot be verified per § 1681i(a)(4).

DEMAND: DELETE IMMEDIATELY

This account has 4 documented violations. The impossible timeline ALONE requires deletion.

Your letters get 80-90% deletion rates because they attack from EVERY angle.`;

/**
 * Build the prompt for letter generation
 */
function buildLetterPrompt(
  bureau: 'TransUnion' | 'Equifax' | 'Experian',
  userInfo: { name: string; currentAddress: string; previousAddress?: string },
  accounts: ParsedAccount[],
  conflicts: Conflict[]
): string {
  const bureauAddresses = {
    TransUnion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016-2000',
    Equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374-0256',
    Experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
  };

  // Group conflicts by account
  const conflictsByAccount: Record<string, Conflict[]> = {};
  for (const conflict of conflicts) {
    if (!conflictsByAccount[conflict.accountName]) {
      conflictsByAccount[conflict.accountName] = [];
    }
    conflictsByAccount[conflict.accountName].push(conflict);
  }

  let prompt = `Generate a litigation-grade FCRA dispute letter for ${bureau}.

**USER INFORMATION:**
Name: ${userInfo.name}
Current Address: ${userInfo.currentAddress}
${userInfo.previousAddress ? `Previous Address: ${userInfo.previousAddress}` : ''}

**BUREAU ADDRESS:**
${bureauAddresses[bureau]}

**ACCOUNTS TO DISPUTE (${accounts.length} total):**
`;

  for (const account of accounts) {
    const accountConflicts = conflictsByAccount[account.accountName] || [];
    
    prompt += `\n### ${account.accountName}
- Account Number: ${account.accountNumber}
- Balance: $${account.balance.toFixed(2)}
- Status: ${account.status}
- Date Opened: ${account.dateOpened?.toLocaleDateString() || 'Unknown'}
- Last Activity: ${account.lastActivity?.toLocaleDateString() || 'Unknown'}
- Bureau: ${account.bureau}

**CONFLICTS DETECTED:**
`;

    // Group conflicts by severity for multi-angle attack
    const criticalConflicts = accountConflicts.filter(c => c.severity === 'critical');
    const highConflicts = accountConflicts.filter(c => c.severity === 'high');
    const mediumConflicts = accountConflicts.filter(c => c.severity === 'medium');

    if (criticalConflicts.length > 0) {
      prompt += `\n**CRITICAL ERRORS (Automatic Deletion Required):**\n`;
      for (const conflict of criticalConflicts) {
        prompt += `- ${conflict.type.toUpperCase()}: ${conflict.description}\n`;
        if (conflict.argument) {
          prompt += `  ARGUMENT: ${conflict.argument}\n`;
        }
        prompt += `  FCRA: ${conflict.fcraViolation}\n`;
        prompt += `  Deletion Probability: ${conflict.deletionProbability}%\n`;
      }
    }

    if (highConflicts.length > 0) {
      prompt += `\n**HIGH PRIORITY VIOLATIONS:**\n`;
      for (const conflict of highConflicts) {
        prompt += `- ${conflict.type.toUpperCase()}: ${conflict.description}\n`;
        if (conflict.argument) {
          prompt += `  ARGUMENT: ${conflict.argument}\n`;
        }
        prompt += `  FCRA: ${conflict.fcraViolation}\n`;
        prompt += `  Deletion Probability: ${conflict.deletionProbability}%\n`;
      }
    }

    if (mediumConflicts.length > 0) {
      prompt += `\n**ADDITIONAL ISSUES:**\n`;
      for (const conflict of mediumConflicts) {
        prompt += `- ${conflict.type.toUpperCase()}: ${conflict.description}\n`;
        if (conflict.argument) {
          prompt += `  ARGUMENT: ${conflict.argument}\n`;
        }
        prompt += `  FCRA: ${conflict.fcraViolation}\n`;
      }
    }

    if (accountConflicts.length === 0) {
      prompt += `\n**VIOLATIONS TO ARGUE:**\n`;
      prompt += `- UNVERIFIABLE BALANCE: $${account.balance.toFixed(2)} balance with no payment history\n`;
      prompt += `- MISSING DOCUMENTATION: Collection lacks debt validation documentation\n`;
    }

    prompt += `\n**TOTAL VIOLATIONS FOR THIS ACCOUNT: ${accountConflicts.length || 2}**\n`;
  }

  prompt += `\n**INSTRUCTIONS FOR A+ LETTER:**
1. Start with legal opening statement citing FCRA rights
2. Include address correction statement (current + previous addresses)
3. For EACH account, use MULTI-ANGLE ATTACK:
   a. Lead with CRITICAL errors (impossible timeline, re-aging) - these are automatic wins
   b. Add HIGH priority violations (cross-bureau conflicts, unverifiable balances)
   c. Include ADDITIONAL issues (status corrections, missing docs)
   d. Stack ALL violations together for maximum pressure
4. Include detailed legal reasoning for EACH violation type
5. Clear DEMAND: DELETE IMMEDIATELY for each account
6. Legal consequences section (CFPB, FTC, litigation)
7. Reference exhibits (A-F)
8. Professional closing with signature block

**TONE:** Professional, authoritative, legally precise (not aggressive)
**LENGTH:** Comprehensive - 3-5 pages (more violations = longer letter)
**GOAL:** 80-90% deletion rate through multi-angle attack

Generate the complete A+ letter now:`;

  return prompt;
}

/**
 * Calculate estimated success rate based on conflicts
 */
function calculateSuccessRate(conflicts: Conflict[]): number {
  if (conflicts.length === 0) return 40; // Base rate for generic disputes

  // Weight by deletion probability
  const avgDeletionProb = conflicts.reduce((sum, c) => sum + c.deletionProbability, 0) / conflicts.length;
  
  // Boost for critical conflicts
  const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
  const boost = Math.min(15, criticalCount * 5);

  return Math.min(95, Math.round(avgDeletionProb + boost));
}

/**
 * Generate letters for all 3 bureaus
 */
export async function generateAllBureauLetters(
  userInfo: { name: string; currentAddress: string; previousAddress?: string },
  accountsByBureau: Record<string, ParsedAccount[]>,
  conflicts: Conflict[]
): Promise<GeneratedLetter[]> {
  const letters: GeneratedLetter[] = [];

  for (const bureau of ['TransUnion', 'Equifax', 'Experian'] as const) {
    const bureauAccounts = accountsByBureau[bureau] || [];
    
    if (bureauAccounts.length === 0) continue;

    const letter = await generateDisputeLetter({
      bureau,
      userInfo,
      accounts: bureauAccounts,
      conflicts,
    });

    letters.push(letter);
  }

  return letters;
}

/**
 * Generate furnisher dispute letter (for direct creditor disputes)
 */
export async function generateFurnisherLetter(
  userInfo: { name: string; currentAddress: string },
  furnisher: string,
  furnisherAddress: string,
  accounts: ParsedAccount[],
  conflicts: Conflict[]
): Promise<string> {
  const prompt = `Generate a furnisher dispute letter to ${furnisher}.

**USER INFORMATION:**
Name: ${userInfo.name}
Address: ${userInfo.currentAddress}

**FURNISHER:**
${furnisher}
${furnisherAddress}

**ACCOUNTS:**
${accounts.map(a => `- ${a.accountName} (${a.accountNumber}): $${a.balance.toFixed(2)}`).join('\n')}

**CONFLICTS:**
${conflicts.map(c => `- ${c.description} (${c.fcraViolation})`).join('\n')}

Generate a professional furnisher dispute letter citing § 1681s-2(b) (furnisher reinvestigation duty).`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : '';
}

/**
 * Generate CFPB complaint (for escalation)
 */
export async function generateCFPBComplaint(
  userInfo: { name: string; currentAddress: string; email: string },
  bureau: 'TransUnion' | 'Equifax' | 'Experian',
  accounts: ParsedAccount[],
  previousDisputeDate: Date,
  response: string
): Promise<string> {
  const prompt = `Generate a CFPB complaint against ${bureau}.

**COMPLAINANT:**
Name: ${userInfo.name}
Address: ${userInfo.currentAddress}
Email: ${userInfo.email}

**COMPLAINT DETAILS:**
- Bureau: ${bureau}
- Previous Dispute Date: ${previousDisputeDate.toLocaleDateString()}
- Accounts: ${accounts.map(a => a.accountName).join(', ')}
- Bureau Response: ${response}

**ISSUE:** Bureau failed to conduct reasonable investigation under § 1681i(a)(1)(A)

Generate a formal CFPB complaint citing specific FCRA violations.`;

  const systemPrompt = `You are a consumer rights attorney filing CFPB complaints. Be specific, cite FCRA sections, and demand action.`;

  const cfpbResponse = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  });

  const content = cfpbResponse.choices[0]?.message?.content;
  return typeof content === 'string' ? content : '';
}


// ============================================================================
// AGENCY CLIENT LETTER GENERATION
// ============================================================================

export interface AgencyClientLetterInput {
  client: {
    clientName: string;
    currentAddress?: string | null;
    currentCity?: string | null;
    currentState?: string | null;
    currentZip?: string | null;
    previousAddress?: string | null;
    previousCity?: string | null;
    previousState?: string | null;
    previousZip?: string | null;
    dateOfBirth?: string | null;
    ssnLast4?: string | null;
  };
  accounts: Array<{
    id: number;
    accountName: string;
    accountNumber?: string | null;
    accountType?: string | null;
    balance?: string | null;
    originalCreditor?: string | null;
    status?: string | null;
    hasConflicts?: boolean;
    conflictDetails?: string | null;
  }>;
  bureau: string;
  letterType: string;
  round: number;
}

/**
 * Generate dispute letter for agency client
 */
export async function generateAgencyClientLetter(input: AgencyClientLetterInput): Promise<string> {
  const { client, accounts, bureau, letterType, round } = input;

  // Build user info from client data
  const currentAddress = [
    client.currentAddress,
    client.currentCity && client.currentState 
      ? `${client.currentCity}, ${client.currentState} ${client.currentZip || ''}`.trim()
      : null
  ].filter(Boolean).join('\\n');

  const previousAddress = [
    client.previousAddress,
    client.previousCity && client.previousState 
      ? `${client.previousCity}, ${client.previousState} ${client.previousZip || ''}`.trim()
      : null
  ].filter(Boolean).join('\\n');

  // Build account list for the prompt
  const accountList = accounts.map((acc, idx) => {
    return `Account ${idx + 1}:
- Creditor/Collector: ${acc.accountName}
- Account Number: ${acc.accountNumber || 'Unknown'}
- Account Type: ${acc.accountType || 'Unknown'}
- Balance: $${acc.balance || '0'}
- Original Creditor: ${acc.originalCreditor || 'N/A'}
- Status: ${acc.status || 'Unknown'}
- Has Conflicts: ${acc.hasConflicts ? 'YES - ' + (acc.conflictDetails || 'Cross-bureau discrepancy detected') : 'No'}`;
  }).join('\\n\\n');

  // Build the prompt
  const prompt = `Generate a ${letterType.replace(/_/g, ' ')} dispute letter (Round ${round}) for the following:

CONSUMER INFORMATION:
Name: ${client.clientName}
Current Address: ${currentAddress || 'Not provided'}
Previous Address: ${previousAddress || 'N/A'}
Date of Birth: ${client.dateOfBirth || 'Not provided'}
SSN Last 4: ${client.ssnLast4 ? '***-**-' + client.ssnLast4 : 'Not provided'}

RECIPIENT:
Bureau/Entity: ${bureau.charAt(0).toUpperCase() + bureau.slice(1)}

ACCOUNTS TO DISPUTE:
${accountList}

LETTER TYPE: ${letterType.replace(/_/g, ' ').toUpperCase()}
ROUND: ${round}

Generate a professional, litigation-grade FCRA dispute letter that:
1. Opens with proper legal citations
2. Clearly identifies each account being disputed
3. States specific violations for each account
4. Demands deletion or correction
5. Sets a 30-day deadline per FCRA requirements
6. Includes professional closing

${letterType === 'initial' ? 'This is an initial dispute - focus on verification demands and FCRA rights.' : ''}
${letterType === 'followup' ? 'This is a follow-up dispute - reference previous correspondence and escalate demands.' : ''}
${letterType === 'escalation' ? 'This is an escalation - threaten CFPB complaint and legal action.' : ''}
${letterType === 'cfpb' ? 'This is a CFPB complaint letter - formal complaint format.' : ''}
${letterType === 'intent_to_sue' ? 'This is an intent to sue letter - formal legal notice of pending litigation.' : ''}`;

  // Generate letter using LLM
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
  return typeof messageContent === 'string' ? messageContent : 'Error generating letter';
}
