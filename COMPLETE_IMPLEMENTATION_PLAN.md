# Complete Implementation Plan — Everything From Approved Document

**Purpose:** Implement 100% of the approved DISPUTE_AI_IMPLEMENTATION_PLAN. No generic fallbacks. Use the exact letters, strategy, and flow specified.

---

## PART A: GAP AUDIT (What’s Missing)

| # | Approved Item | Current State | Action Required |
|---|---------------|---------------|-----------------|
| 1 | **Parser: paymentHistory, highBalance, chargeOffDate** | May be in rawData; not extracted explicitly | Extend creditReportParser to extract these fields; store in rawData or negative_accounts |
| 2 | **disputeScorer: date_opened == date_closed** | Not in conflictRoundMap (opening_date_conflicts exists for different case) | Add `date_opened_equals_closed` to Round 1, severity 7; add detection in disputeScorer |
| 3 | **disputeScorer: balance > high_balance (math error)** | Not implemented | Add detection; severity 9, Round 1 |
| 4 | **roundManager.updateAfterRound1Results()** | Does not exist | Create; accepts per-account results (deleted/verified/no_response); updates round2Escalations, round3CfpbPrep |
| 5 | **roundManager.getRound2Targets()** | Does not exist | Create; returns round2NewDisputes + round2Escalations (result-driven) |
| 6 | **roundManager.getRound3Targets()** | Does not exist | Create; returns round3NewDisputes + cfpbTargets |
| 7 | **dispute_results table (optional)** | Does not exist | Add schema + migration to store per-account Round 1 result |
| 8 | **Round 2 letter templates 2A, 2B, 2C** | Do not exist | Create letterTemplates/round2.ts with 2A, 2B-1, 2B-2, 2B-3, 2C |
| 9 | **Round 2A: New bureau disputes** | Uses generic AI | Replace with template 2A (internal conflict focus, no cross-bureau) |
| 10 | **Round 2B: Furnisher challenge letters** | Existing furnisherLetterGenerator is generic | Create 2B-1, 2B-2, 2B-3 templates; wire to Round 2 flow |
| 11 | **Round 2C: Bureau follow-up (inadequate investigation)** | Does not exist | Create template 2C |
| 12 | **Round 3 letter templates 3A, 3B, 3C** | Do not exist | Create letterTemplates/round3.ts with 3A, 3B-1/2/3, 3C-1/2 |
| 13 | **Round 3A: Final bureau disputes** | Uses generic AI | Replace with template 3A |
| 14 | **Round 3B: CFPB complaints (3B-1, 3B-2, 3B-3)** | CFPB flow exists but not round-specific | Wire 3B templates to dispute strategy; store as letterType `cfpb` |
| 15 | **Round 3C: Pre-litigation demands** | Does not exist | Create 3C-1, 3C-2 templates |
| 16 | **Results capture UI** | Does not exist | Add UI: After 30 days, user marks each Round 1 account as deleted/verified/no_response |
| 17 | **updateAfterRound1Results called from UI** | N/A | Wire results capture → roundManager.updateAfterRound1Results() |
| 18 | **Round 2 generate uses getRound2Targets** | Uses allocateAllRounds only | Change generate to use getRound2Targets when round=2 (includes escalations) |
| 19 | **Round 3 generate uses getRound3Targets** | N/A | Wire Round 3 generation to getRound3Targets |
| 20 | **Furnisher address lookup** | furnisherLetterGenerator has lookup | Ensure used for 2B letters; add to account metadata if needed |
| 21 | **One letter per account per bureau (Round 2/3)** | Round 2+ may bundle accounts | Enforce one letter per account per bureau for Round 2/3 template flow |
| 22 | **Docs/letters master templates (Experian, TU, EQ)** | Exist but are cross-bureau style | Round 3 can use this structure; Round 1/2 use short templates per plan |
| 23 | **round1Detector, round2Detector, round3Detector** | Plan shows separate files | Currently disputeScorer + conflictRoundMap handle it; optional refactor into separate detectors |
| 24 | **Letter structure from docs (Header, Exhibits, 30-day, etc.)** | letterPostProcessor has some | Ensure Round 2/3 templates include required sections from EXPERIAN_MASTER_TEMPLATE |
| 25 | **Analysis → Dispute flow** | previewAnalysisService, creditReportParser | Ensure parsed data flows to negative_accounts with full fields; conflict analysis runs on save |

---

## PART B: IMPLEMENTATION ORDER (Step-by-Step)

### Step 1: Schema & Parser (Analysis → Finding Disputes)
- [ ] Extend creditReportParser to extract `paymentHistory`, `highBalance`, `chargeOffDate` into rawData.
- [ ] Add `dispute_results` table (userId, negativeAccountId, roundNumber, result: deleted|verified|no_response, createdAt).
- [ ] Ensure runConflictAnalysisForUser runs on report save/repopulate and populates hasConflicts.

