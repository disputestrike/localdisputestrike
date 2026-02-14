# Identity Lock System - Quick Reference Card

## 🎯 Core Concept
**ONE ACCOUNT = ONE PERSON = ONE CREDIT REPORT**

Identity is permanently locked after first onboarding. Future uploads must match.

---

## 🔐 What Gets Locked?

When user completes onboarding (`isComplete = true`):

| Field | Locked? | Updatable? |
|-------|---------|------------|
| Full Name | ✅ YES | ❌ NO |
| Date of Birth | ✅ YES | ❌ NO |
| SSN Last 4 | ✅ YES | ❌ NO |
| Current Address | ❌ NO | ✅ YES |
| Phone | ❌ NO | ✅ YES |
| Email | ❌ NO | ✅ YES |

---

## 🚦 Validation Rules

### Identity Comparison

```
✅ MATCH = Allow
❌ MISMATCH = Reject

Name:  normalize(toLower, trim, collapse spaces)
  "John  Doe" == "JOHN DOE" ✅
  "John Doe" != "Jane Smith" ❌

DOB:   convert to YYYY-MM-DD, exact match
  "01/15/1990" == "1990-01-15" ✅
  "1990-01-15" != "1985-03-20" ❌

SSN:   trim, exact match
  "1234" == "1234" ✅
  "1234" != "5678" ❌
```

---

## 📋 User Flows

### First Time
```
Upload Report → Auto-save → Onboarding Modal (pre-filled) 
→ User clicks Save → Identity LOCKED ✅
```

### Locked - Valid Upload
```
Upload Report → Extract Identity → Validate → MATCH ✅ 
→ Save Data
```

### Locked - Invalid Upload
```
Upload Report → Extract Identity → Validate → MISMATCH ❌ 
→ Reject + Clear Cache + Show Error
```

---

## 💬 Error Messages

### Upload Rejection
```
❌ Identity verification failed. 
The credit report you uploaded belongs to a different person. 
This account is locked to prevent sharing.
Please upload YOUR OWN credit report.
```
*Duration: 15 seconds*

### Onboarding Change Rejection
```
❌ Identity verification failed. 
Information doesn't match the account owner. 
This account is locked to prevent abuse.
Contact support if error.
```
*Duration: 10 seconds*

---

## 🗂️ Database Schema

```sql
user_profiles
├── userId (FK to users)
├── fullName (LOCKED when isComplete=true)
├── dateOfBirth (LOCKED when isComplete=true)
├── ssnLast4 (LOCKED when isComplete=true)
├── isComplete (FALSE → TRUE = permanent lock)
├── completedAt (timestamp when locked)
└── currentAddress, phone, etc. (always updatable)
```

---

## 🔍 Key Functions

### Backend (`server/routers.ts`)

| Endpoint | Purpose | Validation |
|----------|---------|------------|
| `completeIdentityBridge` | Lock identity on first save | If locked: validate match |
| `savePreviewAnalysis` | Save uploaded report | If locked: validate match |

### Database (`server/db.ts`)

| Function | Purpose |
|----------|---------|
| `validateIdentityMatch()` | Compare identity fields |
| `getCreditReportsByUserId()` | Get reports (filtered by userId) |
| `getNegativeAccountsByUserId()` | Get accounts (filtered by userId) |
| `getUserProfile()` | Get profile (filtered by userId) |

---

## 🧪 Testing Checklist

| Scenario | Expected Result |
|----------|----------------|
| New user uploads + onboards | ✅ Identity locks |
| Locked user uploads own report | ✅ Saves successfully |
| Locked user uploads different person | ❌ Rejected with error |
| Locked user changes name in onboarding | ❌ Rejected with error |
| Locked user updates address only | ✅ Saves successfully |

---

## 🛠️ Admin Override (Emergency Only)

To reset identity lock:
```sql
UPDATE user_profiles 
SET isComplete = FALSE, completedAt = NULL 
WHERE userId = ?;
```

**⚠️ Use with extreme caution! Requires:**
- Verified legal name change documents
- OR typo correction with user verification
- OR fraud investigation clearance

---

## 📊 Logging

All identity operations logged to `activity_log`:

```sql
SELECT * FROM activity_log 
WHERE activityType = 'identity_bridge_completed'
  AND userId = ?
ORDER BY createdAt DESC;
```

---

## 🔒 Security Benefits

✅ Prevents account sharing  
✅ Prevents identity fraud  
✅ Ensures data isolation  
✅ Audit trail for compliance  
✅ One subscription = one person  

---

## 📁 Documentation Files

- **Full Implementation**: `IDENTITY_LOCK_IMPLEMENTATION.md`
- **Quick Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Visual Diagrams**: `IDENTITY_LOCK_DIAGRAMS.md`
- **This Card**: `QUICK_REFERENCE.md`

---

## 🆘 Support FAQs

**Q: User reports "Can't upload my report"**  
A: Check if report has correct name/DOB/SSN matching their profile. Look for spelling differences.

**Q: User changed name legally**  
A: Verify legal docs, then admin SQL update + mark in activity log.

**Q: User sees "Identity mismatch" error**  
A: They're trying to upload someone else's report. Direct them to upload their OWN report.

**Q: How to test in development?**  
A: Create test user, complete onboarding with "Test User", try uploading report with "Different Person" - should fail.

---

## ✅ Deployment Checklist

- [ ] Test in staging with all scenarios
- [ ] Verify error messages display correctly
- [ ] Check activity logs are recording
- [ ] Test admin override procedure
- [ ] Monitor production for identity validation errors
- [ ] Train support team on FAQs

---

**Version**: 1.0  
**Last Updated**: 2026-02-14  
**Status**: ✅ Implemented & Ready for Testing
