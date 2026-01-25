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