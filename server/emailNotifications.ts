/**
 * Email Notification System for Dispute Timeline Reminders
 * 
 * Sends automated emails at key milestones:
 * - Day 25: "Check mail for bureau responses"
 * - Day 31: "File CFPB complaint if no response"
 */

import { notifyOwner } from "./_core/notification";
import { sendEmail } from "./emailService";

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

    // Send email to user
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: `⏰ Day 25: Check Your Mail for ${bureauName} Response`,
        html: generateDay25EmailHtml(user.name, bureauName, letter.responseDeadline),
      });
    }
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

    // Send email to user
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: `🚨 URGENT: ${bureauName} Violated FCRA - File CFPB Complaint`,
        html: generateDay31EmailHtml(user.name, bureauName, daysOverdue, letter.id),
      });
    }
  }

  return alerts.length;
}

/**
 * Generate Day 25 email HTML
 */
function generateDay25EmailHtml(userName: string | null, bureau: string, deadline: Date | null): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f8fafc; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .deadline { font-size: 24px; font-weight: bold; color: #ea580c; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Day 25 - Check Your Mail!</h1>
    <p>Your ${bureau} dispute deadline is approaching</p>
  </div>
  <div class="content">
    <p>Hi ${userName || 'there'},</p>
    <p>Your <strong>${bureau}</strong> dispute is on <strong>Day 25</strong> of the 30-day investigation period!</p>
    
    <div class="alert-box">
      <strong>📬 ACTION REQUIRED: Check Your Mail Daily</strong>
      <p>Bureau responses typically arrive between Day 25-30. Look for:</p>
      <ul>
        <li>Official ${bureau} letterhead</li>
        <li>"Results of Investigation" or similar subject line</li>
        <li>List of accounts deleted, verified, or updated</li>
      </ul>
    </div>
    
    <div class="deadline">Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : 'In 5 days'}</div>
    
    <h3>What to do when you receive the response:</h3>
    
    <div class="success-box">
      <strong>✅ If accounts were DELETED:</strong>
      <ul>
        <li>Celebrate! Your score will improve</li>
        <li>Take screenshots for your records</li>
        <li>Repeat process with other bureaus</li>
      </ul>
    </div>
    
    <div class="alert-box">
      <strong>⚠️ If accounts were VERIFIED:</strong>
      <ul>
        <li>Don't panic - this is common</li>
        <li>Generate Round 2 escalation letters</li>
        <li>Demand Method of Verification (MOV)</li>
        <li>40-60% of verified accounts get deleted in Round 2</li>
      </ul>
    </div>
    
    <div class="warning-box">
      <strong>⏰ If NO response by Day 30:</strong>
      <ul>
        <li>This is an FCRA violation</li>
        <li>File CFPB complaint immediately</li>
        <li>Demand deletion under § 1681i(a)(1)</li>
      </ul>
    </div>
    
    <p style="text-align: center;">
      <a href="https://disputestrike.com/dashboard" class="cta-button">Update Your Dispute Status</a>
    </p>
    
    <p>Questions? Reply to this email or contact support.</p>
    <p>Best regards,<br><strong>DisputeStrike Team</strong></p>
  </div>
  <div class="footer">
    <p>DisputeStrike - AI-Powered Credit Dispute Platform</p>
    <p>This is an automated reminder. Results vary by individual.</p>
  </div>
</body>
</html>
`;
}

/**
 * Generate Day 25 email body (plain text)
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

Check your DisputeStrike dashboard to update your letter status when you receive the response.

Questions? Reply to this email or contact support.

Best regards,
DisputeStrike Team
`;
}

/**
 * Generate Day 31 email HTML
 */
function generateDay31EmailHtml(userName: string | null, bureau: string, daysOverdue: number, letterId: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f8fafc; }
    .violation-box { background: #fee2e2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
    .status-item { background: white; padding: 15px; border-radius: 6px; text-align: center; }
    .status-label { font-size: 12px; color: #64748b; }
    .status-value { font-size: 18px; font-weight: bold; color: #dc2626; }
    .action-step { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #f97316; }
    .cta-button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 FCRA VIOLATION ALERT 🚨</h1>
    <p>${bureau} Failed to Respond Within 30 Days</p>
  </div>
  <div class="content">
    <p>Hi ${userName || 'there'},</p>
    
    <div class="violation-box">
      <h2 style="color: #dc2626; margin-top: 0;">⚠️ ${bureau} Violated Federal Law</h2>
      <p>${bureau} has <strong>FAILED</strong> to respond to your dispute within the required 30-day period. This is a violation of FCRA § 1681i(a)(1)(A).</p>
    </div>
    
    <div class="status-grid">
      <div class="status-item">
        <div class="status-label">Days Overdue</div>
        <div class="status-value">${daysOverdue} days</div>
      </div>
      <div class="status-item">
        <div class="status-label">Violation</div>
        <div class="status-value">FCRA § 1681i</div>
      </div>
    </div>
    
    <h3>📝 IMMEDIATE ACTION REQUIRED:</h3>
    
    <div class="action-step">
      <strong>1. File CFPB Complaint</strong>
      <p>Log into your DisputeStrike dashboard and click "Generate CFPB Complaint" for this letter. Download and mail to CFPB immediately.</p>
    </div>
    
    <div class="action-step">
      <strong>2. Demand Immediate Deletion</strong>
      <p>Bureau's failure to respond = automatic deletion. Cite FCRA § 1681i(a)(5)(A). All disputed accounts MUST be deleted.</p>
    </div>
    
    <div class="action-step">
      <strong>3. Consider Legal Action</strong>
      <p>You may be entitled to statutory damages ($100-$1,000 per violation). Consult with an FCRA attorney if needed.</p>
    </div>
    
    <p style="text-align: center;">
      <a href="https://disputestrike.com/dashboard" class="cta-button">Generate CFPB Complaint Now</a>
    </p>
    
    <h3>💡 Why This Matters:</h3>
    <ul>
      <li>${bureau} violated your federal rights</li>
      <li>Continued inaccurate reporting damages your credit</li>
      <li>CFPB can fine bureaus for noncompliance</li>
      <li>You deserve compensation for this violation</li>
    </ul>
    
    <p>We're here to help you fight back against ${bureau}'s illegal behavior.</p>
    <p>Best regards,<br><strong>DisputeStrike Team</strong></p>
    
    <p style="font-size: 11px; color: #94a3b8;">P.S. This is NOT legal advice. Consult with an attorney for legal guidance.</p>
  </div>
  <div class="footer">
    <p>DisputeStrike - AI-Powered Credit Dispute Platform</p>
    <p>This is an automated alert. Results vary by individual.</p>
  </div>
</body>
</html>
`;
}

/**
 * Generate Day 31 email body (plain text)
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
   - Log into your DisputeStrike dashboard
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
DisputeStrike Team

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
