# DisputeStrike AI Training & Dispute Process — Implementation Plan

**Status:** DRAFT — Awaiting approval before implementation  
**Last Updated:** Based on AI training framework provided by user

---

## 1. EXECUTIVE SUMMARY

The current DisputeStrike system uses a **cross-bureau-first** approach for dispute selection and letter generation. The new framework requires a **round-stratified escalation** strategy:

- **Round 1:** Internal logic errors only (no cross-bureau)
- **Round 2:** Internal conflicts within same bureau + escalate Round 1 failures to furnisher
- **Round 3:** Cross-bureau + CFPB + furnisher escalation

**Critical change:** Do NOT mention cross-bureau conflicts until Round 3.

---

## 2. CURRENT STATE ANALYSIS

### 2.1 What Exists Today

| Component | Location | Current Behavior |
|-----------|----------|------------------|
| **AI Selection** | `server/aiSelectionService.ts` | Prioritizes cross-bureau conflicts (balance, date, status), age >7yr, medical, duplicates. Uses 10 detection methods. Max 5 items/round. |
| **Conflict Detector** | `server/conflictDetector.ts` | 43+ detection methods including `impossible_timeline`, `re-aging`, `unverifiable_balance`, `duplicate`, cross-bureau conflicts. All conflicts treated equally for letter generation. |
| **Letter Generation** | `server/routers.ts` (LETTER_GENERATION_SYSTEM_PROMPT), `server/letterGenerator.ts`, `server/letterPostProcessor.ts` | Multi-angle attack, cross-bureau comparison in Round 1. One long letter per bureau with multiple accounts. |
| **Letter Templates** | `server/letterTemplates.ts` | 43 method-specific templates. Not used for round-specific formatting. |
| **Round Locking** | `server/roundLockingService.ts` | 30-day lock between rounds. Tier-based max rounds (Starter: 2, Pro: 3, Complete: unlimited). |
| **Negative Accounts Schema** | `drizzle/schema.ts` | `dateOpened`, `lastActivity`, `balance`, `rawData`, `transunionData`, `equifaxData`, `experianData`, `hasConflicts`, `conflictDetails`. |
| **Dispute Letters** | `drizzle/schema.ts` | `round`, `letterType` (initial, followup, escalation, cfpb, etc.). |
| **Dispute Manager UI** | `client/src/pages/DisputeManager.tsx` | User selects accounts. No round-based recommendations. |

### 2.2 Gaps vs. New Framework

| Gap | Description |
|-----|-------------|
| **Round-stratified scoring** | Current aiSelectionService does not assign accounts to Round 1/2/3 by error type. Cross-bureau is prioritized first (wrong). |
| **Round 1 = internal only** | conflictDetector has internal errors (impossible_timeline, etc.) but they are mixed with cross-bureau. Need to separate. |
| **Severity scoring (10/10)** | No severity score that maps to round allocation (10/10→R1, 6–7/10→R2, 4–5/10→R3). |
| **Max 3–5 per round** | MAX_ITEMS_PER_ROUND = 5 exists but APPROVED_CHANGES_LOG says 20. Need to confirm and align to 3–5. |
| **Short, one-error letters (Round 1)** | Current letters are long, multi-angle. New Round 1: short, focused, one error per letter. |
| **Round 2 split** | New disputes (next tier) + escalate Round 1 verified failures to furnisher. Not implemented. |
| **Round 3** | CFPB complaint generation, furnisher validation demands. CFPB templates exist but not wired. |
| **Duplicate detection** | Same creditor + open date + balance = duplicate group. Logic exists in conflictDetector but not in selection/round allocation. |
| **Missing fields** | `paymentHistory`, `highBalance`, `chargeOffDate` needed for unverifiable balance and math error detection. May be in `rawData` — need to ensure extraction. |
| **Result-driven Round 2/3** | Round 2/3 targets depend on Round 1 results (deleted vs verified). No `RoundManager` or result feedback loop. |

---

## 3. PROPOSED ARCHITECTURE

### 3.1 New Services / Modules

