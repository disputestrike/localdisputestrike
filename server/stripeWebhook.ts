/**
 * Stripe Webhook Handler
 * Processes Stripe events for payment confirmation
 */

import { Router } from 'express';
import Stripe from 'stripe';
import * as db from './db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export const stripeWebhookRouter = Router();

// CRITICAL: This route MUST use express.raw() to preserve the raw body for signature verification
stripeWebhookRouter.post('/webhook', async (req, res) => {
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
