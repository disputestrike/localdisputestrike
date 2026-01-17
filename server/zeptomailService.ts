/**
 * ZeptoMail Email Service
 * 
 * Handles email sending via Zoho ZeptoMail API
 */

import { config } from 'dotenv';

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

if (!ZEPTOMAIL_API_KEY) {
  console.warn('ZEPTOMAIL_API_KEY is not set in environment variables');
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
 * Generate professional HTML email template with DisputeStrike branding
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  
  <!-- Logo Header -->
  <div style="text-align: center; padding: 20px 0;">
    <img src="https://www.disputestrike.com/logo-email.png" alt="DisputeStrike" style="max-width: 250px; height: auto;">
  </div>
  
  <!-- Main Content Card -->
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">${title}</h2>
    
    ${content}
    
    ${ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${ctaUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">${ctaText} →</a>
    </div>
    ` : ''}
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; padding: 30px 20px; color: #64748b; font-size: 14px;">
    
    <!-- Social Media Links -->
    <div style="margin-bottom: 20px;">
      <a href="https://facebook.com/disputestrike" style="display: inline-block; margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; height: 24px; opacity: 0.6;">
      </a>
      <a href="https://twitter.com/disputestrike" style="display: inline-block; margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 24px; height: 24px; opacity: 0.6;">
      </a>
      <a href="https://instagram.com/disputestrike" style="display: inline-block; margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" style="width: 24px; height: 24px; opacity: 0.6;">
      </a>
      <a href="https://linkedin.com/company/disputestrike" style="display: inline-block; margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" style="width: 24px; height: 24px; opacity: 0.6;">
      </a>
    </div>
    
    <p style="margin: 10px 0;">DisputeStrike • AI-Powered Credit Repair</p>
    <p style="margin: 10px 0; font-size: 12px;">
      <a href="${process.env.VITE_APP_URL || 'https://www.disputestrike.com'}/terms" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Terms</a>
      <a href="${process.env.VITE_APP_URL || 'https://www.disputestrike.com'}/privacy" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Privacy</a>
      <a href="${process.env.VITE_APP_URL || 'https://www.disputestrike.com'}/unsubscribe" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
    </p>
  </div>
  
</body>
</html>`;
}

/**
 * Send a welcome email to a new trial user
 */
export async function sendTrialWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const content = `
    <p>Hey ${name}! 👋</p>
    
    <p>Thank you for starting your <strong>$1 trial</strong> with DisputeStrike! We're excited to help you improve your credit score.</p>
    
    <h3 style="color: #1e293b; font-size: 18px;">What's Next?</h3>
    
    <ol style="padding-left: 20px; color: #475569;">
      <li style="margin-bottom: 12px;"><strong>Credit Report Pull</strong> - We're pulling your reports from all 3 bureaus right now (30-60 seconds)</li>
      <li style="margin-bottom: 12px;"><strong>AI Analysis</strong> - Our AI will analyze every negative item and recommend the best disputes</li>
      <li style="margin-bottom: 12px;"><strong>Review & Decide</strong> - See your scores, negative items, and dispute strategy</li>
      <li style="margin-bottom: 12px;"><strong>7-Day Trial</strong> - Try everything risk-free. Cancel anytime before 7 days for a full refund</li>
    </ol>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⏰ Trial Period:</strong> 7 days from today</p>
      <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;"><strong>💳 After Trial:</strong> Your selected plan will activate automatically unless you cancel</p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Need help? Reply to this email or visit our support center.</p>
  `;
  
  const html = generateEmailTemplate({
    title: 'Welcome to DisputeStrike!',
    content,
    ctaText: 'View Your Credit Analysis',
    ctaUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/credit-analysis`,
  });
  
  const plain = `
Hey ${name}!

Thank you for starting your $1 trial with DisputeStrike! We're excited to help you improve your credit score.

What's Next?

1. Credit Report Pull - We're pulling your reports from all 3 bureaus right now (30-60 seconds)
2. AI Analysis - Our AI will analyze every negative item and recommend the best disputes
3. Review & Decide - See your scores, negative items, and dispute strategy
4. 7-Day Trial - Try everything risk-free. Cancel anytime before 7 days for a full refund

Trial Period: 7 days from today
After Trial: Your selected plan will activate automatically unless you cancel

View Your Credit Analysis: ${process.env.VITE_APP_URL || 'http://localhost:3000'}/credit-analysis

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
      user_email: email,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const content = `
    <p>You requested to reset your password for your DisputeStrike account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #94a3b8; font-size: 12px; background: #f8fafc; padding: 10px; border-radius: 4px;">${resetUrl}</p>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
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
  sendTrialWelcomeEmail,
  sendPasswordResetEmail,
};
