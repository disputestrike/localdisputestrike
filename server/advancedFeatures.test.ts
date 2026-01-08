import { describe, it, expect, vi } from 'vitest';

describe('Advanced Features Tests', () => {
  describe('Credit Score Simulator', () => {
    const getAccountImpact = (account: { accountType: string; balance: string; paymentStatus: string; hasConflicts: boolean }): number => {
      const balance = parseFloat(String(account.balance || '0'));
      const accountType = account.accountType?.toLowerCase() || '';
      const status = account.paymentStatus?.toLowerCase() || '';
      
      let impact = 0;
      
      if (accountType.includes('collection') || status.includes('collection')) {
        impact = balance > 1000 ? 50 : balance > 500 ? 35 : 25;
      } else if (accountType.includes('bankruptcy') || status.includes('bankruptcy')) {
        impact = 130;
      } else if (status.includes('charge') || status.includes('charged off')) {
        impact = balance > 5000 ? 60 : balance > 1000 ? 45 : 30;
      } else if (status.includes('late') || status.includes('delinquent')) {
        if (status.includes('120') || status.includes('180')) {
          impact = 40;
        } else if (status.includes('90')) {
          impact = 30;
        } else if (status.includes('60')) {
          impact = 20;
        } else if (status.includes('30')) {
          impact = 15;
        } else {
          impact = 20;
        }
      } else if (accountType.includes('foreclosure') || status.includes('foreclosure')) {
        impact = 100;
      } else {
        impact = 15;
      }
      
      if (account.hasConflicts) {
        impact = Math.round(impact * 1.1);
      }
      
      return impact;
    };

    it('should calculate high impact for collections', () => {
      const account = {
        accountType: 'Collection',
        balance: '1500',
        paymentStatus: 'In Collection',
        hasConflicts: false,
      };
      const impact = getAccountImpact(account);
      expect(impact).toBe(50);
    });

    it('should calculate medium impact for charge-offs', () => {
      const account = {
        accountType: 'Credit Card',
        balance: '2000',
        paymentStatus: 'Charged Off',
        hasConflicts: false,
      };
      const impact = getAccountImpact(account);
      expect(impact).toBe(45);
    });

    it('should calculate impact for late payments based on severity', () => {
      const late30 = getAccountImpact({
        accountType: 'Credit Card',
        balance: '500',
        paymentStatus: '30 days late',
        hasConflicts: false,
      });
      expect(late30).toBe(15);

      const late90 = getAccountImpact({
        accountType: 'Credit Card',
        balance: '500',
        paymentStatus: '90 days late',
        hasConflicts: false,
      });
      expect(late90).toBe(30);

      const late120 = getAccountImpact({
        accountType: 'Credit Card',
        balance: '500',
        paymentStatus: '120 days late',
        hasConflicts: false,
      });
      expect(late120).toBe(40);
    });

    it('should add 10% bonus impact for accounts with conflicts', () => {
      const withoutConflict = getAccountImpact({
        accountType: 'Collection',
        balance: '1500',
        paymentStatus: 'In Collection',
        hasConflicts: false,
      });
      
      const withConflict = getAccountImpact({
        accountType: 'Collection',
        balance: '1500',
        paymentStatus: 'In Collection',
        hasConflicts: true,
      });
      
      expect(withConflict).toBe(Math.round(withoutConflict * 1.1));
    });

    it('should calculate very high impact for foreclosure', () => {
      const account = {
        accountType: 'Foreclosure',
        balance: '0',
        paymentStatus: 'Foreclosed',
        hasConflicts: false,
      };
      const impact = getAccountImpact(account);
      expect(impact).toBe(100);
    });

    it('should calculate highest impact for bankruptcy', () => {
      const account = {
        accountType: 'Bankruptcy',
        balance: '0',
        paymentStatus: 'Bankruptcy Discharged',
        hasConflicts: false,
      };
      const impact = getAccountImpact(account);
      expect(impact).toBe(130);
    });
  });

  describe('Email Notification Logic', () => {
    interface DisputeLetter {
      id: number;
      userId: number;
      bureau: string;
      mailedAt: Date | null;
      status: string;
    }

    interface User {
      id: number;
      name: string | null;
      email: string | null;
    }

    const getDay25Reminders = (letters: DisputeLetter[], users: User[]) => {
      const now = new Date('2026-01-08').getTime();
      const reminders: Array<{ user: User; letter: DisputeLetter }> = [];

      for (const letter of letters) {
        if (!letter.mailedAt || letter.status === 'response_received' || letter.status === 'resolved') {
          continue;
        }

        const mailedDate = new Date(letter.mailedAt).getTime();
        const daysSinceMailed = Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24));

        if (daysSinceMailed === 25) {
          const user = users.find(u => u.id === letter.userId);
          if (user && user.email) {
            reminders.push({ user, letter });
          }
        }
      }

      return reminders;
    };

    const getDay31Alerts = (letters: DisputeLetter[], users: User[]) => {
      const now = new Date('2026-01-08').getTime();
      const alerts: Array<{ user: User; letter: DisputeLetter; daysOverdue: number }> = [];

      for (const letter of letters) {
        if (!letter.mailedAt || letter.status === 'response_received' || letter.status === 'resolved') {
          continue;
        }

        const mailedDate = new Date(letter.mailedAt).getTime();
        const daysSinceMailed = Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24));

        if (daysSinceMailed >= 31) {
          const user = users.find(u => u.id === letter.userId);
          if (user && user.email) {
            const daysOverdue = daysSinceMailed - 30;
            alerts.push({ user, letter, daysOverdue });
          }
        }
      }

      return alerts;
    };

    it('should identify Day 25 reminders correctly', () => {
      const letters: DisputeLetter[] = [
        { id: 1, userId: 1, bureau: 'transunion', mailedAt: new Date('2025-12-14'), status: 'mailed' }, // 25 days
        { id: 2, userId: 2, bureau: 'equifax', mailedAt: new Date('2025-12-20'), status: 'mailed' }, // 19 days
      ];
      const users: User[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      const reminders = getDay25Reminders(letters, users);
      expect(reminders.length).toBe(1);
      expect(reminders[0].letter.id).toBe(1);
    });

    it('should identify Day 31+ overdue alerts correctly', () => {
      const letters: DisputeLetter[] = [
        { id: 1, userId: 1, bureau: 'transunion', mailedAt: new Date('2025-12-01'), status: 'mailed' }, // 38 days
        { id: 2, userId: 2, bureau: 'equifax', mailedAt: new Date('2025-12-20'), status: 'mailed' }, // 19 days
      ];
      const users: User[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      const alerts = getDay31Alerts(letters, users);
      expect(alerts.length).toBe(1);
      expect(alerts[0].letter.id).toBe(1);
      expect(alerts[0].daysOverdue).toBe(8);
    });

    it('should skip resolved letters', () => {
      const letters: DisputeLetter[] = [
        { id: 1, userId: 1, bureau: 'transunion', mailedAt: new Date('2025-12-01'), status: 'resolved' },
      ];
      const users: User[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
      ];

      const alerts = getDay31Alerts(letters, users);
      expect(alerts.length).toBe(0);
    });

    it('should skip users without email', () => {
      const letters: DisputeLetter[] = [
        { id: 1, userId: 1, bureau: 'transunion', mailedAt: new Date('2025-12-14'), status: 'mailed' },
      ];
      const users: User[] = [
        { id: 1, name: 'John', email: null },
      ];

      const reminders = getDay25Reminders(letters, users);
      expect(reminders.length).toBe(0);
    });
  });

  describe('Round 2 Letter Generation', () => {
    it('should generate Round 2 input correctly', () => {
      const originalLetter = {
        id: 1,
        bureau: 'transunion',
        accountsDisputed: JSON.stringify([101, 102, 103]),
      };
      
      const round2Data = {
        originalLetterId: 1,
        reason: 'Balance is incorrect',
        currentAddress: '123 Main St, City, State 12345',
      };

      const accountsDisputed = JSON.parse(originalLetter.accountsDisputed);
      const verifiedAccounts = accountsDisputed.map((id: number) => ({
        id,
        accountName: `Account #${id}`,
        reason: round2Data.reason,
      }));

      expect(verifiedAccounts.length).toBe(3);
      expect(verifiedAccounts[0].id).toBe(101);
      expect(verifiedAccounts[0].reason).toBe('Balance is incorrect');
    });

    it('should handle empty accounts list', () => {
      const originalLetter = {
        id: 1,
        bureau: 'transunion',
        accountsDisputed: '[]',
      };

      const accountsDisputed = JSON.parse(originalLetter.accountsDisputed);
      expect(accountsDisputed.length).toBe(0);
    });
  });

  describe('Notification Alerts API', () => {
    it('should categorize alerts correctly', () => {
      const now = new Date('2026-01-08').getTime();
      
      const categorizeAlert = (mailedAt: Date, status: string) => {
        if (status === 'resolved' || status === 'response_received') {
          return null;
        }
        
        const mailedDate = new Date(mailedAt).getTime();
        const daysSinceMailed = Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceMailed >= 25 && daysSinceMailed <= 30) {
          return 'approaching';
        } else if (daysSinceMailed > 30) {
          return 'overdue';
        }
        return null;
      };

      expect(categorizeAlert(new Date('2025-12-14'), 'mailed')).toBe('approaching'); // 25 days
      expect(categorizeAlert(new Date('2025-12-10'), 'mailed')).toBe('approaching'); // 29 days
      expect(categorizeAlert(new Date('2025-12-01'), 'mailed')).toBe('overdue'); // 38 days
      expect(categorizeAlert(new Date('2025-12-20'), 'mailed')).toBe(null); // 19 days
      expect(categorizeAlert(new Date('2025-12-01'), 'resolved')).toBe(null); // resolved
    });
  });
});