### Step 2: roundManager — Result-Driven Logic
- [ ] Implement `updateAfterRound1Results(userId, results: { accountId, result }[])`.
- [ ] Persist results to dispute_results (or equivalent).
- [ ] Implement `getRound2Targets(userId)`: round2New (severity 6–7) + round2Escalations (from R1 verified/no_response).
- [ ] Implement `getRound3Targets(userId)`: round3New + cfpbTargets (from R1 verified low severity).
- [ ] Max 5 per round in each target list.

### Step 3: disputeScorer — Complete Scoring
- [ ] Add date_opened == date_closed detection → Round 1, severity 7.
- [ ] Add balance > high_balance (math error) → Round 1, severity 9.
- [ ] Ensure all conflict types from plan are in conflictRoundMap with correct round/severity.

### Step 4: Round 2 Letter Templates
- [ ] Create `server/disputeStrategy/letterTemplates/round2.ts`.
- [ ] **2A:** Internal conflict (re-aging, status conflict, account number conflict) — bureau letter, no cross-bureau.
- [ ] **2B-1:** Debt validation demand (general) — to furnisher.
- [ ] **2B-2:** Furnisher challenge for verified errors (specific) — to furnisher.
- [ ] **2B-3:** Duplicate account challenge — to furnisher.
- [ ] **2C:** Bureau follow-up (inadequate investigation) — to bureau.
- [ ] Wire templates to generate mutation when round=2; use getRound2Targets.

### Step 5: Round 3 Letter Templates
- [ ] Create `server/disputeStrategy/letterTemplates/round3.ts`.
- [ ] **3A:** Final bureau disputes — can use structure from EXPERIAN_MASTER_TEMPLATE (cross-bureau allowed).
- [ ] **3B-1:** CFPB complaint against furnisher.
- [ ] **3B-2:** CFPB complaint against bureau.
- [ ] **3B-3:** CFPB complaint (multiple failures).
- [ ] **3C-1:** Pre-litigation demand to furnisher (10-day, statutory damages).
- [ ] **3C-2:** Pre-litigation demand to bureau.
- [ ] Wire to generate mutation when round=3; use getRound3Targets.

### Step 6: routers.ts — Generate Mutation (All Rounds)
- [ ] Round 1: Already template-based (1A–1F). Keep as-is.
- [ ] **Round detection:** Currently `isRound1 = existingLetters.length === 0`. Add explicit `input.round` or infer from dispute_rounds. For R2/R3, use getRound2Targets / getRound3Targets.
- [ ] Round 2: Replace AI branch (lines 2010–2048) with template selection (2A/2B/2C); furnisher letters use bureau='furnisher'. Use getRound2Targets() for targets.
- [ ] Round 3: Add Round 3 branch with template selection (3A/3B/3C). Use getRound3Targets().
- [ ] One letter per account per bureau (or per furnisher for 2B).
- [ ] Remove generic AI fallback for R2/R3; use only templates.

### Step 7: Results Capture UI
- [ ] Add "Record Round 1 Results" section in Dispute Manager or Letters page.
- [ ] After letters mailed + 30 days: show each Round 1 account with buttons [Deleted] [Verified] [No Response].
- [ ] On submit: call updateAfterRound1Results with user's selections.
- [ ] After submit: Round 2/3 targets update automatically.

### Step 8: CFPB / Furnisher Flow UI
- [ ] Dispute Manager: when Round 2, show option to "Generate Furnisher Letters" for escalation accounts.
- [ ] When Round 3: show "Generate CFPB Complaint" with 3B-1/2/3 options.
- [ ] Furnisher address: use lookup from furnisherLetterGenerator; allow manual override.

### Step 9: Analysis → Dispute Strategy Flow
- [ ] Upload → parse → save negative_accounts (with full rawData).
- [ ] runConflictAnalysisForUser after save.
- [ ] Dispute Manager shows getRoundRecommendations (round1, round2, round3).
- [ ] Generate uses round-specific templates only (no generic AI).
- [ ] Results capture → updateAfterRound1Results → getRound2Targets/getRound3Targets reflect results.

### Step 10: Validation & Cleanup
- [ ] Remove any remaining generic LETTER_GENERATION_SYSTEM_PROMPT usage for R1/R2/R3.
- [ ] Deprecate letterGenerator.generateDisputeLetter for bureau flow; use disputeStrategy only.
- [ ] Ensure conflictDetector round tags match conflictRoundMap.
- [ ] Run full flow test: upload → parse → R1 generate → (simulate 30 days) → results → R2 generate → R3 generate.

---

