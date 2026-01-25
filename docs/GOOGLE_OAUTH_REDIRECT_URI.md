# Fix "Error 400: redirect_uri_mismatch" – Google OAuth

When you see **"Error 400: redirect_uri_mismatch"** on "Continue with Google", the `redirect_uri` we send does **not** exactly match any **Authorized redirect URI** in your Google Cloud OAuth client. Fix it by adding the **exact** URI below.

---

## 1. Exact redirect URI to add

**Add this exact string** (no trailing slash, same scheme/host/port):

```
http://localhost:3000/api/auth/google/callback
```

If your app runs on a **different port** (e.g. 3000), use that port:

```
http://localhost:3000/api/auth/google/callback
```

**Check what we send:**  
Open **`http://localhost:3000/api/auth/google/redirect-uri`** (or your app origin + `/api/auth/google/redirect-uri`). The JSON `redirectUri` is the exact value we use. Add **that** to Google Console.

---

## 2. Where to add it in Google Cloud Console

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)** → your project.
2. **APIs & Services** → **[Credentials](https://console.cloud.google.com/apis/credentials)**.
3. Under **OAuth 2.0 Client IDs**, open your **Web application** client (or create one).
4. In **Authorized redirect URIs**, click **ADD URI**.
5. Paste:  
   `http://localhost:3000/api/auth/google/callback`  
   (or the `redirectUri` from `/api/auth/google/redirect-uri`).
6. **Save**.

---

## 3. Rules (from Google)

- **Exact match:** scheme, host, port, path must match. No trailing slash unless we send it.
- **Localhost:** `http://localhost` is allowed; we use `http://localhost:3000` (or your port).
- **Production:** use `https://yourdomain.com/api/auth/google/callback` and add that too if you use that origin.

---

## 4. Related developer documentation

- **[Using OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)** – redirect URI, `redirect_uri_mismatch`, etc.
- **[Manage OAuth Clients](https://support.google.com/cloud/answer/15549257)** – create clients, set redirect URIs.
- **[Setting up OAuth 2.0](https://support.google.com/googleapi/answer/6158849)** – overall setup.

---

## 5. Optional: force a specific redirect URI

Set in `.env`:

```env
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Use the **exact** same value in **Authorized redirect URIs** in Google Console.
