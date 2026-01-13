/**
 * DisputeStrike V2 - Product and Pricing Configuration
 * 
 * NEW PRICING STRUCTURE:
 * - $1 Trial (7 days) - See real credit data + AI recommendations
 * - Starter ($49/mo) - 2 rounds + monitoring
 * - Professional ($69.95/mo) - 3 rounds + monitoring  
 * - Complete ($99.95/mo) - Unlimited rounds + we mail + CFPB
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
  includesCoaching: boolean;
  popular?: boolean;
}

export const TRIAL_PRICE = 100;  // $1.00 in cents

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: '2 rounds of disputes + credit monitoring',
    monthlyPrice: 4900,  // $49.00
    features: [
      '2 dispute rounds',
      '3-bureau credit monitoring',
      'AI selects top 3-5 items per round',
      'Auto-pull credit reports',
      'DIY print & mail',
      '30-day round tracking',
      'Email support',
    ],
    roundsIncluded: 2,
    includesMonitoring: true,
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesCoaching: false,
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    description: '3 rounds of disputes + advanced features',
    monthlyPrice: 6995,  // $69.95
    features: [
      '3 dispute rounds',
      '3-bureau credit monitoring',
      'AI selects top 3-5 items per round',
      'Auto-pull credit reports',
      'Response upload + AI analysis',
      'Escalation letter templates',
      'DIY print & mail',
      'Priority email support',
    ],
    roundsIncluded: 3,
    includesMonitoring: true,
    includesWhiteGloveMailing: false,
    includesCFPB: false,
    includesCoaching: false,
    popular: true,
  },
  
  complete: {
    id: 'complete',
    name: 'Complete',
    description: 'Unlimited rounds + white-glove service',
    monthlyPrice: 9995,  // $99.95
    features: [
      'Unlimited dispute rounds',
      '3-bureau credit monitoring',
      'AI selects top 3-5 items per round',
      'Auto-pull credit reports',
      'Response upload + AI analysis',
      'Escalation letter templates',
      'We print & mail for you',
      'CFPB complaint generator',
      'Furnisher dispute letters',
      '30-min coaching call/month',
      'Priority phone & email support',
    ],
    roundsIncluded: -1,  // Unlimited
    includesMonitoring: true,
    includesWhiteGloveMailing: true,
    includesCFPB: true,
    includesCoaching: true,
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
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
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
export function tierHasFeature(tier: string, feature: 'monitoring' | 'whiteGlove' | 'cfpb' | 'coaching'): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return false;
  
  switch (feature) {
    case 'monitoring': return tierConfig.includesMonitoring;
    case 'whiteGlove': return tierConfig.includesWhiteGloveMailing;
    case 'cfpb': return tierConfig.includesCFPB;
    case 'coaching': return tierConfig.includesCoaching;
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
