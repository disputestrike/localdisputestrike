# Google OAuth Redirect URI Fix

## Issue
Error 400: redirect_uri_mismatch

The application is trying to use: `http://localhost:3000/api/auth/google/callback`

## Solution

You need to add this EXACT URI to Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID (Web client 1)
3. Under "Authorized redirect URIs", click "+ Add URI"
4. Add: `http://localhost:3000/api/auth/google/callback`
5. Click "Save"
6. Wait 5 minutes for changes to propagate

## Current Authorized URIs (from your screenshot):
- `http://localhost:5000/api/auth/google/callback` ✅
- `https://disputestrike.com/api/auth/google/callback` ✅
- `https://disputestrike-production.up.railway.app/api/auth/google/callback` ✅
- `https://www.disputestrike.com/api/auth/google/callback` ✅

## Missing URI:
- `http://localhost:3000/api/auth/google/callback` ❌ **ADD THIS ONE**

## Alternative: Use Environment Variable

If you want to force a specific redirect URI, set this in your `.env` file:

```
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

The code will use this value instead of auto-detecting from the request.
