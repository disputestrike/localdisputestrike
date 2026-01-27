import { db } from '../db';
import { safeJsonParse } from '../utils/json';
import { disputeRounds, negativeAccounts } from '../../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Check if an account can be disputed (30-day FCRA lock enforcement)
 * FCRA requires 30 days between disputes on the same item
 */
export async function canDisputeAccount(
  userId: number,
  accountId: number
): Promise<{ canDispute: boolean; reason?: string; unlocksAt?: Date }> {
  try {
    // Get the account
    const account = await db
      .select()
      .from(negativeAccounts)
      .where(and(eq(negativeAccounts.id, accountId), eq(negativeAccounts.userId, userId)))
      .limit(1);

    if (!account || account.length === 0) {
      return { canDispute: false, reason: 'Account not found' };
    }

    // Get recent dispute rounds for this user
    const recentDisputes = await db
      .select()
      .from(disputeRounds)
      .where(eq(disputeRounds.userId, userId))
      .orderBy(disputeRounds.mailedAt);

    // Check each dispute to see if this account was disputed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const dispute of recentDisputes) {
      if (!dispute.disputedItemIds) continue;

      try {
        const itemIds = safeJsonParse(dispute.disputedItemIds, null);
        if (itemIds === null) continue;
        if (itemIds.includes(accountId) && dispute.mailedAt) {
          // This account was disputed recently
          if (dispute.mailedAt > thirtyDaysAgo) {
            // Still within 30-day lock period
            const unlocksAt = new Date(
              dispute.mailedAt.getTime() + 30 * 24 * 60 * 60 * 1000
            );
            return {
              canDispute: false,
              reason: `This account cannot be disputed again until ${unlocksAt.toLocaleDateString()}. FCRA regulations require 30 days between disputes on the same item.`,
              unlocksAt,
            };
          }
        }
      } catch (e) {
        console.error('Error parsing disputed item IDs:', e);
      }
    }

    return { canDispute: true };
  } catch (error) {
    console.error('Error checking dispute lock:', error);
    return { canDispute: false, reason: 'Error checking dispute eligibility' };
  }
}

/**
 * Get all accounts that are currently locked (cannot be disputed)
 */
export async function getLockedAccounts(userId: number): Promise<
  Array<{
    accountId: number;
    unlocksAt: Date;
    daysRemaining: number;
  }>
> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent disputes
    const recentDisputes = await db
      .select()
      .from(disputeRounds)
      .where(
        and(
          eq(disputeRounds.userId, userId),
          gt(disputeRounds.mailedAt, thirtyDaysAgo)
        )
      );

    const lockedAccounts = [];

    for (const dispute of recentDisputes) {
      if (dispute.disputedItemIds) {
        const itemIds = safeJsonParse(dispute.disputedItemIds, null);
        if (itemIds === null) continue;
          for (const itemId of itemIds) {
            const unlocksAt = new Date(
              dispute.mailedAt!.getTime() + 30 * 24 * 60 * 60 * 1000
            );
            const now = new Date();
            const daysRemaining = Math.ceil(
              (unlocksAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
            );

            if (daysRemaining > 0) {
              lockedAccounts.push({
                accountId: itemId,
                unlocksAt,
                daysRemaining,
              });
            }
          }
        } catch (e) {
          console.error('Error parsing disputed item IDs:', e);
        }
      }
    }

    return lockedAccounts;
  } catch (error) {
    console.error('Error getting locked accounts:', error);
    return [];
  }
}

/**
 * Record a dispute for an account (for lock tracking)
 */
export async function recordDisputeSent(
  userId: number,
  roundId: number,
  accountIds: number[]
): Promise<void> {
  try {
    // Update the dispute round with the disputed account IDs
    await db
      .update(disputeRounds)
      .set({
        disputedItemIds: JSON.stringify(accountIds),
        mailedAt: new Date(),
        status: 'mailed',
      })
      .where(eq(disputeRounds.id, roundId));
  } catch (error) {
    console.error('Error recording dispute:', error);
    throw error;
  }
}
