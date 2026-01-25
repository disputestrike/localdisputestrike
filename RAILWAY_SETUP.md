# DisputeStrike – Railway Setup (no Manus)

All storage and file serving use **Railway disk only**. No `manus-upload-file` or CDN.

## 0. Test local first

1. Start dev server: **`pnpm dev`**
2. Run sanity checks: **`pnpm test:local`**  
   - Expect: 8/8 passed (health, SPA routes, upload validation, files 404).
3. **Google Sign-in (redirect_uri_mismatch):** In dev, set **`VITE_APP_URL=http://localhost:3001`** in `.env`. Add **exactly** `http://localhost:3001/api/auth/google/callback` to Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs. The app uses `VITE_APP_URL` as the redirect base in development so it stays in sync with Google.
4. In the browser: open **http://localhost:3001**, go to **Get reports** → upload a **text-based PDF** → **Start FREE AI Analysis**.  
   - Text PDFs use `runPreviewAnalysis` (OpenAI/Anthropic or keyword fallback).  
   - Image-only PDFs use Vision; Vision **fails locally** because the AI fetches `http://localhost/...`, which it can’t reach. Use text PDFs or deploy to Railway to test Vision.

## 1. Database (MySQL)

- Create a **MySQL** service in Railway (or use an existing one).
- Set **`DATABASE_URL`** in your app service (Railway often sets this when you link MySQL).
- Run migrations:
  ```bash
  pnpm db:migrate
  ```
  Or push schema:
  ```bash
  pnpm db:push
  ```

## 2. File storage (Volume)

- In your **app** service, add a **Volume**.
- Mount it at **`/data`**.
- Railway sets **`RAILWAY_VOLUME_MOUNT_PATH`** automatically when you add a volume.  
  If not, set it manually to **`/data`**.
- Files (preview PDFs, uploads) are stored under `/data` and served at **`/api/files/:key`**.

## 3. Required env vars

| Variable | Notes |
|----------|--------|
| **`DATABASE_URL`** | MySQL connection string (e.g. from Railway MySQL). |
| **`RAILWAY_PUBLIC_DOMAIN`** | Set by Railway for your app (e.g. `yourapp.up.railway.app`). Used for `BASE_URL` and `/api/files` URLs. |
| **`RAILWAY_VOLUME_MOUNT_PATH`** | Usually `/data`; set explicitly if Railway doesn’t set it. |
| **`JWT_SECRET`** | Random secret for auth (e.g. `openssl rand -hex 32`). |
| **`OPENAI_API_KEY`** or **`BUILT_IN_FORGE_API_KEY`** | For AI preview / Vision. |
| **`VITE_APP_URL`** | Public app URL (e.g. `https://yourapp.up.railway.app`) for emails, links. |

## 4. Deploy

- Use the **Dockerfile** (Railway detects it) or connect the repo and deploy.
- **`PORT`** is set by Railway; the app uses it automatically.
- Health check: **`GET /api/health`**.

## 5. Preview upload + Vision

- **Text PDFs**: Parsed with `pdf-parse` → `runPreviewAnalysis` (no storage).
- **Image-only PDFs**: Saved to the volume → **`/api/files/...`** → Vision AI uses that **public** URL (`https://<RAILWAY_PUBLIC_DOMAIN>/api/files/...`).  
  Vision works because the app is deployed and `BASE_URL` is public.
