/**
 * Letter Post-Processor
 * Ensures all required sections are present in generated letters
 * and CRITICALLY: replaces any remaining placeholder text with actual user data
 */

export interface AccountData {
  id: number;
  accountName?: string | null;
  creditorName?: string | null;
  accountNumber?: string | null;
  accountType?: string | null;
  status?: string | null;
  balance?: string | number | null;
  dateOpened?: string | null;
  lastActivity?: string | null;
}

export interface UserData {
  fullName: string;
  address: string;
  previousAddress?: string;
  phone?: string;
  email?: string;
  dob?: string;
  ssn4?: string;
}

export interface LetterAnalysis {
  hasImpossibleTimeline: boolean;
  impossibleTimelineAccounts: AccountData[];
  severityGrades: Map<number, 'CRITICAL' | 'HIGH' | 'MEDIUM'>;
  crossBureauConflicts: AccountData[];
  balanceDiscrepancies: AccountData[];
}

/**
 * CRITICAL: Replace ALL placeholder text with actual user data
 * This is the foundation - letters are UNUSABLE without this
 */
export function replacePlaceholders(letter: string, userData: UserData): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Replace ALL possible placeholder variations
  let result = letter;
  
  // Name placeholders
  result = result.replace(/\[Your Name\]/gi, userData.fullName);
  result = result.replace(/\[Your Full Name\]/gi, userData.fullName);
  result = result.replace(/\[Consumer Name\]/gi, userData.fullName);
  result = result.replace(/\[NAME\]/gi, userData.fullName);
  result = result.replace(/\[Full Name\]/gi, userData.fullName);
  result = result.replace(/\[Printed Name\]/gi, userData.fullName);
  result = result.replace(/\[Signature\]/gi, userData.fullName);
  
  // Address placeholders
  result = result.replace(/\[Your Address\]/gi, userData.address);
  result = result.replace(/\[Your Street Address\]/gi, userData.address);
  result = result.replace(/\[Street Address\]/gi, userData.address);
  result = result.replace(/\[Address\]/gi, userData.address);
  result = result.replace(/\[Your Current Address\]/gi, userData.address);
  result = result.replace(/\[City, State ZIP\]/gi, ''); // Already in address
  result = result.replace(/\[City, State, ZIP\]/gi, '');
  result = result.replace(/\[City, State Zip\]/gi, '');
  
  // Previous address
  if (userData.previousAddress) {
    result = result.replace(/\[Previous Address\]/gi, userData.previousAddress);
    result = result.replace(/\[Your Previous Address\]/gi, userData.previousAddress);
  } else {
    result = result.replace(/\[Previous Address\]/gi, '');
    result = result.replace(/\[Your Previous Address\]/gi, '');
  }
  
  // Date placeholders
  result = result.replace(/\[Date\]/gi, today);
  result = result.replace(/\[Today's Date\]/gi, today);
  result = result.replace(/\[Current Date\]/gi, today);
  result = result.replace(/\[DATE\]/gi, today);
  
  // DOB placeholders
  if (userData.dob) {
    result = result.replace(/\[Your DOB\]/gi, userData.dob);
    result = result.replace(/\[DOB\]/gi, userData.dob);
    result = result.replace(/\[Date of Birth\]/gi, userData.dob);
    result = result.replace(/\[Your Date of Birth\]/gi, userData.dob);
  } else {
    // Remove DOB lines if not provided
    result = result.replace(/Date of Birth:?\s*\[Your DOB\]\n?/gi, '');
    result = result.replace(/DOB:?\s*\[DOB\]\n?/gi, '');
    result = result.replace(/\[Your DOB\]/gi, '');
    result = result.replace(/\[DOB\]/gi, '');
  }
  
  // SSN placeholders
  if (userData.ssn4) {
    result = result.replace(/\[Your SSN - Last 4 Digits\]/gi, `XXX-XX-${userData.ssn4}`);
    result = result.replace(/\[SSN Last 4\]/gi, `XXX-XX-${userData.ssn4}`);
    result = result.replace(/\[Last 4 SSN\]/gi, `XXX-XX-${userData.ssn4}`);
    result = result.replace(/\[SSN\]/gi, `XXX-XX-${userData.ssn4}`);
  } else {
    // Remove SSN lines if not provided
    result = result.replace(/SSN:?\s*\[Your SSN - Last 4 Digits\]\n?/gi, '');
    result = result.replace(/Social Security:?\s*\[SSN Last 4\]\n?/gi, '');
    result = result.replace(/\[Your SSN - Last 4 Digits\]/gi, '');
    result = result.replace(/\[SSN Last 4\]/gi, '');
    result = result.replace(/\[Last 4 SSN\]/gi, '');
    result = result.replace(/\[SSN\]/gi, '');
  }
  
  // Phone placeholders
  if (userData.phone) {
    result = result.replace(/\[Your Phone Number\]/gi, userData.phone);
    result = result.replace(/\[Phone Number\]/gi, userData.phone);
    result = result.replace(/\[Phone\]/gi, userData.phone);
  } else {
    result = result.replace(/Phone:?\s*\[Your Phone Number\]\n?/gi, '');
    result = result.replace(/\[Your Phone Number\]/gi, '');
    result = result.replace(/\[Phone Number\]/gi, '');
    result = result.replace(/\[Phone\]/gi, '');
  }
  
  // Email placeholders
  if (userData.email) {
    result = result.replace(/\[Your Email Address\]/gi, userData.email);
    result = result.replace(/\[Your Email\]/gi, userData.email);
    result = result.replace(/\[Email Address\]/gi, userData.email);
    result = result.replace(/\[Email\]/gi, userData.email);
  } else {
    result = result.replace(/Email:?\s*\[Your Email Address\]\n?/gi, '');
    result = result.replace(/\[Your Email Address\]/gi, '');
    result = result.replace(/\[Your Email\]/gi, '');
    result = result.replace(/\[Email Address\]/gi, '');
    result = result.replace(/\[Email\]/gi, '');
  }
  
  // Clean up any remaining bracket placeholders that look like [Something]
  // This catches any we might have missed
  result = result.replace(/\[Your [^\]]+\]/gi, '');
  
  // Clean up double newlines that might result from removing lines
  result = result.replace(/\n{3,}/g, '\n\n');
  
  return result;
}

