import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

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

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const handleGoogleSignIn = () => {
    setIsOpen(false);
    window.location.href = '/api/auth/google?redirect=/get-reports';
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:text-orange-600 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="container py-6 space-y-4">
            {isAuthenticated && user && (
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/features"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              Features
            </Link>
            
            <Link
              href="/how-it-works"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              How It Works
            </Link>
            
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              Pricing
            </Link>
            
            <Link
              href="/faq"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              FAQ
            </Link>
            
            <Link
              href="/money-back-guarantee"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              Money Back Guarantee
            </Link>
            
            <Link
              href="/agency-pricing"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Become a Merchant
            </Link>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isAuthenticated ? (
                <>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </>
              ) : (
                <>
                  {/* Google Sign In Button */}
                  <Button
                    variant="outline"
                    className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon />
                    <span className="ml-2">Continue with Google</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>Login with Email</Link>
                  </Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                    <Link href="/pricing" onClick={() => setIsOpen(false)}>
                      View Pricing
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50" asChild>
                    <Link href="/start" onClick={() => setIsOpen(false)}>
                      Start Free Analysis
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
