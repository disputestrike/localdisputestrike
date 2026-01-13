/**
 * API Routes V2
 * 
 * New routes for:
 * - $1 Trial checkout
 * - Subscription management
 * - Round management
 * - AI recommendations
 * - Response upload
 * - Dashboard V2
 */

import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { createTrialCheckout, createSubscriptionCheckout, handleStripeWebhook, verifyWebhookSignature } from './subscriptionService';
import { getRoundStatus, startRound, markLettersGenerated, markRoundMailed, unlockRoundEarly, completeRound } from './roundLockingService';
import { selectItemsForRound, saveRecommendations, getRecommendations, estimateScoreIncrease, estimateInterestSavings } from './aiSelectionService';
import { SUBSCRIPTION_TIERS, TRIAL_CONFIG, getTrialEndDate } from './productsV2';

const router = Router();

// ============================================
// TRIAL ROUTES
// ============================================

/**
 * Create $1 trial checkout
 */
router.post('/trial/create', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      fullName: z.string().min(2),
      dateOfBirth: z.string(),
      ssn: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      agreeToTerms: z.boolean(),
      authorizeCreditPull: z.boolean(),
    });

    const data = schema.parse(req.body);
    const db = req.app.locals.db;

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(db.schema.users.email, data.email),
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const [user] = await db.insert(db.schema.users).values({
      email: data.email,
      password: await hashPassword(data.password),
      fullName: data.fullName,
    }).returning();

    // Create user profile
    await db.insert(db.schema.userProfiles).values({
      userId: user.id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      ssn: encryptSSN(data.ssn),
      currentAddress: data.address,
      currentCity: data.city,
      currentState: data.state,
      currentZip: data.zipCode,
    });

    // Create trial subscription
    const trialEndsAt = getTrialEndDate(new Date());
    await db.insert(db.schema.subscriptionsV2).values({
      userId: user.id,
      tier: 'trial',
      status: 'trial',
      trialStartedAt: new Date(),
      trialEndsAt,
    });

    // Create trial conversion tracking
    await db.insert(db.schema.trialConversions).values({
      userId: user.id,
      trialStartedAt: new Date(),
      trialEndsAt,
    });

    // Create Stripe checkout session
    const { sessionId, url } = await createTrialCheckout(
      user.id,
      data.email,
      `${process.env.APP_URL}/trial-success`,
      `${process.env.APP_URL}/trial-checkout`
    );

    res.json({ checkoutUrl: url, sessionId });
  } catch (error: any) {
    console.error('Trial creation error:', error);
    res.status(400).json({ message: error.message || 'Failed to create trial' });
  }
});

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

/**
 * Create subscription checkout (upgrade from trial)
 */
router.post('/subscription/checkout', async (req, res) => {
  try {
    const schema = z.object({
      tier: z.enum(['starter', 'professional', 'complete']),
    });

    const { tier } = schema.parse(req.body);
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user and subscription
    const user = await db.query.users.findFirst({
      where: eq(db.schema.users.id, userId),
    });

    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    const { sessionId, url } = await createSubscriptionCheckout(
      userId,
      user.email,
      tier,
      subscription?.stripeCustomerId || null,
      `${process.env.APP_URL}/dashboard?upgraded=true`,
      `${process.env.APP_URL}/pricing`
    );

    res.json({ checkoutUrl: url, sessionId });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    res.status(400).json({ message: error.message || 'Failed to create checkout' });
  }
});

/**
 * Get subscription status
 */
