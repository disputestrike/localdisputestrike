/**
 * agencyCapacityService.ts - Agency Client Capacity Limits
 * 
 * Enforces client limits based on agency subscription tier (SOURCE BIBLE v2.0 Jan 2026):
 * - Starter: 50 clients ($497/mo)
 * - Professional: 200 clients ($997/mo)
 * - Enterprise: 500 clients ($1,997/mo)
 */

export interface AgencyTier {
  id: string;
  name: string;
  maxClients: number;
  priceMonthly: number;
  features: string[];
}

export const AGENCY_TIERS: Record<string, AgencyTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    maxClients: 50,
    priceMonthly: 49700, // $497
    features: [
      'Up to 50 clients',
      'White-label dashboard',
      'Client management',
      'Bulk letter generation',
      'Email support',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    maxClients: 200,
    priceMonthly: 99700, // $997
    features: [
      'Up to 200 clients',
      'White-label dashboard',
      'Client management',
      'Bulk letter generation',
      'Priority support',
      'API access',
      'Custom branding',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxClients: 500,
    priceMonthly: 199700, // $1,997
    features: [
      'Up to 500 clients',
      'White-label dashboard',
      'Client management',
      'Bulk letter generation',
      'Dedicated support',
      'Full API access',
      'Custom branding',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
};

export interface CapacityStatus {
  currentClients: number;
  maxClients: number;
  remainingCapacity: number;
  utilizationPercent: number;
  canAddClient: boolean;
  tier: AgencyTier;
  upgradeRecommended: boolean;
}

export function formatAgencyPrice(cents: number): string {
  return '$' + (cents / 100).toLocaleString();
}
