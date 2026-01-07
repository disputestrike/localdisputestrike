/**
 * SmartCredit API Integration
 * 
 * Provides OAuth flow and credit data fetching from SmartCredit
 * 
 * NOTE: This is a MOCK implementation until we get real SmartCredit API credentials.
 * Replace with actual API calls once credentials are obtained.
 */

export interface SmartCreditAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  balance: number;
  status: string;
  dateOpened: string;
  lastActivity: string;
  accountType: string;
  originalCreditor?: string;
  paymentHistory?: string; // e.g., "NNNNNN111122" (N=on time, 1=30 days late, etc.)
  highBalance?: number;
  creditLimit?: number;
  remarks?: string;
}

export interface SmartCreditData {
  userId: string;
  transunion: {
    score: number;
    accounts: SmartCreditAccount[];
    inquiries: any[];
    publicRecords: any[];
  };
  equifax: {
    score: number;
    accounts: SmartCreditAccount[];
    inquiries: any[];
    publicRecords: any[];
  };
  experian: {
    score: number;
    accounts: SmartCreditAccount[];
    inquiries: any[];
    publicRecords: any[];
  };
  conflicts: Array<{
    accountName: string;
    field: string;
    transunionValue: any;
    equifaxValue: any;
    experianValue: any;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  }>;
  lastUpdated: string;
}

/**
 * SmartCredit OAuth Configuration
 * TODO: Replace with real credentials from SmartCredit
 */
const SMARTCREDIT_CONFIG = {
  clientId: process.env.SMARTCREDIT_CLIENT_ID || 'MOCK_CLIENT_ID',
  clientSecret: process.env.SMARTCREDIT_CLIENT_SECRET || 'MOCK_CLIENT_SECRET',
  apiUrl: process.env.SMARTCREDIT_API_URL || 'https://api.smartcredit.com',
  oauthUrl: process.env.SMARTCREDIT_OAUTH_URL || 'https://smartcredit.com/oauth',
  redirectUri: process.env.SMARTCREDIT_REDIRECT_URI || 'http://localhost:3000/smartcredit-callback',
};

/**
 * Generate SmartCredit OAuth authorization URL
 */
export function getSmartCreditAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: SMARTCREDIT_CONFIG.clientId,
    redirect_uri: SMARTCREDIT_CONFIG.redirectUri,
    response_type: 'code',
    scope: 'credit_data',
    ...(state && { state }),
  });

  return `${SMARTCREDIT_CONFIG.oauthUrl}/authorize?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  smartcreditUserId: string;
}> {
  // TODO: Replace with real API call
  // const response = await fetch(`${SMARTCREDIT_CONFIG.apiUrl}/oauth/token`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     client_id: SMARTCREDIT_CONFIG.clientId,
  //     client_secret: SMARTCREDIT_CONFIG.clientSecret,
  //     code,
  //     grant_type: 'authorization_code',
  //     redirect_uri: SMARTCREDIT_CONFIG.redirectUri,
  //   }),
  // });
  // const data = await response.json();
  
  // MOCK response for development
  return {
    accessToken: `mock_access_token_${code}`,
    refreshToken: `mock_refresh_token_${code}`,
    expiresIn: 3600,
    smartcreditUserId: `mock_user_${Math.random().toString(36).substring(7)}`,
  };
}

/**
 * Refresh expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  // TODO: Replace with real API call
  // const response = await fetch(`${SMARTCREDIT_CONFIG.apiUrl}/oauth/token`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     client_id: SMARTCREDIT_CONFIG.clientId,
  //     client_secret: SMARTCREDIT_CONFIG.clientSecret,
  //     refresh_token: refreshToken,
  //     grant_type: 'refresh_token',
  //   }),
  // });
  // const data = await response.json();
  
  // MOCK response
  return {
    accessToken: `mock_refreshed_token_${Date.now()}`,
    expiresIn: 3600,
  };
}

/**
 * Fetch credit data from SmartCredit API
 */
export async function fetchSmartCreditData(accessToken: string): Promise<SmartCreditData> {
  // TODO: Replace with real API call
  // const response = await fetch(`${SMARTCREDIT_CONFIG.apiUrl}/v1/credit-profile`, {
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'X-API-Key': SMARTCREDIT_CONFIG.clientId,
  //   },
  // });
  // const data = await response.json();
  // return data;
  
  // MOCK response with realistic data
  return generateMockSmartCreditData();
}

/**
 * Generate mock SmartCredit data for development/testing
 * This simulates what the real API would return
 */
function generateMockSmartCreditData(): SmartCreditData {
  const mockAccounts: SmartCreditAccount[] = [
    {
      id: 'acc_1',
      accountName: 'CREDIT UNION OF TEXAS',
      accountNumber: '****1234',
      balance: 5432,
      status: 'Charge-off',
      dateOpened: '01/15/2019',
      lastActivity: '06/20/2022',
      accountType: 'Revolving',
      originalCreditor: 'CREDIT UNION OF TEXAS',
      paymentHistory: 'NNNNNN111122333',
      highBalance: 6000,
      creditLimit: 6000,
      remarks: 'Charged off account',
    },
    {
      id: 'acc_2',
      accountName: 'PNC BANK',
      accountNumber: '****5678',
      balance: 3200,
      status: 'Collection',
      dateOpened: '03/10/2020',
      lastActivity: '08/15/2023',
      accountType: 'Installment',
      originalCreditor: 'PNC BANK',
      paymentHistory: 'NNNNNN222233',
      highBalance: 5000,
      remarks: 'Account in collections',
    },
    {
      id: 'acc_3',
      accountName: 'FORD MOTOR CREDIT CO',
      accountNumber: '****9012',
      balance: 12500,
      status: 'Late Payment',
      dateOpened: '06/01/2021',
      lastActivity: '12/01/2025',
      accountType: 'Installment',
      originalCreditor: 'FORD MOTOR CREDIT CO',
      paymentHistory: 'NNNNNN11',
      highBalance: 25000,
      creditLimit: 25000,
      remarks: '30 days past due',
    },
  ];

  // Simulate cross-bureau conflicts
  const conflicts = [
    {
      accountName: 'CREDIT UNION OF TEXAS',
      field: 'balance',
      transunionValue: 5432,
      equifaxValue: 5234, // Different balance
      experianValue: 5432,
      severity: 'HIGH' as const,
    },
    {
      accountName: 'PNC BANK',
      field: 'status',
      transunionValue: 'Collection',
      equifaxValue: 'Paid', // Critical conflict
      experianValue: 'Collection',
      severity: 'CRITICAL' as const,
    },
  ];

  return {
    userId: 'mock_smartcredit_user',
    transunion: {
      score: 582,
      accounts: mockAccounts,
      inquiries: [],
      publicRecords: [],
    },
    equifax: {
      score: 624, // +42 from TransUnion (matches real user data)
      accounts: mockAccounts.map(acc => ({
        ...acc,
        // Simulate some differences
        balance: acc.accountName === 'CREDIT UNION OF TEXAS' ? 5234 : acc.balance,
        status: acc.accountName === 'PNC BANK' ? 'Paid' : acc.status,
      })),
      inquiries: [],
      publicRecords: [],
    },
    experian: {
      score: 605,
      accounts: mockAccounts,
      inquiries: [],
      publicRecords: [],
    },
    conflicts,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Estimate cost of SmartCredit API call
 * Based on typical pricing: $2-5 per user per month
 */
export function estimateSmartCreditCost(apiCalls: number): number {
  const COST_PER_CALL = 0.05; // $0.05 per API call (rough estimate)
  return Math.round(apiCalls * COST_PER_CALL * 100); // Return in cents
}