router.get('/subscription/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json({
      tier: subscription.tier,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ROUND ROUTES
// ============================================

/**
 * Get round status
 */
router.get('/rounds/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const status = await getRoundStatus(db, userId, subscription.tier);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Start a new round
 */
router.post('/rounds/start', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    if (!subscription || subscription.status !== 'active') {
      return res.status(403).json({ message: 'Active subscription required' });
    }

    const result = await startRound(db, userId, subscription.tier);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Generate AI recommendations for the new round
    const previousRounds = await db.query.disputeRounds.findMany({
      where: eq(db.schema.disputeRounds.userId, userId),
    });

    const previouslyDisputedIds = previousRounds.flatMap((r: any) => 
      r.disputedItemIds ? JSON.parse(r.disputedItemIds) : []
    );

    const recommendations = await selectItemsForRound(
      db,
      userId,
      previousRounds.length + 1,
      previouslyDisputedIds
    );

    await saveRecommendations(db, userId, result.roundId!, recommendations);

    res.json({ 
      success: true, 
      roundId: result.roundId,
      recommendations: recommendations.filter(r => r.isRecommended),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Mark round as mailed
 */
router.post('/rounds/mark-mailed', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get current round
    const currentRound = await db.query.disputeRounds.findFirst({
      where: and(
        eq(db.schema.disputeRounds.userId, userId),
        eq(db.schema.disputeRounds.status, 'letters_generated')
      ),
      orderBy: desc(db.schema.disputeRounds.roundNumber),
    });

    if (!currentRound) {
      return res.status(400).json({ message: 'No round ready to be mailed' });
    }

    const { lockedUntil } = await markRoundMailed(db, currentRound.id);

    res.json({ 
      success: true, 
      lockedUntil: lockedUntil.toISOString(),
      message: `Round ${currentRound.roundNumber} marked as mailed. Next round unlocks on ${lockedUntil.toLocaleDateString()}.`
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// RECOMMENDATIONS ROUTES
// ============================================

/**
 * Get AI recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const recommendations = await getRecommendations(db, userId);

    // Get account details for recommendations
    const accountIds = recommendations.map(r => r.accountId);
    const accounts = await db.query.negativeAccounts.findMany({
      where: inArray(db.schema.negativeAccounts.id, accountIds),
    });

    const enrichedRecommendations = recommendations.map(rec => {
      const account = accounts.find((a: any) => a.id === rec.accountId);
      return {
        ...rec,
        accountName: account?.accountName,
        accountType: account?.accountType,
        balance: account?.balance,
        bureau: account?.bureau,
      };
    });

    res.json(enrichedRecommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// RESPONSE UPLOAD ROUTES
// ============================================

/**
 * Upload and analyze bureau response
 */
router.post('/responses/analyze', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Handle file upload (assuming multer middleware)
    const file = req.file;
    const { bureau, roundId } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file to storage
    const fileUrl = await uploadToStorage(file);

    // Create bureau response record
    const [response] = await db.insert(db.schema.bureauResponses).values({
      userId,
      roundId: parseInt(roundId),
      bureau,
      fileUrl,
      fileKey: file.filename,
      fileName: file.originalname,
      receivedDate: new Date(),
    }).returning();

    // TODO: Implement AI parsing of response letter
    // For now, return mock results
    const mockResults = {
      itemsDeleted: Math.floor(Math.random() * 3),
      itemsVerified: Math.floor(Math.random() * 2),
      itemsUpdated: Math.floor(Math.random() * 2),
      itemsNoResponse: Math.floor(Math.random() * 2),
      details: [],
    };

    // Update response with parsed results
    await db.update(db.schema.bureauResponses)
      .set({
        isParsed: true,
        parsedData: JSON.stringify(mockResults),
        itemsDeleted: mockResults.itemsDeleted,
        itemsVerified: mockResults.itemsVerified,
        itemsUpdated: mockResults.itemsUpdated,
      })
      .where(eq(db.schema.bureauResponses.id, response.id));

    res.json({ success: true, results: mockResults });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Complete response upload (unlock next round)
 */
router.post('/rounds/:roundId/complete-responses', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { roundId } = req.params;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Unlock round early
    await unlockRoundEarly(db, parseInt(roundId));

    // Calculate totals from all bureau responses
    const responses = await db.query.bureauResponses.findMany({
      where: eq(db.schema.bureauResponses.roundId, parseInt(roundId)),
    });

    const totals = responses.reduce((acc: any, r: any) => ({
      itemsDeleted: acc.itemsDeleted + (r.itemsDeleted || 0),
      itemsVerified: acc.itemsVerified + (r.itemsVerified || 0),
      itemsUpdated: acc.itemsUpdated + (r.itemsUpdated || 0),
      itemsNoResponse: acc.itemsNoResponse + 0,
    }), { itemsDeleted: 0, itemsVerified: 0, itemsUpdated: 0, itemsNoResponse: 0 });

    // Complete the round
    await completeRound(db, parseInt(roundId), totals);

    res.json({ 
      success: true, 
      message: 'Responses uploaded. Next round is now available.',
      totals,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// DASHBOARD V2 ROUTE
// ============================================

/**
 * Get dashboard data
 */
router.get('/dashboard/v2', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(db.schema.users.id, userId),
    });

    // Get subscription
    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    // Get monitoring account (for scores)
    const monitoring = await db.query.monitoringAccounts.findFirst({
      where: eq(db.schema.monitoringAccounts.userId, userId),
    });

    // Get negative items
    const negativeItems = await db.query.negativeAccounts.findMany({
      where: eq(db.schema.negativeAccounts.userId, userId),
    });

    // Get round status
    const roundStatus = await getRoundStatus(db, userId, subscription?.tier || 'trial');

    // Get recommendations
    const recommendations = await getRecommendations(db, userId);

    // Enrich recommendations with account data
    const enrichedRecommendations = recommendations.map(rec => {
      const account = negativeItems.find((a: any) => a.id === rec.accountId);
      return {
        ...rec,
        accountName: account?.accountName,
        accountType: account?.accountType,
        balance: account?.balance,
        bureau: account?.bureau,
      };
    });

    // Get current round letters
    const currentRound = await db.query.disputeRounds.findFirst({
      where: eq(db.schema.disputeRounds.userId, userId),
      orderBy: desc(db.schema.disputeRounds.roundNumber),
    });

    let currentRoundLetters = [];
    if (currentRound) {
      currentRoundLetters = await db.query.disputeLetters.findMany({
        where: eq(db.schema.disputeLetters.roundId, currentRound.id),
      });
    }

    // Calculate stats
    const disputed = negativeItems.filter((i: any) => i.status === 'disputed').length;
    const deleted = negativeItems.filter((i: any) => i.status === 'deleted').length;
    const pending = negativeItems.filter((i: any) => i.status === 'pending').length;

    res.json({
      user: {
        name: user.fullName,
        email: user.email,
        tier: subscription?.tier || 'trial',
        subscriptionStatus: subscription?.status || 'none',
        trialEndsAt: subscription?.trialEndsAt,
      },
      scores: {
        transunion: monitoring?.transunionScore || 0,
        equifax: monitoring?.equifaxScore || 0,
        experian: monitoring?.experianScore || 0,
      },
      negativeItems: {
        total: negativeItems.length,
        disputed,
        deleted,
        pending,
      },
      roundStatus,
      recommendations: enrichedRecommendations,
      currentRoundLetters,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// CREDIT ANALYSIS ROUTE (for trial users)
// ============================================

/**
 * Get credit analysis (trial view)
 */
router.get('/credit/analysis', async (req, res) => {
  try {
    const userId = req.user?.id;
    const db = req.app.locals.db;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get subscription
    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    // Get monitoring account (for scores)
    const monitoring = await db.query.monitoringAccounts.findFirst({
      where: eq(db.schema.monitoringAccounts.userId, userId),
    });

    // Get negative items
    const negativeItems = await db.query.negativeAccounts.findMany({
      where: eq(db.schema.negativeAccounts.userId, userId),
    });

    // Generate recommendations if not exists
    let recommendations = await getRecommendations(db, userId);
    
    if (recommendations.length === 0 && negativeItems.length > 0) {
      recommendations = await selectItemsForRound(db, userId, 1, []);
      await saveRecommendations(db, userId, 0, recommendations);
    }

    // Enrich with account data
    const enrichedItems = negativeItems.map((item: any) => {
      const rec = recommendations.find(r => r.accountId === item.id);
      return {
        id: item.id,
        accountName: item.accountName,
        accountType: item.accountType,
        balance: item.balance,
        bureau: item.bureau,
        status: item.status,
        dateOpened: item.dateOpened,
        lastActivity: item.lastActivity,
        isRecommended: rec?.isRecommended || false,
        winProbability: rec?.winProbability || 30,
        recommendationReason: rec?.recommendationReason || 'Standard dispute potential',
        hasConflicts: (rec?.methodsTriggered?.length || 0) > 0,
      };
    });

    // Calculate estimates
    const avgScore = Math.round(
      ((monitoring?.transunionScore || 0) + 
       (monitoring?.equifaxScore || 0) + 
       (monitoring?.experianScore || 0)) / 3
    );
    
    const estimatedIncrease = estimateScoreIncrease(recommendations);
    const estimatedSavings = estimateInterestSavings(avgScore, estimatedIncrease);

    res.json({
      scores: [
        { bureau: 'TransUnion', score: monitoring?.transunionScore || 0 },
        { bureau: 'Equifax', score: monitoring?.equifaxScore || 0 },
        { bureau: 'Experian', score: monitoring?.experianScore || 0 },
      ],
      negativeItems: enrichedItems,
      totalNegativeItems: negativeItems.length,
      estimatedScoreIncrease: estimatedIncrease,
      estimatedInterestSavings: estimatedSavings,
      trialEndsAt: subscription?.trialEndsAt,
      subscription: {
        status: subscription?.status || 'none',
        tier: subscription?.tier || 'none',
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// STRIPE WEBHOOK
// ============================================

router.post('/webhooks/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    const event = verifyWebhookSignature(req.body, signature, webhookSecret);
    await handleStripeWebhook(event, req.app.locals.db);
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Helper functions (implement these based on your setup)
async function hashPassword(password: string): Promise<string> {
  // Use bcrypt or similar
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 10);
}

function encryptSSN(ssn: string): string {
  // Implement proper encryption
  // For now, just mask it
  return ssn.replace(/\d(?=\d{4})/g, '*');
}

async function uploadToStorage(file: any): Promise<string> {
  // Implement S3 or similar upload
  return `/uploads/${file.filename}`;
}

export default router;
