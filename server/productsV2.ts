/**
 * DisputeStrike V2 - Product and Pricing Configuration
 * 
 * FINAL PRICING STRUCTURE (SOURCE BIBLE v2.0 Jan 2026):
 * - Free Preview - See violation counts (blurred details)
 * - Essential ($79.99/mo) - Unlimited rounds, user mails
 * - Complete ($129.99/mo) - We mail + CFPB + Furnisher
 * - Agency: $497 / $997 / $1,997 (separate pricing)
 * 
 * SmartCredit Integration:
 * - Essential: SmartCredit is OPTIONAL (+$29.99/mo billed separately by ConsumerDirect)
 * - Complete: SmartCredit is REQUIRED (+$29.99/mo billed separately by ConsumerDirect)
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;  // in cents
  stripePriceId?: string;  // Stripe Price ID
  features: string[];
  roundsIncluded: number;  // -1 = unlimited
  includesMonitoring: boolean;
  includesWhiteGloveMailing: boolean;
  includesCFPB: boolean;
  includesFurnisher: boolean;
  popular?: boolean;
  smartCreditRequired?: boolean;
  smartCreditOptional?: boolean;
  mailingsIncluded?: number;  // For Complete tier
}

// STRIPE PRICE IDS - TEST MODE
// To switch to LIVE mode, create products in Stripe Live Dashboard and update these
export const STRIPE_PRICE_IDS = {
  essential: process.env.STRIPE_ESSENTIAL_PRICE_ID || 'price_1St92mJbDEkzZWwHpe7Ljb1h', // $79.99/mo
  complete: process.env.STRIPE_COMPLETE_PRICE_ID || 'price_1St9QKJbDEkzZWwHbzChpIVL',   // $129.99/mo
};

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  essential: {
    id: 'essential',
    name: 'Essential',
    description: 'Everything you need to fix your credit',
    monthlyPrice: 7999,  // $79.99 (SOURCE BIBLE v2.0 Jan 2026)
    stripePriceId: STRIPE_PRICE_IDS.essential,
    features: [
      'Upload reports from anywhere',
      'Full AI violation analysis',
      'Unlimited dispute letter generation',
      'Download letters as PDF',
      'Round 2 & 3 escalation strategies',
      'Progress tracking dashboard',
      'You print & mail letters yourself',
    ],
    roundsIncluded: -1,
    includesMonitoring: false,  // SmartCredit is optional add-on
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesFurnisher: true,
    smartCreditOptional: true,
    smartCreditRequired: false,
  },
  
  complete: {
    id: 'complete',
    name: 'Complete',
    description: 'We mail everything for you',
    monthlyPrice: 12999,  // $129.99 (SOURCE BIBLE v2.0 Jan 2026)
    stripePriceId: STRIPE_PRICE_IDS.complete,
    features: [
      'Everything in Essential, PLUS:',
      'Automated certified mailing',
      'One-click dispute sending',
      'USPS certified mail tracking',
      'Automatic 30-day follow-ups',
      '5 mailings/month included',
      'Additional mailings: $6.99 each',
      'Priority email support',
      'CFPB complaint generator',
    ],
    roundsIncluded: -1,  // Unlimited
    includesMonitoring: true,  // SmartCredit required
    includesWhiteGloveMailing: true,
    includesCFPB: true,
    includesFurnisher: true,
    popular: true,
    smartCreditRequired: true,
    smartCreditOptional: false,
    mailingsIncluded: 5,
  },
  
  // Legacy mapping for old 'diy' references - maps to Essential
  diy: {
    id: 'essential',
    name: 'Essential',
    description: 'Everything you need to fix your credit',
    monthlyPrice: 7999,  // $79.99 (SOURCE BIBLE v2.0 Jan 2026)
    stripePriceId: STRIPE_PRICE_IDS.essential,
    features: [
      'Upload reports from anywhere',
      'Full AI violation analysis',
      'Unlimited dispute letter generation',
      'Download letters as PDF',
      'Round 2 & 3 escalation strategies',
      'Progress tracking dashboard',
    ],
    roundsIncluded: -1,
    includesMonitoring: false,
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesFurnisher: true,
    smartCreditOptional: true,
  },
};

// SmartCredit pricing info
export const SMARTCREDIT_CONFIG = {
  monthlyPrice: 2999,  // $29.99/mo - billed separately by ConsumerDirect
  affiliateUrl: 'https://www.smartcredit.com/?PID=87529',
  marginPerMonth: 1439,  // $14.39 margin per signup
  features: [
    '3-bureau credit monitoring',
    'Monthly updated reports',
    'Score tracking',
    'Alerts when reports change',
  ],
};

// Extra mailing pricing for Complete tier
export const EXTRA_MAILING_PRICE = 699;  // $6.99 per additional mailing

/**
 * Get tier by ID
 */