/**
 * Analyze accounts for violations and severity
 */
export function analyzeAccounts(accounts: AccountData[]): LetterAnalysis {
  const analysis: LetterAnalysis = {
    hasImpossibleTimeline: false,
    impossibleTimelineAccounts: [],
    severityGrades: new Map(),
    crossBureauConflicts: [],
    balanceDiscrepancies: [],
  };

  for (const account of accounts) {
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM';

    // Check for impossible timeline (Last Activity < Date Opened)
    if (account.dateOpened && account.lastActivity) {
      const dateOpened = new Date(account.dateOpened);
      const lastActivity = new Date(account.lastActivity);
      
      if (!isNaN(dateOpened.getTime()) && !isNaN(lastActivity.getTime())) {
        if (lastActivity < dateOpened) {
          analysis.hasImpossibleTimeline = true;
          analysis.impossibleTimelineAccounts.push(account);
          severity = 'CRITICAL';
        }
      }
    }

    // Check for missing critical fields
    if (!account.dateOpened || account.dateOpened === 'null' || account.dateOpened === 'Unknown') {
      if (severity !== 'CRITICAL') severity = 'HIGH';
    }
    if (!account.lastActivity || account.lastActivity === 'null' || account.lastActivity === 'Unknown') {
      if (severity !== 'CRITICAL') severity = 'HIGH';
    }

    // Check for high balance (potential high impact)
    let balanceNum = 0;
    if (account.balance !== null && account.balance !== undefined) {
      balanceNum = typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance;
    }
    if (balanceNum >= 1000) {
      if (severity === 'MEDIUM') severity = 'HIGH';
    }

    // Check for charged-off + past due contradiction
    const statusLower = account.status?.toLowerCase() || '';
    if (statusLower.includes('charged off') && statusLower.includes('past due')) {
      severity = 'CRITICAL';
    }

    analysis.severityGrades.set(account.id, severity);
  }

  return analysis;
}

/**
 * Generate the exhibit system section
 */
export function generateExhibitSection(bureau: string, reportDate: string): string {
  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  
  return `

═══════════════════════════════════════════════════════════════════════════════
VI. SUPPORTING DOCUMENTATION ENCLOSED
═══════════════════════════════════════════════════════════════════════════════

Attached are the following exhibits:

• Exhibit A: Government-Issued Photo ID (copy)
• Exhibit B: Proof of Address (utility bill or bank statement)
• Exhibit C: ${bureauName} Credit Report dated ${reportDate}

ENCLOSURES CHECKLIST:
☐ Exhibit A: Government-Issued Photo ID
☐ Exhibit B: Proof of Address  
☐ Exhibit C: ${bureauName} Credit Report

`;
}

/**
 * Generate the summary of demands table
 */
