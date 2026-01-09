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
const SYSTEM_PROMPT = `You are an expert credit dispute attorney who writes litigation-grade FCRA dispute letters.

Your letters MUST follow this exact 10/10 structure:

1. **Legal Opening Statement** - Establish FCRA rights immediately
2. **Address & Name Correction** - State correct information upfront
3. **Cross-Bureau Conflicts Section** - This is the PRIMARY argument
4. **Account-by-Account Analysis** - For each disputed account:
   - "Account Information You Report"
   - "What Other Bureaus Report"
   - "VIOLATIONS IDENTIFIED" (numbered list)
   - "LEGAL REQUIREMENT FOR DELETION"
   - "DEMAND" (clear: DELETE or CORRECT)
5. **Legal Consequences** - CFPB, FTC, litigation threats
6. **30-Day Deadline** - Cite § 1681i(a)(3)(A)
7. **Professional Exhibits** - List all supporting documents
8. **Professional Closing** - Formal signature block

CRITICAL RULES:
- Use EXACT FCRA citations (§ 1681i, § 1681s-2, etc.)
- Lead with CROSS-BUREAU CONFLICTS (strongest argument)
- Be specific with dates, amounts, and status codes
- Use professional legal tone (not aggressive, just authoritative)
- Include "DEMAND: DELETE this account" for each violation
- Reference exhibits (A-F) for supporting documents
- Keep paragraphs concise and scannable

Your letters get 70-85% deletion rates because they're LEGALLY BULLETPROOF.`;

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

    if (accountConflicts.length > 0) {
      for (const conflict of accountConflicts) {
        prompt += `- ${conflict.type.toUpperCase()}: ${conflict.description}
  - Severity: ${conflict.severity}
  - FCRA Violation: ${conflict.fcraViolation}
  - Details: ${JSON.stringify(conflict.details)}
  - Deletion Probability: ${conflict.deletionProbability}%
`;
      }
    } else {
      prompt += `- No cross-bureau conflicts detected for this account
- Dispute based on: Unverifiable balance, missing documentation
`;
    }
  }

  prompt += `\n**INSTRUCTIONS:**
1. Start with legal opening statement citing FCRA rights
2. Include address correction statement (current + previous addresses)
3. Lead with cross-bureau conflicts as PRIMARY argument
4. For each account, provide detailed analysis with:
   - What ${bureau} reports
   - What other bureaus report (if conflicts exist)
   - Specific FCRA violations
   - Clear DEMAND (DELETE or CORRECT)
5. Include legal consequences section
6. Reference exhibits (A-F)
7. Professional closing with signature block

**TONE:** Professional, authoritative, legally precise (not aggressive)
**LENGTH:** Comprehensive but scannable (2-3 pages)
**GOAL:** 70-85% deletion rate

Generate the complete letter now:`;

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
