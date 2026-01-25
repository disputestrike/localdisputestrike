
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
import React, { useState } from "react";
import { toast } from "sonner";
import { LightAnalysisResult } from "@/server/creditReportParser";
import { Link, useLocation } from "wouter";
import PreviewResults from "./PreviewResults";

const DashboardLayout = React.lazy(() => import("@/components/DashboardLayout"));
import { FurnisherLetterModal } from "@/components/FurnisherLetterModal";
import { LetterComparison } from "@/components/LetterComparison";
import { CreditScoreChart } from "@/components/CreditScoreChart";
// CreditScoreSimulator moved to standalone page at /dashboard/score-simulator
import { Building2, Calculator, Scale, LineChart, Target, Calendar, BarChart3 } from "lucide-react";
import { DisputeSuccessPredictor } from "@/components/DisputeSuccessPredictor";
import { SmartLetterScheduler } from "@/components/SmartLetterScheduler";
import { BureauResponseAnalyzer } from "@/components/BureauResponseAnalyzer";
import { MobileUploadZone } from "@/components/MobileUploadZone";
import DocumentVault from "@/components/DocumentVault";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [uploadingBureau, setUploadingBureau] = useState<'transunion' | 'equifax' | 'experian' | 'combined' | null>(null);
  const [lightAnalysisResult, setLightAnalysisResult] = useState<LightAnalysisResult & { fileUrl: string } | null>(null);
  const [uploadMode, setUploadMode] = useState<'separate' | 'combined'>('separate');
  const [furnisherModalAccount, setFurnisherModalAccount] = useState<any>(null);
  
  // Bulk account selection state
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<number>>(new Set());

  // Fetch data
  const { data: userProfile } = trpc.profile.get.useQuery();
  const { data: creditReports, refetch: refetchReports } = trpc.creditReports.list.useQuery();

  const handleUpgrade = () => {
    setLocation('/pricing'); // Redirect to pricing page for upgrade
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Gating logic: If user is free and has uploaded a report, show preview
  // Agency and Paid users should NOT be gated
  const isFreeUser = !userProfile?.subscriptionTier || userProfile.subscriptionTier === 'none';
  const isAgencyUser = user?.accountType === 'agency';
  const isPaidUser = userProfile?.subscriptionTier && userProfile.subscriptionTier !== 'none';
  const hasUploadedReport = creditReports && creditReports.length > 0;
  
  // ONLY gate if user is strictly FREE and NOT an agency
  if (!isAgencyUser && !isPaidUser && isFreeUser && hasUploadedReport && lightAnalysisResult && lightAnalysisResult.totalViolations !== undefined) {
    return (
      <React.Suspense fallback={<div>Loading Layout...</div>}>
        <DashboardLayout>
          <PreviewResults 
            analysis={lightAnalysisResult} 
            onUpgrade={handleUpgrade} 
          />
        </DashboardLayout>
      </React.Suspense>
    );
  }
  
  // Sort state for accounts
  const [sortBy, setSortBy] = useState<'default' | 'conflicts' | 'balance'>('default');
  
  // Drag and drop state
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Fetch data
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
  
  // Document vault queries
  const { data: userDocuments, refetch: refetchDocuments, isLoading: isLoadingDocuments } = trpc.documents.list.useQuery();
  const createDocument = trpc.documents.create.useMutation();
  const deleteDocument = trpc.documents.delete.useMutation();

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
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [addressChanged, setAddressChanged] = useState(false);
  
  // Parsed personal info from credit reports (PRIMARY source)
  const [parsedPersonalInfo, setParsedPersonalInfo] = useState<{
    fullName: string;
    currentAddress: string;
    previousAddresses: string[];
    dateOfBirth: string | null;
    ssnLast4: string | null;
  } | null>(null);
  
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

  // Combined upload mutation for 3-bureau reports
  // Full upload will be triggered after the user upgrades.

  // The original mutation is commented out to enforce the FREE preview flow.
  // const uploadCombinedReport = trpc.creditReports.uploadCombined.useMutation({
  //   onSuccess: () => {
  //     toast.success("Combined report uploaded! AI is extracting accounts from all 3 bureaus...");
  //     refetchReports();
  //     setUploadingBureau(null);
  //   },
  //   onError: (error) => {
  //     toast.error(`Upload failed: ${error.message}`);
  //     setUploadingBureau(null);
  //   },
  // });

  const lightAnalysisQuery = trpc.creditReports.lightAnalysis.useQuery(
    { fileUrl: lightAnalysisResult?.fileUrl || '' },
    {
      enabled: !!lightAnalysisResult?.fileUrl && !lightAnalysisResult.totalViolations, // Only run if fileUrl is set and we haven't run analysis yet
      onSuccess: (data) => {
        setLightAnalysisResult({ ...data, fileUrl: lightAnalysisResult!.fileUrl });
        toast.success("Light analysis complete! Review your results.");
        // We don't navigate here, we use the state change to render the Preview component
      },
      onError: (error) => {
        toast.error(`Analysis failed: ${error.message}`);
        setUploadingBureau(null);
      },
    }
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, bureau: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(bureau);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, bureau: "transunion" | "equifax" | "experian") => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        handleFileUpload(bureau, file);
      } else {
        toast.error('Please upload a PDF or image file');
      }
    }
  };

  const handleFileUpload = async (bureau: "transunion" | "equifax" | "experian" | "combined", file: File) => {
    setUploadingBureau(bureau);
    toast.info(`Preparing ${bureau} upload...`);
    
    try {
      // 1. Get upload info from server (generates file key and upload URL)
      const uploadResult = await uploadToS3.mutateAsync({
        fileKey: `credit-reports/${bureau}/${Date.now()}_${file.name}`,
        contentType: file.type as any,
      });

      // 2. Upload file to server using FormData (Railway volume storage)
      toast.info('Uploading file to secure storage...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bureau', bureau);
      formData.append('fileKey', uploadResult.key);
      
      // Ensure we use the absolute URL if provided, otherwise relative
      const uploadUrl = uploadResult.uploadUrl.startsWith('http') 
        ? uploadResult.uploadUrl 
        : `${window.location.origin}${uploadResult.uploadUrl}`;

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for auth
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      const fileUrl = uploadData.fileUrl || uploadResult.url;
      const fileKey = uploadData.fileKey || uploadResult.key;

      console.log('[handleFileUpload] File uploaded successfully:', fileUrl);

      if (bureau === 'combined') {
        if (!isAgencyUser && isFreeUser) {
          // 3a. For combined reports, trigger light analysis for the FREE preview
          setLightAnalysisResult({ fileUrl: fileUrl } as any);
          toast.info('File uploaded. Running light analysis...');
        } else {
          // 3b. For combined reports for paid/agency users, use uploadCombined endpoint
          await trpc.creditReports.uploadCombined.mutateAsync({
            fileName: file.name,
            fileUrl: fileUrl,
            fileKey: fileKey,
          });
          toast.success(`Combined report uploaded successfully! AI is extracting accounts...`);
          refetchReports();
        }
      } else {
        // 3c. For individual reports, create the record and trigger full parsing
        await uploadReport.mutateAsync({
          bureau: bureau as any,
          fileName: file.name,
          fileUrl: fileUrl,
          fileKey: fileKey,
        });
        toast.success(`${bureau.charAt(0).toUpperCase() + bureau.slice(1)} report uploaded successfully!`);
        refetchReports();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUploadingBureau(null);
    }
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

  // Re-parse mutation
  const [reparsingReportId, setReparsingReportId] = useState<number | null>(null);
  const reparseReport = trpc.creditReports.reparse.useMutation({
    onSuccess: () => {
      toast.success('Re-parsing started! AI is extracting accounts with improved detection...');
      refetchReports();
      // Start polling for updates
      setTimeout(() => {
        refetchAccounts();
        setReparsingReportId(null);
      }, 5000);
    },
    onError: (error) => {
      toast.error(`Re-parse failed: ${error.message}`);
      setReparsingReportId(null);
    },
  });

  const handleReparseReport = async (reportId: number) => {
    setReparsingReportId(reportId);
    try {
      await reparseReport.mutateAsync({ id: reportId });
    } catch (error) {
      console.error('Re-parse failed:', error);
    }
  };

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
    <DashboardLayout>
      <div className="space-y-6">
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Accounts
              {negativeAccounts && negativeAccounts.length > 0 && (
                <Badge variant="destructive" className="ml-2">{negativeAccounts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="letters">
              <FileText className="h-4 w-4 mr-2" />
              Letters
              {disputeLetters && disputeLetters.length > 0 && (
                <Badge className="ml-2">{disputeLetters.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Mail className="h-4 w-4 mr-2" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="score">
              <LineChart className="h-4 w-4 mr-2" />
              Score
            </TabsTrigger>
            <TabsTrigger value="compare">
              <Scale className="h-4 w-4 mr-2" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="progress">
              <Target className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="documents">
              <Shield className="h-4 w-4 mr-2" />
              Documents
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
                        <div className="space-y-3">
                          {/* Parsing Status */}
                          {!report.isParsed || reparsingReportId === report.id ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-sm text-blue-700">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="font-medium">AI is analyzing your report...</span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Extracting negative accounts from all pages. This may take 30-60 seconds.
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Account Count - show total since accounts aren't bureau-specific */}
                              {(() => {
                                // Total accounts across all bureaus (accounts are deduplicated)
                                const totalAccounts = negativeAccounts?.length || 0;
                                // Show per-bureau estimate (roughly 1/3 of total per bureau)
                                const accountCount = Math.ceil(totalAccounts / 3);
                                const isLowCount = totalAccounts < 15;
                                return (
                                  <div className={`rounded-lg p-3 ${isLowCount ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-sm">
                                        {isLowCount ? (
                                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        )}
                                        <span className={`font-medium ${isLowCount ? 'text-amber-700' : 'text-green-700'}`}>
                                          {totalAccounts} total negative account{totalAccounts !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </div>
                                    {isLowCount && totalAccounts > 0 && (
                                      <p className="text-xs text-amber-600 mt-1">
                                        This seems low for a credit report. Try re-parsing to extract more accounts.
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </>
                          )}
                          
                          {/* Credit Score Display */}
                          {(report as any).creditScore && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs text-blue-600 font-medium">{(report as any).scoreModel || 'Credit Score'}</div>
                                  <div className="text-2xl font-bold text-blue-700">{(report as any).creditScore}</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  (report as any).creditScore >= 740 ? 'bg-green-100 text-green-700' :
                                  (report as any).creditScore >= 670 ? 'bg-yellow-100 text-yellow-700' :
                                  (report as any).creditScore >= 580 ? 'bg-orange-100 text-orange-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {(report as any).creditScore >= 740 ? 'Excellent' :
                                   (report as any).creditScore >= 670 ? 'Good' :
                                   (report as any).creditScore >= 580 ? 'Fair' : 'Poor'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            <span>Uploaded {new Date(report.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{report.fileName}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => window.open(report.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleReparseReport(report.id)}
                              disabled={reparsingReportId === report.id || !report.isParsed}
                            >
                              {reparsingReportId === report.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Parsing...
                                </>
                              ) : (
                                <>
                                  <Bot className="h-4 w-4 mr-2" />
                                  Re-parse
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                          />
                          <MobileUploadZone
                            bureau={bureau}
                            onFileSelect={(file) => handleFileUpload(bureau, file)}
                            isUploading={isUploading}
                            hasExistingReport={false}
                          />
                        </>
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
                          handleFileUpload('combined', file);
                        }
                      }}
                    />
                    <div
                      className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${
                        dragOver === 'combined' ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                      onClick={() => document.getElementById('upload-combined')?.click()}
                      onDragOver={(e) => handleDragOver(e, 'combined')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'combined' as any)}
                    >
                      {uploadingBureau === 'combined' ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          <div className="text-center">
                            <p className="font-semibold">Uploading Combined Report...</p>
                            <p className="text-sm text-muted-foreground">This may take a moment for large files</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-primary/10 rounded-full">
                            <Upload className="h-10 w-10 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">
                              Upload your 3-bureau report (PDF or Image) for a free analysis
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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

          {/* Score Tracker Tab */}
          <TabsContent value="score" className="space-y-6">
            <CreditScoreChart 
              currentScore={(() => {
                const scores = creditReports?.map(r => (r as any).creditScore).filter(Boolean) || [];
                return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              })()}
              targetScore={750}
            />
          </TabsContent>

          {/* Letter Comparison Tab */}
          <TabsContent value="compare" className="space-y-6">
            <LetterComparison 
              accountCount={negativeAccounts?.length || 0}
              conflictCount={negativeAccounts?.filter(a => a.hasConflicts).length || 0}
            />
          </TabsContent>

          {/* Progress & Analytics Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Track your dispute progress, get AI-powered success predictions, and optimize your mailing strategy.
              </AlertDescription>
            </Alert>

            {/* Dispute Success Predictor */}
            <DisputeSuccessPredictor 
              accounts={negativeAccounts?.map(a => ({
                id: a.id,
                accountName: a.accountName,
                accountNumber: a.accountNumber || undefined,
                accountType: a.accountType || undefined,
                balance: a.balance || undefined,
                status: a.status || undefined,
                dateOpened: a.dateOpened || undefined,
                lastActivity: a.lastActivity || undefined,
                originalCreditor: a.originalCreditor || undefined,
                transunionData: a.transunionData || undefined,
                equifaxData: a.equifaxData || undefined,
                experianData: a.experianData || undefined,
                hasConflicts: a.hasConflicts || undefined,
                conflictDetails: a.conflictDetails || undefined,
              })) || []}
              onSelectAccounts={(ids) => {
                toast.info(`Selected ${ids.length} accounts for dispute`);
              }}
            />

            {/* Smart Letter Scheduler */}
            <SmartLetterScheduler 
              letters={disputeLetters?.map(l => ({
                id: l.id,
                bureau: l.bureau,
                status: l.status,
                createdAt: l.createdAt.toISOString(),
                mailedAt: l.mailedAt ? l.mailedAt.toISOString() : undefined,
                responseDeadline: l.responseDeadline ? l.responseDeadline.toISOString() : undefined,
              })) || []}
              onScheduleMail={(letterId, date) => {
                toast.success(`Letter scheduled for ${date.toLocaleDateString()}`);
              }}
            />

            {/* Bureau Response Analyzer */}
            <BureauResponseAnalyzer 
              outcomes={disputeLetters?.filter(l => l.status !== 'generated' && l.status !== 'downloaded').map(l => ({
                id: l.id,
                accountName: `${l.bureau.charAt(0).toUpperCase() + l.bureau.slice(1)} Dispute`,
                bureau: l.bureau,
                outcome: l.status === 'resolved' ? 'deleted' as const :
                         l.status === 'response_received' ? 'verified' as const :
                         l.status === 'mailed' ? 'pending' as const : 'pending' as const,
                responseReceivedAt: l.responseReceivedAt ? l.responseReceivedAt.toISOString() : undefined,
                letterMailedAt: l.mailedAt ? l.mailedAt.toISOString() : undefined,
                deadlineDate: l.responseDeadline ? l.responseDeadline.toISOString() : undefined,
                responseNotes: l.responseDetails || undefined,
              })) || []}
              onGenerateFollowUp={(outcomeId, strategy) => {
                toast.info(`Generating ${strategy} follow-up letter...`);
              }}
              onFileCFPB={(bureau) => {
                window.open('https://www.consumerfinance.gov/complaint/', '_blank');
                toast.info(`Opening CFPB complaint form for ${bureau}`);
              }}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Securely store your ID documents, proof of address, and dispute-related files. All documents are encrypted and only accessible by you.
              </AlertDescription>
            </Alert>

            <DocumentVault 
              onUpload={async (file, documentType, documentName) => {
                try {
                  // Read file as array buffer
                  const arrayBuffer = await file.arrayBuffer();
                  const fileData = Array.from(new Uint8Array(arrayBuffer));
                  
                  // Map mime type to allowed content type
                  const contentTypeMap: Record<string, 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/gif'> = {
                    'application/pdf': 'application/pdf',
                    'image/jpeg': 'image/jpeg',
                    'image/jpg': 'image/jpeg',
                    'image/png': 'image/png',
                    'image/gif': 'image/gif',
                  };
                  const contentType = contentTypeMap[file.type] || 'application/pdf';
                  
                  // Upload to S3
                  const result = await uploadToS3.mutateAsync({
                    fileKey: `documents/${Date.now()}_${file.name}`,
                    fileData,
                    contentType,
                  });
                  
                  // Create document record
                  await createDocument.mutateAsync({
                    documentType: documentType as any,
                    documentName,
                    fileKey: result.key,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                  });
                  
                  refetchDocuments();
                  toast.success('Document uploaded successfully');
                } catch (error) {
                  console.error('Upload error:', error);
                  toast.error('Failed to upload document');
                }
              }}
              onDelete={async (documentId) => {
                await deleteDocument.mutateAsync({ documentId });
                refetchDocuments();
                toast.success('Document deleted');
              }}
              documents={userDocuments || []}
              isLoading={isLoadingDocuments}
            />
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

      {/* Address Verification Modal for Letter Generation */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Verify Your Information
              </CardTitle>
              <CardDescription>
                Your personal information is pulled from your credit reports. Please verify it's correct.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show parsed info from credit report */}
              {userProfile && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm">
                    <strong>From Your Credit Reports:</strong>
                    <div className="mt-2 space-y-1">
                      <div><span className="text-gray-500">Name:</span> {userProfile.fullName || 'Not found'}</div>
                      <div><span className="text-gray-500">DOB:</span> {userProfile.dateOfBirth || 'Not found'}</div>
                      <div><span className="text-gray-500">SSN:</span> {userProfile.ssnLast4 ? `XXX-XX-${userProfile.ssnLast4}` : 'Not found'}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Address verification */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Current Address *
                  {!addressChanged && userProfile?.currentAddress && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">From Credit Report</Badge>
                  )}
                </label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md text-sm"
                  rows={3}
                  placeholder="123 Main Street&#10;City, State 12345"
                  value={currentAddress}
                  onChange={(e) => {
                    setCurrentAddress(e.target.value);
                    if (userProfile?.currentAddress && e.target.value !== userProfile.currentAddress) {
                      setAddressChanged(true);
                    }
                  }}
                />
                {!currentAddress && userProfile?.currentAddress && (
                  <Button
                    variant="link"
                    className="text-xs p-0 h-auto text-orange-600"
                    onClick={() => {
                      const fullAddr = [userProfile.currentAddress, userProfile.currentCity, userProfile.currentState, userProfile.currentZip].filter(Boolean).join(', ');
                      setCurrentAddress(fullAddr || '');
                    }}
                  >
                    Use address from credit report
                  </Button>
                )}
              </div>
              
              {/* Address change warning */}
              {addressChanged && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-sm text-yellow-800">
                    <strong>Address Changed:</strong> If you've moved, include a utility bill as proof of your new address. The letter will include an "ADDRESS CORRECTION" section.
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <label className="text-sm font-medium">Previous Address (if moved in last 2 years)</label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md text-sm"
                  rows={2}
                  placeholder="Previous address for bureau verification"
                  value={previousAddress}
                  onChange={(e) => setPreviousAddress(e.target.value)}
                />
              </div>
              
              {/* Phone & Email - only fields user needs to provide */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Phone (optional)</label>
                  <input
                    type="tel"
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    placeholder="(555) 123-4567"
                    defaultValue={userProfile?.phone || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email (optional)</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    placeholder="you@email.com"
                    defaultValue={userProfile?.email || user?.email || ''}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddressModal(false);
                    setAddressChanged(false);
                  }}
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
    </DashboardLayout>
  );
}
