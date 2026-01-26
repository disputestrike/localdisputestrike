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
  ArrowUpDown,
  Zap,
  ArrowRight,
  Send,
  Target,
  BarChart3,
  LayoutDashboard,
  Info,
  Search
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { LightAnalysisResult } from "@shared/types";
import { Link, useLocation } from "wouter";
import PreviewResults from "./PreviewResults";
import { cn, safeJsonParse } from "@/lib/utils";

const DashboardLayout = React.lazy(() => import("@/components/DashboardLayout"));
import IdentityBridgeModal, { type IdentityBridgeData } from "@/components/IdentityBridgeModal";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const pathname = location || "";
  const { user, loading: authLoading } = useAuth();
  const [isGeneratingLetters, setIsGeneratingLetters] = useState(false);
  const [showIdentityBridgeModal, setShowIdentityBridgeModal] = useState(false);

  // Fetch data - ALL HOOKS AT TOP LEVEL
  const { data: userProfile } = trpc.profile.get.useQuery();
  const { data: creditReports, refetch: refetchReports } = trpc.creditReports.list.useQuery();
  const { data: stats } = trpc.dashboardStats.get.useQuery();
  const { data: disputeLetters, refetch: refetchLetters } = trpc.disputeLetters.list.useQuery();
  
  const completeIdentityBridgeMutation = trpc.userProfile.completeIdentityBridge.useMutation();
  const generateLettersMutation = trpc.disputeLetters.generate.useMutation();

  // Scoreboard Row Logic (Blueprint §2.1)
  const getScore = (bureau: string) => {
    const report = creditReports?.find(r => r.bureau === bureau);
    if (report?.parsedData) {
      const parsedData = safeJsonParse(report.parsedData, null);
      if (parsedData === null) {
        console.error("Failed to parse JSON for report:", report.bureau, report.parsedData);
        return null;
      }
      return parsedData.creditScore || null;
    }
    return null;
  };

  const scores = {
    transunion: getScore('transunion'),
    equifax: getScore('equifax'),
    experian: getScore('experian'),
  };

  const avgScore = Object.values(scores).filter(s => s !== null).reduce((a, b) => a! + b!, 0) / 
                   (Object.values(scores).filter(s => s !== null).length || 1);
  
  const potentialDelta = 85; 
  const targetScore = avgScore > 0 ? Math.round(avgScore + potentialDelta) : 750;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please sign in</div>;

  const handleGenerateLetters = () => {
    if (!userProfile?.isComplete) {
      setShowIdentityBridgeModal(true);
    } else {
      submitGenerateLetters();
    }
  };

  const submitGenerateLetters = async () => {
    setIsGeneratingLetters(true);
    try {
      await generateLettersMutation.mutateAsync({
        bureaus: ['transunion', 'equifax', 'experian'],
      });
      toast.success('Letters generated successfully!');
      refetchLetters();
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate letters');
    } finally {
      setIsGeneratingLetters(false);
    }
  };

  const handleIdentityBridgeComplete = async (data: any) => {
    await completeIdentityBridgeMutation.mutateAsync(data);
    setShowIdentityBridgeModal(false);
    submitGenerateLetters();
  };

  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial War Room</h1>
              <p className="text-muted-foreground">Strategic Credit Restoration in Progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {userProfile?.subscriptionTier === 'complete' ? 'Complete Tier' : 'Essential Tier'}
              </Badge>
              <Button 
                onClick={handleGenerateLetters}
                disabled={isGeneratingLetters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isGeneratingLetters ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Letters
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* SCOREBOARD ROW (Blueprint §2.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Live Credit Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { name: 'TransUnion', score: scores.transunion, color: 'text-blue-600' },
                    { name: 'Equifax', score: scores.equifax, color: 'text-red-600' },
                    { name: 'Experian', score: scores.experian, color: 'text-purple-600' }
                  ].map((b) => (
                    <div key={b.name} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">{b.name}</p>
                      <p className={cn("text-3xl font-bold", b.score ? b.color : "text-gray-300")}>
                        {b.score || "---"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Potential Delta</p>
                      <p className="text-xl font-bold text-green-600">+{potentialDelta} Points</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">AI Target Score</p>
                    <p className="text-xl font-bold text-blue-600">{targetScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Bot className="w-5 h-5" />
                  AI Strategist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-primary-foreground/90">
                  "We've identified <span className="font-bold text-accent">{stats?.totalNegativeAccounts || 0} violations</span> across your reports. By targeting the high-severity collections first, we can maximize your score delta in Round 1."
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-accent hover:bg-accent/90 text-black font-bold border-none"
                  onClick={() => setLocation('/dashboard/dispute-manager')}
                >
                  View Full Strategy
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PROGRESS BAR (Blueprint §2.2) */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between mb-4">
                {['Analyze', 'Generate', 'Send', 'Track'].map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      i === 0 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {i === 0 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium">{step}</span>
                  </div>
                ))}
              </div>
              <Progress value={25} className="h-2" />
            </CardContent>
          </Card>

          {/* 4 METRIC BOXES (Blueprint §2.3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Negative Items</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalNegativeAccounts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Found in AI analysis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Letters Sent</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalLettersSent || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total dispute letters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Deletions</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalDeletions || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Items removed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Avg. Time</span>
                </div>
                <p className="text-3xl font-bold">34</p>
                <p className="text-xs text-muted-foreground mt-1">Days to first result</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="letters">Dispute Letters</TabsTrigger>
              <TabsTrigger value="reports">Credit Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {disputeLetters?.slice(0, 3).map((letter) => (
                        <div key={letter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded border">
                              <FileText className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{letter.bureau.toUpperCase()} Dispute Letter</p>
                              <p className="text-xs text-muted-foreground">{new Date(letter.createdAt!).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{letter.status}</Badge>
                        </div>
                      ))}
                      {(!disputeLetters || disputeLetters.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                      <div>
                        <p className="text-sm font-medium">Generate your dispute letters</p>
                        <p className="text-xs text-muted-foreground">Our AI will create custom letters for each bureau.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                      <div>
                        <p className="text-sm font-medium">Review and send</p>
                        <p className="text-xs text-muted-foreground">Download and mail your letters to the bureaus.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="letters">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Dispute Letters</CardTitle>
                    <CardDescription>Manage and track your generated dispute letters</CardDescription>
                  </div>
                  <Button onClick={handleGenerateLetters} disabled={isGeneratingLetters}>
                    {isGeneratingLetters ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate New Letters"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {disputeLetters?.map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{letter.bureau.toUpperCase()} Dispute Letter</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(letter.createdAt!).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Round {letter.round}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={letter.status === 'sent' ? 'default' : 'secondary'}>
                            {letter.status.toUpperCase()}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!disputeLetters || disputeLetters.length === 0) && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500">No letters generated yet</p>
                        <Button variant="outline" className="mt-4" onClick={handleGenerateLetters}>
                          Generate Your First Letters
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Credit Reports</CardTitle>
                    <CardDescription>Your uploaded credit report files</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setLocation('/get-reports')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {creditReports?.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{report.bureau.toUpperCase()} Report</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded on {new Date(report.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!creditReports || creditReports.length === 0) && (
                      <div className="text-center py-12">
                        <Upload className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500">No reports uploaded yet</p>
                        <Button variant="outline" className="mt-4" onClick={() => setLocation('/get-reports')}>
                          Upload Your Reports
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <IdentityBridgeModal 
          isOpen={showIdentityBridgeModal}
          onClose={() => setShowIdentityBridgeModal(false)}
          onComplete={handleIdentityBridgeComplete}
          prefillData={{
            fullName: userProfile?.fullName,
            address: userProfile?.address,
            city: userProfile?.city,
            state: userProfile?.state,
            zip: userProfile?.zip,
            dateOfBirth: userProfile?.dateOfBirth,
            phone: userProfile?.phone,
          }}
        />
      </DashboardLayout>
    </React.Suspense>
  );
}
