# Profile prefill – proof it works locally

## 1. Proof 1: Unit tests (no browser)

Run the prefill tests. These prove:

- **Preview analysis** extracts `consumerInfo` (name, address, DOB, SSN, phone) from report text.
- **getConsumerInfoFromReports** returns that data from stored report `parsedData` (when DB is available).

```bash
pnpm test server/previewAnalysisPrefill.test.ts
pnpm test server/creditReports.test.ts -- -t "getConsumerInfoFromReports"
```

Or run both in one go:

```bash
pnpm test server/previewAnalysisPrefill.test.ts server/creditReports.test.ts
```

Expected: **All tests pass.** You should see:

- `[Preview] Consumer info extracted for profile prefill`
- `✓ server/previewAnalysisPrefill.test.ts (2 tests)`
- `✓ getConsumerInfoFromReports returns prefill data from report parsedData (PROOF: prefill works)` (if DB is configured)

## 2. Proof 2: App in browser

Start the app and open the “Complete Your Profile” modal with prefill:

```bash
pnpm dev
```

Then:

1. Open **http://localhost:3001**
2. Sign in (or register).
3. **Option A – Prefill from stored preview**
   - Go to **Get Reports**, upload a credit report (PDF/HTML), wait for analysis.
   - Go to **Dashboard** and click **Generate Letters**.
   - The “Complete Your Profile” modal should open with fields **prefilled** from the report (name, address, city, state, ZIP, DOB, phone, SSN last 4 if present in the report).
4. **Option B – Prefill from DB**
   - After saving the analysis (or if you already have reports with consumer info), open the modal again; prefill comes from `getConsumerInfoFromReports` (saved report data).

You should see the green banner: **“Pre-filled from your credit report. Please confirm the information is correct…”** when any of those fields are filled.

## 3. What the tests prove

| Test | What it proves |
|------|----------------|
| `runPreviewAnalysis extracts consumerInfo...` | Report text → `consumerInfo` (fullName, address, city, state, zip, DOB, SSN last 4, phone) is extracted and returned. |
| `consumerInfo is used for letter address prefill` | Full letter address is built from address + city + state + ZIP. |
| `getConsumerInfoFromReports returns prefill data...` | Stored report `parsedData.consumerInfo` is returned by the API for the Dashboard/modal prefill. |
