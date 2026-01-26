# DisputeStrike: Complete Flow & Dashboard Specification
**Version: 3.0 (Corrected & Integrated)**  
**Status: Production Ready**

---

## TABLE OF CONTENTS
1. User Journey Overview
2. Page-by-Page Specification
3. Dashboard (Post-Payment)
4. Sidebar Navigation & Content
5. Identity Bridge Modal
6. Letter Generation & Sending
7. Tier Differentiation (Essential vs Complete)

---

## 1. USER JOURNEY OVERVIEW

### **Step 1: Get Your Credit Reports** (Page: `/get-reports`)

User chooses one of 4 options:

```
┌─────────────────────────────────────────────────────────┐
│ OPTION 1: SmartCredit (RECOMMENDED)                   │
│ ⭐ All 3 bureaus in one place                         │
│ ⭐ Daily monitoring + Score tracking                  │
│ 💰 Cost: $29.99/month (billed separately)             │
│ [Get SmartCredit →] (opens in new tab)                │
├─────────────────────────────────────────────────────────┤
│ OPTION 2: Credit Hero (NEW AFFILIATE)                 │
│ ⭐ 1 combined file with all 3 bureaus                 │
│ ⭐ Fast & easy upload                                 │
│ 💰 Cost: One-time fee                                 │
│ [Get Credit Hero Reports →] (opens in new tab)        │
├─────────────────────────────────────────────────────────┤
│ OPTION 3: AnnualCreditReport.com (FREE)               │
│ ✅ Government-mandated free reports                   │
│ ⚠️  Once per year per bureau                          │
│ [Get Free Reports →] (opens in new tab)               │
├─────────────────────────────────────────────────────────┤
│ OPTION 4: I Already Have My Reports                   │
│ 📄 Upload PDF files you already have                  │
│ [Browse Files →]                                      │
└─────────────────────────────────────────────────────────┘
```

**Progress Bar:** Step 5 of 6 (83% Complete)

---

### **Step 2: Upload Your Reports** (Page: `/upload-reports`)

User uploads reports with flexibility:

```
UPLOAD YOUR REPORTS FOR FREE PREVIEW

Choose your upload method:

┌─────────────────────────────────────────────────────────┐
│ OPTION A: Upload 1 Combined File                      │
│ (All 3 bureaus in 1 PDF)                              │
│                                                        │
│ [Drop PDF or HTML here]                               │
│                                                        │
│ Perfect for: SmartCredit, Credit Hero, or any        │
│ combined report you already have                      │
└─────────────────────────────────────────────────────────┘

              OR

┌─────────────────────────────────────────────────────────┐
│ OPTION B: Upload 3 Separate Files                     │
│ (One per bureau)                                       │
│                                                        │
│ TransUnion:  [Drop PDF or HTML]                       │
│ Equifax:     [Drop PDF or HTML]                       │
│ Experian:    [Drop PDF or HTML]                       │
│                                                        │
│ Perfect for: AnnualCreditReport.com or individual    │
│ bureau reports                                        │
└─────────────────────────────────────────────────────────┘

⚠️  Upload at least one report to continue.
   More reports = more violations found.

[Start FREE AI Analysis →]
```

**Why this works:**
- ✅ No forced 3-file upload
- ✅ Handles combined files from affiliates
- ✅ Handles separate bureau reports
- ✅ AI processes both formats seamlessly

---

### **Step 3: Free Analysis Results** (Page: `/preview-results`)

**Display exactly as-is — NO CHANGES:**

```
Your Free Credit Report Preview is Ready!

┌─────────────────────────────────────────────────────────┐
│ Total Potential Violations Found: 47                   │
│ Could be improved: See icons below                     │
│                                                        │
│ Severity Breakdown:          Violation Categories:    │
│ 🔴 Critical (18) 78%        ✅ Late Payments (18)    │
│ 🟠 High (23) 180%           ✅ Collections (11)      │
│ 🟡 Medium (6) 27%           ✅ Charge-offs (6)       │
│                             ✅ Hard Inquiries (12)    │
│ Potential Score Impact:                               │
│ 📈 +131 to +249 points                                │
│ Conservative: +131 (56% success rate)                │
│ Moderate: +190 (73% success rate)                    │
│ Optimistic: +249 (84% success rate)                  │
└─────────────────────────────────────────────────────────┘

Your Dispute Timeline:
[Week 1-2: Send Dispute Letters] 
→ [Week 3-8: Bureau Investigation (30 days)]
→ [Week 9+: Items Updated/Deleted or Verified]

Unlock Full Report Details & Dispute Letters:
□ See specific account names & amounts
□ See exact violation details
□ Generate professional dispute letters
□ Track progress across all 3 bureaus

[Upgrade to Essential ($79.99/mo)] 
[Upgrade to Complete ($129.99/mo) ← MOST POPULAR]

Accounts Found (Partial Preview):
AUTOMAX **** | Collections | $9,270
CAPITAL ONE AUTO **** | Collections | $2,270
(+23 more accounts - upgrade to see all)
```

