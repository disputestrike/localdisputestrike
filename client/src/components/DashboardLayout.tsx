/**
 * Dashboard Layout (Blueprint §4 & §6)
 * 
 * Features:
 * - 13 Sidebar Pages organized by category
 * - Tier-based visibility (Mailing Tracker only for Complete tier)
 * - Global Header: User Profile, Settings, Sign Out
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  History, 
  Truck, 
  TrendingUp, 
  Search, 
  Scale, 
  Gavel, 
  LineChart, 
  ShoppingBag, 
  GraduationCap, 
  Bot,
  User,
  Settings,
  LogOut,
  Bell,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const isCompleteTier = profile?.subscriptionTier === 'complete';

  const navSections = [
    {
      title: "Mission Control",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Live Report", href: "/dashboard/report", icon: ShieldCheck },
        { name: "Dispute Manager", href: "/dashboard/dispute-manager", icon: FileText },
        { name: "Letters", href: "/dashboard/letters", icon: History },
      ]
    },
    {
      title: "Tracking & Results",
      items: [
        // Blueprint §4: Mailing Tracker ONLY for Complete tier
        ...(isCompleteTier ? [{ name: "Mailing Tracker", href: "/dashboard/mailing-tracker", icon: Truck }] : []),
        { name: "Score Tracker", href: "/dashboard/score-tracker", icon: TrendingUp },
      ]
    },
    {
      title: "Advanced Tactics",
      items: [
        { name: "Inquiry Removal", href: "/dashboard/inquiries", icon: Search },
        { name: "Debt Validation", href: "/dashboard/debt-validation", icon: Scale },
        { name: "CFPB Complaints", href: "/dashboard/cfpb", icon: Gavel },
      ]
    },
    {
      title: "Credit Building",
      items: [
        { name: "Score Simulator", href: "/dashboard/simulator", icon: LineChart },
        { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
      ]
    },
    {
      title: "More",
      items: [
        { name: "Credit Education", href: "/dashboard/education", icon: GraduationCap },
        { name: "AI Assistant", href: "/dashboard/ai-assistant", icon: Bot },
      ]
    }
  ];

  const handleLogout = async () => {
    await utils.auth.logout.mutateAsync();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b">
          <Link href="/dashboard">
            <a className="flex items-center gap-2">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8" />
              <span className="font-black text-xl tracking-tighter uppercase">DisputeStrike</span>
            </a>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <a className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                      location === item.href 
                        ? "bg-orange-50 text-orange-600" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}>
                      <item.icon className={cn("w-4 h-4", location === item.href ? "text-orange-600" : "text-gray-400")} />
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* GLOBAL HEADER (Blueprint §6) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 hidden lg:block">
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Bell className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 hidden sm:inline-block">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" /> Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
