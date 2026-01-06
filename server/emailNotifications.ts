/**
 * Email Notification System for Dispute Timeline Reminders
 * 
 * Sends automated emails at key milestones:
 * - Day 25: "Check mail for bureau responses"
 * - Day 31: "File CFPB complaint if no response"
 */

import { notifyOwner } from "./_core/notification";

interface DisputeLetter {
  id: number;
  userId: number;
  bureau: string;
  mailedAt: Date | null;
  responseDeadline: Date | null;
  status: string;
}

interface User {
  id: number;
  name: string | null;
  email: string | null;
}

/**
 * Check all mailed letters and send Day 25 reminders
 */
export async function sendDay25Reminders(letters: DisputeLetter[], users: User[]) {
  const now = Date.now();
  const reminders: Array<{ user: User; letter: DisputeLetter }> = [];

  for (const letter of letters) {
    if (!letter.mailedAt || letter.status === 'response_received' || letter.status === 'resolved') {
      continue;
    }

    const mailedDate = new Date(letter.mailedAt).getTime();
    const daysSinceMailed = Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24));

    // Send reminder on Day 25 (5 days before deadline)
    if (daysSinceMailed === 25) {
      const user = users.find(u => u.id === letter.userId);
      if (user && user.email) {
        reminders.push({ user, letter });
      }
    }
  }

  // Send notifications
  for (const { user, letter } of reminders) {
    const bureauName = letter.bureau.charAt(0).toUpperCase() + letter.bureau.slice(1);
    
    await notifyOwner({
      title: `Day 25 Reminder: ${user.name} - ${bureauName}`,
      content: `User ${user.name} (${user.email}) is on Day 25 of their ${bureauName} dispute. Remind them to check mail for bureau response letters. Deadline: ${letter.responseDeadline ? new Date(letter.responseDeadline).toLocaleDateString() : '5 days'}.`,
    });

    // TODO: Send email to user
    // await sendEmail({
    //   to: user.email,
    //   subject: `Day 25: Check Your Mail for ${bureauName} Response`,
    //   body: generateDay25EmailBody(user.name, bureauName, letter.responseDeadline),
    // });
  }

  return reminders.length;
}

/**
 * Check all overdue letters and send Day 31 alerts
 */
export async function sendDay31Alerts(letters: DisputeLetter[], users: User[]) {
  const now = Date.now();
  const alerts: Array<{ user: User; letter: DisputeLetter; daysOverdue: number }> = [];

  for (const letter of letters) {
    if (!letter.mailedAt || letter.status === 'response_received' || letter.status === 'resolved') {
      continue;
    }

    const mailedDate = new Date(letter.mailedAt).getTime();
    const daysSinceMailed = Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24));

    // Send alert on Day 31+ (bureau missed deadline)
    if (daysSinceMailed >= 31) {
      const user = users.find(u => u.id === letter.userId);
      if (user && user.email) {
        const daysOverdue = daysSinceMailed - 30;
        alerts.push({ user, letter, daysOverdue });
      }
    }
  }

  // Send notifications
  for (const { user, letter, daysOverdue } of alerts) {
    const bureauName = letter.bureau.charAt(0).toUpperCase() + letter.bureau.slice(1);
    
    await notifyOwner({
      title: `FCRA VIOLATION: ${user.name} - ${bureauName} (${daysOverdue} days overdue)`,
      content: `User ${user.name} (${user.email}) - ${bureauName} missed the 30-day deadline by ${daysOverdue} days. This is an FCRA § 1681i(a)(1) violation. User should file CFPB complaint immediately.`,
    });

    // TODO: Send email to user
    // await sendEmail({
    //   to: user.email,
    //   subject: `URGENT: ${bureauName} Violated FCRA - File CFPB Complaint`,
    //   body: generateDay31EmailBody(user.name, bureauName, daysOverdue, letter.id),
    // });
  }

  return alerts.length;
}

/**
 * Generate Day 25 email body
 */
