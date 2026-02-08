/**
 * Credit Report Parser
 * 
 * Extracts negative accounts from credit report PDFs/text
 * Supports all 3 bureaus: TransUnion, Equifax, Experian
 * Uses Vision AI (Gemini) for PDF parsing
 */

import type { CreditReportResult } from '../../shared/types';
import { safeJsonParse } from './utils/json';

export type { LightAnalysisResult };

export interface ParsedAccount {
  accountName: string;
  accountNumber: string;
  balance: number;
  status: string;
  dateOpened: Date | null;
  lastActivity: Date | null;
  accountType: string;
  originalCreditor?: string;
  bureau: 'TransUnion' | 'Equifax' | 'Experian';
  rawData: string;
  negativeReason?: string; // WHY this account is negative
  paymentHistory?: string; // Payment history pattern
}

export interface PersonalInfo {
  fullName: string;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    fullAddress: string;
  };
  previousAddresses: {
    street: string;
    city: string;
    state: string;
    zip: string;
    fullAddress: string;
  }[];
  dateOfBirth: string | null;
  ssnLast4: string | null;
  creditScore: number | null;
  scoreModel: string | null;
}

export interface ParsedCreditReport {
  bureau: 'TransUnion' | 'Equifax' | 'Experian';
  accounts: ParsedAccount[];
  personalInfo?: PersonalInfo;
  score?: number;
  reportDate: Date;
  rawText: string;
}