## PART C: LETTER TEMPLATE SPECIFICATIONS (From Plan)

### Round 1 (Already Implemented)
- 1A: Impossible timeline
- 1B: Duplicate reporting
- 1C: Unverifiable balance
- 1D: Math error
- 1E: Internal date conflict
- 1F: Re-aging  
- All: Short, 1 page, one error, no cross-bureau, FCRA § 1681i(a)(5)(A).

### Round 2 (To Implement)
- **2A:** Internal conflict bureau letter (re-aging, status conflict, account number) — no cross-bureau.
- **2B-1:** Debt validation demand — to furnisher (general).
- **2B-2:** Furnisher challenge (verified errors) — to furnisher.
- **2B-3:** Duplicate challenge — to furnisher.
- **2C:** Bureau follow-up (inadequate investigation) — to bureau.

### Round 3 (To Implement)
- **3A:** Final bureau dispute — can include cross-bureau (use Experian Master Template structure).
- **3B-1:** CFPB complaint vs furnisher.
- **3B-2:** CFPB complaint vs bureau.
- **3B-3:** CFPB complaint (multiple failures).
- **3C-1:** Pre-litigation to furnisher (10-day, statutory damages).
- **3C-2:** Pre-litigation to bureau.

---

## PART D: DATA FLOW (End-to-End)

```
1. User uploads reports
   → pdfParsingService / creditReportParser
   → parseWithAI or parseWithVisionAI
   → Extract paymentHistory, highBalance, chargeOffDate into rawData
   → Save to negative_accounts

2. runConflictAnalysisForUser(userId)
   → detectConflicts(parsedAccounts)
   → Update hasConflicts, conflictDetails per account

3. allocateAllRounds(userId)
   → disputeScorer.scoreAccounts()
   → Returns round1, round2, round3 (top 5 each by severity)

4. User generates Round 1 letters
   → getRound1Targets() → templates 1A–1F
   → One letter per account per bureau
   → Save to dispute_letters (round=1)

5. [30 days pass]

6. User records results (deleted/verified/no_response per account)
   → updateAfterRound1Results(userId, results)
   → Persist to dispute_results
   → Recompute round2Escalations, round3CfpbPrep

7. User generates Round 2 letters
   → getRound2Targets() = round2New + round2Escalations
   → 2A (bureau) or 2B (furnisher) or 2C (bureau follow-up)
   → One letter per account

8. [30 days pass]

9. User generates Round 3 letters
   → getRound3Targets() = round3New + cfpbTargets
   → 3A (bureau) or 3B (CFPB) or 3C (pre-litigation)
   → One letter per account / CFPB form
```

---

## PART E: FILES TO CREATE/MODIFY

| Action | File |
|--------|------|
| **CREATE** | `server/disputeStrategy/letterTemplates/round2.ts` |
| **CREATE** | `server/disputeStrategy/letterTemplates/round3.ts` |
| **CREATE** | `drizzle/migrations/XXXX_dispute_results.sql` (if new table) |
| **MODIFY** | `server/disputeStrategy/roundManager.ts` — add updateAfterRound1Results, getRound2Targets, getRound3Targets |
| **MODIFY** | `server/disputeStrategy/disputeScorer.ts` — add date_opened=date_closed, math error |
| **MODIFY** | `server/creditReportParser.ts` — extract paymentHistory, highBalance, chargeOffDate |
| **MODIFY** | `server/routers.ts` — Round 2/3 use templates; wire getRound2Targets, getRound3Targets |
| **MODIFY** | `client/src/pages/DisputeManager.tsx` or new page — Results capture UI |
| **MODIFY** | `client/src/pages/Letters.tsx` or Dispute Manager — CFPB/furnisher generation triggers |
| **MODIFY** | `server/disputeStrategy/conflictRoundMap.ts` — ensure all types from plan |
| **REMOVE** | Generic AI letter generation for R2/R3 — replace with templates only |

---

## PART F: ESTIMATED EFFORT

| Phase | Tasks | Est. |
|-------|-------|------|
| Schema & Parser | 3 items | 1–2 hrs |
| roundManager result logic | 4 items | 2–3 hrs |
| disputeScorer completion | 2 items | 0.5 hr |
| Round 2 templates | 6 templates + wiring | 3–4 hrs |
| Round 3 templates | 6 templates + wiring | 3–4 hrs |
| Generate mutation (R2/R3) | Wire templates, remove AI | 2 hrs |
| Results capture UI | New UI + API | 2–3 hrs |
| CFPB/furnisher UI | Buttons + flows | 1–2 hrs |
| Validation & test | Full flow | 1–2 hrs |
| **Total** | | **16–22 hrs** |

---

**Next:** Execute this plan in order. No generic fallbacks. Every template and flow from the approved document will be implemented.
