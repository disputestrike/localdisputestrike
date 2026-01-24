/**
 * Rate Limiting Service
 * 
 * Prevents spam and abuse of the free preview feature:
 * - 3 free previews per account per month
 * - 5 free previews per IP per day
 * - Tracks usage in database
 */

import { eq, and, gt, sql } from 'drizzle-orm';
import { db } from './db';
import { users } from '../drizzle/schema';

// Rate limit configuration
export const RATE_LIMITS = {
  FREE_PREVIEW_PER_USER_PER_MONTH: 3,
  FREE_PREVIEW_PER_IP_PER_DAY: 5,
  SIGNUP_PER_IP_PER_HOUR: 10,
};

// In-memory cache for rate limiting (for IP-based limits)
// In production, use Redis for distributed rate limiting
const ipLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a user can run a free preview
 */
export async function canRunFreePreview(userId: number, ipAddress: string): Promise<{
  allowed: boolean;
  reason?: string;
  remainingPreviews?: number;
}> {
  try {
    // Check user's monthly limit
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0]) {
      return { allowed: false, reason: 'User not found' };
    }
    
    // Get user's preview count this month
    // Note: This assumes we track preview usage in the user record or a separate table
    // For now, we'll use a simple in-memory approach
    const userPreviewCount = await getUserMonthlyPreviewCount(userId);
    
    if (userPreviewCount >= RATE_LIMITS.FREE_PREVIEW_PER_USER_PER_MONTH) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${RATE_LIMITS.FREE_PREVIEW_PER_USER_PER_MONTH} free previews this month. Upgrade to Essential for unlimited analysis.`,
        remainingPreviews: 0,
      };
    }
    
    // Check IP daily limit
    const ipCount = getIpDailyCount(ipAddress);
    
    if (ipCount >= RATE_LIMITS.FREE_PREVIEW_PER_IP_PER_DAY) {
      return {
        allowed: false,
        reason: 'Too many preview requests from this location. Please try again tomorrow.',
        remainingPreviews: RATE_LIMITS.FREE_PREVIEW_PER_USER_PER_MONTH - userPreviewCount,
      };
    }
    
    return {
      allowed: true,
      remainingPreviews: RATE_LIMITS.FREE_PREVIEW_PER_USER_PER_MONTH - userPreviewCount - 1,
    };
  } catch (error) {
    console.error('[Rate Limit] Error checking preview limit:', error);
    // Fail open - allow the request but log the error
    return { allowed: true, remainingPreviews: undefined };
  }
}

/**
 * Record a free preview usage
 */
export async function recordFreePreviewUsage(userId: number, ipAddress: string): Promise<void> {
  try {
    // Increment user's monthly count
    await incrementUserMonthlyPreviewCount(userId);
    
    // Increment IP daily count
    incrementIpDailyCount(ipAddress);
    
    console.log(`[Rate Limit] Recorded preview usage for user ${userId} from IP ${maskIp(ipAddress)}`);
  } catch (error) {
    console.error('[Rate Limit] Error recording preview usage:', error);
  }
}

/**
 * Check if an IP can create a new account
 */
export function canCreateAccount(ipAddress: string): {
  allowed: boolean;
  reason?: string;
} {
  const key = `signup_${ipAddress}`;
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  const cached = ipLimitCache.get(key);
  
  if (cached && cached.resetAt > now) {
    if (cached.count >= RATE_LIMITS.SIGNUP_PER_IP_PER_HOUR) {
      return {
        allowed: false,
        reason: 'Too many account creation attempts. Please try again later.',
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Record an account creation
 */
export function recordAccountCreation(ipAddress: string): void {
  const key = `signup_${ipAddress}`;
  const now = Date.now();
  const oneHourFromNow = now + 60 * 60 * 1000;
  
  const cached = ipLimitCache.get(key);
  
  if (cached && cached.resetAt > now) {
    cached.count++;
  } else {
    ipLimitCache.set(key, { count: 1, resetAt: oneHourFromNow });
  }
}

// ============================================
// Helper Functions
// ============================================

// In-memory storage for user preview counts (use database in production)
const userPreviewCounts = new Map<number, { count: number; month: string }>();

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function getUserMonthlyPreviewCount(userId: number): Promise<number> {
  const currentMonth = getCurrentMonth();
  const cached = userPreviewCounts.get(userId);
  
  if (cached && cached.month === currentMonth) {
    return cached.count;
  }
  
  // Reset for new month
  userPreviewCounts.set(userId, { count: 0, month: currentMonth });
  return 0;
}

async function incrementUserMonthlyPreviewCount(userId: number): Promise<void> {
  const currentMonth = getCurrentMonth();
  const cached = userPreviewCounts.get(userId);
  
  if (cached && cached.month === currentMonth) {
    cached.count++;
  } else {
    userPreviewCounts.set(userId, { count: 1, month: currentMonth });
  }
}

function getIpDailyCount(ipAddress: string): number {
  const key = `preview_${ipAddress}`;
  const now = Date.now();
  
  const cached = ipLimitCache.get(key);
  
  if (cached && cached.resetAt > now) {
    return cached.count;
  }
  
  return 0;
}

function incrementIpDailyCount(ipAddress: string): void {
  const key = `preview_${ipAddress}`;
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const cached = ipLimitCache.get(key);
  
  if (cached && cached.resetAt > now) {
    cached.count++;
  } else {
    ipLimitCache.set(key, { count: 1, resetAt: endOfDay.getTime() });
  }
}

function maskIp(ip: string): string {
  // Mask IP for logging (privacy)
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return 'xxx.xxx.xxx.xxx';
}

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipLimitCache.entries()) {
    if (value.resetAt < now) {
      ipLimitCache.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Get rate limit status for admin dashboard
 */
export function getRateLimitStats(): {
  activeIpLimits: number;
  activeUserLimits: number;
} {
  return {
    activeIpLimits: ipLimitCache.size,
    activeUserLimits: userPreviewCounts.size,
  };
}
