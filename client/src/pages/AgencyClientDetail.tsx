import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertCircle,
  CheckCircle,
  Download,
  Edit,
  Save,
  Loader2,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AgencyClientDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId || "0");

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGenerateLetterOpen, setIsGenerateLetterOpen] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<string>("");
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [letterType, setLetterType] = useState<string>("initial");
  const [letterRound, setLetterRound] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: client, isLoading, refetch } = trpc.agency.clients.get.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  const { data: reports, refetch: refetchReports } = trpc.agency.clients.getReports.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  const { data: accounts, refetch: refetchAccounts } = trpc.agency.clients.getAccounts.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  const { data: letters, refetch: refetchLetters } = trpc.agency.clients.getLetters.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  const updateClient = trpc.agency.clients.update.useMutation({
    onSuccess: () => {
      setIsEditingInfo(false);
      refetch();
      toast.success("Client information updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update client");
    },
  });

  const uploadReport = trpc.agency.clients.uploadReport.useMutation({
    onSuccess: () => {
      setIsUploadOpen(false);
      setSelectedBureau("");
      refetchReports();
      refetchAccounts();
      toast.success("Report uploaded. AI is extracting accounts...");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload report");
    },
  });

  const generateLetter = trpc.agency.clients.generateLetter.useMutation({
    onSuccess: () => {
      setIsGenerateLetterOpen(false);
      setSelectedAccounts([]);
      refetchLetters();
      toast.success("Dispute letter generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate letter");
    },
  });

  const uploadToS3 = trpc.upload.uploadToS3.useMutation();

  const handleSaveInfo = () => {
    if (!editedInfo) return;
    updateClient.mutate({ clientId, ...editedInfo });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBureau) return;

    setIsUploading(true);
    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = Array.from(new Uint8Array(arrayBuffer));

      // Validate content type
      const contentType = file.type as "application/pdf" | "image/jpeg" | "image/png";
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(contentType)) {
        toast.error("Invalid file type. Please upload PDF, JPG, or PNG.");
        return;
      }

      // Upload to S3
      const { url, key } = await uploadToS3.mutateAsync({
        fileKey: `agency-reports/${clientId}/${Date.now()}-${file.name}`,
        fileData,
        contentType,
      });

      // Save report to database
      await uploadReport.mutateAsync({
        clientId,
        fileName: file.name,
        fileUrl: url,
        fileKey: key,
        bureau: selectedBureau as "transunion" | "equifax" | "experian",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateLetter = () => {
    if (!selectedBureau || selectedAccounts.length === 0) {
      toast.error("Select a bureau and at least one account");
      return;
    }
    generateLetter.mutate({
      clientId,
      bureau: selectedBureau as any,
      accountIds: selectedAccounts,
      letterType: letterType as any,
      round: letterRound,
    });
  };

  const toggleAccountSelection = (accountId: number) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
          <Badge variant={client.status === "active" ? "default" : "secondary"} className={client.status === "active" ? "bg-green-100 text-green-700" : ""}>
            {client.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{reports?.length || 0}</div>
                  <div className="text-sm text-gray-500">Reports</div>
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
                  <div className="text-sm text-gray-500">Accounts</div>
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
                  <div className="text-sm text-gray-500">Letters</div>
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
                  <div className="text-sm text-gray-500">Disputed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Client Info</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="letters">Letters</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Personal details for dispute letters</CardDescription>
                </div>
                {!isEditingInfo ? (
                  <Button variant="outline" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingInfo(false)}>Cancel</Button>
                    <Button onClick={handleSaveInfo} disabled={updateClient.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
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
                        <Input value={editedInfo?.clientName || ""} onChange={(e) => setEditedInfo({ ...editedInfo, clientName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={editedInfo?.clientEmail || ""} onChange={(e) => setEditedInfo({ ...editedInfo, clientEmail: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={editedInfo?.clientPhone || ""} onChange={(e) => setEditedInfo({ ...editedInfo, clientPhone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={editedInfo?.dateOfBirth || ""} onChange={(e) => setEditedInfo({ ...editedInfo, dateOfBirth: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>SSN Last 4</Label>
                        <Input maxLength={4} value={editedInfo?.ssnLast4 || ""} onChange={(e) => setEditedInfo({ ...editedInfo, ssnLast4: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input value={editedInfo?.currentAddress || ""} onChange={(e) => setEditedInfo({ ...editedInfo, currentAddress: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input value={editedInfo?.currentCity || ""} onChange={(e) => setEditedInfo({ ...editedInfo, currentCity: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input value={editedInfo?.currentState || ""} onChange={(e) => setEditedInfo({ ...editedInfo, currentState: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP</Label>
                          <Input value={editedInfo?.currentZip || ""} onChange={(e) => setEditedInfo({ ...editedInfo, currentZip: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea rows={4} value={editedInfo?.internalNotes || ""} onChange={(e) => setEditedInfo({ ...editedInfo, internalNotes: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div><Label className="text-gray-500">Name</Label><p className="font-medium">{client.clientName}</p></div>
                      <div><Label className="text-gray-500">Email</Label><p className="font-medium">{client.clientEmail || "Not provided"}</p></div>
                      <div><Label className="text-gray-500">Phone</Label><p className="font-medium">{client.clientPhone || "Not provided"}</p></div>
                      <div><Label className="text-gray-500">DOB</Label><p className="font-medium">{client.dateOfBirth || "Not provided"}</p></div>
                      <div><Label className="text-gray-500">SSN</Label><p className="font-medium">{client.ssnLast4 ? `***-**-${client.ssnLast4}` : "Not provided"}</p></div>
                    </div>
                    <div className="space-y-4">
                      <div><Label className="text-gray-500">Address</Label><p className="font-medium">{client.currentAddress ? `${client.currentAddress}, ${client.currentCity}, ${client.currentState} ${client.currentZip}` : "Not provided"}</p></div>
                      <div><Label className="text-gray-500">Notes</Label><p className="font-medium text-gray-600">{client.internalNotes || "No notes"}</p></div>
                      <div><Label className="text-gray-500">Added</Label><p className="font-medium">{format(new Date(client.createdAt), "MMM d, yyyy")}</p></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Credit Reports</CardTitle><CardDescription>Upload and manage reports</CardDescription></div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />Upload
                </Button>
              </CardHeader>
              <CardContent>
                {!reports?.length ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium mb-1">No reports</h3>
                    <p className="text-gray-500 mb-4">Upload credit reports to get started</p>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsUploadOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />Upload First Report
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Bureau</TableHead><TableHead>File</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {reports.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell><Badge variant="outline" className="capitalize">{r.bureau}</Badge></TableCell>
                          <TableCell>{r.fileName || "Report"}</TableCell>
                          <TableCell>{format(new Date(r.uploadedAt), "MMM d, yyyy")}</TableCell>
                          <TableCell><Badge variant={r.isParsed ? "default" : "secondary"}>{r.isParsed ? "Parsed" : "Processing"}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Negative Accounts</CardTitle><CardDescription>Accounts to dispute</CardDescription></div>
                {accounts?.length ? (
                  <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsGenerateLetterOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />Generate Letter
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                {!accounts?.length ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium mb-1">No accounts</h3>
                    <p className="text-gray-500">Upload reports to extract accounts</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Type</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead>Conflicts</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {accounts.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.accountName}</TableCell>
                          <TableCell>{a.accountType || "Unknown"}</TableCell>
                          <TableCell>${Number(a.balance || 0).toLocaleString()}</TableCell>
                          <TableCell>{a.status || "Unknown"}</TableCell>
                          <TableCell>{a.hasConflicts ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="letters">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Dispute Letters</CardTitle><CardDescription>Generated letters</CardDescription></div>
                {accounts?.length ? (
                  <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsGenerateLetterOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />Generate Letter
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                {!letters?.length ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium mb-1">No letters</h3>
                    <p className="text-gray-500 mb-4">Generate letters after uploading reports</p>
                    {accounts?.length ? (
                      <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsGenerateLetterOpen(true)}>
                        <FileText className="h-4 w-4 mr-2" />Generate First Letter
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Bureau</TableHead><TableHead>Type</TableHead><TableHead>Round</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {letters.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell><Badge variant="outline" className="capitalize">{l.bureau}</Badge></TableCell>
                          <TableCell className="capitalize">{l.letterType.replace(/_/g, " ")}</TableCell>
                          <TableCell>Round {l.round}</TableCell>
                          <TableCell><Badge variant={l.status === "resolved" ? "default" : "outline"} className={l.status === "resolved" ? "bg-green-100 text-green-700" : ""}>{l.status}</Badge></TableCell>
                          <TableCell>{format(new Date(l.createdAt), "MMM d, yyyy")}</TableCell>
                          <TableCell><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></TableCell>
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

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Credit Report</DialogTitle>
            <DialogDescription>Upload a report for {client.clientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bureau</Label>
              <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                <SelectTrigger><SelectValue placeholder="Select bureau..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transunion">TransUnion</SelectItem>
                  <SelectItem value="equifax">Equifax</SelectItem>
                  <SelectItem value="experian">Experian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <Input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={!selectedBureau || isUploading} />
              <p className="text-xs text-gray-500">PDF, PNG, JPG</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            {isUploading && <Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerateLetterOpen} onOpenChange={setIsGenerateLetterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Dispute Letter</DialogTitle>
            <DialogDescription>Select accounts for {client.clientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transunion">TransUnion</SelectItem>
                    <SelectItem value="equifax">Equifax</SelectItem>
                    <SelectItem value="experian">Experian</SelectItem>
                    <SelectItem value="furnisher">Furnisher</SelectItem>
                    <SelectItem value="collector">Collection Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={letterType} onValueChange={setLetterType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Dispute</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="escalation">Escalation</SelectItem>
                    <SelectItem value="debt_validation">Debt Validation</SelectItem>
                    <SelectItem value="intent_to_sue">Intent to Sue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Round</Label>
              <Input type="number" min={1} value={letterRound} onChange={(e) => setLetterRound(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label>Select Accounts</Label>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {accounts?.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <Checkbox checked={selectedAccounts.includes(a.id)} onCheckedChange={() => toggleAccountSelection(a.id)} />
                    <div className="flex-1">
                      <div className="font-medium">{a.accountName}</div>
                      <div className="text-sm text-gray-500">{a.accountType} • ${Number(a.balance || 0).toLocaleString()}</div>
                    </div>
                    {a.hasConflicts && <Badge variant="destructive" className="text-xs">Conflicts</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateLetterOpen(false)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleGenerateLetter} disabled={!selectedBureau || selectedAccounts.length === 0 || generateLetter.isPending}>
              {generateLetter.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><FileText className="h-4 w-4 mr-2" />Generate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