import { invokeLLM } from './_core/llm';
import * as db from './db';

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'Unknown' || dateStr === 'N/A' || dateStr === '') {
    return null;
  }
  
  try {
    // Handle various date formats
    // MM/DD/YYYY
    let match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (match) {
      let [, month, day, year] = match.map(Number);
      if (year < 100) year += year < 50 ? 2000 : 1900;
      return new Date(year, month - 1, day);
    }
    
    // YYYY-MM-DD
    match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match.map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Month DD, YYYY (e.g., "December 1, 2025")
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                        'july', 'august', 'september', 'october', 'november', 'december'];
    const monthMatch = dateStr.toLowerCase().match(/([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (monthMatch) {
      const monthIndex = monthNames.indexOf(monthMatch[1]);
      if (monthIndex !== -1) {
        return new Date(parseInt(monthMatch[3]), monthIndex, parseInt(monthMatch[2]));
      }
    }
  } catch (e) {
    console.error('[Date Parser] Failed to parse:', dateStr, e);
  }
  return null;
}

/**
 * Use Vision AI to extract negative accounts from INDIVIDUAL bureau PDF
 * AGGRESSIVE EXTRACTION - Must find ALL 47+ negative items
 */
async function parseWithVisionAI(fileUrl: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<ParsedAccount[]> {
  console.log(`[Vision AI] Processing ${bureau} report from: ${fileUrl.slice(0, 80)}...`);
  
  const systemPrompt = `You are an EXPERT credit report analyst specializing in FCRA disputes. Your task is to extract ABSOLUTELY EVERY negative account from this ${bureau} credit report PDF.

**CRITICAL: YOU MUST EXTRACT EVERY SINGLE NEGATIVE ITEM - NO LIMIT! Some reports have 50, 75, even 100+ negative items. Extract them ALL!**

=== WHAT MAKES AN ACCOUNT NEGATIVE (EXTRACT ALL) ===

**COLLECTIONS (Most Common - Look Carefully!):**
- ANY account from a collection agency
- Status: "Collection", "Placed for Collection", "Transferred", "Sold"
- Look for: TSI, TRANSWORLD, FST FINANCIA, NCA, NATCREADJ, INNOVATIVE R, PRO COLLECT, LVNV, MIDLAND, PORTFOLIO RECOVERY, CAVALRY, ENCORE, JEFFERSON CAPITAL, IC SYSTEM, CONVERGENT, ENHANCED RECOVERY, AFNI, ALLIED, RECEIVABLES PERFORMANCE, CREDIT COLLECTION SERVICES, NATIONWIDE CREDIT, ERC, FIRST NATIONAL COLLECTION, CREDENCE, RADIUS GLOBAL, RESURGENT CAPITAL
- Medical collections: EMERGENCY PHYSICIANS, HOSPITAL names, MEDICAL, HEALTHCARE
- Utility collections: ELECTRIC, GAS, WATER company names

**CHARGE-OFFS:**
- Status: "Charge Off", "Charged Off", "CO", "Written Off"
- Any account with $0 balance but negative status

**LATE PAYMENTS (Check Payment History Grid!):**
- Look at the payment history row/grid for EACH account
- Any "30", "60", "90", "120", "150", "180" in payment history = NEGATIVE
- Any "L" or "Late" markers
- Any red/highlighted cells in payment grid

**OTHER NEGATIVE MARKS:**
- Closed by Credit Grantor (not consumer)
- Repossession, Repo
- Foreclosure
- Bankruptcy (Chapter 7, 13)
- Judgment, Tax Lien
- Settled for Less than Full Balance
- Paid Collection (still negative!)
- Account Included in Bankruptcy
- Profit and Loss Write-off
- Insurance Claim
- Government Claim

**DEROGATORY INDICATORS:**
- Any account in "Potentially Negative" or "Negative Items" section
- Any account with "Derogatory" rating
- Any account with adverse/negative remarks

=== EXTRACTION REQUIREMENTS ===

FOR EACH NEGATIVE ACCOUNT, EXTRACT:
- accountName: Creditor/collection agency name (EXACT as shown)
- accountNumber: Account number (partial OK, e.g., "517750XXXXXXXX")
- balance: Current balance as NUMBER (0 if paid/closed)
- status: EXACT status from report
- dateOpened: Date opened (MM/DD/YYYY)
- lastActivity: Last activity date (MM/DD/YYYY)
- accountType: Collection, Credit Card, Auto Loan, Medical, Student Loan, Mortgage, Personal Loan, Utility, Retail, etc.
- originalCreditor: Original creditor if this is a collection
- negativeReason: Specific reason (e.g., "Collection - medical debt", "90 days late in Oct 2024", "Charge off - $5,614 unpaid")

=== CRITICAL RULES ===

1. **SCAN EVERY PAGE** - Accounts may be spread across multiple pages
2. **CHECK PAYMENT HISTORY** - Late payments hide in the grid, not just status
3. **INCLUDE PAID COLLECTIONS** - They still hurt credit
4. **INCLUDE $0 BALANCE NEGATIVES** - Charge-offs often show $0
5. **COUNT EACH BUREAU SEPARATELY** - Same account on 3 bureaus = 3 entries
6. **DON'T SKIP ANY SECTION** - Check Collections, Accounts, Public Records, Inquiries

**THERE IS NO LIMIT - EXTRACT EVERY NEGATIVE ACCOUNT YOU FIND!**
**If you find 10, extract 10. If you find 100, extract 100. Miss NOTHING!**`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: `Extract ALL negative accounts from this ${bureau} credit report. For each account, provide the exact status, balance, dates, and explain WHY it is negative. Do not miss any accounts.` },
            { type: 'file_url', file_url: { url: fileUrl, mime_type: 'application/pdf' } }
          ]
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'credit_accounts',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    accountName: { type: 'string', description: 'Creditor or collection agency name' },
                    accountNumber: { type: 'string', description: 'Account number (partial OK)' },
                    balance: { type: 'number', description: 'Current balance (0 if paid)' },
                    status: { type: 'string', description: 'Exact status: Collection, Charge Off, Open, Closed, Paid, etc.' },
                    dateOpened: { type: 'string', description: 'Date opened MM/DD/YYYY' },
                    lastActivity: { type: 'string', description: 'Last activity date MM/DD/YYYY' },
                    accountType: { type: 'string', description: 'Collection, Credit Card, Auto Loan, etc.' },
                    originalCreditor: { type: 'string', description: 'Original creditor if collection' },
                    negativeReason: { type: 'string', description: 'Why this account is negative' },
                  },
                  required: ['accountName', 'accountNumber', 'balance', 'status', 'dateOpened', 'lastActivity', 'accountType', 'originalCreditor', 'negativeReason'],
                  additionalProperties: false,
                },
              },
            },
            required: ['accounts'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    console.log(`[Vision AI] Raw response length:`, content?.length || 0);
    
    const parsed = safeJsonParse(content, content);
    console.log(`[Vision AI] Parsed ${parsed.accounts?.length || 0} accounts from ${bureau}`);
    
    const accounts = parsed.accounts.map((acc: any) => ({
      accountName: acc.accountName || 'Unknown Account',
      accountNumber: acc.accountNumber || 'Not Reported',
      balance: typeof acc.balance === 'number' ? acc.balance : 0,
      status: acc.status || 'Not Reported',
      dateOpened: parseDate(acc.dateOpened),
      lastActivity: parseDate(acc.lastActivity),
      accountType: acc.accountType || 'Not Reported',
      originalCreditor: acc.originalCreditor || '',
      negativeReason: acc.negativeReason || 'Negative account',
      bureau,
      rawData: JSON.stringify(acc),
    }));
    
    // Log each account found
    for (const acc of accounts) {
      console.log(`[Vision AI] Found: ${acc.accountName} | Status: ${acc.status} | Balance: $${acc.balance} | Reason: ${acc.negativeReason}`);
    }
    
    return accounts;
  } catch (error) {
    console.error('[Vision AI] Parsing failed:', error);
    return [];
  }
}

/**
 * Use Vision AI to extract negative accounts from COMBINED 3-bureau PDF
 * AGGRESSIVE EXTRACTION - Must find ALL 47+ negative items across bureaus
 */
