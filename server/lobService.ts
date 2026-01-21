/**
 * Lob Mailing Service
 * 
 * Handles certified mail sending via Lob.com API
 * Supports both test mode and production mode
 * 
 * Cost: ~$5.99 per certified letter (includes postage + tracking)
 */

import { getDb } from "./db";
import { disputeLetters, users, userProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Lob API configuration
const LOB_API_KEY = process.env.LOB_API_KEY || '';
const LOB_TEST_MODE = !LOB_API_KEY || LOB_API_KEY.startsWith('test_');
const LOB_API_BASE = 'https://api.lob.com/v1';

// Certified letter cost estimate
const CERTIFIED_LETTER_COST = 5.99;

export interface MailingAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country?: string;
}

export interface SendLetterParams {
  userId: number;
  letterId: number;
  bureau: 'transunion' | 'equifax' | 'experian';
  letterContent: string;
  userAddress: MailingAddress;
  userIp?: string;
}

export interface SendLetterResult {
  success: boolean;
  lobLetterId?: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  cost?: number;
  error?: string;
}

export interface AuthorizationData {
  userId: number;
  letterId: number;
  authorizedAt: Date;
  ipAddress: string;
  checkboxes: {
    accuracyConfirmed: boolean;
    authorizedToSend: boolean;
    understandCosts: boolean;
    agreeToTerms: boolean;
  };
}

/**
 * Bureau mailing addresses
 */
export const BUREAU_ADDRESSES: Record<string, MailingAddress> = {
  transunion: {
    name: 'TransUnion Consumer Solutions',
    address_line1: 'P.O. Box 2000',
    address_city: 'Chester',
    address_state: 'PA',
    address_zip: '19016',
    address_country: 'US'
  },
  equifax: {
    name: 'Equifax Information Services LLC',
    address_line1: 'P.O. Box 740256',
    address_city: 'Atlanta',
    address_state: 'GA',
    address_zip: '30374',
    address_country: 'US'
  },
  experian: {
    name: 'Experian',
    address_line1: 'P.O. Box 4500',
    address_city: 'Allen',
    address_state: 'TX',
    address_zip: '75013',
    address_country: 'US'
  }
};

/**
 * Verify user address using Lob's address verification API
 */
