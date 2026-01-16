/**
 * Cancellation Handler
 * 
 * Coordinates cancellations across:
 * - Stripe subscriptions
 * - IdentityIQ subscriptions
 * - Database records
 * - User notifications
 */

import * as db from './db';
import { cancelSubscription as cancelStripeSubscription } from './stripeSubscriptionService';
import { cancelIdentityIQSubscription } from './identityiqService';
import { sendEmail } from './mailerooService';

interface CancellationParams {
  userId: number;
  immediate?: boolean;
  reason?: string;
  feedback?: string;
}

interface CancellationResult {
  success: boolean;
  stripeCanceled: boolean;
  identityiqCanceled: boolean;
  error?: string;
}

/**
 * Cancel user's subscription completely
 * 
 * This handles:
 * 1. Canceling Stripe subscription
 * 2. Canceling IdentityIQ subscription
 * 3. Updating database
 * 4. Sending confirmation email
 */
export async function cancelUserSubscription(params: CancellationParams): Promise<CancellationResult> {
  const { userId, immediate = false, reason, feedback } = params;
  
  console.log(`[Cancellation] Processing cancellation for user ${userId} (immediate: ${immediate})`);
  
  const result: CancellationResult = {
    success: false,
    stripeCanceled: false,
    identityiqCanceled: false,
  };
  
  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      throw new Error('Database not available');
    }
    
    // Get user's subscription
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription) {
      throw new Error('No subscription found for user');
    }
    
    const user = await dbInstance.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Step 1: Cancel Stripe subscription
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeResult = await cancelStripeSubscription({
          subscriptionId: subscription.stripeSubscriptionId,
          immediate,
        });
        
        if (stripeResult.success) {
          result.stripeCanceled = true;
          console.log(`[Cancellation] Stripe subscription canceled for user ${userId}`);
        }
      } catch (error: any) {
        console.error(`[Cancellation] Failed to cancel Stripe subscription:`, error);
        // Continue with other cancellations even if Stripe fails
      }
    }
    
    // Step 2: Cancel IdentityIQ subscription
    // Only cancel immediately if user requested immediate cancellation
    // Otherwise, let it run until end of billing period
    if (immediate) {
      try {
        const identityiqResult = await cancelIdentityIQSubscription({
          userId,
          subscriptionId: subscription.stripeSubscriptionId || '',
        });
        
        if (identityiqResult.success) {
          result.identityiqCanceled = true;
          console.log(`[Cancellation] IdentityIQ subscription canceled for user ${userId}`);
        }
      } catch (error: any) {
        console.error(`[Cancellation] Failed to cancel IdentityIQ subscription:`, error);
        // Continue even if IdentityIQ fails
      }
    } else {
      // Mark for cancellation at end of period
      result.identityiqCanceled = true; // Will be handled by cron job
      console.log(`[Cancellation] IdentityIQ subscription marked for cancellation at period end`);
    }
    
    // Step 3: Update database
    await dbInstance.update(db.schema.subscriptionsV2)
      .set({
        status: immediate ? 'canceled' : 'canceling',
        canceledAt: immediate ? new Date() : null,
      })
      .where((subs, { eq }) => eq(subs.id, subscription.id));
    
    // Step 4: Record cancellation feedback if provided
    if (reason || feedback) {
      // TODO: Store cancellation feedback in database
      console.log(`[Cancellation] Feedback from user ${userId}: ${reason} - ${feedback}`);
    }
    
    // Step 5: Send confirmation email
    try {
      await sendCancellationEmail({
        email: user.email,
        name: user.name || 'there',
        immediate,
        plan: subscription.tier,
      });
    } catch (error) {
      console.error(`[Cancellation] Failed to send confirmation email:`, error);
      // Don't fail the cancellation if email fails
    }
    
    result.success = true;
    console.log(`[Cancellation] Successfully processed cancellation for user ${userId}`);
    
  } catch (error: any) {
    console.error(`[Cancellation] Error processing cancellation:`, error);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Send cancellation confirmation email
 */
async function sendCancellationEmail(params: {
  email: string;
  name: string;
  immediate: boolean;
  plan: string;
}): Promise<void> {
  const { email, name, immediate, plan } = params;
  
  const subject = immediate 
    ? 'Your subscription has been canceled'
    : 'Your subscription will be canceled';
  
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Subscription ${immediate ? 'Canceled' : 'Canceling'}</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
        
        ${immediate ? `
          <p>Your DisputeStrike ${plan} subscription has been canceled immediately.</p>
          <p>You no longer have access to:</p>
          <ul>
            <li>3-bureau credit monitoring</li>
            <li>Dispute letter generation</li>
            <li>AI credit analysis</li>
            ${plan === 'complete' ? '<li>Certified mail service</li>' : ''}
          </ul>
        ` : `
          <p>Your DisputeStrike ${plan} subscription will be canceled at the end of your current billing period.</p>
          <p>You'll continue to have access until then, including:</p>
          <ul>
            <li>3-bureau credit monitoring</li>
            <li>Dispute letter generation</li>
            <li>AI credit analysis</li>
            ${plan === 'complete' ? '<li>Certified mail service</li>' : ''}
          </ul>
          <p><strong>Want to keep your subscription?</strong> You can reactivate anytime before the end of your billing period.</p>
        `}
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">We're Sorry to See You Go</h3>
          <p>If you had any issues or concerns, we'd love to hear from you. Your feedback helps us improve.</p>
          <p>Reply to this email to let us know how we can do better.</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          You can always come back! Your account will remain active, and you can resubscribe anytime.
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          - The DisputeStrike Team
        </p>
      </div>
    </div>
  `;
  
  const plain = `
Hi ${name},

Your DisputeStrike ${plan} subscription has been ${immediate ? 'canceled immediately' : 'scheduled for cancellation at the end of your billing period'}.

${immediate ? 
  'You no longer have access to credit monitoring, dispute tools, and AI analysis.' :
  'You\'ll continue to have access until the end of your billing period. Want to keep your subscription? You can reactivate anytime.'
}

We're sorry to see you go. If you had any issues, please reply to this email and let us know how we can improve.

You can always come back! Your account remains active and you can resubscribe anytime.

- The DisputeStrike Team
  `;
  
  await sendEmail({
    to: email,
    subject,
    html,
    plain,
    tags: {
      type: 'cancellation',
      immediate: immediate.toString(),
    },
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateUserSubscription(params: {
  userId: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const { userId } = params;
  
  console.log(`[Reactivation] Processing reactivation for user ${userId}`);
  
  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      throw new Error('Database not available');
    }
    
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription) {
      throw new Error('No subscription found');
    }
    
    if (subscription.status !== 'canceling') {
      throw new Error('Subscription is not in canceling status');
    }
    
    // Reactivate in Stripe
    if (subscription.stripeSubscriptionId) {
      const { reactivateSubscription } = await import('./stripeSubscriptionService');
      await reactivateSubscription({
        subscriptionId: subscription.stripeSubscriptionId,
      });
    }
    
    // Update database
    await dbInstance.update(db.schema.subscriptionsV2)
      .set({
        status: 'active',
        canceledAt: null,
      })
      .where((subs, { eq }) => eq(subs.id, subscription.id));
    
    console.log(`[Reactivation] Successfully reactivated subscription for user ${userId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error(`[Reactivation] Error:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}
