# DisputeStrike: Comprehensive Product & System Documentation

**Author:** Manus AI
**Date:** January 20, 2026
**Version:** 1.0

---

## 1. Executive Summary

DisputeStrike is a sophisticated Software-as-a-Service (SaaS) application designed to automate and streamline the credit repair process for both individual consumers and professional agencies. The platform leverages Artificial Intelligence, specifically advanced Large Language Models (LLMs), to analyze credit reports, identify negative items and reporting conflicts, and generate litigation-grade dispute letters. 

The core business model is a tiered subscription service, converting users from a highly constrained but value-demonstrating free trial into recurring monthly subscribers. The system is architected to be scalable, secure, and robust, utilizing a modern technology stack including React, Node.js, TypeScript, and a MySQL-compatible database managed with Drizzle ORM.

This document provides a comprehensive overview of the DisputeStrike product, including its features, user flow, pricing strategy, system architecture, and technical implementation details, based on a full analysis of the application codebase.

---

## 2. Product Tiers & Pricing Strategy

DisputeStrike employs a strategic three-tier pricing model designed to maximize user acquisition and conversion. The strategy is centered on a psychologically-driven funnel that guides users from a limited free experience to a full-featured paid subscription.

### 2.1. Pricing Tiers

The platform offers two primary paid plans for individual consumers, alongside a highly limited free tier designed to showcase value and create an immediate need for an upgrade.

| Plan Tier | Price (USD) | Target Audience | Core Value Proposition |
| :--- | :--- | :--- | :--- |
| **Free** | $0 | Lead Generation | See a preview of negative items and the AI's power. |
| **DIY** | $49.99 / month | Cost-conscious Users | Unlimited AI-generated dispute letters; user mails them. |
| **Complete** | $79.99 / month | Convenience-focused Users | Fully automated "done-for-you" service with certified mailing. |

### 2.2. The Conversion-Optimized Funnel

The user journey is meticulously crafted to drive upgrades by demonstrating value while imposing strategic limitations.

1.  **The $1 Trial Hook**: A 7-day trial for $1 provides low-friction entry. This allows the system to capture payment information upfront and sets the stage for automatic subscription billing.

2.  **Immediate Value Demonstration**: Upon uploading their credit reports, the AI immediately analyzes them and presents a summary of findings. This provides an instant "aha!" moment.

3.  **Strategic Frustration (The Paywall)**: While the AI identifies all negative items, the free trial user can only view the first three. The rest are blurred or locked, creating a powerful incentive to upgrade to see the full picture. Similarly, users can generate a preview of a dispute letter but cannot download or mail it.

4.  **The "Most Popular" Upsell**: The "Complete" plan is highlighted as the "Most Popular" choice, using social proof to anchor its value and make it the default selection for users seeking the best outcome.

5.  **Urgency and Scarcity**: The UI incorporates elements like countdown timers for special offers to encourage immediate action.

### 2.3. Feature Breakdown by Tier

The feature set is carefully distributed across the tiers to align with the pricing and conversion strategy.

| Feature | Free | DIY ($49.99/mo) | Complete ($79.99/mo) |
| :--- | :---: | :---: | :---: |
| Credit Report Upload & Analysis | ✅ | ✅ | ✅ |
| View All Negative Accounts | ❌ (3 only) | ✅ | ✅ |
| AI-Powered Letter Generation | ❌ (Preview only) | ✅ | ✅ |
| Unlimited Dispute Rounds | ❌ | ✅ | ✅ |
| 3-Bureau Credit Monitoring | ❌ | ✅ | ✅ |
| Cross-Bureau Conflict Detection | ❌ | ✅ | ✅ |
| Certified Mailing Included | ❌ | ❌ | ✅ |
| One-Click Dispute Sending | ❌ | ❌ | ✅ |
| Real-Time USPS Tracking | ❌ | ❌ | ✅ |
| CFPB Complaint Generator | ❌ | ❌ | ✅ |
| Furnisher & Collector Disputes | ❌ | ❌ | ✅ |

---

## 3. User Flow & Onboarding Process

The user onboarding process is designed to be as seamless as possible, guiding the user from initial interest to an active, paying subscriber.

### 3.1. The Checkout and Intake Flow

