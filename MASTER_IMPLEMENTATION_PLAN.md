# DISPUTESTRIKE MASTER IMPLEMENTATION PLAN

**Date:** January 20, 2026  
**Target Launch:** Next Week  
**Status:** PENDING YOUR APPROVAL

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Pricing Model Changes](#2-pricing-model-changes)
3. [SmartCredit Affiliate Integration](#3-smartcredit-affiliate-integration)
4. [User Flow Redesign](#4-user-flow-redesign)
5. [Data Collection & Onboarding](#5-data-collection--onboarding)
6. [Lob Mail Integration](#6-lob-mail-integration)
7. [Email Sequences (Already Built)](#7-email-sequences-already-built)
8. [Legal Compliance & Disclaimers](#8-legal-compliance--disclaimers)
9. [Marketing & Positioning](#9-marketing--positioning)
10. [Database Changes](#10-database-changes)
11. [What Already Exists vs What Needs Building](#11-what-already-exists-vs-what-needs-building)
12. [7-Day Implementation Timeline](#12-7-day-implementation-timeline)
13. [Cost Structure & Unit Economics](#13-cost-structure--unit-economics)

---

# 1. EXECUTIVE SUMMARY

## The Big Changes:

| Aspect | OLD | NEW |
|--------|-----|-----|
| **Entry** | $1 trial | FREE forever |
| **Analysis** | Show 3 violations, blur rest | Show ALL violations |
| **Gate** | Pay to see violations | Pay to generate letters |
| **Report Source** | User uploads | SmartCredit affiliate link OR $4.95 fee |
| **Mailing** | Manual | Lob.com integration (Complete Plan) |

## Your SmartCredit Affiliate Link:
```
https://www.smartcredit.com/?PID=87529
```

## The Economics:
- User uses affiliate link → You get $25 commission → FREE analysis
- User uploads directly → They pay $4.95 → Analysis
- **You NEVER lose money**

---

# 2. PRICING MODEL CHANGES

## NEW 4-Tier Pricing:

### TIER 1: FREE FOREVER ($0)
```
✅ Upload unlimited credit reports
✅ AI analysis of ALL violations (no limit)
✅ See complete list of detected violations
✅ Cross-bureau conflict detection
✅ 43 violation methods explained
✅ Estimated deletion success rate
✅ Educational content

❌ Generate dispute letters
❌ Download letters
❌ Track dispute status
❌ CFPB complaint generator
```

### TIER 2: DIY PLAN ($49.99/month)
```
Everything in Free, PLUS:
✅ Unlimited dispute letter generation
✅ All 43 violation methods
✅ Download letters as PDF
✅ Round 2 & 3 escalation letters
✅ Furnisher dispute letters
✅ Dispute tracking dashboard
✅ Email support

YOU DO:
• Print letters
• Mail via USPS certified mail ($8-12 per letter)
• Track responses manually
```

### TIER 3: COMPLETE PLAN ($79.99/month) - MOST POPULAR
```
Everything in DIY, PLUS:
✅ Automated certified mailing (Lob.com)
✅ One-click dispute sending
✅ USPS tracking (real-time)
✅ Automatic follow-up scheduling
✅ CFPB complaint generator
✅ Priority email support

YOU DO:
• Review AI-generated letters
• Click "Authorize & Send"
• Monitor results in dashboard

WE DO (After Your Authorization):
• Print and mail via USPS Certified
• Track delivery
• Alert you of responses
```

### TIER 4: AGENCY PLAN ($179.99/month) - ALREADY EXISTS
```
Everything in Complete, PLUS:
✅ White-label option
✅ Client management dashboard
✅ 10 client slots included
✅ Bulk letter generation
✅ Agency branding on letters
✅ Priority support (phone + email)

Add-ons:
• Extra client slots: $9.99/month each
• Custom domain: $29.99/month
```

---

# 3. SMARTCREDIT AFFILIATE INTEGRATION

## Your Affiliate Link:
```
https://www.smartcredit.com/?PID=87529
```

## How It Works:

### Step 1: User Lands on "Get Your Reports" Screen
```
┌─────────────────────────────────────────────────────────┐
│ OPTION 1: PULL REPORTS NOW (Recommended) ✅             │
│                                                         │
│ Partner with SmartCredit to get all 3 bureaus instantly.│
│ This helps us keep the analysis FREE for you.           │
│                                                         │
│ • Cost: $1 (Trial)                                      │
│ • Bureaus: Experian, Equifax, TransUnion                │
│ • Format: Instant PDF Download                          │
│                                                         │
│ [ 🚀 Get Reports via SmartCredit ]                      │
│ (Opens: https://www.smartcredit.com/?PID=87529)         │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ OPTION 2: I ALREADY HAVE REPORTS                        │
│                                                         │
│ ⚠ Note: A $4.95 processing fee applies for direct       │
│ uploads to cover AI verification costs.                 │
│                                                         │
│ [ 📂 Upload My PDF Reports ($4.95) ]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Track Affiliate Click
- Set cookie when user clicks SmartCredit link
- Store `affiliate_source = 'smartcredit'` in database
- When they return and upload, check cookie/DB flag

### Step 3: Gate Logic
```javascript
// Before running AI analysis:
if (user.affiliate_source === 'smartcredit' || user.affiliate_source === 'identityiq') {
  // FREE analysis - affiliate commission covers cost
  runFullAnalysis();
} else if (user.has_paid_processing_fee) {
  // Paid $4.95 - run analysis
  runFullAnalysis();
} else {
  // BLOCK - show payment modal
  showProcessingFeeModal(); // $4.95 one-time via Stripe
}
```

## The Economics:

| Scenario | Your Cost | Your Revenue | Net Result |
|----------|-----------|--------------|------------|
| User uses affiliate link + buys plan | $0.80 | $25 + $49 | **+$73.20** |
| User uses affiliate link + leaves | $0.80 | $25 | **+$24.20** |
| User uploads directly + pays $4.95 | $0.80 | $4.95 | **+$4.15** |
| User uploads directly + leaves | $0.80 | $0 | **-$0.80** ❌ BLOCKED |

**You NEVER let them upload for free without affiliate or $4.95 payment.**

---

# 4. USER FLOW REDESIGN

## Complete Step-by-Step Funnel:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 0: LANDING PAGE                                    │
│ • CTA: "Start Free Analysis" (NOT "$1 Trial")           │
│ • No credit card required                               │
│ • Target CTR: 40-50%                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 1: WHAT'S YOUR BIGGEST CREDIT CONCERN?             │
│ • Collections / Late Payments / Charge-Offs / etc.      │
│ • Purpose: Micro-commitment, personalization            │
│ • Time: 5 seconds                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: WHAT'S YOUR CREDIT SCORE GOAL?                  │
│ • 600-650 / 650-700 / 700+ / Just Want Clean Reports    │
│ • Purpose: Self-motivation                              │
│ • Time: 5 seconds                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: CREATE FREE ACCOUNT                             │
│ • Email + Password (NO PAYMENT)                         │
│ • Purpose: Capture email for follow-up                  │
│ • Time: 15 seconds                                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: COMPLETE YOUR PROFILE (NEW - CRITICAL)          │
│ • Full Legal Name (First, Middle, Last)                 │
│ • Date of Birth                                         │
│ • SSN (encrypted)                                       │
│ • Current Address (USPS validated via Lob)              │
│ • Previous Address (if < 2 years)                       │
│ • Digital Signature (canvas pad)                        │
│ • Purpose: Required for letters & Lob mailing           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: GET YOUR REPORTS (THE AFFILIATE STEP)           │
│ • Option A: SmartCredit link (FREE analysis)            │
│ • Option B: Upload directly ($4.95 fee)                 │
│ • Purpose: Revenue generation                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: UPLOAD CREDIT REPORTS                           │
│ • Drag & drop PDF files                                 │
│ • TransUnion, Experian, Equifax                         │
│ • Can start with 1 bureau                               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 7: AI ANALYSIS (PROCESSING)                        │
│ • Show progress: "Detecting violations..."              │
│ • Check 43 violation methods                            │
│ • Cross-bureau conflict detection                       │
│ • Time: 30-60 seconds                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 8: VALUE REVEAL (THE BIG MOMENT)                   │
│ • "We Found 17 Potential FCRA Violations!"              │
│ • Show ALL violations (Critical, High, Medium)          │
│ • Estimated deletion rates                              │
│ • FCRA sections cited                                   │
│ • "Why This Works" explanations                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 9: UPGRADE PROMPT                                  │
│ • User clicks "Generate Letters"                        │
│ • Modal: Choose DIY ($49.99) or Complete ($79.99)       │
│ • If not ready: "Email me this analysis"                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 10: CHECKOUT (Stripe)                              │
│ • Monthly subscription                                  │
│ • 3-day cancellation right (CROA)                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 11: PAID DASHBOARD                                 │
│ • DIY: Generate & download letters                      │
│ • Complete: Review & authorize → Lob sends              │
└─────────────────────────────────────────────────────────┘
```

## Conversion Metrics (Expected):
```
Landing → Step 1: 45% (450 of 1000)
Step 1 → Step 2: 85% (383)
Step 2 → Step 3: 80% (306)
Step 3 → Step 4: 70% (214)
Step 4 → Step 5: 95% (203)
Step 5 → Step 6: 95% (193)
Step 6 → Step 7: 90% (174)
Step 7 → Step 8: 25% (44 upgrade)
Step 8 → Step 9: 80% (35 complete checkout)
Step 9 → Step 10: 95% (33 paid customers)

CONVERSION: 3.3% (visitor → paid customer)
vs Industry: 1-2% ✅
```

---

# 5. DATA COLLECTION & ONBOARDING

## Required Data Fields (For Letters & Lob):

### Personal Information:
- **Full Legal Name** (First, Middle, Last)
- **Date of Birth** (DOB)
- **Social Security Number** (encrypted, full for bureau matching)
- **Current Address** (Street, City, State, Zip)
- **Previous Address** (if < 2 years at current)

### Digital Signature:
- Canvas pad to draw signature OR upload signature image
- Stored as `signature_data_url` in database
- Appears on all dispute letters

### Address Validation:
- Use Lob API to verify address is USPS deliverable
- Store `address_verified = true/false`
- Prevents returned mail

## "Complete Your Profile" Screen:
```
┌─────────────────────────────────────────────────────────┐
│ ●○○○ Step 3 of 7: Setup Your Dispute Profile            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ To generate valid dispute letters, we need your details.│
│ This info will be printed on your letters.              │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ LEGAL NAME                                              │
│ First Name [_______________]                            │
│ Middle Initial [___]                                    │
│ Last Name [_______________]                             │
│                                                         │
│ DATE OF BIRTH                                           │
│ [MM] / [DD] / [YYYY]                                    │
│                                                         │
│ SOCIAL SECURITY (Required for ID verification)          │
│ [___] - [___] - [____]                                  │
│ 🔒 Encrypted. Never shared.                             │
│                                                         │
│ CURRENT ADDRESS (Return Address for letters)            │
│ Street Address [___________________________]            │
│ Apt/Suite [_______]                                     │
│ City [_______________] State [__] Zip [_____]           │
│ ✅ Address Validated via USPS                           │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ YOUR SIGNATURE                                          │
│ By drawing below, you authorize disputes in your name.  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │     (Draw signature with mouse/finger)              │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ [Clear]                                                 │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [Save & Continue →]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 6. LOB MAIL INTEGRATION

## What is Lob?
Lob.com is an API for sending physical mail programmatically. We use it for the Complete Plan to send certified mail.

## The Workflow:

### Step 1: User Reviews Letter
- Show full letter content
- User confirms accuracy

### Step 2: Authorization Modal (4 Checkboxes)
```
┌─────────────────────────────────────────────────────────┐
│ 🚨 READY TO SEND: CAPITAL ONE DISPUTE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ PREVIEW:                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TO: TransUnion Dispute Dept                         │ │
│ │ FROM: [User's Validated Address]                    │ │
│ │                                                     │ │
│ │ "I am writing to dispute a collection account...    │ │
│ │ Under FCRA Section 611..."                          │ │
│ │                                                     │ │
│ │ Sincerely,                                          │ │
│ │ [User's Digital Signature]                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ⚠ LEGAL AUTHORIZATION                                   │
│                                                         │
│ ☐ I have reviewed this letter and it is accurate        │
│ ☐ I authorize DisputeStrike to mail this letter         │
│ ☐ I understand I am the sender (not DisputeStrike)      │
│ ☐ I understand this cannot be recalled once sent        │
│                                                         │
│ [ CANCEL ]              [ AUTHORIZE & SEND LETTER 🚀 ]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Lob API Call
```javascript
// lobService.ts
const letter = await lob.letters.create({
  to: {
    name: 'TransUnion Consumer Dispute Center',
    address_line1: 'P.O. Box 2000',
    address_city: 'Chester',
    address_state: 'PA',
    address_zip: '19016'
  },
  from: {
    name: user.fullName,
    address_line1: user.address1,
    address_line2: user.address2,
    address_city: user.city,
    address_state: user.state,
    address_zip: user.zip
  },
  file: letterPdfBase64,
  color: false,
  mail_type: 'usps_first_class',
  extra_service: 'certified'
});

// Save to database
await db.update(disputeLetters).set({
  lob_mail_id: letter.id,
  lob_tracking_number: letter.tracking_number,
  lob_status: 'mailed',
  mailing_cost_cents: 599, // $5.99
  authorized_at: new Date()
}).where(eq(disputeLetters.id, letterId));
```

### Step 4: Tracking Dashboard
- Show USPS tracking number
- Status: Mailed → In Transit → Delivered
- Webhook updates from Lob

## Bureau Addresses (Hardcoded):
```javascript
const BUREAU_ADDRESSES = {
  transunion: {
    name: 'TransUnion Consumer Dispute Center',
    address_line1: 'P.O. Box 2000',
    address_city: 'Chester',
    address_state: 'PA',
    address_zip: '19016'
  },
  equifax: {
    name: 'Equifax Information Services LLC',
    address_line1: 'P.O. Box 740256',
    address_city: 'Atlanta',
    address_state: 'GA',
    address_zip: '30374'
  },
  experian: {
    name: 'Experian',
    address_line1: 'P.O. Box 4500',
    address_city: 'Allen',
    address_state: 'TX',
    address_zip: '75013'
  }
};
```

## Lob Costs:
- First Class Letter: ~$0.63
- Certified Mail: ~$5.99
- Return Receipt: ~$3.00 additional

---

# 7. EMAIL SEQUENCES (ALREADY BUILT)

## ✅ You Already Have These Email Templates:

| Template | Purpose | Status |
|----------|---------|--------|
| `welcome.html` | Day 0 - Welcome email | ✅ Built |
| `day1-credit-analysis-ready.html` | Day 1 - Analysis ready | ✅ Built |
| `day2-getting-started.html` | Day 2 - Getting started guide | ✅ Built |
| `day3-feature-highlight.html` | Day 3 - Feature highlight | ✅ Built |
| `day4-objection-handler.html` | Day 4 - Objection handling | ✅ Built |
| `day5-trial-expiring.html` | Day 5 - Trial expiring | ✅ Built |
| `day6-trial-expiring-tomorrow.html` | Day 6 - Trial expiring tomorrow | ✅ Built |
| `day7-trial-ended.html` | Day 7 - Trial ended | ✅ Built |

## Email Sequence Flow:
```
Day 0: Welcome - "Your account is ready!"
Day 1: Analysis Ready - "Your credit analysis is complete"
Day 2: Getting Started - "Here's how to use DisputeStrike"
Day 3: Feature Highlight - "Did you know about this feature?"
Day 4: Objection Handler - "Common questions answered"
Day 5: Trial Expiring - "Your trial expires in 2 days"
Day 6: Urgency - "Your trial expires TOMORROW"
Day 7: Trial Ended - "Your trial has ended - upgrade now"
```

## Social Media Links (Already Updated):
- Facebook: `facebook.com/disputeStrike`
- Instagram: `instagram.com/disputeStrikeAI`
- YouTube: `youtube.com/@disputeStrike`
- TikTok: `tiktok.com/@disputeStrikeAI`

## What Needs Updating:
Since we're removing the $1 trial, these emails need to be adjusted:
- Remove "trial" language
- Change to "free tier" → "upgrade" messaging
- Focus on value delivered (violations found)

---

# 8. LEGAL COMPLIANCE & DISCLAIMERS

## CROA Compliance Checklist:

### ✅ Required Disclaimers:

#### Footer Disclaimer (On Every Page):
```html
<footer class="legal-disclaimer">
  <p>
    DisputeStrike is a software tool that helps you manage your own 
    credit disputes. We are not a credit repair organization. You have 
    the right to dispute inaccurate information on your credit report 
    yourself, for free, by contacting the credit bureaus directly. 
    Results are not guaranteed and depend on the validity of detected 
    violations and credit bureau decisions.
  </p>
  <p>
    <a href="/terms">Terms of Service</a> | 
    <a href="/privacy">Privacy Policy</a> | 
    <a href="/your-rights">Your FCRA Rights</a>
  </p>
</footer>
```

#### Pricing Page Disclaimer:
```html
<div class="pricing-disclaimer">
  <h3>🔒 Important: What You're Paying For</h3>
  <p>
    Your subscription fee pays for <strong>software access</strong>, 
    not credit repair services.
  </p>
  <ul>
    <li>✅ You maintain full control over your disputes</li>
    <li>✅ You review and authorize all letters</li>
    <li>✅ You decide what to dispute and when</li>
    <li>❌ We do not file disputes on your behalf</li>
    <li>❌ We do not guarantee any specific results</li>
  </ul>
</div>
```

#### Signup Page Disclaimer:
```html
<div class="signup-disclaimer">
  <label>
    <input type="checkbox" required>
    I have read and agree to the 
    <a href="/terms">Terms of Service</a>
  </label>
  <p>
    You have a <strong>3-day right to cancel</strong> for a full 
    refund, no questions asked.
  </p>
</div>
```

#### Letter Generation Disclaimer:
```html
<div class="letter-generation-notice">
  <h4>⚠ Before Generating Letters</h4>
  <p>YOU are responsible for:</p>
  <ul>
    <li>✓ Reviewing letter accuracy</li>
    <li>✓ Verifying all information is correct</li>
    <li>✓ Ensuring claims are factual</li>
    <li>✓ Deciding whether to send each letter</li>
  </ul>
  <p>
    <strong>Do not send letters</strong> if you believe the information 
    being disputed is accurate.
  </p>
</div>
```

### Required Pages:
1. **Terms of Service** - ✅ Already exists (`Terms.tsx`)
2. **Privacy Policy** - ✅ Already exists (`Privacy.tsx`)
3. **CROA Disclosure** - ✅ Already exists (`CROADisclosure.tsx`)
4. **Your FCRA Rights** - ❌ Need to create (how to dispute for free)

---

# 9. MARKETING & POSITIONING

## Value Proposition:
```
"43 Specific FCRA Violations. One Flat Price. No Hidden Fees."
```

## Competitive Positioning vs CreditFixrr:
```
┌─────────────────────────────────────────────────────────┐
│                    CREDITFIXRR                          │
│ • Base: $49.99/mo + AI token charges                    │
│ • Effective cost: $70-100/mo                            │
│ • Confusing pricing                                     │
│ • Black box AI                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   DISPUTESTRIKE                         │
│ • DIY: $49.99/mo flat (no hidden fees)                  │
│ • Complete: $79.99/mo (mailing included)                │
│ • Transparent: See all 43 methods                       │
│ • Founder's case study: +45 points in 30 days           │
└─────────────────────────────────────────────────────────┘
```

## Marketing Copy:

### Landing Page Headline:
```
"43 Specific FCRA Violations. One Flat Price. No Hidden Fees."

See exactly what's wrong with your credit reports.
Get professional dispute letters. Fix it yourself.

[Start Free Analysis →]
(No credit card required)
```

### Why DisputeStrike:
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  TRANSPARENT    │ │  AFFORDABLE     │ │   PROVEN        │
│                 │ │                 │ │                 │
│ See all 43      │ │ $49.99/mo flat  │ │ Founder's +45   │
│ violation       │ │ (no AI token    │ │ points in 30    │
│ methods         │ │ charges)        │ │ days            │
│                 │ │                 │ │                 │
│ Not a black     │ │ vs CreditFixrr  │ │ Same methods    │
│ box - see       │ │ $70-100/mo      │ │ you can use     │
│ exactly what    │ │ effective       │ │                 │
│ we check        │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Founder's Case Study:
```
📊 FOUNDER'S CASE STUDY

"I used these exact 43 methods on my own credit reports.
 Result: +45 points in 30 days."

 - Ben Aigbokhan, CEO
   MBA, PhD, 15+ years federal contracting

 Starting score: 627
 Ending score: 672
 Timeline: 30 days
 Method: All 43 violation types
```

---

# 10. DATABASE CHANGES

## New Fields to Add:

### `users` table:
```sql
ALTER TABLE users ADD COLUMN affiliate_source VARCHAR(50) DEFAULT 'direct';
-- Values: 'smartcredit', 'identityiq', 'direct'

ALTER TABLE users ADD COLUMN processing_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN processing_fee_paid_at TIMESTAMP;
```

### `user_profiles` table:
```sql
ALTER TABLE user_profiles ADD COLUMN signature_data_url TEXT;
ALTER TABLE user_profiles ADD COLUMN address_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN address_verified_at TIMESTAMP;
```

### `dispute_letters` table:
```sql
ALTER TABLE dispute_letters ADD COLUMN lob_mail_id VARCHAR(255);
ALTER TABLE dispute_letters ADD COLUMN lob_tracking_number VARCHAR(100);
ALTER TABLE dispute_letters ADD COLUMN lob_status VARCHAR(50);
-- Values: 'draft', 'queued', 'mailed', 'in_transit', 'delivered', 'returned'

ALTER TABLE dispute_letters ADD COLUMN mailing_cost_cents INT;
ALTER TABLE dispute_letters ADD COLUMN authorized_at TIMESTAMP;
ALTER TABLE dispute_letters ADD COLUMN authorized_by_user BOOLEAN DEFAULT FALSE;
```

### `credit_reports` table:
```sql
ALTER TABLE credit_reports ADD COLUMN source VARCHAR(50);
-- Values: 'smartcredit', 'identityiq', 'manual'

ALTER TABLE credit_reports ADD COLUMN ai_token_cost_cents INT;
```

---

# 11. WHAT ALREADY EXISTS VS WHAT NEEDS BUILDING

## ✅ ALREADY EXISTS:

| Feature | File | Status |
|---------|------|--------|
| OnboardingWizard | `OnboardingWizard.tsx` | ✅ Has name, DOB, SSN, address, ID upload |
| User Profiles Table | `schema.ts` | ✅ Has fullName, dateOfBirth, ssnLast4, addresses |
| SmartCredit API | `smartcreditAPI.ts` | ✅ Structure exists (needs real integration) |
| SmartCredit Tokens | `schema.ts` | ✅ Has userId, accessToken, refreshToken |
| Stripe Integration | `stripeWebhook.ts` | ✅ Full checkout flow |
| Subscriptions V2 | `schema.ts` | ✅ Has tier, status, Stripe IDs |
| Agency Dashboard | `AgencyDashboard.tsx` | ✅ Client management |
| Agency Pricing | `AgencyPricing.tsx` | ✅ Pricing tiers |
| Letter Generation | `letterGenerator.ts` | ✅ AI-powered letters |
| Conflict Detection | `conflictDetector.ts` | ✅ Cross-bureau detection |
| Credit Analysis | `CreditAnalysis.tsx` | ✅ Analysis display |
| Terms Page | `Terms.tsx` | ✅ Legal terms |
| Privacy Page | `Privacy.tsx` | ✅ Privacy policy |
| CROA Disclosure | `CROADisclosure.tsx` | ✅ CROA compliance |
| Email Templates | `server/email-templates/` | ✅ 8 templates |
| ZeptoMail Integration | `zeptoMailService.ts` | ✅ Email sending |

## ❌ NEEDS BUILDING:

| Feature | Priority | Effort |
|---------|----------|--------|
| **Signature Capture Component** | HIGH | 2 hours |
| **"Get Your Reports" Screen** | HIGH | 4 hours |
| **$4.95 Processing Fee (Stripe)** | HIGH | 2 hours |
| **Affiliate Tracking (cookie + DB)** | HIGH | 3 hours |
| **Gate Logic (block free uploads)** | HIGH | 2 hours |
| **Lob Service (test mode)** | MEDIUM | 4 hours |
| **Authorization Modal** | MEDIUM | 3 hours |
| **"Your FCRA Rights" Page** | MEDIUM | 2 hours |
| **Update Landing Page Copy** | MEDIUM | 2 hours |
| **Update Email Templates (remove trial)** | MEDIUM | 2 hours |
| **Footer Disclaimer Component** | LOW | 1 hour |
| **Pricing Page Disclaimer** | LOW | 1 hour |

**Total Estimated Effort: 28 hours (4-5 days)**

---

# 12. 7-DAY IMPLEMENTATION TIMELINE

| Day | Tasks | Files |
|-----|-------|-------|
| **Day 1** | Database migrations (affiliate_source, signature, lob fields) | `schema.ts`, migration |
| **Day 2** | Create "Get Your Reports" screen with SmartCredit link | `GetReports.tsx` |
| **Day 2** | Add $4.95 Stripe price, payment gate | `stripeConfig.ts`, API |
| **Day 3** | Add signature capture to OnboardingWizard | `SignaturePad.tsx` |
| **Day 3** | Add affiliate tracking (cookie + DB) | `affiliateTracking.ts` |
| **Day 4** | Create Lob service (test mode) | `lobService.ts` |
| **Day 4** | Create Authorization Modal | `MailingAuthorizationModal.tsx` |
| **Day 5** | Update routing flow | `App.tsx`, routes |
| **Day 5** | Gate AI analysis (check affiliate OR $4.95) | `creditReportParser.ts` |
| **Day 6** | Update landing page copy | `Landing.tsx` |
| **Day 6** | Update email templates (remove trial) | `email-templates/` |
| **Day 7** | Testing full flow | Manual testing |
| **Day 7** | Bug fixes, deploy | Railway |

---

# 13. COST STRUCTURE & UNIT ECONOMICS

## Per-User Costs:

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| OpenAI API (analysis) | $0.80 | GPT-4 for parsing |
| Lob Certified Mail | $5.99 | Per letter |
| ZeptoMail | $0.002 | Per email |
| Stripe Fee | 2.9% + $0.30 | Per transaction |

## Revenue Per User:

| Tier | Monthly Revenue | Monthly Cost | Monthly Profit | Margin |
|------|-----------------|--------------|----------------|--------|
| **Free + Affiliate** | $25 (one-time) | $0.80 | $24.20 | 96.8% |
| **Free + $4.95 Fee** | $4.95 (one-time) | $0.80 | $4.15 | 83.8% |
| **DIY** | $49.99 | $1.60 | $48.39 | 96.8% |
| **Complete** | $79.99 | $19.65* | $60.34 | 75.4% |
| **Agency** | $179.99 | $39.30* | $140.69 | 78.2% |

*Assumes 3 letters mailed per month at $5.99 each

## Break-Even Analysis:

| Scenario | Users Needed | Revenue | Costs | Profit |
|----------|--------------|---------|-------|--------|
| 100 DIY users | 100 | $4,999 | $160 | $4,839 |
| 100 Complete users | 100 | $7,999 | $1,965 | $6,034 |
| 50/50 mix | 100 | $6,499 | $1,063 | $5,436 |

---

# ✅ APPROVAL CHECKLIST

Before I start implementing, please confirm:

1. ☐ **Pricing Model** - Free → DIY ($49.99) → Complete ($79.99) → Agency ($179.99)
2. ☐ **SmartCredit Link** - `https://www.smartcredit.com/?PID=87529`
3. ☐ **$4.95 Processing Fee** - For direct uploads
4. ☐ **Lob Integration** - Test mode first (you'll get API keys later)
5. ☐ **7-Day Timeline** - Launch next week
6. ☐ **Email Templates** - Update to remove "trial" language

---

# 🚫 I WILL NOT:

- Push anything to git until you approve
- Implement anything until you confirm
- Make assumptions about business decisions

---

**DO YOU APPROVE THIS PLAN? SHOULD I START WITH DAY 1 TASKS?**
