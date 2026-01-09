import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function AgencyDashboard() {
  const [, setLocation] = useLocation();
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

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-orange-500" />
              {stats?.agencyName || "Agency Dashboard"}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your credit repair clients in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm py-1 px-3">
              {stats?.planTier?.charAt(0).toUpperCase()}{stats?.planTier?.slice(1)} Plan
            </Badge>
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
                    Add a new client to your agency. You have {(stats?.clientSlotsIncluded || 0) - (stats?.clientSlotsUsed || 0)} slots remaining.
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Client Slots</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.clientSlotsUsed || 0} / {stats?.clientSlotsIncluded || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(stats?.clientSlotsIncluded || 0) - (stats?.clientSlotsUsed || 0)} slots available
              </p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${((stats?.clientSlotsUsed || 0) / (stats?.clientSlotsIncluded || 1)) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Clients</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.totalClients || 0} total clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Letters Generated</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLetters || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Across all clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Disputes</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeDisputes || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Pending responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Your Clients</CardTitle>
                <CardDescription>
                  Manage credit reports and dispute letters for each client
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
                <p className="text-gray-500 mb-4">
                  Add your first client to start managing their credit disputes
                </p>
                <Button 
                  onClick={() => setIsAddClientOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
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
                      <TableHead>Letters</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Status</TableHead>
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
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-orange-600 font-medium">
                                {client.clientName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{client.clientName}</div>
                              <div className="text-sm text-gray-500">
                                Added {format(new Date(client.createdAt), "MMM d, yyyy")}
                              </div>
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
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>{client.totalLettersGenerated || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.lastActivityAt ? (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(client.lastActivityAt), "MMM d, yyyy")}
                            </div>
                          ) : (
                            <span className="text-gray-400">No activity</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={client.status === "active" ? "default" : "secondary"}
                            className={client.status === "active" ? "bg-green-100 text-green-700" : ""}
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewClient(client.id);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveClient(client.id);
                                }}
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
      </div>
    </DashboardLayout>
  );
}