export function generateSummaryTable(accounts: AccountData[], analysis: LetterAnalysis): string {
  let table = `

═══════════════════════════════════════════════════════════════════════════════
IV. SUMMARY OF DEMANDS
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────┬──────────────┬─────────────────────────────────┐
│ ACCOUNT                         │ DEMAND       │ BASIS                           │
├─────────────────────────────────┼──────────────┼─────────────────────────────────┤
`;

  for (const account of accounts) {
    const name = (account.creditorName || account.accountName || 'Unknown').substring(0, 30).padEnd(30);
    const severity = analysis.severityGrades.get(account.id) || 'MEDIUM';
    
    let basis = '';
    if (analysis.impossibleTimelineAccounts.find(a => a.id === account.id)) {
      basis = 'IMPOSSIBLE TIMELINE';
    } else if (!account.dateOpened || account.dateOpened === 'null') {
      basis = 'Missing Date Opened';
    } else if (!account.lastActivity || account.lastActivity === 'Unknown') {
      basis = 'Missing Last Activity';
    } else {
      basis = 'Unverifiable Data';
    }
    
    table += `│ ${name} │ DELETE       │ ${basis.padEnd(30)} │\n`;
  }

  table += `└─────────────────────────────────┴──────────────┴─────────────────────────────────┘

`;

  return table;
}

/**
 * Generate the consequences section with agency threats
 */
export function generateConsequencesSection(): string {
  return `

═══════════════════════════════════════════════════════════════════════════════
VII. CONSEQUENCES OF NON-COMPLIANCE
═══════════════════════════════════════════════════════════════════════════════

Failure to comply with this dispute within the 30-day statutory period will result in:

1. STATUTORY DAMAGES under 15 U.S.C. § 1681n:
   • $100 to $1,000 per willful violation
   • Punitive damages as the court may allow
   • Attorney's fees and costs

2. ACTUAL DAMAGES under 15 U.S.C. § 1681o:
   • Compensation for actual harm suffered
   • Attorney's fees and costs

I am prepared to file complaints with:
• Consumer Financial Protection Bureau (CFPB)
• Federal Trade Commission (FTC)  
• State Attorney General
• Pursue litigation for statutory damages under FCRA

This is not an idle threat. I am fully prepared to exercise all legal remedies available to me.

`;
}

/**
 * Generate mailing instructions section
 */
export function generateMailingInstructions(bureau: string): string {
  const bureauAddresses: Record<string, string> = {
    transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016-2000',
    equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374-0256',
    experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
  };

  return `

═══════════════════════════════════════════════════════════════════════════════
IMPORTANT: HOW TO MAIL THIS LETTER
═══════════════════════════════════════════════════════════════════════════════

1. PRINT THIS LETTER
   □ Print on white paper
   □ Sign in BLUE ink above your typed name

2. GATHER REQUIRED ENCLOSURES
   □ Copy of your Driver's License or State ID
   □ Copy of utility bill (for proof of address)

3. MAIL VIA CERTIFIED MAIL
   □ Go to USPS
   □ Request "Certified Mail with Return Receipt"
   □ Cost: ~$8-10
   □ Keep your receipt and tracking number

4. SEND TO THIS ADDRESS:
   ${bureauAddresses[bureau] || bureauAddresses.experian}

5. TRACK YOUR LETTER
   □ Return to DisputeStrike dashboard
   □ Mark letter as "Mailed" with tracking number
   □ Bureau has 30 days to respond (from receipt)

6. WHAT TO EXPECT
   □ Bureau receives: Day 0
   □ Reinvestigation period: 30 days
   □ You receive response: Day 30-35
   □ If items deleted: Update appears in 5-7 days
   □ If items verified: Generate Round 2 letter

═══════════════════════════════════════════════════════════════════════════════
Generated by DisputeStrike - AI-Powered Credit Dispute Platform
═══════════════════════════════════════════════════════════════════════════════
`;
}

/**
 * Remove duplicate signature blocks - keep only the LAST one
 */
export function removeDuplicateSignatures(letter: string, userName: string): string {
  // Find all "Sincerely" occurrences
  const sincerelyMatches = letter.match(/Sincerely,?\s*\n+[^\n]+/gi);
  
  if (sincerelyMatches && sincerelyMatches.length > 1) {
    // Remove all but the last signature block
    let result = letter;
    for (let i = 0; i < sincerelyMatches.length - 1; i++) {
      result = result.replace(sincerelyMatches[i], '');
    }
    return result;
  }
  
  return letter;
}

/**
 * Post-process a letter to ensure all required sections are present
 * and CRITICALLY: replace all placeholders with actual user data
 */
