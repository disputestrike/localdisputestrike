# DisputeStrike Compliance Implementation Plan

**Source of truth:**  
- `DisputeStrike_Compliance_Audit (1).pdf` (Jan 24, 2026)  
- `🎯_DisputeStrike_Strategic_Recommendations_&_Implementation_Plan (1).pdf`

**Goal:** Align code, docs, and UI with the audit. Remove what we don’t have. Fix what’s wrong.

---

## 1. CORRECT INFORMATION (FROM SOURCE BIBLE)

### 1.1 Pricing (SOURCE BIBLE §3)

| Tier | Price | Status |
|------|-------|--------|
| Free Preview | $0 | Blurred results, no letters |
| **Essential** | **$79.99/mo** | Unlimited letters, user mails |
| **Complete** | **$129.99/mo** | Automated certified mailing |
| **Agency Starter** | **$497/mo** | 50 clients |
| **Agency Professional** | **$997/mo** | 200 clients |
| **Agency Enterprise** | **$1,997/mo** | 500 clients |

**Consumer:** Essential $79.99, Complete $129.99. **Agency:** $497 / $997 / $1,997. (SOURCE BIBLE is authoritative.)

### 1.2 Report Flow & $4.95 (Compliance Audit – Page 5, Strategic Doc)

- **$4.95 processing fee:** **REMOVED.** No processing fee for direct uploads.
- **SmartCredit first:** Always prioritize SmartCredit link `?PID=87529`.
- **Free preview:** Direct upload → run **Preview Analysis** (~$0.20) → show counts only, **blur** details.
- **Preview results:** Total violation count, severity (Critical/High/Medium/Low), category breakdown. **Blur** account names and method details.
- **Affiliate:** $25+ commission from SmartCredit covers cost; free users can be profitable.

### 1.3 IP Protection (Compliance Audit – Page 3)

| Location | Expose “43 methods”? | Status |
|----------|----------------------|--------|
| Landing page | No | Scrubbed |
| Pricing page | No | Generic “AI detection” only |
| Dashboard | No | Show violations, not methods |
| Generated letters | Yes (required) | FCRA citations kept |
| Admin panel | Yes (internal) | OK – admin only |

**Rule:** No “43 methods,” “Method #X,” or FCRA detection logic in **public** UI. Backend and **letters** keep full detail. Admin keeps full visibility.

### 1.4 Affiliate & Tracking (Compliance Audit – Page 4)

- SmartCredit PID: **87529**
- `affiliateSource` (or equivalent) field: **implemented**
- Commission tracking: **database logging**

### 1.5 Services That Must Exist (Compliance Audit – Page 5)

- `server/previewAnalysisService.ts` – cheap teaser analysis  
- `server/disputeLockService.ts` – 30‑day lock  
- `server/agencyCapacityService.ts` – agency limits (50/200/500)  
- `client/src/pages/PreviewResults.tsx` – blurred preview  
- `client/src/pages/GetReports.tsx` – SmartCredit + free direct upload flow  

### 1.6 What We Don’t Have / Must Remove

- **$4.95** – Removed. No processing fee, no `processingFeeService`, no paywall for direct upload.
- **IdentityIQ** – Not in audit as primary report flow. Keep only if you have a separate, approved use; otherwise remove from **user-facing** flow.
- **“43 methods” in public UI** – Remove from landing, pricing, dashboard, GetReports, OnboardingQuiz, any public marketing.
- **Wrong consumer/agency pricing** – Use Essential $79.99, Complete $129.99, Agency $497/$997/$1,997 (SOURCE BIBLE §3, §10).

---

## 2. CURRENT vs CORRECT

| Area | Current | Correct |
|------|---------|---------|
| Consumer | Essential $79.99, Complete $129.99 | ✅ SOURCE BIBLE |
| Agency | $497 / $997 / $1,997 | ✅ SOURCE BIBLE |
| $4.95 fee | Gone from GetReports; still in some docs | Gone everywhere |
| GetReports API | Calls `/api/affiliate/track-click`, `/api/credit-reports/upload-and-analyze` | These routes **do not exist** |
| Affiliate tracking | No `affiliateSource` in DB | Add field; implement track‑click + logging |
| Preview flow | GetReports → upload → `/credit-analysis`; uses `/api/credit-reports/upload-and-analyze` | Use preview API → **PreviewResults** with blurred data |
| “43 methods” in UI | Removed from some places; still in backend, letters, admin | Keep backend/letters/admin; scrub all **public** UI |
| Consumer pricing | Mix of $49.99/$79.99, $79.99 “Essential”, $129.99 “Complete” | DIY $49.99, Complete $79.99 only |