export function getTier(id: string): SubscriptionTier | undefined {
  // Map legacy 'diy' to 'essential'
  if (id === 'diy') {
    return SUBSCRIPTION_TIERS.essential;
  }
  return SUBSCRIPTION_TIERS[id];
}

/**
 * Get all tiers as array (excluding legacy mappings)
 */
export function getAllTiers(): SubscriptionTier[] {
  return [SUBSCRIPTION_TIERS.essential, SUBSCRIPTION_TIERS.complete];
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Check if user can start a new round based on their tier
 */
export function canStartRound(tier: string, currentRound: number): boolean {
  const tierConfig = getTier(tier);
  if (!tierConfig) return false;
  
  // Unlimited rounds
  if (tierConfig.roundsIncluded === -1) return true;
  
  // Check if within limit
  return currentRound <= tierConfig.roundsIncluded;
}

/**
 * Get the maximum rounds for a tier
 */
export function getMaxRounds(tier: string): number {
  const tierConfig = getTier(tier);
  if (!tierConfig) return 0;
  return tierConfig.roundsIncluded;
}

/**
 * Check if tier includes a feature
 */
export function tierHasFeature(tier: string, feature: 'monitoring' | 'whiteGlove' | 'cfpb' | 'furnisher'): boolean {
  const tierConfig = getTier(tier);
  if (!tierConfig) return false;
  
  switch (feature) {
    case 'monitoring': return tierConfig.includesMonitoring;
    case 'whiteGlove': return tierConfig.includesWhiteGloveMailing;
    case 'cfpb': return tierConfig.includesCFPB;
    case 'furnisher': return tierConfig.includesFurnisher;
    default: return false;
  }
}

/**
 * Calculate days until round unlocks (30-day lock)
 */
export function getDaysUntilUnlock(mailedAt: Date): number {
  const unlockDate = new Date(mailedAt);
  unlockDate.setDate(unlockDate.getDate() + 30);
  
  const now = new Date();
  const diffTime = unlockDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Check if round is unlocked
 */
export function isRoundUnlocked(mailedAt: Date | null, responsesUploaded: boolean): boolean {
  // If no letters mailed yet, round is unlocked
  if (!mailedAt) return true;
  
  // If responses uploaded, unlock early
  if (responsesUploaded) return true;
  
  // Otherwise, check 30-day lock
  return getDaysUntilUnlock(mailedAt) === 0;
}

/**
 * Legacy trial configuration - kept for backward compatibility
 * Note: Trial has been replaced with Free Preview tier
 */
export const TRIAL_CONFIG = {
  price: 0,  // Free now
  durationDays: 0,  // No trial period
  features: [
    'Upload credit reports',
    'See violation count',
    'Category breakdown',
    'Deletion potential estimate',
  ],
};

/**
 * Calculate trial end date - legacy function
 */
export function getTrialEndDate(startDate: Date): Date {
  // No trial anymore, return same date
  return startDate;
}

/**
 * Check if trial is expired - legacy function
 */
export function isTrialExpired(trialEndsAt: Date): boolean {
  // No trial anymore, always return false
  return false;
}

/**
 * Calculate total cost with SmartCredit
 */
export function getTotalWithSmartCredit(tier: string): number {
  const tierConfig = getTier(tier);
  if (!tierConfig) return 0;
  return tierConfig.monthlyPrice + SMARTCREDIT_CONFIG.monthlyPrice;
}

/**
 * Get display text for SmartCredit requirement
 */
export function getSmartCreditRequirement(tier: string): 'required' | 'optional' | 'none' {
  const tierConfig = getTier(tier);
  if (!tierConfig) return 'none';
  if (tierConfig.smartCreditRequired) return 'required';
  if (tierConfig.smartCreditOptional) return 'optional';
  return 'none';
}
