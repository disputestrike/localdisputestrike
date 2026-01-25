# Free Preview Analysis – Code & Flow

This doc describes **exactly** what runs for "Upload Your Reports" → "Start FREE AI Analysis" and where the "Could not extract accounts" error comes from.

---

## Endpoint

- **`POST /api/credit-reports/upload-and-analyze`**
- **Handler:** `server/affiliateAndPreviewRouter.ts` (router `post('/credit-reports/upload-and-analyze', ...)`)

---

## 1. Upload & text extraction

**Code:** `affiliateAndPreviewRouter.ts` (upload loop) → `server/_core/services/pdfParsingService.ts`.

- **Multer** reads FormData fields `transunion`, `equifax`, `experian` (one file each, max 50MB).
- For each file:
  - **HTML:** use `file.buffer.toString('utf8')` → append to `combinedText`.
  - **PDF:** call **`extractTextFromPDFBuffer(file.buffer)`** from `pdfParsingService`. If non‑empty, append to `combinedText`.
- PDFs are also pushed to `fallbackCandidates` (used only when we have **no** text).

**PDF parsing service** (`server/_core/services/pdfParsingService.ts`):

- **Dual extractor** (per Source Bible §5): **`pdf-parse`** first, then **`pdfjs-dist`** (Mozilla PDF.js) if little or no text.
- Returns whichever yields more. Uses **buffers** (multer memory storage); no file paths.
- `extractTextFromPDFBuffer(buffer)` → tries `pdf-parse`, then `pdfjs-dist` when needed.

```ts
import { extractTextFromPDFBuffer } from './_core/services/pdfParsingService';
// ...
const text = await extractTextFromPDFBuffer(file.buffer);
if (text) combinedText += `\n\n--- ${key} ---\n\n` + text;
```

- **Libraries:** `pdf-parse`, `pdfjs-dist`. No page limit; we read all pages.

---

## 2. Two analysis paths

### A. Text path (when **any** PDF/HTML yielded text)

**Code:** `affiliateAndPreviewRouter.ts` 184–196 → `server/previewAnalysisService.ts`.

1. **`runPreviewAnalysis(trimmedText)`** in `previewAnalysisService.ts`:
   - If **no** `ANTHROPIC_API_KEY` **and** no `OPENAI_API_KEY`: use **`keywordPreviewFallback(reportText)`** (regex on keywords: `late`, `collection`, `inquiry`, `bankruptcy`, etc.).
   - Otherwise: call **OpenAI** or **Anthropic** with `PREVIEW_SYSTEM_PROMPT`, truncated report text (15k chars), and a JSON schema for counts. Model gpt-4.1-nano or similar.
2. **`toLightAnalysisResult(preview)`** maps the result to `LightAnalysisResult` (totalViolations, severityBreakdown, categoryBreakdown).
3. Return **200** + that JSON.

**Libraries:** `openai`, `@anthropic-ai/sdk`, or in-house keyword regex.

---

### B. Vision path (when **no** text from any file → image‑only PDFs)

**Code:** `affiliateAndPreviewRouter.ts` 154–178 → `server/creditReportParser.ts`.

1. Pick the **largest** PDF from `fallbackCandidates`.
2. **`fileStorage.saveFile(previewKey, buffer, mime)`** (`server/s3Provider.ts`): writes to disk (local `data/uploads` or Railway `/data`), returns **`fileUrl`** = `BASE_URL + /api/files/{key}`. Locally that is `http://localhost:3001/api/files/...`.
3. **`performLightAnalysis(fileUrl)`** in `creditReportParser.ts`:
   - Calls **`parseWithVisionAICombined(fileUrl)`**.
   - That uses **`invokeLLM`** (`server/_core/llm.ts`) with `file_url: { url: fileUrl, mime_type: 'application/pdf' }`. The LLM (**Manus Forge** / `forge.manus.im`) **fetches** that URL.
4. **Local:** `fileUrl` is `http://localhost:3001/...`. Forge runs in the cloud and **cannot** fetch localhost → request fails → Vision returns no accounts.
5. **`performLightAnalysis`** throws **`"No accounts extracted from report"`** if `parseWithVisionAICombined` returns an empty list (see `creditReportParser.ts` around 370–372).
6. The router catches that, checks `msg.includes('No accounts extracted')`, and returns **422** with  
   **`"Could not extract accounts from this report. Try a different file or use PDFs with selectable text."`**

**Libraries:** `invokeLLM` → Manus Forge API (file_url). No OpenAI Vision / Anthropic Vision in this path.

---

## 3. Summary

| What | Where |
|------|--------|
| PDF text extraction | `pdfParsingService.ts`: `pdf-parse` + `pdfjs-dist` (dual extractor) |
| Text-based preview | `previewAnalysisService.ts`: `runPreviewAnalysis` (OpenAI/Anthropic or `keywordPreviewFallback`) |
| Image‑only / Vision | `creditReportParser.ts`: `performLightAnalysis` → `parseWithVisionAICombined` → `invokeLLM` (Forge `file_url`) |
| “Could not extract accounts” | 422 from Vision path when Forge returns no accounts (e.g. localhost URL unreachable) |

---

## 4. Why it fails locally for image‑only PDFs

- Vision sends **`fileUrl`** (e.g. `http://localhost:3001/api/files/...`) to Forge.
- Forge **must fetch** that URL. It cannot reach **localhost**.
- Result: no accounts → `"No accounts extracted"` → **422** with that message.

**Fix for local:** Use **PDFs with selectable text** so we use the **text path**.  
**Fix for image‑only:** Deploy to **Railway** (or any public host) so `BASE_URL` is public and Forge can fetch the file.

---

## 5. Code you can grep

| Thing | File | Grep |
|-------|------|------|
| PDF text extraction | `server/_core/services/pdfParsingService.ts` | `extractTextFromPDFBuffer`, `pdf-parse`, `pdfjs-dist` |
| Upload + text vs Vision | `server/affiliateAndPreviewRouter.ts` | `upload-and-analyze`, `extractTextFromPDFBuffer`, `performLightAnalysis`, `runPreviewAnalysis` |
| Text analysis (AI or keyword) | `server/previewAnalysisService.ts` | `runPreviewAnalysis`, `keywordPreviewFallback` |
| Vision (Forge file_url) | `server/creditReportParser.ts` | `performLightAnalysis`, `parseWithVisionAICombined`, `invokeLLM` |
| LLM / Forge | `server/_core/llm.ts` | `invokeLLM`, `file_url` |
| Storage / file URL | `server/s3Provider.ts` | `saveFile`, `BASE_URL` |
