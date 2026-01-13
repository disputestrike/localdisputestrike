/**
 * Trial Cron Jobs
 * 
 * Handles:
 * - Trial expiration emails (Day 1, 3, 5, 6, 7)
 * - Trial expiration (lock access after 7 days)
 * - Win-back emails (Day 14 for churned trials)
 */

import { eq, and, lt, isNull, gte, lte } from 'drizzle-orm';
import { sendEmail } from './emailService';
import { SUBSCRIPTION_TIERS, formatPrice } from './productsV2';

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
export async function processTrialEmails(db: any): Promise<{
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

  // Get all active trials
  const trials = await db.query.trialConversions.findMany({
    where: and(
      eq(db.schema.trialConversions.converted, false),
      isNull(db.schema.trialConversions.expiredAt)
    ),
    with: {
      user: true,
    },
  });

  for (const trial of trials) {
    const trialStart = new Date(trial.trialStartedAt);
    const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

    // Day 1 email (sent on day 1)
    if (daysSinceStart >= 1 && !trial.day1EmailSent) {
      await sendTrialEmail(db, trial, 'day1');
      results.day1Sent++;
    }

    // Day 3 email
    if (daysSinceStart >= 3 && !trial.day3EmailSent) {
      await sendTrialEmail(db, trial, 'day3');
      results.day3Sent++;
    }

    // Day 5 email (2 days before expiration)
    if (daysSinceStart >= 5 && !trial.day5EmailSent) {
      await sendTrialEmail(db, trial, 'day5');
      results.day5Sent++;
    }

    // Day 6 email (1 day before expiration)
    if (daysSinceStart >= 6 && !trial.day6EmailSent) {
      await sendTrialEmail(db, trial, 'day6');
      results.day6Sent++;
    }

    // Day 7 email (expiration day)
    if (daysSinceStart >= 7 && !trial.day7EmailSent) {
      await sendTrialEmail(db, trial, 'day7');
      results.day7Sent++;
    }
  }

  return results;
}

/**
 * Send a trial nurture email
 */
