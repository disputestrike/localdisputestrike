/**
 * Stripe Subscription Service
 * 
 * Handles complete subscription lifecycle:
 * - $1 trial with 7-day period
 * - Auto-billing after trial
 * - Immediate upgrades during trial
 * - Cancellations
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Plan pricing (in cents)
export const PLAN_PRICES = {
  diy: 4999, // $49.99
  complete: 7999, // $79.99
};

// Trial configuration
export const TRIAL_CONFIG = {
  price: 100, // $1.00
  days: 7,
};

/**
 * Create a subscription with 7-day trial
 * 
 * Flow:
 * 1. Customer pays $1 upfront
 * 2. Subscription created with 7-day trial
 * 3. After 7 days, Stripe auto-charges monthly fee
 * 4. Customer can upgrade immediately or cancel anytime
 */
export async function createTrialSubscription(params: {
  email: string;
  plan: 'diy' | 'complete';
  userId: number;
}): Promise<{
  clientSecret: string;
  subscriptionId: string;
  customerId: string;
}> {
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
  
  // Create subscription with trial
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `DisputeStrike ${plan === 'complete' ? 'Complete' : 'DIY'} Plan`,
            description: 'Credit monitoring and dispute automation',
          },
          unit_amount: PLAN_PRICES[plan],
          recurring: {
            interval: 'month',
          },
        },
      },
    ],
    trial_period_days: TRIAL_CONFIG.days,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
      payment_method_types: ['card'],
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      userId: userId.toString(),
      plan,
      type: 'trial',
    },
  });
  
  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
  
  // Create $1 setup fee
  const setupFee = await stripe.invoiceItems.create({
    customer: customer.id,
    amount: TRIAL_CONFIG.price,
    currency: 'usd',
    description: '7-day trial access fee',
  });
  
  // Create invoice for the $1 fee
  const trialInvoice = await stripe.invoices.create({
    customer: customer.id,
    auto_advance: true,
  });
  
  await stripe.invoices.finalizeInvoice(trialInvoice.id);
  
  return {
    clientSecret: paymentIntent.client_secret!,
    subscriptionId: subscription.id,
    customerId: customer.id,
  };
}

/**
 * Upgrade subscription immediately during trial
 * 
 * This ends the trial and starts billing immediately
 */
export async function upgradeTrialToSubscription(params: {
  subscriptionId: string;
  userId: number;
}): Promise<{
  success: boolean;
  subscription: Stripe.Subscription;
}> {
  const { subscriptionId } = params;
  
  // Update subscription to end trial immediately
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    trial_end: 'now',
    proration_behavior: 'none',
  });
  
  return {
    success: true,
    subscription,
  };
}

/**
 * Cancel subscription
 * 
 * Options:
 * - Immediate: Cancel right away
 * - At period end: Cancel at end of current billing period
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
    return {
      success: true,
      subscription,
    };
  } else {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return {
      success: true,
      subscription,
    };
  }
}

/**
 * Reactivate a canceled subscription (before it actually ends)
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
  
  return {
    success: true,
    subscription,
  };
}

/**
 * Change subscription plan (upgrade/downgrade)
 */
export async function changeSubscriptionPlan(params: {
  subscriptionId: string;
  newPlan: 'diy' | 'complete';
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
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: currentItemId,
        price_data: {
          currency: 'usd',
          product_data: {
            name: `DisputeStrike ${newPlan === 'complete' ? 'Complete' : 'DIY'} Plan`,
          },
          unit_amount: PLAN_PRICES[newPlan],
          recurring: {
            interval: 'month',
          },
        },
      },
    ],
    proration_behavior: 'create_prorations',
  });
  
  return {
    success: true,
    subscription: updatedSubscription,
  };
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
  onTrialStarted?: (data: { userId: number; customerId: string; subscriptionId: string }) => Promise<void>;
  onSubscriptionActivated?: (data: { userId: number; customerId: string; subscriptionId: string }) => Promise<void>;
  onSubscriptionCanceled?: (data: { userId: number; subscriptionId: string }) => Promise<void>;
  onPaymentFailed?: (data: { userId: number; subscriptionId: string }) => Promise<void>;
}): Promise<void> {
  const { event, onTrialStarted, onSubscriptionActivated, onSubscriptionCanceled, onPaymentFailed } = params;
  
  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata.userId || '0');
      
      if (subscription.status === 'trialing' && onTrialStarted) {
        await onTrialStarted({
          userId,
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
        });
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata.userId || '0');
      
      // Trial ended and subscription became active
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
