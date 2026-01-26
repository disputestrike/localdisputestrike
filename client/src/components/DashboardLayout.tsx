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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/dashboard">
            <a className="flex items-center gap-2">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8" />
              <span className="font-bold text-xl">DisputeStrike</span>
            </a>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner" 
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}>
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.subscriptionTier || 'Essential'} Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 hidden lg:block">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Secure Environment Active
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </Button>
            
            <div className="h-6 w-[1px] bg-slate-200" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">{user?.name || 'Account'}</span>
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

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
