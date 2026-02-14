# Identity Lock System - Visual Flow Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ONE ACCOUNT = ONE PERSON                          │
│                                                                       │
│  User Account ──► Identity Lock (name, DOB, SSN) ──► Credit Reports │
│                         ▲                                             │
│                         │                                             │
│                   isComplete=true                                     │
│                 (PERMANENT LOCK)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## First-Time User Journey

```
┌──────────────┐
│ New User     │
│ Creates      │
│ Account      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Step 1: Upload Credit Report         │
│ - User uploads PDF                   │
│ - AI extracts consumer info:         │
│   * Full Name: "John Doe"            │
│   * DOB: "01/15/1990"                │
│   * SSN Last 4: "1234"               │
│   * Address, City, State, ZIP        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Step 2: Auto-Save to Database        │
│ - savePreviewAnalysis mutation       │
│ - Checks: isComplete = false ✓       │
│ - Saves report data                  │
│ - No identity validation needed      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Step 3: Onboarding Modal Opens       │
│ ┌────────────────────────────────┐   │
│ │ Complete Onboarding           │   │
│ │                               │   │
│ │ [PRE-FILLED FROM REPORT]      │   │
│ │ Name:    John Doe             │   │
│ │ DOB:     01/15/1990           │   │
│ │ SSN:     1234                 │   │
│ │ Address: 123 Main St          │   │
│ │ City:    New York             │   │
│ │                               │   │
│ │ ⚠️ This will lock your        │   │
│ │    identity permanently       │   │
│ │                               │   │
│ │ [ Save & Complete ]           │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Step 4: Identity LOCKED ✅           │
│ - completeIdentityBridge mutation    │
│ - Saves to user_profiles:            │
│   * fullName = "John Doe"            │
│   * dateOfBirth = "1990-01-15"       │
│   * ssnLast4 = "1234"                │
│   * isComplete = TRUE                │
│   * completedAt = NOW                │
│ - Activity log: "Identity locked"    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ✅ SUCCESS                            │
│ - User sees dashboard                │
│ - Can generate dispute letters       │
│ - Identity permanently locked        │
│ - Future uploads must match          │
└──────────────────────────────────────┘
```

## Locked User - Valid Upload (Same Person)

```
┌──────────────────────────────────────┐
│ Locked User (John Doe)               │
│ isComplete = true                    │
│ Identity: John Doe, 01/15/1990, 1234 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Uploads New Credit Report            │
│ - Updated report from new address    │
│ - AI extracts consumer info:         │
│   * Name: "John Doe"        ✓        │
│   * DOB: "01/15/1990"       ✓        │
│   * SSN: "1234"             ✓        │
│   * New Address             ✓        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Identity Validation (Backend)        │
│ ┌────────────────────────────────┐   │
│ │ Compare:                       │   │
│ │                                │   │
│ │ Existing  vs  Uploaded         │   │
│ │ ────────      ────────         │   │
│ │ john doe  ==  john doe     ✓   │   │
│ │ 1990-01-15 == 1990-01-15   ✓   │   │
│ │ 1234      ==  1234         ✓   │   │
│ │                                │   │
│ │ IDENTITY MATCHES ✅            │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ✅ UPLOAD ACCEPTED                    │
│ - Report saved to database           │
│ - Dashboard shows updated data       │
│ - User can see new accounts          │
└──────────────────────────────────────┘
```

## Locked User - Invalid Upload (Different Person)

