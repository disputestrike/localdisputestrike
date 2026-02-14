# Complete Changes Log — Since Last Git Pull

Use this list if you reset to last Git commit and want to re-apply only the changes you approved.

---

## 1. Quiz / Start Free Analysis — Entry Point

**Intent:** Replace old quiz page and ensure all “Start Free Analysis” / “Get Started Free” CTAs go to `/start`.

| File | Change |
|------|--------|
| `client/src/App.tsx` | `/quiz` route redirects to `/start`; remove Quiz component import |
| `client/src/pages/Home.tsx` | “Take the Quiz” → “Start Free Analysis”; “Start Your Journey Free” → “Start Free Analysis”; links to `/start` |
| `client/src/pages/HowItWorks.tsx` | “Start Free Analysis” links → `/start` |
| `client/src/pages/Blog3RoundStrategy.tsx` | “Get Started Free” links → `/start` |
| `client/src/pages/BlogCreditReport.tsx` | “Start Free Analysis” / “Get Started Free” → `/start` |
| `client/src/pages/BlogFCRARights.tsx` | “Get Started Free” → `/start` |
| `client/src/pages/SuccessStories.tsx` | “Start Free Analysis” → `/start` |
| `client/src/pages/MoneyBackGuarantee.tsx` | “Start Free Analysis” → `/start` |
| `client/src/pages/FAQ.tsx` | “Get Started Free”, “Start Free Analysis”, “Get Started Now” → `/start` (not `/trial-checkout`) |
| `client/src/pages/Features.tsx` | “Start Free Analysis” → `/start` (not `/trial-checkout`) |
| `client/src/pages/Guarantee.tsx` | “Start Free Analysis” → `/start` |
| `client/src/pages/About.tsx` | “Start Free Analysis” → `/start` |
| `client/src/components/ExitIntentPopup.tsx` | “Claim My Free Analysis” → `/start` |
| `client/src/components/MobileMenu.tsx` | “Start Free Analysis” → `/start` |

---

## 2. Single Auth Session — No Login Redirect on 401

**Intent:** One login, one signup. Do not redirect to login on API 401.

| File | Change |
|------|--------|
| `client/src/main.tsx` | Remove 401 → login redirect; `onApiError` does nothing (no redirect) |

---

## 3. Preview Flow — Stay on Preview, No Login Block

**Intent:** Preview should remain visible and not redirect to sign up. No login check during the flow.

| File | Change |
|------|--------|
| `client/src/pages/PreviewResults.tsx` | Disable `scoresByBureau` query; add localStorage fallback; remove login redirect |
| `client/src/pages/PreviewResultsPage.tsx` | Read preview data from storage on mount; no login redirect |

---

## 4. Payment Selection — No Login Screen

**Intent:** Clicking Essential or Complete must not show a login screen.

| File | Change |
|------|--------|
| `client/src/pages/AgencyPricing.tsx` | Remove redirect to login when selecting a plan |

---

## 5. Checkout — Accept tier and plan Params

**Intent:** Checkout accepts both `?tier=` and `?plan=` in URL.

| File | Change |
|------|--------|
| `client/src/pages/Checkout.tsx` | `tierParam = params.get('tier') \|\| params.get('plan') \|\| 'complete'` |

---

## 6. Essential vs Complete Onboarding — ID & Utility

**Intent:** Essential tier requires ID + utility bill; Complete tier does NOT. Essential can "Save for later" (save profile without ID/utility, add documents later).

| File | Change |
|------|--------|
| `client/src/components/IdentityBridgeModal.tsx` | Rename `isCompleteTier` to `requiresIdAndUtility` (Essential = true). Add "Save for later" button for Essential. Update copy. |
| `client/src/pages/Dashboard.tsx` | Pass `requiresIdAndUtility={userProfile?.subscriptionTier === 'essential'}`. Handle `saveForLater` in completion handler. Update Generate button color. |
| `client/src/pages/DashboardHome.tsx` | Pass `requiresIdAndUtility={userProfile?.subscriptionTier === 'essential'}` |
| `server/routers.ts` | `completeIdentityBridge`: add `subscriptionTier`, `saveForLater` to input. Essential + saveForLater = don't set isComplete. Essential + ID/utility = set complete. Complete tier = set complete (no ID/utility needed). |

---

## 7. 20 Letters Per Round — Select Top 20 / Select All

**Intent:** Increase from 5 to 20 items per dispute round. Add "Select Top 20" and "Select All" buttons.

| File | Change |
|------|--------|
| `client/src/pages/MyLiveReport.tsx` | `MAX_ITEMS_PER_ROUND = 20`. Add `selectTop20()` and `selectAll()` handlers. Add buttons. |
| `client/src/pages/DisputeManager.tsx` | Same: `MAX_ITEMS_PER_ROUND = 20`, `selectTop20`, `selectAll`, buttons. |

---

## 8. User Profiles Schema — Onboarding Fix

**Intent:** Fix SQL failure when completing onboarding by ensuring `user_profiles` has required columns.

| File | Change |
|------|--------|
| `server/ensureUserProfilesSchema.ts` | **New file** – add missing columns |
| `server/_core/index.ts` | Run `ensureUserProfilesSchema()` after DB connect |
| `drizzle/schema.ts` | Add accountType, agency fields to users table |
| `package.json` | Add `db:repair-profiles` script |

---

## 9. TypeScript & Server Fixes

**Intent:** Fix TypeScript and runtime errors.

| File | Change |
|------|--------|
| `server/routers.ts` | Add `import type Stripe`. Fix master_admin check. Fix pdfBuffer (throw NOT_IMPLEMENTED). Fix invoice.payment_intent typing (invPI helper). Fix paidProcedure subV2/trial check. |
| `drizzle/schema.ts` | Add accountType, agencyName, agencyPlanTier, clientSlotsIncluded, clientSlotsUsed, agencyMonthlyPrice to users |

---

## 10. Agency Client Report Parsing

**Intent:** Implement `parseAndSaveAgencyClientReport` for agency clients.

| File | Change |
|------|--------|
| `server/creditReportParser.ts` | Add `parseAndSaveAgencyClientReport` function |
| `server/routers.ts` | Call it from agency report upload procedure |

---

## 11. AI Assistant — No Login Redirect

**Intent:** Do not redirect unauthenticated users to login.

| File | Change |
|------|--------|
| `client/src/pages/AIAssistant.tsx` | Remove redirect to login when unauthenticated |

---

## DO NOT RE-APPLY (Rejected)

- **Optional auth / guest checkout** at checkout — everyone must go through free analysis first; checkout stays behind auth.

---

## Files Changed Summary (30 files)

- **Client:** App, ExitIntentPopup, IdentityBridgeModal, MobileMenu, main, AIAssistant, About, AgencyPricing, Blog3RoundStrategy, BlogCreditReport, BlogFCRARights, Checkout, Dashboard, DashboardHome, DisputeManager, FAQ, Features, Guarantee, Home, HowItWorks, MoneyBackGuarantee, MyLiveReport, PreviewResults, PreviewResultsPage, SuccessStories
- **Server:** routers, creditReportParser, _core/index
- **Schema / Config:** drizzle/schema, package.json
- **New files:** ensureUserProfilesSchema.ts, scripts/repair-user-profiles-columns.ts, drizzle/0027_repair_user_profiles_*.sql

---

## If You Reset to Git

1. `git checkout .` (or `git restore .`) to discard all local changes.
2. Re-apply only the approved changes above.
3. Do not add optional auth, guest checkout, or any flow that bypasses free analysis.
