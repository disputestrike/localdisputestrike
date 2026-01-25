import Stripe from 'stripe';

const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a Stripe payment intent for the $1 trial
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<CreatePaymentIntentResult> {
  if (!stripe) throw new Error('Stripe not configured (STRIPE_SECRET_KEY missing)');
  try {
    const { amount, currency = 'usd', metadata = {} } = params;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Failed to create payment intent: no client secret returned');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Verify a payment intent was successful
 */
export async function verifyPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    return false;
  }
}

/**
 * Create a customer in Stripe
 */
export async function createCustomer(email: string, name?: string): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

export { stripe };
