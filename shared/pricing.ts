/**
 * SINGLE SOURCE OF TRUTH FOR ALL PRICING
 * 
 * This file contains all pricing constants for DisputeStrike.
 * ALL pricing references across the codebase should import from here.
 * 
 * Last Updated: January 2026
 */

// ============================================
// CONSUMER PRICING (Monthly Subscriptions)
// ============================================

export const CONSUMER_PRICING = {
  // Trial
  TRIAL_PRICE: 100, // $1.00 in cents
  TRIAL_DURATION_DAYS: 7,
  
  // DIY Plan
  DIY: {
    id: 'diy',
    name: 'DIY',
    monthlyPrice: 4999, // $49.99 in cents
    description: 'Unlimited rounds + credit monitoring (You mail)',
    features: [
      'Unlimited dispute rounds (30-day intervals)',
      '3-bureau credit monitoring (daily updates)',
      'AI analyzes & selects best items to dispute',
      'FCRA-compliant dispute letters',
      'Round 1-2-3 escalation strategy',
      'Dashboard tracking',
      'You print & mail yourself',
    ],
    includesMonitoring: true,
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesFurnisher: false,
  },
  
  // Complete Plan
  COMPLETE: {
    id: 'complete',
    name: 'Complete',
    monthlyPrice: 7999, // $79.99 in cents
    description: 'Unlimited rounds + we mail + CFPB + Furnisher',
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
    includesMonitoring: true,
    includesWhiteGloveMailing: true,
    includesCFPB: true,
    includesFurnisher: true,
    popular: true,
  },
};

// ============================================
// AGENCY PRICING (One-time or Annual)
// ============================================

export const AGENCY_PRICING = {
  STARTER: {
    id: 'agency_starter',
    name: 'Agency Starter',
    price: 49700, // $497 in cents
    description: 'For new agencies starting out',
    clientLimit: 25,
    features: [
      'Up to 25 active clients',
      'White-label dashboard',
      'Client management portal',
      'Dispute letter generation',
      'Basic analytics',
    ],
  },
  
  PROFESSIONAL: {
    id: 'agency_professional',
    name: 'Agency Professional',
    price: 99700, // $997 in cents
    description: 'For growing agencies',
    clientLimit: 100,
    features: [
      'Up to 100 active clients',
      'Everything in Starter',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    popular: true,
  },
  
  ENTERPRISE: {
    id: 'agency_enterprise',
    name: 'Agency Enterprise',
    price: 199700, // $1997 in cents
    description: 'For established agencies',
    clientLimit: -1, // Unlimited
    features: [
      'Unlimited clients',
      'Everything in Professional',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'White-glove onboarding',
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format price in cents to display string
 */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format price without cents for whole numbers
 */
export function formatPriceShort(cents: number): string {
  const dollars = cents / 100;
  if (dollars % 1 === 0) {
    return `$${dollars.toFixed(0)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

/**
 * Get consumer tier by ID
 */
export function getConsumerTier(id: 'diy' | 'complete') {
  return id === 'diy' ? CONSUMER_PRICING.DIY : CONSUMER_PRICING.COMPLETE;
}

/**
 * Get agency tier by ID
 */
export function getAgencyTier(id: 'agency_starter' | 'agency_professional' | 'agency_enterprise') {
  switch (id) {
    case 'agency_starter': return AGENCY_PRICING.STARTER;
    case 'agency_professional': return AGENCY_PRICING.PROFESSIONAL;
    case 'agency_enterprise': return AGENCY_PRICING.ENTERPRISE;
    default: return null;
  }
}

// ============================================
// DISPLAY STRINGS (for UI)
// ============================================

export const PRICING_DISPLAY = {
  DIY_MONTHLY: '$49.99/month',
  COMPLETE_MONTHLY: '$79.99/month',
  TRIAL: '$1 for 7 days',
  
  AGENCY_STARTER: '$497',
  AGENCY_PROFESSIONAL: '$997',
  AGENCY_ENTERPRISE: '$1,997',
};
