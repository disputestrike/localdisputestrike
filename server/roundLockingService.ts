/**
 * Round Locking Service
 * 
 * Manages the 30-day lock between dispute rounds
 * - Starter: 2 rounds max
 * - Professional: 3 rounds max
 * - Complete: Unlimited rounds
 */

import { eq, and, desc } from 'drizzle-orm';
import { getMaxRounds, canStartRound, isRoundUnlocked, getDaysUntilUnlock } from './productsV2';

// Round lock duration in days
const ROUND_LOCK_DAYS = 30;

export interface RoundStatus {
  currentRound: number;
  maxRounds: number;
  isLocked: boolean;
  lockedUntil: Date | null;
  daysRemaining: number;
  canStartNextRound: boolean;
  roundHistory: RoundInfo[];
  nextRoundNumber: number;
}

export interface RoundInfo {
  roundNumber: number;
  status: string;
  startedAt: Date | null;
  mailedAt: Date | null;
  completedAt: Date | null;
  itemsDisputed: number;
  itemsDeleted: number;
  itemsVerified: number;
  responsesUploaded: boolean;
}

/**
 * Get the current round status for a user
 */
export async function getRoundStatus(
  db: any,
  userId: number,
  subscriptionTier: string
): Promise<RoundStatus> {
  // Get all rounds for user
  const rounds = await db.query.disputeRounds.findMany({
    where: eq(db.schema.disputeRounds.userId, userId),
    orderBy: desc(db.schema.disputeRounds.roundNumber),
  });

  const maxRounds = getMaxRounds(subscriptionTier);
  const currentRound = rounds.length > 0 ? rounds[0] : null;
  const currentRoundNumber = currentRound?.roundNumber || 0;
  const nextRoundNumber = currentRoundNumber + 1;

  // Determine if locked
  let isLocked = false;
  let lockedUntil: Date | null = null;
  let daysRemaining = 0;

  if (currentRound && currentRound.status === 'mailed') {
    // Check if 30 days have passed since mailing
    const mailedAt = new Date(currentRound.mailedAt);
    lockedUntil = new Date(mailedAt);
    lockedUntil.setDate(lockedUntil.getDate() + ROUND_LOCK_DAYS);

    const now = new Date();
    if (now < lockedUntil && !currentRound.unlockedEarly) {
      isLocked = true;
      daysRemaining = Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  // Check if user can start next round based on tier
  const canStartNextRound = !isLocked && canStartRound(subscriptionTier, nextRoundNumber);

  // Format round history
  const roundHistory: RoundInfo[] = rounds.map((round: any) => ({
    roundNumber: round.roundNumber,
    status: round.status,
    startedAt: round.startedAt,
    mailedAt: round.mailedAt,
    completedAt: round.completedAt,
    itemsDisputed: round.itemsDisputed,
    itemsDeleted: round.itemsDeleted,
    itemsVerified: round.itemsVerified,
    responsesUploaded: round.status === 'responses_uploaded' || round.unlockedEarly,
  }));

  return {
    currentRound: currentRoundNumber,
    maxRounds,
    isLocked,
    lockedUntil,
    daysRemaining,
    canStartNextRound,
    roundHistory,
    nextRoundNumber,
  };
}

/**
 * Start a new dispute round
 */
export async function startRound(
  db: any,
  userId: number,
  subscriptionTier: string
): Promise<{ success: boolean; roundId?: number; error?: string }> {
  // Get current status
  const status = await getRoundStatus(db, userId, subscriptionTier);

  // Check if user can start a new round
  if (status.isLocked) {
    return {
      success: false,
      error: `Round ${status.nextRoundNumber} is locked. Unlocks in ${status.daysRemaining} days.`,
    };
  }

  if (!status.canStartNextRound) {
    if (status.currentRound >= status.maxRounds) {
      return {
        success: false,
        error: `You've reached the maximum of ${status.maxRounds} rounds for your ${subscriptionTier} plan. Upgrade to continue.`,
      };
    }
    return {
      success: false,
      error: 'Cannot start a new round at this time.',
    };
  }

  // Create new round
  const [newRound] = await db.insert(db.schema.disputeRounds).values({
    userId,
    roundNumber: status.nextRoundNumber,
    status: 'active',
    startedAt: new Date(),
  }).returning();

  return {
    success: true,
    roundId: newRound.id,
  };
}

/**
 * Mark round as letters generated
 */
export async function markLettersGenerated(
  db: any,
  roundId: number,
  itemsDisputed: number
): Promise<void> {
  await db.update(db.schema.disputeRounds)
    .set({
      status: 'letters_generated',
      lettersGeneratedAt: new Date(),
      itemsDisputed,
    })
    .where(eq(db.schema.disputeRounds.id, roundId));
}

/**
 * Mark round as mailed (starts 30-day lock)
 */
export async function markRoundMailed(
  db: any,
  roundId: number
): Promise<{ lockedUntil: Date }> {
  const mailedAt = new Date();
  const lockedUntil = new Date(mailedAt);
  lockedUntil.setDate(lockedUntil.getDate() + ROUND_LOCK_DAYS);

  await db.update(db.schema.disputeRounds)
    .set({
      status: 'mailed',
      mailedAt,
      lockedUntil,
    })
    .where(eq(db.schema.disputeRounds.id, roundId));

  return { lockedUntil };
}

/**
 * Unlock round early (when responses are uploaded)
 */
export async function unlockRoundEarly(
  db: any,
  roundId: number
): Promise<void> {
  await db.update(db.schema.disputeRounds)
    .set({
      status: 'responses_uploaded',
      unlockedEarly: true,
    })
    .where(eq(db.schema.disputeRounds.id, roundId));
}

/**
 * Complete a round with results
 */
export async function completeRound(
  db: any,
  roundId: number,
  results: {
    itemsDeleted: number;
    itemsVerified: number;
    itemsUpdated: number;
    itemsNoResponse: number;
  }
): Promise<void> {
  await db.update(db.schema.disputeRounds)
    .set({
      status: 'complete',
      completedAt: new Date(),
      ...results,
    })
    .where(eq(db.schema.disputeRounds.id, roundId));
}

/**
 * Get countdown info for display
 */
export function getCountdownInfo(lockedUntil: Date | null): {
  days: number;
  hours: number;
  minutes: number;
  isUnlocked: boolean;
  unlockDate: string;
} {
  if (!lockedUntil) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isUnlocked: true,
      unlockDate: '',
    };
  }

  const now = new Date();
  const diff = lockedUntil.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isUnlocked: true,
      unlockDate: lockedUntil.toLocaleDateString(),
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    days,
    hours,
    minutes,
    isUnlocked: false,
    unlockDate: lockedUntil.toLocaleDateString(),
  };
}

/**
 * Check if user needs to upgrade to continue
 */
export function needsUpgrade(
  currentRound: number,
  subscriptionTier: string
): { needsUpgrade: boolean; suggestedTier: string | null } {
  const maxRounds = getMaxRounds(subscriptionTier);

  if (maxRounds === -1) {
    // Unlimited
    return { needsUpgrade: false, suggestedTier: null };
  }

  if (currentRound >= maxRounds) {
    // Suggest next tier
    if (subscriptionTier === 'starter') {
      return { needsUpgrade: true, suggestedTier: 'professional' };
    }
    if (subscriptionTier === 'professional') {
      return { needsUpgrade: true, suggestedTier: 'complete' };
    }
  }

  return { needsUpgrade: false, suggestedTier: null };
}
