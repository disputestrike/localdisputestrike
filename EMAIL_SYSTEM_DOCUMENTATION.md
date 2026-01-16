# DisputeStrike Email System Documentation

## Overview

DisputeStrike now has a comprehensive email marketing and nurture system inspired by successful credit repair companies like Creditfixrr. The system includes 17 automated emails that guide users through their trial, convert them to paying customers, and retain them long-term.

---

## Email Sequence Summary

### Trial Onboarding & Nurture (Days 0-7)

1. **Welcome Email** (Day 0) - Immediate after $1 payment
2. **Credit Analysis Ready** (Day 1) - Show credit scores and negative items
3. **Getting Started Tutorial** (Day 1-2) - Video walkthrough
4. **Dispute Process Explained** (Day 2-3) - Educational content
5. **AI Feature Highlight** (Day 3) - Show AI recommendations
6. **Complete Plan Benefits** (Day 3-4) - Upsell to Complete plan
7. **Objection Handler** (Day 4) - Address common concerns
8. **Trial Expiring - 3 Days** (Day 5) - First urgency reminder
9. **Special Offer** (Day 5-6) - Limited-time discount
10. **Trial Expiring - Tomorrow** (Day 6) - Final urgency reminder
11. **Trial Ended** (Day 7) - Soft close, keep door open

### Retention & Winback (Days 8+)

12. **Winback Email** (Day 14) - Special offer for churned users

### Transactional Emails (As Needed)

13. **Payment Reminder** - 3 days before billing
14. **Payment Failed** - When card is declined
15. **Payment Successful** - Receipt confirmation
16. **Upgrade Confirmation** - When upgrading to Complete
17. **Cancellation Confirmation** - When canceling subscription

---

## Technical Architecture

### File Structure

```
server/
├── email-templates/          # HTML email templates
│   ├── welcome.html
│   ├── credit-analysis-ready.html
│   ├── getting-started.html
│   ├── dispute-process.html
│   ├── feature-highlight-ai.html
│   ├── complete-plan-benefits.html
│   ├── objection-handler.html
│   ├── trial-expiring-3-days.html
│   ├── special-offer.html
│   ├── trial-expiring-tomorrow.html
│   ├── trial-ended.html
│   ├── winback.html
│   ├── payment-reminder.html
│   ├── payment-failed.html
│   ├── payment-successful.html
│   ├── upgrade-confirmation.html
│   └── cancellation-confirmation.html
├── emailTemplateService.ts   # Email template rendering & sending
├── trialEmailCronJobs.ts     # Cron jobs for trial emails
├── mailerooService.ts        # Maileroo API integration
└── cronJobs.ts               # Main cron scheduler
```

### Email Template Service

**Location**: `server/emailTemplateService.ts`

**Purpose**: Handles email template rendering and sending via Maileroo.

**Key Methods**:
- `sendWelcomeEmail(to, name)`
- `sendCreditAnalysisReadyEmail(to, name, scores, negativeItemsCount)`
- `sendGettingStartedEmail(to, name)`
- `sendDisputeProcessEmail(to, name)`
- `sendAIFeatureHighlightEmail(to, name, negativeItemsCount)`
- `sendCompletePlanBenefitsEmail(to, name)`
- `sendObjectionHandlerEmail(to, name)`
- `sendTrialExpiring3DaysEmail(to, name, trialEndDate)`
- `sendSpecialOfferEmail(to, name)`
- `sendTrialExpiringTomorrowEmail(to, name)`
- `sendTrialEndedEmail(to, name)`
- `sendWinbackEmail(to, name)`
- `sendPaymentReminderEmail(to, name, paymentDate)`
- `sendPaymentFailedEmail(to, name)`
- `sendPaymentSuccessfulEmail(to, name, plan)`
- `sendUpgradeConfirmationEmail(to, name)`
- `sendCancellationConfirmationEmail(to, name, accessEndDate)`

### Template Variables

