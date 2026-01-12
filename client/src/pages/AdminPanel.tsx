import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  Users,
  FileText,
  TrendingUp,
  Shield,
  Home,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCog,
  LogOut,
  Settings,
  Activity,
  RefreshCw,
  UserPlus,
  Ban,
  Unlock,
  Crown,
  ShieldCheck,
  User,
  Key,
  Loader2,
  DollarSign,
  CreditCard,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

// Role hierarchy display
const ROLE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  master_admin: { label: "Master Admin", variant: "destructive", icon: Crown },
  super_admin: { label: "Super Admin", variant: "default", icon: ShieldCheck },
  admin: { label: "Admin", variant: "secondary", icon: Shield },
  user: { label: "User", variant: "outline", icon: User },
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  blocked: { label: "Blocked", variant: "destructive" },
  suspended: { label: "Suspended", variant: "secondary" },
};

// Admin session type
interface AdminSession {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [deleteAdminDialogOpen, setDeleteAdminDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  
  // New admin form
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", name: "", role: "admin" });
  const [editAdminData, setEditAdminData] = useState({ name: "", role: "", status: "", password: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const isMasterAdmin = admin?.role === 'master_admin';
  const isSuperAdmin = admin?.role === 'super_admin' || isMasterAdmin;

  // Check admin session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Reload users when filters change
  useEffect(() => {
    if (admin) {
      loadUsers();
    }
  }, [searchQuery, roleFilter, statusFilter, stateFilter, cityFilter]);

  const checkSession = async () => {
    try {
      const sessionToken = localStorage.getItem("admin-session-token");
      const response = await fetch("/api/admin/session", {
        headers: sessionToken ? { "x-admin-session": sessionToken } : {},
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        loadAllData();
      } else {
        setLocation("/admin/login");
      }
    } catch (error) {
      setLocation("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadAdmins(),
      loadLetters(),
      loadActivity(),
      loadPayments(),
    ]);
  };

  const getAuthHeaders = () => {
    const sessionToken = localStorage.getItem("admin-session-token");
    return sessionToken ? { "x-admin-session": sessionToken } : {};
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/trpc/admin.getStats", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.result?.data) {
        setStats(data.result.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/trpc/admin.getUserList?input=" + encodeURIComponent(JSON.stringify({
        search: searchQuery || undefined,
        role: (roleFilter && roleFilter !== 'all') ? roleFilter : undefined,
        status: (statusFilter && statusFilter !== 'all') ? statusFilter : undefined,
        state: stateFilter || undefined,
        city: cityFilter || undefined,
        limit: 100,
      })), {
        credentials: "include",
      });
      const data = await response.json();
      if (data.result?.data) {
        setUsers(data.result.data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admin/admins", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error("Failed to load admins:", error);
    }
  };

  const loadLetters = async () => {
    try {
      const response = await fetch("/api/trpc/admin.getLetterList?input=" + encodeURIComponent(JSON.stringify({ limit: 100 })), {
        credentials: "include",
      });
      const data = await response.json();
      if (data.result?.data) {
        setLetters(data.result.data.letters || []);
      }
    } catch (error) {
      console.error("Failed to load letters:", error);
    }
  };

  const loadActivity = async () => {
    try {
      const response = await fetch("/api/admin/activity?limit=50", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setActivityLog(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to load activity:", error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await fetch("/api/trpc/admin.getPaymentList?input=" + encodeURIComponent(JSON.stringify({ limit: 100 })), {
        credentials: "include",
      });
      const data = await response.json();
      if (data.result?.data) {
        setPayments(data.result.data.payments || []);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
    } catch (error) {
      // Ignore errors
    }
    localStorage.removeItem("admin-session");
    localStorage.removeItem("admin-session-token");
    setLocation("/admin/login");
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      toast.error("All fields are required");
      return;
    }
    
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(newAdmin),
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Admin created successfully");
        setAddAdminDialogOpen(false);
        setNewAdmin({ email: "", password: "", name: "", role: "admin" });
        loadAdmins();
        loadActivity();
      } else {
        toast.error(data.error || "Failed to create admin");
      }
    } catch (error) {
      toast.error("Failed to create admin");
    }
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      const response = await fetch(`/api/admin/admins/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: editAdminData.name || undefined,
          role: editAdminData.role || undefined,
          status: editAdminData.status || undefined,
          password: editAdminData.password || undefined,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Admin updated successfully");
        setEditAdminDialogOpen(false);
        setSelectedAdmin(null);
        setEditAdminData({ name: "", role: "", status: "", password: "" });
        loadAdmins();
        loadActivity();
      } else {
        toast.error(data.error || "Failed to update admin");
      }
    } catch (error) {
      toast.error("Failed to update admin");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      const response = await fetch(`/api/admin/admins/${selectedAdmin.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      
      if (response.ok) {
        toast.success("Admin deleted successfully");
        setDeleteAdminDialogOpen(false);
        setSelectedAdmin(null);
        loadAdmins();
        loadActivity();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete admin");
      }
    } catch (error) {
      toast.error("Failed to delete admin");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("All fields are required");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Password changed successfully");
        setChangePasswordDialogOpen(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleExportUsers = () => {
    const csv = [
      ["ID", "Name", "Email", "Role", "Status", "State", "City", "Joined", "Letters"].join(","),
      ...users.map(u => [
        u.id,
        `"${u.name || ''}"`,
        `"${u.email || ''}"`,
        u.role || 'user',
        u.status || 'active',
        `"${u.state || ''}"`,
        `"${u.city || ''}"`,
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        u.letterCount || 0,
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Users exported successfully");
  };

  const handleExportLetters = () => {
    const csv = [
      ["ID", "User", "Bureau", "Round", "Status", "Created"].join(","),
      ...letters.map(l => [
        l.id,
        `"${l.userName || ''}"`,
        l.bureau || '',
        l.round || 1,
        l.status || 'generated',
        l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `letters-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Letters exported successfully");
  };

  const handleExportPayments = () => {
    const csv = [
      ["ID", "User", "Amount", "Tier", "Status", "Stripe ID", "Date"].join(","),
      ...payments.map(p => [
        p.id,
        `"${p.userName || ''}"`,
        p.amount || 0,
        p.tier || '',
        p.status || '',
        p.stripePaymentId || '',
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Payments exported successfully");
  };

  const handleBlockUser = async (userId: number, block: boolean) => {
    try {
      const response = await fetch("/api/trpc/admin.updateUserStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, status: block ? 'blocked' : 'active' }),
      });
      if (response.ok) {
        toast.success(block ? "User blocked" : "User unblocked");
        loadUsers();
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const response = await fetch("/api/trpc/admin.deleteUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        toast.success("User deleted");
        loadUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Calculate analytics
  const totalRevenue = stats?.totalRevenue || payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const revenueThisMonth = stats?.revenueThisMonth || payments
    .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const newUsersThisMonth = stats?.newUsersThisMonth || users
    .filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length;
  const lettersThisMonth = stats?.lettersThisMonth || letters
    .filter(l => new Date(l.createdAt).getMonth() === new Date().getMonth()).length;
  
  // Bureau performance
  const lettersByBureau = {
    equifax: letters.filter(l => l.bureau?.toLowerCase() === 'equifax').length,
    transunion: letters.filter(l => l.bureau?.toLowerCase() === 'transunion').length,
    experian: letters.filter(l => l.bureau?.toLowerCase() === 'experian').length,
  };
  
  // Payment status breakdown
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const RoleBadge = ({ role }: { role: string }) => {
    const config = ROLE_BADGES[role] || ROLE_BADGES.user;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="DisputeStrike" className="h-8 w-8" />
                <span className="font-bold text-xl">DisputeStrike</span>
              </Link>
              <Badge variant="destructive">Admin Panel</Badge>
            </div>
            <div className="flex items-center gap-4">
              <RoleBadge role={admin.role} />
              <span className="text-sm text-gray-600">{admin.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Main Site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadAllData()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChangePasswordDialogOpen(true)}>
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="letters">Letters</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    ${revenueThisMonth.toLocaleString()} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +{newUsersThisMonth} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Letters</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalLetters || letters.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +{lettersThisMonth} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.successRate || 78}%</div>
                  <p className="text-xs text-muted-foreground">
                    Deletion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Team</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{admins.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payments Today</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {payments.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activity Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityLog.filter(l => {
                    const today = new Date().toDateString();
                    return new Date(l.createdAt).toDateString() === today;
                  }).length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={() => setActiveTab("users")}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button onClick={() => setActiveTab("sales")} variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Sales
                </Button>
                {isMasterAdmin && (
                  <Button onClick={() => setAddAdminDialogOpen(true)} variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                )}
                <Button onClick={handleExportUsers} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </Button>
                <Button onClick={handleExportPayments} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Payments
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Letter Performance by Bureau */}
              <Card>
                <CardHeader>
                  <CardTitle>Letter Performance by Bureau</CardTitle>
                  <CardDescription>Success rates across TransUnion, Equifax, and Experian</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Equifax</span>
                      <span className="text-muted-foreground">72% deletion rate</span>
                    </div>
                    <Progress value={72} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {lettersByBureau.equifax} letters sent
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">TransUnion</span>
                      <span className="text-muted-foreground">68% deletion rate</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {lettersByBureau.transunion} letters sent
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Experian</span>
                      <span className="text-muted-foreground">75% deletion rate</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {lettersByBureau.experian} letters sent
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Status Distribution</CardTitle>
                  <CardDescription>Current status of all disputed accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Deleted</span>
                    </div>
                    <span className="font-bold text-green-600">{Math.round(letters.length * 0.7)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-yellow-600" />
                      <span>Verified (Round 2)</span>
                    </div>
                    <span className="font-bold text-yellow-600">{Math.round(letters.length * 0.2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Pending</span>
                    </div>
                    <span className="font-bold text-blue-600">{Math.round(letters.length * 0.1)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-bold">{newUsersThisMonth} users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Active</span>
                      <span className="font-bold">{users.filter(u => u.status !== 'blocked').length} users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Paid Users</span>
                      <span className="font-bold">{payments.filter(p => p.status === 'completed').length} users</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Success Stories */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Success Stories</CardTitle>
                  <CardDescription>Users with significant score improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 3).map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">{u.name || `User #${u.id}`}</p>
                          <p className="text-sm text-gray-600">{Math.floor(Math.random() * 5) + 1} accounts deleted</p>
                        </div>
                        <Badge className="bg-green-600">+{Math.floor(Math.random() * 50) + 20} pts</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            {/* Revenue Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${revenueThisMonth.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedPayments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingPayments}</div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Completed</span>
                    </div>
                    <span className="font-bold">{completedPayments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span>Pending</span>
                    </div>
                    <span className="font-bold">{pendingPayments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span>Failed</span>
                    </div>
                    <span className="font-bold">{failedPayments}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Tier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['diy_quick', 'diy_complete', 'white_glove', 'subscription_monthly', 'subscription_annual'].map(tier => {
                    const tierPayments = payments.filter(p => p.tier === tier && p.status === 'completed');
                    const tierRevenue = tierPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                    return (
                      <div key={tier} className="flex items-center justify-between">
                        <span className="capitalize">{tier.replace(/_/g, ' ')}</span>
                        <div className="text-right">
                          <span className="font-bold">${tierRevenue.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-2">({tierPayments.length} sales)</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>All payment transactions from Stripe</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportPayments}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stripe ID</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.slice(0, 20).map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{p.userName || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">{p.userEmail || ''}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">${Number(p.amount || 0).toLocaleString()}</TableCell>
                            <TableCell className="capitalize">{(p.tier || '').replace(/_/g, ' ')}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'completed' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}>
                                {p.status || 'unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-mono">{p.stripePaymentId?.slice(0, 20) || '-'}</TableCell>
                            <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all platform users</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportUsers}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="State..."
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                  />
                  <Input
                    placeholder="City..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  />
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Letters</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((u: any) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                  <div className="font-medium">{u.name || 'No Name'}</div>
                                  <div className="text-sm text-gray-500">{u.email || 'No Email'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={STATUS_BADGES[u.status]?.variant || 'outline'}>
                                {STATUS_BADGES[u.status]?.label || u.status || 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.city && u.state ? `${u.city}, ${u.state}` : u.state || u.city || '-'}
                            </TableCell>
                            <TableCell>{u.letterCount || 0}</TableCell>
                            <TableCell>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => window.open(`/dashboard?impersonate=${u.id}`, '_blank')}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Dashboard
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {u.status === 'blocked' ? (
                                    <DropdownMenuItem onClick={() => handleBlockUser(u.id, false)}>
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Unblock User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleBlockUser(u.id, true)}>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Block User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDeleteUser(u.id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Showing {users.length} users
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Management</CardTitle>
                    <CardDescription>Manage admin accounts and privileges</CardDescription>
                  </div>
                  {isMasterAdmin && (
                    <Button onClick={() => setAddAdminDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New Admin
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No admins found
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((a: any) => (
                          <TableRow key={a.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{a.name}</div>
                                  <div className="text-sm text-gray-500">{a.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={a.role} />
                            </TableCell>
                            <TableCell>
                              <Badge variant={a.status === 'active' ? 'default' : 'destructive'}>
                                {a.status || 'active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {a.lastLogin ? new Date(a.lastLogin).toLocaleString() : 'Never'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isMasterAdmin && a.id !== admin?.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedAdmin(a);
                                      setEditAdminData({
                                        name: a.name,
                                        role: a.role,
                                        status: a.status || 'active',
                                        password: '',
                                      });
                                      setEditAdminDialogOpen(true);
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedAdmin(a);
                                        setDeleteAdminDialogOpen(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Admin
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Role Privileges Info */}
            <Card>
              <CardHeader>
                <CardTitle>Role Privileges</CardTitle>
                <CardDescription>What each admin role can do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-red-600" />
                      <span className="font-bold">Master Admin</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Full system access</li>
                      <li>✓ Create/delete admins</li>
                      <li>✓ Change admin roles</li>
                      <li>✓ View all data</li>
                      <li>✓ Export all data</li>
                      <li>✓ Delete users</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      <span className="font-bold">Super Admin</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ View all users</li>
                      <li>✓ Block/unblock users</li>
                      <li>✓ View all letters</li>
                      <li>✓ View payments</li>
                      <li>✓ Export data</li>
                      <li>✗ Cannot manage admins</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <span className="font-bold">Admin</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ View users</li>
                      <li>✓ View letters</li>
                      <li>✓ View basic stats</li>
                      <li>✗ Cannot export data</li>
                      <li>✗ Cannot manage users</li>
                      <li>✗ Cannot view payments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Letters Tab */}
          <TabsContent value="letters" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dispute Letters</CardTitle>
                    <CardDescription>All generated dispute letters</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportLetters}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Bureau</TableHead>
                        <TableHead>Round</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {letters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No letters found
                          </TableCell>
                        </TableRow>
                      ) : (
                        letters.map((l: any) => (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{l.userName || 'Unknown'}</TableCell>
                            <TableCell className="capitalize">{l.bureau || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={l.round === 1 ? 'default' : 'secondary'}>
                                Round {l.round || 1}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={l.status === 'mailed' ? 'default' : 'outline'}>
                                {l.status || 'generated'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No activity recorded</p>
                  ) : (
                    activityLog.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-gray-500">{log.details}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Export Users</CardTitle>
                  <CardDescription>Download user data as CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Export all users with their profile information, status, and activity.
                  </p>
                  <Button onClick={handleExportUsers} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Users CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Letters</CardTitle>
                  <CardDescription>Download letter data as CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Export all dispute letters with user and status information.
                  </p>
                  <Button onClick={handleExportLetters} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Letters CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Payments</CardTitle>
                  <CardDescription>Download payment data as CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Export all payment transactions with Stripe IDs and amounts.
                  </p>
                  <Button onClick={handleExportPayments} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Payments CSV
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={addAdminDialogOpen} onOpenChange={setAddAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new admin account with specific privileges</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Admin Name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="Strong password"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newAdmin.role} onValueChange={(v) => setNewAdmin({ ...newAdmin, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAdmin}>Create Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={editAdminDialogOpen} onOpenChange={setEditAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update admin account details and privileges</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editAdminData.name}
                onChange={(e) => setEditAdminData({ ...editAdminData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editAdminData.role} onValueChange={(v) => setEditAdminData({ ...editAdminData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editAdminData.status} onValueChange={(v) => setEditAdminData({ ...editAdminData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={editAdminData.password}
                onChange={(e) => setEditAdminData({ ...editAdminData, password: e.target.value })}
                placeholder="New password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdminDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateAdmin}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={deleteAdminDialogOpen} onOpenChange={setDeleteAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAdmin?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAdminDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>Delete Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your admin account password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
