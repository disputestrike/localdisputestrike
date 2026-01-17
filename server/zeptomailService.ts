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
 * Send a welcome email to a new trial user
 */
export async function sendTrialWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  return sendEmail({
    to: { address: email, display_name: name },
    subject: 'Welcome to DisputeStrike - Your $1 Trial Has Started!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f97316; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to DisputeStrike!</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #f97316; margin-top: 0;">Hi ${name},</h2>
          
          <p>Thank you for starting your <strong>$1 trial</strong> with DisputeStrike! We're excited to help you improve your credit score.</p>
          
          <h3 style="color: #1f2937;">What's Next?</h3>
          
          <ol style="padding-left: 20px;">
            <li style="margin-bottom: 10px;"><strong>Credit Report Pull</strong> - We're pulling your reports from all 3 bureaus right now (30-60 seconds)</li>
            <li style="margin-bottom: 10px;"><strong>AI Analysis</strong> - Our AI will analyze every negative item and recommend the best disputes</li>
            <li style="margin-bottom: 10px;"><strong>Review & Decide</strong> - See your scores, negative items, and dispute strategy</li>
            <li style="margin-bottom: 10px;"><strong>7-Day Trial</strong> - Try everything risk-free. Cancel anytime before 7 days for a full refund</li>
          </ol>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⏰ Trial Period:</strong> 7 days from today</p>
            <p style="margin: 10px 0 0 0;"><strong>💳 After Trial:</strong> Your selected plan will activate automatically unless you cancel</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/credit-analysis" 
               style="display: inline-block; background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Your Credit Analysis
            </a>
          </div>
          
          <h3 style="color: #1f2937;">Need Help?</h3>
          <p>We're here to support you every step of the way. If you have any questions, just reply to this email.</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The DisputeStrike Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>DisputeStrike - Professional Credit Repair Automation</p>
          <p>
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none;">Terms</a> | 
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none;">Privacy</a> | 
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `,
    plain: `
Hi ${name},

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
DisputeStrike - Professional Credit Repair Automation
    `,
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
  
  return sendEmail({
    to: email,
    subject: 'Reset Your DisputeStrike Password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for your DisputeStrike account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
      </body>
      </html>
    `,
    plain: `
Password Reset Request

You requested to reset your password for your DisputeStrike account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
    `,
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