async function parseWithVisionAICombined(fileUrl: string): Promise<ParsedAccount[]> {
  console.log(`[Vision AI Combined] Processing combined 3-bureau report`);
  
  const systemPrompt = `You are an EXPERT credit report analyst. This PDF contains a COMBINED 3-bureau credit report (TransUnion, Equifax, Experian).

**CRITICAL: EXTRACT EVERY SINGLE NEGATIVE ITEM - NO LIMIT! Combined reports can have 50, 100, even 150+ items. Extract them ALL across all 3 bureaus!**

=== REPORT FORMAT ===
- 3-column layout: TransUnion | EQUIFAX | Experian
- Same account appears in multiple columns with DIFFERENT data per bureau
- You MUST create SEPARATE entries for EACH bureau where an account appears
- Example: TSI collection on all 3 bureaus = 3 separate entries

=== SECTIONS TO SCAN (CHECK ALL!) ===
1. **Account Summary** - Shows counts: Derogatory, Collections, Late Payments per bureau
2. **Collections Section** - MOST IMPORTANT - All collection accounts
3. **Accounts/Tradelines Section** - Credit cards, loans with payment history
4. **Potentially Negative Section** - Flagged accounts
5. **Public Records** - Bankruptcies, judgments, liens
6. **Inquiries** - Hard pulls (optional)

=== WHAT MAKES AN ACCOUNT NEGATIVE ===

**COLLECTIONS (Extract ALL):**
- TSI, TRANSWORLD SYSTEM INC, FST FINANCIA, NCA, NATCREADJ
- INNOVATIVE R, PRO COLLECT, LVNV FUNDING, MIDLAND CREDIT
- PORTFOLIO RECOVERY, CAVALRY, ENCORE CAPITAL, JEFFERSON CAPITAL
- IC SYSTEM, CONVERGENT, ENHANCED RECOVERY, AFNI, ALLIED
- RECEIVABLES PERFORMANCE, CREDIT COLLECTION SERVICES
- NATIONWIDE CREDIT, ERC, FIRST NATIONAL COLLECTION
- CREDENCE, RADIUS GLOBAL, RESURGENT CAPITAL
- Medical: EMERGENCY PHYSICIANS, any HOSPITAL, MEDICAL, HEALTHCARE
- Utility: ELECTRIC, GAS, WATER companies

**CHARGE-OFFS:**
- Status: "Charge Off", "Charged Off", "CO", "Written Off", "Profit/Loss"
- Even with $0 balance - still negative!

**LATE PAYMENTS (Check Payment History!):**
- Look at payment grid for EACH account on EACH bureau
- Numbers: 30, 60, 90, 120, 150, 180 = days late
- Letters: L, X, or any non-OK/current marker
- Create entry for EACH account with ANY late payment

**OTHER NEGATIVES:**
- Closed by Credit Grantor
- Repossession/Repo
- Foreclosure
- Bankruptcy (Ch 7, 13)
- Judgment, Tax Lien
- Settled for Less
- Paid Collection (still negative!)
- Insurance/Government Claim

=== EXTRACTION FORMAT ===

FOR EACH NEGATIVE ON EACH BUREAU:
- bureau: "TransUnion", "Equifax", or "Experian" (REQUIRED!)
- accountName: Exact creditor/agency name
- accountNumber: Account number (partial OK)
- balance: Current balance as NUMBER
- status: Exact status from that bureau's column
- dateOpened: MM/DD/YYYY
- lastActivity: MM/DD/YYYY
- accountType: Collection, Credit Card, Auto Loan, Medical, etc.
- originalCreditor: Original creditor if collection
- negativeReason: Specific reason for THIS bureau

=== CRITICAL RULES ===

1. **SEPARATE ENTRY PER BUREAU** - Same account on 3 bureaus = 3 JSON entries
2. **SCAN EVERY PAGE** - Don't stop at first page
3. **CHECK PAYMENT HISTORY GRIDS** - Late payments hide here
4. **INCLUDE PAID COLLECTIONS** - Still hurt credit
5. **INCLUDE $0 BALANCE NEGATIVES** - Charge-offs often $0
6. **CAPTURE BUREAU DIFFERENCES** - Balances/dates may differ

**THERE IS NO LIMIT - EXTRACT EVERY NEGATIVE ACCOUNT FROM ALL 3 BUREAUS!**
**If you find 30, extract 30. If you find 150, extract 150. Miss NOTHING!**
**Each account on each bureau = separate entry. Be EXHAUSTIVE!**`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: `This is a combined 3-bureau credit report (CreditHero format). Extract EVERY negative account from ALL THREE bureaus. Create SEPARATE entries for each bureau. Include the exact status, balance, dates, and reason why each account is negative.` },
            { type: 'file_url', file_url: { url: fileUrl, mime_type: 'application/pdf' } }
          ]
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'credit_accounts',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    bureau: { type: 'string', description: 'TransUnion, Equifax, or Experian' },
                    accountName: { type: 'string', description: 'Creditor or collection agency name' },
                    accountNumber: { type: 'string', description: 'Account number' },
                    balance: { type: 'number', description: 'Current balance' },
                    status: { type: 'string', description: 'Exact status from report' },
                    dateOpened: { type: 'string', description: 'Date opened MM/DD/YYYY' },
                    lastActivity: { type: 'string', description: 'Last activity MM/DD/YYYY' },
                    accountType: { type: 'string', description: 'Account type' },
                    originalCreditor: { type: 'string', description: 'Original creditor if collection' },
                    negativeReason: { type: 'string', description: 'Why this account is negative' },
                  },
                  required: ['bureau', 'accountName', 'accountNumber', 'balance', 'status', 'dateOpened', 'lastActivity', 'accountType', 'originalCreditor', 'negativeReason'],
                  additionalProperties: false,
                },
              },
            },
            required: ['accounts'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    console.log(`[Vision AI Combined] Raw response length:`, content?.length || 0);
    
    const parsed = safeJsonParse(content, content);
    console.log(`[Vision AI Combined] Parsed ${parsed.accounts?.length || 0} total accounts`);
    
    // Count by bureau
    const bureauCounts = { TransUnion: 0, Equifax: 0, Experian: 0 };
    
    const accounts = parsed.accounts.map((acc: any) => {
      const bureau = acc.bureau as 'TransUnion' | 'Equifax' | 'Experian';
      if (bureauCounts[bureau] !== undefined) bureauCounts[bureau]++;
      
      return {
        accountName: acc.accountName || 'Unknown Account',
        accountNumber: acc.accountNumber || 'Not Reported',
        balance: typeof acc.balance === 'number' ? acc.balance : 0,
        status: acc.status || 'Not Reported',
        dateOpened: parseDate(acc.dateOpened),
        lastActivity: parseDate(acc.lastActivity),
        accountType: acc.accountType || 'Not Reported',
        originalCreditor: acc.originalCreditor || '',
        negativeReason: acc.negativeReason || 'Negative account',
        bureau: bureau || 'TransUnion',
        rawData: JSON.stringify(acc),
      };
    });
    
    console.log(`[Vision AI Combined] Bureau breakdown: TU=${bureauCounts.TransUnion}, EQ=${bureauCounts.Equifax}, EX=${bureauCounts.Experian}`);
    
    return accounts;
  } catch (error) {
    console.error('[Vision AI Combined] Parsing failed:', error);
    return [];
  }
}

