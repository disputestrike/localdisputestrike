/**
 * SINGLE SOURCE OF TRUTH FOR ALL PRICING
 * 
 * This file contains all pricing constants for DisputeStrike.
 * ALL pricing references across the codebase should import from here.
 * 
 * Last Updated: January 2026
 * 
 * PRICING STRUCTURE:
 * - Free Preview: $0 (blurred results, no letters)
 * - Essential: $79.99/mo (full analysis, you mail)
 * - Complete: $129.99/mo (we mail for you, 5 letters/mo included)
 * 
 * SmartCredit: Optional for Essential, Required for Complete
 * - Billed separately by ConsumerDirect: $29.99/mo
 * - DisputeStrike margin: $14.39/mo
 */

// ============================================
// CONSUMER PRICING (Monthly Subscriptions)
// ============================================

export const CONSUMER_PRICING = {
  // Free Preview (Lead Magnet)
  FREE_PREVIEW: {
    id: 'free',
    name: 'Free Preview',
    monthlyPrice: 0,
    description: 'See how many violations you have',
    features: [
      'Upload credit reports from anywhere',
      'AI violation count analysis',
      'Category breakdown',
      'Deletion potential estimate',
      'Score increase estimate',
    ],
    limitations: [
      'Specific accounts blurred',
      'Cannot generate letters',
      'Cannot see violation details',
    ],
  },
  
  // Essential Plan (formerly DIY)
  ESSENTIAL: {
    id: 'essential',
    name: 'Essential',
    monthlyPrice: 7999, // $79.99 in cents
    description: 'Full analysis + unlimited letters (you mail)',
    features: [
      'Everything in Free Preview - UNBLURRED',
      'Full violation details',
      'Unlimited dispute letter generation',
      'Download letters as PDF',
      'Round 2 & 3 escalation strategies',
      'Progress tracking dashboard',
      'You print & mail yourself',
    ],
    includesMonitoring: false,
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesFurnisher: false,
    smartCreditOptional: true,
  },
  
  // Complete Plan
  COMPLETE: {
    id: 'complete',
    name: 'Complete',
    monthlyPrice: 12999, // $129.99 in cents
    description: 'We print & mail everything for you',
    features: [
      'Everything in Essential',
      'We print letters for you',
      'We mail via certified mail',
      'One-click sending',
      'USPS tracking',
      'Automatic 30-day follow-ups',
      '5 mailings/month included',
      'Extra mailings: $6.99 each',
      'Priority support',
    ],
    includesMonitoring: false,
    includesWhiteGloveMailing: true,
    includesCFPB: true,
    includesFurnisher: true,
    smartCreditRequired: true,
    includedMailings: 5,
    extraMailingPrice: 699, // $6.99 in cents
    popular: true,
  },
};

// ============================================
// SMARTCREDIT PRICING
// ============================================

export const SMARTCREDIT_PRICING = {
  customerPrice: 2999, // $29.99/mo (what customer pays to ConsumerDirect)
  disputeStrikeMargin: 1439, // $14.39/mo (DisputeStrike affiliate commission)
  affiliateId: '87529',
  affiliateLink: 'https://www.smartcredit.com/?PID=87529',
};

// ============================================
// AGENCY PRICING (Monthly Subscriptions)
// ============================================

export const AGENCY_PRICING = {
  STARTER: {
    id: 'agency_starter',
    name: 'Starter',
    price: 49700, // $497/mo in cents
    description: 'For new agencies starting out',
    clientLimit: 50,
    features: [
      'Up to 50 active clients',
      'White-label dashboard',
      'Client management portal',
      'Bulk letter generation',
      'Email support',
    ],
  },
  
  PROFESSIONAL: {
    id: 'agency_professional',
    name: 'Professional',
    price: 99700, // $997/mo in cents
    description: 'For growing agencies',
    clientLimit: 200,
    features: [
      'Up to 200 active clients',
      'Everything in Starter',
      'Priority support',
      'API access',
      'Custom branding',
    ],
    popular: true,
  },
  
  ENTERPRISE: {
    id: 'agency_enterprise',
    name: 'Enterprise',
    price: 199700, // $1,997/mo in cents
    description: 'For established agencies',
    clientLimit: 500,
    features: [
      'Up to 500 active clients',
      'Everything in Professional',
      'Dedicated support',
      'Full API access',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
};

// ============================================
// STRIPE PRICE IDS (TEST MODE)
// ============================================

export const STRIPE_PRICE_IDS = {
  essential: process.env.STRIPE_ESSENTIAL_PRICE_ID || 'price_1St92mJbDEkzZWwHpe7Ljb1h',
  complete: process.env.STRIPE_COMPLETE_PRICE_ID || 'price_1St9QKJbDEkzZWwHbzChpIVL',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

export function formatPriceShort(cents: number): string {
  const dollars = cents / 100;
  if (dollars % 1 === 0) {
    return `$${dollars.toFixed(0)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

export function getConsumerTier(id: 'free' | 'essential' | 'complete') {
  switch (id) {
    case 'free': return CONSUMER_PRICING.FREE_PREVIEW;
    case 'essential': return CONSUMER_PRICING.ESSENTIAL;
    case 'complete': return CONSUMER_PRICING.COMPLETE;
    default: return null;
  }
}

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
  FREE: 'Free',
  ESSENTIAL_MONTHLY: '$79.99/month',
  COMPLETE_MONTHLY: '$129.99/month',
  SMARTCREDIT_MONTHLY: '$29.99/month',
  
  // With SmartCredit totals
  ESSENTIAL_WITH_SMARTCREDIT: '$109.98/month',
  COMPLETE_WITH_SMARTCREDIT: '$159.98/month',
  
  // Agency
  AGENCY_STARTER: '$497/month',
  AGENCY_PROFESSIONAL: '$997/month',
  AGENCY_ENTERPRISE: '$1,997/month',
  
  // Legacy (for backward compatibility)
  DIY_MONTHLY: '$79.99/month',
  TRIAL: 'Free Preview',
};
