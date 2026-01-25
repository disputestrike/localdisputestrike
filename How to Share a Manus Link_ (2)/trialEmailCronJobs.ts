import * as db from './db';
import { users, subscriptions } from '../drizzle/schema';
import { eq, and, lte, gte, isNull, sql } from 'drizzle-orm';
import { emailTemplateService } from './emailTemplateService';

/**
 * Process trial email sequence based on user signup date
 * Runs hourly to check which emails need to be sent
 */
export async function processTrialEmails() {
  console.log('[TrialEmails] Processing trial email sequence...');
  
  try {
    const now = new Date();
    
    // Get all users with active trials
    const trialUsers = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.username,
        createdAt: users.createdAt,
        trialEndsAt: subscriptions.trialEndsAt,
        subscriptionStatus: subscriptions.status,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(
        and(
          eq(subscriptions.status, 'trialing'),
          gte(subscriptions.trialEndsAt, now)
        )
      );

    console.log(`[TrialEmails] Found ${trialUsers.length} users in trial`);

    for (const user of trialUsers) {
      const daysSinceSignup = Math.floor(
        (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const daysUntilTrialEnd = Math.floor(
        (new Date(user.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send emails based on days since signup
      try {
        // Day 0: Welcome email (sent immediately after signup)
        if (daysSinceSignup === 0) {
          await emailTemplateService.sendWelcomeEmail(user.email, user.name);
        }

        // Day 1: Credit analysis ready + Getting started
        if (daysSinceSignup === 1) {
          // Note: In production, replace with actual credit scores
          await emailTemplateService.sendCreditAnalysisReadyEmail(
            user.email,
            user.name,
            { equifax: 650, experian: 655, transunion: 648 },
            12 // negative items count
          );
          
          await emailTemplateService.sendGettingStartedEmail(user.email, user.name);
        }

        // Day 2: Dispute process explained
        if (daysSinceSignup === 2) {
          await emailTemplateService.sendDisputeProcessEmail(user.email, user.name);
        }

        // Day 3: AI feature highlight
        if (daysSinceSignup === 3) {
          await emailTemplateService.sendAIFeatureHighlightEmail(user.email, user.name, 12);
        }

        // Day 3-4: Complete plan benefits
        if (daysSinceSignup === 3 || daysSinceSignup === 4) {
          await emailTemplateService.sendCompletePlanBenefitsEmail(user.email, user.name);
        }

        // Day 4: Objection handler
        if (daysSinceSignup === 4) {
          await emailTemplateService.sendObjectionHandlerEmail(user.email, user.name);
        }

        // Day 5 (or 3 days before trial end): Trial expiring warning
        if (daysUntilTrialEnd === 3) {
          await emailTemplateService.sendTrialExpiring3DaysEmail(
            user.email,
            user.name,
            user.trialEndsAt.toLocaleDateString()
          );
        }

        // Day 5-6: Special offer
        if (daysSinceSignup === 5 || daysSinceSignup === 6) {
          await emailTemplateService.sendSpecialOfferEmail(user.email, user.name);
        }

        // Day 6 (or 1 day before trial end): Final reminder
        if (daysUntilTrialEnd === 1) {
          await emailTemplateService.sendTrialExpiringTomorrowEmail(user.email, user.name);
        }

        // Day 7 (trial ended): Trial ended email
        if (daysUntilTrialEnd === 0) {
          await emailTemplateService.sendTrialEndedEmail(user.email, user.name);
        }

        // Day 14 (7 days after trial ended): Winback email
        if (daysSinceSignup === 14) {
          await emailTemplateService.sendWinbackEmail(user.email, user.name);
        }

      } catch (emailError) {
        console.error(`[TrialEmails] Failed to send email to ${user.email}:`, emailError);
        // Continue with other users even if one fails
      }
    }

    console.log('[TrialEmails] Trial email processing complete');
  } catch (error) {
    console.error('[TrialEmails] Error processing trial emails:', error);
  }
}

/**
 * Send payment reminder emails 3 days before billing date
 */
export async function sendPaymentReminders() {
  console.log('[PaymentReminders] Checking for upcoming payments...');
  
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Get all active subscriptions with billing date in 3 days
    const upcomingPayments = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.username,
        nextBillingDate: subscriptions.currentPeriodEnd,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(
        and(
          eq(subscriptions.status, 'active'),
          lte(subscriptions.currentPeriodEnd, threeDaysFromNow)
        )
      );

    console.log(`[PaymentReminders] Found ${upcomingPayments.length} upcoming payments`);

    for (const payment of upcomingPayments) {
      try {
        await emailTemplateService.sendPaymentReminderEmail(
          payment.email,
          payment.name,
          payment.nextBillingDate.toLocaleDateString()
        );
      } catch (error) {
        console.error(`[PaymentReminders] Failed to send reminder to ${payment.email}:`, error);
      }
    }

    console.log('[PaymentReminders] Payment reminders sent');
  } catch (error) {
    console.error('[PaymentReminders] Error sending payment reminders:', error);
  }
}

/**
 * Initialize all trial email cron jobs
 */
export function initializeTrialEmailCrons() {
  // Process trial emails every hour
  setInterval(processTrialEmails, 60 * 60 * 1000);
  
  // Send payment reminders daily at 10am
  setInterval(sendPaymentReminders, 24 * 60 * 60 * 1000);
  
  console.log('[TrialEmails] Cron jobs initialized');
  
  // Run immediately on startup
  processTrialEmails();
  sendPaymentReminders();
}
