/**
 * ZeptoMail Email Service
 * 
 * Handles email sending via Zoho ZeptoMail API
 */

import { config } from 'dotenv';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

interface EmailAddress {
  address: string;
  display_name?: string;
}

interface SendEmailParams {
  to: string | EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  plain?: string;
  from?: EmailAddress;
  reply_to?: EmailAddress;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  tags?: Record<string, string>;
}

interface ZeptoMailResponse {
  code: string;
  message: string;
  request_id?: string;
}

const ZEPTOMAIL_API_KEY = process.env.ZEPTOMAIL_API_KEY;
const ZEPTOMAIL_FROM_EMAIL = process.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@disputestrike.com';
const ZEPTOMAIL_FROM_NAME = process.env.ZEPTOMAIL_FROM_NAME || 'DisputeStrike';
const APP_URL = process.env.VITE_APP_URL || 'https://www.disputestrike.com';

if (!ZEPTOMAIL_API_KEY) {
  console.warn('ZEPTOMAIL_API_KEY is not set in environment variables');
}

/**
 * Load and compile email template
 */
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  const templatePath = join(__dirname, 'email-templates', `${templateName}.html`);
  const templateSource = readFileSync(templatePath, 'utf-8');
  return Handlebars.compile(templateSource);
}

/**
 * Send an email via ZeptoMail API
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!ZEPTOMAIL_API_KEY) {
    console.error('Cannot send email: ZEPTOMAIL_API_KEY not configured');
    return false;
  }

  try {
    const {
      to,
      subject,
      html,
      plain,
      from,
      reply_to,
      cc,
      bcc,
      tags,
    } = params;

    // Ensure we have either HTML or plain text
    if (!html && !plain) {
      throw new Error('Email must have either HTML or plain text content');
    }

    // Normalize recipient format for ZeptoMail
    const normalizeAddress = (addr: string | EmailAddress): { email_address: { address: string; name?: string } } => {
      if (typeof addr === 'string') {
        return { email_address: { address: addr } };
      }
      return {
        email_address: {
          address: addr.address,
          name: addr.display_name,
        },
      };
    };

    const normalizeAddresses = (addrs: string | EmailAddress | EmailAddress[]): any[] => {
      if (Array.isArray(addrs)) {
        return addrs.map(normalizeAddress);
      }
      return [normalizeAddress(addrs)];
    };

    // Prepare the request body for ZeptoMail
    const requestBody: any = {
      from: {
        address: from?.address || ZEPTOMAIL_FROM_EMAIL,
        name: from?.display_name || ZEPTOMAIL_FROM_NAME,
      },
      to: normalizeAddresses(to),
      subject,
    };

    // Add HTML and/or plain text content
    if (html && plain) {
      requestBody.htmlbody = html;
      requestBody.textbody = plain;
    } else if (html) {
      requestBody.htmlbody = html;
    } else if (plain) {
      requestBody.textbody = plain;
    }

    // Add optional fields
    if (reply_to) {
      requestBody.reply_to = [{
        address: typeof reply_to === 'string' ? reply_to : reply_to.address,
        name: typeof reply_to === 'object' ? reply_to.display_name : undefined,
      }];
    }

    if (cc) {
      requestBody.cc = normalizeAddresses(cc);
    }

    if (bcc) {
      requestBody.bcc = normalizeAddresses(bcc);
    }

    // ZeptoMail doesn't support custom tags in the same way, but we can add them to track_clicks/track_opens
    // For now, we'll log them for debugging
    if (tags) {
      console.log('Email tags:', tags);
    }

    // Send request to ZeptoMail API
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data: ZeptoMailResponse = await response.json();

    if (!response.ok) {
      console.error('ZeptoMail API error:', data);
      return false;
    }

    console.log('Email sent successfully via ZeptoMail:', data.request_id || data.message);
    return true;
  } catch (error) {
    console.error('Error sending email via ZeptoMail:', error);
    return false;
  }
}

/**
 * Generate professional HTML email template matching Creditfixrr style
 * - Clean white background
 * - Logo centered at top
 * - Minimal text-based design
 * - Dark navy CTA buttons
 * - Green footer with social icons
 */
