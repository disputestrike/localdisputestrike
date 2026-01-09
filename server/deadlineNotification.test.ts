import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

// Mock the email service
vi.mock('./emailService', () => ({
  sendEmail: vi.fn(),
}));

import { getDb } from './db';
import { sendEmail } from './emailService';

describe('Deadline Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findApproachingDeadlines', () => {
    it('should find letters with deadlines matching the target day', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            letterId: 1,
            userId: 100,
            userEmail: 'test@example.com',
            userName: 'Test User',
            bureau: 'transunion',
            deadline: new Date(),
          },
        ]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { findApproachingDeadlines } = await import('./deadlineNotificationService');
      const results = await findApproachingDeadlines(7);

      expect(results).toHaveLength(1);
      expect(results[0].userEmail).toBe('test@example.com');
      expect(results[0].daysRemaining).toBe(7);
    });

    it('should return empty array when db is not available', async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const { findApproachingDeadlines } = await import('./deadlineNotificationService');
      const results = await findApproachingDeadlines(7);

      expect(results).toEqual([]);
    });
  });

  describe('sendDeadlineNotification', () => {
    it('should send email with correct subject for 7-day reminder', async () => {
      vi.mocked(sendEmail).mockResolvedValue(true);

      const { sendDeadlineNotification } = await import('./deadlineNotificationService');
      
      const notification = {
        letterId: 1,
        userId: 100,
        userEmail: 'test@example.com',
        userName: 'Test User',
        bureau: 'transunion',
        deadline: new Date(),
        daysRemaining: 7,
      };

      const result = await sendDeadlineNotification(notification);

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Reminder'),
        })
      );
    });

    it('should send URGENT email for 3-day reminder', async () => {
      vi.mocked(sendEmail).mockResolvedValue(true);

      const { sendDeadlineNotification } = await import('./deadlineNotificationService');
      
      const notification = {
        letterId: 1,
        userId: 100,
        userEmail: 'test@example.com',
        userName: 'Test User',
        bureau: 'equifax',
        deadline: new Date(),
        daysRemaining: 3,
      };

      const result = await sendDeadlineNotification(notification);

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('URGENT'),
        })
      );
    });

    it('should skip sending if no email address', async () => {
      const { sendDeadlineNotification } = await import('./deadlineNotificationService');
      
      const notification = {
        letterId: 1,
        userId: 100,
        userEmail: '',
        userName: 'Test User',
        bureau: 'experian',
        deadline: new Date(),
        daysRemaining: 7,
      };

      const result = await sendDeadlineNotification(notification);

      expect(result).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('processDeadlineNotifications', () => {
    it('should process all notifications and return counts', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            letterId: 1,
            userId: 100,
            userEmail: 'test1@example.com',
            userName: 'User 1',
            bureau: 'transunion',
            deadline: new Date(),
          },
          {
            letterId: 2,
            userId: 101,
            userEmail: 'test2@example.com',
            userName: 'User 2',
            bureau: 'equifax',
            deadline: new Date(),
          },
        ]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      vi.mocked(sendEmail).mockResolvedValue(true);

      const { processDeadlineNotifications } = await import('./deadlineNotificationService');
      const result = await processDeadlineNotifications(7);

      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
    });
  });

  describe('Email Content', () => {
    it('should include bureau name in email', async () => {
      vi.mocked(sendEmail).mockResolvedValue(true);

      const { sendDeadlineNotification } = await import('./deadlineNotificationService');
      
      await sendDeadlineNotification({
        letterId: 1,
        userId: 100,
        userEmail: 'test@example.com',
        userName: 'Test User',
        bureau: 'experian',
        deadline: new Date(),
        daysRemaining: 7,
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Experian'),
          text: expect.stringContaining('Experian'),
        })
      );
    });

    it('should include FCRA violation warning', async () => {
      vi.mocked(sendEmail).mockResolvedValue(true);

      const { sendDeadlineNotification } = await import('./deadlineNotificationService');
      
      await sendDeadlineNotification({
        letterId: 1,
        userId: 100,
        userEmail: 'test@example.com',
        userName: 'Test User',
        bureau: 'transunion',
        deadline: new Date(),
        daysRemaining: 3,
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('FCRA violation'),
        })
      );
    });
  });
});

describe('Deadline Calculation', () => {
  it('should correctly calculate days remaining', () => {
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 7);

    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    expect(daysRemaining).toBe(7);
  });

  it('should handle same-day deadlines', () => {
    const today = new Date();
    const deadline = new Date(today);

    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    expect(daysRemaining).toBeLessThanOrEqual(1);
  });
});
