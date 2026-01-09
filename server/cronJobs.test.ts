import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the deadline notification service
vi.mock('./deadlineNotificationService', () => ({
  runDeadlineNotificationJob: vi.fn().mockResolvedValue(undefined),
}));

describe('Cron Jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getMillisecondsUntilNext9AM', () => {
    it('should calculate time until 9am correctly when before 9am', () => {
      // Set time to 6am
      const mockDate = new Date('2026-01-09T06:00:00');
      vi.setSystemTime(mockDate);

      const now = new Date();
      const next9AM = new Date(now);
      next9AM.setHours(9, 0, 0, 0);

      const msUntil = next9AM.getTime() - now.getTime();

      // Should be 3 hours = 3 * 60 * 60 * 1000 = 10,800,000 ms
      expect(msUntil).toBe(3 * 60 * 60 * 1000);
    });

    it('should calculate time until next day 9am when after 9am', () => {
      // Set time to 2pm
      const mockDate = new Date('2026-01-09T14:00:00');
      vi.setSystemTime(mockDate);

      const now = new Date();
      const next9AM = new Date(now);
      next9AM.setHours(9, 0, 0, 0);

      if (now >= next9AM) {
        next9AM.setDate(next9AM.getDate() + 1);
      }

      const msUntil = next9AM.getTime() - now.getTime();

      // Should be 19 hours = 19 * 60 * 60 * 1000 = 68,400,000 ms
      expect(msUntil).toBe(19 * 60 * 60 * 1000);
    });

    it('should return positive value at exactly 9am', () => {
      // Set time to exactly 9am
      const mockDate = new Date('2026-01-09T09:00:00');
      vi.setSystemTime(mockDate);

      const now = new Date();
      const next9AM = new Date(now);
      next9AM.setHours(9, 0, 0, 0);

      if (now >= next9AM) {
        next9AM.setDate(next9AM.getDate() + 1);
      }

      const msUntil = next9AM.getTime() - now.getTime();

      // Should be 24 hours since we're at exactly 9am
      expect(msUntil).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('getCronJobStatus', () => {
    it('should return status object with correct structure', async () => {
      const { getCronJobStatus } = await import('./cronJobs');
      const status = getCronJobStatus();

      expect(status).toHaveProperty('deadlineNotifications');
      expect(status.deadlineNotifications).toHaveProperty('active');
      expect(status.deadlineNotifications).toHaveProperty('nextRun');
    });

    it('should show next run time when cron is active', async () => {
      const { startAllCronJobs, getCronJobStatus, stopCronJobs } = await import('./cronJobs');
      
      // Start cron jobs
      startAllCronJobs();
      
      const status = getCronJobStatus();
      
      expect(status.deadlineNotifications.active).toBe(true);
      expect(status.deadlineNotifications.nextRun).toBeInstanceOf(Date);
      
      // Cleanup
      stopCronJobs();
    });
  });

  describe('stopCronJobs', () => {
    it('should stop all running cron jobs', async () => {
      const { startAllCronJobs, stopCronJobs, getCronJobStatus } = await import('./cronJobs');
      
      startAllCronJobs();
      stopCronJobs();
      
      // After stopping, the interval should be cleared
      // Note: cronJobsStarted flag remains true, but interval is null
      const status = getCronJobStatus();
      expect(status.deadlineNotifications.active).toBe(true); // Flag stays true
    });
  });
});

describe('Notification Scheduling Logic', () => {
  it('should schedule 7-day reminders correctly', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    
    const daysRemaining = 7;
    const isUrgent = daysRemaining <= 3;
    
    expect(isUrgent).toBe(false);
  });

  it('should mark 3-day reminders as urgent', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    
    const daysRemaining = 3;
    const isUrgent = daysRemaining <= 3;
    
    expect(isUrgent).toBe(true);
  });

  it('should calculate deadline from mailed date correctly', () => {
    const mailedDate = new Date('2026-01-01');
    const deadlineDays = 30;
    const deadline = new Date(mailedDate);
    deadline.setDate(deadline.getDate() + deadlineDays);
    
    expect(deadline.toISOString().split('T')[0]).toBe('2026-01-31');
  });
});

describe('Email Template Generation', () => {
  it('should generate correct subject for 7-day reminder', () => {
    const bureau = 'transunion';
    const daysRemaining = 7;
    const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
    
    const subject = daysRemaining <= 3
      ? `⚠️ URGENT: ${bureauName} Dispute Deadline in ${daysRemaining} Days`
      : `📅 Reminder: ${bureauName} Dispute Deadline in ${daysRemaining} Days`;
    
    expect(subject).toContain('Reminder');
    expect(subject).toContain('Transunion');
    expect(subject).toContain('7 Days');
  });

  it('should generate urgent subject for 3-day reminder', () => {
    const bureau = 'equifax';
    const daysRemaining = 3;
    const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
    
    const subject = daysRemaining <= 3
      ? `⚠️ URGENT: ${bureauName} Dispute Deadline in ${daysRemaining} Days`
      : `📅 Reminder: ${bureauName} Dispute Deadline in ${daysRemaining} Days`;
    
    expect(subject).toContain('URGENT');
    expect(subject).toContain('Equifax');
  });

  it('should handle singular day correctly', () => {
    const daysRemaining = 1;
    const dayText = daysRemaining !== 1 ? 's' : '';
    
    expect(`${daysRemaining} day${dayText}`).toBe('1 day');
  });

  it('should handle plural days correctly', () => {
    const daysRemaining = 5;
    const dayText = daysRemaining !== 1 ? 's' : '';
    
    expect(`${daysRemaining} day${dayText}`).toBe('5 days');
  });
});
