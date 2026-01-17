/**
 * Trial Cron Jobs
 * 
 * Handles:
 * - Trial expiration emails (Day 1, 3, 5, 6, 7)
 * - Trial expiration (lock access after 7 days)
 * - Win-back emails (Day 14 for churned trials)
 */

import { sendEmail } from './zeptomailService';
import { SUBSCRIPTION_TIERS, formatPrice } from './productsV2';
import * as db from './db';

/**
 * Email templates for trial nurture sequence
 */
const EMAIL_TEMPLATES = {
  day1: {
    subject: 'Your Credit Analysis is Ready! 📊',
    template: 'trial-day1',
  },
  day3: {
    subject: 'Did you see these items on your report?',
    template: 'trial-day3',
  },
  day5: {
    subject: 'Your trial ends in 2 days ⏰',
    template: 'trial-day5',
  },
  day6: {
    subject: 'Last chance: Trial ends tomorrow',
    template: 'trial-day6',
  },
  day7: {
    subject: 'Your trial has expired',
    template: 'trial-day7',
  },
  winback: {
    subject: 'We miss you! Come back for $49/mo',
    template: 'trial-winback',
  },
};

/**
 * Process trial nurture emails
 * Run this job every hour
 */
export async function processTrialEmails(): Promise<{
  day1Sent: number;
  day3Sent: number;
  day5Sent: number;
  day6Sent: number;
  day7Sent: number;
}> {
  const now = new Date();
  const results = {
    day1Sent: 0,
    day3Sent: 0,
    day5Sent: 0,
    day6Sent: 0,
    day7Sent: 0,
  };

  try {
    // Get all active trials using the new db function
    const trials = await db.getActiveTrials();

    for (const trial of trials) {
      // Get user info for this trial
      const trialWithUser = await db.getTrialWithUser(trial.id);
      if (!trialWithUser || !trialWithUser.user) continue;
      
      const { user } = trialWithUser;
      const trialStart = new Date(trial.trialStartedAt);
      const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

      // Day 1 email (sent on day 1)
      if (daysSinceStart >= 1 && !trial.day1EmailSent) {
        try {
          await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES.day1.subject,
            template: EMAIL_TEMPLATES.day1.template,
            data: {
              name: user.name || 'there',
              diyPrice: formatPrice(SUBSCRIPTION_TIERS.diy.monthlyPrice),
              completePrice: formatPrice(SUBSCRIPTION_TIERS.complete.monthlyPrice),
            },
          });
          await db.updateTrialEmailSent(trial.id, 'day1EmailSent', true);
          results.day1Sent++;
        } catch (error) {
          console.error(`Failed to send day 1 email to ${user.email}:`, error);
        }
      }

      // Day 3 email
      if (daysSinceStart >= 3 && !trial.day3EmailSent) {
        try {
          await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES.day3.subject,
            template: EMAIL_TEMPLATES.day3.template,
            data: {
              name: user.name || 'there',
              diyPrice: formatPrice(SUBSCRIPTION_TIERS.diy.monthlyPrice),
              completePrice: formatPrice(SUBSCRIPTION_TIERS.complete.monthlyPrice),
            },
          });
          await db.updateTrialEmailSent(trial.id, 'day3EmailSent', true);
          results.day3Sent++;
        } catch (error) {
          console.error(`Failed to send day 3 email to ${user.email}:`, error);
        }
      }

      // Day 5 email
      if (daysSinceStart >= 5 && !trial.day5EmailSent) {
        try {
          await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES.day5.subject,
            template: EMAIL_TEMPLATES.day5.template,
            data: {
              name: user.name || 'there',
              daysLeft: 2,
              diyPrice: formatPrice(SUBSCRIPTION_TIERS.diy.monthlyPrice),
              completePrice: formatPrice(SUBSCRIPTION_TIERS.complete.monthlyPrice),
            },
          });
          await db.updateTrialEmailSent(trial.id, 'day5EmailSent', true);
          results.day5Sent++;
        } catch (error) {
          console.error(`Failed to send day 5 email to ${user.email}:`, error);
        }
      }

      // Day 6 email
      if (daysSinceStart >= 6 && !trial.day6EmailSent) {
        try {
          await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES.day6.subject,
            template: EMAIL_TEMPLATES.day6.template,
            data: {
              name: user.name || 'there',
              diyPrice: formatPrice(SUBSCRIPTION_TIERS.diy.monthlyPrice),
              completePrice: formatPrice(SUBSCRIPTION_TIERS.complete.monthlyPrice),
            },
          });
          await db.updateTrialEmailSent(trial.id, 'day6EmailSent', true);
          results.day6Sent++;
        } catch (error) {
          console.error(`Failed to send day 6 email to ${user.email}:`, error);
        }
      }

      // Day 7 email (trial expired)
      if (daysSinceStart >= 7 && !trial.day7EmailSent) {
        try {
          await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES.day7.subject,
            template: EMAIL_TEMPLATES.day7.template,
            data: {
              name: user.name || 'there',
              diyPrice: formatPrice(SUBSCRIPTION_TIERS.diy.monthlyPrice),
              completePrice: formatPrice(SUBSCRIPTION_TIERS.complete.monthlyPrice),
            },
          });
          await db.updateTrialEmailSent(trial.id, 'day7EmailSent', true);
          results.day7Sent++;
        } catch (error) {
          console.error(`Failed to send day 7 email to ${user.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error processing trial emails:', error);
  }

  return results;
}

/**
 * Expire trials after 7 days
 * Run this job every hour
 */
export async function expireTrials(): Promise<number> {
  let expiredCount = 0;

  try {
    // Get expired trial subscriptions
    const expiredSubs = await db.getExpiredTrialSubscriptions();

    for (const sub of expiredSubs) {
      try {
        // Update subscription status to expired
        await db.updateSubscriptionV2Status(sub.id, 'expired');
        expiredCount++;
      } catch (error) {
        console.error(`Failed to expire subscription ${sub.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error expiring trials:', error);
  }

  return expiredCount;
}

/**
 * Send win-back emails to users who didn't convert
 * Run this job daily at 10am
 */
export async function sendWinbackEmails(): Promise<number> {
  let sentCount = 0;

  try {
    // Get trials that expired 14 days ago (for winback)
    const expiredTrials = await db.getExpiredTrialsForWinback(14);

    for (const trial of expiredTrials) {
      const trialWithUser = await db.getTrialWithUser(trial.id);
      if (!trialWithUser || !trialWithUser.user) continue;
      
      const { user } = trialWithUser;

      // Skip if winback already sent
      if (trial.winbackEmailSent) continue;

      try {
        await sendEmail({
          to: user.email,
          subject: EMAIL_TEMPLATES.winback.subject,
          template: EMAIL_TEMPLATES.winback.template,
          data: {
            name: user.name || 'there',
            diyPrice: formatPrice(SUBSCRIPTION_TIERS.diy.monthlyPrice),
            completePrice: formatPrice(SUBSCRIPTION_TIERS.complete.monthlyPrice),
          },
        });
        
        // Mark winback as sent (would need to add this field to schema)
        sentCount++;
      } catch (error) {
        console.error(`Failed to send winback email to ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending winback emails:', error);
  }

  return sentCount;
}

/**
 * Check and unlock dispute rounds after 30 days
 * Run this job every hour
 */
export async function checkRoundUnlocks(): Promise<number> {
  let unlockedCount = 0;

  try {
    // Get rounds that should be unlocked
    const roundsToUnlock = await db.getDisputeRoundsToUnlock();

    for (const round of roundsToUnlock) {
      try {
        await db.unlockDisputeRound(round.id);
        unlockedCount++;
      } catch (error) {
        console.error(`Failed to unlock round ${round.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking round unlocks:', error);
  }

  return unlockedCount;
}
