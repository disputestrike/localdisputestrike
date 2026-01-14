/**
 * Product and Pricing Configuration
 * LEGACY FILE - Use productsV2.ts for new development
 * 
 * This file is kept for backward compatibility with old checkout flow.
 * The new pricing model uses productsV2.ts with subscription tiers.
 * 
 * SINGLE SOURCE OF TRUTH:
 * - DIY: $49.99/month (after $1 trial)
 * - Complete: $79.99/month (after $1 trial)
 * - Agency: $497/$997/$1997 (separate pricing)
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  features: string[];
  popular?: boolean;
  isSubscription?: boolean;
}

export const PRODUCTS: Record<string, Product> = {
  // NEW SUBSCRIPTION MODEL (aligned with productsV2.ts)
  diy: {
    id: 'diy',
    name: 'DIY',
    description: 'Unlimited rounds + credit monitoring (You mail)',
    price: 4999, // $49.99/month
    features: [
      'Unlimited dispute rounds (30-day intervals)',
      '3-bureau credit monitoring (daily updates)',
      'AI analyzes & selects best items to dispute',
      'FCRA-compliant dispute letters',
      'Round 1-2-3 escalation strategy',
      'Dashboard tracking',
      'You print & mail yourself',
    ],
    isSubscription: true,
  },
  complete: {
    id: 'complete',
    name: 'Complete',
    description: 'Unlimited rounds + we mail + CFPB + Furnisher',
    price: 7999, // $79.99/month
    features: [
      'Unlimited dispute rounds (30-day intervals)',
      '3-bureau credit monitoring (daily updates)',
      'AI analyzes & selects best items to dispute',
      'FCRA-compliant dispute letters',
      'Round 1-2-3 escalation strategy',
      'Dashboard tracking',
      'We mail everything via certified mail',
      'One-click "Send Disputes"',
      'Real-time delivery tracking',
      'CFPB complaint generator',
      'Furnisher dispute letters',
      'Priority support',
    ],
    popular: true,
    isSubscription: true,
  },
  
  // LEGACY PRODUCTS (kept for backward compatibility, mapped to new tiers)
  diy_quick: {
    id: 'diy',
    name: 'DIY',
    description: 'Unlimited rounds + credit monitoring (You mail)',
    price: 4999, // $49.99/month - UPDATED from old $29
    features: [
      'Unlimited dispute rounds',
      '3-bureau credit monitoring',
      'AI dispute letter generation',
      'Dashboard tracking',
    ],
    isSubscription: true,
  },
  diy_complete: {
    id: 'complete',
    name: 'Complete',
    description: 'Full dispute package with white glove mailing',
    price: 7999, // $79.99/month
    features: [
      'Everything in DIY',
      'We mail everything via certified mail',
      'CFPB complaint generator',
      'Furnisher dispute letters',
    ],
    popular: true,
    isSubscription: true,
  },
  white_glove: {
    id: 'complete',
    name: 'Complete',
    description: 'Premium service - mapped to Complete tier',
    price: 7999, // $79.99/month
    features: [
      'Everything in Complete',
      'Priority support',
    ],
    isSubscription: true,
  },
  subscription_monthly: {
    id: 'complete',
    name: 'Complete Monthly',
    description: 'Complete package, monthly billing',
    price: 7999, // $79.99/month
    features: [
      'Full Complete package',
      'Cancel anytime',
    ],
    isSubscription: true,
  },
  subscription_annual: {
    id: 'complete',
    name: 'Complete Annual',
    description: 'Complete package, annual billing (save 17%)',
    price: 79900, // $799.00/year (equivalent to ~$66.58/month)
    features: [
      'Full Complete package',
      'Save 17% vs monthly',
    ],
    isSubscription: true,
  },
};

/**
 * Get product by ID
 */
export function getProduct(id: string): Product | undefined {
  return PRODUCTS[id];
}

/**
 * Get all products as array
 */
export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}
