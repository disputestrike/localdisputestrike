/**
 * Deadline Notification Service
 * Sends email notifications when dispute response deadlines are approaching
 */

import { getDb } from './db';
import { sendEmail } from './emailService';
import { disputeLetters, users } from '../drizzle/schema';
import { eq, and, lte, gte, isNotNull } from 'drizzle-orm';

interface DeadlineNotification {
  letterId: number;
  userId: number;
  userEmail: string;
  userName: string;
  bureau: string;
  deadline: Date;
  daysRemaining: number;
}

/**
 * Find letters with approaching deadlines
 */
export async function findApproachingDeadlines(daysAhead: number): Promise<DeadlineNotification[]> {
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + daysAhead);
  
  // Set to start and end of the target day
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select({
        letterId: disputeLetters.id,
        userId: disputeLetters.userId,
        userEmail: users.email,
        userName: users.name,
        bureau: disputeLetters.bureau,
        deadline: disputeLetters.responseDeadline,
      })
      .from(disputeLetters)
      .innerJoin(users, eq(disputeLetters.userId, users.id))
      .where(
        and(
          isNotNull(disputeLetters.responseDeadline),
          gte(disputeLetters.responseDeadline, startOfDay),
          lte(disputeLetters.responseDeadline, endOfDay),
          eq(disputeLetters.status, 'mailed')
        )
      );

    return results.map((r: { letterId: number; userId: number; userEmail: string | null; userName: string | null; bureau: string; deadline: Date | null }) => ({
      letterId: r.letterId,
      userId: r.userId,
      userEmail: r.userEmail || '',
      userName: r.userName || 'User',
      bureau: r.bureau,
      deadline: r.deadline!,
      daysRemaining: daysAhead,
    }));
  } catch (error) {
    console.error('[DeadlineNotification] Error finding deadlines:', error);
    return [];
  }
}

/**
 * Generate deadline notification email HTML
 */
