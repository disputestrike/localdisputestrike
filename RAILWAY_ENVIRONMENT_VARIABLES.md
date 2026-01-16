# Railway Environment Variables Configuration

## Required Environment Variables for DisputeStrike Production Deployment

Add these environment variables in your Railway project dashboard under **Variables** tab.

---

## 🔐 Authentication & Security

### Manus OAuth (if using Manus platform)
```
MANUS_CLIENT_ID=your_manus_client_id
MANUS_CLIENT_SECRET=your_manus_client_secret
```

### Session Secret
```
SESSION_SECRET=generate_a_random_32_character_string_here
```
**How to generate:** `openssl rand -base64 32`

---

## 💳 Stripe Payment Integration

### Stripe API Keys
```
STRIPE_SECRET_KEY=sk_test_51K84FCJbDEkzZWwH6JR6Vfr61NYfnSn4opYvV39cVD5GxzaAMgCMn4mEpBCTFxtRiAfxMPVPH6U1QR63Mobeg3Cw00iaK1HVws
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51K84FCJbDEkzZWwH6JR6Vfr61NYfnSn4opYvV39cVD5GxzaAMgCMn4mEpBCTFxtRiAfxMPVPH6U1QR63Mobeg3Cw00iaK1HVws
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important:** 
- Use **test keys** (`sk_test_...` and `pk_test_...`) for testing
- Switch to **live keys** (`sk_live_...` and `pk_live_...`) for production
- Get webhook secret from Stripe Dashboard → Developers → Webhooks

---

## 📧 Email Service (Maileroo)

### Maileroo API
```
MAILEROO_API_KEY=9b8678acc14a7ee13e6277916796da31272bcb43dee9bb388b6a998f9703f1a2
MAILEROO_FROM_EMAIL=noreply@disputestrike.com
MAILEROO_FROM_NAME=DisputeStrike
```

---

## 🏦 Database Configuration

### MySQL/TiDB Connection
```
DATABASE_URL=mysql://username:password@host:port/database_name
```

**Example:**
```
DATABASE_URL=mysql://root:password123@mysql.railway.internal:3306/disputestrike_prod
```

**Note:** Railway automatically provides `DATABASE_URL` if you provision a MySQL database in the same project.

---

## 🆔 IdentityIQ Integration (Pending)

### IdentityIQ API Credentials
```
IDENTITYIQ_API_KEY=your_identityiq_api_key_here
IDENTITYIQ_API_SECRET=your_identityiq_api_secret_here
IDENTITYIQ_OFFER_CODE=your_offer_code_here
IDENTITYIQ_PLAN_CODE=your_plan_code_here
IDENTITYIQ_WEBHOOK_SECRET=your_webhook_secret_here
```

**Status:** ⏳ Waiting for IdentityIQ credentials

---

## 🌐 Application URLs

### Frontend & Backend URLs
```
FRONTEND_URL=https://www.disputestrike.com
BACKEND_URL=https://api.disputestrike.com
```

**Note:** Update these to match your actual domain names.

---

## 📝 Optional Configuration

### Node Environment
```
NODE_ENV=production
```

### Port (Railway auto-assigns)
```
PORT=3000
```
**Note:** Railway automatically sets this. Usually don't need to override.

### Logging Level
```
LOG_LEVEL=info
```
Options: `debug`, `info`, `warn`, `error`

---

## 🚀 How to Add Variables in Railway

1. Go to your Railway project dashboard
2. Click on your **DisputeStrike** service
3. Navigate to the **Variables** tab
4. Click **+ New Variable**
5. Enter the variable name and value
6. Click **Add**
7. Railway will automatically redeploy with the new variables

---

## ✅ Verification Checklist

After adding all variables, verify:

- [ ] Stripe card input renders on `/trial-checkout`
- [ ] Test payment with card `4242 4242 4242 4242` succeeds
- [ ] Welcome email is sent via Maileroo
- [ ] Database connection works
- [ ] User account is created successfully
- [ ] Subscription is created in Stripe
- [ ] No errors in Railway deploy logs

---

## 🔒 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Rotate secrets** regularly (every 90 days)
3. **Use test keys** in development/staging
4. **Use live keys** only in production
5. **Restrict API key** permissions to minimum required
6. **Enable 2FA** on all service accounts (Stripe, Maileroo, etc.)
7. **Monitor logs** for unauthorized access attempts

---

## 📞 Support

If you encounter issues:

1. Check Railway **Deploy Logs** for errors
2. Verify all required variables are set
3. Test locally with the same environment variables
4. Contact support at support@disputestrike.com

---

## 📋 Quick Copy-Paste Template

```bash
# Authentication
SESSION_SECRET=generate_random_32_char_string

# Stripe
STRIPE_SECRET_KEY=sk_test_51K84FCJbDEkzZWwH6JR6Vfr61NYfnSn4opYvV39cVD5GxzaAMgCMn4mEpBCTFxtRiAfxMPVPH6U1QR63Mobeg3Cw00iaK1HVws
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51K84FCJbDEkzZWwH6JR6Vfr61NYfnSn4opYvV39cVD5GxzaAMgCMn4mEpBCTFxtRiAfxMPVPH6U1QR63Mobeg3Cw00iaK1HVws
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
MAILEROO_API_KEY=9b8678acc14a7ee13e6277916796da31272bcb43dee9bb388b6a998f9703f1a2
MAILEROO_FROM_EMAIL=noreply@disputestrike.com
MAILEROO_FROM_NAME=DisputeStrike

# Database (auto-provided by Railway if using Railway MySQL)
DATABASE_URL=mysql://user:pass@host:port/db

# URLs
FRONTEND_URL=https://www.disputestrike.com
BACKEND_URL=https://api.disputestrike.com

# Environment
NODE_ENV=production
```

---

**Last Updated:** January 15, 2026
