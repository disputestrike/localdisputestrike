export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Custom authentication URLs (for self-hosting without Manus OAuth)
export const getLoginUrl = () => {
  return "/login";
};

export const getSignUpUrl = () => {
  return "/register";
};

export const getLogoutUrl = () => {
  return "/api/auth/logout";
};

// Legacy Manus OAuth URLs (kept for reference, not used)
export const getLegacyOAuthLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
