# DisputeStrike 2.0: Implementation Plan

**Date:** Jan 13, 2026
**Author:** Manus AI

## 1. Executive Summary

This document outlines a comprehensive implementation plan to evolve DisputeStrike from a manual, one-time-fee tool into an automated, subscription-based credit repair platform. The plan is based on the provided 6-week roadmap and leverages the existing codebase to accelerate development.

The core strategic shifts are:
1.  **From Manual to Automated:** Replace manual credit report uploads with a direct credit monitoring integration (e.g., IdentityIQ).
2.  **From One-Time to Recurring Revenue:** Transition from a one-time fee model to a `$1 trial` followed by a monthly subscription, dramatically increasing customer lifetime value.
3.  **From User-Led to AI-Led:** Move from users selecting accounts to an AI-powered system that recommends the highest-impact disputes, improving user outcomes and trust.

This plan details the necessary database, backend, and frontend changes required to execute this vision.

## 2. Foundation: Database Schema Modifications

Before development begins, we must update the database schema to support the new features. These changes are foundational for all subsequent phases.

**File to Edit:** `drizzle/schema.ts`

| Table | Column(s) to Add | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `monitoringProvider` | `varchar(50)` | Store the name of the monitoring partner (e.g., 'identityiq'). |
| | `monitoringUserId` | `varchar(255)` | Store the user's unique ID from the monitoring partner. |
| | `currentDisputeRound` | `int` | Track the user's current dispute round (1, 2, 3, etc.). |
| | `roundStartedAt` | `timestamp` | Timestamp for when the current dispute round began, for locking logic. |
| `subscriptions` | `trialEndsAt` | `timestamp` | Timestamp for when the `$1 trial` period expires. |
| `negativeAccounts` | `aiRecommended` | `boolean` | Flag to indicate if the AI selected this account for dispute. |
| | `aiReason` | `text` | Explanation from the AI on why this account was recommended. |
| `creditReports` | `source` | `mysqlEnum(...)` | Differentiate reports ('manual_upload' vs. 'monitoring_import'). |

These changes provide the necessary data structures for the new automated and subscription-based workflows.

## 3. Phase 1: Rebuild Product Flow (Weeks 1-3)

This is the most development-intensive phase, focusing on rebuilding the core user experience around automation.

### 3.1. New Onboarding Wizard

**Goal:** Create a seamless, multi-step onboarding flow that captures necessary user information and credentials for the credit monitoring service.

**Frontend Changes:**

*   **Create `pages/Onboarding.tsx`:** A new multi-step wizard to replace the simple `pages/Register.tsx`.
    *   **Step 1:** Collect basic info (Name, Email, Password). Re-use components from `Register.tsx`.
    *   **Step 2:** Collect personal details for credit pull (DOB, SSN, Address). Create a new form for this, leveraging `userProfiles` schema.
    *   **Step 3:** Capture credit monitoring credentials (username/password for IdentityIQ).
    *   **Step 4:** Display a loading state while the backend fetches the initial credit report.

**Backend Changes:**

*   **Create `server/onboardingRouter.ts`:**
    *   `registerAndCreateProfile`: A new mutation to create the user, their profile, and store their monitoring credentials (encrypted).
    *   `initiateFirstCreditPull`: A mutation that calls the new `monitoringService` to log in on the user's behalf and download their initial credit reports.

### 3.2. Credit Monitoring Integration

**Goal:** Abstract the credit monitoring logic so we can easily switch between providers (IdentityIQ, MyScoreIQ, etc.).

**Backend Changes:**

*   **Create `server/monitoringService.ts`:** An interface-driven service to handle all interactions with the monitoring provider.
    *   `getReport(userId)`: Fetches the latest credit report data.
    *   `cancelSubscription(userId)`: Cancels the user's monitoring subscription (for expired trials).
*   **Create `server/monitoring/identityiq.ts`:** The first implementation of the monitoring service, using a web scraping library like Puppeteer or Playwright to automate interactions with the IdentityIQ website.

### 3.3. Round Locking Logic

**Goal:** Enforce the 30-day waiting period between dispute rounds.

**Backend Changes:**

*   **Modify `server/routers.ts` (`letters.generate` mutation):**
    *   Add a check at the beginning of the mutation.
    *   Compare `users.roundStartedAt` with the current date.
    *   If less than 30 days have passed since the last round, throw an error: `"Round 2 is locked until [Date]."`
    *   When a new round is successfully started, update `users.currentDisputeRound` and `users.roundStartedAt`.

**Frontend Changes:**

*   **Modify `pages/Dashboard.tsx`:**
    *   Display the current round and the unlock date for the next round prominently.
    *   Disable the "Generate Letters" button and show a countdown timer if a round is locked.

### 3.4. AI Auto-Selection

**Goal:** Use AI to analyze and recommend the top 3-5 accounts to dispute.

**Backend Changes:**