```
server/
├── disputeStrategy/
│   ├── roundManager.ts          # Master: allocates accounts to R1/R2/R3, updates after results
│   ├── disputeScorer.ts         # Scores each account (severity 3–10), assigns round
│   ├── round1Detector.ts        # Internal logic errors only
│   ├── round2Detector.ts        # Internal conflicts within bureau
│   ├── round3Detector.ts        # Cross-bureau + escalation
│   └── duplicateFinder.ts       # Same creditor + open date + balance
├── letterTemplates/
│   ├── round1/                  # Short, one-error templates (1A–1F)
│   ├── round2/                  # Internal conflict + furnisher challenge (2A–2C)
│   └── round3/                  # Final + CFPB + pre-litigation (3A–3C)
└── (existing: conflictDetector, letterGenerator, etc. — refactor to use new flow)
```

### 3.2 Data Flow

```
Credit Reports (3 bureaus)
        ↓
   Parse & Extract
   (creditReportParser, existing)
        ↓
   negativeAccounts + rawData
        ↓
   disputeScorer
   - Round 1 checks (internal logic)
   - Round 2 checks (internal conflict)
   - Round 3 checks (cross-bureau)
        ↓
   roundManager.allocateAllRounds()
   - Round 1: top 3–5 (severity ≥ 8)
   - Round 2: next 3–5 (severity 6–7)
   - Round 3: remaining (severity 4–5)
        ↓
   User generates Round 1 letters
        ↓
   [30 days, user uploads responses]
        ↓
   roundManager.updateAfterRound1Results()
   - Deleted → done
   - Verified (high severity) → add to Round 2 escalations (furnisher)
   - Verified (low severity) → add to Round 3 CFPB prep
        ↓
   Round 2: new disputes + furnisher challenges
        ↓
   [30 days]
        ↓
   Round 3: final disputes + CFPB complaints
```

---

## 4. DETAILED IMPLEMENTATION PHASES

### PHASE 1: Dispute Scoring & Round Allocation

**Goal:** Replace/adjust aiSelectionService with disputeScorer + roundManager.

#### 4.1.1 disputeScorer.ts

- **Input:** All negative accounts for user (from DB, with rawData/transunionData/equifaxData/experianData).
- **Output:** For each account:
  - `severity`: 3–10 (10 = impossible timeline, 9 = math error, 8 = duplicates, 7 = unverifiable balance, etc.)
  - `round`: 1, 2, or 3
  - `errorTypes`: e.g. `['IMPOSSIBLE_TIMELINE']`, `['UNVERIFIABLE_BALANCE']`
  - `letterTemplate`: e.g. `'impossible_date'`, `'no_payment_history'`

**Scoring logic (aligned with framework):**

| Error Type | Detection | Severity | Round |
|------------|-----------|----------|-------|
| Impossible timeline | last_activity < date_opened | 10 | 1 |
| Math error | balance > high_balance | 9 | 1 |
| Duplicates | same creditor + open date + balance | 8 | 1 |
| Unverifiable balance | balance > 0 AND payment_history == null | 7 | 1 |
| Date opened = date closed | date_opened == date_closed | 7 | 1 |
| Internal status conflict | summary_status ≠ detail_status | 6 | 2 |
| Re-aging | last_activity > charge_off_date + 30d | 6 | 2 |
| Account number conflict | same account, different numbers across bureaus | 6 | 2 |
| Cross-bureau status mismatch | status differs across bureaus | 5 | 3 |
| Cross-bureau balance conflict | balance differs across bureaus | 5 | 3 |

**Schema/parsing:** Ensure `rawData` includes `paymentHistory`, `highBalance`, `chargeOffDate` from parser. If missing, extend creditReportParser extraction.

#### 4.1.2 roundManager.ts

- `allocateAllRounds(userId)`: Scores all accounts, returns:
  - `round1`: top 3–5 (severity ≥ 8)
  - `round2`: next 3–5 (severity 6–7)
  - `round3`: remaining (severity 4–5)
- `updateAfterRound1Results(userId, results)`: For each Round 1 account:
  - DELETED → skip
  - VERIFIED + severity ≥ 8 → add to round2Escalations (furnisher challenge)
  - VERIFIED + severity < 6 → add to round3CfpbPrep
  - NO_RESPONSE → add to round2Escalations (bureau violation)
