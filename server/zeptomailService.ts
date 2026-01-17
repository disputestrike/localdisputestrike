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
 * Generate professional HTML email template with logo and branding
 */
function generateEmailTemplate(params: {
  title: string;
  preheader?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const { title, preheader, content, ctaText, ctaUrl } = params;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
              <img src="https://www.disputestrike.com/logo-with-text.webp" alt="DisputeStrike" style="max-width: 200px; height: auto; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${title}</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
              
              ${ctaText && ctaUrl ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${ctaUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">${ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              
              <!-- Social Media Icons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://facebook.com/disputestrike" style="display: inline-block; margin: 0 10px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 32px; height: 32px;">
                    </a>
                    <a href="https://twitter.com/disputestrike" style="display: inline-block; margin: 0 10px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 32px; height: 32px;">
                    </a>
                    <a href="https://instagram.com/disputestrike" style="display: inline-block; margin: 0 10px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" style="width: 32px; height: 32px;">
                    </a>
                    <a href="https://linkedin.com/company/disputestrike" style="display: inline-block; margin: 0 10px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" style="width: 32px; height: 32px;">
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                <strong>DisputeStrike</strong> - Professional Credit Repair Automation
              </p>
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 15px 0;">
                <a href="https://www.disputestrike.com" style="color: #9ca3af; text-decoration: none;">www.disputestrike.com</a>
              </p>
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <a href="${process.env.VITE_APP_URL || 'https://www.disputestrike.com'}/terms" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Terms</a> |
                <a href="${process.env.VITE_APP_URL || 'https://www.disputestrike.com'}/privacy" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Privacy</a> |
                <a href="${process.env.VITE_APP_URL || 'https://www.disputestrike.com'}/unsubscribe" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
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
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Hi ${name},</h2>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Thank you for starting your <strong>$1 trial</strong> with DisputeStrike! We're excited to help you improve your credit score.
    </p>
    
    <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
    
    <ol style="color: #4b5563; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 0 0 20px 0;">
      <li style="margin-bottom: 10px;"><strong>Credit Report Pull</strong> - We're pulling your reports from all 3 bureaus right now (30-60 seconds)</li>
      <li style="margin-bottom: 10px;"><strong>AI Analysis</strong> - Our AI will analyze every negative item and recommend the best disputes</li>
      <li style="margin-bottom: 10px;"><strong>Review & Decide</strong> - See your scores, negative items, and dispute strategy</li>
      <li style="margin-bottom: 10px;"><strong>7-Day Trial</strong> - Try everything risk-free. Cancel anytime before 7 days for a full refund</li>
    </ol>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⏰ Trial Period:</strong> 7 days from today</p>
      <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;"><strong>💳 After Trial:</strong> Your selected plan will activate automatically unless you cancel</p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
      Need help? Reply to this email or visit our support center.
    </p>
  `;
  
  const html = generateEmailTemplate({
    title: 'Welcome to DisputeStrike!',
    preheader: 'Your $1 trial has started',
    content,
    ctaText: 'View Your Credit Analysis',
    ctaUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/credit-analysis`,
  });
  
  const plain = `
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
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Password Reset Request</h2>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      You requested to reset your password for your DisputeStrike account.
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Click the button below to reset your password:
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="word-break: break-all; color: #9ca3af; font-size: 12px; background-color: #f9fafb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      If you didn't request this, please ignore this email. Your password will remain unchanged.
    </p>
  `;
  
  const html = generateEmailTemplate({
    title: 'Reset Your Password',
    preheader: 'Reset your DisputeStrike password',
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
DisputeStrike - Professional Credit Repair Automation
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
