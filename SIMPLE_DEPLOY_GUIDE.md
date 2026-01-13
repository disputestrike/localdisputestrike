# 🚀 DisputeStrike: Simple Go-Live Guide

This guide is for you to get DisputeStrike live on your own domain using DigitalOcean. No IT background required!

## Step 1: Log in to DigitalOcean
1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com) and log in.
2. Click the green **"Create"** button in the top right.
3. Select **"Apps"** from the menu.

## Step 2: Connect Your GitHub
1. Click on **"GitHub"**.
2. A popup will ask you to authorize DigitalOcean. Click **"Authorize"**.
3. Once connected, select your repository: `disputestrike/DisputeStrike`.
4. Leave the branch as `main` and click **"Next"**.

## Step 3: Configure the App
1. DigitalOcean will automatically detect the settings. Just click **"Next"** on the "Resources" page.
2. On the **"Environment Variables"** page, click **"Edit"** and add these exact values (Copy & Paste):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `mysql://hzCbMda76tmFdt4.root:layaS4xN7UNF3e9u87Zt@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/KD8igV5APKrQwmz3rzYZ6D?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET` | `hBAUk2zCYqSCVzgFmbaAne` |
| `OPENAI_API_KEY` | *(Paste your OpenAI Key here)* |
| `ANTHROPIC_API_KEY` | *(Paste your Anthropic Key here)* |
| `SENDGRID_API_KEY` | `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` |
| `SENDGRID_FROM_EMAIL` | `support@disputestrike.com` |
| `STRIPE_SECRET_KEY` | *(Paste your Stripe Secret Key)* |
| `STRIPE_WEBHOOK_SECRET` | *(Paste your Stripe Webhook Secret)* |
| `VITE_STRIPE_PUBLISHABLE_KEY` | *(Paste your Stripe Publishable Key)* |

3. Click **"Next"**.

## Step 4: Finalize & Launch
1. Choose the **"Basic"** plan ($12/month). This is plenty for now.
2. Click **"Create Resources"** at the bottom.
3. Wait about 5-10 minutes. You will see a green bar that says **"Deployment successful"**.

## Step 5: Connect Your Domain
1. In your DigitalOcean App dashboard, click the **"Settings"** tab.
2. Click **"Domains"** → **"Add Domain"**.
3. Type `disputestrike.com`.
4. DigitalOcean will give you "CNAME" or "A" records. Copy these and paste them into your domain provider (like GoDaddy or Namecheap).

---

## 🔑 Your Admin Login
Once live, go to: `https://disputestrike.com/admin/login`

- **Email:** `admin@disputestrike.com`
- **Password:** `StrikeAdmin2026!`

**Congratulations! Your business is now live!**
