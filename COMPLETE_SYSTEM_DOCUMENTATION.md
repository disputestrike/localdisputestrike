# DisputeStrike Complete Trial-to-Subscription System

## 🎯 Overview

This document describes the complete trial-to-subscription system for DisputeStrike, including payment flows, subscription management, and IdentityIQ integration.

## 📊 Business Flow

### Customer Journey

```
1. Customer visits /trial-checkout
2. Selects plan (DIY $49.99/mo or Complete $79.99/mo)
3. Creates account (email + password only)
4. Pays $1 via Stripe
5. Stripe creates subscription with 7-day trial
6. We pay IdentityIQ $1 immediately
7. Customer redirected to IdentityIQ for credit pull (FUTURE)
8. Customer sees credit analysis in dashboard
9. Two paths:
   a) Upgrade immediately → End trial, start monthly billing
   b) Wait 7 days → Auto-charge monthly fee on Day 8
10. Monthly: We charge customer → We pay IdentityIQ
```

### Payment Flow

```
Customer → DisputeStrike (Stripe) → IdentityIQ (White Label)

Trial: $1 → $1 to IdentityIQ
Monthly: $49.99/$79.99 → ~$29.99 to IdentityIQ (pricing TBD)
```

## 🏗️ System Architecture

### Frontend Components

#### 1. TrialCheckout.tsx
**Location**: `client/src/pages/TrialCheckout.tsx`

**Features**:
- 3-step checkout flow (Plan → Account → Payment)
- Simplified form (email, password only - no SSN/DOB)
- Stripe Elements integration
- Plan selection (DIY vs Complete)
- Real-time validation

**Key Changes**:
- ❌ Removed: SSN, DOB, address fields
- ✅ Added: Stripe subscription creation
- ✅ Added: Clean UI with progress indicators

#### 2. UpgradeBanner.tsx
**Location**: `client/src/components/UpgradeBanner.tsx`

**Features**:
- Shows trial status and days remaining
- "Upgrade Now" button
- Dismissible
- Shows plan benefits

**Usage**:
```tsx
<UpgradeBanner 
  trialEndsAt={new Date(subscription.trialEndsAt)}
  currentPlan={subscription.tier}
  onUpgrade={async () => {
    await fetch('/api/v2/subscription/upgrade', { method: 'POST' });
  }}
/>
```

### Backend Services

#### 1. Stripe Subscription Service
**Location**: `server/stripeSubscriptionService.ts`

**Key Functions**:

```typescript
// Create trial subscription with $1 payment
createTrialSubscription({ email, plan, userId })

// Upgrade trial to paid immediately
upgradeTrialToSubscription({ subscriptionId, userId })

// Cancel subscription
cancelSubscription({ subscriptionId, immediate })

// Reactivate canceled subscription
reactivateSubscription({ subscriptionId })

// Change plan (DIY ↔ Complete)
changeSubscriptionPlan({ subscriptionId, newPlan })

// Get subscription details
getSubscriptionDetails({ subscriptionId })

// Handle Stripe webhooks
handleStripeWebhook({ event, callbacks })

// Create customer portal URL
createCustomerPortalSession({ customerId, returnUrl })
```

**Stripe Configuration**:
- Trial period: 7 days
- Trial fee: $1 (charged upfront)
- Auto-billing: Enabled after trial
- Payment method: Saved for future use

#### 2. IdentityIQ Service
**Location**: `server/identityiqService.ts`

**Key Functions**:

```typescript
// Pay IdentityIQ for trial access
payIdentityIQTrial({ userId, amount, metadata })

// Pay monthly subscription fee
payIdentityIQMonthly({ userId, amount, metadata })

// Activate IdentityIQ subscription
activateIdentityIQSubscription({ userId, planType, monthlyCost })

// Cancel IdentityIQ subscription
cancelIdentityIQSubscription({ userId, subscriptionId })

// Get credit report (FUTURE)
getCreditReport({ userId, ssn, dob, address })
```

