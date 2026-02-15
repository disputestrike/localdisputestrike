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
 * - Lob Mailing & Letter Approval
 */

import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { createTrialCheckout, createSubscriptionCheckout } from './subscriptionService';
import { getRoundStatus, startRound, markRoundMailed, unlockRoundEarly, completeRound } from './roundLockingService';
import { getRecommendedAccountIdsForRound1 } from './disputeStrategy';
import { SUBSCRIPTION_TIERS, TRIAL_CONFIG, getTrialEndDate } from './productsV2';
import { sendCertifiedLetter, BUREAU_ADDRESSES } from './lobService';
import { createPaymentIntent } from './stripeService';

const router = Router();

// ============================================
// PAYMENT ROUTES
// ============================================

/**
 * POST /api/v2/payment/create-intent
 * Create a Stripe payment intent for $1 trial
 */
router.post('/payment/create-intent', async (req, res) => {
  try {
    const trialPriceCents = parseInt(process.env.TRIAL_PRICE_CENTS || '100');
    
    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      amount: trialPriceCents,
      currency: 'usd',
      metadata: {
        type: 'trial',
      },
    });

    res.json({ 
      clientSecret,
      paymentIntentId,
      amount: trialPriceCents,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create payment intent',
    });
  }
});

// ============================================
// TRIAL ROUTES
// ============================================

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

    const existingUser = await db.query.users.findFirst({
      where: eq(db.schema.users.email, data.email),
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const [user] = await db.insert(db.schema.users).values({
      email: data.email,
      name: data.fullName,
      openId: `email|${data.email}`, // Generate a unique openId for email-based users
      loginMethod: 'email',
    }).returning();

    const trialEndsAt = getTrialEndDate(new Date());
    await db.insert(db.schema.subscriptionsV2).values({
      userId: user.id,
      tier: 'trial',
      status: 'trial',
      trialStartedAt: new Date(),
      trialEndsAt,
    });

    const { url } = await createTrialCheckout(
      user.id,
      data.email,
      `${process.env.APP_URL}/trial-success`,
      `${process.env.APP_URL}/trial-checkout`
    );

    res.json({ checkoutUrl: url });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create trial' });
  }
});

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

router.post('/subscription/checkout', async (req, res) => {
  try {
    const schema = z.object({
      tier: z.enum(['diy', 'complete']),
    });

    const { tier } = schema.parse(req.body);
    const userId = (req as any).user?.id;
    const db = req.app.locals.db;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await db.query.users.findFirst({
      where: eq(db.schema.users.id, userId),
    });

    const subscription = await db.query.subscriptionsV2.findFirst({
      where: eq(db.schema.subscriptionsV2.userId, userId),
    });

    const { url } = await createSubscriptionCheckout(
      userId,
      user.email,
      tier,
      subscription?.stripeCustomerId || null,
      `${process.env.APP_URL}/dashboard?upgraded=true`,
      `${process.env.APP_URL}/pricing`
    );

    res.json({ checkoutUrl: url });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create checkout' });
  }
});

// ============================================
// LOB MAILING & APPROVAL ROUTES
// ============================================

/**
 * GET /api/v2/letters/preview
 * Get letters for approval before mailing
 */
router.get("/letters/preview", async (req, res) => {
  const userId = (req as any).user?.id;
  const db = req.app.locals.db;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await db.query.users.findFirst({ where: eq(db.schema.users.id, userId) });
  const accountIds = await getRecommendedAccountIdsForRound1(userId);
  
  const accounts = accountIds.length > 0 ? await db.query.negativeAccounts.findMany({
    where: inArray(db.schema.negativeAccounts.id, accountIds),
  }) : [];

  const letters = ['transunion', 'equifax', 'experian'].map(bureau => ({
    bureau,
    recipient: BUREAU_ADDRESSES[bureau as keyof typeof BUREAU_ADDRESSES],
    content: `
      <h1>Dispute Letter - ${bureau.toUpperCase()}</h1>
      <p>To Whom It May Concern,</p>
      <p>I am writing to dispute the following items on my credit report...</p>
      <ul>
        ${accounts.filter((a: any) => a.bureau === bureau).map((a: any) => `<li>${a.accountName} - ${a.accountNumber}</li>`).join('')}
      </ul>
      <p>Sincerely,<br/>${user.fullName}</p>
    `
  }));

  res.json({ letters });
});

/**
 * POST /api/v2/letters/send
 * Approve and send letters via Lob (Complete tier only)
 */
router.post("/letters/send", async (req, res) => {
  const userId = (req as any).user?.id;
  const db = req.app.locals.db;
  const { approvedBureaus } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const sub = await db.query.subscriptionsV2.findFirst({
    where: and(eq(db.schema.subscriptionsV2.userId, userId), eq(db.schema.subscriptionsV2.status, 'active'))
  });

  if (!sub || sub.tier !== 'complete') {
    return res.status(403).json({ error: "Mailing is only available on the Complete plan" });
  }

  const user = await db.query.users.findFirst({ where: eq(db.schema.users.id, userId) });
  const profile = await db.query.userProfiles.findFirst({ where: eq(db.schema.userProfiles.userId, userId) });
  const roundStatus = await getRoundStatus(db, userId, 'complete');

  const results = [];
  for (const bureau of approvedBureaus) {
    const result = await sendCertifiedLetter({
      userId,
      roundId: roundStatus.currentRound,
      bureau: bureau as any,
      to: BUREAU_ADDRESSES[bureau as keyof typeof BUREAU_ADDRESSES],
      from: {
        name: user.fullName,
        address_line1: profile?.currentAddress || '',
        address_city: profile?.currentCity || '',
        address_state: profile?.currentState || '',
        address_zip: profile?.currentZip || '',
        address_country: 'US'
      },
      htmlContent: `<h1>Dispute Letter</h1><p>Content for ${bureau}...</p>`
    });
    results.push({ bureau, ...result });
  }

  await markRoundMailed(db, roundStatus.roundId!);

  res.json({ success: true, results });
});

/**
 * GET /api/v2/mailings
 * Get mailing history and tracking
 */
router.get("/mailings", async (req, res) => {
  const userId = (req as any).user?.id;
  const db = req.app.locals.db;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const history = await db.select().from(db.schema.mailings)
    .where(eq(db.schema.mailings.userId, userId))
    .orderBy(desc(db.schema.mailings.sentAt));

  res.json({ history });
});

export default router;