```
┌──────────────────────────────────────┐
│ Locked User (John Doe)               │
│ isComplete = true                    │
│ Identity: John Doe, 01/15/1990, 1234 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Tries to Upload Jane's Report        │
│ - Uploads wrong person's PDF         │
│ - AI extracts consumer info:         │
│   * Name: "Jane Smith"      ❌       │
│   * DOB: "03/20/1985"       ❌       │
│   * SSN: "5678"             ❌       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Identity Validation (Backend)        │
│ ┌────────────────────────────────┐   │
│ │ Compare:                       │   │
│ │                                │   │
│ │ Existing   vs  Uploaded        │   │
│ │ ────────       ────────        │   │
│ │ john doe   ≠   jane smith  ❌  │   │
│ │ 1990-01-15 ≠   1985-03-20  ❌  │   │
│ │ 1234       ≠   5678        ❌  │   │
│ │                                │   │
│ │ IDENTITY MISMATCH ❌           │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ❌ UPLOAD REJECTED                    │
│ - Clear cached data                  │
│ - Show error (15 seconds):           │
│   "Identity verification failed.     │
│    This report belongs to a          │
│    different person."                │
│ - NO data saved to database          │
│ - User must upload their OWN report  │
└──────────────────────────────────────┘
```

## Locked User - Try to Change Identity via Onboarding

```
┌──────────────────────────────────────┐
│ Locked User (John Doe)               │
│ Opens Onboarding Modal Again         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Onboarding Modal (Pre-filled)        │
│ ┌────────────────────────────────┐   │
│ │ Complete Onboarding           │   │
│ │                               │   │
│ │ Name:    John Doe [LOCKED]    │   │
│ │ DOB:     01/15/1990 [LOCKED]  │   │
│ │ SSN:     1234 [LOCKED]        │   │
│ │ Address: 123 Main St          │   │
│ │                               │   │
│ │ User tries to change:         │   │
│ │ Name → "Jane Smith"           │   │
│ │ DOB → "03/20/1985"            │   │
│ │                               │   │
│ │ [ Save & Complete ]           │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Identity Validation (Backend)        │
│ ┌────────────────────────────────┐   │
│ │ Compare:                       │   │
│ │                                │   │
│ │ Existing   vs  Submitted       │   │
│ │ ────────       ────────        │   │
│ │ john doe   ≠   jane smith  ❌  │   │
│ │ 1990-01-15 ≠   1985-03-20  ❌  │   │
│ │                                │   │
│ │ IDENTITY CHANGE DETECTED ❌    │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ❌ UPDATE REJECTED                    │
│ - Show error (10 seconds):           │
│   "Identity verification failed.     │
│    Information doesn't match         │
│    account owner."                   │
│ - Modal stays OPEN                   │
│ - User can correct the data          │
│ - NO database changes                │
└──────────────────────────────────────┘
```

## Locked User - Update Address Only (Valid)

```
┌──────────────────────────────────────┐
│ Locked User (John Doe)               │
│ Opens Onboarding Modal               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Onboarding Modal                     │
│ ┌────────────────────────────────┐   │
│ │ Complete Onboarding           │   │
│ │                               │   │
│ │ Name:    John Doe [SAME] ✓    │   │
│ │ DOB:     01/15/1990 [SAME] ✓  │   │
│ │ SSN:     1234 [SAME] ✓        │   │
│ │                               │   │
│ │ Address: 456 New St [CHANGED] │   │
│ │ City:    Boston [CHANGED]     │   │
│ │                               │   │
│ │ [ Save & Complete ]           │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Identity Validation (Backend)        │
│ ┌────────────────────────────────┐   │
│ │ Compare:                       │   │
│ │                                │   │
│ │ Existing   vs  Submitted       │   │
│ │ ────────       ────────        │   │
│ │ john doe   ==  john doe    ✓   │   │
│ │ 1990-01-15 ==  1990-01-15  ✓   │   │
│ │ 1234       ==  1234        ✓   │   │
│ │                                │   │
│ │ IDENTITY MATCHES ✅            │   │
│ └────────────────────────────────┘   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ✅ UPDATE ACCEPTED                    │
│ - KEEP LOCKED: name, DOB, SSN        │
│ - UPDATE: address, city, state, zip  │
│ - Show success message               │
│ - Modal closes                       │
└──────────────────────────────────────┘
```

