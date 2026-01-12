# DisputeStrike Deployment Guide

## 🎉 Your Application is LIVE!

**Live Preview URL:** https://3000-ifr2fyyq55ca39r7z1h3b-daedb07a.us2.manus.computer

---

## What's Working

✅ **Full Homepage** - Complete landing page with all sections  
✅ **Pricing Page** - All 3 tiers displayed ($29, $79, $39.99/mo)  
✅ **Navigation** - All menu links working  
✅ **OAuth Login** - Manus OAuth integration (Google, Microsoft, Apple)  
✅ **Stripe Integration** - Using your test keys  
✅ **Database Connection** - Connected to TiDB Cloud  
✅ **All 43 Dispute Methods** - Fully implemented  
✅ **API Endpoints** - All tRPC routes active  

---

## How to Use Your Own Domain

### Option 1: Deploy to a VPS (Recommended for Production)

#### Step 1: Get a VPS
- **Recommended providers:** DigitalOcean, Linode, Vultr, AWS EC2
- **Minimum specs:** 2GB RAM, 1 vCPU, 25GB SSD
- **OS:** Ubuntu 22.04 LTS

#### Step 2: Install Dependencies on VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL client (for database migrations)
sudo apt install -y mysql-client
```

#### Step 3: Upload Your Project
```bash
# On your local machine, zip the project
cd /path/to/DisputeStrike
zip -r disputestrike.zip . -x "node_modules/*"

# Upload to VPS
scp disputestrike.zip user@your-vps-ip:/home/user/

# On VPS, extract and install
unzip disputestrike.zip -d DisputeStrike
cd DisputeStrike
pnpm install
```

#### Step 4: Configure Environment
Create `.env` file with your production values:
```bash
NODE_ENV=production
PORT=3000

# Database (your TiDB Cloud connection)
DATABASE_URL=mysql://hzCbMda76tmFdt4.root:layaS4xN7UNF3e9u87Zt@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/KD8igV5APKrQwmz3rzYZ6D

# JWT Secret
JWT_SECRET=hBAUk2zCYqSCVzgFmbaAne

# Stripe (your keys)
STRIPE_SECRET_KEY=sk_test_51K84FCJbDEkzZWwH3xh66ECgb4dDBFQSYOiaU2GpsHNVbb124PKutSmMuwLlTZM6mbR4T1VNseaCw3W3BEyaW78a00BGo5nMEB
STRIPE_WEBHOOK_SECRET=whsec_iEmozaF7EFvsJbX32eHlLvkU3iZRmgey
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51K84FCJbDEkzZWwH6JR6Vfr61NYfnSn4opYvV39cVD5GxzaAMgCMn4mEpBCTFxtRiAfxMPVPH6U1QR63Mobeg3Cw00iaK1HVws

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
```

#### Step 5: Run the Application
```bash
# Start with PM2 (recommended for production)
npm install -g pm2
pm2 start dist/index.js --name disputestrike
pm2 save
pm2 startup
```

#### Step 6: Set Up Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/disputestrike
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/disputestrike /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Set Up SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Step 8: Configure Your Domain DNS
Point your domain to your VPS IP:
- **A Record:** `@` → `YOUR_VPS_IP`
- **A Record:** `www` → `YOUR_VPS_IP`

---

### Option 2: Deploy to Vercel/Railway/Render

#### Vercel (Frontend + Serverless)
1. Push your code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

#### Railway
1. Create new project from GitHub
2. Add environment variables
3. Railway auto-detects Node.js and deploys

#### Render
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `node dist/index.js`
5. Add environment variables

---

### Option 3: Deploy to AWS/GCP/Azure

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js disputestrike

# Create environment
eb create disputestrike-prod

# Deploy
eb deploy
```

---

## Domain Configuration Checklist

1. **Purchase a domain** from Namecheap, GoDaddy, or Cloudflare
2. **Point DNS** to your server IP
3. **Set up SSL** (Let's Encrypt is free)
4. **Update environment variables** with your production domain
5. **Configure Stripe webhooks** with your production URL

---

## Stripe Production Setup

When ready for production:

1. **Get live Stripe keys** from https://dashboard.stripe.com/apikeys
2. **Update `.env`** with live keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
3. **Create webhook endpoint** in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
4. **Update webhook secret** in `.env`

---

## Important Notes

⚠️ **Security:** Never commit `.env` files to Git  
⚠️ **Database:** Your TiDB Cloud database is already set up and working  
⚠️ **OAuth:** Manus OAuth is configured and working  
⚠️ **Stripe:** Currently using test keys - switch to live for production  

---

## Support

Your DisputeStrike application includes:
- 43 dispute detection methods
- AI-powered letter generation
- Cross-bureau conflict detection
- Stripe payment integration
- OAuth authentication
- Real-time tracking dashboard

The application is running exactly as you built it with no changes or additions.
