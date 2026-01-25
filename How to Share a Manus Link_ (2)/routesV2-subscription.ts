/**
 * Subscription Routes V2
 * 
 * Handles trial creation, upgrades, and cancellations
 */

import express from 'express';
import { z } from 'zod';
import * as db from './db';
import {
  createTrialSubscription,
  upgradeTrialToSubscription,
  cancelSubscription,
  reactivateSubscription,
  changeSubscriptionPlan,
  getSubscriptionDetails,
  createCustomerPortalSession,
} from './stripeSubscriptionService';

const router = express.Router();

/**
 * POST /api/v2/subscription/create-trial
 * Create a new trial subscription
 */
router.post('/subscription/create-trial', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      plan: z.enum(['diy', 'complete']),
    });
    
    const data = schema.parse(req.body);
    
    // Create user account
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    // Check if user already exists
    const existingUser = await dbInstance.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create user
    const [userResult] = await dbInstance.insert(db.schema.users).values({
      email: data.email,
      password: data.password, // Should be hashed in production
      role: 'user',
    }).returning();
    
    const user = userResult;
    
    // Create Stripe subscription with trial
    const { clientSecret, subscriptionId, customerId } = await createTrialSubscription({
      email: data.email,
      plan: data.plan,
      userId: user.id,
    });
    
    // Create subscription record in database
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    await dbInstance.insert(db.schema.subscriptionsV2).values({
      userId: user.id,
      tier: data.plan,
      status: 'trial',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      trialStartedAt: new Date(),
      trialEndsAt,
    });
    
    // Create trial conversion tracking
    await dbInstance.insert(db.schema.trialConversions).values({
      userId: user.id,
      trialStartedAt: new Date(),
      converted: false,
    });
    
    res.json({
      clientSecret,
      subscriptionId,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Error creating trial:', error);
    res.status(400).json({ message: error.message || 'Failed to create trial' });
  }
});

/**
 * POST /api/v2/subscription/upgrade
 * Upgrade from trial to paid subscription immediately
 */
router.post('/subscription/upgrade', async (req, res) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    // Get user's subscription
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    if (subscription.status !== 'trial') {
      return res.status(400).json({ message: 'Subscription is not in trial status' });
    }
    
    // Upgrade in Stripe
    const { success, subscription: stripeSubscription } = await upgradeTrialToSubscription({
      subscriptionId: subscription.stripeSubscriptionId!,
      userId,
    });
    
    if (success) {
      // Update database
      await dbInstance.update(db.schema.subscriptionsV2)
        .set({
          status: 'active',
          trialEndsAt: null,
        })
        .where((subs, { eq }) => eq(subs.id, subscription.id));
      
      // Mark trial as converted
      await dbInstance.update(db.schema.trialConversions)
        .set({
          converted: true,
          convertedAt: new Date(),
        })
        .where((trials, { eq }) => eq(trials.userId, userId));
      
      res.json({
        success: true,
        message: 'Subscription upgraded successfully',
      });
    }
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    res.status(400).json({ message: error.message || 'Failed to upgrade subscription' });
  }
});

/**
 * POST /api/v2/subscription/cancel
 * Cancel subscription
 */
router.post('/subscription/cancel', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const schema = z.object({
      immediate: z.boolean().optional().default(false),
    });
    
    const data = schema.parse(req.body);
    
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    // Cancel in Stripe
    const { success } = await cancelSubscription({
      subscriptionId: subscription.stripeSubscriptionId,
      immediate: data.immediate,
    });
    
    if (success) {
      // Update database
      await dbInstance.update(db.schema.subscriptionsV2)
        .set({
          status: data.immediate ? 'canceled' : 'canceling',
        })
        .where((subs, { eq }) => eq(subs.id, subscription.id));
      
      res.json({
        success: true,
        message: data.immediate 
          ? 'Subscription canceled immediately' 
          : 'Subscription will cancel at end of billing period',
      });
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(400).json({ message: error.message || 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/v2/subscription/reactivate
 * Reactivate a canceled subscription
 */
router.post('/subscription/reactivate', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    const { success } = await reactivateSubscription({
      subscriptionId: subscription.stripeSubscriptionId,
    });
    
    if (success) {
      await dbInstance.update(db.schema.subscriptionsV2)
        .set({
          status: 'active',
        })
        .where((subs, { eq }) => eq(subs.id, subscription.id));
      
      res.json({
        success: true,
        message: 'Subscription reactivated successfully',
      });
    }
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    res.status(400).json({ message: error.message || 'Failed to reactivate subscription' });
  }
});

/**
 * POST /api/v2/subscription/change-plan
 * Change subscription plan (upgrade/downgrade)
 */
router.post('/subscription/change-plan', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const schema = z.object({
      newPlan: z.enum(['diy', 'complete']),
    });
    
    const data = schema.parse(req.body);
    
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    const { success } = await changeSubscriptionPlan({
      subscriptionId: subscription.stripeSubscriptionId,
      newPlan: data.newPlan,
    });
    
    if (success) {
      await dbInstance.update(db.schema.subscriptionsV2)
        .set({
          tier: data.newPlan,
        })
        .where((subs, { eq }) => eq(subs.id, subscription.id));
      
      res.json({
        success: true,
        message: 'Plan changed successfully',
      });
    }
  } catch (error: any) {
    console.error('Error changing plan:', error);
    res.status(400).json({ message: error.message || 'Failed to change plan' });
  }
});

/**
 * GET /api/v2/subscription/details
 * Get subscription details
 */
router.get('/subscription/details', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    // Get details from Stripe if subscription ID exists
    let stripeDetails = null;
    if (subscription.stripeSubscriptionId) {
      stripeDetails = await getSubscriptionDetails({
        subscriptionId: subscription.stripeSubscriptionId,
      });
    }
    
    res.json({
      subscription: {
        ...subscription,
        stripe: stripeDetails,
      },
    });
  } catch (error: any) {
    console.error('Error getting subscription details:', error);
    res.status(400).json({ message: error.message || 'Failed to get subscription details' });
  }
});

/**
 * POST /api/v2/subscription/portal
 * Get Stripe customer portal URL
 */
router.post('/subscription/portal', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    const subscription = await dbInstance.query.subscriptionsV2.findFirst({
      where: (subs, { eq }) => eq(subs.userId, userId),
    });
    
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    const portalUrl = await createCustomerPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${process.env.APP_URL}/dashboard`,
    });
    
    res.json({
      url: portalUrl,
    });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    res.status(400).json({ message: error.message || 'Failed to create portal session' });
  }
});

export default router;
