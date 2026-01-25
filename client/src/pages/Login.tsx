import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectUriHint, setRedirectUriHint] = useState(
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth/google/callback`
      : "http://localhost:3001/api/auth/google/callback"
  );

  // Check for error in URL params (from Google OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      const decoded = decodeURIComponent(urlError);
      setError(decoded);
      window.history.replaceState({}, '', '/login');
    }
  }, []);
  const isRedirectMismatch = error?.toLowerCase().includes('redirect_uri_mismatch') ?? false;
  
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/google/redirect-uri", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.redirectUri) return;
        setRedirectUriHint(data.redirectUri);
      })
      .catch(() => {
        // Ignore - fallback is already set.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google?redirect=/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 cursor-pointer">
              <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-12 w-12" />
              <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
            </div>
          </Link>
        </div>

        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-600 space-y-2">
                    <span>{error}</span>
                    {isRedirectMismatch && (
                      <>
                        <span className="block mt-2 font-medium">Fix: Add this exact URI in Google Cloud Console:</span>
                        <code className="block mt-1 p-2 bg-red-100 rounded text-sm break-all">{redirectUriHint}</code>
                        <span className="block mt-2 text-sm">APIs & Services → Credentials → your OAuth client → Authorized redirect URIs. No trailing slash.</span>
                        <a href="https://developers.google.com/identity/protocols/oauth2/web-server" target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm underline">Related: Google OAuth 2.0 for Web Server Applications</a>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Link href="/forgot-password">
                    <span className="text-sm text-orange-600 hover:text-orange-500 cursor-pointer">
                      Forgot password?
                    </span>
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-orange-600 hover:text-orange-500 cursor-pointer font-medium">
                  Create one
                </span>
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms">
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Terms of Service</span>
          </Link>{" "}
          and{" "}
          <Link href="/privacy">
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Privacy Policy</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
