/**
 * Stripe Subscription Service
 * 
 * Handles complete subscription lifecycle (SOURCE BIBLE v2.0 Jan 2026):
 * - Free preview (no payment)
 * - Essential: $79.99/mo
 * - Complete: $129.99/mo
 * - Upgrades and cancellations
 */

import Stripe from 'stripe';

const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

// Plan pricing (in cents) – SOURCE BIBLE v2.0 Jan 2026
export const PLAN_PRICES = {
  essential: 7999, // $79.99
  complete: 12999, // $129.99
  diy: 7999, // Maps to Essential
};

// Stripe Price IDs (TEST MODE)
export const STRIPE_PRICE_IDS = {
  essential: process.env.STRIPE_ESSENTIAL_PRICE_ID || 'price_1St92mJbDEkzZWwHpe7Ljb1h',
  complete: process.env.STRIPE_COMPLETE_PRICE_ID || 'price_1St9QKJbDEkzZWwHbzChpIVL',
};

// Legacy trial config (kept for backward compatibility with existing code)
export const TRIAL_CONFIG = {
  price: 0, // Free preview now
  days: 0,
};

/**
 * Create a subscription (no trial - direct payment)
 */
export async function createSubscription(params: {
  email: string;
  plan: 'essential' | 'complete';
  userId: number;
}): Promise<{
  clientSecret: string;
  subscriptionId: string;
  customerId: string;
}> {
  if (!stripe) throw new Error('Stripe not configured (STRIPE_SECRET_KEY missing)');
  const { email, plan, userId } = params;
  
  // Create or get customer
  let customer: Stripe.Customer;
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });
  
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({
      email,
      metadata: {
        userId: userId.toString(),
      },
    });
  }
  
  const priceId = STRIPE_PRICE_IDS[plan];
  
  // Create subscription (no trial)
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
      payment_method_types: ['card'],
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      userId: userId.toString(),
      plan,
    },
  });
  
  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
  
  return {
    clientSecret: paymentIntent.client_secret!,
    subscriptionId: subscription.id,
    customerId: customer.id,
  };
}

/**
 * Legacy function - now just creates a regular subscription
 * Kept for backward compatibility
 */
export async function createTrialSubscription(params: {
  email: string;
  plan: 'diy' | 'complete' | 'essential';
  userId: number;
}): Promise<{
  clientSecret: string;
  subscriptionId: string;
  customerId: string;
}> {
  // Map legacy 'diy' to 'essential'
  const mappedPlan = params.plan === 'diy' ? 'essential' : params.plan as 'essential' | 'complete';
  return createSubscription({
    ...params,
    plan: mappedPlan,
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(params: {
  subscriptionId: string;
  immediate?: boolean;
}): Promise<{
  success: boolean;
  subscription: Stripe.Subscription;
}> {
  const { subscriptionId, immediate = false } = params;
  
  if (immediate) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return { success: true, subscription };
  } else {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return { success: true, subscription };
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(params: {
  subscriptionId: string;
}): Promise<{
  success: boolean;
  subscription: Stripe.Subscription;
}> {
  const { subscriptionId } = params;
  
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  
  return { success: true, subscription };
}

/**
 * Change subscription plan (upgrade/downgrade)
 */
export async function changeSubscriptionPlan(params: {
  subscriptionId: string;
  newPlan: 'essential' | 'complete';
}): Promise<{
  success: boolean;
  subscription: Stripe.Subscription;
}> {
  const { subscriptionId, newPlan } = params;
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentItemId = subscription.items.data[0]?.id;
  
  if (!currentItemId) {
    throw new Error('No subscription item found');
  }
  
  const priceId = STRIPE_PRICE_IDS[newPlan];
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: currentItemId,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
  
  return { success: true, subscription: updatedSubscription };
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(params: {
  subscriptionId: string;
}): Promise<{
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  plan: string;
}> {
  const { subscriptionId } = params;
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    plan: subscription.metadata.plan || 'unknown',
  };
}

/**
 * Handle Stripe webhooks
 */
export async function handleStripeWebhook(params: {
  event: Stripe.Event;
  onSubscriptionActivated?: (data: { userId: number; customerId: string; subscriptionId: string }) => Promise<void>;
  onSubscriptionCanceled?: (data: { userId: number; subscriptionId: string }) => Promise<void>;
  onPaymentFailed?: (data: { userId: number; subscriptionId: string }) => Promise<void>;
}): Promise<void> {
  const { event, onSubscriptionActivated, onSubscriptionCanceled, onPaymentFailed } = params;
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata.userId || '0');
      
      if (subscription.status === 'active' && onSubscriptionActivated) {
        await onSubscriptionActivated({
          userId,
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
        });
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata.userId || '0');
      
      if (onSubscriptionCanceled) {
        await onSubscriptionCanceled({
          userId,
          subscriptionId: subscription.id,
        });
      }
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      
      if (subscriptionId && onPaymentFailed) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = parseInt(subscription.metadata.userId || '0');
        
        await onPaymentFailed({
          userId,
          subscriptionId,
        });
      }
      break;
    }
  }
}

/**
 * Get customer portal URL for self-service
 */
export async function createCustomerPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const { customerId, returnUrl } = params;
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session.url;
}

/**
 * Legacy helper - get trial end date (now returns null since no trial)
 */
export function getTrialEndDate(): Date | null {
  return null;
}