function generateEmailTemplate(params: {
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const { title, content, ctaText, ctaUrl } = params;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 40px 20px 20px 20px; text-align: center;">
        <img src="https://www.disputestrike.com/logo-email.png" alt="DisputeStrike" style="max-width: 200px; height: auto;">
      </td>
    </tr>
    
    <tr>
      <td style="padding: 20px 40px;">
        ${content}
        
        ${ctaText && ctaUrl ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="${ctaUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">${ctaText}</a>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
    
    <!-- Green Footer -->
    <tr>
      <td style="background-color: #10b981; padding: 30px 20px; text-align: center;">
        <!-- Social Media Icons -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td align="center">
              <a href="https://facebook.com/disputestrike" style="display: inline-block; margin: 0 8px;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="28" height="28" style="display: block;">
              </a>
              <a href="https://instagram.com/disputestrike" style="display: inline-block; margin: 0 8px;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" width="28" height="28" style="display: block;">
              </a>
              <a href="https://youtube.com/@disputestrike" style="display: inline-block; margin: 0 8px;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="YouTube" width="28" height="28" style="display: block;">
              </a>
              <a href="https://twitter.com/disputestrike" style="display: inline-block; margin: 0 8px;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733635.png" alt="Twitter" width="28" height="28" style="display: block;">
              </a>
              <a href="https://plus.google.com/disputestrike" style="display: inline-block; margin: 0 8px;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Google+" width="28" height="28" style="display: block;">
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #ffffff; margin: 10px 0; font-size: 14px; font-weight: 600;">Copyright © ${new Date().getFullYear()} DisputeStrike Technology, All rights reserved.</p>
        
        <p style="color: #ffffff; margin: 15px 0; font-size: 13px;">Our mailing address is:</p>
        <p style="color: #ffffff; margin: 5px 0; font-size: 13px;">support@disputestrike.com</p>
        
        <p style="color: #ffffff; margin: 20px 0 5px 0; font-size: 12px;">
          Want to change how you receive these emails?
        </p>
        <p style="margin: 0;">
          <a href="${APP_URL}/unsubscribe" style="color: #ffffff; text-decoration: underline; font-size: 12px;">You can unsubscribe from this list</a>
        </p>
      </td>
    </tr>
  </table>
  
</body>
</html>`;
}

// ============================================================================
// TRIAL NURTURE SEQUENCE (Days 0-7)
// ============================================================================

/**
 * Day 0: Send welcome email to new trial user
 */
export async function sendTrialWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const content = `
    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">Hey ${name},</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">Thank you for starting your <strong>$1 trial</strong> with DisputeStrike! We're excited to help you improve your credit score.</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 15px;"><strong>What's Next?</strong></p>
    
    <ol style="font-size: 15px; line-height: 1.8; color: #333333; padding-left: 20px; margin-bottom: 25px;">
      <li><strong>Credit Report Pull</strong> - We're pulling your reports from all 3 bureaus right now (30-60 seconds)</li>
      <li><strong>AI Analysis</strong> - Our AI will analyze every negative item and recommend the best disputes</li>
      <li><strong>Review & Decide</strong> - See your scores, negative items, and dispute strategy</li>
      <li><strong>7-Day Trial</strong> - Try everything risk-free. Cancel anytime before 7 days for a full refund</li>
    </ol>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <tr>
        <td style="padding: 15px;">
          <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;"><strong>⏰ Trial Period:</strong> 7 days from today</p>
          <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>💳 After Trial:</strong> Your selected plan will activate automatically unless you cancel</p>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 14px; line-height: 1.6; color: #666666; margin-top: 30px;">Need help? Reply to this email or visit our support center.</p>
  `;
  
  const html = generateEmailTemplate({
    title: 'Welcome to DisputeStrike!',
    content,
    ctaText: 'View Your Credit Analysis',
    ctaUrl: `${APP_URL}/credit-analysis`,
  });
  
  const plain = `
Hey ${name},

Thank you for starting your $1 trial with DisputeStrike! We're excited to help you improve your credit score.

What's Next?

1. Credit Report Pull - We're pulling your reports from all 3 bureaus right now (30-60 seconds)
2. AI Analysis - Our AI will analyze every negative item and recommend the best disputes
3. Review & Decide - See your scores, negative items, and dispute strategy
4. 7-Day Trial - Try everything risk-free. Cancel anytime before 7 days for a full refund

Trial Period: 7 days from today
After Trial: Your selected plan will activate automatically unless you cancel

View Your Credit Analysis: ${APP_URL}/credit-analysis

Need Help?
We're here to support you every step of the way. If you have any questions, just reply to this email.

Best regards,
The DisputeStrike Team

---
DisputeStrike - AI-Powered Credit Repair
www.disputestrike.com
  `;
  
  return sendEmail({
    to: { address: email, display_name: name },
    subject: 'Welcome to DisputeStrike - Your $1 Trial Has Started!',
    html,
    plain,
    tags: {
      type: 'trial_welcome',
      day: '0',
    },
  });
}

/**
 * Day 1: Credit analysis ready email
 */
export async function sendCreditAnalysisReadyEmail(
  email: string,
  userName: string,
  negativeItemCount: number,
  topRecommendations: Array<{ accountName: string; winProbability: number; reason: string }>
): Promise<boolean> {
  try {
    const template = loadTemplate('day1-credit-analysis-ready');
    const html = template({
      userName,
      negativeItemCount,
      topRecommendations,
      dashboardUrl: `${APP_URL}/dashboard`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'Your Credit Analysis is Ready! 📊',
      html,
      tags: {
        type: 'trial_nurture',
        day: '1',
      },
    });
  } catch (error) {
    console.error('Error sending credit analysis ready email:', error);
    return false;
  }
}

/**
 * Day 2: Getting started guide email
 */
export async function sendGettingStartedEmail(
  email: string,
  userName: string
): Promise<boolean> {
  try {
    const template = loadTemplate('day2-getting-started');
    const html = template({
      userName,
      dashboardUrl: `${APP_URL}/dashboard`,
      disputeGuideUrl: `${APP_URL}/guides/how-to-dispute`,
      supportUrl: `${APP_URL}/support`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'How to Get the Most Out of DisputeStrike',
      html,
      tags: {
        type: 'trial_nurture',
        day: '2',
      },
    });
  } catch (error) {
    console.error('Error sending getting started email:', error);
    return false;
  }
}

/**
 * Day 3: Feature highlight - AI dispute letters
 */
export async function sendFeatureHighlightEmail(
  email: string,
  userName: string
): Promise<boolean> {
  try {
    const template = loadTemplate('day3-feature-highlight');
    const html = template({
      userName,
      dashboardUrl: `${APP_URL}/dashboard`,
      sampleLetterUrl: `${APP_URL}/sample-dispute-letter`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'See How Our AI Writes Professional Dispute Letters',
      html,
      tags: {
        type: 'trial_nurture',
        day: '3',
      },
    });
  } catch (error) {
    console.error('Error sending feature highlight email:', error);
    return false;
  }
}

/**
 * Day 4: Objection handler - common questions
 */
export async function sendObjectionHandlerEmail(
  email: string,
  userName: string
): Promise<boolean> {
  try {
    const template = loadTemplate('day4-objection-handler');
    const html = template({
      userName,
      faqUrl: `${APP_URL}/faq`,
      supportUrl: `${APP_URL}/support`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'Common Questions About Credit Disputes (Answered)',
      html,
      tags: {
        type: 'trial_nurture',
        day: '4',
      },
    });
  } catch (error) {
    console.error('Error sending objection handler email:', error);
    return false;
  }
}

/**
 * Day 5: Trial expiring in 2 days
 */
export async function sendTrialExpiringEmail(
  email: string,
  userName: string,
  trialEndDate: string
): Promise<boolean> {
  try {
    const template = loadTemplate('day5-trial-expiring');
    const html = template({
      userName,
      trialEndDate,
      upgradeUrl: `${APP_URL}/upgrade`,
      cancelUrl: `${APP_URL}/cancel`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'Your Trial Ends in 2 Days',
      html,
      tags: {
        type: 'trial_nurture',
        day: '5',
      },
    });
  } catch (error) {
    console.error('Error sending trial expiring email:', error);
    return false;
  }
}

/**
 * Day 6: Trial expiring tomorrow
 */
export async function sendTrialExpiringTomorrowEmail(
  email: string,
  userName: string,
  trialEndDate: string
): Promise<boolean> {
  try {
    const template = loadTemplate('day6-trial-expiring-tomorrow');
    const html = template({
      userName,
      trialEndDate,
      upgradeUrl: `${APP_URL}/upgrade`,
      cancelUrl: `${APP_URL}/cancel`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'Last Chance: Your Trial Ends Tomorrow',
      html,
      tags: {
        type: 'trial_nurture',
        day: '6',
      },
    });
  } catch (error) {
    console.error('Error sending trial expiring tomorrow email:', error);
    return false;
  }
}

/**
 * Day 7: Trial ended - last chance offer
 */
export async function sendTrialEndedEmail(
  email: string,
  userName: string
): Promise<boolean> {
  try {
    const template = loadTemplate('day7-trial-ended');
    const html = template({
      userName,
      reactivateUrl: `${APP_URL}/reactivate`,
      supportUrl: `${APP_URL}/support`,
    });

    return sendEmail({
      to: { address: email, display_name: userName },
      subject: 'Your Trial Has Ended - Special Offer Inside',
      html,
      tags: {
        type: 'trial_nurture',
        day: '7',
      },
    });
  } catch (error) {
    console.error('Error sending trial ended email:', error);
    return false;
  }
}

// ============================================================================
// TRANSACTIONAL EMAILS
// ============================================================================

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  
  const content = `
    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">You requested to reset your password for your DisputeStrike account.</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 25px;">Click the button below to reset your password:</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-left: 4px solid #ef4444; margin: 25px 0;">
      <tr>
        <td style="padding: 15px;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 14px; line-height: 1.6; color: #666666; margin-top: 25px;">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #3b82f6; font-size: 13px; background-color: #f8fafc; padding: 12px; border-radius: 4px; margin: 10px 0 25px 0;">${resetUrl}</p>
    
    <p style="font-size: 14px; line-height: 1.6; color: #666666;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
  `;
  
  const html = generateEmailTemplate({
    title: 'Reset Your Password',
    content,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
  });
  
  const plain = `
Password Reset Request

You requested to reset your password for your DisputeStrike account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The DisputeStrike Team

---
DisputeStrike - AI-Powered Credit Repair
www.disputestrike.com
  `;
  
  return sendEmail({
    to: email,
    subject: 'Reset Your DisputeStrike Password',
    html,
    plain,
    tags: {
      type: 'password_reset',
    },
  });
}

export default {
  sendEmail,
  // Trial nurture sequence
  sendTrialWelcomeEmail,
  sendCreditAnalysisReadyEmail,
  sendGettingStartedEmail,
  sendFeatureHighlightEmail,
  sendObjectionHandlerEmail,
  sendTrialExpiringEmail,
  sendTrialExpiringTomorrowEmail,
  sendTrialEndedEmail,
  // Transactional
  sendPasswordResetEmail,
};
