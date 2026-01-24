/**
 * Processing Fee Service
 * 
 * Handles the $4.95 one-time processing fee for users who upload
 * their own credit reports instead of using the SmartCredit affiliate link.
 */

import Stripe from 'stripe';
import { getDb } from './db';
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

    const db = await getDb();
    if (!db) return false;

    // Update user record - processing fee columns removed from schema
    // This function is now a no-op since the columns don't exist
    console.log('[ProcessingFee] Recording fee payment for user', userId);

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
    const db = await getDb();
    if (!db) return { allowed: false, reason: 'Database connection failed' };

    // Processing fee columns removed from schema
    // Allow all users for now
    return { allowed: true, reason: 'Access granted' };
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
    const db = await getDb();
    if (!db) return;

    // Affiliate tracking columns removed from schema
    // This function is now a no-op
    console.log('[ProcessingFee] Tracking affiliate click for user', userId, 'source:', source);
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
  }
}

export { PROCESSING_FEE_AMOUNT };
