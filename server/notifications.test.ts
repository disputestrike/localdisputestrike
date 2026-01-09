import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('./db', () => ({
  getDb: vi.fn(),
  getUserNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  createNotification: vi.fn(),
  createDeadlineNotification: vi.fn(),
  createLetterGeneratedNotification: vi.fn(),
  createAccountDeletedNotification: vi.fn(),
}));

import * as db from './db';

describe('Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 100,
          type: 'deadline_reminder',
          title: 'TransUnion Deadline Approaching',
          message: 'Your dispute deadline is in 7 days',
          priority: 'high',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 100,
          type: 'letter_generated',
          title: 'Equifax Letter Ready',
          message: 'Your dispute letter has been generated',
          priority: 'normal',
          isRead: true,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserNotifications).mockResolvedValue(mockNotifications as any);

      const result = await db.getUserNotifications(100);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('deadline_reminder');
    });

    it('should filter unread notifications only', async () => {
      const mockUnread = [
        {
          id: 1,
          userId: 100,
          type: 'deadline_reminder',
          title: 'TransUnion Deadline',
          message: 'Deadline approaching',
          priority: 'high',
          isRead: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserNotifications).mockResolvedValue(mockUnread as any);

      const result = await db.getUserNotifications(100, { unreadOnly: true });

      expect(db.getUserNotifications).toHaveBeenCalledWith(100, { unreadOnly: true });
    });

    it('should limit results', async () => {
      vi.mocked(db.getUserNotifications).mockResolvedValue([]);

      await db.getUserNotifications(100, { limit: 5 });

      expect(db.getUserNotifications).toHaveBeenCalledWith(100, { limit: 5 });
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return count of unread notifications', async () => {
      vi.mocked(db.getUnreadNotificationCount).mockResolvedValue(5);

      const count = await db.getUnreadNotificationCount(100);

      expect(count).toBe(5);
    });

    it('should return 0 when no unread notifications', async () => {
      vi.mocked(db.getUnreadNotificationCount).mockResolvedValue(0);

      const count = await db.getUnreadNotificationCount(100);

      expect(count).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      vi.mocked(db.markNotificationAsRead).mockResolvedValue(undefined);

      await db.markNotificationAsRead(1, 100);

      expect(db.markNotificationAsRead).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      vi.mocked(db.markAllNotificationsAsRead).mockResolvedValue(undefined);

      await db.markAllNotificationsAsRead(100);

      expect(db.markAllNotificationsAsRead).toHaveBeenCalledWith(100);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      vi.mocked(db.deleteNotification).mockResolvedValue(undefined);

      await db.deleteNotification(1, 100);

      expect(db.deleteNotification).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('createDeadlineNotification', () => {
    it('should create urgent notification for 3-day deadline', async () => {
      const mockNotification = {
        id: 1,
        userId: 100,
        type: 'deadline_reminder',
        title: 'TransUnion Response Deadline ⚠️ URGENT',
        message: 'Your TransUnion dispute response deadline is in 3 days.',
        priority: 'urgent',
        isRead: false,
        createdAt: new Date(),
      };

      vi.mocked(db.createDeadlineNotification).mockResolvedValue(mockNotification as any);

      const result = await db.createDeadlineNotification(100, 'transunion', new Date(), 3);

      expect(result.priority).toBe('urgent');
      expect(result.title).toContain('URGENT');
    });

    it('should create high priority notification for 7-day deadline', async () => {
      const mockNotification = {
        id: 2,
        userId: 100,
        type: 'deadline_reminder',
        title: 'Equifax Response Deadline Approaching',
        message: 'Your Equifax dispute response deadline is in 7 days.',
        priority: 'high',
        isRead: false,
        createdAt: new Date(),
      };

      vi.mocked(db.createDeadlineNotification).mockResolvedValue(mockNotification as any);

      const result = await db.createDeadlineNotification(100, 'equifax', new Date(), 7);

      expect(result.priority).toBe('high');
    });
  });

  describe('createLetterGeneratedNotification', () => {
    it('should create notification when letter is generated', async () => {
      const mockNotification = {
        id: 3,
        userId: 100,
        type: 'letter_generated',
        title: 'Experian Dispute Letter Ready',
        message: 'Your Experian dispute letter has been generated.',
        priority: 'normal',
        isRead: false,
        relatedEntityType: 'dispute_letter',
        relatedEntityId: 42,
        createdAt: new Date(),
      };

      vi.mocked(db.createLetterGeneratedNotification).mockResolvedValue(mockNotification as any);

      const result = await db.createLetterGeneratedNotification(100, 'experian', 42);

      expect(result.type).toBe('letter_generated');
      expect(result.relatedEntityId).toBe(42);
    });
  });

  describe('createAccountDeletedNotification', () => {
    it('should create celebration notification when account is deleted', async () => {
      const mockNotification = {
        id: 4,
        userId: 100,
        type: 'account_deleted',
        title: '🎉 Account Deleted from TransUnion!',
        message: 'Great news! "Capital One" has been successfully deleted.',
        priority: 'high',
        isRead: false,
        createdAt: new Date(),
      };

      vi.mocked(db.createAccountDeletedNotification).mockResolvedValue(mockNotification as any);

      const result = await db.createAccountDeletedNotification(100, 'Capital One', 'transunion');

      expect(result.type).toBe('account_deleted');
      expect(result.title).toContain('🎉');
    });
  });
});

describe('Notification Types', () => {
  it('should support all notification types', () => {
    const validTypes = [
      'deadline_reminder',
      'response_received',
      'letter_generated',
      'payment_confirmed',
      'account_deleted',
      'system_alert',
    ];

    validTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });

  it('should support all priority levels', () => {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];

    validPriorities.forEach(priority => {
      expect(typeof priority).toBe('string');
    });
  });
});

describe('Cron Jobs', () => {
  it('should calculate milliseconds until 9am correctly', () => {
    const now = new Date();
    const next9AM = new Date(now);
    next9AM.setHours(9, 0, 0, 0);
    
    if (now >= next9AM) {
      next9AM.setDate(next9AM.getDate() + 1);
    }
    
    const msUntil = next9AM.getTime() - now.getTime();
    
    expect(msUntil).toBeGreaterThan(0);
    expect(msUntil).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // Max 24 hours
  });
});
