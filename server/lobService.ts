import { db } from "./_core/db";
import { mailings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock Lob client for now - in production, use: import Lob from 'lob';
// const lob = new Lob({ apiKey: process.env.LOB_API_KEY });

export interface MailingAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
}

export interface SendLetterParams {
  userId: number;
  roundId: number;
  bureau: 'transunion' | 'equifax' | 'experian';
  to: MailingAddress;
  from: MailingAddress;
  htmlContent: string;
}

/**
 * Send a certified letter via Lob
 */
export async function sendCertifiedLetter(params: SendLetterParams) {
  console.log(`[LobService] Sending certified letter for user ${params.userId}, bureau ${params.bureau}`);
  
  try {
    // In production, this would be:
    // const response = await lob.letters.create({
    //   description: `Dispute Letter - ${params.bureau} - User ${params.userId}`,
    //   to: params.to,
    //   from: params.from,
    //   file: params.htmlContent,
    //   color: false,
    //   mail_type: 'usps_first_class',
    //   extra_service: 'certified',
    //   double_sided: true
    // });
    
    // Mock response for demo
    const mockResponse = {
      id: `ltr_${Math.random().toString(36).substring(7)}`,
      tracking_number: `9400111899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      price: 10.38
    };

    // Save to database
    await db.insert(mailings).values({
      userId: params.userId,
      roundId: params.roundId,
      bureau: params.bureau,
      lobLetterId: mockResponse.id,
      trackingNumber: mockResponse.tracking_number,
      status: 'processing',
      sentAt: new Date(),
      costCents: Math.round(mockResponse.price * 100)
    });

    return {
      success: true,
      letterId: mockResponse.id,
      trackingNumber: mockResponse.tracking_number,
      expectedDelivery: mockResponse.expected_delivery_date
    };
  } catch (error) {
    console.error('[LobService] Error sending letter:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get tracking status for a mailing
 */
export async function getMailingStatus(lobLetterId: string) {
  // In production, call Lob API or check webhook updates
  // For now, return mock status
  return {
    status: 'in_transit',
    tracking_events: [
      { name: 'Mailed', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { name: 'In Transit', time: new Date().toISOString() }
    ]
  };
}

/**
 * Bureau Addresses
 */
export const BUREAU_ADDRESSES = {
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
