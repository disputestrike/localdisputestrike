
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
  Menu,
  Zap,
  ChevronRight
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
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#002b5c] text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-20">
        <div className="p-8 mb-4">
          <Link href="/dashboard">
            <a className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase leading-none">DisputeStrike</span>
                <span className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em] mt-1">Professional AI</span>
              </div>
            </a>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-8 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-4 px-4">
                {section.title}
              </h4>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all group",
                        isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                          : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                      )}>
                        <div className="flex items-center gap-3">
                          <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-blue-100/40 group-hover:text-blue-200")} />
                          {item.name}
                        </div>
                        {isActive && <ChevronRight className="w-3 h-3 text-white/50" />}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 mt-auto bg-black/10 border-t border-white/5">
          <div className="flex items-center gap-4 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#002b5c] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-tight">{user?.name || 'User'}</p>
              <p className="text-[9px] text-blue-300/60 truncate font-bold uppercase tracking-wider">{profile?.subscriptionTier || 'Essential'} Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* GLOBAL HEADER (Blueprint §6) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
          <div className="flex items-center lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50">
              <Menu className="w-6 h-6 text-slate-600" />
            </Button>
          </div>

          <div className="flex-1 hidden lg:block">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Secure Environment Active
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </Button>
            
            <div className="h-8 w-[1px] bg-slate-100" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{user?.name || 'Account'}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Settings</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-slate-200 transition-all">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Account Management</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem className="rounded-xl cursor-pointer py-3 px-3 hover:bg-slate-50 focus:bg-slate-50">
                  <User className="w-4 h-4 mr-3 text-slate-400" /> 
                  <span className="text-xs font-bold text-slate-700">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer py-3 px-3 hover:bg-slate-50 focus:bg-slate-50">
                  <Settings className="w-4 h-4 mr-3 text-slate-400" /> 
                  <span className="text-xs font-bold text-slate-700">Subscription Plan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem className="text-red-600 rounded-xl cursor-pointer py-3 px-3 hover:bg-red-50 focus:bg-red-50" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-3" /> 
                  <span className="text-xs font-bold">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