function generateDeadlineEmailHtml(notification: DeadlineNotification): string {
  const bureauName = notification.bureau.charAt(0).toUpperCase() + notification.bureau.slice(1);
  const deadlineFormatted = notification.deadline.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const urgencyColor = notification.daysRemaining <= 3 ? '#dc2626' : '#f59e0b';
  const urgencyText = notification.daysRemaining <= 3 ? 'URGENT' : 'REMINDER';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dispute Deadline ${urgencyText}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⚡ DisputeStrike</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Deadline Notification</p>
  </div>

  <!-- Content -->
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    
    <!-- Urgency Badge -->
    <div style="background: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 12px; margin-bottom: 20px;">
      ${urgencyText}: ${notification.daysRemaining} DAY${notification.daysRemaining !== 1 ? 'S' : ''} LEFT
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${notification.userName},
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Your <strong>${bureauName}</strong> dispute has a response deadline approaching:
    </p>

    <!-- Deadline Box -->
    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <div style="font-size: 14px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Response Deadline</div>
      <div style="font-size: 24px; font-weight: bold; color: #92400e; margin-top: 8px;">${deadlineFormatted}</div>
      <div style="font-size: 14px; color: #b45309; margin-top: 8px;">
        ${notification.daysRemaining} day${notification.daysRemaining !== 1 ? 's' : ''} remaining
      </div>
    </div>

    <!-- What to Expect -->
    <h3 style="color: #1f2937; margin-top: 30px;">What to Expect</h3>
    <ul style="padding-left: 20px; color: #4b5563;">
      <li style="margin-bottom: 8px;">The bureau must respond within 30 days of receiving your dispute</li>
      <li style="margin-bottom: 8px;">If they don't respond by the deadline, this is an <strong>FCRA violation</strong></li>
      <li style="margin-bottom: 8px;">You may be entitled to statutory damages of $100-$1,000 per violation</li>
    </ul>

    <!-- Action Items -->
    <h3 style="color: #1f2937; margin-top: 30px;">Recommended Actions</h3>
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0;">
      <p style="margin: 0 0 10px 0;"><strong>✓ Check your mail</strong> - Look for any response letters</p>
      <p style="margin: 0 0 10px 0;"><strong>✓ Log the response</strong> - Update your dispute status in DisputeStrike</p>
      <p style="margin: 0;"><strong>✓ Prepare escalation</strong> - If no response, we'll help you file an FCRA violation claim</p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.VITE_APP_URL || 'https://disputestrike.com'}/dashboard" 
         style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        View Your Disputes →
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center; font-size: 12px; color: #6b7280;">
    <p style="margin: 0 0 10px 0;">
      You're receiving this because you have an active dispute with DisputeStrike.
    </p>
    <p style="margin: 0;">
      © ${new Date().getFullYear()} DisputeStrike. All rights reserved.
    </p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of the email
 */
function generateDeadlineEmailText(notification: DeadlineNotification): string {
  const bureauName = notification.bureau.charAt(0).toUpperCase() + notification.bureau.slice(1);
  const deadlineFormatted = notification.deadline.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
DISPUTE DEADLINE REMINDER

Hi ${notification.userName},

Your ${bureauName} dispute has a response deadline approaching:

DEADLINE: ${deadlineFormatted}
DAYS REMAINING: ${notification.daysRemaining}

WHAT TO EXPECT:
- The bureau must respond within 30 days of receiving your dispute
- If they don't respond by the deadline, this is an FCRA violation
- You may be entitled to statutory damages of $100-$1,000 per violation

RECOMMENDED ACTIONS:
✓ Check your mail - Look for any response letters
✓ Log the response - Update your dispute status in DisputeStrike
✓ Prepare escalation - If no response, we'll help you file an FCRA violation claim

View your disputes: ${process.env.VITE_APP_URL || 'https://disputestrike.com'}/dashboard

---
DisputeStrike - AI-Powered Credit Dispute Letters
  `.trim();
}

/**
 * Send deadline notification email
 */
export async function sendDeadlineNotification(notification: DeadlineNotification): Promise<boolean> {
  if (!notification.userEmail) {
    console.log(`[DeadlineNotification] No email for user ${notification.userId}, skipping`);
    return false;
  }

  const bureauName = notification.bureau.charAt(0).toUpperCase() + notification.bureau.slice(1);
  const subject = notification.daysRemaining <= 3
    ? `⚠️ URGENT: ${bureauName} Dispute Deadline in ${notification.daysRemaining} Day${notification.daysRemaining !== 1 ? 's' : ''}`
    : `📅 Reminder: ${bureauName} Dispute Deadline in ${notification.daysRemaining} Days`;

  try {
    const success = await sendEmail({
      to: notification.userEmail,
      subject,
      html: generateDeadlineEmailHtml(notification),
      text: generateDeadlineEmailText(notification),
    });

    if (success) {
      console.log(`[DeadlineNotification] Sent ${notification.daysRemaining}-day reminder to ${notification.userEmail} for ${bureauName}`);
    }

    return success;
  } catch (error) {
    console.error(`[DeadlineNotification] Failed to send email to ${notification.userEmail}:`, error);
    return false;
  }
}

/**
 * Process all deadline notifications for a specific day threshold
 */
export async function processDeadlineNotifications(daysAhead: number): Promise<{ sent: number; failed: number }> {
  console.log(`[DeadlineNotification] Processing ${daysAhead}-day deadline notifications...`);
  
  const notifications = await findApproachingDeadlines(daysAhead);
  console.log(`[DeadlineNotification] Found ${notifications.length} letters with ${daysAhead}-day deadline`);

  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    const success = await sendDeadlineNotification(notification);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`[DeadlineNotification] Completed: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

/**
 * Run all deadline notification checks (7-day and 3-day)
 */
export async function runDeadlineNotificationJob(): Promise<void> {
  console.log('[DeadlineNotification] Starting deadline notification job...');
  
  // Send 7-day reminders
  await processDeadlineNotifications(7);
  
  // Send 3-day reminders
  await processDeadlineNotifications(3);
  
  console.log('[DeadlineNotification] Deadline notification job completed');
}