---

### **Step 4: Payment** (Page: `/payment`)

**Current Flow (WRONG):** Clicking "Upgrade" takes user to `/pricing` page (extra step)

**Corrected Flow:** Clicking "Upgrade to Essential" or "Upgrade to Complete" goes **directly** to Stripe checkout

```
User clicks "Upgrade to Essential ($79.99/mo)"
                    ↓
        Stripe Checkout (/payment)
        (No pricing page in between)
                    ↓
        User completes payment
                    ↓
        Stripe webhook fires: payment_intent.succeeded
                    ↓
        Redirect to /dashboard
```

**Why:** User already saw value in free preview. No need for pricing comparison.

---

### **Step 5: Dashboard Loads** (Page: `/dashboard`)

User is redirected immediately to dashboard showing their analysis (not re-asking for upload).

**See Section 3: Dashboard Specification below.**

---

### **Step 6: User Clicks "Generate My Round 1 Dispute Letters"**

**Identity Bridge Modal Pops Up (BLOCKING)**

**See Section 5: Identity Bridge Modal below.**

---

### **Step 7: Letters Generate & Send**

**For Complete Tier ($129.99/mo):**
- System auto-sends to Lob API
- Lob prints, addresses, mails via USPS Certified Mail
- Tracking saved to database
- User sees tracking numbers

**For Essential Tier ($79.99/mo):**
- User downloads PDF
- User prints at home
- User mails via USPS Certified Mail themselves
- User enters tracking number manually

---

## 2. PAGE-BY-PAGE SPECIFICATION

### **Dashboard** ← **CORRECTED**

**URL:** `/dashboard`

**Current Problem:** Shows "Upload Reports" screen (friction after payment)

**Corrected Display:**