export async function verifyAddress(address: MailingAddress): Promise<{
  valid: boolean;
  deliverable: boolean;
  correctedAddress?: MailingAddress;
  error?: string;
}> {
  if (LOB_TEST_MODE) {
    // In test mode, always return valid
    return {
      valid: true,
      deliverable: true,
      correctedAddress: address,
    };
  }

  try {
    const response = await fetch(`${LOB_API_BASE}/us_verifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(LOB_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        primary_line: address.address_line1,
        secondary_line: address.address_line2 || '',
        city: address.address_city,
        state: address.address_state,
        zip_code: address.address_zip,
      }),
    });

    const data = await response.json();

    if (data.deliverability === 'deliverable' || data.deliverability === 'deliverable_unnecessary_unit') {
      return {
        valid: true,
        deliverable: true,
        correctedAddress: {
          name: address.name,
          address_line1: data.primary_line,
          address_line2: data.secondary_line || undefined,
          address_city: data.components.city,
          address_state: data.components.state,
          address_zip: data.components.zip_code,
          address_country: 'US',
        },
      };
    }

    return {
      valid: false,
      deliverable: false,
      error: `Address not deliverable: ${data.deliverability}`,
    };
  } catch (error) {
    console.error('[LobService] Address verification error:', error);
    return {
      valid: false,
      deliverable: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Send a certified letter via Lob
 */
export async function sendCertifiedLetter(params: SendLetterParams): Promise<SendLetterResult> {
  const { userId, letterId, bureau, letterContent, userAddress, userIp } = params;
  
  console.log(`[LobService] Sending certified letter for user ${userId}, bureau ${bureau}, test mode: ${LOB_TEST_MODE}`);

  // Get bureau address
  const bureauAddress = BUREAU_ADDRESSES[bureau];
  if (!bureauAddress) {
    return { success: false, error: `Unknown bureau: ${bureau}` };
  }

  if (LOB_TEST_MODE) {
    // Test mode - simulate successful send
    const mockLetterId = `ltr_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const mockTrackingNumber = `9400111899${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const expectedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Update letter record in database
    const db = await getDb();
    if (db) {
      await db.update(disputeLetters)
        .set({
          lobLetterId: mockLetterId,
        trackingNumber: mockTrackingNumber,
        lobMailingStatus: 'processing',
        lobCost: CERTIFIED_LETTER_COST.toString(),
        mailedAt: new Date(),
        status: 'mailed',
        userAuthorizedAt: new Date(),
        userAuthorizationIp: userIp || 'unknown',
            responseDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })
        .where(eq(disputeLetters.id, letterId));
    }

    console.log(`[LobService] TEST MODE: Letter ${mockLetterId} created for bureau ${bureau}`);

    return {
      success: true,
      lobLetterId: mockLetterId,
      trackingNumber: mockTrackingNumber,
      expectedDelivery,
      cost: CERTIFIED_LETTER_COST,
    };
  }

  // Production mode - call Lob API
  try {
    // Convert HTML content to PDF (Lob accepts HTML directly)
    const response = await fetch(`${LOB_API_BASE}/letters`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(LOB_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Dispute Letter - ${bureau.toUpperCase()} - User ${userId}`,
        to: bureauAddress,
        from: userAddress,
        file: letterContent, // HTML content
        color: false,
        double_sided: true,
        address_placement: 'top_first_page',
        mail_type: 'usps_first_class',
        extra_service: 'certified',
        return_envelope: false,
        merge_variables: {},
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('[LobService] Lob API error:', data.error);
      return { success: false, error: data.error.message };
    }

    // Update letter record in database
    const dbProd = await getDb();
    if (dbProd) {
      await dbProd.update(disputeLetters)
        .set({
          lobLetterId: data.id,
        trackingNumber: data.tracking_number,
        lobMailingStatus: 'processing',
        lobCost: (data.price || CERTIFIED_LETTER_COST).toString(),
        mailedAt: new Date(),
        status: 'mailed',
        userAuthorizedAt: new Date(),
        userAuthorizationIp: userIp || 'unknown',
        responseDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .where(eq(disputeLetters.id, letterId));

    return {
      success: true,
      lobLetterId: data.id,
      trackingNumber: data.tracking_number,
      expectedDelivery: data.expected_delivery_date,
      cost: data.price || CERTIFIED_LETTER_COST,
    };
  } catch (error) {
    console.error('[LobService] Error sending letter:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send letter',
    };
  }
}

/**
 * Get tracking status for a mailed letter
 */
export async function getMailingStatus(lobLetterId: string): Promise<{
  status: string;
  trackingEvents: Array<{ name: string; time: string; location?: string }>;
  expectedDelivery?: string;
}> {
  if (LOB_TEST_MODE) {
    // Test mode - return mock tracking
    const now = new Date();
    return {
      status: 'in_transit',
      trackingEvents: [
        { name: 'Created', time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Rendered PDF', time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Processed for Delivery', time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'In Transit', time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      expectedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }

  try {
    const response = await fetch(`${LOB_API_BASE}/letters/${lobLetterId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(LOB_API_KEY + ':').toString('base64')}`,
      },
    });

    const data = await response.json();

    return {
      status: data.tracking?.status || 'unknown',
      trackingEvents: data.tracking?.events || [],
      expectedDelivery: data.expected_delivery_date,
    };
  } catch (error) {
    console.error('[LobService] Error getting mailing status:', error);
    return {
      status: 'unknown',
      trackingEvents: [],
    };
  }
}

/**
 * Record user authorization for sending letters
 */
export async function recordAuthorization(data: AuthorizationData): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    
    // Update the letter with authorization info
    await db.update(disputeLetters)
      .set({
        userAuthorizedAt: data.authorizedAt,
        userAuthorizationIp: data.ipAddress,
      })
      .where(eq(disputeLetters.id, data.letterId));

    console.log(`[LobService] Authorization recorded for letter ${data.letterId} by user ${data.userId}`);
    return true;
  } catch (error) {
    console.error('[LobService] Error recording authorization:', error);
    return false;
  }
}

/**
 * Get user's mailing address from profile
 */
export async function getUserMailingAddress(userId: number): Promise<MailingAddress | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    
    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (!profile || !profile.currentAddress || !profile.currentCity || !profile.currentState || !profile.currentZip) {
      return null;
    }

    const fullName = [profile.firstName, profile.middleInitial, profile.lastName]
      .filter(Boolean)
      .join(' ') || profile.fullName || 'Unknown';

    return {
      name: fullName,
      address_line1: profile.currentAddress,
      address_city: profile.currentCity,
      address_state: profile.currentState,
      address_zip: profile.currentZip,
      address_country: 'US',
    };
  } catch (error) {
    console.error('[LobService] Error getting user address:', error);
    return null;
  }
}

/**
 * Calculate total mailing cost for a set of letters
 */
export function calculateMailingCost(letterCount: number): number {
  return letterCount * CERTIFIED_LETTER_COST;
}

/**
 * Check if Lob is configured
 */
export function isLobConfigured(): boolean {
  return !!LOB_API_KEY;
}

/**
 * Check if running in test mode
 */
export function isTestMode(): boolean {
  return LOB_TEST_MODE;
}

export { CERTIFIED_LETTER_COST, LOB_TEST_MODE };
