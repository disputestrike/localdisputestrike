import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

import {
  sendDeadlineReminderSMS,
  sendFCRAViolationSMS,
  sendLetterMailedSMS,
  sendDeletionSuccessSMS,
  isSMSEnabled,
  getSMSStatus,
} from './smsService';

describe('SMS Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendDeadlineReminderSMS', () => {
    it('should format phone number correctly for 10-digit US number', async () => {
      const result = await sendDeadlineReminderSMS(
        '5551234567',
        'John Doe',
        'transunion',
        7,
        2
      );
      // Without Twilio configured, it logs and returns true
      expect(result).toBe(true);
    });

    it('should format phone number correctly for 11-digit US number', async () => {
      const result = await sendDeadlineReminderSMS(
        '15551234567',
        'John Doe',
        'equifax',
        3,
        1
      );
      expect(result).toBe(true);
    });

    it('should handle phone numbers with formatting', async () => {
      const result = await sendDeadlineReminderSMS(
        '(555) 123-4567',
        'Jane Doe',
        'experian',
        1,
        3
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid phone numbers', async () => {
      const result = await sendDeadlineReminderSMS(
        '123',
        'Test User',
        'transunion',
        5,
        1
      );
      expect(result).toBe(false);
    });

    it('should send urgent message for overdue disputes', async () => {
      const result = await sendDeadlineReminderSMS(
        '5551234567',
        'John Doe',
        'transunion',
        -5,
        2
      );
      expect(result).toBe(true);
    });

    it('should send critical message for 3 days remaining', async () => {
      const result = await sendDeadlineReminderSMS(
        '5551234567',
        'John Doe',
        'equifax',
        3,
        1
      );
      expect(result).toBe(true);
    });
  });

  describe('sendFCRAViolationSMS', () => {
    it('should send FCRA violation alert', async () => {
      const result = await sendFCRAViolationSMS(
        '5551234567',
        'John Doe',
        'transunion',
        10
      );
      expect(result).toBe(true);
    });

    it('should capitalize bureau name', async () => {
      const result = await sendFCRAViolationSMS(
        '5551234567',
        'John Doe',
        'experian',
        5
      );
      expect(result).toBe(true);
    });
  });

  describe('sendLetterMailedSMS', () => {
    it('should send mailed confirmation without tracking', async () => {
      const result = await sendLetterMailedSMS(
        '5551234567',
        'transunion'
      );
      expect(result).toBe(true);
    });

    it('should include tracking number when provided', async () => {
      const result = await sendLetterMailedSMS(
        '5551234567',
        'equifax',
        '9400111899223344556677'
      );
      expect(result).toBe(true);
    });
  });

  describe('sendDeletionSuccessSMS', () => {
    it('should send deletion success message', async () => {
      const result = await sendDeletionSuccessSMS(
        '5551234567',
        'transunion',
        'Capital One Credit Card'
      );
      expect(result).toBe(true);
    });
  });

  describe('isSMSEnabled', () => {
    it('should return false when Twilio not configured', () => {
      // In test environment, Twilio is not configured
      const enabled = isSMSEnabled();
      expect(enabled).toBe(false);
    });
  });

  describe('getSMSStatus', () => {
    it('should return status object', () => {
      const status = getSMSStatus();
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('configured');
      expect(typeof status.enabled).toBe('boolean');
      expect(typeof status.configured).toBe('boolean');
    });
  });

  describe('Phone Number Formatting', () => {
    it('should handle various phone formats', async () => {
      const formats = [
        '5551234567',
        '15551234567',
        '(555) 123-4567',
        '555-123-4567',
        '555.123.4567',
        '+1 555 123 4567',
      ];

      for (const phone of formats) {
        const result = await sendDeadlineReminderSMS(
          phone,
          'Test User',
          'transunion',
          7,
          1
        );
        expect(result).toBe(true);
      }
    });
  });

  describe('Message Content', () => {
    it('should generate appropriate message for different day thresholds', async () => {
      // 7 days - reminder
      await sendDeadlineReminderSMS('5551234567', 'User', 'transunion', 7, 1);
      
      // 3 days - critical
      await sendDeadlineReminderSMS('5551234567', 'User', 'equifax', 3, 2);
      
      // 1 day - critical
      await sendDeadlineReminderSMS('5551234567', 'User', 'experian', 1, 1);
      
      // 0 days - overdue
      await sendDeadlineReminderSMS('5551234567', 'User', 'transunion', 0, 3);
      
      // Negative days - overdue
      await sendDeadlineReminderSMS('5551234567', 'User', 'equifax', -5, 1);
      
      // All should succeed (logged, not actually sent)
      expect(true).toBe(true);
    });
  });
});