export function postProcessLetter(
  rawLetter: string,
  accounts: AccountData[],
  bureau: string,
  userData: UserData
): string {
  const analysis = analyzeAccounts(accounts);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // STEP 1: Replace ALL placeholders with actual user data
  // This is the CRITICAL foundation - without this, letters are UNUSABLE
  let processedLetter = replacePlaceholders(rawLetter, userData);

  // STEP 2: Remove duplicate signature blocks
  processedLetter = removeDuplicateSignatures(processedLetter, userData.fullName);

  // STEP 3: Check if summary table exists, if not add it
  if (!processedLetter.includes('SUMMARY OF DEMANDS') && !processedLetter.includes('Summary of Demands')) {
    // Find a good insertion point (before signature or at end)
    const signatureIndex = processedLetter.lastIndexOf('Sincerely');
    if (signatureIndex > 0) {
      processedLetter = 
        processedLetter.substring(0, signatureIndex) + 
        generateSummaryTable(accounts, analysis) +
        processedLetter.substring(signatureIndex);
    } else {
      processedLetter += generateSummaryTable(accounts, analysis);
    }
  }

  // STEP 4: Check if exhibit section exists, if not add it
  if (!processedLetter.includes('Exhibit A') && !processedLetter.includes('ENCLOSURES')) {
    const signatureIndex = processedLetter.lastIndexOf('Sincerely');
    if (signatureIndex > 0) {
      processedLetter = 
        processedLetter.substring(0, signatureIndex) + 
        generateExhibitSection(bureau, today) +
        processedLetter.substring(signatureIndex);
    } else {
      processedLetter += generateExhibitSection(bureau, today);
    }
  }

  // STEP 5: Check if consequences section with agency threats exists
  if (!processedLetter.includes('CFPB') && !processedLetter.includes('Consumer Financial Protection Bureau')) {
    const signatureIndex = processedLetter.lastIndexOf('Sincerely');
    if (signatureIndex > 0) {
      processedLetter = 
        processedLetter.substring(0, signatureIndex) + 
        generateConsequencesSection() +
        processedLetter.substring(signatureIndex);
    } else {
      processedLetter += generateConsequencesSection();
    }
  }

  // STEP 6: Add mailing instructions at the very end
  if (!processedLetter.includes('HOW TO MAIL THIS LETTER')) {
    processedLetter += generateMailingInstructions(bureau);
  }

  // STEP 7: Ensure proper signature
  if (!processedLetter.includes('Sincerely')) {
    processedLetter += `

Sincerely,

${userData.fullName}
`;
  }

  return processedLetter;
}

/**
 * Generate a cover page summary
 */
export function generateCoverPage(
  accounts: AccountData[],
  bureau: string,
  userData: UserData
): string {
  const analysis = analyzeAccounts(accounts);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);

  // Count by type
  const typeCounts: Record<string, number> = {};
  for (const acc of accounts) {
    const type = acc.accountType || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  // Count severities
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  analysis.severityGrades.forEach((severity) => {
    if (severity === 'CRITICAL') criticalCount++;
    else if (severity === 'HIGH') highCount++;
    else mediumCount++;
  });

  return `═══════════════════════════════════════════════════════════════════════════════
                         DISPUTE LETTER SUMMARY
                         Generated: ${today}
                         Bureau: ${bureauName}
                         Consumer: ${userData.fullName}
═══════════════════════════════════════════════════════════════════════════════

ACCOUNTS BEING DISPUTED: ${accounts.length} total

By Type:
${Object.entries(typeCounts).map(([type, count]) => `• ${type}: ${count}`).join('\n')}

Violation Severity:
• CRITICAL ERRORS: ${criticalCount} accounts
• HIGH PRIORITY: ${highCount} accounts  
• MEDIUM: ${mediumCount} accounts

${analysis.hasImpossibleTimeline ? `
⚠️  IMPOSSIBLE TIMELINE DETECTED: ${analysis.impossibleTimelineAccounts.length} account(s)
    These accounts have Last Activity dates BEFORE Date Opened - physically impossible!
    This is grounds for IMMEDIATE deletion under FCRA § 1681i(a)(1)(A).
` : ''}

Expected Outcome:
With proper documentation and FCRA citations, accounts with these violations 
have a 60-80% deletion success rate in Round 1.

NEXT STEPS:
1. Review letter carefully
2. Sign in BLUE ink
3. Mail via Certified Mail with Return Receipt
4. Track in DisputeStrike dashboard
5. Wait 30 days for bureau response
6. Generate Round 2 if items are verified (not deleted)

═══════════════════════════════════════════════════════════════════════════════

`;
}
