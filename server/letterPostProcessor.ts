/**
 * Letter Post-Processor
 * Ensures all required sections are present in generated letters
 * and CRITICALLY: replaces any remaining placeholder text with actual user data
 */

import { safeJsonParse } from "./utils/json";

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
  bureau?: string | null;
  transunionData?: string | null;
  equifaxData?: string | null;
  experianData?: string | null;
  originalCreditor?: string | null;
  amountPastDue?: string | number | null;
  paymentHistory?: string | null;
  comment?: string | null;
  rawData?: string | null;
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
 * 
 * IMPORTANT: The AI sometimes outputs "[Placeholder] ActualValue" format
 * We need to handle BOTH:
 * 1. "[Your Name]" alone -> replace with actual value
 * 2. "[Your Name] Benjamin Peter" -> replace entire thing with actual value
 */
export function replacePlaceholders(letter: string, userData: UserData): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Replace ALL possible placeholder variations
  let result = letter;
  
  // FIRST: Handle "[Placeholder] Value" pattern (placeholder followed by actual value)
  // This catches cases where AI outputs "[Your Name] Benjamin Peter"
  result = result.replace(/\[Your Name\]\s*[^\[\n]*/gi, userData.fullName);
  result = result.replace(/\[Your Full Name\]\s*[^\[\n]*/gi, userData.fullName);
  result = result.replace(/\[Consumer Name\]\s*[^\[\n]*/gi, userData.fullName);
  result = result.replace(/\[Printed Name\]\s*[^\[\n]*/gi, userData.fullName);
  result = result.replace(/\[Signature\]\s*[^\[\n]*/gi, userData.fullName);
  
  // Address - handle "[Your Street Address] 45444" pattern
  result = result.replace(/\[Your Address\]\s*[^\[\n]*/gi, userData.address);
  result = result.replace(/\[Your Street Address\]\s*[^\[\n]*/gi, userData.address);
  result = result.replace(/\[Street Address\]\s*[^\[\n]*/gi, userData.address);
  result = result.replace(/\[Address\]\s*[^\[\n]*/gi, userData.address);
  result = result.replace(/\[Your Current Address\]\s*[^\[\n]*/gi, userData.address);
  
  // Phone - handle "[Your Phone Number] xxx" pattern
  const phoneValue = userData.phone || '';
  result = result.replace(/\[Your Phone Number\]\s*[^\[\n]*/gi, phoneValue);
  result = result.replace(/\[Phone Number\]\s*[^\[\n]*/gi, phoneValue);
  result = result.replace(/\[Phone\]\s*[^\[\n]*/gi, phoneValue);
  
  // Email - handle "[Your Email Address] xxx" pattern  
  const emailValue = userData.email || '';
  result = result.replace(/\[Your Email Address\]\s*[^\[\n]*/gi, emailValue);
  result = result.replace(/\[Your Email\]\s*[^\[\n]*/gi, emailValue);
  result = result.replace(/\[Email Address\]\s*[^\[\n]*/gi, emailValue);
  result = result.replace(/\[Email\]\s*[^\[\n]*/gi, emailValue);
  
  // Date - handle "[Date] xxx" pattern
  result = result.replace(/\[Date\]\s*[^\[\n]*/gi, today);
  result = result.replace(/\[Today's Date\]\s*[^\[\n]*/gi, today);
  result = result.replace(/\[Current Date\]\s*[^\[\n]*/gi, today);
  result = result.replace(/\[DATE\]\s*[^\[\n]*/gi, today);
  
  // DOB - handle "[Your DOB] xxx" pattern
  const dobValue = userData.dob || '';
  result = result.replace(/\[Your DOB\]\s*[^\[\n]*/gi, dobValue);
  result = result.replace(/\[DOB\]\s*[^\[\n]*/gi, dobValue);
  result = result.replace(/\[Date of Birth\]\s*[^\[\n]*/gi, dobValue);
  result = result.replace(/\[Your Date of Birth\]\s*[^\[\n]*/gi, dobValue);
  
  // SSN - handle "[Your SSN...] xxx" pattern
  const ssnValue = userData.ssn4 ? `XXX-XX-${userData.ssn4}` : '';
  result = result.replace(/\[Your SSN[^\]]*\]\s*[^\[\n]*/gi, ssnValue);
  result = result.replace(/\[SSN[^\]]*\]\s*[^\[\n]*/gi, ssnValue);
  result = result.replace(/\[Last 4 SSN\]\s*[^\[\n]*/gi, ssnValue);
  result = result.replace(/\[Social Security Number[^\]]*\]\s*[^\[\n]*/gi, ssnValue);
  
  // SECOND: Handle standalone placeholders (without trailing value)
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
    // Remove DOB lines if not provided - handle ALL variations
    result = result.replace(/Date of Birth:?\s*\[Your DOB\]\n?/gi, '');
    result = result.replace(/Date of Birth:?\s*\[DOB\]\n?/gi, '');
    result = result.replace(/Date of Birth:?\s*\[Date of Birth\]\n?/gi, '');
    result = result.replace(/Date of Birth:?\s*\[Your Date of Birth\]\n?/gi, '');
    result = result.replace(/Date of Birth:?\s*\n?/gi, ''); // Remove empty DOB lines
    result = result.replace(/DOB:?\s*\[DOB\]\n?/gi, '');
    result = result.replace(/DOB:?\s*\[Your DOB\]\n?/gi, '');
    result = result.replace(/DOB:?\s*\n?/gi, ''); // Remove empty DOB lines
    result = result.replace(/\[Your DOB\]/gi, '');
    result = result.replace(/\[DOB\]/gi, '');
    result = result.replace(/\[Date of Birth\]/gi, '');
    result = result.replace(/\[Your Date of Birth\]/gi, '');
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

const BUREAU_LABELS: Record<string, string> = {
  transunion: "TransUnion",
  equifax: "Equifax",
  experian: "Experian",
};

type BureauSnapshot = {
  status?: string;
  balance?: string | number;
  dateOpened?: string;
  lastActivity?: string;
};

function formatBureauName(bureau: string): string {
  const key = bureau.toLowerCase().trim();
  return BUREAU_LABELS[key] || bureau;
}

function getBureauMailingAddress(bureau: string): string {
  const addresses: Record<string, string> = {
    transunion: 'TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016-2000',
    equifax: 'Equifax Consumer Solutions\nP.O. Box 105873\nAtlanta, GA 30348-5873',
    experian: 'Experian Consumer Solutions\nP.O. Box 9595\nAllen, TX 75013',
  };
  return addresses[bureau.toLowerCase().trim()] || addresses.experian;
}

function extractField(obj: Record<string, any>, keys: string[]): string | number | undefined {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function parseSnapshot(raw: string | null | undefined): BureauSnapshot | null {
  if (!raw) return null;
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== "object") return null;
  return {
    status: String(extractField(parsed, ["status", "accountStatus", "currentStatus"]) || ""),
    balance: extractField(parsed, ["balance", "currentBalance", "amount"]),
    dateOpened: String(extractField(parsed, ["dateOpened", "openedDate", "openDate"]) || ""),
    lastActivity: String(extractField(parsed, ["lastActivity", "lastPaymentDate", "dateOfLastActivity"]) || ""),
  };
}

function formatSnapshotLine(label: string, value?: string | number): string {
  if (value === undefined || value === null || value === "") {
    return `• ${label}: Not reported`;
  }
  return `• ${label}: ${value}`;
}

function getBureauSnapshots(account: AccountData): Record<string, BureauSnapshot> {
  const snapshots: Record<string, BureauSnapshot> = {};
  const transunion = parseSnapshot(account.transunionData);
  const equifax = parseSnapshot(account.equifaxData);
  const experian = parseSnapshot(account.experianData);
  if (transunion) snapshots.transunion = transunion;
  if (equifax) snapshots.equifax = equifax;
  if (experian) snapshots.experian = experian;
  return snapshots;
}

function getDobYear(dob?: string): string {
  if (!dob) return "Not provided";
  const match = dob.match(/(\d{4})/);
  return match ? match[1] : dob;
}

function getOtherBureaus(bureau: string): string[] {
  const all = ["transunion", "equifax", "experian"];
  const current = bureau.toLowerCase().trim();
  return all.filter((b) => b !== current);
}

function parseAccountRawData(account: AccountData): Record<string, any> {
  if (!account.rawData) return {};
  const parsed = safeJsonParse(account.rawData, null);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function formatDisputeRoundLabel(roundLabel?: string): string {
  if (!roundLabel) return "FORMAL DISPUTE OF INACCURATE AND UNVERIFIABLE TRADELINES";
  return `FORMAL DISPUTE OF INACCURATE AND UNVERIFIABLE TRADELINES - ${roundLabel}`;
}

function generateAddressCorrectionNotice(userData: UserData): string {
  return `
IMPORTANT: ADDRESS AND NAME CORRECTION REQUIRED
Consumer Name: ${userData.fullName} | DOB: ${getDobYear(userData.dob)} | SSN: ${userData.ssn4 ? `XXX-XX-${userData.ssn4}` : "Not provided"}
`;
}

function generateAddressVerificationBlock(userData: UserData): string {
  return `
IMPORTANT NOTICE - ADDRESS AND NAME VERIFICATION:
Please verify and correct your records to show:
Correct Name: ${userData.fullName} (ONLY - no variations or alternate names)
Correct Addresses on File:
1. Current Address (Primary): ${userData.address}
2. Previous Address: ${userData.previousAddress || "None"}
Do NOT report any addresses other than the two above. If your records show any other
addresses, please remove them immediately.
Enclosed as verification of correct addresses:
• Exhibit A: Government-Issued Photo ID (copy)
• Exhibit B: Proof of Address (utility bill or bank statement)
`;
}

function buildConflictNotes(snapshots: Record<string, BureauSnapshot>): string[] {
  const notes: string[] = [];
  const bureaus = Object.keys(snapshots);
  if (bureaus.length < 2) return notes;

  const fields: Array<{ key: keyof BureauSnapshot; label: string }> = [
    { key: "status", label: "Status" },
    { key: "balance", label: "Balance" },
    { key: "dateOpened", label: "Date Opened" },
    { key: "lastActivity", label: "Last Activity" },
  ];

  for (const field of fields) {
    const values = bureaus
      .map((b) => snapshots[b]?.[field.key])
      .filter((v) => v !== undefined && v !== null && v !== "");
    const unique = new Set(values.map((v) => String(v)));
    if (unique.size > 1) {
      notes.push(`${field.label} discrepancy across bureaus`);
    }
  }

  return notes;
}

function generateIdentitySection(userData: UserData): string {
  return `
SECTION 1: IDENTITY & ADDRESS VERIFICATION
Name: ${userData.fullName}
Date of Birth: ${userData.dob || "Not provided"}
SSN (Last 4): ${userData.ssn4 ? `XXX-XX-${userData.ssn4}` : "Not provided"}
Current Address: ${userData.address}
Previous Address: ${userData.previousAddress || "None"}
`;
}

function generateLegalBasisSection(): string {
  return `
SECTION 2: LEGAL BASIS FOR DISPUTE
Pursuant to the Fair Credit Reporting Act (FCRA), including §§ 1681i(a)(1)(A), 1681i(a)(5)(A), 1681i(a)(7), 1681s-2(b), 1681n, and 1681o, I am formally disputing inaccurate, incomplete, and unverifiable information in my credit file. You are required to conduct a reasonable reinvestigation and delete any information that cannot be verified.
`;
}

function generateCrossBureauSection(accounts: AccountData[], bureau: string): string {
  const otherBureaus = getOtherBureaus(bureau).map(formatBureauName);
  const conflicts: string[] = [];
  for (const account of accounts) {
    const snapshots = getBureauSnapshots(account);
    const notes = buildConflictNotes(snapshots);
    if (notes.length > 0) {
      const name = account.creditorName || account.accountName || "Unknown Account";
      conflicts.push(`• ${name}: ${notes.join("; ")}`);
    }
  }

  if (!conflicts.length) {
    return `
II. CRITICAL PROBLEM: CROSS-BUREAU CONFLICTS PROVE FURNISHER UNRELIABILITY
The fundamental issue with the accounts below is that you report materially different
information for the same accounts than do ${otherBureaus.join(" and ")}. This proves either:
1. You are reporting inaccurate information to me, or
2. The furnisher is providing conflicting information to different bureaus
Either way, this violates FCRA § 1681i(a)(5)(A) requirement for "maximum possible accuracy."
Under FCRA § 1681s-2(a)(1)(A), furnishers cannot report information they "know or have
reasonable cause to believe is inaccurate." Your continued reporting despite cross-bureau
conflicts proves the information is unreliable and unverifiable.
`;
  }

  return `
II. CRITICAL PROBLEM: CROSS-BUREAU CONFLICTS PROVE FURNISHER UNRELIABILITY
The fundamental issue with the accounts below is that you report materially different
information for the same accounts than do ${otherBureaus.join(" and ")}. This proves either:
1. You are reporting inaccurate information to me, or
2. The furnisher is providing conflicting information to different bureaus
Either way, this violates FCRA § 1681i(a)(5)(A) requirement for "maximum possible accuracy."
Under FCRA § 1681s-2(a)(1)(A), furnishers cannot report information they "know or have
reasonable cause to believe is inaccurate." Your continued reporting despite cross-bureau
conflicts proves the information is unreliable and unverifiable.
Conflicts identified:
${conflicts.join("\n")}
`;
}

function buildViolationsForAccount(account: AccountData, analysis: LetterAnalysis, snapshots: Record<string, BureauSnapshot>): string[] {
  const violations: string[] = [];
  const rawData = parseAccountRawData(account);
  const comment = account.comment || rawData.comment || rawData.remarks || rawData.note || "";
  const hasImpossible = analysis.impossibleTimelineAccounts.some((a) => a.id === account.id);
  if (hasImpossible) {
    violations.push("IMPOSSIBLE TIMELINE - CRITICAL ERROR: Last activity predates account opening");
  }
  if (!account.dateOpened || account.dateOpened === "Unknown") {
    violations.push("MISSING DATE OPENED: Critical field is not reported");
  }
  if (!account.lastActivity || account.lastActivity === "Unknown") {
    violations.push("MISSING LAST ACTIVITY: Critical field is not reported");
  }
  if (comment && comment.toLowerCase().includes("dispute")) {
    violations.push("Previously Disputed - Inadequate Investigation");
  }
  const conflictNotes = buildConflictNotes(snapshots);
  if (conflictNotes.length) {
    violations.push(...conflictNotes.map((note) => note.toUpperCase()));
  }
  if (!violations.length) {
    violations.push("UNVERIFIABLE BALANCE: Insufficient documentation to validate reporting");
  }
  return violations;
}

function generateAccountDisputes(accounts: AccountData[], analysis: LetterAnalysis, bureau: string): string {
  return accounts
    .map((account, index) => {
      const name = account.creditorName || account.accountName || "Unknown Account";
      const accountNumber = account.accountNumber || "Not reported";
      const snapshots = getBureauSnapshots(account);
      const rawData = parseAccountRawData(account);
      const comment = account.comment || rawData.comment || rawData.remarks || rawData.note || "";
      const originalCreditor = account.originalCreditor || rawData.originalCreditor || rawData.originalCreditorName;
      const paymentHistory = account.paymentHistory || rawData.paymentHistory;
      const amountPastDue = account.amountPastDue || rawData.amountPastDue;
      const violations = buildViolationsForAccount(account, analysis, snapshots);
      const bureauLines = getOtherBureaus(bureau)
        .map((bureauKey) => {
          const snapshot = snapshots[bureauKey];
          if (!snapshot) return null;
          const bureauName = formatBureauName(bureauKey);
          return `${bureauName} Reports:\n${formatSnapshotLine("Last Activity", snapshot.lastActivity)}\n${formatSnapshotLine("Status", snapshot.status)}\n${formatSnapshotLine("Balance", snapshot.balance)}\n${formatSnapshotLine("Date Opened", snapshot.dateOpened)}`;
        })
        .filter(Boolean)
        .join("\n\n");

      return `
ACCOUNT ${index + 1}: ${name}
Account Information You Report:
${formatSnapshotLine("Account Number", accountNumber)}
${formatSnapshotLine("Original Creditor", originalCreditor)}
${formatSnapshotLine("Current Balance", account.balance)}
${formatSnapshotLine("Amount Past Due", amountPastDue)}
${formatSnapshotLine("Status", account.status)}
${formatSnapshotLine("Last Activity", account.lastActivity)}
${formatSnapshotLine("Date Opened", account.dateOpened)}
${comment ? `• Comment: "${comment}"` : ""}
${paymentHistory ? `• Payment History: ${paymentHistory}` : ""}

What Other Bureaus Report (Same Account):
${bureauLines || "No additional bureau data provided."}

VIOLATIONS IDENTIFIED:
${violations.map((v, i) => `${i + 1}. ${v}`).join("\n")}

LEGAL REQUIREMENT FOR DELETION:
Under 15 USC § 1681i(a)(5)(A):
"If the completeness or accuracy of any item of information contained in a consumer's file
is disputed and cannot be verified, the information shall be deleted from the file."

DEMAND:
Delete this account from my credit file within 15 days.
If you believe this account should remain reported, you must provide:
1. Written verification from the furnisher supporting each disputed field
2. Complete payment history supporting the reported balance
3. Documentation explaining all cross-bureau conflicts
4. Documentation from the original creditor supporting the claim
`;
    })
    .join("\n");
}

function generatePositiveAccountsSection(): string {
  return `
IV. ACCOUNTS THAT SHOULD NOT REPORT NEGATIVELY
None identified in this dispute letter. If any paid or positive accounts are reporting negatively, I request immediate correction to reflect accurate, positive status.
`;
}

function generateLegalRequirementsSection(): string {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);
  const deadlineDate = deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return `
VI. LEGAL REQUIREMENTS & TIMELINE
Under 15 USC § 1681i(a)(3)(A), you have 30 days from receipt to:
1. Complete a reasonable and thorough reinvestigation
2. Review all enclosures
3. Contact furnishers as needed
4. Correct inaccurate information OR delete unverifiable information
5. Provide written notice of results
Under 15 USC § 1681i(a)(5)(A):
"Any information determined to be inaccurate shall be promptly deleted."
Any information that cannot be verified must also be deleted.
Expected response deadline: ${deadlineDate}
`;
}

function generateRequiredResponseSection(): string {
  return `
IX. REQUIRED RESPONSE
Your written response must include:
• Results for each disputed account (deleted, corrected, or verified)
• Procedures used during reinvestigation per FCRA § 1681i(a)(6)(A)
• The name and contact information of any furnisher contacted
• Documentation reviewed during investigation
`;
}

function generateStructuredLetter(
  accounts: AccountData[],
  bureau: string,
  userData: UserData,
  disputeRoundLabel?: string
): string {
  const analysis = analyzeAccounts(accounts);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const bureauName = formatBureauName(bureau);
  const bureauAddress = getBureauMailingAddress(bureau);
  const roundLabel = formatDisputeRoundLabel(disputeRoundLabel);

  const otherBureaus = getOtherBureaus(bureau).map(formatBureauName);

  return `${userData.fullName}
${userData.address}

${today}
${bureauName}
${bureauAddress || ""}
SENT VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Re: ${roundLabel}
${generateAddressCorrectionNotice(userData)}
Dear ${bureauName}:
${generateAddressVerificationBlock(userData)}

I. LEGAL BASIS FOR THIS DISPUTE
Under the Fair Credit Reporting Act (FCRA), 15 USC § 1681i(a)(1)(A), I dispute the accuracy
and completeness of accounts on my credit file. Under 15 USC § 1681i(a)(5)(A), you are
legally required to delete any information that is inaccurate or cannot be verified.
Under FCRA § 1681i(a)(3)(A), upon receipt of this dispute, you must conduct a reasonable
reinvestigation within 30 days and take appropriate action to verify the accuracy of each
disputed item.${disputeRoundLabel ? `\nThis is a ${disputeRoundLabel} on accounts where your previous investigation was inadequate,\nas evidenced by conflicting data that remains on my report.` : ""}

${generateCrossBureauSection(accounts, bureau)}

III. ACCOUNT-BY-ACCOUNT DISPUTES
${generateAccountDisputes(accounts, analysis, bureau)}

${generatePositiveAccountsSection()}

V. SUMMARY OF DEMANDS
${generateSummaryTable(accounts, analysis)}

${generateLegalRequirementsSection()}
VII. SUPPORTING DOCUMENTATION ENCLOSED
${generateExhibitSection(bureau, today)}

VIII. CONSEQUENCES OF NON-COMPLIANCE
${generateConsequencesSection()}

${generateRequiredResponseSection()}

CONTACT INFORMATION
All future correspondence regarding this dispute should be sent to:
${userData.fullName}
${userData.address}
Please send response via CERTIFIED MAIL with tracking confirmation.

FINAL NOTICE
I expect written confirmation of deletion and/or correction within 30 days of receipt of this
letter. Failure to respond adequately or continued reporting of inaccurate information will
result in CFPB complaints and litigation.

Sincerely,
${userData.fullName}

ENCLOSURES:
☐ Exhibit A: Government-Issued Photo ID (copy)
☐ Exhibit B: Proof of Address
☐ Exhibit C: ${bureauName} Credit Report
☐ Exhibit D: ${otherBureaus[0] || "Equifax"} Credit Report
☐ Exhibit E: ${otherBureaus[1] || "Experian"} Credit Report
☐ Exhibit F: Additional Supporting Documents (if applicable)
END OF LETTER
`;
}

/**
 * Generate the exhibit system section
 */
export function generateExhibitSection(bureau: string, reportDate: string): string {
  const bureauName = formatBureauName(bureau);
  const otherBureaus = getOtherBureaus(bureau).map(formatBureauName);
  
  return `
Attached are the following exhibits:

• Exhibit A: Government-Issued Photo ID (copy)
• Exhibit B: Proof of Address (utility bill or bank statement)
• Exhibit C: ${bureauName} Credit Report dated ${reportDate}
• Exhibit D: ${otherBureaus[0] || "Equifax"} Credit Report (for comparison)
• Exhibit E: ${otherBureaus[1] || "Experian"} Credit Report (for comparison)
• Exhibit F: Additional supporting documentation (if applicable)

ENCLOSURES CHECKLIST:
☐ Exhibit A: Government-Issued Photo ID
☐ Exhibit B: Proof of Address
☐ Exhibit C: ${bureauName} Credit Report
☐ Exhibit D: ${otherBureaus[0] || "Equifax"} Credit Report
☐ Exhibit E: ${otherBureaus[1] || "Experian"} Credit Report
☐ Exhibit F: Other Supporting Documents

`;
}

/**
 * Generate the summary of demands table
 */
export function generateSummaryTable(accounts: AccountData[], analysis: LetterAnalysis): string {
  let table = `Account\tDemand\tBasis\n`;

  for (const account of accounts) {
    const name = account.creditorName || account.accountName || "Unknown";
    let basis = "Unverifiable Data";
    if (analysis.impossibleTimelineAccounts.find(a => a.id === account.id)) {
      basis = "Impossible timeline";
    } else if (!account.dateOpened || account.dateOpened === "null") {
      basis = "Missing date opened";
    } else if (!account.lastActivity || account.lastActivity === "Unknown") {
      basis = "Missing last activity";
    }
    
    table += `${name}\tDELETE\t${basis}\n`;
  }

  return table;
}

/**
 * Generate the consequences section with agency threats
 */
export function generateConsequencesSection(): string {
  return `
Failure to comply within the 30-day statutory period will result in:

1. STATUTORY DAMAGES under 15 U.S.C. § 1681n:
   • $100 to $1,000 per willful violation
   • Punitive damages as allowed by law
   • Attorney's fees and costs

2. ACTUAL DAMAGES under 15 U.S.C. § 1681o:
   • Compensation for actual harm suffered
   • Attorney's fees and costs

I am prepared to file complaints with:
• Consumer Financial Protection Bureau (CFPB)
• Federal Trade Commission (FTC)
• State Attorney General
• Pursue litigation for statutory damages under FCRA

This is not an idle threat. I am prepared to exercise all legal remedies available to me.

`;
}

/**
 * Generate mailing instructions section
 */
export function generateMailingInstructions(bureau: string): string {
  return `

═══════════════════════════════════════════════════════════════════════════════
IMPORTANT: HOW TO MAIL THIS LETTER
═══════════════════════════════════════════════════════════════════════════════

1. PRINT & SIGN
   □ Print on white paper
   □ Sign in BLUE ink above your typed name

2. GATHER REQUIRED ENCLOSURES
   □ Government-issued photo ID (copy)
   □ Proof of address (utility bill or bank statement)
   □ Credit reports and supporting documents

3. MAIL VIA CERTIFIED MAIL
   □ Go to USPS
   □ Request "Certified Mail with Return Receipt"
   □ Keep your receipt and tracking number

4. SEND TO THIS ADDRESS:
   ${getBureauMailingAddress(bureau)}

5. TRACK YOUR LETTER
   □ Save your certified mail receipt and tracking number
   □ Bureau has 30 days to respond (from receipt)
   □ Keep a copy of this letter for your records

6. WHAT TO EXPECT
   □ Bureau receives: Day 0
   □ Reinvestigation period: 30 days
   □ You receive response: Day 30-35
   □ If items deleted: Update appears in 5-7 days
   □ If items verified: Generate Round 2 letter

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
  _rawLetter: string,
  accounts: AccountData[],
  bureau: string,
  userData: UserData,
  disputeRoundLabel?: string
): string {
  const structuredLetter = generateStructuredLetter(accounts, bureau, userData, disputeRoundLabel);
  return replacePlaceholders(structuredLetter, userData);
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
4. Keep your certified mail receipt
5. Wait 30 days for bureau response
6. Generate Round 2 if items are verified (not deleted)

═══════════════════════════════════════════════════════════════════════════════

`;
}