The primary entry point for new users is the trial checkout page.

1.  **Plan Selection**: The user is presented with the **DIY** and **Complete** plans and chooses one to start their $1 trial. The UI is designed to steer users towards the "Complete" plan.

2.  **Account Creation**: The user creates an account with only an email and password. The system is architected to avoid collecting sensitive information like SSN or DOB at this early stage, reducing friction.

3.  **Payment**: The user pays the $1 trial fee via a Stripe-integrated payment form. This step securely captures their payment details for future subscription billing.

4.  **Onboarding**: After successful payment, the user is directed to their dashboard and prompted to upload their credit reports. This is the first core action they must take to see the product's value.

### 3.2. Credit Report Intake and Parsing

This is the most critical step in the user journey, where the system ingests and analyzes the user's credit data.

-   **Upload**: Users can upload their credit reports in various formats (e.g., PDF). The system stores these files securely.
-   **AI Parsing (`creditReportParser.ts`)**: Once uploaded, the reports are processed by a sophisticated AI service. This service reads the complex structure of the credit reports and extracts key information, including:
    -   Personal Information
    -   Credit Score
    -   Public Records
    -   Collections
    -   Charge-offs
    -   Late Payments
    -   Inquiries
-   **Database Storage**: The parsed data is structured into a standardized JSON format and stored in the `credit_reports` and `negative_accounts` tables in the database, linking it to the user's ID.

---

## 4. Core Product Features & Technology

DisputeStrike's power lies in its advanced AI-driven features that automate the most complex parts of the credit repair process.

### 4.1. AI-Powered Credit Analysis

Once a credit report is parsed, the system's intelligence layer begins its analysis.

-   **Negative Item Identification**: The system flags all derogatory marks, such as collections, late payments, charge-offs, and bankruptcies. Each identified item is stored as a record in the `negative_accounts` table.

-   **Cross-Bureau Conflict Detection (`conflictDetector.ts`)**: This is a cornerstone feature. The AI compares the data for the same account across all three credit bureaus (TransUnion, Equifax, Experian). It actively searches for discrepancies, which are powerful leverage in disputes. Examples of detected conflicts include:
    -   Different opening dates
    -   Mismatched balances or credit limits
    -   Varying payment statuses
    -   Inconsistent last activity dates
    -   Evidence of illegal re-aging

-   **Reporting**: The results of the analysis are presented to the user in a clean, easy-to-understand dashboard. As per the pricing strategy, free trial users will only see a limited subset of these findings.

### 4.2. AI Dispute Letter Generation

The `letterGenerator.ts` service is the engine that creates customized, legally-potent dispute letters.

-   **Dynamic Prompt Engineering**: The service constructs a detailed prompt for an LLM (like GPT-4) based on the user's information, the specific accounts being disputed, and the conflicts detected by the `conflictDetector`.

-   **Litigation-Grade Structure**: The AI is instructed by a robust system prompt to follow a proven, 10/10-rated letter structure. This includes:
    1.  A firm legal opening citing the Fair Credit Reporting Act (FCRA).
    2.  An account-by-account breakdown of inaccuracies.
    3.  Citing specific violations (e.g., impossible timelines, cross-bureau conflicts).
    4.  A clear demand for deletion or correction.
    5.  A statement of legal consequences for non-compliance (e.g., CFPB complaints).
    6.  A legally-mandated 30-day response deadline.

-   **Letter Types**: The system is capable of generating various types of letters beyond the initial dispute, including follow-ups, escalations, and direct disputes to furnishers/collectors, handled by `additionalLetterGenerators.ts`.

### 4.3. Dispute and Reporting Workflow

-   **Dispute Tracking**: Once a letter is generated and sent, the system tracks its status, response deadlines, and outcomes in the `dispute_letters` table.
-   **Reports and Dashboards**: The user dashboard provides a centralized view of their credit score history (`credit_score_history` table), the status of their disputes, and the accounts that have been successfully removed or corrected.

---

## 5. System Architecture & Technical Stack

DisputeStrike is built on a modern, robust technology stack designed for scalability and maintainability. It follows a standard client-server architecture.

### 5.1. Technology Stack

