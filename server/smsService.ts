/**
 * SMS Notification Service using Twilio
 * Sends critical deadline alerts to users via SMS
 */

import { getDb } from './db';
import { disputeLetters, userProfiles, users } from '../drizzle/schema';
import { eq, and, sql, lte, isNotNull, isNull } from 'drizzle-orm';

// Twilio configuration from environment
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

interface SMSMessage {
  to: string;
  body: string;
}

/**
 * Send SMS via Twilio API
 */
async function sendSMS(message: SMSMessage): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log('[SMS] Twilio not configured, logging message instead:');
    console.log(`[SMS] To: ${message.to}`);
    console.log(`[SMS] Body: ${message.body}`);
    return true; // Return true for testing without Twilio
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: message.to,
        From: TWILIO_PHONE_NUMBER,
        Body: message.body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SMS] Twilio error:', error);
      return false;
    }

    const result = await response.json();
    console.log(`[SMS] Message sent successfully. SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Failed to send SMS:', error);
    return false;
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  // Already has country code
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  return null; // Invalid phone number
}

/**
 * Send deadline reminder SMS
 */
export async function sendDeadlineReminderSMS(
  phone: string,
  userName: string,
  bureau: string,
  daysRemaining: number,
  accountCount: number
): Promise<boolean> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[SMS] Invalid phone number: ${phone}`);
    return false;
  }

  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  
  let message: string;
  if (daysRemaining <= 0) {
    message = `🚨 URGENT: ${bureauName} has MISSED the 30-day FCRA deadline for your ${accountCount} disputed account(s). You may file a CFPB complaint. Log in to DisputeStrike to take action.`;
  } else if (daysRemaining <= 3) {
    message = `⚠️ CRITICAL: Only ${daysRemaining} day(s) left for ${bureauName} to respond to your dispute (${accountCount} account(s)). Log in to DisputeStrike to track your case.`;
  } else if (daysRemaining <= 7) {
    message = `📋 Reminder: ${bureauName} has ${daysRemaining} days left to respond to your dispute (${accountCount} account(s)). Track progress at DisputeStrike.`;
  } else {
    message = `📊 Update: Your ${bureauName} dispute is under investigation. ${daysRemaining} days remaining. ${accountCount} account(s) disputed.`;
  }

  return sendSMS({ to: formattedPhone, body: message });
}

/**
 * Send FCRA violation alert SMS
 */
export async function sendFCRAViolationSMS(
  phone: string,
  userName: string,
  bureau: string,
  daysOverdue: number
): Promise<boolean> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[SMS] Invalid phone number: ${phone}`);
    return false;
  }

  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  const message = `🚨 FCRA VIOLATION: ${bureauName} is ${daysOverdue} days past the legal deadline. Under FCRA §1681i, they must delete disputed items. File a CFPB complaint now at DisputeStrike.`;

  return sendSMS({ to: formattedPhone, body: message });
}

/**
 * Send letter mailed confirmation SMS
 */
export async function sendLetterMailedSMS(
  phone: string,
  bureau: string,
  trackingNumber?: string
): Promise<boolean> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[SMS] Invalid phone number: ${phone}`);
    return false;
  }

  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  let message = `✉️ Your dispute letter to ${bureauName} has been marked as mailed.`;
  
  if (trackingNumber) {
    message += ` Tracking: ${trackingNumber}.`;
  }
  
  message += ` They have 30 days to respond under FCRA.`;

  return sendSMS({ to: formattedPhone, body: message });
}

/**
 * Send account deletion success SMS
 */
export async function sendDeletionSuccessSMS(
  phone: string,
  bureau: string,
  accountName: string
): Promise<boolean> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[SMS] Invalid phone number: ${phone}`);
    return false;
  }

  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  const message = `🎉 SUCCESS! "${accountName}" has been deleted from your ${bureauName} credit report. Your credit score may improve soon!`;

  return sendSMS({ to: formattedPhone, body: message });
}

/**
 * Process all pending SMS notifications for deadline reminders
 * Called by cron job
 */
export async function processDeadlineSMSNotifications(): Promise<{ sent: number; failed: number }> {
  const db = await getDb();
  if (!db) {
    console.warn('[SMS] Database not available');
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  try {
    // Get all active disputes with deadlines approaching or overdue
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeDisputes = await db
      .select({
        letterId: disputeLetters.id,
        bureau: disputeLetters.bureau,
        responseDeadline: disputeLetters.responseDeadline,
        userId: disputeLetters.userId,
        userName: users.name,
        userPhone: userProfiles.phone,
      })
      .from(disputeLetters)
      .innerJoin(users, eq(disputeLetters.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(and(
        isNotNull(disputeLetters.mailedAt),
        isNull(disputeLetters.responseReceivedAt),
        isNotNull(disputeLetters.responseDeadline),
        lte(disputeLetters.responseDeadline, sevenDaysFromNow)
      ));

    for (const dispute of activeDisputes) {
      if (!dispute.userPhone) continue;

      const deadline = new Date(dispute.responseDeadline!);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Only send for specific day thresholds: 7, 3, 1, 0, and overdue
      if (![7, 3, 1, 0].includes(daysRemaining) && daysRemaining > 0) {
        continue;
      }

      const success = await sendDeadlineReminderSMS(
        dispute.userPhone,
        dispute.userName || 'User',
        dispute.bureau,
        daysRemaining,
        1 // Account count - would need to aggregate in real implementation
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`[SMS] Deadline notifications processed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error('[SMS] Error processing deadline notifications:', error);
    return { sent, failed };
  }
}

/**
 * Check if SMS notifications are enabled
 */
export function isSMSEnabled(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

/**
 * Get SMS service status
 */
export function getSMSStatus(): { enabled: boolean; configured: boolean } {
  return {
    enabled: isSMSEnabled(),
    configured: !!TWILIO_ACCOUNT_SID,
  };
}
