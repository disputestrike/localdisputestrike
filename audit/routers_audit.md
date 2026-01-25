# Server Routers Audit

## All Routers Defined in server/routers.ts

### 1. upload (line 375)
- `getSignedUrl` - query - Gets signed URL for file upload
- `uploadToS3` - mutation - Uploads file to S3

### 2. admin (line 430)
- Various admin procedures for user management

### 3. ai (line 875)
- AI-related procedures

### 4. auth (line 1022)
- Authentication procedures

### 5. creditReports (line 1036)
- `lightAnalysis` - query - Light analysis for FREE preview
- `upload` - mutation - Upload single bureau report
- `uploadCombined` - mutation - Upload combined 3-bureau report
- `list` - query - List all reports for user
- `get` - query - Get report details
- `reparse` - mutation - Re-parse existing report
- `delete` - mutation - Delete report

### 6. scoreHistory (line 1193)
- `list` - query - Get credit score history

### 7. notifications (line 1247)
- Notification procedures

### 8. documents (line 1296)
- Document vault procedures

### 9. negativeAccounts (line 1387)
- `list` - query - List negative accounts

### 10. disputeLetters (line 1446)
- `generate` - mutation - Generate dispute letters
- `list` - query - List letters

### 11. payments (line 2560)
- Payment procedures

### 12. contact (line 2634)
- Contact form procedures

### 13. leads (line 2679)
- Lead capture procedures

### 14. dashboardStats (line 2742)
- Dashboard statistics

### 15. disputeOutcomes (line 2750)
- Dispute outcome tracking

### 16. hardInquiries (line 2799)
- Hard inquiry procedures

### 17. cfpbComplaints (line 2835)
- CFPB complaint procedures

### 18. referrals (line 2905)
- Referral program procedures

### 19. activityLog (line 2930)
- Activity log procedures

### 20. courseProgress (line 2940)
- Course progress procedures

### 21. profile (line 2994)
- User profile procedures

### 22. agency (line 3047)
- Agency procedures
  - `clients` (line 3077) - nested router for agency clients

## Key Issues Identified:

### 1. Upload Flow Issue
The `uploadToS3` mutation at line 411-428 does NOT actually upload to S3. It just generates a URL.
The actual file upload needs to happen client-side using a signed URL, OR the server needs to receive the file data.

**Current Flow:**
1. Client calls `uploadToS3.mutateAsync({ fileKey, contentType })`
2. Server returns `{ url, key }` but doesn't actually upload anything
3. Client then calls `creditReports.upload.mutateAsync({ fileUrl, fileKey, ... })`
4. Server tries to insert into `credit_reports` table

**Problem:** The file is never actually uploaded to S3. The URL is generated but no file data is sent.

### 2. Database Insert Issue
The `creditReports.upload` mutation calls `db.createCreditReport()` which inserts into `credit_reports` table.
The error in Railway logs shows the insert is failing, but the table should exist.

**Possible Causes:**
- Missing database migrations
- Schema mismatch between code and actual database
- Connection issues

### 3. Missing Tables in Production
Railway logs show these tables don't exist:
- `subscriptions_v2`
- `dispute_rounds`

These are defined in schema.ts but migrations haven't been run.
