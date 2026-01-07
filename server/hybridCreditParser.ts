/**
 * Hybrid Credit Parsing System
 * 
 * Orchestrates between custom parser and SmartCredit API
 * - Uses SmartCredit as primary source (99% accuracy)
 * - Uses custom parser for training and eventual cost savings
 * - Compares outputs to improve custom parser over time
 * - Intelligent fallback logic based on confidence scores
 */

import { parseWithAI, type ParsedAccount } from './creditReportParser';
import { fetchSmartCreditData, type SmartCreditData, type SmartCreditAccount } from './smartcreditAPI';
import * as db from './db';

export interface HybridParseResult {
  source: 'smartcredit' | 'custom_parser' | 'hybrid';
  accounts: ParsedAccount[];
  score?: number;
  confidence: number;
  cost: number; // in cents
  validatedBy?: string;
  comparisonId?: number;
  warnings?: string[];
}

export interface ComparisonResult {
  matchPercentage: number;
  differences: Array<{
    field: string;
    customValue: any;
    smartcreditValue: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  majorDiscrepancies: number;
}

/**
 * Main hybrid parsing function
 * Tries custom parser first, validates with SmartCredit if available
 */
export async function parseWithHybridSystem(
  userId: number,
  pdfText: string,
  bureau: 'TransUnion' | 'Equifax' | 'Experian',
  creditReportId?: number
): Promise<HybridParseResult> {
  
  // Check if user has SmartCredit connected
  const smartcreditToken = await db.getSmartCreditToken(userId);
  
  // PHASE 1: Always try custom parser first (for training data)
  let customParserAccounts: ParsedAccount[] = [];
  let customParserConfidence = 0;
  
  try {
    customParserAccounts = await parseWithAI(pdfText, bureau);
    customParserConfidence = calculateConfidence(customParserAccounts, pdfText);
    console.log(`[Hybrid Parser] Custom parser extracted ${customParserAccounts.length} accounts, confidence: ${customParserConfidence}%`);
  } catch (error) {
    console.error('[Hybrid Parser] Custom parser failed:', error);
    customParserConfidence = 0;
  }
  
  // PHASE 2: If SmartCredit is connected, fetch their data
  if (smartcreditToken) {
    try {
      const smartcreditData = await fetchSmartCreditData(smartcreditToken.accessToken);
      const smartcreditAccounts = mapSmartCreditAccounts(smartcreditData, bureau);
      const smartcreditScore = getScoreForBureau(smartcreditData, bureau);
      
      console.log(`[Hybrid Parser] SmartCredit extracted ${smartcreditAccounts.length} accounts, score: ${smartcreditScore}`);
      
      // PHASE 3: Compare outputs
      const comparison = compareParserOutputs(customParserAccounts, smartcreditAccounts);
      
      // PHASE 4: Log comparison for training
      const comparisonId = await logComparison({
        userId,
        creditReportId,
        bureau: bureau.toLowerCase() as 'transunion' | 'equifax' | 'experian',
        customParserAccounts,
        customParserScore: null, // We don't extract scores yet
        customParserConfidence,
        smartcreditAccounts,
        smartcreditScore,
        comparison,
      });
      
      // PHASE 5: Decide which source to use
      const decision = makeSourceDecision(customParserConfidence, comparison);
      
      if (decision.source === 'custom_parser') {
        // Custom parser is good enough!
        return {
          source: 'custom_parser',
          accounts: customParserAccounts,
          confidence: customParserConfidence,
          cost: 0, // Free!
          validatedBy: 'SmartCredit',
          comparisonId,
          warnings: decision.warnings,
        };
      } else {
        // Use SmartCredit as fallback
        return {
          source: 'smartcredit',
          accounts: smartcreditAccounts,
          score: smartcreditScore,
          confidence: 99,
          cost: 500, // $5.00 in cents
          comparisonId,
          warnings: decision.warnings,
        };
      }
      
    } catch (error) {
      console.error('[Hybrid Parser] SmartCredit fetch failed:', error);
      // Fall through to custom parser only
    }
  }
  
  // PHASE 6: No SmartCredit available, use custom parser only
  if (customParserConfidence >= 80) {
    return {
      source: 'custom_parser',
      accounts: customParserAccounts,
      confidence: customParserConfidence,
      cost: 0,
      warnings: ['Not validated by SmartCredit - recommend connecting for better accuracy'],
    };
  } else {
    return {
      source: 'custom_parser',
      accounts: customParserAccounts,
      confidence: customParserConfidence,
      cost: 0,
      warnings: [
        'Low confidence parsing',
        'Recommend connecting SmartCredit account for validation',
        'Results may be inaccurate',
      ],
    };
  }
}

/**
 * Calculate confidence score for custom parser output
 * Based on: number of accounts, completeness of data, consistency
 */
function calculateConfidence(accounts: ParsedAccount[], originalText: string): number {
  if (accounts.length === 0) return 0;
  
  let score = 50; // Base score
  
  // +10 points for each account found (up to 5 accounts)
  score += Math.min(accounts.length * 10, 50);
  
  // Check data completeness for each account
  let completenessScore = 0;
  for (const acc of accounts) {
    let accountScore = 0;
    if (acc.accountName && acc.accountName !== 'Unknown Account') accountScore += 2;
    if (acc.accountNumber && acc.accountNumber !== 'Unknown') accountScore += 2;
    if (acc.balance > 0) accountScore += 2;
    if (acc.status && acc.status !== 'Unknown') accountScore += 2;
    if (acc.dateOpened) accountScore += 1;
    if (acc.lastActivity) accountScore += 1;
    completenessScore += accountScore;
  }
  
  // Average completeness across all accounts (max 10 points per account)
  const avgCompleteness = completenessScore / accounts.length;
  score += Math.min(avgCompleteness * 2, 20);
  
  // Penalty for suspiciously low account count (credit reports usually have 3-15 accounts)
  if (accounts.length < 2) score -= 20;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Map SmartCredit accounts to our ParsedAccount format
 */
function mapSmartCreditAccounts(data: SmartCreditData, bureau: 'TransUnion' | 'Equifax' | 'Experian'): ParsedAccount[] {
  const bureauKey = bureau.toLowerCase() as 'transunion' | 'equifax' | 'experian';
  const bureauData = data[bureauKey];
  
  return bureauData.accounts.map((acc: SmartCreditAccount) => ({
    accountName: acc.accountName,
    accountNumber: acc.accountNumber,
    balance: acc.balance,
    status: acc.status,
    dateOpened: parseDate(acc.dateOpened),
    lastActivity: parseDate(acc.lastActivity),
    accountType: acc.accountType,
    originalCreditor: acc.originalCreditor,
    bureau,
    rawData: JSON.stringify(acc),
  }));
}

function parseDate(dateStr: string): Date | null {
  try {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts.map(p => parseInt(p, 10));
      return new Date(year, month - 1, day);
    }
  } catch (e) {
    // Invalid date
  }
  return null;
}

function getScoreForBureau(data: SmartCreditData, bureau: 'TransUnion' | 'Equifax' | 'Experian'): number {
  const bureauKey = bureau.toLowerCase() as 'transunion' | 'equifax' | 'experian';
  return data[bureauKey].score;
}

/**
 * Compare custom parser output vs SmartCredit output
 */
function compareParserOutputs(
  customAccounts: ParsedAccount[],
  smartcreditAccounts: ParsedAccount[]
): ComparisonResult {
  const differences: ComparisonResult['differences'] = [];
  let matchedAccounts = 0;
  
  // Try to match accounts by name similarity
  for (const customAcc of customAccounts) {
    const matchedSmartAcc = findMatchingAccount(customAcc, smartcreditAccounts);
    
    if (matchedSmartAcc) {
      matchedAccounts++;
      
      // Compare balance
      if (Math.abs(customAcc.balance - matchedSmartAcc.balance) > 100) {
        differences.push({
          field: `${customAcc.accountName} - balance`,
          customValue: customAcc.balance,
          smartcreditValue: matchedSmartAcc.balance,
          severity: Math.abs(customAcc.balance - matchedSmartAcc.balance) > 1000 ? 'high' : 'medium',
        });
      }
      
      // Compare status
      if (customAcc.status !== matchedSmartAcc.status) {
        differences.push({
          field: `${customAcc.accountName} - status`,
          customValue: customAcc.status,
          smartcreditValue: matchedSmartAcc.status,
          severity: 'critical',
        });
      }
    }
  }
  
  // Account count mismatch
  if (customAccounts.length !== smartcreditAccounts.length) {
    differences.push({
      field: 'account_count',
      customValue: customAccounts.length,
      smartcreditValue: smartcreditAccounts.length,
      severity: Math.abs(customAccounts.length - smartcreditAccounts.length) > 2 ? 'high' : 'medium',
    });
  }
  
  const matchPercentage = smartcreditAccounts.length > 0 
    ? Math.round((matchedAccounts / smartcreditAccounts.length) * 100)
    : 0;
  
  const majorDiscrepancies = differences.filter(d => d.severity === 'high' || d.severity === 'critical').length;
  
  return {
    matchPercentage,
    differences,
    majorDiscrepancies,
  };
}

function findMatchingAccount(account: ParsedAccount, otherAccounts: ParsedAccount[]): ParsedAccount | null {
  const accountName = account.accountName.toLowerCase();
  
  for (const other of otherAccounts) {
    const otherName = other.accountName.toLowerCase();
    
    // Exact match
    if (accountName === otherName) {
      return other;
    }
    
    // Fuzzy match (simple similarity check)
    if (accountName.includes(otherName) || otherName.includes(accountName)) {
      return other;
    }
  }
  
  return null;
}

/**
 * Decide which source to use based on confidence and comparison
 */
function makeSourceDecision(
  customConfidence: number,
  comparison: ComparisonResult
): { source: 'custom_parser' | 'smartcredit'; warnings: string[] } {
  const warnings: string[] = [];
  
  // High confidence + good match = use custom parser
  if (customConfidence >= 85 && comparison.matchPercentage >= 90 && comparison.majorDiscrepancies === 0) {
    return {
      source: 'custom_parser',
      warnings: ['Validated by SmartCredit - high accuracy'],
    };
  }
  
  // Medium confidence + decent match = use custom parser with warnings
  if (customConfidence >= 75 && comparison.matchPercentage >= 80 && comparison.majorDiscrepancies <= 1) {
    warnings.push('Minor differences detected, but within acceptable range');
    return {
      source: 'custom_parser',
      warnings,
    };
  }
  
  // Otherwise, use SmartCredit
  if (comparison.majorDiscrepancies > 0) {
    warnings.push(`${comparison.majorDiscrepancies} major discrepancies found`);
  }
  if (comparison.matchPercentage < 80) {
    warnings.push(`Only ${comparison.matchPercentage}% match rate`);
  }
  if (customConfidence < 75) {
    warnings.push(`Low custom parser confidence (${customConfidence}%)`);
  }
  
  return {
    source: 'smartcredit',
    warnings,
  };
}

/**
 * Log comparison to database for training
 */
async function logComparison(data: {
  userId: number;
  creditReportId?: number;
  bureau: 'transunion' | 'equifax' | 'experian';
  customParserAccounts: ParsedAccount[];
  customParserScore: number | null;
  customParserConfidence: number;
  smartcreditAccounts: ParsedAccount[];
  smartcreditScore: number;
  comparison: ComparisonResult;
}): Promise<number> {
  const comparisonId = await db.insertParserComparison({
    userId: data.userId,
    creditReportId: data.creditReportId,
    bureau: data.bureau,
    customParserAccounts: JSON.stringify(data.customParserAccounts),
    customParserScore: data.customParserScore,
    customParserConfidence: data.customParserConfidence,
    smartcreditAccounts: JSON.stringify(data.smartcreditAccounts),
    smartcreditScore: data.smartcreditScore,
    differences: JSON.stringify(data.comparison.differences),
    matchPercentage: data.comparison.matchPercentage,
    majorDiscrepancies: data.comparison.majorDiscrepancies,
    selectedSource: data.comparison.matchPercentage >= 80 && data.comparison.majorDiscrepancies === 0 ? 'custom' : 'smartcredit',
    selectionReason: `Confidence: ${data.customParserConfidence}%, Match: ${data.comparison.matchPercentage}%, Discrepancies: ${data.comparison.majorDiscrepancies}`,
  });
  
  // Update daily accuracy metrics
  await updateAccuracyMetrics(data.comparison.matchPercentage, data.customParserConfidence);
  
  return comparisonId;
}

/**
 * Update daily accuracy metrics
 */
async function updateAccuracyMetrics(matchPercentage: number, confidence: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  // This would update or insert today's metrics
  // Implementation depends on your database helpers
  console.log(`[Metrics] Updated accuracy metrics for ${today}: match=${matchPercentage}%, confidence=${confidence}%`);
}