async function sendTrialEmail(
  db: any,
  trial: any,
  emailType: 'day1' | 'day3' | 'day5' | 'day6' | 'day7'
): Promise<void> {
  const template = EMAIL_TEMPLATES[emailType];
  
  // Get user's credit analysis data for personalization
  const analysis = await db.query.negativeAccounts.findMany({
    where: eq(db.schema.negativeAccounts.userId, trial.userId),
    limit: 5,
  });

  const recommendations = await db.query.aiRecommendations.findMany({
    where: and(
      eq(db.schema.aiRecommendations.userId, trial.userId),
      eq(db.schema.aiRecommendations.isRecommended, true)
    ),
    limit: 3,
  });

  // Send email
  await sendEmail({
    to: trial.user.email,
    subject: template.subject,
    template: template.template,
    data: {
      userName: trial.user.fullName?.split(' ')[0] || 'there',
      negativeItemCount: analysis.length,
      topRecommendations: recommendations,
      trialEndsAt: new Date(trial.trialEndsAt).toLocaleDateString(),
      daysRemaining: Math.max(0, Math.ceil((new Date(trial.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      upgradeUrl: `${process.env.APP_URL}/pricing`,
      starterPrice: formatPrice(SUBSCRIPTION_TIERS.starter.monthlyPrice),
      professionalPrice: formatPrice(SUBSCRIPTION_TIERS.professional.monthlyPrice),
    },
  });

  // Mark email as sent
  const updateField = `day${emailType.replace('day', '')}EmailSent`;
  await db.update(db.schema.trialConversions)
    .set({ [updateField]: true })
    .where(eq(db.schema.trialConversions.id, trial.id));
}

/**
 * Expire trials that have passed 7 days
 * Run this job every hour
 */
export async function expireTrials(db: any): Promise<number> {
  const now = new Date();
  
  // Find trials that have expired
  const expiredTrials = await db.query.subscriptionsV2.findMany({
    where: and(
      eq(db.schema.subscriptionsV2.status, 'trial'),
      lt(db.schema.subscriptionsV2.trialEndsAt, now)
    ),
  });

  let expiredCount = 0;

  for (const subscription of expiredTrials) {
    // Update subscription status
    await db.update(db.schema.subscriptionsV2)
      .set({ status: 'trial_expired' })
      .where(eq(db.schema.subscriptionsV2.id, subscription.id));

    // Update trial conversion record
    await db.update(db.schema.trialConversions)
      .set({ expiredAt: now })
      .where(eq(db.schema.trialConversions.userId, subscription.userId));

    expiredCount++;
  }

  return expiredCount;
}

/**
 * Send win-back emails to churned trials (14 days after expiration)
 * Run this job daily
 */
export async function sendWinbackEmails(db: any): Promise<number> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const thirteenDaysAgo = new Date(now);
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

  // Find trials that expired 14 days ago
  const churnedTrials = await db.query.trialConversions.findMany({
    where: and(
      eq(db.schema.trialConversions.converted, false),
      gte(db.schema.trialConversions.expiredAt, fourteenDaysAgo),
      lte(db.schema.trialConversions.expiredAt, thirteenDaysAgo)
    ),
    with: {
      user: true,
    },
  });

  let sentCount = 0;

  for (const trial of churnedTrials) {
    await sendEmail({
      to: trial.user.email,
      subject: EMAIL_TEMPLATES.winback.subject,
      template: EMAIL_TEMPLATES.winback.template,
      data: {
        userName: trial.user.fullName?.split(' ')[0] || 'there',
        specialPrice: '$49/mo',
        upgradeUrl: `${process.env.APP_URL}/pricing?promo=winback`,
      },
    });

    sentCount++;
  }

  return sentCount;
}

/**
 * Check for round unlocks (30-day lock expired)
 * Run this job every hour
 */
export async function checkRoundUnlocks(db: any): Promise<number> {
  const now = new Date();
  
  // Find rounds that are locked but should be unlocked
  const lockedRounds = await db.query.disputeRounds.findMany({
    where: and(
      eq(db.schema.disputeRounds.status, 'mailed'),
      lt(db.schema.disputeRounds.lockedUntil, now),
      eq(db.schema.disputeRounds.unlockedEarly, false)
    ),
    with: {
      user: true,
    },
  });

  let unlockedCount = 0;

  for (const round of lockedRounds) {
    // Update round status
    await db.update(db.schema.disputeRounds)
      .set({ status: 'awaiting_response' })
      .where(eq(db.schema.disputeRounds.id, round.id));

    // Send notification email
    await sendEmail({
      to: round.user.email,
      subject: `Round ${round.roundNumber + 1} is now available! 🎉`,
      template: 'round-unlocked',
      data: {
        userName: round.user.fullName?.split(' ')[0] || 'there',
        roundNumber: round.roundNumber + 1,
        dashboardUrl: `${process.env.APP_URL}/dashboard`,
      },
    });

    unlockedCount++;
  }

  return unlockedCount;
}

/**
 * Main cron job runner
 * Call this from your cron scheduler
 */
export async function runTrialCronJobs(db: any): Promise<{
  emailsSent: any;
  trialsExpired: number;
  winbacksSent: number;
  roundsUnlocked: number;
}> {
  console.log('[CRON] Starting trial cron jobs...');

  const emailsSent = await processTrialEmails(db);
  console.log(`[CRON] Trial emails sent:`, emailsSent);

  const trialsExpired = await expireTrials(db);
  console.log(`[CRON] Trials expired: ${trialsExpired}`);

  const winbacksSent = await sendWinbackEmails(db);
  console.log(`[CRON] Winback emails sent: ${winbacksSent}`);

  const roundsUnlocked = await checkRoundUnlocks(db);
  console.log(`[CRON] Rounds unlocked: ${roundsUnlocked}`);

  return {
    emailsSent,
    trialsExpired,
    winbacksSent,
    roundsUnlocked,
  };
}

/**
 * Register cron jobs with node-cron
 */
export function registerTrialCronJobs(cron: any, db: any): void {
  // Run trial emails every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await processTrialEmails(db);
    } catch (error) {
      console.error('[CRON] Error processing trial emails:', error);
    }
  });

  // Run trial expiration every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await expireTrials(db);
    } catch (error) {
      console.error('[CRON] Error expiring trials:', error);
    }
  });

  // Run winback emails daily at 10am
  cron.schedule('0 10 * * *', async () => {
    try {
      await sendWinbackEmails(db);
    } catch (error) {
      console.error('[CRON] Error sending winback emails:', error);
    }
  });

  // Check round unlocks every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await checkRoundUnlocks(db);
    } catch (error) {
      console.error('[CRON] Error checking round unlocks:', error);
    }
  });

  console.log('[CRON] Trial cron jobs registered');
}
