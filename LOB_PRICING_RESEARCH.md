# Lob.com Mailing Service Research

## Platform Subscription Plans

| Plan | Monthly Cost | Mailings/Month |
|------|-------------|----------------|
| Developer | Free | Up to 500 |
| Startup | $260/mo | Up to 3,000 |
| Growth | $550/mo | Up to 6,000 |
| Enterprise | Custom | Custom |

## Per-Letter Pricing (Print + Postage Included)

### Standard Letters (First Class)
| Type | Developer | Startup | Growth |
|------|-----------|---------|--------|
| B&W Letter, First Class | $1.029 | $0.859 | $0.829 |
| Color Letter, First Class | $1.189 | $0.899 | $0.859 |
| B&W Letter, Standard Class | $0.806 | $0.636 | $0.606 |
| Color Letter, Standard Class | $0.966 | $0.686 | $0.636 |

### Certified Mail Add-Ons
| Add-On | Startup | Growth |
|--------|---------|--------|
| Certified Mail (1st class only) | $6.70 | $6.70 |
| Electronic Return Receipt | $2.82 | $2.82 |
| Certified Mail WITH Electronic Return Receipt | $9.52 | $9.52 |
| Registered Mail (1st class only) | $23.30 | $23.30 |

### Additional Costs
| Item | Cost |
|------|------|
| Additional Page (B&W) | $0.08-$0.10 |
| Additional Page (Color) | $0.16-$0.20 |
| Return Envelope | $0.04-$0.05 |
| Letter over 6 sheets fee | $2.435 |

## Cost Analysis for DisputeStrike

### Per User, Per Round (3 letters - one to each bureau)

**Option A: Standard First Class (No Tracking)**
- 3 letters × $0.859 = $2.58/round

**Option B: Certified Mail with Electronic Return Receipt (RECOMMENDED)**
- 3 letters × ($0.859 + $9.52) = $31.14/round
- This gives you: Proof of mailing, delivery tracking, electronic receipt

### Monthly Volume Estimates

| Users | Rounds/Month | Letters/Month | Plan Needed |
|-------|--------------|---------------|-------------|
| 50 | 50 | 150 | Developer (Free) |
| 200 | 200 | 600 | Startup ($260/mo) |
| 500 | 500 | 1,500 | Startup ($260/mo) |
| 1,000 | 1,000 | 3,000 | Startup ($260/mo) |
| 2,000 | 2,000 | 6,000 | Growth ($550/mo) |

### Cost Per User (Complete Plan)

**At $99.95/mo subscription:**
- Certified mail cost: ~$31/round
- If user does 1 round/month: $31 cost, $99.95 revenue = **$68.95 gross profit**
- If user does 2 rounds/month: $62 cost, $99.95 revenue = **$37.95 gross profit**

**Break-even:** User can do ~3 rounds/month before mailing costs exceed subscription

## Recommendation

1. **Use Certified Mail with Electronic Return Receipt** - $9.52/letter
   - Provides proof of delivery (important for disputes)
   - Tracking numbers for user dashboard
   - Electronic receipt for records

2. **Start with Startup Plan** ($260/mo)
   - Covers up to 3,000 mailings/month
   - That's 1,000 users doing 1 round/month

3. **Pricing is sustainable** at $99.95/mo Complete tier
   - Even with certified mail, you have healthy margins
   - DIY tier ($49.95) has no mailing costs

## API Integration

Lob provides REST API for:
- Creating letters programmatically
- Uploading PDF templates
- Tracking delivery status via webhooks
- Address verification

Documentation: https://docs.lob.com/

## Alternative Services to Consider

1. **Click2Mail** - Similar service, may have different pricing
2. **PostGrid** - Competitor to Lob
3. **Postalytics** - Another option

Lob is the most commonly used and well-documented option.