---

## 3. IMPLEMENTATION PLAN (ORDER OF WORK)

### Phase A: Agency Pricing (SOURCE BIBLE §10)

1. **`shared/pricing.ts`**  
   - Agency: $497 / $997 / $1,997 (49700 / 99700 / 199700 cents).  
   - Display: `AGENCY_STARTER: '$497/month'`, etc.

2. **`server/agencyCapacityService.ts`**  
   - Use 49700 / 99700 / 199700 (cents) for Starter / Professional / Enterprise.

3. **`server/db.ts`**  
   - Replace `priceByPlan = { starter: 497, ... }` with 179.99, 349.99, 599.99 (or consistent cents).

4. **`client/src/pages/AgencyPricing.tsx`**  
   - Update `plans[].price` to 179.99, 349.99, 599.99.  
   - Update any “$497”/“$997”/“$1,997” copy.

5. **`client/src/pages/AgencyDashboard.tsx`**  
   - Use the same agency price constants (no 497/997/1997).

6. **Stripe / backend**  
   - If Stripe products or env vars reference 497/997/1997, add or use products for 179.99 / 349.99 / 599.99 and point agency checkout there.

7. **Tests**  
   - `agency.test.ts`, `agencyClient.test.ts`, etc.: update expected prices to 179.99 / 349.99 / 599.99.

### Phase B: Affiliate Tracking & Report Flow APIs

1. **Schema**  
   - Add `affiliateSource` (e.g. `varchar`, default `'direct'`) to `users` (or `leads` if you track pre‑signup).  
   - Add migration.

2. **`/api/affiliate/track-click`**  
   - New POST route.  
   - Body: `{ source: 'smartcredit' }`.  
   - Set cookie (e.g. `affiliate_source=smartcredit`) and/or store in DB (e.g. lead or user).  
   - Log for commission tracking.

3. **`/api/credit-reports/upload-and-analyze`**  
   - New POST route.  
   - Accept multipart upload (reports).  
   - **No $4.95.**  
   - Run **preview** analysis only (use `previewAnalysisService` or equivalent cheap parser).  
   - Return data suitable for **PreviewResults**: `totalViolations`, severity breakdown, category breakdown.  
   - **Do not** return full accounts or method details.

4. **`GetReports.tsx`**  
   - Keep SmartCredit (PID 87529) as Option 1 and direct upload as Option 2.  
   - On SmartCredit link click: call `/api/affiliate/track-click` (or use tRPC if you add it).  
   - On direct upload: call `/api/credit-reports/upload-and-analyze`.  
   - On success: navigate to **PreviewResults** with the preview payload (not `/credit-analysis` unless that’s refactored to show the same blurred preview).

5. **`PreviewResults.tsx`**  
   - Consume preview API response.  
   - Show counts, severity, categories only.  
   - **Blur** account names and any method‑level detail.  
   - “Upgrade to see full details” → pricing/checkout.

### Phase C: Wire Preview Analysis Service

1. **`previewAnalysisService`**  
   - Already exists.  
   - Ensure it returns `totalViolations`, severity breakdown, category breakdown (or adapt to match `PreviewResults`).

2. **`creditReportParser.performLightAnalysis`**  
   - Either use this for preview **or** use `previewAnalysisService`.  
   - Avoid duplicating logic; have **one** preview path used by `/api/credit-reports/upload-and-analyze`.

3. **Align types**  
   - `PreviewResults` currently expects `LightAnalysisResult`‑like shape.  
   - Ensure preview API response matches that (or update `PreviewResults` to match the API).

### Phase D: Scrub “43 Methods” from Public UI

1. **Landing / marketing**  
   - Search for “43”, “43 methods”, “43 violation”, “Method #” in `client/`.  
   - Remove or replace with generic “AI-powered violation detection” / “proven dispute strategies” type language.

2. **GetReports, OnboardingQuiz, Pricing, Dashboard (public views)**  
   - Same scrub.  
   - No method numbers, no FCRA logic explanations.

3. **Admin-only UI**  
   - MethodsAnalyticsDashboard and similar can keep “43” and method details.  
   - Ensure these routes are **admin-only**.

4. **Backend / letters**  
   - **Do not** remove “43” or FCRA detail from `conflictDetector`, `letterGenerator`, `letterTemplates`, or generated letter content.