/**
 * Performs a Light Analysis on a credit report to provide a teaser.
 * Uses REAL parsed data - no simulations!
 */
export async function performLightAnalysis(fileUrl: string): Promise<LightAnalysisResult> {
  console.log('[Light Analysis] Starting comprehensive analysis...');
  
  const allAccounts = await parseWithVisionAICombined(fileUrl);
  
  console.log(`[Light Analysis] Found ${allAccounts.length} total negative accounts`);
  
  if (!allAccounts.length) {
    console.warn('[Light Analysis] No accounts found - this may indicate a parsing issue');
    // Return minimum viable response instead of throwing
    return {
      totalViolations: 0,
      severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
      categoryBreakdown: { latePayments: 0, collections: 0, chargeOffs: 0, judgments: 0, other: 0 },
    };
  }

  const categoryBreakdown = {
    latePayments: 0,
    collections: 0,
    chargeOffs: 0,
    judgments: 0,
    other: 0,
  };

  const severityBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const classifyCategory = (account: ParsedAccount): keyof typeof categoryBreakdown => {
    const blob = `${account.status} ${account.accountType} ${account.negativeReason || ''} ${account.accountName}`.toLowerCase();
    
    // Collections - check account type and common collection agency names
    if (blob.includes('collection') || 
        blob.includes('tsi') || blob.includes('transworld') ||
        blob.includes('midland') || blob.includes('portfolio') ||
        blob.includes('cavalry') || blob.includes('lvnv') ||
        blob.includes('encore') || blob.includes('jefferson') ||
        blob.includes('convergent') || blob.includes('enhanced') ||
        blob.includes('afni') || blob.includes('allied') ||
        blob.includes('ic system') || blob.includes('nca') ||
        blob.includes('pro collect') || blob.includes('innovative') ||
        blob.includes('fst financia') || blob.includes('receivables') ||
        account.accountType?.toLowerCase() === 'collection') {
      return 'collections';
    }
    
    // Charge-offs
    if (blob.includes('charge off') || blob.includes('charged off') || 
        blob.includes('chargeoff') || blob.includes('written off') ||
        blob.includes('profit') || blob.includes('loss write')) {
      return 'chargeOffs';
    }
    
    // Late payments
    if (blob.includes('late') || blob.includes('past due') || 
        blob.includes('delinquent') || blob.includes('days late') ||
        blob.includes('30 day') || blob.includes('60 day') ||
        blob.includes('90 day') || blob.includes('120 day')) {
      return 'latePayments';
    }
    
    // Judgments, liens, bankruptcies, foreclosures
    if (blob.includes('judgment') || blob.includes('lien') ||
        blob.includes('bankrupt') || blob.includes('foreclosure') ||
        blob.includes('repossession') || blob.includes('repo')) {
      return 'judgments';
    }
    
    return 'other';
  };

  const classifySeverity = (category: keyof typeof categoryBreakdown, balance: number): keyof typeof severityBreakdown => {
    // Critical: Collections, charge-offs, judgments, or high balance
    if (category === 'collections' || category === 'chargeOffs' || category === 'judgments') {
      return 'critical';
    }
    
    // High: Late payments or medium balance
    if (category === 'latePayments' || balance > 1000) {
      return 'high';
    }
    
    // Medium: Other negatives with some balance
    if (balance > 0) {
      return 'medium';
    }
    
    return 'low';
  };

  for (const account of allAccounts) {
    const category = classifyCategory(account);
    categoryBreakdown[category] += 1;
    
    const severity = classifySeverity(category, account.balance);
    severityBreakdown[severity] += 1;
  }

  console.log(`[Light Analysis] Category breakdown:`, categoryBreakdown);
  console.log(`[Light Analysis] Severity breakdown:`, severityBreakdown);

  return {
    totalViolations: allAccounts.length,
    severityBreakdown,
    categoryBreakdown,
  };
}