```
┌─────────────────────────────────────────────────────────┐
│  ⚔️  COMMAND CENTER                                   │
│  Your financial war room — scores, potential impact,  │
│  and next steps                                        │
└─────────────────────────────────────────────────────────┘

SCOREBOARD ROW:

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ SCORES           │  │ POTENTIAL DELTA  │  │ AI STRATEGIST    │
│ (TU / EQ / EX)   │  │                  │  │                  │
│                  │  │ +155 points      │  │ I've identified  │
│ ---/---/---      │  │ 587 → 742        │  │ 47 violations.   │
│                  │  │                  │  │                  │
│ Upload reports   │  │ Current → AI-pred│  │ Round 1 focuses  │
│ or connect       │  │ range            │  │ on cross-bureau  │
│ SmartCredit      │  │                  │  │ conflicts to     │
│                  │  │                  │  │ force deletions. │
└──────────────────┘  └──────────────────┘  └──────────────────┘

YOUR CREDIT MONITORING PROGRESS:

[Step 1: Analyze ✓] → [Step 2: Generate] → [Step 3: Send] → [Step 4: Track]
(Progress bar at 25% complete)

KEY METRICS:

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ 47 Total           │  │ 32-41 Estimated    │  │ 0 Letters          │  │ 0 Items            │
│ Violations Found   │  │ Deletions (68%)    │  │ Sent               │  │ Deleted            │
│                    │  │                    │  │                    │  │                    │
│ 18 Critical        │  │ Based on FCRA      │  │ Ready to dispute   │  │ Check back after   │
│ 23 High            │  │ analysis           │  │                    │  │ Round 1 completes  │
│ 6 Medium           │  │                    │  │                    │  │                    │
└────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘

NEXT STEPS:

1. Review violations in "Dispute Manager" tab
2. Generate Round 1 dispute letters
3. Send to bureaus (we mail for you if Complete tier)
4. Track responses over 30-day investigation window

┌─────────────────────────────────────────────────────────┐
│  📄 GENERATE MY ROUND 1 DISPUTE LETTERS                │
│  (Click to start - this is your primary action)        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. SIDEBAR NAVIGATION & CONTENT

### **MISSION CONTROL**

#### **1. Dashboard** (Home)
- **Displays:** Command Center scoreboard, metrics, next steps
- **CTA:** "Generate My Round 1 Dispute Letters"
- **Data Source:** `credit_analyses` table (preview data)

#### **2. My Live Report**
- **Displays:** Interactive parsed credit report
- **Accounts:** Highlighted by severity (Red=Critical, Orange=High, Yellow=Medium)
- **Interaction:** Click account → Shows violation reason + FCRA citation
- **Button:** "Refresh Data" (re-parse if new reports uploaded)
- **Education:** Tooltip: "This is your actual credit report. Red items are FCRA violations."
- **Data Source:** Parsed PDF data from `credit_reports` table

#### **3. Dispute Manager**
- **Displays:** Checkbox list of all 47 accounts
- **User Can:** Select/deselect which accounts to dispute
- **Shows:** Account name, type, date, amount, severity badge
- **Summary:** "[X] of 47 accounts selected"
- **Buttons:** 
  - "Generate Letters for Selected Accounts"
  - "Generate Letters for All 47 Accounts"
- **Data Source:** `violations` table from `credit_analyses`

#### **4. Letters**
- **Displays:** List of generated letters (empty on first visit)
- **Per Letter:**
  - Bureau name (TransUnion, Equifax, Experian)
  - Round (1, 2, 3)
  - Status (Draft, Sent, Delivered, Response Received)
  - Date generated
  - Action buttons:
    - [View Letter] (preview PDF)
    - [Download PDF] (all tiers)
    - [Send via Certified Mail] (Complete tier only)
- **Complete Tier Only:** Shows Lob tracking + USPS status
- **Essential Tier:** Shows "Download PDF" + manual mailing instructions
- **Data Source:** `dispute_letters` table + Lob API

---

### **TRACKING & RESULTS**

#### **5. Mailing Tracker** (Complete tier only)

- **Displays:** "Mailing True Love" integration summary
- **Monthly Allowance:**
  - [5] included per month
  - [X] used this month
  - [Y] remaining
- **Live Feed Widget:** Printing → Certified → At Post Office → Delivered
- **Per Letter:**
  - USPS tracking number
  - Estimated delivery date per bureau
  - Current status
- **Additional Mailings:** $6.99 each (if over 5/month)
- **Reset Date:** When monthly allowance renews
- **Data Source:** `dispute_letters` table + Lob API

#### **6. Score Tracker**

- **Current Scores:**
  - TU: ___ (or dashes if no SmartCredit)
  - EQ: ___
  - EX: ___
- **Potential Score:** ___ (AI-predicted after deletions)
- **Gap Visualization:** Line chart showing current → target (gap closes as items delete)
- **Before/After:** Score on [date of upload] vs. Now
- **Impact Breakdown:** "If 32-41 items delete, your score could improve +45-150 points"
- **SmartCredit Note:** "Connect SmartCredit to auto-pull updated scores monthly"
- **Data Source:** SmartCredit API (if connected) + `credit_analyses` deletion estimates

---

### **ADVANCED TACTICS**

#### **7. Inquiry Removal**
- **Displays:** Educational section on hard inquiries vs. soft inquiries
- **List:** User's recent inquiries (if data available)
- **Identifies:** Which inquiries can be disputed
- **CTA:** "Generate Inquiry Removal Letter"
- **Data Source:** Parsed inquiry data from credit report

#### **8. Debt Validation**
- **Displays:** Educational section on debt validation rights (FDCPA)
- **Conditional:** Only shows if user has collections
- **Option:** Generate validation letters
- **CTA:** "Generate Debt Validation Letter"
- **Data Source:** Collections identified in `violations` table

#### **9. CFPB Complaints** (Round 3 badge)
- **Visibility:** Only enabled AFTER Round 2 complete AND items still remain
- **Displays:** Educational section on "When to file a CFPB complaint"
- **Form:** Generate complaint with pre-filled info
- **CTA:** "Generate CFPB Complaint"
- **Data Source:** Round 2 results + remaining violations

---

### **CREDIT BUILDING**

#### **10. Score Simulator**
- **Displays:** Input tool: "What if X items were deleted?"
- **Shows:** Current score → Simulated score with deletions
- **Purpose:** Help user understand impact of disputes
- **Links:** Secured card recommendations, credit building tips

#### **11. Marketplace** (Stickiness Feature)
- **Displays:** 
  - SmartCredit affiliate link + benefit summary
  - Secured card recommendations (Capital One, Discover, etc.)
  - Rent reporting services (build credit by paying rent)
  - Credit monitoring alternatives
- **Purpose:** Keep users engaged long-term
- **Revenue:** Affiliate margins from SmartCredit ($14.39/mo per user)

---

### **MORE**

#### **12. Credit Education**
- **Displays:** Feed of educational posts
  - FCRA rights
  - Debt collector laws
  - Credit building tips
- **Format:** 30-second reads with links to full articles
- **Purpose:** Trust-building + authority

#### **13. AI Assistant**
- **Displays:** Chat interface
- **Capabilities:** Users ask questions about disputes
- **Powered by:** Claude + Source Bible knowledge
- **Features:** Explain violations, answer FCRA questions, help with disputes

---

## 4. TOP-RIGHT HEADER (All Pages)

**Missing from current screenshots — ADD:**

```
┌──────────────────────────────────────────────────────────┐
│  DisputeStrike Logo  |  Dashboard  |  ...  | [⚙️ Settings] │
│                                                |  [👤 Profile] │
│                                                |  [🚪 Sign Out]│
└──────────────────────────────────────────────────────────┘
```

---

## 5. IDENTITY BRIDGE MODAL

**Trigger:** When user clicks "Generate My Round 1 Dispute Letters" button

**Behavior:** Modal pops up, blocks all other interaction

**Modal Content:**

```
┌──────────────────────────────────────────────────────────┐
│  Complete Your Profile                                  │
│                                                          │
│  We need this information to generate your letters      │
│  and verify with the credit bureaus.                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Full Legal Name *                                       │
│  [John Doe]  ← Pre-filled from credit report           │
│  (edit if needed)                                        │
│                                                          │
│  Date of Birth *                                         │
│  [MM/DD/YYYY]  ← Pre-filled from credit report         │
│  (edit if needed)                                        │
│                                                          │
│  Current Mailing Address *                              │
│  [123 Main St, City, ST 12345]                         │
│  ← Pre-filled from credit report, user confirms         │
│  (edit if needed)                                        │
│                                                          │
│  Previous Address (if moved in last 2 years)            │
│  [456 Oak Ave, City, ST 67890]  ← Pre-filled           │
│  (leave blank if not applicable)                        │
│                                                          │
│  Phone Number *                                          │
│  [555-1234]  ← Pre-filled if available                 │
│  (edit if needed)                                        │
│                                                          │
│  SSN (Last 4 Digits Only) *                             │
│  [____]  ← User enters (not on report)                 │
│  🔒 Encrypted & stored securely                        │
│                                                          │
│  Digital Signature *                                     │
│  [Signature Capture Box]                                │
│  ☑️  I certify this is my legal signature               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  LEGAL CONSENT (Required to continue)                    │
│                                                          │
│  ☑️  I authorize DisputeStrike to send disputes        │
│      on my behalf                                        │
│                                                          │
│  ☑️  I understand results are not guaranteed           │
│                                                          │
│  ☑️  I agree to Terms of Service                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [Cancel]                   [Generate My Letters →]      │
└──────────────────────────────────────────────────────────┘
```

### **Pre-fill Logic:**

**Extract from Credit Report (Parsed Data):**
- ✅ Full Name → Pre-fill "Full Legal Name"
- ✅ Date of Birth → Pre-fill "Date of Birth"
- ✅ Current Address → Pre-fill "Current Mailing Address"
- ✅ Previous Address (if available) → Pre-fill "Previous Address"
- ✅ Phone Number (if available) → Pre-fill "Phone Number"

**User Must Enter:**
- ❌ SSN (Last 4 digits only) — Not on credit report
- ❌ Digital Signature — Captured via signature pad
- ❌ Legal consent checkboxes — User confirms

**Validation:**
- All required fields must be complete
- All 3 consent checkboxes must be checked
- "Generate My Letters" button disabled until all requirements met

---

## 6. LETTER GENERATION & SENDING

### **After Identity Bridge Complete:**

**Letters Generate with Pre-filled Data:**
- ✅ User name matches confirmed identity data
- ✅ User address matches confirmed identity data
- ✅ Digital signature embedded in PDF
- ✅ FCRA citations automatically included (15 U.S.C. § 1681i, etc.)
- ✅ Account details (name, amount, date) from credit report
- ✅ 3 letters generated (one per bureau: TransUnion, Equifax, Experian)

### **For Complete Tier ($129.99/mo):**

```
Letters Generated
        ↓
