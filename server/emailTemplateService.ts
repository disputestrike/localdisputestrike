import { sendEmail } from './mailerooService';
import fs from 'fs';
import path from 'path';

interface EmailVariables {
  name?: string;
  email?: string;
  plan?: string;
  trial_end_date?: string;
  negative_items_count?: number;
  credit_score_equifax?: number;
  credit_score_experian?: number;
  credit_score_transunion?: number;
  dashboard_url?: string;
  support_email?: string;
  payment_date?: string;
  access_end_date?: string;
  [key: string]: any;
}

class EmailTemplateService {
  private templatesDir = path.join(__dirname, 'email-templates');
  private defaultVariables: EmailVariables = {
    dashboard_url: process.env.FRONTEND_URL || 'https://www.disputestrike.com/dashboard',
    support_email: 'support@disputestrike.com',
  };

  /**
   * Load and render an email template with variables
   */
  private renderTemplate(templateName: string, variables: EmailVariables): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.html`);
    
    if (!fs.existsSync(templatePath)) {
      console.error(`[EmailTemplate] Template not found: ${templateName}`);
      throw new Error(`Email template not found: ${templateName}`);
    }

    let template = fs.readFileSync(templatePath, 'utf-8');
    const allVariables = { ...this.defaultVariables, ...variables };

    // Replace all {{variable}} placeholders
    Object.keys(allVariables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, String(allVariables[key] || ''));
    });

    return template;
  }

  /**
   * Send an email using a template
   */
  async sendTemplateEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: EmailVariables
  ): Promise<void> {
    try {
      const htmlContent = this.renderTemplate(templateName, variables);
      
      await sendEmail({
        to,
        subject,
        html: htmlContent,
      });
      
      console.log(`[EmailTemplate] Sent ${templateName} to ${to}`);
    } catch (error) {
      console.error(`[EmailTemplate] Failed to send ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome email (Day 0)
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Welcome to DisputeStrike! Your Credit Journey Starts Now 🎉',
      'welcome',
      { name, email: to }
    );
  }

  /**
   * Send credit analysis ready email (Day 1)
   */
  async sendCreditAnalysisReadyEmail(
    to: string,
    name: string,
    scores: { equifax: number; experian: number; transunion: number },
    negativeItemsCount: number
  ): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Your 3-Bureau Credit Analysis is Ready! 📊',
      'credit-analysis-ready',
      {
        name,
        email: to,
        credit_score_equifax: scores.equifax,
        credit_score_experian: scores.experian,
        credit_score_transunion: scores.transunion,
        negative_items_count: negativeItemsCount,
      }
    );
  }

  /**
   * Send getting started tutorial email (Day 1-2)
   */
  async sendGettingStartedEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'How to Use DisputeStrike: Your Step-by-Step Guide',
      'getting-started',
      { name, email: to }
    );
  }

  /**
   * Send dispute process explained email (Day 2-3)
   */
  async sendDisputeProcessEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'The Credit Dispute Process: What You Need to Know',
      'dispute-process',
      { name, email: to }
    );
  }

  /**
   * Send AI feature highlight email (Day 3)
   */
  async sendAIFeatureHighlightEmail(
    to: string,
    name: string,
    negativeItemsCount: number
  ): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Did You See These Items on Your Report? 🔍',
      'feature-highlight-ai',
      { name, email: to, negative_items_count: negativeItemsCount }
    );
  }

  /**
   * Send Complete plan benefits email (Day 3-4)
   */
  async sendCompletePlanBenefitsEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Let Us Handle the Paperwork: Complete Plan Benefits',
      'complete-plan-benefits',
      { name, email: to }
    );
  }

  /**
   * Send objection handler email (Day 4)
   */
  async sendObjectionHandlerEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      "Questions About DisputeStrike? We're Here to Help!",
      'objection-handler',
      { name, email: to }
    );
  }

  /**
   * Send trial expiring in 3 days email (Day 5)
   */
  async sendTrialExpiring3DaysEmail(
    to: string,
    name: string,
    trialEndDate: string
  ): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Your Trial Ends in 3 Days ⏰',
      'trial-expiring-3-days',
      { name, email: to, trial_end_date: trialEndDate }
    );
  }

  /**
   * Send special offer email (Day 5-6)
   */
  async sendSpecialOfferEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Last Chance: Special Offer Inside 🎁',
      'special-offer',
      { name, email: to }
    );
  }

  /**
   * Send trial expiring tomorrow email (Day 6)
   */
  async sendTrialExpiringTomorrowEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Tomorrow is Your Last Day 😢',
      'trial-expiring-tomorrow',
      { name, email: to }
    );
  }

  /**
   * Send trial ended email (Day 7)
   */
  async sendTrialEndedEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Your DisputeStrike Trial Has Ended',
      'trial-ended',
      { name, email: to }
    );
  }

  /**
   * Send winback email (Day 14)
   */
  async sendWinbackEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'We Miss You! Come Back for $39/mo (Limited Time)',
      'winback',
      { name, email: to }
    );
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminderEmail(
    to: string,
    name: string,
    paymentDate: string
  ): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Your DisputeStrike Payment is Coming Up',
      'payment-reminder',
      { name, email: to, payment_date: paymentDate }
    );
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailedEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Action Required: Payment Update Needed',
      'payment-failed',
      { name, email: to }
    );
  }

  /**
   * Send payment successful email
   */
  async sendPaymentSuccessfulEmail(
    to: string,
    name: string,
    plan: string
  ): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Receipt: Your DisputeStrike Subscription',
      'payment-successful',
      { name, email: to, plan }
    );
  }

  /**
   * Send upgrade confirmation email
   */
  async sendUpgradeConfirmationEmail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Welcome to DisputeStrike Complete! 🎉',
      'upgrade-confirmation',
      { name, email: to }
    );
  }

  /**
   * Send cancellation confirmation email
   */
  async sendCancellationConfirmationEmail(
    to: string,
    name: string,
    accessEndDate: string
  ): Promise<void> {
    await this.sendTemplateEmail(
      to,
      'Your Subscription Has Been Canceled',
      'cancellation-confirmation',
      { name, email: to, access_end_date: accessEndDate }
    );
  }
}

export const emailTemplateService = new EmailTemplateService();
