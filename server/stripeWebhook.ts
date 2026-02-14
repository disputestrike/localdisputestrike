/**
 * Stripe Webhook Handler
 * Processes Stripe events for payment confirmation
 */

import { Router } from 'express';
import Stripe from 'stripe';
import * as db from './db';

const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
  : null;

export const stripeWebhookRouter = Router();

// CRITICAL: This route MUST use express.raw() to preserve the raw body for signature verification
stripeWebhookRouter.post('/webhook', async (req, res) => {
  if (!stripe) {
    console.warn('[Stripe Webhook] Stripe not configured (missing STRIPE_SECRET_KEY)');
    return res.status(503).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Stripe Webhook] Missing signature');
    return res.status(400).send('Missing signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // CRITICAL: Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Stripe Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  console.log('[Stripe Webhook] Event received:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.billing_reason === 'subscription_create') {
          await handleInvoicePaidForSubscription(invoice);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe Webhook] Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe Webhook] Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Stripe Webhook] Checkout completed:', session.id);

  const userId = session.client_reference_id;
  const userEmail = session.metadata?.customer_email || session.customer_email;
  const userName = session.metadata?.customer_name;
  const tier = session.metadata?.tier;

  if (!userId) {
    console.error('[Stripe Webhook] Missing user ID in session');
    return;
  }

  // Update payment record in database
  try {
    // Find payment by Stripe session ID or create new one
    const amount = ((session.amount_total || 0) / 100).toFixed(2);
    
    await db.createPayment({
      userId: parseInt(userId),
      amount,
      tier: (tier as any) || 'diy_quick',
      stripePaymentId: session.payment_intent as string || session.id,
      status: 'completed',
    });

    console.log('[Stripe Webhook] Payment recorded for user:', userId);

    // Send confirmation email
    if (userEmail && userName) {
      const { sendPaymentConfirmationEmail } = await import('./emailService');
      await sendPaymentConfirmationEmail(userEmail, userName, amount, tier || 'unknown');
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error updating payment:', error);
  }
}

/**
 * Handle invoice.paid for embedded checkout subscriptions - records payment & subscription
 */
async function handleInvoicePaidForSubscription(invoice: Stripe.Invoice) {
  if (!stripe || !invoice.subscription) return;
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
  try {
    const sub = await stripe.subscriptions.retrieve(subId);
    const userId = sub.metadata?.user_id || sub.metadata?.userId;
    const tier = (sub.metadata?.tier || 'complete') as 'essential' | 'complete';
    if (!userId) {
      console.warn('[Stripe Webhook] invoice.paid: no user_id in subscription metadata');
      return;
    }
    const uid = parseInt(userId, 10);
    const amountUsd = (invoice.amount_paid || 0) / 100;
    const paymentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id || invoice.id;
    await db.recordPaymentAndSubscriptionForCheckout({
      userId: uid,
      tier,
      amountUsd,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripePaymentId: paymentId,
    });
    console.log('[Stripe Webhook] Recorded payment & subscription for user:', uid);
  } catch (err: any) {
    console.error('[Stripe Webhook] handleInvoicePaidForSubscription error:', err?.message);
  }
}
