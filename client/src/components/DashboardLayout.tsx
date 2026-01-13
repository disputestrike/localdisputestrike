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
import { trpc } from "@/lib/trpc";
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
      { icon: Bell, label: "Tracking", path: "/dashboard/tracking", badge: null },
    ],
  },
  {
    section: "Dispute Tools",
    items: [
      { icon: Building2, label: "Creditor Disputes", path: "/dashboard/creditor-disputes", badge: null },
      { icon: FileWarning, label: "CFPB Complaints", path: "/dashboard/cfpb", badge: "New" },
      { icon: Search, label: "Inquiry Removal", path: "/dashboard/inquiries", badge: null },
      { icon: Shield, label: "Debt Validation", path: "/dashboard/debt-validation", badge: null },
      { icon: TrendingUp, label: "Score Simulator", path: "/dashboard/score-simulator", badge: null },
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
  {
    section: "Agency",
    items: [
      { icon: Building2, label: "Agency Dashboard", path: "/agency", badge: "B2B" },
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

// Notification type interface
interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: Date;
}

// Dynamic Notification Bell Component
function NotificationBell() {
  const utils = trpc.useUtils();
  const { data: notifications } = trpc.notifications.list.useQuery(
    { unreadOnly: false, limit: 10 },
    { refetchInterval: 60000 }
  );
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 60000,
  });
  
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
  
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
  
  const hasNotifications = unreadCount && unreadCount > 0;
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline_reminder': return '⏰';
      case 'response_received': return '📬';
      case 'letter_generated': return '📄';
      case 'payment_confirmed': return '✅';
      case 'account_deleted': return '🎉';
      default: return '🔔';
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-900 relative"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-semibold">Notifications</span>
          {hasNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => markAllAsRead.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>
        {!notifications || notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you about important updates</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification: Notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer border-b last:border-0 ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead.mutate({ notificationId: notification.id });
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <span className="text-lg">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                      <span className="font-medium text-sm truncate">{notification.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Welcome to DisputeStrike
            </h1>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              Sign in to access your credit dispute dashboard and start improving your credit score.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/login";
            }}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
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
          className="border-r border-gray-200 bg-white"
          disableTransition={isResizing}
        >
          {/* Logo Header */}
          <SidebarHeader className="h-16 justify-center border-b border-gray-200">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
                <button
                  onClick={toggleSidebar}
                  className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors focus:outline-none shrink-0"
                  aria-label="Toggle navigation"
                >
                  <PanelLeft className="h-4 w-4 text-gray-500" />
                </button>
              {!isCollapsed && (
                <Link href="/">
                  <a className="flex items-center gap-2">
                    <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="w-8 h-8" />
                    <span className="font-bold text-gray-900">DisputeStrike</span>
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
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                              ? "bg-orange-50 text-orange-600 border border-orange-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4", active && "text-orange-600")} />
                          <span className="flex-1">{item.label}</span>
                          {!isCollapsed && item.badge && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs ml-auto",
                                item.badge === "New" &&
                                  "bg-green-100 text-green-600 border-green-200",
                                item.badge === "Hot" &&
                                  "bg-orange-100 text-orange-600 border-orange-200",
                                item.badge === "$50" &&
                                  "bg-blue-100 text-blue-600 border-blue-200"
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
            <div className="mt-auto pt-4 border-t border-gray-200">
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
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", active && "text-orange-600")} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </SidebarContent>

          {/* User Profile Footer */}
          <SidebarFooter className="p-3 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-gray-100 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-gray-200 shrink-0">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate leading-none">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1.5">
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
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-orange-200 transition-colors ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-gray-50">
        {/* Top Header Bar */}
        <div className="flex border-b border-gray-200 h-16 items-center justify-between bg-white/80 backdrop-blur-sm px-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {isMobile && (
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-gray-100 text-gray-600" />
            )}
            <h1 className="text-lg font-semibold text-gray-900">
              {activeMenuItem?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/ai-assistant">
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 hidden sm:flex"
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