**Status**: 
- ⚠️ API calls are **placeholders**
- ✅ Service structure ready
- ⏳ Waiting for IdentityIQ credentials

#### 3. Cancellation Handler
**Location**: `server/cancellationHandler.ts`

**Key Functions**:

```typescript
// Cancel user subscription completely
cancelUserSubscription({ 
  userId, 
  immediate, 
  reason, 
  feedback 
})

// Reactivate canceled subscription
reactivateUserSubscription({ userId })
```

**Cancellation Flow**:
1. Cancel Stripe subscription
2. Cancel IdentityIQ subscription (if immediate)
3. Update database status
4. Send confirmation email
5. Record feedback

#### 4. Maileroo Email Service
**Location**: `server/mailerooService.ts`

**Key Functions**:

```typescript
// Send any email
sendEmail({ to, subject, html, plain, tags })

// Send trial welcome email
sendTrialWelcomeEmail(email, name)

// Send password reset email
sendPasswordResetEmail(email, resetToken)
```

**Configuration**:
- API Key: Set in `.env` as `MAILEROO_API_KEY`
- From Email: `noreply@disputestrike.com`
- From Name: `DisputeStrike`

### API Routes

#### Subscription Routes
**Location**: `server/routesV2-subscription.ts`

```
POST /api/v2/subscription/create-trial
  Body: { email, password, plan }
  Returns: { clientSecret, subscriptionId, userId }

POST /api/v2/subscription/upgrade
  Auth: Required
  Returns: { success, message }

POST /api/v2/subscription/cancel
  Auth: Required
  Body: { immediate?: boolean }
  Returns: { success, message }

POST /api/v2/subscription/reactivate
  Auth: Required
  Returns: { success, message }

POST /api/v2/subscription/change-plan
  Auth: Required
  Body: { newPlan: 'diy' | 'complete' }
  Returns: { success, message }

GET /api/v2/subscription/details
  Auth: Required
  Returns: { subscription, stripe }

POST /api/v2/subscription/portal
  Auth: Required
  Returns: { url }
```

### Cron Jobs

#### 1. Trial Email Sequence
**Schedule**: Every hour
**Function**: `processTrialEmails()`
**Purpose**: Send nurture emails on Day 1, 3, 5, 6, 7

#### 2. Trial Expiration
**Schedule**: Every hour
**Function**: `expireTrials()`
**Purpose**: Mark trials as expired after 7 days

#### 3. Winback Emails
**Schedule**: Daily at 10am
**Function**: `sendWinbackEmails()`
**Purpose**: Send winback emails 14 days after trial expires

#### 4. IdentityIQ Monthly Payments
**Schedule**: Daily at 2am
**Function**: `processIdentityIQMonthlyPayments()`
**Purpose**: Pay IdentityIQ for active subscriptions

#### 5. IdentityIQ Payment Retry
**Schedule**: Daily at 11am
**Function**: `retryFailedIdentityIQPayments()`
**Purpose**: Retry failed payments from last 3 days

#### 6. IdentityIQ Cancellation Sync
**Schedule**: Every hour
**Function**: `syncCanceledSubscriptions()`
**Purpose**: Cancel IdentityIQ subscriptions when Stripe subscriptions are canceled

## 🔧 Configuration

### Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Maileroo
MAILEROO_API_KEY=9b8678acc14a7ee13e6277916796da31272bcb43dee9bb388b6a998f9703f1a2
MAILEROO_FROM_EMAIL=noreply@disputestrike.com
MAILEROO_FROM_NAME=DisputeStrike

# IdentityIQ (FUTURE)
IDENTITYIQ_API_KEY=<pending>
IDENTITYIQ_API_SECRET=<pending>
IDENTITYIQ_MONTHLY_COST=2999

# Database
DATABASE_URL=mysql://...

