import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  TrendingUp,
  Download,
  Eye,
  Clock,
  Shield,
  Bot,
  Trash2,
  Loader2,
  Printer,
  ArrowUpDown
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { FurnisherLetterModal } from "@/components/FurnisherLetterModal";
import { CreditScoreSimulator } from "@/components/CreditScoreSimulator";
import { Building2, Calculator } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [uploadingBureau, setUploadingBureau] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'separate' | 'combined'>('separate');
  const [furnisherModalAccount, setFurnisherModalAccount] = useState<any>(null);
  
  // Bulk account selection state
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<number>>(new Set());
  
  // Sort state for accounts
  const [sortBy, setSortBy] = useState<'default' | 'conflicts' | 'balance'>('default');

  // Fetch data
  const { data: creditReports, refetch: refetchReports } = trpc.creditReports.list.useQuery();
  const uploadToS3 = trpc.upload.uploadToS3.useMutation();
  const { data: negativeAccounts, refetch: refetchAccounts } = trpc.negativeAccounts.list.useQuery(
    undefined,
    {
      refetchInterval: (data) => {
        // Auto-refresh every 3 seconds if any reports are still being parsed
        const hasUnparsedReports = creditReports?.some(r => !r.isParsed);
        return hasUnparsedReports ? 3000 : false;
      },
    }
  );
  const { data: disputeLetters, refetch: refetchLetters } = trpc.disputeLetters.list.useQuery();

  // Letter generation state
  const [isGeneratingLetters, setIsGeneratingLetters] = useState(false);

  // Generate letters mutation - uses disputeLetters.generate endpoint
  const generateLettersMutation = trpc.disputeLetters.generate.useMutation({
    onSuccess: (data) => {
      const letterCount = data.letters?.length || 0;
      toast.success(`Generated ${letterCount} dispute letters for ${data.totalAccounts} accounts!`);
      refetchLetters();
      setIsGeneratingLetters(false);
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to generate letters: ${error.message}`);
      setIsGeneratingLetters(false);
    },
  });

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [previousAddress, setPreviousAddress] = useState('');
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  // Preview letter mutation
  const previewLetterMutation = trpc.disputeLetters.preview.useMutation({
    onSuccess: (data) => {
      setPreviewContent(data.previewContent);
      setShowPreviewModal(true);
      setIsLoadingPreview(false);
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to generate preview: ${error.message}`);
      setIsLoadingPreview(false);
    },
  });
  
  // Fetch user profile for address auto-fill
  const { data: userProfile } = trpc.profile.get.useQuery();

  const handleGenerateLetters = async () => {
    if (!negativeAccounts || negativeAccounts.length === 0) {
      toast.error('No negative accounts to dispute');
      return;
    }
    
    // If no accounts selected, use all accounts
    if (selectedAccountIds.size === 0) {
      // Auto-select all accounts
      setSelectedAccountIds(new Set(negativeAccounts.map(a => a.id)));
    }
    
    // Show address modal to collect user's address
    setShowAddressModal(true);
  };
  
  // Toggle account selection
  const toggleAccountSelection = (accountId: number) => {
    setSelectedAccountIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };
  
  // Select/deselect all accounts
  const toggleSelectAll = () => {
    if (!negativeAccounts) return;
    if (selectedAccountIds.size === negativeAccounts.length) {
      setSelectedAccountIds(new Set());
    } else {
      setSelectedAccountIds(new Set(negativeAccounts.map(a => a.id)));
    }
  };
  
  // Sort accounts based on selected criteria
  const sortedAccounts = negativeAccounts ? [...negativeAccounts].sort((a, b) => {
    if (sortBy === 'conflicts') {
      // Conflicts first (true = 1, false = 0, so we want descending)
      if (a.hasConflicts && !b.hasConflicts) return -1;
      if (!a.hasConflicts && b.hasConflicts) return 1;
      return 0;
    }
    if (sortBy === 'balance') {
      // Highest balance first
      const balanceA = parseFloat(String(a.balance || '0'));
      const balanceB = parseFloat(String(b.balance || '0'));
      return balanceB - balanceA;
    }
    return 0; // default order
  }) : [];

  const submitGenerateLetters = async () => {
    if (!currentAddress.trim()) {
      toast.error('Please enter your current address');
      return;
    }
    
    setShowAddressModal(false);
    setIsGeneratingLetters(true);
    
    try {
      // Pass selected account IDs if any are selected
      const accountIds = selectedAccountIds.size > 0 ? Array.from(selectedAccountIds) : undefined;
      
      await generateLettersMutation.mutateAsync({
        currentAddress,
        previousAddress: previousAddress || undefined,
        bureaus: ['transunion', 'equifax', 'experian'],
        accountIds,
      });
      
      // Clear selection after successful generation
      setSelectedAccountIds(new Set());
    } catch (error) {
      console.error('Letter generation failed:', error);
    }
  };

  // Mutations
  const uploadReport = trpc.creditReports.upload.useMutation({
    onSuccess: () => {
      toast.success("Credit report uploaded successfully!");
      refetchReports();
      setUploadingBureau(null);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploadingBureau(null);
    },
  });

  const handleFileUpload = async (bureau: "transunion" | "equifax" | "experian", file: File) => {
    setUploadingBureau(bureau);
    
    // Convert file to base64
    // Upload file to S3 first
    const fileKey = `credit-reports/${user?.id}/${bureau}/${Date.now()}-${file.name}`;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      try {
        // Upload to S3 via tRPC
        const uploadResult = await uploadToS3.mutateAsync({
          fileKey,
          fileData: Array.from(uint8Array),
          contentType: file.type,
        });
        
        // Now create credit report record
        await uploadReport.mutateAsync({
          bureau,
          fileName: file.name,
          fileUrl: uploadResult.url,
          fileKey: uploadResult.key,
        });
        
        toast.success(`${bureau} report uploaded successfully!`);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload file');
      } finally {
        setUploadingBureau(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Delete mutation
  const deleteReport = trpc.creditReports.delete.useMutation({
    onSuccess: () => {
      toast.success('Report deleted successfully');
      refetchReports();
      refetchAccounts();
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const handleDeleteReport = async (reportId: number) => {
    try {
      await deleteReport.mutateAsync({ id: reportId });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Calculate progress
  const hasAllReports = creditReports && creditReports.length >= 3;
  const hasAccounts = negativeAccounts && negativeAccounts.length > 0;
  const hasLetters = disputeLetters && disputeLetters.length > 0;
  const hasMailedLetters = disputeLetters?.some(l => l.status === "mailed");

  const progressSteps = [
    { done: hasAllReports, label: "Upload Reports" },
    { done: hasAccounts, label: "Review Accounts" },
    { done: hasLetters, label: "Generate Letters" },
    { done: hasMailedLetters, label: "Mail Letters" },
  ];
  const progress = (progressSteps.filter(s => s.done).length / progressSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DisputeStrike AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ai-assistant">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Credit Monitoring Progress</CardTitle>
            <CardDescription>Follow these steps on your credit journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {progressSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Reports
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Negative Accounts
              {negativeAccounts && negativeAccounts.length > 0 && (
                <Badge variant="destructive" className="ml-2">{negativeAccounts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="letters">
              <FileText className="h-4 w-4 mr-2" />
              Dispute Letters
              {disputeLetters && disputeLetters.length > 0 && (
                <Badge className="ml-2">{disputeLetters.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Mail className="h-4 w-4 mr-2" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="simulator">
              <Calculator className="h-4 w-4 mr-2" />
              Score Simulator
            </TabsTrigger>
          </TabsList>

          {/* Upload Reports Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Upload credit reports from all 3 bureaus for maximum effectiveness. Our AI will automatically 
                detect cross-bureau conflicts - your strongest weapon for deletions.
              </AlertDescription>
            </Alert>

            {/* Upload Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Method</CardTitle>
                <CardDescription>Choose how you want to upload your credit reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={uploadMode === 'separate' ? 'default' : 'outline'}
                    onClick={() => setUploadMode('separate')}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <Upload className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">3 Separate Files</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Upload TransUnion, Equifax, and Experian individually
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant={uploadMode === 'combined' ? 'default' : 'outline'}
                    onClick={() => setUploadMode('combined')}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">1 Combined File</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Upload one file containing all 3 bureau reports
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {uploadMode === 'separate' ? (
              <div className="grid md:grid-cols-3 gap-6">
              {(["transunion", "equifax", "experian"] as const).map((bureau) => {
                const report = creditReports?.find(r => r.bureau === bureau);
                const isUploading = uploadingBureau === bureau;

                return (
                  <Card key={bureau}>
                    <CardHeader>
                      <CardTitle className="capitalize">{bureau}</CardTitle>
                      <CardDescription>
                        {report ? "Report uploaded" : "No report yet"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            <span>Uploaded {new Date(report.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{report.fileName}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => window.open(report.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Report
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            id={`upload-${bureau}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(bureau, file);
                              }
                            }}
                            disabled={isUploading}
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById(`upload-${bureau}`)?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Report
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            PDF or image files accepted
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Combined Report</CardTitle>
                  <CardDescription>
                    Upload one file containing credit reports from all 3 bureaus (TransUnion, Equifax, Experian)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      id="upload-combined"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // For combined upload, we'll upload to all 3 bureaus
                          // The AI parser will split them automatically
                          toast.info('Uploading combined report...');
                          handleFileUpload('transunion', file);
                        }
                      }}
                      disabled={uploadingBureau !== null}
                    />
                    <Button
                      variant="outline"
                      className="w-full h-32"
                      onClick={() => document.getElementById('upload-combined')?.click()}
                      disabled={uploadingBureau !== null}
                    >
                      {uploadingBureau ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-semibold">Click to Upload</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              PDF or image files accepted
                            </div>
                          </div>
                        </div>
                      )}
                    </Button>
                    {creditReports && creditReports.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Uploaded Reports:</div>
                        {creditReports.map(report => (
                          <div key={report.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-secondary" />
                              <span className="text-sm capitalize">{report.bureau}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(report.fileUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {hasAllReports && (
              <Alert className="border-secondary bg-secondary/10">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <AlertDescription>
                  Great! All 3 reports uploaded. Now go to the <strong>Negative Accounts</strong> tab 
                  to review what we found.
                </AlertDescription>
              </Alert>
            )
          }

          {hasLetters && (
            <Alert className="border-blue-500 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-blue-900">
                  <strong>Ready to mail your letters?</strong> View our complete guide on what documents to include and how to send via Certified Mail.
                </span>
                <Button asChild variant="outline" size="sm" className="ml-4 flex-shrink-0">
                  <Link href="/mailing-instructions">
                    View Mailing Guide
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
            )}
          </TabsContent>

          {/* Negative Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            {!hasAllReports ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Upload all 3 credit reports first to see your negative accounts and cross-bureau conflicts.
                </AlertDescription>
              </Alert>
            ) : negativeAccounts && negativeAccounts.length > 0 ? (
              <div className="space-y-4">
                {/* Header with bulk selection controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Negative Accounts Found</h3>
                    <p className="text-sm text-muted-foreground">
                      {negativeAccounts.filter(a => a.hasConflicts).length} accounts have cross-bureau conflicts
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'default' | 'conflicts' | 'balance')}
                      className="px-3 py-1.5 text-sm border rounded-md bg-background"
                    >
                      <option value="default">Sort: Default</option>
                      <option value="conflicts">🚨 Conflicts First</option>
                      <option value="balance">💰 Highest Balance</option>
                    </select>
                    
                    {/* Select All / Deselect All */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedAccountIds.size === negativeAccounts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    
                    {/* Generate Letters Button */}
                    <Button 
                      onClick={handleGenerateLetters}
                      disabled={isGeneratingLetters}
                    >
                      {isGeneratingLetters ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                      ) : (
                        <><FileText className="h-4 w-4 mr-2" />
                          Generate Letters
                          {selectedAccountIds.size > 0 && selectedAccountIds.size < negativeAccounts.length && (
                            <span className="ml-1">({selectedAccountIds.size})</span>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Selection info banner */}
                {selectedAccountIds.size > 0 && selectedAccountIds.size < negativeAccounts.length && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300">
                      <strong>{selectedAccountIds.size} of {negativeAccounts.length}</strong> accounts selected for dispute. 
                      Click "Generate Letters" to create dispute letters for only the selected accounts.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  {sortedAccounts.map((account) => (
                    <Card 
                      key={account.id}
                      className={`cursor-pointer transition-all ${
                        selectedAccountIds.has(account.id) 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : ''
                      } ${
                        account.hasConflicts 
                          ? "border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-red-100 dark:shadow-red-900/20 shadow-lg" 
                          : ""
                      }`}
                      onClick={() => toggleAccountSelection(account.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div 
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                selectedAccountIds.has(account.id)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAccountSelection(account.id);
                              }}
                            >
                              {selectedAccountIds.has(account.id) && (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div>
                              <CardTitle className={`text-base ${account.hasConflicts ? "text-red-700 dark:text-red-400" : ""}`}>
                                {account.accountName}
                                {account.hasConflicts && (
                                  <span className="ml-2 text-red-600 dark:text-red-400 text-sm font-normal">
                                    ⚡ High Priority
                                  </span>
                                )}
                              </CardTitle>
                              <CardDescription>
                                {account.accountNumber && `Account: ${account.accountNumber}`}
                              </CardDescription>
                            </div>
                          </div>
                          {account.hasConflicts && (
                            <Badge className="bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              CONFLICT DETECTED
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Balance:</span>
                            <p className="font-semibold">${account.balance || "Unknown"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-semibold">{account.status || "Unknown"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Activity:</span>
                            <p className="font-semibold">{account.lastActivity || "Unknown"}</p>
                          </div>
                        </div>
                        
                        {/* Cross-Bureau Conflict Highlight Section */}
                        {account.hasConflicts && account.conflictDetails && (
                          <div className="mt-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-500">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-red-600 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                                🎯 Cross-Bureau Conflicts Detected - Your Strongest Deletion Argument!
                              </p>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                              When bureaus report different information, it proves the data is unverifiable and MUST be deleted under FCRA § 1681i(a)(5).
                            </p>
                            <ul className="text-sm space-y-2">
                              {JSON.parse(account.conflictDetails).map((conflict: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-red-300">
                                  <span className="text-red-600 font-bold">⚠️</span>
                                  <span className="text-red-800 font-medium">{conflict.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Furnisher Letter Button */}
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFurnisherModalAccount(account);
                            }}
                            className={`w-full ${account.hasConflicts ? "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" : ""}`}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            Dispute Directly with Creditor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {creditReports && creditReports.some(r => !r.isParsed) ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>AI is analyzing your reports... This may take 20-30 seconds. Please wait.</span>
                    </div>
                  ) : (
                    "No negative accounts found yet. Upload your credit reports to get started."
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Dispute Letters Tab */}
          <TabsContent value="letters" className="space-y-6">
            {disputeLetters && disputeLetters.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Your Dispute Letters</h3>
                    <p className="text-sm text-muted-foreground">
                      {disputeLetters.length} letters generated
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Open all letters in new tabs for printing
                        disputeLetters.forEach((letter, idx) => {
                          setTimeout(() => {
                            window.open(`/letter/${letter.id}?print=true`, '_blank');
                          }, idx * 500); // Stagger to avoid popup blocker
                        });
                        toast.success(`Opening ${disputeLetters.length} letters for printing...`);
                      }}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print All Letters
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Download all letters
                        disputeLetters.forEach((letter, idx) => {
                          setTimeout(() => {
                            window.open(`/api/letters/${letter.id}/pdf`, '_blank');
                          }, idx * 300);
                        });
                        toast.success(`Downloading ${disputeLetters.length} letters...`);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {disputeLetters.map((letter) => (
                    <Card key={letter.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base capitalize">{letter.bureau}</CardTitle>
                            <CardDescription>
                              Round {letter.round} • {letter.letterType}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={
                              letter.status === "resolved" ? "default" :
                              letter.status === "mailed" ? "secondary" :
                              "outline"
                            }
                          >
                            {letter.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/letter/${letter.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/letter/${letter.id}?print=true`, '_blank')}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                          {letter.status === "generated" && (
                            <Button size="sm" className="gradient-primary text-primary-foreground">
                              <Mail className="h-4 w-4 mr-2" />
                              Mark as Mailed
                            </Button>
                          )}
                        </div>
                        {letter.mailedAt && (
                          <div className="text-sm text-muted-foreground">
                            Mailed on {new Date(letter.mailedAt).toLocaleDateString()}
                            {letter.responseDeadline && (
                              <> • Response due by {new Date(letter.responseDeadline).toLocaleDateString()}</>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  No letters generated yet. Go to <strong>Negative Accounts</strong> and click "Generate Letters" 
                  to create your documentation-driven Dispute letters.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Track your dispute progress and get reminders when responses are due.
              </AlertDescription>
            </Alert>

            {/* Placeholder for tracking timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Dispute Timeline</CardTitle>
                <CardDescription>Track all your disputes in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Your dispute timeline will appear here once you mail your letters
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Score Simulator Tab */}
          <TabsContent value="simulator" className="space-y-6">
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertDescription>
                See the estimated impact of removing negative items from your credit report. Select accounts to simulate their removal.
              </AlertDescription>
            </Alert>

            {negativeAccounts && negativeAccounts.length > 0 ? (
              <CreditScoreSimulator 
                accounts={negativeAccounts.map(acc => ({
                  id: acc.id,
                  accountName: acc.accountName || 'Unknown Account',
                  accountType: acc.accountType || 'Unknown',
                  balance: acc.balance,
                  paymentStatus: acc.status,
                  dateOpened: acc.dateOpened,
                  hasConflicts: acc.hasConflicts || false,
                }))}
                currentScore={580}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Negative Accounts Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your credit reports to see negative accounts and simulate score improvements
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Furnisher Letter Modal */}
      {furnisherModalAccount && (
        <FurnisherLetterModal
          isOpen={!!furnisherModalAccount}
          onClose={() => setFurnisherModalAccount(null)}
          account={furnisherModalAccount}
          onSuccess={() => {
            refetchLetters();
          }}
        />
      )}

      {/* Address Modal for Letter Generation */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Enter Your Address</CardTitle>
              <CardDescription>
                We need your address to generate your dispute letters. This will appear on all letters sent to the credit bureaus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Address *</label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md text-sm"
                  rows={3}
                  placeholder="123 Main Street&#10;Apt 4B&#10;City, State 12345"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Previous Address (optional)</label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md text-sm"
                  rows={3}
                  placeholder="If you've moved in the last 2 years"
                  value={previousAddress}
                  onChange={(e) => setPreviousAddress(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (!currentAddress.trim()) {
                      toast.error('Please enter your address first');
                      return;
                    }
                    setIsLoadingPreview(true);
                    previewLetterMutation.mutate({
                      currentAddress,
                      previousAddress: previousAddress || undefined,
                      bureau: 'transunion',
                      accountIds: selectedAccountIds.size > 0 ? Array.from(selectedAccountIds) : undefined,
                    });
                  }}
                  disabled={!currentAddress.trim() || isLoadingPreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isLoadingPreview ? 'Loading...' : 'Preview'}
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={submitGenerateLetters}
                  disabled={!currentAddress.trim()}
                >
                  Generate Letters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-500" />
                Letter Preview
              </CardTitle>
              <CardDescription>
                Review the information that will be included in your dispute letters
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
                {previewContent}
              </pre>
            </CardContent>
            <div className="p-4 border-t flex gap-3 justify-end flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(false)}
              >
                Close Preview
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  setShowPreviewModal(false);
                  submitGenerateLetters();
                }}
              >
                Generate Letters Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
