import { db } from '../db';
import { agencies, agencyClients } from '../../drizzle/schema';
import { eq, count } from 'drizzle-orm';

/**
 * Agency capacity limits based on plan tier
 */
const CAPACITY_LIMITS: Record<string, number> = {
  starter: 50,
  professional: 200,
  enterprise: 500,
};

/**
 * Get current client count for an agency
 */
export async function getAgencyClientCount(agencyId: number): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(agencyClients)
      .where(eq(agencyClients.agencyId, agencyId));

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting agency client count:', error);
    return 0;
  }
}

/**
 * Check if an agency can add more clients
 */
export async function canAddClient(
  agencyId: number
): Promise<{ canAdd: boolean; reason?: string; currentCount?: number; limit?: number }> {
  try {
    // Get the agency
    const agency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    if (!agency || agency.length === 0) {
      return { canAdd: false, reason: 'Agency not found' };
    }

    const agencyData = agency[0];
    const planTier = agencyData.planTier || 'starter';
    const limit = CAPACITY_LIMITS[planTier] || 50;

    // Get current client count
    const currentCount = await getAgencyClientCount(agencyId);

    if (currentCount >= limit) {
      return {
        canAdd: false,
        reason: `Agency has reached the ${planTier} plan limit of ${limit} clients. Upgrade to add more clients.`,
        currentCount,
        limit,
      };
    }

    return { canAdd: true, currentCount, limit };
  } catch (error) {
    console.error('Error checking agency capacity:', error);
    return { canAdd: false, reason: 'Error checking capacity' };
  }
}

/**
 * Get agency capacity status
 */
export async function getAgencyCapacityStatus(agencyId: number): Promise<{
  currentCount: number;
  limit: number;
  percentageUsed: number;
  slotsAvailable: number;
  planTier: string;
}> {
  try {
    const agency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    if (!agency || agency.length === 0) {
      return {
        currentCount: 0,
        limit: 50,
        percentageUsed: 0,
        slotsAvailable: 50,
        planTier: 'starter',
      };
    }

    const agencyData = agency[0];
    const planTier = agencyData.planTier || 'starter';
    const limit = CAPACITY_LIMITS[planTier] || 50;
    const currentCount = await getAgencyClientCount(agencyId);
    const percentageUsed = Math.round((currentCount / limit) * 100);
    const slotsAvailable = Math.max(0, limit - currentCount);

    return {
      currentCount,
      limit,
      percentageUsed,
      slotsAvailable,
      planTier,
    };
  } catch (error) {
    console.error('Error getting capacity status:', error);
    return {
      currentCount: 0,
      limit: 50,
      percentageUsed: 0,
      slotsAvailable: 50,
      planTier: 'starter',
    };
  }
}

/**
 * Enforce capacity limit when adding a client
 * Throws error if limit exceeded
 */
export async function enforceCapacityLimit(agencyId: number): Promise<void> {
  const { canAdd, reason } = await canAddClient(agencyId);
  if (!canAdd) {
    throw new Error(reason || 'Cannot add client: capacity limit reached');
  }
}

/**
 * Get upgrade recommendation based on current usage
 */
export async function getUpgradeRecommendation(agencyId: number): Promise<{
  shouldUpgrade: boolean;
  currentPlan: string;
  recommendedPlan?: string;
  reason?: string;
}> {
  try {
    const status = await getAgencyCapacityStatus(agencyId);

    // Recommend upgrade if usage is above 80%
    if (status.percentageUsed >= 80) {
      const currentTier = status.planTier;
      let recommendedTier = 'professional';

      if (currentTier === 'professional') {
        recommendedTier = 'enterprise';
      }

      return {
        shouldUpgrade: true,
        currentPlan: currentTier,
        recommendedPlan: recommendedTier,
        reason: `Your agency is at ${status.percentageUsed}% capacity. Consider upgrading to the ${recommendedTier} plan.`,
      };
    }

    return {
      shouldUpgrade: false,
      currentPlan: status.planTier,
    };
  } catch (error) {
    console.error('Error getting upgrade recommendation:', error);
    return {
      shouldUpgrade: false,
      currentPlan: 'starter',
    };
  }
}
