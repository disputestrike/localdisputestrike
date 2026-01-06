import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="font-medium text-gray-900">{user?.name || "User"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          
          <Link href="/dashboard">
            <a className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Dashboard</span>
            </a>
          </Link>
          
          <Link href="/dashboard">
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
