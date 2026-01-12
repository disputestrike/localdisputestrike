# DisputeStrike - DigitalOcean App Platform Deployment Guide

## Quick Start (15-20 minutes)

This guide will help you deploy DisputeStrike to DigitalOcean App Platform.

---

## Prerequisites

Before you begin, make sure you have:

1. **DigitalOcean Account** - Sign up at https://digitalocean.com
2. **GitHub Repository** - Your code is at https://github.com/disputestrike/DisputeStrike
3. **Domain Name** (optional) - e.g., disputestrike.com
4. **API Keys Ready:**
   - OpenAI API Key
   - SendGrid API Key (for emails)
   - Stripe Keys (for payments)
   - TiDB Database URL

---

## Step 1: Create DigitalOcean App

1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. Click **"Create"** → **"Apps"**
3. Select **"GitHub"** as the source
4. Authorize DigitalOcean to access your GitHub account
5. Select repository: **disputestrike/DisputeStrike**
6. Select branch: **main**
7. Click **"Next"**

---

## Step 2: Configure Resources

1. DigitalOcean will auto-detect your app as a **Web Service**
2. Keep the default settings:
   - **Type:** Web Service
   - **Build Command:** `npm install && npm run build`
   - **Run Command:** `npm start`
   - **HTTP Port:** 3000

3. Click **"Edit Plan"** and select:
   - **Basic Plan** - $12/month (recommended to start)
   - This handles up to 500 concurrent users

4. Click **"Next"**

---

## Step 3: Set Environment Variables

Click **"Edit"** next to Environment Variables and add these:

### Required Variables

| Key | Value | Type |
|-----|-------|------|
| `NODE_ENV` | `production` | Plain |
| `DATABASE_URL` | Your TiDB connection string | Secret |
| `JWT_SECRET` | Random 64-char string* | Secret |
| `OPENAI_API_KEY` | Your OpenAI key | Secret |
| `SENDGRID_API_KEY` | Your SendGrid key | Secret |
| `SENDGRID_FROM_EMAIL` | `noreply@disputestrike.com` | Plain |
| `ADMIN_EMAIL` | `admin@disputestrike.com` | Plain |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Secret |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret | Secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Plain |

*Generate JWT_SECRET with: `openssl rand -hex 32`

### Optional Variables

| Key | Value | Type |
|-----|-------|------|
| `ANTHROPIC_API_KEY` | Your Anthropic key | Secret |
| `TWILIO_ACCOUNT_SID` | Twilio SID (for SMS) | Secret |
| `TWILIO_AUTH_TOKEN` | Twilio token | Secret |
| `TWILIO_PHONE_NUMBER` | Your Twilio number | Plain |

Click **"Save"** then **"Next"**

---

## Step 4: Configure App Info

1. **App Name:** `disputestrike` (or your preference)
2. **Region:** Choose closest to your users (e.g., New York, San Francisco)
3. Click **"Next"**

---

## Step 5: Review and Deploy

1. Review your configuration
2. Click **"Create Resources"**
3. Wait for deployment (5-10 minutes)

You'll see:
- Building... (2-3 minutes)
- Deploying... (1-2 minutes)
- ✅ Deployed!

---

## Step 6: Set Up Custom Domain (Optional)

1. Go to your app's **Settings** tab
2. Click **"Domains"** → **"Add Domain"**
3. Enter your domain: `disputestrike.com`
4. Add these DNS records at your domain registrar:

### For Root Domain (disputestrike.com)
| Type | Name | Value |
|------|------|-------|
| A | @ | `(DigitalOcean will provide IP)` |

### For Subdomain (www.disputestrike.com)
| Type | Name | Value |
|------|------|-------|
| CNAME | www | `disputestrike-xxxxx.ondigitalocean.app` |

5. Enable **"Force HTTPS"**
6. Wait for SSL certificate (automatic, 5-15 minutes)

---

## Step 7: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in DigitalOcean environment variables

---

## Step 8: Verify SendGrid Sender

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Settings** → **Sender Authentication**
3. Verify your domain or single sender email
4. This is required for emails to be delivered

---

## Post-Deployment Checklist

After deployment, verify everything works:

- [ ] Visit your app URL - homepage loads
- [ ] Test registration - create a new account
- [ ] Check email - verification email received
- [ ] Test login - can log in with new account
- [ ] Test AI Assistant - sends and receives messages
- [ ] Test payment - Stripe checkout works (use test mode first)
- [ ] Check health endpoint: `https://your-domain.com/api/health`

---

## Scaling Your App

As your business grows:

| Users | Plan | Cost | Action |
|-------|------|------|--------|
| 0-500 | Basic ($12/mo) | $12/mo | Starting plan |
| 500-2000 | Basic ($24/mo) | $24/mo | Upgrade in settings |
| 2000-10000 | Pro ($50/mo) | $50/mo | Switch to Pro plan |
| 10000+ | Pro + Workers | $100+/mo | Add worker instances |

To scale:
1. Go to **Settings** → **App Spec**
2. Increase `instance_size_slug` or `instance_count`
3. Click **"Save"**

---

## Troubleshooting

### App won't start
- Check **Runtime Logs** in DigitalOcean
- Verify all environment variables are set
- Make sure DATABASE_URL is correct

### Emails not sending
- Verify SendGrid sender authentication
- Check SENDGRID_API_KEY is correct
- Check spam folder

### Database connection errors
- Verify DATABASE_URL format
- Ensure TiDB Cloud allows connections from DigitalOcean IPs
- Check SSL settings in connection string

### Stripe payments failing
- Verify webhook URL is correct
- Check webhook signing secret matches
- Review Stripe dashboard for error details

---

## Environment Variables Reference

```bash
# Required
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:4000/db?ssl={"rejectUnauthorized":true}
JWT_SECRET=your-64-character-random-string
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

---

## Your Current API Keys

These are already configured in your `.env` file:

| Service | Status |
|---------|--------|
| TiDB Database | ✅ Configured |
| OpenAI | ✅ Configured |
| Anthropic | ✅ Configured |
| Stripe | ✅ Configured |
| SendGrid | ✅ Configured |
| JWT Secret | ✅ Configured |

---

## Quick Reference

| Item | URL |
|------|-----|
| DigitalOcean Dashboard | https://cloud.digitalocean.com/apps |
| Stripe Dashboard | https://dashboard.stripe.com |
| SendGrid Dashboard | https://app.sendgrid.com |
| TiDB Cloud | https://tidbcloud.com |
| GitHub Repo | https://github.com/disputestrike/DisputeStrike |

---

## Auto-Deploy Setup

Your app is configured to auto-deploy when you push to the `main` branch:

1. Make changes locally
2. Commit and push to GitHub
3. DigitalOcean automatically rebuilds and deploys

To disable auto-deploy:
1. Go to **Settings** → **App Spec**
2. Set `deploy_on_push: false`
