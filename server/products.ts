/**
 * Product and Pricing Configuration
 * LEGACY FILE - Use productsV2.ts for new development
 * 
 * This file is kept for backward compatibility with old checkout flow.
 * The new pricing model uses productsV2.ts with subscription tiers.
 * 
 * SOURCE BIBLE v2.0 Jan 2026:
 * - Essential: $79.99/month
 * - Complete: $129.99/month
 * - Agency: $497 / $997 / $1,997 (separate pricing)
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
  essential: {
    id: 'essential',
    name: 'Essential',
    description: 'Everything you need to fix your credit (You mail)',
    price: 7999, // $79.99/month (SOURCE BIBLE v2.0 Jan 2026)
    features: [
      'Upload reports from anywhere',
      'Full AI violation analysis',
      'Unlimited dispute letter generation',
      'Download letters as PDF',
      'Round 2 & 3 escalation strategies',
      'Progress tracking dashboard',
      'You print & mail yourself',
    ],
    isSubscription: true,
  },
  complete: {
    id: 'complete',
    name: 'Complete',
    description: 'We mail everything for you',
    price: 12999, // $129.99/month (SOURCE BIBLE v2.0 Jan 2026)
    features: [
      'Everything in Essential',
      'Automated certified mailing',
      'One-click dispute sending',
      'USPS certified mail tracking',
      'Automatic 30-day follow-ups',
      '5 mailings/month included',
      'Additional mailings: $6.99 each',
      'CFPB complaint generator',
      'Priority support',
    ],
    popular: true,
    isSubscription: true,
  },
  
  // LEGACY PRODUCTS (kept for backward compatibility, mapped to new tiers)
  diy: {
    id: 'essential',
    name: 'Essential',
    description: 'Everything you need to fix your credit (You mail)',
    price: 7999, // $79.99/month (SOURCE BIBLE v2.0 Jan 2026)
    features: [
      'Upload reports from anywhere',
      'Full AI violation analysis',
      'Unlimited dispute letter generation',
      'Download letters as PDF',
    ],
    isSubscription: true,
  },
  diy_quick: {
    id: 'essential',
    name: 'Essential',
    description: 'Everything you need to fix your credit (You mail)',
    price: 7999, // $79.99/month (SOURCE BIBLE v2.0 Jan 2026)
    features: [
      'Unlimited dispute rounds',
      'Full AI analysis',
      'AI dispute letter generation',
      'Dashboard tracking',
    ],
    isSubscription: true,
  },
  diy_complete: {
    id: 'complete',
    name: 'Complete',
    description: 'We mail everything for you',
    price: 12999, // $129.99/month (SOURCE BIBLE v2.0 Jan 2026)
    features: [
      'Everything in Essential',
      'We mail everything via certified mail',
      'CFPB complaint generator',
      'Priority support',
    ],
    popular: true,
    isSubscription: true,
  },
  white_glove: {
    id: 'complete',
    name: 'Complete',
    description: 'Premium service - mapped to Complete tier',
    price: 12999, // $129.99/month
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
    price: 12999, // $129.99/month
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
    price: 129900, // $1,299.00/year (equivalent to ~$108.25/month)
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
