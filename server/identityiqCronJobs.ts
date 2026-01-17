/**
 * IdentityIQ Payment Cron Jobs
 * 
 * Handles automated payments to IdentityIQ:
 * - Monthly subscription payments
 * - Payment retry logic
 * - Failed payment notifications
 */

import * as db from './db';
import { payIdentityIQMonthly, cancelIdentityIQSubscription } from './identityiqService';
import { sendEmail } from './zeptomailService';

/**
 * Process monthly IdentityIQ payments
 * 
 * Run this job daily at 2am
 * Checks for subscriptions that need monthly payment
 */
export async function processIdentityIQMonthlyPayments(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  console.log('[IdentityIQ Cron] Processing monthly payments...');
  
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
  };
  
  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[IdentityIQ Cron] Database not available');
      return results;
    }
    
    // Get all active subscriptions
    const subscriptions = await dbInstance.query.subscriptionsV2.findMany({
      where: (subs, { eq }) => eq(subs.status, 'active'),
    });
    
    const now = new Date();
    
    for (const subscription of subscriptions) {
      // Skip if no Stripe subscription (shouldn't happen)
      if (!subscription.stripeSubscriptionId) continue;
      
      // Check if we need to pay IdentityIQ this month
      // Logic: Pay on the same day each month as subscription started
      const subscriptionStart = subscription.trialStartedAt || subscription.createdAt;
      const dayOfMonth = subscriptionStart.getDate();
      
      // Only process if today is the billing day
      if (now.getDate() !== dayOfMonth) continue;
      
      results.processed++;
      
      // Determine payment amount based on plan
      // TODO: Get actual IdentityIQ pricing
      const IDENTITYIQ_MONTHLY_COST = 2999; // $29.99 placeholder
      
      try {
        // Attempt payment to IdentityIQ
        const paymentResult = await payIdentityIQMonthly({
          userId: subscription.userId,
          amount: IDENTITYIQ_MONTHLY_COST,
          type: 'monthly',
          metadata: {
            subscriptionId: subscription.id,
            plan: subscription.tier,
          },
        });
        
        if (paymentResult.success) {
          results.successful++;
          
          // TODO: Record payment in database
          // await dbInstance.insert(identityiqPayments).values({
          //   userId: subscription.userId,
          //   subscriptionId: subscription.id,
          //   paymentType: 'monthly',
          //   amountCents: IDENTITYIQ_MONTHLY_COST,
          //   status: 'paid',
          //   identityiqTransactionId: paymentResult.transactionId,
          //   paidAt: new Date(),
          // });
          
          console.log(`[IdentityIQ Cron] Payment successful for user ${subscription.userId}`);
        } else {
          results.failed++;
          
          // TODO: Record failed payment
          // await dbInstance.insert(identityiqPayments).values({
          //   userId: subscription.userId,
          //   subscriptionId: subscription.id,
          //   paymentType: 'monthly',
          //   amountCents: IDENTITYIQ_MONTHLY_COST,
          //   status: 'failed',
          //   failedAt: new Date(),
          //   failureReason: paymentResult.error,
          // });
          
          console.error(`[IdentityIQ Cron] Payment failed for user ${subscription.userId}:`, paymentResult.error);
          
          // Send notification to admin
          await sendEmail({
            to: process.env.ADMIN_EMAIL || 'admin@disputestrike.com',
            subject: `IdentityIQ Payment Failed - User ${subscription.userId}`,
            html: `
              <h2>IdentityIQ Payment Failed</h2>
              <p><strong>User ID:</strong> ${subscription.userId}</p>
              <p><strong>Subscription ID:</strong> ${subscription.id}</p>
              <p><strong>Amount:</strong> $${IDENTITYIQ_MONTHLY_COST / 100}</p>
              <p><strong>Error:</strong> ${paymentResult.error}</p>
              <p>Please investigate and retry manually if needed.</p>
            `,
            plain: `IdentityIQ payment failed for user ${subscription.userId}. Error: ${paymentResult.error}`,
          });
        }
      } catch (error: any) {
        results.failed++;
        console.error(`[IdentityIQ Cron] Error processing payment for user ${subscription.userId}:`, error);
      }
    }
  } catch (error) {
    console.error('[IdentityIQ Cron] Error in monthly payment processing:', error);
  }
  
  console.log(`[IdentityIQ Cron] Monthly payments complete: ${results.successful} successful, ${results.failed} failed out of ${results.processed} processed`);
  
  return results;
}

/**
 * Retry failed IdentityIQ payments
 * 
 * Run this job daily at 10am
 * Retries payments that failed in the last 3 days
 */
export async function retryFailedIdentityIQPayments(): Promise<{
  retried: number;
  successful: number;
  failed: number;
}> {
  console.log('[IdentityIQ Cron] Retrying failed payments...');
  
  const results = {
    retried: 0,
    successful: 0,
    failed: 0,
  };
  
  try {
    // TODO: Implement retry logic
    // Get failed payments from last 3 days
    // Retry each one
    // Update status in database
    
    console.log('[IdentityIQ Cron] Retry logic not yet implemented (waiting for database schema)');
  } catch (error) {
    console.error('[IdentityIQ Cron] Error in retry processing:', error);
  }
  
  return results;
}

/**
 * Cancel IdentityIQ subscriptions for canceled Stripe subscriptions
 * 
 * Run this job every hour
 * Ensures IdentityIQ subscriptions are canceled when Stripe subscriptions are canceled
 */
export async function syncCanceledSubscriptions(): Promise<{
  synced: number;
  errors: number;
}> {
  console.log('[IdentityIQ Cron] Syncing canceled subscriptions...');
  
  const results = {
    synced: 0,
    errors: 0,
  };
  
  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[IdentityIQ Cron] Database not available');
      return results;
    }
    
    // Get all canceled subscriptions that haven't been synced to IdentityIQ
    const canceledSubs = await dbInstance.query.subscriptionsV2.findMany({
      where: (subs, { eq }) => eq(subs.status, 'canceled'),
    });
    
    for (const subscription of canceledSubs) {
      try {
        // TODO: Check if IdentityIQ subscription is still active
        // If yes, cancel it
        
        // PLACEHOLDER: Assume we need to cancel
        const cancelResult = await cancelIdentityIQSubscription({
          userId: subscription.userId,
          subscriptionId: subscription.stripeSubscriptionId || '',
        });
        
        if (cancelResult.success) {
          results.synced++;
          console.log(`[IdentityIQ Cron] Canceled IdentityIQ subscription for user ${subscription.userId}`);
        } else {
          results.errors++;
          console.error(`[IdentityIQ Cron] Failed to cancel IdentityIQ subscription for user ${subscription.userId}`);
        }
      } catch (error) {
        results.errors++;
        console.error(`[IdentityIQ Cron] Error canceling subscription for user ${subscription.userId}:`, error);
      }
    }
  } catch (error) {
    console.error('[IdentityIQ Cron] Error in sync processing:', error);
  }
  
  console.log(`[IdentityIQ Cron] Sync complete: ${results.synced} synced, ${results.errors} errors`);
  
  return results;
}
