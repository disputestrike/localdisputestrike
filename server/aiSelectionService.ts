/**
 * AI Auto-Selection Service
 * 
 * Automatically selects the best items to dispute based on:
 * - Cross-bureau conflicts (different amounts, dates, statuses)
 * - Age of debt (>7 years = must delete)
 * - Account type (medical collections have weak documentation)
 * - Balance inconsistencies
 * - Missing required information
 * - Previous dispute outcomes
 */

import { eq, and, not, inArray } from 'drizzle-orm';\nimport { safeJsonParse } from './utils/json';

// Maximum items to select per round
const MAX_ITEMS_PER_ROUND = 5;

// Win probability thresholds
const HIGH_PROBABILITY = 75;
const MEDIUM_PROBABILITY = 50;
const LOW_PROBABILITY = 25;

export interface NegativeAccount {
  id: number;
  userId: number;
  accountName: string;
  accountNumber?: string;
  accountType: string;
  balance: number;
  originalBalance?: number;
  status: string;
  dateOpened?: Date;
  dateReported?: Date;
  lastActivity?: Date;
  bureau: string;
  
  // Cross-bureau data
  transunionBalance?: number;
  equifaxBalance?: number;
  experianBalance?: number;
  transunionStatus?: string;
  equifaxStatus?: string;
  experianStatus?: string;
  transunionDateOpened?: string;
  equifaxDateOpened?: string;
  experianDateOpened?: string;
}

export interface AIRecommendation {
  accountId: number;
  isRecommended: boolean;
  priority: number;
  winProbability: number;
  recommendationReason: string;
  factors: string[];
  methodsTriggered: number[];
}

/**
 * Detection methods for identifying disputable items
 */
const DETECTION_METHODS = {
  1: { name: 'Balance Conflict', description: 'Different balances reported across bureaus' },
  2: { name: 'Date Conflict', description: 'Conflicting dates across bureaus' },
  3: { name: 'Status Conflict', description: 'Different account statuses across bureaus' },
  4: { name: 'Age Violation', description: 'Account older than 7 years (FCRA violation)' },
  5: { name: 'Medical Collection', description: 'Medical debt with typically weak documentation' },
  6: { name: 'Missing Info', description: 'Required information missing from report' },
  7: { name: 'Single Bureau', description: 'Only appears on one bureau (easier to dispute)' },
  8: { name: 'Sold Debt', description: 'Debt sold to collector (chain of custody issues)' },
  9: { name: 'Re-aged Account', description: 'Account appears to have been re-aged' },
  10: { name: 'Duplicate Entry', description: 'Same debt reported multiple times' },
};

/**
 * Analyze a single account for dispute potential
 */
