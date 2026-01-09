/**
 * Cron Job Scheduler
 * Handles scheduled tasks like deadline notifications
 */

import { runDeadlineNotificationJob } from './deadlineNotificationService';

// Track if cron jobs are already running
let cronJobsStarted = false;

// Store interval IDs for cleanup
let deadlineNotificationInterval: NodeJS.Timeout | null = null;

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
 * Stop all cron jobs
 */
export function stopCronJobs(): void {
  if (deadlineNotificationInterval) {
    clearInterval(deadlineNotificationInterval);
    deadlineNotificationInterval = null;
    console.log('[Cron] Deadline notification cron job stopped');
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
} {
  const now = new Date();
  const next9AM = new Date(now);
  next9AM.setHours(9, 0, 0, 0);
  if (now >= next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }

  return {
    deadlineNotifications: {
      active: deadlineNotificationInterval !== null || cronJobsStarted,
      nextRun: cronJobsStarted ? next9AM : null,
    },
  };
}
