/**
 * Letter Post-Processor
 * Ensures all required sections are present in generated letters
 * and adds missing components like exhibit system, summary table, etc.
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

export interface LetterAnalysis {
  hasImpossibleTimeline: boolean;
  impossibleTimelineAccounts: AccountData[];
  severityGrades: Map<number, 'CRITICAL' | 'HIGH' | 'MEDIUM'>;
  crossBureauConflicts: AccountData[];
  balanceDiscrepancies: AccountData[];
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
 * Post-process a letter to ensure all required sections are present
 */
export function postProcessLetter(
  rawLetter: string,
  accounts: AccountData[],
  bureau: string,
  userName: string
): string {
  const analysis = analyzeAccounts(accounts);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  let processedLetter = rawLetter;

  // Check if summary table exists, if not add it
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

  // Check if exhibit section exists, if not add it
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

  // Check if consequences section with agency threats exists
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

  // Add mailing instructions at the very end
  if (!processedLetter.includes('HOW TO MAIL THIS LETTER')) {
    processedLetter += generateMailingInstructions(bureau);
  }

  // Ensure proper signature
  if (!processedLetter.includes('Sincerely')) {
    processedLetter += `

Sincerely,

${userName}
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
  userName: string
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
                         Consumer: ${userName}
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