- `getRound2Targets(userId)`: round2NewDisputes + round2Escalations (max 5 total).
- `getRound3Targets(userId)`: round3NewDisputes + cfpbTargets.

#### 4.1.3 duplicateFinder.ts

- Group accounts by: normalized creditor name + dateOpened + balance.
- If group size > 1 → treat as duplicate group, severity 8, round 1.
- Count duplicate group as 1 “dispute” for round limits.

---

### PHASE 2: Round 1 Letter Generation

**Goal:** Short, one-error-per-letter bureau letters for Round 1.

#### 4.2.1 Letter templates (Round 1)

Implement as string templates or structured prompts:

- **1A – Impossible timeline**
- **1B – Duplicate reporting**
- **1C – Unverifiable balance**
- **1D – Math error**
- **1E – Internal date conflict**
- **1F – Re-aging**

Template structure (from framework):

- Short (1 page)
- One error per letter
- No cross-bureau
- FCRA § 1681i(a)(5)(A)
- “Delete this account”

#### 4.2.2 Integration with generate mutation

- When user selects accounts for Round 1:
  - Use roundManager.getRound1Targets() or user selection filtered by round 1.
  - For each account + bureau: pick template by error type.
  - Fill template with account data (name, number, dates, balance).
  - Post-process (add headers, signature block) via letterPostProcessor.
- **One letter per account per bureau** (or per dispute group for duplicates), not one letter with many accounts.

#### 4.2.3 AI vs template

- **Option A:** Pure templates (fast, deterministic).
- **Option B:** AI fills template from account data (flexible, more tokens).
- **Recommendation:** Start with Option A; add AI polish later if needed.

---

### PHASE 3: Round 2 Logic

**Goal:** New disputes (next tier) + furnisher escalation for Round 1 failures.

#### 4.3.1 Round 2A – New bureau disputes

- Use roundManager.getRound2Targets() for new disputes (severity 6–7).
- Letter format: internal conflict focus (Template 2A style).
- No cross-bureau in letter.

#### 4.3.2 Round 2B – Furnisher challenge letters

- For each Round 1 verified (or no-response) account with severity ≥ 8:
  - **2B-1:** Debt validation demand (general)
  - **2B-2:** Furnisher challenge for verified errors (specific)
  - **2B-3:** Duplicate account challenge
- New letterType or recipient: `furnisher` (schema already supports `bureau: furnisher`).
- Need furnisher name/address — from account metadata or lookup.

#### 4.3.3 Round 2C – Bureau follow-up

- If bureau “verified” but error still present: Template 2C (inadequate investigation).
- Used when user re-disputes same account in Round 2 to bureau.

---

### PHASE 4: Round 3 Logic

**Goal:** Final disputes + CFPB + pre-litigation.

#### 4.4.1 Round 3A – Final bureau disputes

- Use roundManager.getRound3Targets() for remaining accounts.
- Can use generic dispute format (Template 3A).

#### 4.4.2 Round 3B – CFPB complaints

- **3B-1:** Against furnisher
- **3B-2:** Against bureau
- **3B-3:** Multiple failures
- Output: structured text for CFPB form (user copies or we generate PDF).
- Store as disputeLetter with letterType `cfpb`.

#### 4.4.3 Round 3C – Pre-litigation demands

- **3C-1:** Final demand to furnisher
- **3C-2:** Final demand to bureau
- 10-day deadline, mention statutory damages.

---

### PHASE 5: Conflict Detector Refactor

**Goal:** Keep conflictDetector methods but tag them by round.

#### 5.1 Add round tag to each detection method

- `impossible_timeline`, `unverifiable_balance`, `duplicate` → round 1
- `re-aging`, `internal_status_conflict`, `account_number_conflict` → round 2
- Cross-bureau methods → round 3

#### 5.2 DisputeScorer uses conflictDetector

- disputeScorer calls conflictDetector.detectConflicts().
- Filters conflicts by round.
- Maps conflict type → severity → round.

---

### PHASE 6: UI Updates

**Goal:** Expose round strategy to user.

#### 6.1 Dispute Manager / Letter generation

- Show round (1, 2, 3) and recommended accounts per round.
- “Round 1 – High probability (3–5 accounts)”
- “Round 2 – Next tier + furnisher escalations”
- “Round 3 – Final + CFPB”
- Limit selection to 3–5 per round.