All templates support these variables:
- `{{name}}` - User's first name
- `{{email}}` - User's email
- `{{plan}}` - DIY or Complete
- `{{trial_end_date}}` - When trial expires
- `{{negative_items_count}}` - Number of negative items found
- `{{credit_score_equifax}}` - Equifax score
- `{{credit_score_experian}}` - Experian score
- `{{credit_score_transunion}}` - TransUnion score
- `{{dashboard_url}}` - Link to dashboard
- `{{support_email}}` - support@disputestrike.com
- `{{payment_date}}` - Next payment date
- `{{access_end_date}}` - When access ends after cancellation

### Cron Jobs

**Location**: `server/trialEmailCronJobs.ts`

**Jobs**:
1. **processTrialEmails()** - Runs hourly, sends emails based on user signup date
2. **sendPaymentReminders()** - Runs daily at 10am, sends payment reminders 3 days before billing

**Scheduling**: Configured in `server/cronJobs.ts`

---

## Email Timing Logic

### How It Works

The cron job runs every hour and checks:
1. Days since user signup (`daysSinceSignup`)
2. Days until trial end (`daysUntilTrialEnd`)

Based on these values, it sends the appropriate email.

### Example Timeline

**User signs up on Monday at 2pm:**

| Day | Date | Time | Email Sent |
|-----|------|------|------------|
| 0 | Mon | 2:00pm | Welcome Email |
| 1 | Tue | 3:00pm | Credit Analysis Ready + Getting Started |
| 2 | Wed | 3:00pm | Dispute Process Explained |
| 3 | Thu | 3:00pm | AI Feature Highlight + Complete Plan Benefits |
| 4 | Fri | 3:00pm | Objection Handler |
| 5 | Sat | 3:00pm | Trial Expiring - 3 Days + Special Offer |
| 6 | Sun | 3:00pm | Trial Expiring - Tomorrow |
| 7 | Mon | 2:00pm | Trial Ended (if not converted) |
| 14 | Mon+7 | 10:00am | Winback Email |

---

## Testing the Email System

### Manual Testing

#### Test Individual Email

```typescript
import { emailTemplateService } from './server/emailTemplateService';

// Test welcome email
await emailTemplateService.sendWelcomeEmail(
  'test@example.com',
  'John'
);

// Test credit analysis email
await emailTemplateService.sendCreditAnalysisReadyEmail(
  'test@example.com',
  'John',
  { equifax: 650, experian: 655, transunion: 648 },
  12
);
```

#### Test Cron Job

```typescript
import { processTrialEmails } from './server/trialEmailCronJobs';

// Run cron job manually
await processTrialEmails();
```

### Automated Testing

Create test users with different signup dates to verify email timing:

```sql
-- Create test user signed up 3 days ago
INSERT INTO users (email, username, created_at) 
VALUES ('test3days@example.com', 'Test User', NOW() - INTERVAL 3 DAY);

-- Create test user signed up 5 days ago
INSERT INTO users (email, username, created_at) 
VALUES ('test5days@example.com', 'Test User', NOW() - INTERVAL 5 DAY);
```

Then run the cron job and verify emails are sent correctly.

### Email Tracking

Monitor email delivery in Maileroo dashboard:
- Open rates
- Click rates
- Bounce rates
- Spam complaints

---

## Customization Guide

### Adding a New Email

1. **Create HTML template**:
   ```bash
   touch server/email-templates/new-email.html
   ```

2. **Add method to emailTemplateService.ts**:
   ```typescript
   async sendNewEmail(to: string, name: string): Promise<void> {
     await this.sendTemplateEmail(
       to,
       'Subject Line',
       'new-email',
       { name, email: to }
     );
   }
   ```

3. **Add to cron job** in `trialEmailCronJobs.ts`:
   ```typescript
   if (daysSinceSignup === 5) {
     await emailTemplateService.sendNewEmail(user.email, user.name);
   }
   ```

### Changing Email Timing

Edit `trialEmailCronJobs.ts` and modify the `daysSinceSignup` or `daysUntilTrialEnd` conditions:

```typescript
// Change from Day 3 to Day 4
if (daysSinceSignup === 4) {  // was 3
  await emailTemplateService.sendAIFeatureHighlightEmail(...);
}
```