/**
 * Parse and save credit report for INDIVIDUAL bureau upload
 */
export async function parseAndSaveReport(
  reportId: number,
  fileUrl: string,
  bureau: 'transunion' | 'equifax' | 'experian',
  userId: number
): Promise<void> {
  try {
    console.log(`[Parser] Starting parse for report ${reportId}, bureau: ${bureau}`);
    
    // Use Vision AI to parse the PDF
    const bureauCapitalized = bureau.charAt(0).toUpperCase() + bureau.slice(1) as 'TransUnion' | 'Equifax' | 'Experian';
    const accounts = await parseWithVisionAI(fileUrl, bureauCapitalized);
    
    console.log(`[Parser] Vision AI extracted ${accounts.length} accounts`);
    
    // Save each account to database (with duplicate prevention)
    let newCount = 0;
    let skipCount = 0;
    
    for (const account of accounts) {
      const result = await db.createNegativeAccountIfNotExists({
        userId,
        creditReportId: reportId,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        balance: account.balance.toString(),
        status: account.status,
        dateOpened: account.dateOpened,
        lastActivity: account.lastActivity,
        accountType: account.accountType,
        originalCreditor: account.originalCreditor || null,
        bureau: bureau,
        rawData: account.rawData,
        negativeReason: account.negativeReason,
      });
      
      if (result.isNew) {
        newCount++;
      } else {
        skipCount++;
      }
    }
    
    console.log(`[Parser] Saved ${newCount} new accounts, skipped ${skipCount} duplicates`);
    
    // Update report status and save score to report record
    const personalInfo = await parsePersonalInfoWithAI(fileUrl, bureauCapitalized);
    const score = personalInfo?.creditScore || null;
    const scoreModel = personalInfo?.scoreModel || null;

    await db.updateCreditReportParsedData(reportId, 'parsed', score, scoreModel);

    // Auto-fill user profile from analysis when available (so Complete Profile modal can be pre-filled)
    if (personalInfo) {
      const addr = personalInfo.currentAddress;
      await db.updateUserProfile(userId, {
        fullName: personalInfo.fullName || undefined,
        currentAddress: addr?.fullAddress || undefined,
        currentCity: addr?.city || undefined,
        currentState: addr?.state || undefined,
        currentZip: addr?.zip || undefined,
        dateOfBirth: personalInfo.dateOfBirth || undefined,
        ssnLast4: personalInfo.ssnLast4 || undefined,
      });
    }

    if (score && scoreModel) {
      await db.recordCreditScore({ 
        userId, 
        bureau, 
        score, 
        scoreModel, 
        creditReportId: reportId 
      });
    }
    
  } catch (error) {
    console.error(`[Parser] Failed to parse report ${reportId}:`, error);
    await db.updateCreditReportStatus(reportId, 'failed');
    throw error;
  }
}

/**
 * Parse and save COMBINED 3-bureau credit report
 * Creates 3 report records (one per bureau) and distributes accounts accordingly
 */
