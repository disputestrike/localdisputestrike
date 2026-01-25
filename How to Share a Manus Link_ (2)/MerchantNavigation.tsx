import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, Building2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, getSignUpUrl } from "@/const";
import { Button } from "@/components/ui/button";

/**
 * MerchantNavigation - Navigation component specifically for the Agency/Merchant pages
 * 
 * This component handles the distinction between:
 * - Unauthenticated users: Shows "Merchant Login" and "Sign Up" buttons
 * - Authenticated merchants: Shows merchant dropdown with agency dashboard access
 * - Authenticated regular users: Shows option to become a merchant
 */
export function MerchantNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is already an agency/merchant
  const { data: agencyStatus } = trpc.agency.isAgency.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/agency-pricing";
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // If not authenticated, show Merchant Login and Sign Up buttons
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/agency-pricing#pricing">
          <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
            Sign Up
          </Button>
        </Link>
        <Link href="/login">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Merchant Login
          </Button>
        </Link>
      </div>
    );
  }

  // If authenticated but not a merchant, show option to become one
  if (!agencyStatus?.isAgency) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="font-medium text-gray-900">{user?.name || "User"}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="text-xs text-blue-600 mt-1">Regular User Account</p>
            </div>
            
            <div className="px-4 py-2 text-xs text-gray-500">
              Select a plan below to become a merchant
            </div>
            
            <Link href="/dashboard">
              <a className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">User Dashboard</span>
              </a>
            </Link>
            
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If authenticated and is a merchant, show merchant dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="font-medium text-gray-900">{agencyStatus.agencyName || user?.name || "Merchant"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{agencyStatus.agencyName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-orange-600 mt-1 capitalize">{agencyStatus.planTier} Plan</p>
          </div>
          
          <Link href="/agency">
            <a className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-700">Agency Dashboard</span>
            </a>
          </Link>
          
          <Link href="/settings">
            <a className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Settings</span>
            </a>
          </Link>
          
          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