User sees preview + confirmation button
        ↓
[Confirm & Send My 3 Letters] ← One click
        ↓
System triggers Lob API
        ↓
Lob prints letters professionally
        ↓
Lob addresses envelopes
        ↓
Lob sends via USPS Certified Mail
        ↓
System receives tracking numbers
        ↓
Dashboard shows:
  ✅ Letter sent to Lob
  ✅ Tracking: 9205 5000 0000 0000 0000
  ✅ Expected delivery: [date]
  ✅ Reminder set for: [30 days later]
        ↓
User does NOTHING else
```

**Cost to User:** Included in $129.99/mo (5 mailings/month)

**Additional Mailings:** $6.99 each (if over 5/month limit)

### **For Essential Tier ($79.99/mo):**

```
Letters Generated
        ↓
User sees preview + download button
        ↓
[Download PDF] ← User downloads
        ↓
User prints at home (~$0.50/page)
        ↓
User mails via USPS Certified Mail (~$8.55/letter)
        ↓
User tracks via USPS tracking number manually
        ↓
User sets own 30-day reminder
```

**Cost to User:** ~$8.55 per letter + printing costs (user responsibility)

---

## 7. TIER DIFFERENTIATION

### **Essential Tier ($79.99/month)**

| Feature | Essential | Complete |
|---------|-----------|----------|
| **Letter Generation** | ✅ Unlimited | ✅ Unlimited |
| **Download PDFs** | ✅ Yes | ✅ Yes |
| **Print & Mail Yourself** | ✅ DIY (~$8.55/letter) | ❌ Not needed |
| **Automated Mailing (Lob)** | ❌ No | ✅ Yes (5/mo included) |
| **USPS Certified Tracking** | ❌ Manual | ✅ Automatic |
| **Extra Mailings** | N/A | ✅ $6.99 each |
| **SmartCredit** | ⚠️ Optional | ✅ Required ($29.99/mo) |
| **Auto-Pull Reports** | ❌ No | ✅ Monthly |
| **30-Day Reminders** | ❌ Manual | ✅ Automatic |
| **Mailing Tracker** | ❌ No | ✅ Yes |
| **Priority Support** | ❌ Standard | ✅ Priority |

### **Complete Tier ($129.99/month)**

- **Includes:** Everything in Essential PLUS:
  - Automated USPS Certified Mail (Lob integration)
  - SmartCredit required + included
  - Real-time USPS tracking
  - Automatic 30-day reminders
  - Mailing Tracker widget
  - Priority email support
  - 5 free mailings per month ($34.35 value)

### **SmartCredit Requirement (Complete Tier Only):**

**Why Required:**
- Pulls updated reports automatically every 30 days
- Enables Round 2/3 automation
- Provides score tracking
- Required for "mailing automation"

**Billing:**
- Charged separately by ConsumerDirect
- Cost: $29.99/month to user
- Your margin: $14.39/month (after licensing fee)

---

## SUMMARY OF CORRECTIONS

✅ **Image 1 (Get Reports):** Added Credit Hero as 4th option (affiliate partner)

✅ **Image 2 (Upload):** Changed to flexible upload (1 combined file OR 3 separate files)

✅ **Image 3 (Analysis):** No changes — perfect as-is

✅ **Payment Flow:** Direct to Stripe (skip pricing page)

✅ **Dashboard:** Shows violations + metrics, NOT upload screen

✅ **Identity Bridge:** Triggers when user clicks "Generate Letters" (not immediately after payment)

✅ **Pre-fill Logic:** Extracts name, DOB, address, phone from credit report

✅ **Top-Right Header:** Added user profile, settings, sign out (was missing)

✅ **Mailing Integration:** "Mailing True Love" (Lob API) fully integrated for Complete tier

✅ **Tier Differentiation:** Clear feature comparison between $79.99 (Essential) and $129.99 (Complete)

✅ **Sidebar Navigation:** All 13 pages mapped with data sources and content

---

**END OF SPECIFICATION**

This document is the source of truth for all dashboard development. All pages, modals, and integrations should follow these specifications exactly.