export async function parseAndSaveCombinedReport(
  fileUrl: string,
  userId: number
): Promise<{ transunionId: number; equifaxId: number; experianId: number; totalAccounts: number }> {
  try {
    console.log(`[Parser Combined] Starting combined parse for user ${userId}`);
    
    // Step 1: Parse all negative accounts from the combined PDF
    const allAccounts = await parseWithVisionAICombined(fileUrl);
    
    // Step 2: Parse personal information and credit scores from the PDF
    // We can just parse one bureau since personal info is usually consistent
    const personalInfo = await parsePersonalInfoWithAI(fileUrl, 'TransUnion');
    
    // Step 3: If personal info was found, update the user's profile (auto-fill from analysis)
    if (personalInfo) {
      const addr = personalInfo.currentAddress;
      await db.updateUserProfile(userId, {
        fullName: personalInfo.fullName,
        currentAddress: addr?.fullAddress || '',
        currentCity: addr?.city || undefined,
        currentState: addr?.state || undefined,
        currentZip: addr?.zip || undefined,
        dateOfBirth: personalInfo.dateOfBirth || undefined,
        ssnLast4: personalInfo.ssnLast4 || undefined,
      });
    }

    console.log(`[Parser Combined] Vision AI extracted ${allAccounts.length} total accounts`);
    
    // Create 3 credit report records
    const transunionReport = await db.createCreditReport({
      userId,
      bureau: 'transunion',
      fileUrl,
      status: 'parsing',
    });
    
    const equifaxReport = await db.createCreditReport({
      userId,
      bureau: 'equifax',
      fileUrl,
      status: 'parsing',
    });
    
    const experianReport = await db.createCreditReport({
      userId,
      bureau: 'experian',
      fileUrl,
      status: 'parsing',
    });
    
    // Distribute accounts to correct bureaus
    let newCount = 0;
    let skipCount = 0;
    const bureauCounts = { transunion: 0, equifax: 0, experian: 0 };
    
    for (const account of allAccounts) {
      const bureauLower = account.bureau.toLowerCase() as 'transunion' | 'equifax' | 'experian';
      let reportId: number;
      
      switch (bureauLower) {
        case 'transunion':
          reportId = transunionReport.id;
          break;
        case 'equifax':
          reportId = equifaxReport.id;
          break;
        case 'experian':
          reportId = experianReport.id;
          break;
        default:
          console.warn(`[Parser Combined] Unknown bureau: ${account.bureau}, defaulting to TransUnion`);
          reportId = transunionReport.id;
      }
      
      const result = await db.createNegativeAccountIfNotExists({
        userId,
        creditReportId: reportId,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        balance: account.balance.toString(),
        status: account.status,
        dateOpened: account.dateOpened,
        lastActivity: account.lastActivity,
        accountType: account.accountType,
        originalCreditor: account.originalCreditor || null,
        bureau: bureauLower,
        rawData: account.rawData,
        negativeReason: account.negativeReason,
      });
      
      if (result.isNew) {
        newCount++;
        bureauCounts[bureauLower]++;
      } else {
        skipCount++;
      }
    }
    
    console.log(`[Parser Combined] Distribution: TU=${bureauCounts.transunion}, EQ=${bureauCounts.equifax}, EX=${bureauCounts.experian}`);
    console.log(`[Parser Combined] Saved ${newCount} new accounts, skipped ${skipCount} duplicates`);

    // Extract all 3 bureau scores from combined report (each bureau has its own number: e.g. TU 587, EQ 573, EX 665)
    const allScores = await parseAllBureauScoresFromCombined(fileUrl);
    const fallbackScore = personalInfo?.creditScore ?? null;
    const fallbackModel = personalInfo?.scoreModel ?? allScores?.scoreModel ?? null;

    // Use per-bureau scores when AI returns them; only use single fallback when AI fails entirely (so we never show 587 for all three when report has 587/573/665)
    const hasAnyBureauScore = allScores && (allScores.transunion != null || allScores.equifax != null || allScores.experian != null);
    const tuScore = hasAnyBureauScore ? (allScores!.transunion ?? null) : fallbackScore;
    const eqScore = hasAnyBureauScore ? (allScores!.equifax ?? null) : fallbackScore;
    const exScore = hasAnyBureauScore ? (allScores!.experian ?? null) : fallbackScore;

    await db.updateCreditReportParsedData(transunionReport.id, 'parsed', tuScore, fallbackModel);
    await db.updateCreditReportParsedData(equifaxReport.id, 'parsed', eqScore, fallbackModel);
    await db.updateCreditReportParsedData(experianReport.id, 'parsed', exScore, fallbackModel);

    if (hasAnyBureauScore) {
      if (allScores!.transunion != null) await db.recordCreditScore({ userId, bureau: 'transunion', score: allScores!.transunion, scoreModel: allScores!.scoreModel ?? undefined });
      if (allScores!.equifax != null) await db.recordCreditScore({ userId, bureau: 'equifax', score: allScores!.equifax, scoreModel: allScores!.scoreModel ?? undefined });
      if (allScores!.experian != null) await db.recordCreditScore({ userId, bureau: 'experian', score: allScores!.experian, scoreModel: allScores!.scoreModel ?? undefined });
    } else if (fallbackScore != null) {
      await db.recordCreditScore({ userId, bureau: 'transunion', score: fallbackScore, scoreModel: fallbackModel ?? undefined });
      await db.recordCreditScore({ userId, bureau: 'equifax', score: fallbackScore, scoreModel: fallbackModel ?? undefined });
      await db.recordCreditScore({ userId, bureau: 'experian', score: fallbackScore, scoreModel: fallbackModel ?? undefined });
    }

    return {
      transunionId: transunionReport.id,
      equifaxId: equifaxReport.id,
      experianId: experianReport.id,
      totalAccounts: newCount,
    };
    
  } catch (error) {
    console.error(`[Parser Combined] Failed:`, error);
    throw error;
  }
}

