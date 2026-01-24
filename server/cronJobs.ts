/**
 * Cron Job Scheduler
 * Handles scheduled tasks like deadline notifications and trial management
 */

import { runDeadlineNotificationJob } from './deadlineNotificationService';
import { processDeadlineSMSNotifications, isSMSEnabled } from './smsService';
import { 
  expireTrials, 
  sendWinbackEmails, 
  checkRoundUnlocks 
} from './trialCronJobs';
import { processTrialEmails, sendPaymentReminders } from './trialEmailCronJobs';
import {
  processIdentityIQMonthlyPayments,
  retryFailedIdentityIQPayments,
  syncCanceledSubscriptions
} from './identityiqCronJobs';
import {
  processPendingEnrollments,
  retryFailedCreditPulls,
  cancelExpiredTrialSubscriptions
} from './identityiqEnrollmentCronJobs';
import * as db from './db';

// Track if cron jobs are already running
let cronJobsStarted = false;

// Store interval IDs for cleanup
let deadlineNotificationInterval: NodeJS.Timeout | null = null;
let smsNotificationInterval: NodeJS.Timeout | null = null;
let trialEmailInterval: NodeJS.Timeout | null = null;
let trialExpirationInterval: NodeJS.Timeout | null = null;
let winbackEmailInterval: NodeJS.Timeout | null = null;
let roundUnlockInterval: NodeJS.Timeout | null = null;
let identityiqPaymentInterval: NodeJS.Timeout | null = null;
let identityiqRetryInterval: NodeJS.Timeout | null = null;
let identityiqSyncInterval: NodeJS.Timeout | null = null;
let identityiqEnrollmentInterval: NodeJS.Timeout | null = null;
let identityiqCreditPullInterval: NodeJS.Timeout | null = null;
let identityiqTrialCancellationInterval: NodeJS.Timeout | null = null;

/**
 * Calculate milliseconds until next 9am
 */
