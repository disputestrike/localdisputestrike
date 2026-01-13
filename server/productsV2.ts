/**
 * DisputeStrike V2 - Product and Pricing Configuration
 * 
 * FINAL PRICING STRUCTURE:
 * - $1 Trial (7 days) - See real credit data + AI recommendations
 * - DIY ($49.99/mo) - Unlimited rounds + monitoring (User mails)
 * - Complete ($79.99/mo) - Unlimited rounds + we mail + CFPB + Furnisher
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;  // in cents
  stripePriceId?: string;  // Stripe Price ID (set after creating in Stripe)
  features: string[];
  roundsIncluded: number;  // -1 = unlimited
  includesMonitoring: boolean;
  includesWhiteGloveMailing: boolean;
  includesCFPB: boolean;
  includesFurnisher: boolean;
  popular?: boolean;
}

export const TRIAL_PRICE = 100;  // $1.00 in cents

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  diy: {
    id: 'diy',
    name: 'DIY',
    description: 'Unlimited rounds + credit monitoring (You mail)',
    monthlyPrice: 4999,  // $49.99
    features: [
      'Unlimited dispute rounds (30-day intervals)',
      '3-bureau credit monitoring (daily updates)',
      'AI analyzes & selects best items to dispute',
      'FCRA-compliant dispute letters',
      'Round 1-2-3 escalation strategy',
      'Dashboard tracking',
      'You print & mail yourself',
    ],
    roundsIncluded: -1,
    includesMonitoring: true,
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesFurnisher: false,
  },
  
  complete: {
    id: 'complete',
    name: 'Complete',
    description: 'Unlimited rounds + we mail + CFPB + Furnisher',
    monthlyPrice: 7999,  // $79.99
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
    roundsIncluded: -1,  // Unlimited
    includesMonitoring: true,
    includesWhiteGloveMailing: true,
    includesCFPB: true,
    includesFurnisher: true,
    popular: true,
  },
};

/**
 * Get tier by ID
 */
export function getTier(id: string): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS[id];
}

/**
 * Get all tiers as array
 */
export function getAllTiers(): SubscriptionTier[] {
  return Object.values(SUBSCRIPTION_TIERS);
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
  const tierConfig = SUBSCRIPTION_TIERS[tier];
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
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return 0;
  return tierConfig.roundsIncluded;
}

/**
 * Check if tier includes a feature
 */
export function tierHasFeature(tier: string, feature: 'monitoring' | 'whiteGlove' | 'cfpb' | 'furnisher'): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
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
 * Trial configuration
 */
export const TRIAL_CONFIG = {
  price: 100,  // $1.00 in cents
  durationDays: 7,
  features: [
    'Real credit data from all 3 bureaus',
    'AI analysis of negative items',
    'Win probability for each item',
    'Personalized recommendations',
  ],
};

/**
 * Calculate trial end date
 */
export function getTrialEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_CONFIG.durationDays);
  return endDate;
}

/**
 * Check if trial is expired
 */
export function isTrialExpired(trialEndsAt: Date): boolean {
  return new Date() > trialEndsAt;
}
