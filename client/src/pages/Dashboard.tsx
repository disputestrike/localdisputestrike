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
  Bot
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [uploadingBureau, setUploadingBureau] = useState<string | null>(null);

  // Fetch data
  const { data: creditReports, refetch: refetchReports } = trpc.creditReports.list.useQuery();
  const uploadToS3 = trpc.upload.uploadToS3.useMutation();
  const { data: negativeAccounts, refetch: refetchAccounts } = trpc.negativeAccounts.list.useQuery();
  const { data: disputeLetters, refetch: refetchLetters } = trpc.disputeLetters.list.useQuery();

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
            <span className="font-bold text-xl">CreditCounsel AI</span>
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
            <CardTitle>Your Credit Repair Progress</CardTitle>
            <CardDescription>Follow these steps to clean your credit</CardDescription>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => window.open(report.fileUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Negative Accounts Found</h3>
                    <p className="text-sm text-muted-foreground">
                      {negativeAccounts.filter(a => a.hasConflicts).length} accounts have cross-bureau conflicts
                    </p>
                  </div>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Letters
                  </Button>
                </div>

                <div className="grid gap-4">
                  {negativeAccounts.map((account) => (
                    <Card key={account.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{account.accountName}</CardTitle>
                            <CardDescription>
                              {account.accountNumber && `Account: ${account.accountNumber}`}
                            </CardDescription>
                          </div>
                          {account.hasConflicts && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Conflicts Found
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
                        {account.hasConflicts && account.conflictDetails && (
                          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm font-semibold mb-2">Cross-Bureau Conflicts:</p>
                            <ul className="text-sm space-y-1">
                              {JSON.parse(account.conflictDetails).map((conflict: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                  <span>{conflict.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No negative accounts found yet. Our AI is analyzing your reports...
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Dispute Letters Tab */}
          <TabsContent value="letters" className="space-y-6">
            {disputeLetters && disputeLetters.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Your Dispute Letters</h3>
                    <p className="text-sm text-muted-foreground">
                      {disputeLetters.length} letters generated
                    </p>
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
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/letters/${letter.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Letter
                            </Link>
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
                  to create your litigation-grade dispute letters.
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
        </Tabs>
      </div>
    </div>
  );
}
