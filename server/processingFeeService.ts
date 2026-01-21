/**
 * Processing Fee Service
 * 
 * Handles the $4.95 one-time processing fee for users who upload
 * their own credit reports instead of using the SmartCredit affiliate link.
 */

import Stripe from 'stripe';
import { db } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - processing fee service will not work');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

// Processing fee amount in cents
const PROCESSING_FEE_AMOUNT = 495; // $4.95

export interface CreateProcessingFeeSessionParams {
  userId: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface ProcessingFeeSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout session for the $4.95 processing fee
 */
export async function createProcessingFeeSession(
  params: CreateProcessingFeeSessionParams
): Promise<ProcessingFeeSessionResult> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const { userId, userEmail, successUrl, cancelUrl } = params;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Credit Report Processing Fee',
              description: 'One-time fee to cover AI analysis costs for your uploaded credit reports',
            },
            unit_amount: PROCESSING_FEE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&fee_paid=true`,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId: userId.toString(),
        type: 'processing_fee',
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session: no URL returned');
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating processing fee session:', error);
    throw error;
  }
}

/**
 * Verify and record a successful processing fee payment
 */
export async function verifyAndRecordProcessingFee(sessionId: string): Promise<boolean> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return false;
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId in session metadata');
      return false;
    }

    // Update user record to mark processing fee as paid
    await db.update(users)
      .set({
        processingFeePaid: true,
        processingFeeAmount: '4.95',
        processingFeePaidAt: new Date(),
        affiliateSource: 'direct_upload',
      })
      .where(eq(users.id, parseInt(userId)));

    return true;
  } catch (error) {
    console.error('Error verifying processing fee:', error);
    return false;
  }
}

/**
 * Check if a user has paid the processing fee or used affiliate link
 */
export async function canAccessAnalysis(userId: number): Promise<{ allowed: boolean; reason: string }> {
  try {
    const [user] = await db.select({
      processingFeePaid: users.processingFeePaid,
      affiliateSource: users.affiliateSource,
    })
    .from(users)
    .where(eq(users.id, userId));

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Allow if they used SmartCredit affiliate link
    if (user.affiliateSource === 'smartcredit' || user.affiliateSource === 'identityiq') {
      return { allowed: true, reason: 'Affiliate user' };
    }

    // Allow if they paid the processing fee
    if (user.processingFeePaid) {
      return { allowed: true, reason: 'Processing fee paid' };
    }

    return { allowed: false, reason: 'Payment required' };
  } catch (error) {
    console.error('Error checking analysis access:', error);
    return { allowed: false, reason: 'Error checking access' };
  }
}

/**
 * Track affiliate link click
 */
export async function trackAffiliateClick(userId: number, source: 'smartcredit' | 'identityiq'): Promise<void> {
  try {
    await db.update(users)
      .set({
        affiliateSource: source,
        affiliateClickedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
  }
}

export { PROCESSING_FEE_AMOUNT };
