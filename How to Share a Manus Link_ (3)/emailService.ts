/**
 * Email Delivery Service
 * Uses SendGrid for reliable email delivery
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@disputestrike.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('[Email] SendGrid initialized');
} else {
  console.log('[Email] SendGrid API key not configured - emails will be logged to console');
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email via SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Fallback: Log email to console if SendGrid not configured
    if (!SENDGRID_API_KEY) {
      console.log('[Email] SendGrid not configured, logging email to console:');
      console.log('[Email] TO:', options.to);
      console.log('[Email] SUBJECT:', options.subject);
      console.log('[Email] HTML:', options.html.substring(0, 200) + '...');
      // Still return true so the app doesn't fail
      return true;
    }

    const msg: sgMail.MailDataRequired = {
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: 'DisputeStrike'
      },
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      html: options.html,
    };

    // Add attachments if present
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        type: att.contentType || 'application/octet-stream',
        disposition: 'attachment' as const,
      }));
    }

    await sgMail.send(msg);
    console.log('[Email] Sent successfully to:', options.to);
    return true;
  } catch (error: any) {
    console.error('[Email] Failed to send:', error?.response?.body || error);
    return false;
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verificationToken: string,
  baseUrl: string
): Promise<boolean> {
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 14px 40px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Thank you for signing up for DisputeStrike! Please verify your email address by clicking the button below:</p>
      
      <p style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </p>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationLink}</p>
      
      <p>This link will expire in 24 hours.</p>
      
      <p>If you didn't create an account with DisputeStrike, you can safely ignore this email.</p>
      
      <p>Best regards,<br>The DisputeStrike Team</p>
    </div>
    <div class="footer">
      <p>DisputeStrike - Professional Credit Dispute Software</p>
      <p>30 N Gould St Ste R, Sheridan, WY 82801</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Verify Your Email - DisputeStrike',
    html,
    text: `Hi ${userName}, Please verify your email by visiting: ${verificationLink}. This link expires in 24 hours.`,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string,
  baseUrl: string
): Promise<boolean> {
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 14px 40px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      
      <div class="warning">
        <strong>⚠️ This link will expire in 1 hour.</strong>
      </div>
      
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      
      <p>Best regards,<br>The DisputeStrike Team</p>
    </div>
    <div class="footer">
      <p>DisputeStrike - Professional Credit Dispute Software</p>
      <p>30 N Gould St Ste R, Sheridan, WY 82801</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Reset Your Password - DisputeStrike',
    html,
    text: `Hi ${userName}, Reset your password by visiting: ${resetLink}. This link expires in 1 hour. If you didn't request this, ignore this email.`,
  });
}

/**
 * Send dispute letter email with PDF attachment
 */
export async function sendDisputeLetterEmail(
  userEmail: string,
  userName: string,
  bureau: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .checklist { background: white; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your ${bureau} Dispute Letter is Ready!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Great news! Your dispute letter for <strong>${bureau}</strong> has been generated and is attached to this email as a PDF.</p>
      
      <div class="checklist">
        <h3>📋 Next Steps:</h3>
        <ol>
          <li><strong>Print the attached PDF</strong> on white paper</li>
          <li><strong>Sign in blue ink</strong> at the bottom</li>
          <li><strong>Include these documents:</strong>
            <ul>
              <li>Copy of your government-issued photo ID (front and back)</li>
              <li>Recent utility bill or bank statement (within 90 days)</li>
            </ul>
          </li>
          <li><strong>Mail via Certified Mail with Return Receipt</strong> from your local post office</li>
          <li><strong>Save your tracking number</strong> for proof of delivery</li>
        </ol>
      </div>
      
      <p><strong>Important:</strong> The credit bureau has 30 days from receipt to investigate and respond under FCRA § 1681i(a)(1).</p>
      
      <p>Good luck! We're rooting for you! 💪</p>
      
      <p>Best regards,<br>The DisputeStrike Team</p>
    </div>
    <div class="footer">
      <p>DisputeStrike - Professional Credit Dispute Software</p>
      <p>30 N Gould St Ste R, Sheridan, WY 82801</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Your ${bureau} Dispute Letter is Ready - DisputeStrike`,
    html,
    text: `Your ${bureau} dispute letter is ready! Download the attached PDF, print it, sign in blue ink, and mail it via Certified Mail with Return Receipt. Include a copy of your ID and a recent utility bill.`,
    attachments: [
      {
        filename: `${bureau.toLowerCase()}_dispute_letter.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to DisputeStrike! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Welcome to DisputeStrike - your professional credit dispute platform!</p>
      
      <p>Here's what you can do:</p>
      <ul>
        <li>Upload your credit reports from all 3 bureaus</li>
        <li>Get AI-powered dispute letters</li>
        <li>Track your disputes and deadlines</li>
        <li>Chat with our AI credit expert anytime</li>
      </ul>
      
      <p>Ready to get started? Log in to your dashboard and upload your first credit report!</p>
      
      <p>Best regards,<br>The DisputeStrike Team</p>
    </div>
    <div class="footer">
      <p>DisputeStrike - Professional Credit Dispute Software</p>
      <p>30 N Gould St Ste R, Sheridan, WY 82801</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to DisputeStrike - Let\'s Fix Your Credit!',
    html,
    text: `Welcome to DisputeStrike! Upload your credit reports to get started with AI-powered dispute letters.`,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  amount: string,
  tier: string
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .receipt { background: white; padding: 20px; border: 2px solid #f97316; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Thank you for your payment! Your account has been upgraded.</p>
      
      <div class="receipt">
        <h3>Receipt</h3>
        <p><strong>Plan:</strong> ${tier.replace(/_/g, ' ').toUpperCase()}</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>You now have full access to all features. Start generating your dispute letters!</p>
      
      <p>Best regards,<br>The DisputeStrike Team</p>
    </div>
    <div class="footer">
      <p>DisputeStrike - Professional Credit Dispute Software</p>
      <p>30 N Gould St Ste R, Sheridan, WY 82801</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Payment Confirmed - DisputeStrike',
    html,
    text: `Payment confirmed! You've been charged $${amount} for ${tier}. Thank you!`,
  });
}
