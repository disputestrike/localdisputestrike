import express from 'express';
import Stripe from 'stripe';
import { db } from './db/index'; // Assuming db is exported from here
import { eq } from 'drizzle-orm';
import { userSubscriptions } from './db/schema'; // Assuming schema is defined here

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret as string);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId) {
        console.error('User ID not found in checkout session metadata.');
        return res.status(400).send('User ID not found.');
      }

      // Retrieve the subscription to get current_period_end and status
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (event.type === 'checkout.session.completed') {
        // Create or update subscription in your database
        await db.insert(userSubscriptions).values({
          userId: userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status,
        }).onDuplicateKeyUpdate({
          set: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
          }
        });
        console.log(`[Stripe Webhook] Checkout session completed for user ${userId}. Subscription ID: ${subscription.id}`);
      } else if (event.type === 'customer.subscription.updated') {
        // Update subscription in your database
        await db.update(userSubscriptions)
          .set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
          })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        console.log(`[Stripe Webhook] Subscription updated for user ${userId}. Subscription ID: ${subscription.id}`);
      } else if (event.type === 'customer.subscription.deleted') {
        // Mark subscription as canceled in your database
        await db.update(userSubscriptions)
          .set({
            status: subscription.status,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        console.log(`[Stripe Webhook] Subscription deleted for user ${userId}. Subscription ID: ${subscription.id}`);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export { stripeWebhookRouter };
