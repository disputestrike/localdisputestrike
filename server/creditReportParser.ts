/**
 * Credit Report Parser
 * 
 * Extracts negative accounts from credit report PDFs/text
 * Supports all 3 bureaus: TransUnion, Equifax, Experian
 */

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
  scoreModel: string | null; // FICO, VantageScore, etc.
}

export interface ParsedCreditReport {
  bureau: 'TransUnion' | 'Equifax' | 'Experian';
  accounts: ParsedAccount[];
  personalInfo?: PersonalInfo;
  score?: number;
  reportDate: Date;
  rawText: string;
}

/**
 * Parse credit report text and extract negative accounts
 */
export function parseCreditReport(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): ParsedCreditReport {
  const accounts: ParsedAccount[] = [];
  
  // Common patterns for negative accounts
  const negativeKeywords = [
    'collection',
    'charge off',
    'charged off',
    'delinquent',
    'late payment',
    'past due',
    'unpaid',
    'defaulted',
  ];

  // Split text into sections (each account is usually a block)
  const sections = text.split(/\n\n+/);

  for (const section of sections) {
    // Check if this section contains negative account indicators
    const lowerSection = section.toLowerCase();
    const isNegative = negativeKeywords.some(keyword => lowerSection.includes(keyword));

    if (!isNegative) continue;

    // Extract account details
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

/**
 * Extract account details from a text section
 */
function extractAccountDetails(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): ParsedAccount | null {
  // Extract account name (usually first line or after "Account:" label)
  const accountNameMatch = text.match(/(?:Account:|Creditor:|Name:)\s*([^\n]+)/i) || 
                          text.match(/^([A-Z][A-Z\s&,.']+)/m);
  const accountName = accountNameMatch?.[1]?.trim() || 'Unknown Account';

  // Extract account number
  const accountNumberMatch = text.match(/(?:Account\s*(?:Number|#)|Acct\s*#):\s*([^\n\s]+)/i);
  const accountNumber = accountNumberMatch?.[1]?.trim() || 'Unknown';

  // Extract balance
  const balanceMatch = text.match(/(?:Balance|Amount|Unpaid):\s*\$?([\d,]+(?:\.\d{2})?)/i);
  const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0;

  // Extract status
  const statusMatch = text.match(/(?:Status|Current\s*Rating):\s*([^\n]+)/i);
  const status = statusMatch?.[1]?.trim() || 'Unknown';

  // Extract dates
  const dateOpenedMatch = text.match(/(?:Date\s*Opened|Opened):\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  const lastActivityMatch = text.match(/(?:Last\s*Activity|Activity):\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);

  const dateOpened = dateOpenedMatch ? parseDate(dateOpenedMatch[1]) : null;
  const lastActivity = lastActivityMatch ? parseDate(lastActivityMatch[1]) : null;

  // Extract account type
  const accountTypeMatch = text.match(/(?:Type|Account\s*Type):\s*([^\n]+)/i);
  const accountType = accountTypeMatch?.[1]?.trim() || 'Collection';

  // Extract original creditor
  const originalCreditorMatch = text.match(/(?:Original\s*Creditor):\s*([^\n]+)/i);
  const originalCreditor = originalCreditorMatch?.[1]?.trim();

  return {
    accountName,
    accountNumber,
    balance,
    status,
    dateOpened,
    lastActivity,
    accountType,
    originalCreditor,
    bureau,
    rawData: text,
  };
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr: string): Date | null {
  try {
    // Handle MM/DD/YYYY, MM/DD/YY formats
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let [month, day, year] = parts.map(p => parseInt(p, 10));
      
      // Handle 2-digit years
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }

      return new Date(year, month - 1, day);
    }
  } catch (e) {
    // Invalid date
  }
  return null;
}

/**
 * Extract text from PDF buffer using pdf-parse
 */
import { invokeLLM } from './_core/llm';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  console.log('[PDF Parser] First 500 chars:', result.text.slice(0, 500));
  console.log('[PDF Parser] Total length:', result.text.length);
  return result.text;
}

/**
 * Use Manus AI to intelligently extract negative accounts from credit report text
 */
export async function parseWithAI(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<ParsedAccount[]> {
  console.log(`[AI Parser] Processing ${bureau} report, text length: ${text.length}`);
  console.log(`[AI Parser] First 300 chars:`, text.slice(0, 300));
  
  const systemPrompt = `You are an expert credit report analyst. Your CRITICAL task is to extract EVERY SINGLE negative account from this credit report. Do NOT miss any accounts.

A NEGATIVE ACCOUNT includes ANY of these:
- Collection accounts (from collection agencies like LVNV, Midland, Portfolio Recovery, etc.)
- Charge-offs (accounts written off by creditors)
- Late payments (30, 60, 90, 120+ days late - even if now current)
- Bankruptcies
- Judgments and tax liens
- Repossessions and foreclosures
- Medical debt
- Utility collections
- Student loan defaults
- Accounts marked "derogatory", "adverse", "negative", or "potentially negative"
- Accounts with payment history showing any late marks (30/60/90/120/150/180)
- Closed accounts with negative history
- Accounts in dispute
- ANY account that could negatively impact credit score

IMPORTANT: Credit reports typically have 20-50+ negative items. If you find fewer than 10, you are likely MISSING accounts. Look more carefully at:
- The "Accounts" section
- The "Collections" section  
- The "Public Records" section
- The "Potentially Negative" section
- The "Adverse Accounts" section
- Payment history grids showing late payments

For EACH negative account, extract:
- accountName: Creditor/collection agency name (REQUIRED)
- accountNumber: Account number (partial is fine)
- balance: Current balance as number (0 if paid)
- status: Current status (Collection, Charge-off, Late 30/60/90, Paid Collection, etc.)
- dateOpened: Date opened (MM/DD/YYYY)
- lastActivity: Last activity date (MM/DD/YYYY)
- accountType: Type (Collection, Credit Card, Medical, Auto Loan, Mortgage, Student Loan, etc.)
- originalCreditor: Original creditor if this is a collection

Be EXHAUSTIVE - extract EVERY negative account. Missing accounts means the consumer cannot dispute them.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CRITICAL: Extract EVERY SINGLE negative account from this ${bureau} credit report. Do NOT miss any accounts. Most reports have 20-50+ negative items. If you find fewer than 15, you are missing accounts - look more carefully.\n\nCredit Report Text:\n${text}` },
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
                  },
                  required: ['accountName'],
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
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    
    return parsed.accounts.map((acc: any) => ({
      ...acc,
      dateOpened: acc.dateOpened ? parseDate(acc.dateOpened) : null,
      lastActivity: acc.lastActivity ? parseDate(acc.lastActivity) : null,
      bureau,
      rawData: '',
    }));
  } catch (error) {
    console.error('AI parsing failed, falling back to regex:', error);
    // Fallback to regex parsing
    const parsed = parseCreditReport(text, bureau);
    return parsed.accounts;
  }
}

/**
 * Extract personal information from credit report using AI
 * This is the PRIMARY source for user data - NOT manual entry
 */
export async function parsePersonalInfoWithAI(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<PersonalInfo | null> {
  console.log(`[AI Parser] Extracting personal info from ${bureau} report`);
  
  const systemPrompt = `You are an expert credit report analyst. Extract the consumer's personal information from the credit report.

Extract:
- fullName: The consumer's full legal name as shown on the report
- currentAddress: Their current/most recent address (street, city, state, zip)
- previousAddresses: Any previous addresses listed (array)
- dateOfBirth: Date of birth (MM/DD/YYYY format)
- ssnLast4: Last 4 digits of SSN (just the 4 digits, no dashes)
- creditScore: The credit score shown on the report (3-digit number like 650, 720, etc.)
- scoreModel: The score model used (FICO, VantageScore 3.0, VantageScore 4.0, etc.)

IMPORTANT:
- Use EXACT name as shown on credit report (this must match bureau records)
- Use EXACT address as shown (for legal compliance)
- If SSN shows as XXX-XX-1234, extract just "1234"
- Credit score is usually prominently displayed at the top of the report
- Look for "FICO Score", "VantageScore", "Credit Score", or similar labels
- If any field is not found, use null

Return valid JSON only.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract personal information from this ${bureau} credit report header:\n\n${text.slice(0, 5000)}` },
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
              dateOfBirth: { type: ['string', 'null'] },
              ssnLast4: { type: ['string', 'null'] },
              creditScore: { type: ['number', 'null'] },
              scoreModel: { type: ['string', 'null'] },
            },
            required: ['fullName', 'currentAddress', 'previousAddresses', 'dateOfBirth', 'ssnLast4', 'creditScore', 'scoreModel'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Build full address strings
    const currentAddress = {
      ...parsed.currentAddress,
      fullAddress: `${parsed.currentAddress.street}, ${parsed.currentAddress.city}, ${parsed.currentAddress.state} ${parsed.currentAddress.zip}`,
    };
    
    const previousAddresses = (parsed.previousAddresses || []).map((addr: any) => ({
      ...addr,
      fullAddress: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`,
    }));
    
    console.log(`[AI Parser] Extracted personal info: ${parsed.fullName}, ${currentAddress.fullAddress}`);
    
    return {
      fullName: parsed.fullName,
      currentAddress,
      previousAddresses,
      dateOfBirth: parsed.dateOfBirth,
      ssnLast4: parsed.ssnLast4,
      creditScore: parsed.creditScore,
      scoreModel: parsed.scoreModel,
    };
  } catch (error) {
    console.error('Failed to extract personal info:', error);
    return null;
  }
}

/**
 * Parse multiple credit reports and merge accounts
 */
export function parseMultipleReports(reports: { text: string; bureau: 'TransUnion' | 'Equifax' | 'Experian' }[]): ParsedAccount[] {
  const allAccounts: ParsedAccount[] = [];

  for (const report of reports) {
    const parsed = parseCreditReport(report.text, report.bureau);
    allAccounts.push(...parsed.accounts);
  }

  return allAccounts;
}


/**
 * Use Vision AI to extract negative accounts from image-based PDF
 */
async function parseWithVisionAI(fileUrl: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<ParsedAccount[]> {
  console.log(`[Vision AI] Processing ${bureau} report from: ${fileUrl.slice(0, 80)}...`);
  
  const systemPrompt = `You are an expert credit report analyst. Your CRITICAL task is to extract EVERY SINGLE negative account from this credit report PDF. Do NOT miss any accounts.

SCAN EVERY PAGE CAREFULLY. Credit reports are typically 20-50+ pages with accounts scattered throughout.

A NEGATIVE ACCOUNT includes ANY of these:
- Collection accounts (LVNV, Midland, Portfolio Recovery, Cavalry, Encore Capital, etc.)
- Charge-offs (accounts written off by original creditors)
- Late payments (30, 60, 90, 120+ days late - even if account is now current)
- Bankruptcies (Chapter 7, Chapter 13)
- Judgments and civil judgments
- Tax liens (federal, state, local)
- Repossessions (auto repos)
- Foreclosures
- Medical debt and medical collections
- Utility collections (electric, gas, water, phone)
- Student loan defaults or delinquencies
- Accounts marked "derogatory", "adverse", "negative", or "potentially negative"
- Accounts with payment history showing ANY late marks (30/60/90/120/150/180)
- Closed accounts with negative history
- Accounts currently in dispute
- Paid collections (still negative even if paid)
- Settled accounts (settled for less than full balance)
- ANY account that could negatively impact credit score

IMPORTANT: Most credit reports have 20-50+ negative items. If you find fewer than 15, you are likely MISSING accounts. Look at:
- "Accounts" or "Account Information" section
- "Collections" section
- "Public Records" section
- "Potentially Negative" or "Adverse" section
- "Closed Accounts" section
- Payment history grids (look for any 30/60/90/120 marks)
- Each page of the PDF - accounts are often spread across many pages

For EACH negative account, extract:
- accountName: The creditor or collection agency name (REQUIRED - never leave blank)
- accountNumber: The account number (partial is fine, e.g., "****1234")
- balance: Current balance as a number (0 if paid off)
- status: Current status (Collection, Charge-off, Late 30/60/90, Paid Collection, Settled, etc.)
- dateOpened: Date account was opened (MM/DD/YYYY format)
- lastActivity: Last activity date (MM/DD/YYYY format)
- accountType: Type of account (Collection, Credit Card, Medical, Auto Loan, Mortgage, Student Loan, Personal Loan, etc.)
- originalCreditor: Original creditor if this is a collection account

Be EXHAUSTIVE - extract EVERY negative account from EVERY page. Missing accounts means the consumer cannot dispute them and fix their credit.`;

  try {
    // Use file_url for PDFs (not image_url)
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: `This is a ${bureau} credit report PDF. CRITICAL: You MUST extract EVERY SINGLE negative account from ALL pages of this document. Do not stop early. Do not summarize. Extract each account individually with full details. Most reports have 20-50+ negative items - if you find fewer than 15, look again more carefully at every page. List EVERY negative account found.` },
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
                    accountName: { type: 'string' },
                    accountNumber: { type: 'string' },
                    balance: { type: 'number' },
                    status: { type: 'string' },
                    dateOpened: { type: 'string' },
                    lastActivity: { type: 'string' },
                    accountType: { type: 'string' },
                    originalCreditor: { type: 'string' },
                  },
                  required: ['accountName'],
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
    console.log(`[Vision AI] Raw response:`, content?.slice(0, 500));
    
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    console.log(`[Vision AI] Parsed ${parsed.accounts?.length || 0} accounts`);
    
    const accounts = parsed.accounts.map((acc: any) => ({
      ...acc,
      dateOpened: acc.dateOpened ? parseDate(acc.dateOpened) : null,
      lastActivity: acc.lastActivity ? parseDate(acc.lastActivity) : null,
      bureau,
      rawData: '',
    }));
    
    // Log each account found
    for (const acc of accounts) {
      console.log(`[Vision AI] Found: ${acc.accountName} - ${acc.status} - $${acc.balance}`);
    }
    
    return accounts;
  } catch (error) {
    console.error('[Vision AI] Parsing failed:', error);
    return [];
  }
}

/**
 * Async function to parse credit report from URL and save to database
 */
export async function parseAndSaveReport(
  reportId: number,
  fileUrl: string,
  bureau: 'transunion' | 'equifax' | 'experian',
  userId: number
): Promise<void> {
  try {
    // Fetch file from URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Get file as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Map bureau name
    const bureauMap = {
      transunion: 'TransUnion' as const,
      equifax: 'Equifax' as const,
      experian: 'Experian' as const,
    };

    // Extract text from PDF
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
      console.log(`Extracted ${text.length} characters from PDF`);
      
      // If extracted text is too short, the PDF might be scanned/image-based
      // Use vision AI to extract text from the PDF images
      if (text.length < 1000) {
        console.log('[Parser] Text too short, PDF might be image-based. Using vision AI...');
        // For image-based PDFs, we'll pass the file URL directly to vision AI
        const accounts = await parseWithVisionAI(fileUrl, bureauMap[bureau]);
        console.log(`Vision AI extracted ${accounts.length} negative accounts`);
        
        // Save accounts to database
        const { createNegativeAccount, updateCreditReportParsedData } = await import('./db');
        for (const account of accounts) {
          await createNegativeAccount({
            userId,
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            balance: account.balance.toString(),
            status: account.status,
            accountType: account.accountType,
            dateOpened: account.dateOpened?.toISOString() || null,
            lastActivity: account.lastActivity?.toISOString() || null,
            originalCreditor: account.originalCreditor || null,

            hasConflicts: false,
          });
        }
        
        // Update report as parsed
        await updateCreditReportParsedData(reportId, '');
        console.log(`Successfully parsed ${accounts.length} accounts from ${bureau} report`);
        return;
      }
    } catch (error) {
      console.error('PDF extraction failed, trying as plain text:', error);
      text = buffer.toString('utf-8');
    }

    // Parse the report using AI
    let accounts: ParsedAccount[];
    try {
      accounts = await parseWithAI(text, bureauMap[bureau]);
      console.log(`AI extracted ${accounts.length} negative accounts`);
    } catch (error) {
      console.error('AI parsing failed, using regex fallback:', error);
      const parsed = parseCreditReport(text, bureauMap[bureau]);
      accounts = parsed.accounts;
    }
    
    // CRITICAL: Extract personal info from credit report (PRIMARY source for user data)
    let personalInfo: PersonalInfo | null = null;
    try {
      personalInfo = await parsePersonalInfoWithAI(text, bureauMap[bureau]);
      if (personalInfo) {
        console.log(`[Parser] Extracted personal info: ${personalInfo.fullName}`);
        
        // Save personal info to user profile (this is the PRIMARY source)
        const { upsertUserProfile } = await import('./db');
        await upsertUserProfile(userId, {
          fullName: personalInfo.fullName,
          dateOfBirth: personalInfo.dateOfBirth || undefined,
          ssnLast4: personalInfo.ssnLast4 || undefined,
          currentAddress: personalInfo.currentAddress.street,
          currentCity: personalInfo.currentAddress.city,
          currentState: personalInfo.currentAddress.state,
          currentZip: personalInfo.currentAddress.zip,
          // Save first previous address if available
          previousAddress: personalInfo.previousAddresses[0]?.street,
          previousCity: personalInfo.previousAddresses[0]?.city,
          previousState: personalInfo.previousAddresses[0]?.state,
          previousZip: personalInfo.previousAddresses[0]?.zip,
        });
        console.log(`[Parser] Saved personal info to user profile`);
      }
    } catch (error) {
      console.error('[Parser] Failed to extract personal info:', error);
    }

    // Save accounts to database
    const { createNegativeAccount, updateCreditReportParsedData } = await import('./db');
    
    for (const account of accounts) {
      await createNegativeAccount({
        userId,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        balance: account.balance.toString(),
        status: account.status,
        dateOpened: account.dateOpened?.toISOString() || null,
        lastActivity: account.lastActivity?.toISOString() || null,
        accountType: account.accountType,
        originalCreditor: account.originalCreditor || null,
      });
    }

    // Mark report as parsed (save only account summary, not full text)
    const parsedData = {
      accountCount: accounts.length,
      accounts: accounts.map(acc => ({
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
        balance: acc.balance,
        status: acc.status,
        accountType: acc.accountType,
      })),
      bureau: bureauMap[bureau],
      reportDate: new Date(),
      creditScore: personalInfo?.creditScore || null,
      scoreModel: personalInfo?.scoreModel || null,
    };
    await updateCreditReportParsedData(reportId, JSON.stringify(parsedData), personalInfo?.creditScore || null, personalInfo?.scoreModel || null);

    console.log(`Successfully parsed ${accounts.length} accounts from ${bureau} report`);
  } catch (error) {
    console.error('Error parsing credit report:', error);
    throw error;
  }
}


/**
 * Parse and save credit report for agency client
 */
export async function parseAndSaveAgencyClientReport(
  reportId: number,
  fileUrl: string,
  bureau: 'transunion' | 'equifax' | 'experian',
  clientId: number,
  agencyUserId: number
): Promise<void> {
  try {
    // Fetch file from URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Get file as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Map bureau name
    const bureauMap = {
      transunion: 'TransUnion' as const,
      equifax: 'Equifax' as const,
      experian: 'Experian' as const,
    };

    // Extract text from PDF
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
      console.log(`[Agency] Extracted ${text.length} characters from PDF`);
      
      // If extracted text is too short, use vision AI
      if (text.length < 1000) {
        console.log('[Agency] Text too short, using vision AI...');
        const accounts = await parseWithVisionAI(fileUrl, bureauMap[bureau]);
        console.log(`[Agency] Vision AI extracted ${accounts.length} negative accounts`);
        
        // Save accounts to database
        const { createAgencyClientAccount, updateAgencyClientReport } = await import('./db');
        for (const account of accounts) {
          await createAgencyClientAccount({
            agencyClientId: clientId,
            agencyUserId,
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            balance: account.balance.toString(),
            status: account.status,
            accountType: account.accountType,
            dateOpened: account.dateOpened?.toISOString() || null,
            lastActivity: account.lastActivity?.toISOString() || null,
            originalCreditor: account.originalCreditor || null,
            hasConflicts: false,
          });
        }
        
        // Update report as parsed
        await updateAgencyClientReport(reportId, agencyUserId, { isParsed: true });
        console.log(`[Agency] Successfully parsed ${accounts.length} accounts from ${bureau} report`);
        return;
      }
    } catch (error) {
      console.error('[Agency] PDF extraction failed, trying as plain text:', error);
      text = buffer.toString('utf-8');
    }

    // Parse the report using AI
    let accounts: ParsedAccount[];
    try {
      accounts = await parseWithAI(text, bureauMap[bureau]);
      console.log(`[Agency] AI extracted ${accounts.length} negative accounts`);
    } catch (error) {
      console.error('[Agency] AI parsing failed, using regex fallback:', error);
      const parsed = parseCreditReport(text, bureauMap[bureau]);
      accounts = parsed.accounts;
    }

    // Save accounts to database
    const { createAgencyClientAccount, updateAgencyClientReport } = await import('./db');
    
    for (const account of accounts) {
      await createAgencyClientAccount({
        agencyClientId: clientId,
        agencyUserId,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        balance: account.balance.toString(),
        status: account.status,
        dateOpened: account.dateOpened?.toISOString() || null,
        lastActivity: account.lastActivity?.toISOString() || null,
        accountType: account.accountType,
        originalCreditor: account.originalCreditor || null,
        hasConflicts: false,
      });
    }

    // Mark report as parsed
    await updateAgencyClientReport(reportId, agencyUserId, { 
      isParsed: true,
      parsedData: JSON.stringify({
        accountCount: accounts.length,
        accounts: accounts.map(acc => ({
          accountName: acc.accountName,
          accountNumber: acc.accountNumber,
          balance: acc.balance,
          status: acc.status,
          accountType: acc.accountType,
        })),
        bureau: bureauMap[bureau],
        reportDate: new Date(),
      }),
    });
    console.log(`[Agency] Successfully parsed ${accounts.length} accounts from ${bureau} report for client ${clientId}`);
  } catch (error) {
    console.error('[Agency] Error parsing credit report:', error);
    throw error;
  }
}
