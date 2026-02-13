import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  User,
  LayoutGrid,
  FileBarChart,
  Shield,
  Send,
  TrendingUp,
  Package,
  Crosshair,
  Scale,
  Building2,
  Calculator,
  ShoppingBag,
  BookOpen,
  Sparkles,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const SIDEBAR_STORAGE_KEY = "disputestrike-sidebar-collapsed";

const sidebarNav = [
  {
    title: "Mission Control",
    items: [
      { href: "/dashboard", title: "Dashboard", icon: LayoutGrid },
      { href: "/dashboard/report", title: "My Live Report", icon: FileBarChart },
      { href: "/dashboard/dispute-manager", title: "Dispute Manager", icon: Shield },
      { href: "/dashboard/letters", title: "Letters", icon: Send },
    ],
  },
  {
    title: "Tracking & Results",
    items: [
      { href: "/dashboard/score-tracker", title: "Score Tracker", icon: TrendingUp },
      { href: "/dashboard/mailing-tracker", title: "Mailing Tracker", icon: Package },
    ],
  },
  {
    title: "Advanced Tactics",
    items: [
      { href: "/dashboard/inquiries", title: "Inquiry Removal", icon: Crosshair },
      { href: "/dashboard/debt-validation", title: "Debt Validation", icon: Scale },
      { href: "/dashboard/cfpb", title: "CFPB Complaints", icon: Building2 },
    ],
  },
  {
    title: "Credit Building",
    items: [
      { href: "/dashboard/simulator", title: "Score Simulator", icon: Calculator },
      { href: "/dashboard/marketplace", title: "Marketplace", icon: ShoppingBag },
    ],
  },
  {
    title: "More",
    items: [
      { href: "/dashboard/education", title: "Credit Education", icon: BookOpen },
      { href: "/dashboard/ai-assistant", title: "AI Assistant", icon: Sparkles },
    ],
  },
];

function getInitialCollapsed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialCollapsed);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div
        className={cn(
          "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
          "md:grid-cols-[80px_1fr]",
          !sidebarCollapsed && "md:grid-cols-[260px_1fr]"
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex flex-col min-w-0">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Header with collapse toggle at top */}
      <div
        className={cn(
          "flex border-b border-gray-100 shrink-0",
          collapsed ? "h-auto min-h-[60px] flex-col justify-center px-2 py-3" : "h-14 lg:h-[60px] items-center justify-between gap-2 px-3 lg:px-4"
        )}
      >
        {!collapsed ? (
          <>
            <Link href="/" className="flex flex-1 items-center gap-2.5 text-gray-900 hover:opacity-80 transition-opacity min-w-0">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8 w-8 shrink-0" />
              <span className="text-base font-semibold text-gray-900 truncate">DisputeStrike</span>
            </Link>
            <button
              type="button"
              onClick={onToggle}
              title="Collapse sidebar"
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs font-medium">Collapse</span>
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-2 py-1">
            <Link href="/" className="flex items-center justify-center rounded-lg p-2 hover:bg-gray-50 transition-colors">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8 w-8 object-contain" />
            </Link>
            <button
              type="button"
              onClick={onToggle}
              title="Expand sidebar"
              className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <nav className="py-3 px-2">
            {sidebarNav.map((section) => (
              <div key={section.title} className={cn("mb-4", collapsed && "mb-2")}>
                {!collapsed && (
                  <h2 className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {section.title}
                  </h2>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      title={item.title}
                      icon={item.icon}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>

    </aside>
  );
}

function NavItem({ href, title, icon: Icon, collapsed }) {
  const [isActive] = useLocation(href);

  return (
    <Link
      href={href}
      title={collapsed ? title : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md transition-colors duration-150",
        collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2 mx-1",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("shrink-0 text-current opacity-80", collapsed ? "h-5 w-5" : "h-4 w-4")} />
      {!collapsed && <span className={cn("text-sm truncate", isActive ? "font-medium" : "font-normal")}>{title}</span>}
    </Link>
  );
}

function Header() {
  const { logout } = useAuth();

  return (
    <header className="flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-4 lg:h-[60px] lg:px-6 shrink-0">
      <MobileSidebar />
      <div className="w-full flex-1" />
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" asChild>
        <Link href="/dashboard/settings">
          <Settings className="h-4 w-4 text-gray-600" />
          <span className="sr-only">Settings</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" asChild>
        <Link href="/dashboard/profile">
          <User className="h-4 w-4 text-gray-600" />
          <span className="sr-only">Profile</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-gray-100 text-gray-600"
        onClick={() => logout()}
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign Out</span>
      </Button>
    </header>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden border-gray-200">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-[280px] p-0">
        <div className="flex h-14 items-center gap-2 px-4 border-b border-gray-100">
          <img src="/logo.webp" alt="DisputeStrike" className="h-8 w-8" />
          <span className="text-base font-semibold text-gray-900">DisputeStrike</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="py-4 px-3">
            {sidebarNav.map((section) => (
              <div key={section.title} className="mb-4">
                <h2 className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  {section.title}
                </h2>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <MobileNavItem
                      key={item.href}
                      href={item.href}
                      title={item.title}
                      icon={item.icon}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavItem({ href, title, icon: Icon, onNavigate }) {
  const [isActive] = useLocation(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 mx-1 transition-colors",
        isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn("text-sm", isActive ? "font-medium" : "font-normal")}>{title}</span>
    </Link>
  );
}