## Data Isolation Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ getCreditReportsByUserId(userId)                         │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ SELECT * FROM credit_reports                             │  │
│  │ WHERE userId = ?                 ◄─── ALWAYS FILTERS     │  │
│  │ ORDER BY uploadedAt DESC                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ getNegativeAccountsByUserId(userId)                      │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ SELECT * FROM negative_accounts                          │  │
│  │ WHERE userId = ?                 ◄─── ALWAYS FILTERS     │  │
│  │ ORDER BY createdAt DESC                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ getUserProfile(userId)                                   │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ SELECT * FROM user_profiles                              │  │
│  │ WHERE userId = ?                 ◄─── ALWAYS FILTERS     │  │
│  │ LIMIT 1                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Result: IMPOSSIBLE for users to see other people's data       │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                     USER VIEW LAYER                             │
│                                                                 │
│  User A (userId=1)           User B (userId=2)                 │
│  ┌────────────┐               ┌────────────┐                   │
│  │ Dashboard  │               │ Dashboard  │                   │
│  ├────────────┤               ├────────────┤                   │
│  │ John's     │               │ Jane's     │                   │
│  │ Reports    │               │ Reports    │                   │
│  │ - TU: 650  │               │ - TU: 720  │                   │
│  │ - EQ: 645  │               │ - EQ: 715  │                   │
│  │            │               │            │                   │
│  │ Accounts   │               │ Accounts   │                   │
│  │ - 5 items  │               │ - 3 items  │                   │
│  └────────────┘               └────────────┘                   │
│       ▲                               ▲                         │
│       │                               │                         │
│    userId=1                        userId=2                     │
│       │                               │                         │
│       └───────────────┬───────────────┘                         │
│                       │                                         │
│              DATABASE ALWAYS FILTERS                            │
│                  BY userId                                      │
│                                                                 │
│  ❌ User A CANNOT see User B's data                             │
│  ❌ User B CANNOT see User A's data                             │
└────────────────────────────────────────────────────────────────┘
```

## Identity Lock State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────┐                                           │
│  │  NEW USER    │                                           │
│  │              │                                           │
│  │ isComplete:  │                                           │
│  │   false      │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Upload Credit Report                              │
│         │ Complete Onboarding                               │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   LOCKED     │◄───────────────────────────┐              │
│  │              │                            │              │
│  │ isComplete:  │   Identity matches?        │              │
│  │   true       │   ✓ Allow address update   │              │
│  │              │                            │              │
│  │ Identity:    │                            │              │
│  │ - Name       │                            │              │
│  │ - DOB        │                            │              │
│  │ - SSN last 4 │                            │              │
│  └──────┬───────┘                            │              │
│         │                                    │              │
│         │ Try to upload/update               │              │
│         ▼                                    │              │
│  ┌──────────────┐                            │              │
│  │  VALIDATE    │                            │              │
│  │  IDENTITY    │────────────────────────────┘              │
│  │              │ Match ✓                                   │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Mismatch ❌                                        │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   REJECT     │                                           │
│  │              │                                           │
│  │ - Clear cache│                                           │
│  │ - Show error │                                           │
│  │ - No save    │                                           │
│  └──────────────┘                                           │
│                                                              │
│  ⚠️ PERMANENT: Once locked, identity CANNOT be unlocked     │
│     without admin intervention (manual SQL update)          │
└─────────────────────────────────────────────────────────────┘
```

## Summary

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                              ┃
┃  ONE ACCOUNT = ONE PERSON = ONE CREDIT REPORT                ┃
┃                                                              ┃
┃  ✅ Identity locked on first onboarding                      ┃
┃  ✅ Future uploads validated against locked identity         ┃
┃  ✅ Database queries filter by userId (data isolation)       ┃
┃  ✅ Clear error messages guide users                         ┃
┃  ✅ Audit trail for compliance                               ┃
┃                                                              ┃
┃  ❌ Cannot upload different person's report                  ┃
┃  ❌ Cannot change locked identity                            ┃
┃  ❌ Cannot see other users' data                             ┃
┃  ❌ Cannot share account between multiple people             ┃
┃                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