function getMillisecondsUntilNext9AM(): number {
  const now = new Date();
  const next9AM = new Date(now);
  
  // Set to 9:00 AM
  next9AM.setHours(9, 0, 0, 0);
  
  // If it's already past 9am today, schedule for tomorrow
  if (now >= next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  
  return next9AM.getTime() - now.getTime();
}

/**
 * Calculate milliseconds until next 10am
 */
function getMillisecondsUntilNext10AM(): number {
  const now = new Date();
  const next10AM = new Date(now);
  
  next10AM.setHours(10, 0, 0, 0);
  
  if (now >= next10AM) {
    next10AM.setDate(next10AM.getDate() + 1);
  }
  
  return next10AM.getTime() - now.getTime();
}

/**
 * Start the deadline notification cron job
 * Runs daily at 9:00 AM server time
 */
export function startDeadlineNotificationCron(): void {
  if (deadlineNotificationInterval) {
    console.log('[Cron] Deadline notification job already scheduled');
    return;
  }

  const msUntil9AM = getMillisecondsUntilNext9AM();
  const hoursUntil = Math.round(msUntil9AM / (1000 * 60 * 60) * 10) / 10;
  
  console.log(`[Cron] Scheduling deadline notifications - first run in ${hoursUntil} hours (at 9:00 AM)`);

  // Schedule first run at 9am
  setTimeout(() => {
    // Run immediately at 9am
    console.log('[Cron] Running scheduled deadline notification job (9:00 AM)');
    runDeadlineNotificationJob().catch(err => {
      console.error('[Cron] Deadline notification job failed:', err);
    });

    // Then run every 24 hours
    deadlineNotificationInterval = setInterval(() => {
      console.log('[Cron] Running scheduled deadline notification job (daily)');
      runDeadlineNotificationJob().catch(err => {
        console.error('[Cron] Deadline notification job failed:', err);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  }, msUntil9AM);

  console.log('[Cron] Deadline notification cron job scheduled successfully');
}

/**
 * Start the SMS notification cron job
 * Runs every 4 hours to check for critical deadlines
 */
export function startSMSNotificationCron(): void {
  if (smsNotificationInterval) {
    console.log('[Cron] SMS notification job already scheduled');
    return;
  }

  if (!isSMSEnabled()) {
    console.log('[Cron] SMS notifications not configured (missing Twilio credentials)');
    return;
  }

  console.log('[Cron] Starting SMS notification cron job (every 4 hours)');

  // Run immediately on startup
  processDeadlineSMSNotifications().catch(err => {
    console.error('[Cron] SMS notification job failed:', err);
  });

  // Then run every 4 hours
  smsNotificationInterval = setInterval(() => {
    console.log('[Cron] Running scheduled SMS notification job');
    processDeadlineSMSNotifications().catch(err => {
      console.error('[Cron] SMS notification job failed:', err);
    });
  }, 4 * 60 * 60 * 1000); // 4 hours

  console.log('[Cron] SMS notification cron job scheduled successfully');
}

// ============================================
// V2 - TRIAL MANAGEMENT CRON JOBS
// ============================================

/**
 * Start the trial email cron job
 * Runs every hour to send trial nurture emails
 */
export function startTrialEmailCron(): void {
  if (trialEmailInterval) {
    console.log('[Cron] Trial email job already scheduled');
    return;
  }

  console.log('[Cron] Starting trial email cron job (every hour)');

  // Run immediately on startup
  processTrialEmails().catch(err => {
    console.error('[Cron] Trial email job failed:', err);
  });

  // Then run every hour
  trialEmailInterval = setInterval(() => {
    console.log('[Cron] Running scheduled trial email job');
    processTrialEmails().catch(err => {
      console.error('[Cron] Trial email job failed:', err);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log('[Cron] Trial email cron job scheduled successfully');
}

/**
 * Start the trial expiration cron job
 * Runs every hour to expire trials past 7 days
 */
export function startTrialExpirationCron(): void {
  if (trialExpirationInterval) {
    console.log('[Cron] Trial expiration job already scheduled');
    return;
  }

  console.log('[Cron] Starting trial expiration cron job (every hour)');

  // Run immediately on startup
  expireTrials().catch(err => {
    console.error('[Cron] Trial expiration job failed:', err);
  });

  // Then run every hour
  trialExpirationInterval = setInterval(() => {
    console.log('[Cron] Running scheduled trial expiration job');
    expireTrials().catch(err => {
      console.error('[Cron] Trial expiration job failed:', err);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log('[Cron] Trial expiration cron job scheduled successfully');
}

/**
 * Start the winback email cron job
 * Runs daily at 10am to send winback emails to churned trials
 */
export function startWinbackEmailCron(): void {
  if (winbackEmailInterval) {
    console.log('[Cron] Winback email job already scheduled');
    return;
  }

  const msUntil10AM = getMillisecondsUntilNext10AM();
  const hoursUntil = Math.round(msUntil10AM / (1000 * 60 * 60) * 10) / 10;
  
  console.log(`[Cron] Scheduling winback emails - first run in ${hoursUntil} hours (at 10:00 AM)`);

  // Schedule first run at 10am
  setTimeout(() => {
    console.log('[Cron] Running scheduled winback email job (10:00 AM)');
    sendWinbackEmails().catch(err => {
      console.error('[Cron] Winback email job failed:', err);
    });

    // Then run every 24 hours
    winbackEmailInterval = setInterval(() => {
      console.log('[Cron] Running scheduled winback email job (daily)');
      sendWinbackEmails().catch(err => {
        console.error('[Cron] Winback email job failed:', err);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  }, msUntil10AM);

  console.log('[Cron] Winback email cron job scheduled successfully');
}

/**
 * Start the round unlock cron job
 * Runs every hour to check for rounds that should be unlocked
 */
export function startRoundUnlockCron(): void {
  if (roundUnlockInterval) {
    console.log('[Cron] Round unlock job already scheduled');
    return;
  }

  console.log('[Cron] Starting round unlock cron job (every hour)');

  // Run immediately on startup
  checkRoundUnlocks().catch(err => {
    console.error('[Cron] Round unlock job failed:', err);
  });

  // Then run every hour
  roundUnlockInterval = setInterval(() => {
    console.log('[Cron] Running scheduled round unlock job');
    checkRoundUnlocks().catch(err => {
      console.error('[Cron] Round unlock job failed:', err);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log('[Cron] Round unlock cron job scheduled successfully');
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs(): void {
  if (deadlineNotificationInterval) {
    clearInterval(deadlineNotificationInterval);
    deadlineNotificationInterval = null;
    console.log('[Cron] Deadline notification cron job stopped');
  }
  if (smsNotificationInterval) {
    clearInterval(smsNotificationInterval);
    smsNotificationInterval = null;
    console.log('[Cron] SMS notification cron job stopped');
  }
  if (trialEmailInterval) {
    clearInterval(trialEmailInterval);
    trialEmailInterval = null;
    console.log('[Cron] Trial email cron job stopped');
  }
  if (trialExpirationInterval) {
    clearInterval(trialExpirationInterval);
    trialExpirationInterval = null;
    console.log('[Cron] Trial expiration cron job stopped');
  }
  if (winbackEmailInterval) {
    clearInterval(winbackEmailInterval);
    winbackEmailInterval = null;
    console.log('[Cron] Winback email cron job stopped');
  }
  if (roundUnlockInterval) {
    clearInterval(roundUnlockInterval);
    roundUnlockInterval = null;
    console.log('[Cron] Round unlock cron job stopped');
  }
}

/**
 * Start all cron jobs
 * Called once when the server starts
 */
export function startAllCronJobs(): void {
  if (cronJobsStarted) {
    console.log('[Cron] Cron jobs already started, skipping');
    return;
  }

  console.log('[Cron] Starting all cron jobs...');
  
  // Start deadline notification cron
  startDeadlineNotificationCron();
  
  // Start SMS notification cron
  startSMSNotificationCron();
  
  // V2 - Start trial management cron jobs
  startTrialEmailCron();
  startTrialExpirationCron();
  startWinbackEmailCron();
  startRoundUnlockCron();
  
  // IdentityIQ payment cron jobs - DISABLED: Uses non-existent columns
  // startIdentityIQPaymentCron();
  // startIdentityIQRetryCron();
  // startIdentityIQSyncCron();
  
  // IdentityIQ enrollment and credit pull cron jobs - DISABLED: Uses non-existent columns
  // startIdentityIQEnrollmentCron();
  // startIdentityIQCreditPullCron();
  // startIdentityIQTrialCancellationCron();
  
  cronJobsStarted = true;
  console.log('[Cron] All cron jobs started successfully');
}

/**
 * Get cron job status
 */
export function getCronJobStatus(): {
  deadlineNotifications: {
    active: boolean;
    nextRun: Date | null;
  };
  trialEmails: {
    active: boolean;
  };
  trialExpiration: {
    active: boolean;
  };
  winbackEmails: {
    active: boolean;
    nextRun: Date | null;
  };
  roundUnlocks: {
    active: boolean;
  };
} {
  const now = new Date();
  const next9AM = new Date(now);
  next9AM.setHours(9, 0, 0, 0);
  if (now >= next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }

  const next10AM = new Date(now);
  next10AM.setHours(10, 0, 0, 0);
  if (now >= next10AM) {
    next10AM.setDate(next10AM.getDate() + 1);
  }

  return {
    deadlineNotifications: {
      active: deadlineNotificationInterval !== null || cronJobsStarted,
      nextRun: cronJobsStarted ? next9AM : null,
    },
    trialEmails: {
      active: trialEmailInterval !== null,
    },
    trialExpiration: {
      active: trialExpirationInterval !== null,
    },
    winbackEmails: {
      active: winbackEmailInterval !== null,
      nextRun: cronJobsStarted ? next10AM : null,
    },
    roundUnlocks: {
      active: roundUnlockInterval !== null,
    },
  };
}

// ============================================
// IDENTITYIQ PAYMENT CRON JOBS
// ============================================

/**
 * Helper function to get milliseconds until a specific time
 */
function getMsUntilTime(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date(now);
  
  target.setHours(hour, minute, 0, 0);
  
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
}

/**
 * Start the IdentityIQ monthly payment cron job
 * Runs daily at 2:00 AM server time
 */
export function startIdentityIQPaymentCron(): void {
  if (identityiqPaymentInterval) {
    console.log('[Cron] IdentityIQ payment job already scheduled');
    return;
  }

  console.log('[Cron] Starting IdentityIQ payment cron job (daily at 2am)');

  const msUntil2AM = getMsUntilTime(2, 0);

  // Schedule first run at 2am
  setTimeout(() => {
    console.log('[Cron] Running scheduled IdentityIQ payment job (2:00 AM)');
    processIdentityIQMonthlyPayments().catch(err => {
      console.error('[Cron] IdentityIQ payment job failed:', err);
    });

    // Then run every 24 hours
    identityiqPaymentInterval = setInterval(() => {
      console.log('[Cron] Running scheduled IdentityIQ payment job (daily)');
      processIdentityIQMonthlyPayments().catch(err => {
        console.error('[Cron] IdentityIQ payment job failed:', err);
      });
    }, 24 * 60 * 60 * 1000);
  }, msUntil2AM);

  console.log('[Cron] IdentityIQ payment cron job scheduled successfully');
}

/**
 * Start the IdentityIQ retry cron job
 * Runs daily at 11:00 AM server time
 */
export function startIdentityIQRetryCron(): void {
  if (identityiqRetryInterval) {
    console.log('[Cron] IdentityIQ retry job already scheduled');
    return;
  }

  console.log('[Cron] Starting IdentityIQ retry cron job (daily at 11am)');

  const msUntil11AM = getMsUntilTime(11, 0);

  // Schedule first run at 11am
  setTimeout(() => {
    console.log('[Cron] Running scheduled IdentityIQ retry job (11:00 AM)');
    retryFailedIdentityIQPayments().catch(err => {
      console.error('[Cron] IdentityIQ retry job failed:', err);
    });

    // Then run every 24 hours
    identityiqRetryInterval = setInterval(() => {
      console.log('[Cron] Running scheduled IdentityIQ retry job (daily)');
      retryFailedIdentityIQPayments().catch(err => {
        console.error('[Cron] IdentityIQ retry job failed:', err);
      });
    }, 24 * 60 * 60 * 1000);
  }, msUntil11AM);

  console.log('[Cron] IdentityIQ retry cron job scheduled successfully');
}

/**
 * Start the IdentityIQ sync cron job
 * Runs every hour
 */
export function startIdentityIQSyncCron(): void {
  if (identityiqSyncInterval) {
    console.log('[Cron] IdentityIQ sync job already scheduled');
    return;
  }

  console.log('[Cron] Starting IdentityIQ sync cron job (every hour)');

  // Run immediately on startup
  syncCanceledSubscriptions().catch(err => {
    console.error('[Cron] IdentityIQ sync job failed:', err);
  });

  // Then run every hour
  identityiqSyncInterval = setInterval(() => {
    console.log('[Cron] Running scheduled IdentityIQ sync job');
    syncCanceledSubscriptions().catch(err => {
      console.error('[Cron] IdentityIQ sync job failed:', err);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log('[Cron] IdentityIQ sync cron job scheduled successfully');
}

/**
 * Start the IdentityIQ enrollment cron job
 * Runs every 5 minutes to process pending enrollments
 */
export function startIdentityIQEnrollmentCron(): void {
  if (identityiqEnrollmentInterval) {
    console.log('[Cron] IdentityIQ enrollment job already scheduled');
    return;
  }

  console.log('[Cron] Starting IdentityIQ enrollment cron job (every 5 minutes)');

  // Run immediately on startup
  processPendingEnrollments().catch(err => {
    console.error('[Cron] IdentityIQ enrollment job failed:', err);
  });

  // Then run every 5 minutes
  identityiqEnrollmentInterval = setInterval(() => {
    console.log('[Cron] Running scheduled IdentityIQ enrollment job');
    processPendingEnrollments().catch(err => {
      console.error('[Cron] IdentityIQ enrollment job failed:', err);
    });
  }, 5 * 60 * 1000); // 5 minutes

  console.log('[Cron] IdentityIQ enrollment cron job scheduled successfully');
}

/**
 * Start the IdentityIQ credit pull retry cron job
 * Runs hourly to retry failed credit report pulls
 */
export function startIdentityIQCreditPullCron(): void {
  if (identityiqCreditPullInterval) {
    console.log('[Cron] IdentityIQ credit pull job already scheduled');
    return;
  }

  console.log('[Cron] Starting IdentityIQ credit pull retry cron job (every hour)');

  // Run immediately on startup
  retryFailedCreditPulls().catch(err => {
    console.error('[Cron] IdentityIQ credit pull job failed:', err);
  });

  // Then run every hour
  identityiqCreditPullInterval = setInterval(() => {
    console.log('[Cron] Running scheduled IdentityIQ credit pull retry job');
    retryFailedCreditPulls().catch(err => {
      console.error('[Cron] IdentityIQ credit pull job failed:', err);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log('[Cron] IdentityIQ credit pull retry cron job scheduled successfully');
}

/**
 * Start the IdentityIQ trial cancellation cron job
 * Runs daily at 2am to cancel IdentityIQ for expired trials
 */
export function startIdentityIQTrialCancellationCron(): void {
  if (identityiqTrialCancellationInterval) {
    console.log('[Cron] IdentityIQ trial cancellation job already scheduled');
    return;
  }

  // Calculate milliseconds until next 2am
  const now = new Date();
  const next2AM = new Date(now);
  next2AM.setHours(2, 0, 0, 0);
  if (now >= next2AM) {
    next2AM.setDate(next2AM.getDate() + 1);
  }
  const msUntil2AM = next2AM.getTime() - now.getTime();
  const hoursUntil = Math.round(msUntil2AM / (1000 * 60 * 60) * 10) / 10;
  
  console.log(`[Cron] Scheduling IdentityIQ trial cancellations - first run in ${hoursUntil} hours (at 2:00 AM)`);

  // Schedule first run at 2am
  setTimeout(() => {
    console.log('[Cron] Running scheduled IdentityIQ trial cancellation job (2:00 AM)');
    cancelExpiredTrialSubscriptions().catch(err => {
      console.error('[Cron] IdentityIQ trial cancellation job failed:', err);
    });

    // Then run every 24 hours
    identityiqTrialCancellationInterval = setInterval(() => {
      console.log('[Cron] Running scheduled IdentityIQ trial cancellation job (daily)');
      cancelExpiredTrialSubscriptions().catch(err => {
        console.error('[Cron] IdentityIQ trial cancellation job failed:', err);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  }, msUntil2AM);

  console.log('[Cron] IdentityIQ trial cancellation cron job scheduled successfully');
}
