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
 * Extract text from PDF buffer
 * This is a placeholder - in production, use a PDF parsing library
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // TODO: Implement actual PDF parsing using pdf-parse or similar
  // For now, return a placeholder
  return buffer.toString('utf-8');
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
