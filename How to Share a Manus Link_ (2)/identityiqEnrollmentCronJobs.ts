/**
 * IdentityIQ Enrollment Cron Jobs
 * 
 * Handles automated enrollment and credit report pulling for new users
 */

import * as db from './db';
import { users, subscriptions } from '../drizzle/schema';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import {
  processNewUserEnrollment,
  pullCreditReports,
  cancelIdentityIQSubscription,
} from './identityiqEnrollmentService';

/**
 * Process pending IdentityIQ enrollments
 * 
 * Runs every 5 minutes to check for users who:
 * - Have paid but not yet enrolled in IdentityIQ
 * - Have all required identity information
 */
export async function processPendingEnrollments() {
  console.log('[Cron] Processing pending IdentityIQ enrollments...');

  try {
    // Find users with pending enrollment
    const pendingUsers = await db.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        middleInitial: users.middleInitial,
        lastName: users.lastName,
        address: users.address,
        city: users.city,
        state: users.state,
        zipCode: users.zipCode,
        ssn: users.ssn,
        dateOfBirth: users.dateOfBirth,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(
        and(
          eq(users.identityiqStatus, 'pending'),
          isNull(users.identityiqUserId),
          isNotNull(users.firstName),
          isNotNull(users.lastName),
          isNotNull(users.ssn),
          isNotNull(users.dateOfBirth)
        )
      )
      .limit(50); // Process in batches

    if (pendingUsers.length === 0) {
      console.log('[Cron] No pending enrollments found');
      return;
    }

    console.log(`[Cron] Found ${pendingUsers.length} pending enrollments`);

    let successCount = 0;
    let failureCount = 0;

    for (const user of pendingUsers) {
      try {
        console.log(`[Cron] Processing enrollment for user ${user.id} (${user.email})`);

        const result = await processNewUserEnrollment({
          userId: user.id,
          firstName: user.firstName!,
          middleInitial: user.middleInitial || undefined,
          lastName: user.lastName!,
          email: user.email!,
          address: user.address!,
          city: user.city!,
          state: user.state!,
          zipCode: user.zipCode!,
          ssn: user.ssn!,
          dateOfBirth: user.dateOfBirth!,
          phoneNumber: user.phoneNumber!,
        });

        if (result.enrollmentSuccess && result.creditPullSuccess) {
          successCount++;
          console.log(`[Cron] ✅ Successfully enrolled user ${user.id}`);
        } else {
          failureCount++;
          console.log(`[Cron] ❌ Failed to enroll user ${user.id}: ${result.error}`);
        }
      } catch (error: any) {
        failureCount++;
        console.error(`[Cron] Error processing user ${user.id}:`, error);
      }
    }

    console.log(
      `[Cron] Enrollment processing complete: ${successCount} success, ${failureCount} failures`
    );
  } catch (error) {
    console.error('[Cron] Error in processPendingEnrollments:', error);
  }
}

/**
 * Retry failed credit report pulls
 * 
 * Runs hourly to retry credit pulls that failed initially
 */
export async function retryFailedCreditPulls() {
  console.log('[Cron] Retrying failed credit report pulls...');

  try {
    // Find users who are enrolled but don't have credit data yet
    // (In a real implementation, we'd check a separate credit_reports table)
    const usersNeedingRetry = await db.db
      .select({
        id: users.id,
        identityiqUserId: users.identityiqUserId,
      })
      .from(users)
      .where(
        and(
          eq(users.identityiqStatus, 'active'),
          isNotNull(users.identityiqUserId)
          // TODO: Add condition to check if credit report exists
        )
      )
      .limit(20);

    if (usersNeedingRetry.length === 0) {
      console.log('[Cron] No failed credit pulls to retry');
      return;
    }

    console.log(`[Cron] Retrying ${usersNeedingRetry.length} failed credit pulls`);

    let successCount = 0;
    let failureCount = 0;

    for (const user of usersNeedingRetry) {
      try {
        const result = await pullCreditReports(user.id, user.identityiqUserId!);

        if (result.success) {
          successCount++;
          console.log(`[Cron] ✅ Successfully pulled credit for user ${user.id}`);
        } else {
          failureCount++;
          console.log(`[Cron] ❌ Failed to pull credit for user ${user.id}: ${result.error}`);
        }
      } catch (error: any) {
        failureCount++;
        console.error(`[Cron] Error pulling credit for user ${user.id}:`, error);
      }
    }

    console.log(
      `[Cron] Credit pull retry complete: ${successCount} success, ${failureCount} failures`
    );
  } catch (error) {
    console.error('[Cron] Error in retryFailedCreditPulls:', error);
  }
}

/**
 * Cancel IdentityIQ subscriptions for expired trials
 * 
 * Runs daily to cancel IdentityIQ for users whose trial expired without subscribing
 */
export async function cancelExpiredTrialSubscriptions() {
  console.log('[Cron] Canceling IdentityIQ for expired trials...');

  try {
    const now = new Date();

    // Find users with expired trials and no active subscription
    const expiredTrials = await db.db
      .select({
        userId: users.id,
        identityiqUserId: users.identityiqUserId,
        email: users.email,
      })
      .from(users)
      .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
      .where(
        and(
          eq(users.identityiqStatus, 'active'),
          isNotNull(users.identityiqUserId),
          // TODO: Add proper trial expiration check
          // For now, this is a placeholder
        )
      )
      .limit(50);

    if (expiredTrials.length === 0) {
      console.log('[Cron] No expired trials to cancel');
      return;
    }

    console.log(`[Cron] Found ${expiredTrials.length} expired trials to cancel`);

    let successCount = 0;
    let failureCount = 0;

    for (const trial of expiredTrials) {
      try {
        const result = await cancelIdentityIQSubscription(
          trial.userId,
          trial.identityiqUserId!
        );

        if (result.success) {
          successCount++;
          console.log(`[Cron] ✅ Cancelled IdentityIQ for user ${trial.userId}`);
        } else {
          failureCount++;
          console.log(
            `[Cron] ❌ Failed to cancel IdentityIQ for user ${trial.userId}: ${result.error}`
          );
        }
      } catch (error: any) {
        failureCount++;
        console.error(`[Cron] Error canceling for user ${trial.userId}:`, error);
      }
    }

    console.log(
      `[Cron] Trial cancellation complete: ${successCount} success, ${failureCount} failures`
    );
  } catch (error) {
    console.error('[Cron] Error in cancelExpiredTrialSubscriptions:', error);
  }
}