### Phase E: Remove $4.95 and Outdated Docs

1. **Code**  
   - No `processingFeeService`.  
   - No $4.95 checkout or paywall in GetReports or report flow.

2. **Docs**  
   - Remove or update references to $4.95, processing fee, “pay $4.95 to upload” in:  
     `MASTER_IMPLEMENTATION_PLAN.md`, `REVISED_IMPLEMENTATION_PLAN.md`, `FINAL_ACCURATE_ANALYSIS.md`, `CROSSWALK_VERIFICATION.md`, `ACCURATE_AUDIT.md`, etc.  
   - Option: add a short note that “$4.95 processing fee has been removed per Compliance Audit (Jan 2026).”

### Phase F: Consumer Pricing Consistency

1. **Pricing page, Checkout, UpgradeBanner, Terms, FAQ, etc.**  
   - Use **only** DIY $49.99 and Complete $79.99.  
   - Remove $129.99 “Complete” or any “Essential” $79.99 used as a different product.  
   - Align Stripe products and env config with $49.99 / $79.99.

2. **Email templates**  
   - Replace any wrong amounts with $49.99 / $79.99.

### Phase G: Consolidate Duplicates & Cleanup (Optional)

1. **`disputeLockService`**  
   - `server/disputeLockService.ts` (disputeLetters, LockStatus) vs `server/services/disputeLockService.ts` (disputeRounds, canDisputeAccount). Different APIs; both used. Leave as-is unless consolidating.

2. **`agencyCapacityService`**  
   - `server/agencyCapacityService.ts` (AGENCY_TIERS, formatAgencyPrice) vs `server/services/agencyCapacityService.ts` (getAgencyClientCount, canAddClient). Different APIs; both used. Prices updated to 179.99/349.99/599.99 in root. Leave as-is unless consolidating.

3. **`previewAnalysisService` vs `performLightAnalysis`**  
   - Preview flow uses `previewAnalysisService` via `/api/credit-reports/upload-and-analyze`. `performLightAnalysis` in creditReportParser used elsewhere (e.g. Dashboard). Leave as-is.

---

## 4. FILES TO TOUCH (CHECKLIST)

- [ ] `shared/pricing.ts` – Agency prices  
- [ ] `server/agencyCapacityService.ts` – Prices + capacity  
- [ ] `server/services/agencyCapacityService.ts` – Same or remove duplicate  
- [ ] `server/db.ts` – Agency `priceByPlan`  
- [ ] `client/src/pages/AgencyPricing.tsx` – Plans + copy  
- [ ] `client/src/pages/AgencyDashboard.tsx` – Price display  
- [ ] `drizzle/schema.ts` – `affiliateSource` (and migration)  
- [ ] `server/_core/index.ts` (or router) – Mount `/api/affiliate/track-click`, `/api/credit-reports/upload-and-analyze`  
- [ ] `client/src/pages/GetReports.tsx` – Use new APIs; route to PreviewResults  
- [ ] `client/src/pages/PreviewResults.tsx` – Consume preview API; blur details  
- [ ] `server/previewAnalysisService.ts` – Match PreviewResults contract  
- [ ] `server/creditReportParser.ts` – Use preview path where appropriate  
- [ ] All **public** client pages – Scrub “43” / methods  
- [ ] `MethodsAnalyticsDashboard` – Keep “43”; ensure admin‑only  
- [x] Docs (see Phase E) – Deprecation notes added; $4.95 removed from current implementation  
- [ ] Tests – Agency prices, affiliate, preview flow  
- [ ] `disputeLockService` / `agencyCapacityService` – Deduplicate  

---

## 5. SUCCESS CRITERIA

- Agency pricing is **$179.99 / $349.99 / $599.99** everywhere (UI, DB, Stripe).  
- **No $4.95** anywhere; no processing fee for direct upload.  
- **SmartCredit** (PID 87529) is Option 1 on GetReports; direct upload is free Option 2.  
- **`/api/affiliate/track-click`** and **`/api/credit-reports/upload-and-analyze`** exist and are used by GetReports.  
- Upload → **PreviewResults** with **blurred** preview (counts + severity + categories only).  
- **No “43 methods”** (or similar) in public UI; **letters and admin** keep full detail.  
- **affiliateSource** stored and commission‑relevant actions logged.  
- Docs and codebase match the Compliance Audit and Strategic Recommendations.

---

*Last updated from Compliance Audit & Strategic Recommendations PDFs (Jan 24, 2026).*