function analyzeAccount(account: NegativeAccount): {
  winProbability: number;
  factors: string[];
  methodsTriggered: number[];
  reason: string;
} {
  const factors: string[] = [];
  const methodsTriggered: number[] = [];
  let probability = 30; // Base probability

  // Method 1: Balance Conflict
  const balances = [
    account.transunionBalance,
    account.equifaxBalance,
    account.experianBalance,
  ].filter(b => b !== undefined && b !== null);

  if (balances.length > 1) {
    const uniqueBalances = new Set(balances);
    if (uniqueBalances.size > 1) {
      probability += 20;
      factors.push(`Balance varies: ${balances.map(b => `$${b?.toLocaleString()}`).join(' vs ')}`);
      methodsTriggered.push(1);
    }
  }

  // Method 2: Date Conflict
  const dates = [
    account.transunionDateOpened,
    account.equifaxDateOpened,
    account.experianDateOpened,
  ].filter(d => d !== undefined && d !== null);

  if (dates.length > 1) {
    const uniqueDates = new Set(dates);
    if (uniqueDates.size > 1) {
      probability += 15;
      factors.push('Conflicting open dates across bureaus');
      methodsTriggered.push(2);
    }
  }

  // Method 3: Status Conflict
  const statuses = [
    account.transunionStatus,
    account.equifaxStatus,
    account.experianStatus,
  ].filter(s => s !== undefined && s !== null);

  if (statuses.length > 1) {
    const uniqueStatuses = new Set(statuses.map(s => s?.toLowerCase()));
    if (uniqueStatuses.size > 1) {
      probability += 15;
      factors.push('Different statuses reported across bureaus');
      methodsTriggered.push(3);
    }
  }

  // Method 4: Age Violation (>7 years)
  if (account.dateOpened || account.lastActivity) {
    const relevantDate = account.lastActivity || account.dateOpened;
    if (relevantDate) {
      const ageInYears = (Date.now() - new Date(relevantDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (ageInYears > 7) {
        probability += 35;
        factors.push(`Account is ${ageInYears.toFixed(1)} years old (exceeds 7-year limit)`);
        methodsTriggered.push(4);
      } else if (ageInYears > 6) {
        probability += 15;
        factors.push(`Account is ${ageInYears.toFixed(1)} years old (approaching 7-year limit)`);
      }
    }
  }

  // Method 5: Medical Collection
  if (
    account.accountType?.toLowerCase().includes('medical') ||
    account.accountName?.toLowerCase().includes('medical') ||
    account.accountName?.toLowerCase().includes('hospital') ||
    account.accountName?.toLowerCase().includes('healthcare')
  ) {
    probability += 20;
    factors.push('Medical debt typically has weak documentation');
    methodsTriggered.push(5);
  }

  // Method 6: Missing Info
  if (!account.accountNumber || account.accountNumber.length < 4) {
    probability += 10;
    factors.push('Account number missing or incomplete');
    methodsTriggered.push(6);
  }

  if (!account.originalBalance && account.accountType?.toLowerCase().includes('collection')) {
    probability += 10;
    factors.push('Original balance not reported');
    methodsTriggered.push(6);
  }

  // Method 7: Single Bureau
  const bureauCount = [
    account.transunionBalance !== undefined,
    account.equifaxBalance !== undefined,
    account.experianBalance !== undefined,
  ].filter(Boolean).length;

  if (bureauCount === 1) {
    probability += 15;
    factors.push(`Only appears on ${account.bureau} (not cross-reported)`);
    methodsTriggered.push(7);
  }

  // Method 8: Sold Debt
  if (
    account.accountType?.toLowerCase().includes('collection') ||
    account.accountName?.toLowerCase().includes('portfolio') ||
    account.accountName?.toLowerCase().includes('midland') ||
    account.accountName?.toLowerCase().includes('cavalry') ||
    account.accountName?.toLowerCase().includes('lvnv')
  ) {
    probability += 15;
    factors.push('Debt collector - chain of custody often incomplete');
    methodsTriggered.push(8);
  }

  // Cap probability at 95%
  probability = Math.min(95, probability);

  // Generate reason summary
  let reason = '';
  if (methodsTriggered.length === 0) {
    reason = 'Standard dispute - no specific violations detected';
  } else if (methodsTriggered.includes(4)) {
    reason = 'FCRA violation - account exceeds 7-year reporting limit';
  } else if (methodsTriggered.includes(1) || methodsTriggered.includes(2) || methodsTriggered.includes(3)) {
    reason = 'Cross-bureau conflicts detected - strong case for deletion';
  } else if (methodsTriggered.includes(5)) {
    reason = 'Medical collection - typically weak documentation';
  } else {
    reason = factors[0] || 'Multiple factors suggest good dispute potential';
  }

  return {
    winProbability: probability,
    factors,
    methodsTriggered,
    reason,
  };
}

/**
 * Select the best items to dispute for a round
 */
export async function selectItemsForRound(
  db: any,
  userId: number,
  roundNumber: number,
  previouslyDisputedIds: number[] = []
): Promise<AIRecommendation[]> {
  // Get all negative accounts for user
  const accounts = await db.query.negativeAccounts.findMany({
    where: and(
      eq(db.schema.negativeAccounts.userId, userId),
      not(inArray(db.schema.negativeAccounts.id, previouslyDisputedIds.length > 0 ? previouslyDisputedIds : [0]))
    ),
  });

  if (accounts.length === 0) {
    return [];
  }

  // Analyze each account
  const analyzed = accounts.map((account: NegativeAccount) => {
    const analysis = analyzeAccount(account);
    return {
      accountId: account.id,
      ...analysis,
    };
  });

  // Sort by win probability (highest first)
  analyzed.sort((a: any, b: any) => b.winProbability - a.winProbability);

  // Select top items (max 5 per round)
  const selected = analyzed.slice(0, MAX_ITEMS_PER_ROUND);

  // Create recommendations
  const recommendations: AIRecommendation[] = analyzed.map((item: any, index: number) => ({
    accountId: item.accountId,
    isRecommended: index < MAX_ITEMS_PER_ROUND,
    priority: index < MAX_ITEMS_PER_ROUND ? index + 1 : 0,
    winProbability: item.winProbability,
    recommendationReason: item.reason,
    factors: item.factors,
    methodsTriggered: item.methodsTriggered,
  }));

  return recommendations;
}

/**
 * Save AI recommendations to database
 */
export async function saveRecommendations(
  db: any,
  userId: number,
  roundId: number,
  recommendations: AIRecommendation[]
): Promise<void> {
  // Delete existing recommendations for this round
  await db.delete(db.schema.aiRecommendations)
    .where(and(
      eq(db.schema.aiRecommendations.userId, userId),
      eq(db.schema.aiRecommendations.roundId, roundId)
    ));

  // Insert new recommendations
  if (recommendations.length > 0) {
    await db.insert(db.schema.aiRecommendations).values(
      recommendations.map(rec => ({
        userId,
        negativeAccountId: rec.accountId,
        roundId,
        isRecommended: rec.isRecommended,
        priority: rec.priority,
        winProbability: rec.winProbability,
        recommendationReason: rec.recommendationReason,
        factors: JSON.stringify(rec.factors),
        methodsTriggered: JSON.stringify(rec.methodsTriggered),
      }))
    );
  }
}

/**
 * Get recommendations for a user's current round
 */
export async function getRecommendations(
  db: any,
  userId: number,
  roundId?: number
): Promise<AIRecommendation[]> {
  const whereClause = roundId
    ? and(eq(db.schema.aiRecommendations.userId, userId), eq(db.schema.aiRecommendations.roundId, roundId))
    : eq(db.schema.aiRecommendations.userId, userId);

  const recommendations = await db.query.aiRecommendations.findMany({
    where: whereClause,
    orderBy: (rec: any, { asc }: any) => [asc(rec.priority)],
  });

  return recommendations.map((rec: any) => ({
    accountId: rec.negativeAccountId,
    isRecommended: rec.isRecommended,
    priority: rec.priority,
    winProbability: rec.winProbability,
    recommendationReason: rec.recommendationReason,
    factors: safeJsonParse(rec.factors, []),
    methodsTriggered: safeJsonParse(rec.methodsTriggered, []),
  }));
}

/**
 * Get detection method info
 */
export function getDetectionMethodInfo(methodId: number): { name: string; description: string } | undefined {
  return DETECTION_METHODS[methodId as keyof typeof DETECTION_METHODS];
}

/**
 * Calculate estimated score increase
 */
export function estimateScoreIncrease(recommendations: AIRecommendation[]): number {
  // Rough estimate: each deleted item = 10-30 points
  // Weight by win probability
  const recommendedItems = recommendations.filter(r => r.isRecommended);
  
  let totalIncrease = 0;
  for (const item of recommendedItems) {
    const expectedDeletion = item.winProbability / 100;
    const pointsPerItem = 15; // Average
    totalIncrease += expectedDeletion * pointsPerItem;
  }

  return Math.round(totalIncrease);
}

/**
 * Calculate estimated interest savings
 */
export function estimateInterestSavings(currentScore: number, estimatedIncrease: number): number {
  // Rough estimate based on score improvement
  // Higher scores = lower interest rates = savings
  const newScore = currentScore + estimatedIncrease;
  
  // Assume $30k in debt (average)
  const debtAmount = 30000;
  
  // Interest rate reduction estimate
  let currentRate = 0;
  let newRate = 0;

  // Current rate based on score
  if (currentScore < 580) currentRate = 0.24;
  else if (currentScore < 670) currentRate = 0.18;
  else if (currentScore < 740) currentRate = 0.12;
  else currentRate = 0.08;

  // New rate based on improved score
  if (newScore < 580) newRate = 0.24;
  else if (newScore < 670) newRate = 0.18;
  else if (newScore < 740) newRate = 0.12;
  else newRate = 0.08;

  const annualSavings = debtAmount * (currentRate - newRate);
  return Math.round(Math.max(0, annualSavings));
}
