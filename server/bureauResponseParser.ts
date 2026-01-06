/**
 * AI Parser for Bureau Response Letters
 * 
 * Extracts outcomes from bureau response letters:
 * - Which accounts were deleted
 * - Which accounts were verified
 * - Which accounts are still pending
 * - Score changes (if mentioned)
 */

import { invokeLLM } from "./_core/llm";

export interface ParsedBureauResponse {
  bureau: 'transunion' | 'equifax' | 'experian';
  responseDate: string;
  accounts: Array<{
    accountName: string;
    accountNumber?: string;
    outcome: 'deleted' | 'verified' | 'updated' | 'pending';
    details: string;
  }>;
  scoreChange?: {
    before: number;
    after: number;
    increase: number;
  };
  summary: string;
  nextSteps: string[];
}

/**
 * Parse bureau response letter using AI
 */
export async function parseBureauResponse(
  fileUrl: string,
  bureau: 'transunion' | 'equifax' | 'experian'
): Promise<ParsedBureauResponse> {
  // Build AI prompt for parsing
  const prompt = `You are analyzing a credit bureau response letter from ${bureau.toUpperCase()}.

Extract the following information from the letter:

1. **Response Date:** When the bureau sent this response
2. **Account Outcomes:** For each account mentioned, determine:
   - Account name/creditor
   - Account number (if visible)
   - Outcome: DELETED, VERIFIED, UPDATED, or PENDING
   - Details: What the bureau said about this account

3. **Score Changes:** If the letter mentions credit score changes:
   - Before score
   - After score
   - Point increase/decrease

4. **Summary:** Brief summary of the overall response
5. **Next Steps:** What the consumer should do next

Return the information in this JSON format:
{
  "bureau": "${bureau}",
  "responseDate": "MM/DD/YYYY",
  "accounts": [
    {
      "accountName": "PNC BANK",
      "accountNumber": "****1234",
      "outcome": "deleted",
      "details": "Account removed from credit report"
    }
  ],
  "scoreChange": {
    "before": 582,
    "after": 624,
    "increase": 42
  },
  "summary": "3 accounts deleted, 2 verified, 1 updated",
  "nextSteps": [
    "Celebrate deletions",
    "Send Round 2 letters for verified accounts"
  ]
}

IMPORTANT:
- Use "deleted" for accounts that were removed
- Use "verified" for accounts that bureau confirmed as accurate
- Use "updated" for accounts that had information corrected
- Use "pending" for accounts still under investigation
- If no score change mentioned, omit scoreChange field
- Be specific in details - quote the bureau's exact language`;

  try {
    // Call AI with the file URL
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at parsing credit bureau response letters. You extract structured data from bureau correspondence and identify account outcomes (deleted, verified, updated, pending).',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'file_url',
              file_url: {
                url: fileUrl,
                mime_type: 'application/pdf',
              },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'bureau_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              bureau: {
                type: 'string',
                enum: ['transunion', 'equifax', 'experian'],
              },
              responseDate: {
                type: 'string',
                description: 'Date in MM/DD/YYYY format',
              },
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    accountName: { type: 'string' },
                    accountNumber: { type: 'string' },
                    outcome: {
                      type: 'string',
                      enum: ['deleted', 'verified', 'updated', 'pending'],
                    },
                    details: { type: 'string' },
                  },
                  required: ['accountName', 'outcome', 'details'],
                  additionalProperties: false,
                },
              },
              scoreChange: {
                type: 'object',
                properties: {
                  before: { type: 'integer' },
                  after: { type: 'integer' },
                  increase: { type: 'integer' },
                },
                required: ['before', 'after', 'increase'],
                additionalProperties: false,
              },
              summary: { type: 'string' },
              nextSteps: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['bureau', 'responseDate', 'accounts', 'summary', 'nextSteps'],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('Failed to parse bureau response');
    }

    const parsed: ParsedBureauResponse = JSON.parse(rawContent);
    return parsed;
  } catch (error) {
    console.error('Error parsing bureau response:', error);
    throw new Error('Failed to parse bureau response letter');
  }
}

/**
 * Update account statuses based on parsed response
 * TODO: Implement updateNegativeAccountStatus in db.ts
 */
export async function updateAccountStatuses(
  userId: number,
  parsedResponse: ParsedBureauResponse
) {
  const { getNegativeAccountsByUserId } = await import('./db');
  
  // Get user's accounts
  const userAccounts = await getNegativeAccountsByUserId(userId);
  
  // Match parsed accounts to user's accounts
  const matchedAccounts = [];
  for (const parsedAccount of parsedResponse.accounts) {
    // Find matching account (fuzzy match by name)
    const matchingAccount = userAccounts.find(acc => 
      acc.accountName.toLowerCase().includes(parsedAccount.accountName.toLowerCase()) ||
      parsedAccount.accountName.toLowerCase().includes(acc.accountName.toLowerCase())
    );
    
    if (matchingAccount) {
      matchedAccounts.push({
        accountId: matchingAccount.id,
        accountName: matchingAccount.accountName,
        outcome: parsedAccount.outcome,
        details: parsedAccount.details,
      });
      
      console.log(`Matched account ${matchingAccount.accountName}: ${parsedAccount.outcome}`);
    }
  }
  
  return {
    accountsMatched: matchedAccounts.length,
    matchedAccounts,
    scoreChange: parsedResponse.scoreChange,
  };
}
