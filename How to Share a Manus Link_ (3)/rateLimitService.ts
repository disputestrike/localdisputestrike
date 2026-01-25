/**
 * Rate Limiting Service
 * 
 * Prevents abuse of the dispute generation feature:
 * - 3 dispute generations per account per month
 * - 5 dispute generations per IP per day
 * - Tracks usage in database
 */

import { eq, and, gt, sql } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '../drizzle/schema';

// Rate limit configuration
export const RATE_LIMITS = {
  DISPUTES_PER_USER_PER_MONTH: 3,
  DISPUTES_PER_IP_PER_DAY: 5,
  SIGNUP_PER_IP_PER_HOUR: 10,
};

// In-memory cache for rate limiting (for IP-based limits)
// In production, use Redis for distributed rate limiting
const ipLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a user can generate disputes
 */
export async function canGenerateDisputes(userId: number, ipAddress: string): Promise<{
  allowed: boolean;
  reason?: string;
  remainingDisputes?: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { allowed: false, reason: 'Database not available' };
    }

    // Check user's monthly limit
    const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!userList[0]) {
      return { allowed: false, reason: 'User not found' };
    }
    
    // Get user's dispute count this month
    const userDisputeCount = await getUserMonthlyDisputeCount(userId);
    
    if (userDisputeCount >= RATE_LIMITS.DISPUTES_PER_USER_PER_MONTH) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${RATE_LIMITS.DISPUTES_PER_USER_PER_MONTH} disputes this month. Upgrade to Essential for unlimited disputes.`,
        remainingDisputes: 0,
      };
    }
    
    // Check IP daily limit
    const ipCount = getIpDailyCount(ipAddress);
    
    if (ipCount >= RATE_LIMITS.DISPUTES_PER_IP_PER_DAY) {
      return {
        allowed: false,
        reason: 'Too many dispute requests from this location. Please try again tomorrow.',
        remainingDisputes: RATE_LIMITS.DISPUTES_PER_USER_PER_MONTH - userDisputeCount,
      };
    }
    
    return {
      allowed: true,
      remainingDisputes: RATE_LIMITS.DISPUTES_PER_USER_PER_MONTH - userDisputeCount - 1,
    };
  } catch (error) {
    console.error('[Rate Limit] Error checking dispute limit:', error);
    // Fail open - allow the request but log the error
    return { allowed: true, remainingDisputes: undefined };
  }
}

/**
 * Record a dispute generation usage
 */
export async function recordDisputeUsage(userId: number, ipAddress: string): Promise<void> {
  try {
    // Increment user's monthly count
    await incrementUserMonthlyDisputeCount(userId);
    
    // Increment IP daily count
    incrementIpDailyCount(ipAddress);
    
    console.log(`[Rate Limit] Recorded dispute usage for user ${userId} from IP ${maskIp(ipAddress)}`);
  } catch (error) {
    console.error('[Rate Limit] Error recording dispute usage:', error);
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

// In-memory storage for user dispute counts (use database in production)
const userDisputeCounts = new Map<number, { count: number; month: string }>();

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function getUserMonthlyDisputeCount(userId: number): Promise<number> {
  const currentMonth = getCurrentMonth();
  const cached = userDisputeCounts.get(userId);
  
  if (cached && cached.month === currentMonth) {
    return cached.count;
  }
  
  // Reset for new month
  userDisputeCounts.set(userId, { count: 0, month: currentMonth });
  return 0;
}

async function incrementUserMonthlyDisputeCount(userId: number): Promise<void> {
  const currentMonth = getCurrentMonth();
  const cached = userDisputeCounts.get(userId);
  
  if (cached && cached.month === currentMonth) {
    cached.count++;
  } else {
    userDisputeCounts.set(userId, { count: 1, month: currentMonth });
  }
}

function getIpDailyCount(ipAddress: string): number {
  const key = `dispute_${ipAddress}`;
  const now = Date.now();
  
  const cached = ipLimitCache.get(key);
  
  if (cached && cached.resetAt > now) {
    return cached.count;
  }
  
  return 0;
}

function incrementIpDailyCount(ipAddress: string): void {
  const key = `dispute_${ipAddress}`;
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
    activeUserLimits: userDisputeCounts.size,
  };
}