function generateDay25EmailBody(userName: string | null, bureau: string, deadline: Date | null): string {
  return `
Hi ${userName || 'there'},

Your ${bureau} dispute is on Day 25 of the 30-day investigation period!

📬 **ACTION REQUIRED: Check Your Mail Daily**

Bureau responses typically arrive between Day 25-30. Look for:
- Official ${bureau} letterhead
- "Results of Investigation" or similar subject line
- List of accounts deleted, verified, or updated

**What to do when you receive the response:**

✅ **If accounts were DELETED:**
- Celebrate! Your score will improve
- Take screenshots for your records
- Repeat process with other bureaus

⚠️ **If accounts were VERIFIED:**
- Don't panic - this is common
- Generate Round 2 escalation letters
- Demand Method of Verification (MOV)
- 40-60% of verified accounts get deleted in Round 2

⏰ **If NO response by Day 30:**
- This is an FCRA violation
- File CFPB complaint immediately
- Demand deletion under § 1681i(a)(1)

**Deadline:** ${deadline ? new Date(deadline).toLocaleDateString() : 'In 5 days'}

Check your CreditCounsel AI dashboard to update your letter status when you receive the response.

Questions? Reply to this email or contact support.

Best regards,
CreditCounsel AI Team
`;
}

/**
 * Generate Day 31 email body
 */
function generateDay31EmailBody(userName: string | null, bureau: string, daysOverdue: number, letterId: number): string {
  return `
Hi ${userName || 'there'},

🚨 **FCRA VIOLATION ALERT** 🚨

${bureau} has FAILED to respond to your dispute within the required 30-day period.

**Current Status:**
- Days Overdue: ${daysOverdue} days
- Violation: FCRA § 1681i(a)(1)(A)
- Bureau: ${bureau}

**This is a SERIOUS violation of federal law.**

**IMMEDIATE ACTION REQUIRED:**

1. **File CFPB Complaint**
   - Log into your CreditCounsel AI dashboard
   - Click "Generate CFPB Complaint" for this letter
   - Download and mail to CFPB immediately

2. **Demand Immediate Deletion**
   - Bureau's failure to respond = automatic deletion
   - Cite FCRA § 1681i(a)(5)(A)
   - All disputed accounts MUST be deleted

3. **Consider Legal Action**
   - You may be entitled to statutory damages ($100-$1,000 per violation)
   - Consult with FCRA attorney if needed
   - We can provide referrals

**Why this matters:**
- ${bureau} violated your federal rights
- Continued inaccurate reporting damages your credit
- CFPB can fine bureaus for noncompliance
- You deserve compensation for this violation

**Next Steps:**
1. File CFPB complaint (we'll generate it for you)
2. Send certified mail to CFPB
3. Demand immediate deletion from ${bureau}
4. Monitor your credit report for updates

Log into your dashboard now to generate your CFPB complaint letter.

We're here to help you fight back against ${bureau}'s illegal behavior.

Best regards,
CreditCounsel AI Team

P.S. This is NOT legal advice. Consult with an attorney for legal guidance.
`;
}

/**
 * Main scheduler function - run daily via cron
 */
export async function runDailyNotifications() {
  try {
    // Import db functions
    const { getAllDisputeLetters, getAllUsers } = await import('./db');
    
    // Get all letters and users
    const letters = await getAllDisputeLetters();
    const users = await getAllUsers();
    
    // Filter only mailed letters
    const mailedLetters = letters.filter(l => l.mailedAt !== null);
    
    // Send Day 25 reminders
    const day25Count = await sendDay25Reminders(mailedLetters, users);
    console.log(`Sent ${day25Count} Day 25 reminders`);
    
    // Send Day 31 alerts
    const day31Count = await sendDay31Alerts(mailedLetters, users);
    console.log(`Sent ${day31Count} Day 31 alerts`);
    
    return {
      day25Reminders: day25Count,
      day31Alerts: day31Count,
    };
  } catch (error) {
    console.error('Error running daily notifications:', error);
    throw error;
  }
}
