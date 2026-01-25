# Database Tables Audit

## All Tables Defined in drizzle/schema.ts

1. **users** - Core user table
2. **userProfiles** - User personal info for dispute letters
3. **creditReports** - Credit reports uploaded by users
4. **creditScoreHistory** - Score tracking over time
5. **negativeAccounts** - Negative accounts extracted from reports
6. **disputeLetters** - Generated dispute letters
7. **smartcreditTokens** - SmartCredit OAuth tokens
8. **parserComparisons** - Parser comparison logs
9. **parserAccuracyMetrics** - Parser accuracy tracking
10. **successStories** - Marketing success stories
11. **payments** - Payment transactions
12. **subscriptions** - User subscriptions (v1)
13. **mailingChecklists** - Mailing checklist tracking
14. **leads** - Lead capture from quiz funnel
15. **contactSubmissions** - Contact form submissions
16. **emailLeads** - Email leads from popups
17. **courseProgress** - Credit education course progress
18. **courseCertificates** - Course certificates earned
19. **disputeOutcomes** - Dispute outcome tracking
20. **hardInquiries** - Hard inquiries from reports
21. **cfpbComplaints** - CFPB complaints filed
22. **referrals** - Referral program tracking
23. **activityLog** - User activity log
24. **agencies** - Agency/Merchant accounts
25. **agencyClients** - Clients managed by agencies
26. **agencyClientReports** - Reports for agency clients
27. **agencyClientAccounts** - Accounts for agency clients
28. **agencyClientLetters** - Letters for agency clients
29. **userNotifications** - In-app notifications
30. **userDocuments** - Document vault
31. **methodTriggers** - 43 dispute method triggers
32. **methodAnalytics** - Method analytics
33. **adminAccounts** - Admin accounts
34. **adminActivityLog** - Admin activity log
35. **auditLogs** - User audit logs for SOC 2
36. **subscriptionsV2** - V2 subscriptions with trial support
37. **disputeRounds** - Dispute rounds tracking
38. **aiRecommendations** - AI recommendations
39. **bureauResponses** - Bureau response uploads
40. **onboardingProgress** - Onboarding wizard progress
41. **identityDocuments** - Identity documents for verification
42. **trialConversions** - Trial conversion tracking
43. **monitoringAccounts** - Monitoring accounts (IdentityIQ)

## Tables Referenced in Railway Logs as MISSING:

1. **subscriptions_v2** - MISSING (defined as subscriptionsV2 in schema)
2. **dispute_rounds** - MISSING (defined as disputeRounds in schema)

## Root Cause:
The database migrations have NOT been run on the production database. The schema defines these tables but they don't exist in the actual database.

## Required Action:
Run `npx drizzle-kit push:mysql` or equivalent migration command on the production database to create all missing tables.
