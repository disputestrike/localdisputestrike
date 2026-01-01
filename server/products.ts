/**
 * Product and Pricing Configuration
 * Centralized product definitions for Stripe integration
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  features: string[];
  popular?: boolean;
}

export const PRODUCTS: Record<string, Product> = {
  diy_quick: {
    id: 'diy_quick',
    name: 'DIY Quick Start',
    description: 'Generate dispute letters for 1 bureau',
    price: 2900, // $29.00
    features: [
      'AI-generated dispute letters',
      '1 credit bureau',
      'Mailing instructions',
      'Tracking dashboard',
    ],
  },
  diy_complete: {
    id: 'diy_complete',
    name: 'DIY Complete Package',
    description: 'Full dispute package for all 3 bureaus',
    price: 7900, // $79.00
    features: [
      'AI-generated dispute letters',
      'All 3 credit bureaus',
      'Credit report parser',
      'AI chat assistant',
      'Mailing instructions',
      'Tracking dashboard',
      'Email delivery',
    ],
    popular: true,
  },
  white_glove: {
    id: 'white_glove',
    name: 'White Glove Service',
    description: 'Premium service with expert review',
    price: 19900, // $199.00
    features: [
      'Everything in Complete Package',
      'Expert letter review',
      'Priority support',
      'Custom strategy consultation',
      'Response analysis',
    ],
  },
  subscription_monthly: {
    id: 'subscription_monthly',
    name: 'Monthly Subscription',
    description: 'Unlimited letters, monthly billing',
    price: 3999, // $39.99/month
    features: [
      'Unlimited dispute letters',
      'All 3 credit bureaus',
      'Credit report parser',
      'AI chat assistant',
      'Priority support',
      'Cancel anytime',
    ],
  },
  subscription_annual: {
    id: 'subscription_annual',
    name: 'Annual Subscription',
    description: 'Best value - save 17%',
    price: 39900, // $399.00/year
    features: [
      'Everything in Monthly',
      'Save $80/year',
      'Exclusive features',
      'VIP support',
    ],
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
  return `$${(cents / 100).toFixed(2)}`;
}
