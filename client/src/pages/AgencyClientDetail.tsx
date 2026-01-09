import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft,
  User,
  FileText,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Edit,
  Save,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";

export default function AgencyClientDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId || "0");

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<any>(null);

  // Fetch client details
  const { data: client, isLoading, refetch } = trpc.agency.clients.get.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  // Fetch client reports
  const { data: reports } = trpc.agency.clients.getReports.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  // Fetch client accounts
  const { data: accounts } = trpc.agency.clients.getAccounts.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  // Fetch client letters
  const { data: letters } = trpc.agency.clients.getLetters.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  // Update client mutation
  const updateClient = trpc.agency.clients.update.useMutation({
    onSuccess: () => {
      setIsEditingInfo(false);
      refetch();
    },
  });

  const handleSaveInfo = () => {
    if (!editedInfo) return;
    updateClient.mutate({
      clientId,
      ...editedInfo,
    });
  };

  const startEditing = () => {
    setEditedInfo({
      clientName: client?.clientName || "",
      clientEmail: client?.clientEmail || "",
      clientPhone: client?.clientPhone || "",
      dateOfBirth: client?.dateOfBirth || "",
      ssnLast4: client?.ssnLast4 || "",
      currentAddress: client?.currentAddress || "",
      currentCity: client?.currentCity || "",
      currentState: client?.currentState || "",
      currentZip: client?.currentZip || "",
      internalNotes: client?.internalNotes || "",
    });
    setIsEditingInfo(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
          <p className="text-gray-500 mb-4">This client doesn't exist or you don't have access.</p>
          <Button onClick={() => setLocation("/agency")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agency Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/agency")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.clientName}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {client.clientEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.clientEmail}
                    </span>
                  )}
                  {client.clientPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.clientPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Badge 
            variant={client.status === "active" ? "default" : "secondary"}
            className={client.status === "active" ? "bg-green-100 text-green-700" : ""}
          >
            {client.status}
          </Badge>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{reports?.length || 0}</div>
                  <div className="text-sm text-gray-500">Reports Uploaded</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{accounts?.length || 0}</div>
                  <div className="text-sm text-gray-500">Negative Accounts</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{client.totalLettersGenerated || 0}</div>
                  <div className="text-sm text-gray-500">Letters Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{client.totalAccountsDisputed || 0}</div>
                  <div className="text-sm text-gray-500">Accounts Disputed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Client Info</TabsTrigger>
            <TabsTrigger value="reports">Credit Reports</TabsTrigger>
            <TabsTrigger value="accounts">Negative Accounts</TabsTrigger>
            <TabsTrigger value="letters">Dispute Letters</TabsTrigger>
          </TabsList>

          {/* Client Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Personal details used for dispute letters</CardDescription>
                </div>
                {!isEditingInfo ? (
                  <Button variant="outline" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Info
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingInfo(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveInfo} disabled={updateClient.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateClient.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isEditingInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={editedInfo?.clientName || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, clientName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editedInfo?.clientEmail || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, clientEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={editedInfo?.clientPhone || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, clientPhone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={editedInfo?.dateOfBirth || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SSN (Last 4)</Label>
                        <Input
                          maxLength={4}
                          value={editedInfo?.ssnLast4 || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, ssnLast4: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input
                          value={editedInfo?.currentAddress || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, currentAddress: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={editedInfo?.currentCity || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, currentCity: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={editedInfo?.currentState || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, currentState: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input
                          value={editedInfo?.currentZip || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, currentZip: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Internal Notes</Label>
                        <Textarea
                          rows={3}
                          placeholder="Private notes about this client..."
                          value={editedInfo?.internalNotes || ""}
                          onChange={(e) => setEditedInfo({ ...editedInfo, internalNotes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-500">Full Name</Label>
                        <p className="font-medium">{client.clientName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Email</Label>
                        <p className="font-medium">{client.clientEmail || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Phone</Label>
                        <p className="font-medium">{client.clientPhone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Date of Birth</Label>
                        <p className="font-medium">{client.dateOfBirth || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">SSN (Last 4)</Label>
                        <p className="font-medium">{client.ssnLast4 ? `***-**-${client.ssnLast4}` : "Not provided"}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-500">Address</Label>
                        <p className="font-medium">
                          {client.currentAddress ? (
                            <>
                              {client.currentAddress}<br />
                              {client.currentCity}, {client.currentState} {client.currentZip}
                            </>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Internal Notes</Label>
                        <p className="font-medium text-gray-600">{client.internalNotes || "No notes"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Added On</Label>
                        <p className="font-medium">{format(new Date(client.createdAt), "MMMM d, yyyy")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Credit Reports</CardTitle>
                  <CardDescription>Upload and manage credit reports for this client</CardDescription>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </CardHeader>
              <CardContent>
                {!reports || reports.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reports uploaded</h3>
                    <p className="text-gray-500 mb-4">
                      Upload credit reports from TransUnion, Equifax, or Experian
                    </p>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Report
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bureau</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {report.bureau}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.fileName || "Credit Report"}</TableCell>
                          <TableCell>{format(new Date(report.uploadedAt), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={report.isParsed ? "default" : "secondary"}>
                              {report.isParsed ? "Parsed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Negative Accounts Tab */}
          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>Negative Accounts</CardTitle>
                <CardDescription>Accounts extracted from credit reports that can be disputed</CardDescription>
              </CardHeader>
              <CardContent>
                {!accounts || accounts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No accounts found</h3>
                    <p className="text-gray-500">
                      Upload and parse credit reports to extract negative accounts
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Conflicts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.accountName}</TableCell>
                          <TableCell>{account.accountType || "Unknown"}</TableCell>
                          <TableCell>${Number(account.balance || 0).toLocaleString()}</TableCell>
                          <TableCell>{account.status || "Unknown"}</TableCell>
                          <TableCell>
                            {account.hasConflicts ? (
                              <Badge variant="destructive">Has Conflicts</Badge>
                            ) : (
                              <Badge variant="secondary">No Conflicts</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dispute Letters Tab */}
          <TabsContent value="letters">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Dispute Letters</CardTitle>
                  <CardDescription>Generated dispute letters for this client</CardDescription>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Letter
                </Button>
              </CardHeader>
              <CardContent>
                {!letters || letters.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No letters generated</h3>
                    <p className="text-gray-500 mb-4">
                      Generate dispute letters after uploading and parsing credit reports
                    </p>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate First Letter
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bureau</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Round</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {letters.map((letter) => (
                        <TableRow key={letter.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {letter.bureau}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{letter.letterType.replace(/_/g, " ")}</TableCell>
                          <TableCell>Round {letter.round}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                letter.status === "resolved" ? "default" :
                                letter.status === "mailed" ? "secondary" : "outline"
                              }
                              className={letter.status === "resolved" ? "bg-green-100 text-green-700" : ""}
                            >
                              {letter.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(letter.createdAt), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
