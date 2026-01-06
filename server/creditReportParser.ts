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

export interface ParsedCreditReport {
  bureau: 'TransUnion' | 'Equifax' | 'Experian';
  accounts: ParsedAccount[];
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
  return result.text;
}

/**
 * Use Manus AI to intelligently extract negative accounts from credit report text
 */
export async function parseWithAI(text: string, bureau: 'TransUnion' | 'Equifax' | 'Experian'): Promise<ParsedAccount[]> {
  const systemPrompt = `You are an expert credit report analyst. Extract ONLY negative accounts (collections, charge-offs, late payments, bankruptcies, etc.) from credit reports.

For each negative account, extract:
- accountName: Creditor/collection agency name
- accountNumber: Account number
- balance: Current balance (as number)
- status: Status (e.g., "Collection", "Charge-off", "Late Payment")
- dateOpened: Date opened (MM/DD/YYYY)
- lastActivity: Last activity date (MM/DD/YYYY)
- accountType: Type (e.g., "Collection", "Credit Card", "Medical")
- originalCreditor: Original creditor if different

Return valid JSON array only.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract negative accounts from this ${bureau} credit report:\n\n${text}` },
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
                  required: ['accountName', 'accountNumber', 'balance', 'status', 'accountType'],
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

    // Extract text from PDF
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
      console.log(`Extracted ${text.length} characters from PDF`);
    } catch (error) {
      console.error('PDF extraction failed, trying as plain text:', error);
      text = buffer.toString('utf-8');
    }

    // Map bureau name
    const bureauMap = {
      transunion: 'TransUnion' as const,
      equifax: 'Equifax' as const,
      experian: 'Experian' as const,
    };

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
    };
    await updateCreditReportParsedData(reportId, JSON.stringify(parsedData));

    console.log(`Successfully parsed ${accounts.length} accounts from ${bureau} report`);
  } catch (error) {
    console.error('Error parsing credit report:', error);
    throw error;
  }
}
