# Mailing Service Comparison for DisputeStrike

## Service Comparison

### 1. Lob.com

**Platform Fees:**
| Plan | Monthly | Mailings/Month |
|------|---------|----------------|
| Developer | Free | Up to 500 |
| Startup | $260/mo | Up to 3,000 |
| Growth | $550/mo | Up to 6,000 |

**Per-Letter Costs:**
| Item | Startup Price |
|------|---------------|
| B&W Letter, First Class | $0.859 |
| Color Letter, First Class | $0.899 |
| Certified Mail | +$6.70 |
| Electronic Return Receipt | +$2.82 |
| **Certified + Return Receipt** | **+$9.52** |

**Total per Certified Letter:** ~$10.38

**Pros:**
- Most popular/well-documented API
- Excellent developer docs
- Webhooks for tracking
- Address verification included

**Cons:**
- Platform fee required at scale
- Slightly higher per-piece costs

---

### 2. Click2Mail

**Platform Fees:** NONE (pay per piece only)

**Per-Letter Costs:**
| Item | Price |
|------|-------|
| Certified Letter (base) | Starting $6.66 |
| 1 letter: Print + Postage | $8.24 |
| 500 letters: Print + Postage | $7.81/each |
| 5,000 letters: Print + Postage | $7.27/each |

**With Electronic Return Receipt:** Add ~$2.82

**Total per Certified Letter:** ~$8.24 - $11.06

**Pros:**
- NO monthly subscription fees
- No minimum volume
- Good for low volume
- API available

**Cons:**
- Less modern API/docs
- Slightly more complex integration
- Less real-time tracking

---

### 3. PostGrid

**Platform Fees:**
| Plan | Monthly | Mailings/Month |
|------|---------|----------------|
| Starter | Free | Up to 500 |
| Enterprise | Custom | Unlimited |

**Per-Letter Costs:**
| Item | Starter Price |
|------|---------------|
| B&W Letter, First Class | $1.019 |
| Color Letter, First Class | $1.179 |
| Certified Mail | +$6.69 |
| Certified + Electronic Return Receipt | +$9.51 |

**Total per Certified Letter:** ~$10.53

**Pros:**
- Free tier up to 500/month
- HIPAA compliant option
- Good integrations (Salesforce, HubSpot, Zapier)
- Modern API

**Cons:**
- Enterprise pricing not transparent
- Slightly higher base letter cost

---

## Cost Comparison (Per Round = 3 Certified Letters)

| Service | Per Letter | Per Round (3 letters) |
|---------|------------|----------------------|
| **Click2Mail** | ~$8.24 | **$24.72** |
| **Lob.com** | ~$10.38 | $31.14 |
| **PostGrid** | ~$10.53 | $31.59 |

---

## Recommendation

### For DisputeStrike: **Lob.com** (Primary) or **Click2Mail** (Budget Option)

**Why Lob:**
1. Best API documentation
2. Webhooks for real-time tracking updates
3. Most commonly used in SaaS products
4. Address verification built-in
5. Reliable delivery tracking

**Why Click2Mail (Alternative):**
1. No monthly platform fees
2. Lower per-piece cost
3. Good if you want to minimize fixed costs
4. Still has API integration

---

## Implementation Recommendation

**Start with Lob.com because:**
1. Easier to integrate
2. Better tracking/webhooks
3. Can switch to Click2Mail later if costs become an issue

**Cost at Scale:**

| Users | Rounds/Mo | Lob Cost | Click2Mail Cost |
|-------|-----------|----------|-----------------|
| 100 | 100 | $3,114 + $0 platform | $2,472 |
| 500 | 500 | $15,570 + $260 platform | $12,360 |
| 1,000 | 1,000 | $31,140 + $260 platform | $24,720 |

**Savings with Click2Mail at 1,000 users:** ~$6,680/month

---

## How Payment Works

**Option A: Absorb into subscription (Recommended)**
- User pays $99.95/mo flat
- You pay mailing costs (~$31/round with Lob)
- Simpler UX, better conversion

**Option B: Separate mailing fee**
- User pays $99.95/mo + $10-15/round mailing fee
- More transparent but adds friction
- Could reduce conversions

**Recommendation:** Absorb costs. The 30-day round lock limits how many rounds users can do anyway.