-   **Frontend**: React with TypeScript, built using Vite for a fast development experience. UI components are built with Shadcn/UI and Tailwind CSS.
-   **Backend**: Node.js with TypeScript, utilizing an Express.js-like framework for routing and middleware.
-   **Database**: MySQL-compatible database.
-   **ORM**: Drizzle ORM for type-safe database queries and schema management.
-   **Authentication**: A custom solution is implemented (`customAuth.ts`), supporting both email/password and potentially Manus OAuth, with roles for 'user' and 'admin'.
-   **Email**: Zoho ZeptoMail for transactional and marketing emails, integrated via `zeptomailService.ts`.
-   **Payments**: Stripe for processing trial fees and recurring monthly subscriptions.

### 5.2. Frontend Architecture (`/client`)

The client-side is a single-page application (SPA) built with React. 

-   **Pages (`/client/src/pages`)**: Contains the main views of the application, such as `Pricing.tsx`, `TrialCheckout.tsx`, and the user `Dashboard.tsx`.
-   **Components (`/client/src/components`)**: Reusable UI elements like `UpgradeBanner.tsx` and `UserDropdown.tsx` are stored here.
-   **Routing**: The application uses `wouter` for client-side routing, enabling navigation between different pages without full page reloads.

### 5.3. Backend Architecture (`/server`)

The backend is responsible for business logic, database interactions, and serving the API.

-   **API Routes (`/server/routesV2-*.ts`)**: API endpoints are organized by resource, such as `routesV2-subscription.ts`, which handles all subscription-related actions (create, upgrade, cancel).
-   **Services**: Business logic is encapsulated in service files. Key services include:
    -   `stripeSubscriptionService.ts`: Manages all interactions with the Stripe API.
    -   `letterGenerator.ts`: The core AI service for creating dispute letters.
    -   `conflictDetector.ts`: The AI service for analyzing credit reports.
    -   `zeptomailService.ts`: Handles sending all application emails.
-   **Cron Jobs (`/server/cronJobs.ts`)**: Scheduled tasks, such as sending trial nurture emails and processing subscription events, are defined and managed here.

---

## 6. Database Schema

The database is the backbone of the application, storing all user and application data. The schema is defined using Drizzle ORM in `/drizzle/schema.ts`.

### 6.1. Key Data Tables

| Table Name | Description |
| :--- | :--- |
| `users` | Stores core user account information, including authentication details, role (user/admin), and personal information for IdentityIQ integration. |
| `user_profiles` | Contains the user's personal data required for populating dispute letters, such as full name, addresses, and contact information. |
| `subscriptionsV2` | Tracks the user's subscription status, including their current plan (`diy`, `complete`), trial period dates, and Stripe customer/subscription IDs. |
| `credit_reports` | Stores uploaded credit report files and the AI-parsed JSON data extracted from them. |
| `negative_accounts` | A critical table containing every individual negative item identified from the credit reports, including account details, balances, and detected cross-bureau conflicts. |
| `dispute_letters` | Contains the full text of every generated dispute letter, its status (generated, mailed, resolved), the accounts it targets, and tracking information. |
| `credit_score_history` | Logs the user's credit score over time, allowing for progress tracking and visualization. |

### 6.2. Data Relationships

-   A `user` can have one `user_profile` and one `subscriptionV2`.
-   A `user` can have multiple `credit_reports` (one for each bureau).
-   A `credit_report` is the source for multiple `negative_accounts`.
-   A `dispute_letter` is generated for a `user` and targets one or more `negative_accounts`.

---

## 7. Agency & Merchant Features

The platform includes a distinct set of features designed for credit repair agencies or merchants who manage multiple clients.

-   **Account Type**: The `users` table has an `accountType` field that can be set to `agency`.
-   **Client Management**: Agency accounts have `clientSlotsIncluded` and `clientSlotsUsed` fields, indicating a model where agencies purchase slots to manage their own clients through the DisputeStrike platform.
-   **Agency Tiers**: The schema includes an `agencyPlanTier` (`starter`, `professional`, `enterprise`) and `agencyMonthlyPrice`, suggesting a separate, higher-priced subscription model for B2B customers.

This robust documentation provides a clear and deep understanding of the DisputeStrike application, from its business strategy to its technical implementation. It can serve as a foundational resource for ongoing development, onboarding new team members, and strategic planning.