### Updating Email Content

1. Edit the HTML template in `server/email-templates/`
2. Use `{{variables}}` for dynamic content
3. Test by sending to yourself
4. Deploy

---

## Best Practices

### Email Design

1. **Keep it simple**: Focus on one main message per email
2. **Clear CTA**: One primary call-to-action button
3. **Mobile-first**: 80% of users read on mobile
4. **Personalization**: Always use `{{name}}`
5. **Value-first**: Lead with benefit, not feature

### Email Copywriting

1. **Subject lines**: 40-50 characters, use emoji sparingly
2. **Preview text**: First 100 characters matter
3. **Tone**: Friendly, supportive, not pushy
4. **Urgency**: Use sparingly, only when genuine
5. **Social proof**: Include testimonials

### Email Deliverability

1. **Warm up domain**: Start with low volume, increase gradually
2. **Clean list**: Remove bounces and unsubscribes
3. **SPF/DKIM**: Verify DNS records are correct
4. **Avoid spam words**: "Free", "Act now", "Limited time"
5. **Test before sending**: Use Litmus or Email on Acid

---

## Troubleshooting

### Emails Not Sending

1. **Check Maileroo API key**: Verify in `.env` file
2. **Check cron jobs**: Run `getCronJobStatus()` in console
3. **Check logs**: Look for `[EmailTemplate]` and `[TrialEmails]` in server logs
4. **Test Maileroo**: Send test email via Maileroo dashboard

### Wrong Email Timing

1. **Check user `createdAt`**: Verify signup date in database
2. **Check trial `trialEndsAt`**: Verify trial end date
3. **Check cron frequency**: Should run hourly
4. **Check timezone**: Server time vs user time

### Template Variables Not Replacing

1. **Check variable name**: Must match exactly (case-sensitive)
2. **Check template syntax**: Use `{{variable}}` not `{variable}`
3. **Check data passed**: Verify variable is passed to `sendTemplateEmail()`

---

## Metrics to Track

### Email Performance

- **Open Rate**: Target >25%
- **Click Rate**: Target >5%
- **Conversion Rate**: Target >15%
- **Unsubscribe Rate**: Target <1%

### Business Metrics

- **Trial-to-Paid Conversion**: Target >20%
- **Time to First Dispute**: Target <24 hours
- **Upgrade Rate (DIY → Complete)**: Target >10%
- **Churn Rate**: Target <5%/month

### A/B Testing Ideas

1. **Subject lines**: Emoji vs no emoji
2. **Send time**: Morning vs evening
3. **CTA text**: "Upgrade Now" vs "Keep Access"
4. **Email length**: Short vs long
5. **Urgency**: High vs low

---

## Future Enhancements

### Phase 2 (After IdentityIQ Integration)

1. **Real credit scores**: Replace placeholder scores with actual data
2. **Personalized recommendations**: Show specific negative items
3. **Progress emails**: "You removed 3 items this month!"
4. **Score increase alerts**: "Your score went up 15 points!"

### Phase 3 (Advanced Features)

1. **Behavioral triggers**: Send email when user completes action
2. **Segmentation**: Different emails for DIY vs Complete users
3. **Dynamic content**: Show different content based on user data
4. **SMS integration**: Send SMS for critical reminders
5. **Push notifications**: Browser/mobile push for real-time updates

---

## Support & Maintenance

### Regular Tasks

- **Weekly**: Review email metrics in Maileroo
- **Monthly**: A/B test one email element
- **Quarterly**: Update email copy based on feedback
- **Annually**: Redesign email templates

### Contact

For questions or issues with the email system:
- **Email**: dev@disputestrike.com
- **Documentation**: This file
- **Code**: `server/emailTemplateService.ts` and `server/trialEmailCronJobs.ts`

---

## Changelog

### Version 1.0 (January 2026)
- Initial implementation of 17-email sequence
- Maileroo integration
- Cron job automation
- Template system with variables
- Based on Creditfixrr email analysis

---

**Last Updated**: January 15, 2026  
**Author**: Manus AI  
**Version**: 1.0