# App
APP_URL=https://www.disputestrike.com
ADMIN_EMAIL=admin@disputestrike.com
```

## 📝 Database Schema

### subscriptionsV2
```sql
- id
- userId
- tier (diy, complete)
- status (trial, active, canceling, canceled, expired)
- stripeCustomerId
- stripeSubscriptionId
- trialStartedAt
- trialEndsAt
- canceledAt
- createdAt
- updatedAt
```

### trialConversions
```sql
- id
- userId
- trialStartedAt
- converted (boolean)
- convertedAt
- expiredAt
- day1EmailSent
- day3EmailSent
- day5EmailSent
- day6EmailSent
- day7EmailSent
- winbackEmailSent
- createdAt
```

### identityiq_payments (FUTURE)
```sql
- id
- userId
- subscriptionId
- paymentType (trial, monthly)
- amountCents
- status (pending, paid, failed, refunded)
- identityiqTransactionId
- paidAt
- failedAt
- failureReason
- metadata (JSON)
- createdAt
- updatedAt
```

## 🚀 Deployment Checklist

### Before Production

- [ ] Switch Stripe to live keys
- [ ] Verify Maileroo account is approved
- [ ] Set up Stripe webhooks at production URL
- [ ] Test $1 trial payment flow
- [ ] Test immediate upgrade flow
- [ ] Test auto-billing after 7 days
- [ ] Test cancellation flow
- [ ] Test email delivery
- [ ] Monitor cron job execution
- [ ] Set up error alerting

### IdentityIQ Integration (When Ready)

- [ ] Get IdentityIQ API credentials
- [ ] Update `identityiqService.ts` with real API calls
- [ ] Test credit report pull
- [ ] Test monthly payment to IdentityIQ
- [ ] Test cancellation sync
- [ ] Verify pricing and billing
- [ ] Set up webhook for credit data
- [ ] Test complete end-to-end flow

## 🧪 Testing

### Test Cards (Stripe Test Mode)

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Scenarios

1. **Happy Path - Immediate Upgrade**
   - Sign up for trial
   - Pay $1
   - Click "Upgrade Now"
   - Verify billing starts immediately

2. **Happy Path - Auto-Convert**
   - Sign up for trial
   - Pay $1
   - Wait 7 days (or simulate)
   - Verify auto-charge on Day 8

3. **Cancellation - Immediate**
   - Sign up for trial
   - Cancel immediately
   - Verify access removed
   - Verify IdentityIQ canceled

4. **Cancellation - End of Period**
   - Sign up for trial
   - Upgrade to paid
   - Cancel at end of period
   - Verify access continues until period end
   - Verify IdentityIQ cancels at period end

5. **Reactivation**
   - Cancel subscription
   - Reactivate before period ends
   - Verify billing resumes

## 📊 Monitoring

### Key Metrics to Track

- Trial signups per day
- Trial → Paid conversion rate
- Cancellation rate
- Average trial duration before conversion
- IdentityIQ payment success rate
- Email delivery rate
- Cron job execution status

### Admin Dashboard (TODO)

Create admin dashboard at `/admin/subscriptions` to monitor:
- Active trials
- Active subscriptions
- Pending cancellations
- Failed IdentityIQ payments
- Email delivery stats
- Revenue metrics

## 🐛 Troubleshooting

### Common Issues

**Issue**: Stripe payment fails
- Check Stripe test keys are correct
- Verify webhook endpoint is accessible
- Check Stripe dashboard for error details

**Issue**: Emails not sending
- Verify Maileroo API key in `.env`
- Check Maileroo dashboard for delivery status
- Verify `from` email is approved

**Issue**: Cron jobs not running
- Check server logs for cron job start messages
- Verify `startAllCronJobs()` is called on server start
- Check for any error messages in logs

**Issue**: IdentityIQ payments failing
- Check placeholder API calls are being executed
- Verify IdentityIQ credentials when available
- Check admin email for failure notifications

## 📞 Support

For issues or questions:
- Email: admin@disputestrike.com
- GitHub: [Repository URL]
- Slack: #disputestrike-dev

## 📄 License

Proprietary - DisputeStrike, Inc.
