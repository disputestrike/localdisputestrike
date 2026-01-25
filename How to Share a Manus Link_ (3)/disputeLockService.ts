/**
 * disputeLockService.ts - 30-Day Dispute Lock System
 * 
 * Prevents users from spamming credit bureaus with disputes.
 * Enforces 30-day wait period after sending a letter.
 * Maximum 3 dispute rounds per account.
 */

import { db } from './db';
import { disputeLetters } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface LockStatus {
  isLocked: boolean;
  daysRemaining: number;
  unlockDate: Date | null;
  roundNumber: number;
  maxRounds: number;
  canDispute: boolean;
  reason?: string;
}

const LOCK_PERIOD_DAYS = 30;
const MAX_ROUNDS_PER_ACCOUNT = 3;

export async function getAccountLockStatus(
  userId: number,
  accountId: number
): Promise<LockStatus> {
  try {
    const recentLetters = await db
      .select()
      .from(disputeLetters)
      .where(
        and(
          eq(disputeLetters.userId, userId),
          eq(disputeLetters.accountId, accountId),
          eq(disputeLetters.status, 'sent')
        )
      )
      .orderBy(desc(disputeLetters.mailedAt))
      .limit(1);

    const lastLetter = recentLetters[0];
    
    const allLetters = await db
      .select()
      .from(disputeLetters)
      .where(
        and(
          eq(disputeLetters.userId, userId),
          eq(disputeLetters.accountId, accountId),
          eq(disputeLetters.status, 'sent')
        )
      );

    const roundNumber = allLetters.length;

    if (roundNumber >= MAX_ROUNDS_PER_ACCOUNT) {
      return {
        isLocked: true,
        daysRemaining: 0,
        unlockDate: null,
        roundNumber,
        maxRounds: MAX_ROUNDS_PER_ACCOUNT,
        canDispute: false,
        reason: `Maximum ${MAX_ROUNDS_PER_ACCOUNT} dispute rounds reached`,
      };
    }

    if (!lastLetter || !lastLetter.mailedAt) {
      return {
        isLocked: false,
        daysRemaining: 0,
        unlockDate: null,
        roundNumber,
        maxRounds: MAX_ROUNDS_PER_ACCOUNT,
        canDispute: true,
      };
    }

    const mailedDate = new Date(lastLetter.mailedAt);
    const unlockDate = new Date(mailedDate);
    unlockDate.setDate(unlockDate.getDate() + LOCK_PERIOD_DAYS);

    const now = new Date();
    const isLocked = now < unlockDate;
    const daysRemaining = isLocked
      ? Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      isLocked,
      daysRemaining,
      unlockDate: isLocked ? unlockDate : null,
      roundNumber,
      maxRounds: MAX_ROUNDS_PER_ACCOUNT,
      canDispute: !isLocked && roundNumber < MAX_ROUNDS_PER_ACCOUNT,
      reason: isLocked
        ? `Account locked for ${daysRemaining} more days`
        : undefined,
    };
  } catch (error) {
    console.error('Error checking account lock status:', error);
    return {
      isLocked: false,
      daysRemaining: 0,
      unlockDate: null,
      roundNumber: 0,
      maxRounds: MAX_ROUNDS_PER_ACCOUNT,
      canDispute: true,
    };
  }
}

export async function canSendDispute(
  userId: number,
  accountId: number
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getAccountLockStatus(userId, accountId);
  
  if (!status.canDispute) {
    return {
      allowed: false,
      reason: status.reason || 'Account is locked for disputes',
    };
  }
  
  return { allowed: true };
}
