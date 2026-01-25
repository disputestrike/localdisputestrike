/**
 * Subscription Service
 * Handles $1 trial, subscription management, and tier upgrades
 */

import Stripe from 'stripe';
import { SUBSCRIPTION_TIERS, TRIAL_CONFIG, getTier, getTrialEndDate, isTrialExpired } from './productsV2';

// Initialize Stripe (use environment variable)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Stripe Price IDs (set these after creating products in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  trial: process.env.STRIPE_TRIAL_PRICE_ID || '',
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
  complete: process.env.STRIPE_COMPLETE_PRICE_ID || '',
};

/**
 * Create a $1 trial checkout session
 */
export async function createTrialCheckout(
  userId: number,
  email: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'DisputeStrike Credit Analysis',
            description: '7-day trial - See your real credit data + AI recommendations',
          },
          unit_amount: TRIAL_CONFIG.price,  // $1.00
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      type: 'trial',
    },
    // Setup for future subscription
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Create a subscription checkout session (for upgrading from trial)
 */
export async function createSubscriptionCheckout(
  userId: number,
  email: string,
  tier: 'starter' | 'professional' | 'complete',
  stripeCustomerId: string | null,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const tierConfig = getTier(tier);
  if (!tierConfig) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const priceId = STRIPE_PRICE_IDS[tier];
  if (!priceId) {
    throw new Error(`Stripe Price ID not configured for tier: ${tier}`);
  }

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      type: 'subscription',
      tier: tier,
    },
  };

  // Use existing customer if available
  if (stripeCustomerId) {
    sessionConfig.customer = stripeCustomerId;
  } else {
    sessionConfig.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  stripeSubscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<void> {
  if (cancelAtPeriodEnd) {
    // Cancel at end of billing period
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    // Cancel immediately
    await stripe.subscriptions.cancel(stripeSubscriptionId);
  }
}

/**
 * Upgrade/downgrade subscription tier
 */
export async function changeTier(
  stripeSubscriptionId: string,
  newTier: 'starter' | 'professional' | 'complete'
): Promise<void> {
  const priceId = STRIPE_PRICE_IDS[newTier];
  if (!priceId) {
    throw new Error(`Stripe Price ID not configured for tier: ${newTier}`);
  }

  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const currentItemId = subscription.items.data[0]?.id;

  if (!currentItemId) {
    throw new Error('No subscription item found');
  }

  // Update to new price
  await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [
      {
        id: currentItemId,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Get subscription status from Stripe
 */
export async function getSubscriptionStatus(
  stripeSubscriptionId: string
): Promise<{
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}> {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  return {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

/**
 * Create or get Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  name?: string,
  existingCustomerId?: string
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer.id;
}

/**
 * Webhook handler for Stripe events
 */
export async function handleStripeWebhook(
  event: Stripe.Event,
  db: any  // Database instance
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.userId || '0');
      const type = session.metadata?.type;

      if (type === 'trial') {
        // $1 trial completed - activate trial
        const trialEndsAt = getTrialEndDate(new Date());
        await db.activateTrial(userId, session.customer as string, trialEndsAt);
      } else if (type === 'subscription') {
        // Subscription activated
        const tier = session.metadata?.tier as 'starter' | 'professional' | 'complete';
        await db.activateSubscription(
          userId,
          session.customer as string,
          session.subscription as string,
          tier
        );
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Update subscription status in database
      await db.updateSubscriptionStatus(customerId, subscription.status);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Mark subscription as canceled
      await db.cancelSubscription(customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      
      // Mark subscription as past_due
      await db.markSubscriptionPastDue(customerId);
      break;
    }
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