*   **Modify `server/aiProvider.ts`:**
    *   Create a new function `getDisputeRecommendations(accounts)`.
    *   This function will send the list of negative accounts to an LLM with a prompt to select the top 3-5 based on factors like high balance, recent activity, and high probability of deletion (e.g., accounts with clear conflicts).
    *   The LLM should return the account IDs and a brief reason for each selection.
*   **Update `negativeAccounts` table:** After the AI analysis, update the `aiRecommended` and `aiReason` fields for the selected accounts.

**Frontend Changes:**

*   **Modify `pages/Dashboard.tsx`:**
    *   Instead of showing a simple list of all negative accounts, create a new section: "AI Recommendations".
    *   Highlight the 3-5 recommended accounts with a special badge.
    *   Display the `aiReason` for each recommendation to build user trust.
    *   The "Generate Letters" button will now default to disputing only the AI-recommended items.

## 4. Phase 2: $1 Trial Funnel (Week 4)

With the new product flow in place, we now build the funnel to get users into it.

### 4.1. New Pricing Page & Tiers

**Goal:** Replace the old one-time fee structure with the new subscription tiers.

**Frontend Changes:**

*   **Heavily Modify `pages/Pricing.tsx`:**
    *   Remove the old 'DIY' tiers.
    *   Implement the new three-tier structure: `$49`, `$69.95`, `$99.95`.
    *   The primary Call-to-Action (CTA) should now be "Start Your $1 Trial".

**Backend Changes:**

*   **Modify `server/products.ts`:** Update the product definitions to match the new subscription tiers and prices.

### 4.2. Combined Sign-up & Payment

**Goal:** Create a frictionless checkout experience for the `$1 trial`.

**Frontend Changes:**

*   **Create `pages/checkout.tsx`:** A new page that combines user registration and payment on a single form.
    *   Integrate Stripe Elements for credit card input.
    *   On submission, it will call a new backend mutation.

**Backend Changes:**

*   **Modify `server/routers.ts`:**
    *   Create a new mutation `startTrial(name, email, password, paymentMethodId)`.
    *   This mutation will:
        1.  Create a new Stripe customer.
        2.  Create and confirm a `$1` PaymentIntent.
        3.  Create the `user` record in the database.
        4.  Create a `subscription` record with a `trialEndsAt` timestamp set to 7 days in the future.

### 4.3. Trial Management Cron Job

**Goal:** Automatically manage trial expirations and conversions.

**Backend Changes:**

*   **Modify `server/cronJobs.ts`:**
    *   Create a new cron job `handleTrialConversions` that runs daily.
    *   The job will query for all `subscriptions` where `trialEndsAt` is in the past and the status is still 'active'.
    *   For each expired trial, it will:
        1.  Create a new Stripe subscription for the full monthly price (e.g., $69.95).
        2.  Update the `subscriptions` table in the database with the new Stripe subscription ID and status.
        3.  If the user has cancelled, call the `monitoringService.cancelSubscription(userId)` function.

## 5. Phase 3: Launch (Week 5-6)

This final phase involves testing, deployment, and final configuration.

*   **Go-Live Checklist:**
    1.  **End-to-End Testing:** Create a test user, sign up for the `$1 trial`, let the trial convert to a paid subscription, and go through one full dispute round.
    2.  **Stripe Configuration:** Switch Stripe from Test Mode to Live Mode. Ensure the live webhook is pointing to the production server.
    3.  **IdentityIQ Contract:** Finalize the partnership agreement and get production API/login credentials.
    4.  **Environment Variables:** Update all Railway environment variables with live keys for Stripe and IdentityIQ.
    5.  **Beta Test:** Onboard 20-50 beta users to identify any final bugs or usability issues.

## 6. Timeline & Recommendations

| Phase | Key Activities | Estimated Weeks |
| :--- | :--- | :--- |
| **0** | Database Schema Updates | 1-2 Days |
| **1** | Onboarding, Monitoring, Round Locking, AI Selection | 3 Weeks |
| **2** | Pricing Page, Checkout Flow, Trial Cron Job | 1 Week |
| **3** | E2E Testing, Beta Launch, Final Config | 1-2 Weeks |
| **Total** | | **5-6 Weeks** |

**Key Recommendations:**

*   **Parallel Work:** The IdentityIQ integration (web scraping) can be developed in parallel with the frontend onboarding wizard. Do not wait for IdentityIQ to respond before starting development.
*   **Backup Partner:** Immediately begin technical evaluation of a backup monitoring partner (e.g., MyScoreIQ). This mitigates the single point of failure risk.
*   **Feature Flags:** Implement the new features behind feature flags. This will allow for a gradual rollout and easy rollback if issues are found.

This plan provides a clear and actionable path to launching DisputeStrike 2.0. By focusing on automation and recurring revenue, this evolution positions the platform for significant growth and long-term success.