#### 6.2 Results capture

- After 30 days, user marks: deleted / verified / no response per account.
- roundManager.updateAfterRound1Results() uses this to build Round 2.

#### 6.3 CFPB / furnisher flow

- UI to generate CFPB complaint text.
- UI to generate furnisher letters (with address lookup if needed).

---

## 5. SCHEMA CHANGES (if needed)

| Table | Change |
|-------|--------|
| `negative_accounts` | Ensure rawData/parser extracts `paymentHistory`, `highBalance`, `chargeOffDate`. May already be in rawData. |
| `dispute_letters` | Already has `round`, `letterType`. Add `disputeRoundId` if we want to link to dispute_rounds. |
| `dispute_rounds` | Already exists. Ensure it tracks round number, status, results. |
| New: `dispute_results`? | Optional: store per-account result (deleted/verified/no_response) for Round 1 → 2 logic. |

---

## 6. MIGRATION / BACKWARDS COMPATIBILITY

- Existing letters and rounds remain valid.
- New flow applies to new dispute rounds only.
- If no Round 1 results exist, Round 2 falls back to “next tier” only (no escalations).

---

## 7. TESTING STRATEGY

1. **Unit tests**
   - disputeScorer: given accounts with specific errors, assert severity and round.
   - roundManager: given scored accounts, assert allocation.
   - duplicateFinder: given duplicate accounts, assert grouping.
2. **Integration**
   - End-to-end: parse report → score → allocate → generate Round 1 letters.
3. **Letter output**
   - Spot-check Round 1 letters: short, one error, no cross-bureau.

---

## 8. IMPLEMENTATION ORDER

| Order | Phase | Deliverable |
|-------|-------|-------------|
| 1 | Phase 1.1 | disputeScorer.ts with round 1/2/3 detection logic |
| 2 | Phase 1.2 | roundManager.ts (allocate, update after results) |
| 3 | Phase 1.3 | duplicateFinder.ts |
| 4 | Phase 2 | Round 1 letter templates + integration |
| 5 | Phase 5 | Conflict detector tagging by round |
| 6 | Phase 3 | Round 2 letters (new + furnisher) |
| 7 | Phase 4 | Round 3 letters (final + CFPB) |
| 8 | Phase 6 | UI updates |

---

## 9. OPEN QUESTIONS

1. **MAX_ITEMS_PER_ROUND:** Confirm 3–5 (framework) vs 20 (APPROVED_CHANGES_LOG).
2. **Furnisher address:** Source for collector/creditor addresses?
3. **Result capture:** Manual by user or automatic from response parsing?
4. **Letter storage:** One letter per account per bureau vs one letter per bureau with multiple accounts?

---

## 10. APPROVAL CHECKLIST

- [ ] Round 1 = internal errors only, no cross-bureau — **confirmed**
- [ ] Round 2 = internal conflicts + furnisher escalation — **confirmed**
- [ ] Round 3 = cross-bureau + CFPB — **confirmed**
- [ ] Max 3–5 accounts per round — **confirmed**
- [ ] Short, one-error Round 1 letters — **confirmed**
- [ ] All 18 letter templates implemented — **confirmed**
- [ ] Result-driven Round 2/3 allocation — **confirmed**

---

## 11. LEGACY CODE HANDLING PLAN (Avoid Confusion)

**Problem:** The old implementation did not work well. We must clearly define what gets **removed**, **replaced**, or **kept** so there is no confusion or conflicting logic.

### 11.1 DELETE — Remove Entirely

| File / Code | Reason |
|-------------|--------|
| `server/aiSelectionService.ts` | Wrong strategy (cross-bureau first). Replaced by `disputeScorer.ts` + `roundManager.ts`. |
| `server/aiSelectionService.ts` — `selectItemsForRound`, `saveRecommendations`, `getRecommendations` | All selection logic replaced by roundManager. |

**Callers to update before delete:**
- `server/routesV2.ts` — uses `getRecommendations`. Switch to `roundManager.getRound1Targets()` (or equivalent).
- Any other import of `aiSelectionService` — remove and wire to new modules.

### 11.2 REPLACE — Swap Old for New

