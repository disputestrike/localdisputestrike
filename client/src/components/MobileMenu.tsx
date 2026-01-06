import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

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

            <Link href="/features">
              <a
                onClick={() => setIsOpen(false)}
                className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Features
              </a>
            </Link>
            
            <Link href="/how-it-works">
              <a
                onClick={() => setIsOpen(false)}
                className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                How It Works
              </a>
            </Link>
            
            <Link href="/pricing">
              <a
                onClick={() => setIsOpen(false)}
                className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Pricing
              </a>
            </Link>
            
            <Link href="/faq">
              <a
                onClick={() => setIsOpen(false)}
                className="block py-3 text-lg font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                FAQ
              </a>
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
                  <Button variant="outline" className="w-full" asChild>
                    <a href={getLoginUrl()}>Login</a>
                  </Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                    <Link href="/quiz" onClick={() => setIsOpen(false)}>
                      Get Started Free
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
