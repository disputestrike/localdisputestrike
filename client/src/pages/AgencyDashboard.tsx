import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  FileText,
  TrendingUp,
  Building2,
  Search,
  MoreHorizontal,
  Eye,
  Archive,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Home,
  CreditCard,
  Bell,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AgencyDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });

  // Fetch agency stats
  const { data: stats, isLoading: statsLoading } = trpc.agency.getStats.useQuery();
  
  // Fetch clients list
  const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = trpc.agency.clients.list.useQuery();

  // Create client mutation
  const createClient = trpc.agency.clients.create.useMutation({
    onSuccess: () => {
      setIsAddClientOpen(false);
      setNewClient({ clientName: "", clientEmail: "", clientPhone: "" });
      refetchClients();
    },
  });

  // Archive client mutation
  const archiveClient = trpc.agency.clients.archive.useMutation({
    onSuccess: () => {
      refetchClients();
    },
  });

  // Filter clients by search
  const filteredClients = clients?.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddClient = () => {
    if (!newClient.clientName.trim()) return;
    createClient.mutate(newClient);
  };

  const handleViewClient = (clientId: number) => {
    setLocation(`/agency/client/${clientId}`);
  };

  const handleArchiveClient = (clientId: number) => {
    if (confirm("Are you sure you want to archive this client? This will free up a client slot.")) {
      archiveClient.mutate({ clientId });
    }
  };

  // Calculate revenue (mock for now - would come from Stripe)
  const monthlyRevenue = stats?.activeClients ? stats.activeClients * 79 : 0;
  const planPrice = stats?.planTier === 'enterprise' ? 1997 : stats?.planTier === 'professional' ? 997 : 497;

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If user is not an agency, show upgrade prompt
  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="DisputeStrike" className="h-10 w-10" />
                <span className="font-bold text-xl text-gray-900">DisputeStrike</span>
              </Link>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/agency-pricing">View Agency Plans</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Building2 className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Become a DisputeStrike Merchant
          </h1>
          <p className="text-gray-600 mb-8">
            Scale your credit repair business with our powerful B2B platform. 
            Manage multiple clients, generate unlimited dispute letters, and grow your revenue.
          </p>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link href="/agency-pricing">
              View Agency Plans
              <ChevronRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agency Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="DisputeStrike" className="h-8 w-8" />
                <span className="font-bold text-lg">DisputeStrike</span>
              </Link>
              <Badge className="bg-orange-500 text-white">
                Agency Portal
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-slate-800">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-slate-800">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-500 text-white text-sm">
                        {stats.agencyName?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{stats.agencyName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{stats.agencyName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center cursor-pointer">
                      <Home className="h-4 w-4 mr-2" />
                      My Personal Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {stats.agencyName}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your credit repair business today.
          </p>
        </div>

        {/* Business Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Revenue */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Est. Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${monthlyRevenue.toLocaleString()}</div>
              <p className="text-green-100 text-sm mt-1">
                Based on {stats.activeClients} active clients
              </p>
            </CardContent>
          </Card>

          {/* Active Clients */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeClients}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {stats.clientSlotsUsed} / {stats.clientSlotsIncluded} slots used
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(stats.clientSlotsUsed / stats.clientSlotsIncluded) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Letters Generated */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Letters Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalLetters}</div>
              <p className="text-sm text-gray-500 mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          {/* Active Disputes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Active Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeDisputes}</div>
              <p className="text-sm text-gray-500 mt-1">
                Awaiting responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {stats.planTier?.charAt(0).toUpperCase()}{stats.planTier?.slice(1)} Plan
                  </h3>
                  <p className="text-gray-300 text-sm">
                    ${planPrice}/month • {stats.clientSlotsIncluded} client slots
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {stats.clientSlotsUsed >= stats.clientSlotsIncluded * 0.8 && (
                  <Badge className="bg-yellow-500 text-black">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Running low on slots
                  </Badge>
                )}
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900" asChild>
                  <Link href="/agency-pricing">Upgrade Plan</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client List Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Your Clients</CardTitle>
                <CardDescription>
                  Click on a client to view their credit profile and manage disputes
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Add a new client to your agency. You have {stats.clientSlotsIncluded - stats.clientSlotsUsed} slots remaining.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Full Name *</Label>
                        <Input
                          id="clientName"
                          placeholder="John Doe"
                          value={newClient.clientName}
                          onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={newClient.clientEmail}
                          onChange={(e) => setNewClient({ ...newClient, clientEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientPhone">Phone</Label>
                        <Input
                          id="clientPhone"
                          placeholder="(555) 123-4567"
                          value={newClient.clientPhone}
                          onChange={(e) => setNewClient({ ...newClient, clientPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddClient}
                        disabled={!newClient.clientName.trim() || createClient.isPending}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {createClient.isPending ? "Adding..." : "Add Client"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-500 mb-4">
                  Add your first client to start managing their credit disputes.
                </p>
                <Button onClick={() => setIsAddClientOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Letters</TableHead>
                      <TableHead>Disputes</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewClient(client.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-orange-100 text-orange-600">
                                {client.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{client.clientName}</p>
                              <p className="text-sm text-gray-500">Added {format(new Date(client.createdAt), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.clientEmail && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Mail className="h-3 w-3" />
                                {client.clientEmail}
                              </div>
                            )}
                            {client.clientPhone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {client.clientPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={client.status === 'active' ? 'default' : 'secondary'}
                            className={client.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {client.status === 'active' ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> {client.status}</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{client.totalLettersGenerated}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{client.totalAccountsDisputed}</span>
                        </TableCell>
                        <TableCell>
                          {client.lastActivityAt ? (
                            <span className="text-sm text-gray-500">
                              {format(new Date(client.lastActivityAt), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No activity</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewClient(client.id); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleArchiveClient(client.id); }}
                                className="text-red-600"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsAddClientOpen(true)}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add New Client</h3>
                  <p className="text-sm text-gray-500">Onboard a new credit repair client</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/credit-education">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Training Center</h3>
                    <p className="text-sm text-gray-500">Learn credit repair strategies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/agency-pricing">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Upgrade Plan</h3>
                    <p className="text-sm text-gray-500">Get more client slots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DisputeStrike Agency Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/contact" className="hover:text-gray-900">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
