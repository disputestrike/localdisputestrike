/**
 * Email Delivery Service
 * Sends dispute letters and notifications to users
 */

import nodemailer from 'nodemailer';

// Email configuration (use environment variables in production)
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
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
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip if SMTP not configured
    if (!process.env.SMTP_USER) {
      console.log('[Email] SMTP not configured, skipping email:', options.subject);
      return false;
    }

    const transport = getTransporter();
    
    await transport.sendMail({
      from: `"DisputeForce" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log('[Email] Sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
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
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .checklist {
      background: white;
      padding: 20px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your ${bureau} Dispute Letter is Ready!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Great news! Your litigation-grade dispute letter for <strong>${bureau}</strong> has been generated and is attached to this email as a PDF.</p>
      
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
      
      <p>Need help? View our complete mailing guide:</p>
      <a href="https://disputeforce.com/mailing-instructions" class="button">View Mailing Guide</a>
      
      <p>Good luck! We're rooting for you! 💪</p>
      
      <p>Best regards,<br>
      The DisputeForce Team</p>
    </div>
    <div class="footer">
      <p>DisputeForce - Litigation-Grade Credit Dispute Software</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Your ${bureau} Dispute Letter is Ready - DisputeForce`,
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
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to DisputeForce! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Welcome to the most advanced litigation-grade credit dispute platform ever created!</p>
      
      <p>Here's what you can do:</p>
      <ul>
        <li>Upload your credit reports from all 3 bureaus</li>
        <li>Get AI-powered dispute letters (same quality as $2,500 attorneys)</li>
        <li>Track your disputes and deadlines</li>
        <li>Chat with our AI credit expert anytime</li>
      </ul>
      
      <p>Ready to get started? Log in to your dashboard and upload your first credit report!</p>
      
      <p>Best regards,<br>
      The DisputeForce Team</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to DisputeForce - Let\'s Fix Your Credit!',
    html,
    text: `Welcome to DisputeForce! Upload your credit reports to get started with AI-powered dispute letters.`,
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
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .receipt {
      background: white;
      padding: 20px;
      border: 2px solid #667eea;
      border-radius: 8px;
      margin: 20px 0;
    }
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
      
      <p>Best regards,<br>
      The DisputeForce Team</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Payment Confirmed - DisputeForce',
    html,
    text: `Payment confirmed! You've been charged $${amount} for ${tier}. Thank you!`,
  });
}
