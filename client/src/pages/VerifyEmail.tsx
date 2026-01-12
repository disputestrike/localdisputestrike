import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setError("Invalid verification link");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        } else {
          setError(data.message || "Verification failed");
        }
      } catch (err) {
        setError("An error occurred during verification");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 cursor-pointer">
              <img src="/logo.png" alt="DisputeStrike" className="h-12 w-12" />
              <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
            </div>
          </Link>
        </div>

        <Card className="bg-white border-gray-200 shadow-lg">
          {isLoading ? (
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Verifying your email...</p>
            </CardContent>
          ) : success ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Email Verified!</CardTitle>
                <CardDescription className="text-gray-600">
                  Your email has been successfully verified.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Redirecting you to your dashboard...
                </p>
                <Link href="/dashboard">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Verification Failed</CardTitle>
                <CardDescription className="text-gray-600">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 text-sm">
                  The verification link may have expired or is invalid.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Go to Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
