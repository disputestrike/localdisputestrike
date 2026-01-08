import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Mail,
  Building2,
  FileWarning,
  Search,
  UserCog,
  CreditCard,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeft,
  Shield,
  Bell,
  GraduationCap,
  Bot,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

// Full navigation structure like CreditFixrr
const navSections = [
  {
    section: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", badge: null },
      { icon: FileText, label: "Credit Reports", path: "/dashboard/reports", badge: null },
      { icon: AlertTriangle, label: "Disputes", path: "/dashboard/disputes", badge: null },
      { icon: Mail, label: "Letters", path: "/dashboard/letters", badge: null },
    ],
  },
  {
    section: "Dispute Tools",
    items: [
      { icon: Building2, label: "Creditor Disputes", path: "/dashboard/creditor-disputes", badge: null },
      { icon: FileWarning, label: "CFPB Complaints", path: "/dashboard/cfpb", badge: "New" },
      { icon: Search, label: "Inquiry Removal", path: "/dashboard/inquiries", badge: null },
      { icon: Shield, label: "Debt Validation", path: "/dashboard/debt-validation", badge: null },
    ],
  },
  {
    section: "Credit Building",
    items: [
      { icon: UserCog, label: "Profile Optimizer", path: "/dashboard/profile", badge: null },
      { icon: TrendingUp, label: "Credit Building", path: "/dashboard/credit-building", badge: null },
      { icon: CreditCard, label: "Marketplace", path: "/dashboard/marketplace", badge: "Hot" },
    ],
  },
  {
    section: "Earn & Learn",
    items: [
      { icon: Users, label: "Referral Program", path: "/dashboard/referrals", badge: "$50" },
      { icon: GraduationCap, label: "Credit Education", path: "/credit-education", badge: null },
      { icon: Bot, label: "AI Assistant", path: "/ai-assistant", badge: null },
    ],
  },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: HelpCircle, label: "Support", path: "/dashboard/support" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Welcome to DisputeStrike
            </h1>
            <p className="text-sm text-slate-400 text-center max-w-sm">
              Sign in to access your credit dispute dashboard and start improving your credit score.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Sign in to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Find active menu item
  const allItems = [...navSections.flatMap((s) => s.items), ...bottomNavItems];
  const activeMenuItem = allItems.find((item) => {
    if (item.path === "/dashboard") {
      return location === "/dashboard";
    }
    return location.startsWith(item.path);
  });

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/dashboard";
    }
    return location.startsWith(path);
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-slate-800 bg-slate-900"
          disableTransition={isResizing}
        >
          {/* Logo Header */}
          <SidebarHeader className="h-16 justify-center border-b border-slate-800">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-slate-400" />
              </button>
              {!isCollapsed && (
                <Link href="/">
                  <a className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white">DisputeStrike</span>
                  </a>
                </Link>
              )}
            </div>
          </SidebarHeader>

          {/* Main Navigation */}
          <SidebarContent className="gap-0 py-4">
            {navSections.map((section) => (
              <div key={section.section} className="mb-4">
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.section}
                  </h3>
                )}
                <SidebarMenu className="px-2">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={active}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={cn(
                            "h-10 transition-all font-normal",
                            active
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4", active && "text-cyan-400")} />
                          <span className="flex-1">{item.label}</span>
                          {!isCollapsed && item.badge && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs ml-auto",
                                item.badge === "New" &&
                                  "bg-green-500/20 text-green-400 border-green-500/30",
                                item.badge === "Hot" &&
                                  "bg-orange-500/20 text-orange-400 border-orange-500/30",
                                item.badge === "$50" &&
                                  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}

            {/* Bottom Nav Items */}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <SidebarMenu className="px-2">
                {bottomNavItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => setLocation(item.path)}
                        tooltip={item.label}
                        className={cn(
                          "h-10 transition-all font-normal",
                          active
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", active && "text-cyan-400")} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </SidebarContent>

          {/* User Profile Footer */}
          <SidebarFooter className="p-3 border-t border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-slate-800 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-slate-700 text-white text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate leading-none">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-1.5">
                        {user?.email || "-"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-cyan-500/20 transition-colors ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-slate-950">
        {/* Top Header Bar */}
        <div className="flex border-b border-slate-800 h-16 items-center justify-between bg-slate-900/80 backdrop-blur-sm px-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {isMobile && (
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-slate-800 text-slate-400" />
            )}
            <h1 className="text-lg font-semibold text-white">
              {activeMenuItem?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Link href="/ai-assistant">
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hidden sm:flex"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
