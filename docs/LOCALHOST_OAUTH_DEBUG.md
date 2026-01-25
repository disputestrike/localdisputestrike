# Debugging Google OAuth on Localhost

If Google sign-in isn't working on localhost, follow these steps:

## 1. Check What Redirect URI Your App Is Using

Visit this URL in your browser (use the same port you're accessing the app on):

```
http://localhost:3000/api/auth/google/redirect-uri
```

This will show you the **exact** redirect URI your app is generating. Copy this value.

## 2. Add It to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **[Credentials](https://console.cloud.google.com/apis/credentials)**
3. Click on your **OAuth 2.0 Client ID** (Web application)
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Paste the exact URI from step 1 (should be something like `http://localhost:3000/api/auth/google/callback`)
6. Click **SAVE**

**Important:** 
- The URI must match **exactly** (no trailing slash, same port, same scheme)
- Changes can take 5 minutes to a few hours to take effect

## 3. Check Server Logs

When you click "Continue with Google", check your server console. You should see logs like:

```
[Auth] Base URL: http://localhost:3000 from headers: { host: 'localhost:3000', ... }
[Auth] Google OAuth redirect_uri: http://localhost:3000/api/auth/google/callback
[Auth] Redirecting to Google: https://accounts.google.com/o/oauth2/v2/auth?...
```

If the redirect_uri doesn't match what you added in Google Console, that's the problem.

## 4. Force a Specific Redirect URI (Optional)

If you want to force a specific redirect URI regardless of the request, set this in your `.env` file:

```env
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Then restart your server.

## 5. Common Issues

### Port Mismatch
- **Problem:** App runs on port 3000, but redirect URI uses a different port
- **Fix:** Make sure you're accessing the app on the same port you added in Google Console

### 127.0.0.1 vs localhost
- **Problem:** Google treats `http://127.0.0.1:3000` and `http://localhost:3000` as different
- **Fix:** The code automatically normalizes `127.0.0.1` to `localhost`. Always use `localhost` in Google Console.

### Server Not Running
- **Problem:** Can't access `/api/auth/google/redirect-uri`
- **Fix:** Make sure your dev server is running (`pnpm dev`)

### Error Messages
- **"redirect_uri_mismatch"**: The URI in Google Console doesn't match what your app sends
- **"An error occurred during Google sign-in"**: Check server logs for the actual error (in development, the error message is shown on the login page)

## 6. Test the Flow

1. Visit `http://localhost:3000/login`
2. Click "Continue with Google"
3. You should be redirected to Google's consent screen
4. After approving, you should be redirected back to your app

If you see an error, check:
- Server console logs
- The error message on the login page (in development)
- That the redirect URI in Google Console matches exactly what `/api/auth/google/redirect-uri` shows