| Old | New | Action |
|-----|-----|--------|
| `LETTER_GENERATION_SYSTEM_PROMPT` in `routers.ts` | New round-specific prompts + templates | Replace the prompt used for Round 1 letter generation. Round 1 uses short templates, not multi-angle AI. |
| `buildLetterPrompt()` in `routers.ts` | New `letterTemplates/round1/*` + fill functions | Replace. Round 1: template-based. Round 2/3: can keep AI but with round-specific prompts. |
| Letter generation flow in `disputeLetters.generate` mutation | New flow: disputeScorer → roundManager → template picker → fill | Replace the logic. Keep the mutation endpoint; change internals. |

### 11.3 KEEP — Do Not Remove

| Component | Why Keep |
|-----------|----------|
| `server/conflictDetector.ts` | Detection logic is valuable. We **tag** methods by round and **filter** by round — we do NOT delete. |
| `server/letterPostProcessor.ts` | Still needed for headers, signature block, placeholder replacement. |
| `server/roundLockingService.ts` | 30-day lock and tier limits stay. |
| `drizzle/schema.ts` — `negativeAccounts`, `disputeLetters`, `disputeRounds` | Schema stays. No destructive schema changes. |
| `server/creditReportParser.ts` | Parsing stays. We may extend extraction (paymentHistory, etc.). |
| `server/letterTemplates.ts` (43 methods) | Keep for reference. New round templates (1A–3C) are separate. We may map method numbers to round later. |

### 11.4 DEPRECATE — Keep but Mark Unused

| Code | Action |
|------|--------|
| `server/letterGenerator.ts` — `generateDisputeLetter()` | Used by some paths. After new flow is wired, **deprecate** and add `@deprecated` + comment: "Use disputeStrategy round-specific generation." Remove when all callers use new flow. |
| Old `buildLetterPrompt` signature/behavior | Once replaced, mark deprecated. |

### 11.5 CONCRETE REMOVAL STEPS (Per Phase)

**Phase 1 (disputeScorer + roundManager):**
1. Create `server/disputeStrategy/roundManager.ts` and `disputeScorer.ts`.
2. Update `routesV2.ts` (and any caller) to use `roundManager` instead of `getRecommendations`.
3. **Delete** `server/aiSelectionService.ts` after all references are updated.
4. Remove any `aiRecommendations` DB usage if that table exists and is only used by aiSelectionService.

**Phase 2 (Round 1 letters):**
1. Create `server/disputeStrategy/letterTemplates/round1/` with templates 1A–1F.
2. In `routers.ts` `disputeLetters.generate`:
   - Replace use of `LETTER_GENERATION_SYSTEM_PROMPT` for Round 1 with template fill.
   - Replace `buildLetterPrompt()` for Round 1 with template-based generation.
3. Do **not** delete `LETTER_GENERATION_SYSTEM_PROMPT` yet — keep for Round 2/3 AI letters. Only Round 1 uses templates.

**Phase 5 (conflictDetector):**
1. Add `round: 1 | 2 | 3` (or similar) to each conflict type / detection function.
2. disputeScorer calls `detectConflicts()` and filters by round.
3. **No deletion** of conflictDetector — only extension.

### 11.6 NO CONFLICT RULE

- **One source of truth** for "what to dispute this round": `roundManager`.
- **One source of truth** for Round 1 letter content: `letterTemplates/round1/*`.
- **No parallel logic** — remove aiSelectionService so there is no competing recommendation engine.

### 11.7 FILES TOUCHED (Summary)

| Action | Files |
|--------|-------|
| **DELETE** | `server/aiSelectionService.ts` |
| **CREATE** | `server/disputeStrategy/roundManager.ts`, `disputeScorer.ts`, `duplicateFinder.ts`, `letterTemplates/round1/*` |
| **REPLACE INTERNALS** | `server/routers.ts` (generate mutation, buildLetterPrompt), `server/routesV2.ts` (getRecommendations → roundManager) |
| **EXTEND** | `server/conflictDetector.ts` (add round tags) |
| **KEEP AS-IS** | `roundLockingService`, `letterPostProcessor`, schema, creditReportParser |

---

**Next step:** Review this plan. Once approved, implementation will proceed in the order above.