/**
 * Extract personal information from credit report using AI
 */
export async function parsePersonalInfoWithAI(fileUrl: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<PersonalInfo | null> {
  console.log(`[AI Parser] Extracting personal info from ${bureau} report`);
  
  const systemPrompt = `You are an expert credit report analyst. Extract the consumer's personal information from the credit report.

Extract:
- fullName: The consumer's full legal name as shown on the report
- currentAddress: Their current/most recent address (street, city, state, zip)
- previousAddresses: Any previous addresses listed (array)
- dateOfBirth: Date of birth (MM/DD/YYYY format)
- ssnLast4: Last 4 digits of SSN (just the 4 digits, no dashes)
- creditScore: The credit score shown on the report (3-digit number)
- scoreModel: The score model used (FICO, VantageScore 3.0, etc.)

IMPORTANT:
- Use EXACT name as shown on credit report
- Use EXACT address as shown
- If SSN shows as XXX-XX-1234, extract just "1234"
- If any field is not found, use empty string`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: `Extract personal information from this ${bureau} credit report.` },
            { type: 'file_url', file_url: { url: fileUrl, mime_type: 'application/pdf' } }
          ]
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'personal_info',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              fullName: { type: 'string' },
              currentAddress: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zip: { type: 'string' },
                },
                required: ['street', 'city', 'state', 'zip'],
                additionalProperties: false,
              },
              previousAddresses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zip: { type: 'string' },
                  },
                  required: ['street', 'city', 'state', 'zip'],
                  additionalProperties: false,
                },
              },
              dateOfBirth: { type: 'string' },
              ssnLast4: { type: 'string' },
              creditScore: { type: 'number' },
              scoreModel: { type: 'string' },
            },
            required: ['fullName', 'currentAddress', 'previousAddresses', 'dateOfBirth', 'ssnLast4', 'creditScore', 'scoreModel'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = safeJsonParse(content, content);
    
    return {
      fullName: parsed.fullName || '',
      currentAddress: {
        street: parsed.currentAddress?.street || '',
        city: parsed.currentAddress?.city || '',
        state: parsed.currentAddress?.state || '',
        zip: parsed.currentAddress?.zip || '',
        fullAddress: `${parsed.currentAddress?.street || ''}, ${parsed.currentAddress?.city || ''}, ${parsed.currentAddress?.state || ''} ${parsed.currentAddress?.zip || ''}`.trim(),
      },
      previousAddresses: (parsed.previousAddresses || []).map((addr: any) => ({
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.zip || '',
        fullAddress: `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim(),
      })),
      dateOfBirth: parsed.dateOfBirth || null,
      ssnLast4: parsed.ssnLast4 || null,
      creditScore: parsed.creditScore || null,
      scoreModel: parsed.scoreModel || null,
    };
  } catch (error) {
    console.error('[AI Parser] Personal info extraction failed:', error);
    return null;
  }
}

/** Result of extracting all 3 bureau scores from a combined report (e.g. VantageScore 3.0 per bureau) */
export interface AllBureauScores {
  transunion: number | null;
  equifax: number | null;
  experian: number | null;
  scoreModel: string | null;
}

/**
 * Extract credit scores for ALL 3 bureaus from a combined 3-bureau report PDF.
 * Many reports show TransUnion, Equifax, Experian side-by-side with different scores (300-850).
 */
export async function parseAllBureauScoresFromCombined(fileUrl: string): Promise<AllBureauScores | null> {
  console.log('[AI Parser] Extracting all 3 bureau scores from combined report');
  const systemPrompt = `You are an expert credit report analyst. This is a COMBINED report that shows credit scores from all three bureaus (TransUnion, Equifax, Experian), often side-by-side or in separate sections with labels like "VantageScore® 3.0" or "FICO".

CRITICAL: Each bureau has its OWN score. They are almost always DIFFERENT numbers (e.g. TransUnion 587, Equifax 573, Experian 665). Do NOT use the same number for all three unless the document literally shows one score applied to all bureaus.

Extract the credit score (integer 300-850) for EACH bureau from its own section/column:
- transunion: the number shown under or next to TransUnion only
- equifax: the number shown under or next to Equifax only  
- experian: the number shown under or next to Experian only
- scoreModel: string (e.g. "VantageScore 3.0", "FICO 8") or null

If you cannot find a score for a specific bureau, use null for that bureau only. Do NOT copy another bureau's score into a bureau you could not read.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the credit score for TransUnion, Equifax, and Experian from this combined credit report. Return each bureau score separately.' },
            { type: 'file_url', file_url: { url: fileUrl, mime_type: 'application/pdf' } },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'all_bureau_scores',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              transunion: { type: 'number' },
              equifax: { type: 'number' },
              experian: { type: 'number' },
              scoreModel: { type: 'string' },
            },
            required: ['scoreModel'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = safeJsonParse(content, content);
    if (!parsed) return null;

    const clamp = (n: unknown): number | null => {
      if (typeof n !== 'number' || !Number.isFinite(n)) return null;
      return Math.max(300, Math.min(850, Math.round(n)));
    };

    return {
      transunion: clamp(parsed.transunion),
      equifax: clamp(parsed.equifax),
      experian: clamp(parsed.experian),
      scoreModel: typeof parsed.scoreModel === 'string' ? parsed.scoreModel : null,
    };
  } catch (error) {
    console.error('[AI Parser] All-bureau scores extraction failed:', error);
    return null;
  }
}

/**
 * Legacy text-based parsing (fallback)
 */
export function parseCreditReport(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): ParsedCreditReport {
  const accounts: ParsedAccount[] = [];
  
  const negativeKeywords = [
    'collection', 'charge off', 'charged off', 'delinquent',
    'late payment', 'past due', 'unpaid', 'defaulted',
  ];

  const sections = text.split(/\n\n+/);

  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    const isNegative = negativeKeywords.some(keyword => lowerSection.includes(keyword));

    if (!isNegative) continue;

    const account = extractAccountDetails(section, bureau);
    if (account) {
      accounts.push(account);
    }
  }

  return {
    bureau,
    accounts,
    reportDate: new Date(),
    rawText: text,
  };
}

function extractAccountDetails(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): ParsedAccount | null {
  const accountNameMatch = text.match(/(?:Account:|Creditor:|Name:)\s*([^\n]+)/i) ||
                           text.match(/^([A-Z][A-Z\s]+)/m);
  
  if (!accountNameMatch) return null;

  const accountNumberMatch = text.match(/(?:Account\s*#?:|Number:)\s*([^\n]+)/i);
  const balanceMatch = text.match(/(?:Balance:|Amount:|Owed:)\s*\$?([\d,]+\.?\d*)/i);
  const statusMatch = text.match(/(?:Status:|Account Status:)\s*([^\n]+)/i);
  const dateOpenedMatch = text.match(/(?:Date Opened:|Opened:)\s*([^\n]+)/i);
  const lastActivityMatch = text.match(/(?:Last Activity:|Last Reported:)\s*([^\n]+)/i);

  return {
    accountName: accountNameMatch[1].trim(),
    accountNumber: accountNumberMatch?.[1]?.trim() || 'Not Reported',
    balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
    status: statusMatch?.[1]?.trim() || 'Not Reported',
    dateOpened: dateOpenedMatch ? parseDate(dateOpenedMatch[1].trim()) : null,
    lastActivity: lastActivityMatch ? parseDate(lastActivityMatch[1].trim()) : null,
    accountType: 'Unknown',
    bureau,
    rawData: text,
    negativeReason: 'Negative account',
  };
}

/**
 * AI-based text parsing (for extracted PDF text)
 */
export async function parseWithAI(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<ParsedAccount[]> {
  console.log(`[AI Parser] Processing ${bureau} report, text length: ${text.length}`);
  
  const systemPrompt = `You are an expert credit report analyst. Extract EVERY negative account from this credit report text.

A NEGATIVE ACCOUNT includes:
- Collection accounts
- Charge-offs
- Late payments (30/60/90/120+ days)
- Bankruptcies, Judgments, Tax liens
- Repossessions, Foreclosures
- Any account marked derogatory or adverse

For EACH account, extract:
- accountName: Creditor/collection agency name
- accountNumber: Account number
- balance: Current balance as number
- status: Exact status (Collection, Charge Off, etc.)
- dateOpened: Date opened (MM/DD/YYYY)
- lastActivity: Last activity date (MM/DD/YYYY)
- accountType: Type (Collection, Credit Card, etc.)
- originalCreditor: Original creditor if collection
- negativeReason: Why this account is negative`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract ALL negative accounts from this ${bureau} credit report:\n\n${text}` },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'credit_accounts',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    accountName: { type: 'string' },
                    accountNumber: { type: 'string' },
                    balance: { type: 'number' },
                    status: { type: 'string' },
                    dateOpened: { type: 'string' },
                    lastActivity: { type: 'string' },
                    accountType: { type: 'string' },
                    originalCreditor: { type: 'string' },
                    negativeReason: { type: 'string' },
                  },
                  required: ['accountName', 'accountNumber', 'balance', 'status', 'dateOpened', 'lastActivity', 'accountType', 'originalCreditor', 'negativeReason'],
                  additionalProperties: false,
                },
              },
            },
            required: ['accounts'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = safeJsonParse(content, content);
    
    return parsed.accounts.map((acc: any) => ({
      ...acc,
      dateOpened: parseDate(acc.dateOpened),
      lastActivity: parseDate(acc.lastActivity),
      bureau,
      rawData: '',
    }));
  } catch (error) {
    console.error('AI parsing failed:', error);
    return parseCreditReport(text, bureau).accounts;
  }
}
