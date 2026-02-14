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
  Zap,
  ArrowRight,
  Target,
  BarChart3,
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
  const { data: onboardingPrefill } = trpc.profile.getOnboardingPrefill.useQuery(undefined, {
    enabled: showIdentityBridgeModal,
  });
  const { data: creditReports, refetch: refetchReports } = trpc.creditReports.list.useQuery();
  const { data: scoresByBureau } = trpc.creditReports.scoresByBureau.useQuery();
  const { data: stats } = trpc.dashboardStats.get.useQuery();
  const { data: disputeLetters, refetch: refetchLetters } = trpc.disputeLetters.list.useQuery();
  
  const completeIdentityBridgeMutation = trpc.profile.completeIdentityBridge.useMutation();
  const generateLettersMutation = trpc.disputeLetters.generate.useMutation();
  const savePreviewAnalysisMutation = trpc.creditReports.savePreviewAnalysis.useMutation();
  const utils = trpc.useUtils();

  // Save preview analysis when we have it (from upload) but not yet in DB — so Dashboard/My Live Report show the full report
  const [hasTriedSave, setHasTriedSave] = useState(false);
  useEffect(() => {
    const savePreviewIfNeeded = async () => {
      if (creditReports === undefined || hasTriedSave) return;
      setHasTriedSave(true);

      const previewData = sessionStorage.getItem('previewAnalysis') || localStorage.getItem('previewAnalysis');
      const hasReports = creditReports && creditReports.length > 0;
      console.log('[Dashboard] Preview check:', { hasPreviewData: !!previewData, creditReportsCount: creditReports?.length ?? 0 });

      if (!previewData) return;

      try {
        const analysis = JSON.parse(previewData);
        console.log('[Dashboard] Saving preview analysis to database...');
        await savePreviewAnalysisMutation.mutateAsync({ analysis });
        
        // Do NOT clear sessionStorage here - the onboarding modal needs it for prefill.
        // It gets cleared on next upload (GetReports overwrites) or when user completes onboarding.
        
        // Refresh all data
        await utils.creditReports.list.invalidate();
        await utils.creditReports.scoresByBureau.invalidate();
        await utils.profile.getOnboardingPrefill.invalidate();
        await utils.dashboardStats.get.invalidate();
        await utils.negativeAccounts.list.invalidate();
        
        toast.success('Your report is now loaded.');
      } catch (err: any) {
        console.error('[Dashboard] Failed to save preview analysis:', err);
        
        // Handle identity validation errors
        if (err?.message?.includes('Identity verification failed')) {
          // Clear bad cached data
          sessionStorage.removeItem('previewAnalysis');
          localStorage.removeItem('previewAnalysis');
          
          toast.error(
            '❌ ' + err.message,
            { 
              duration: 15000,
              description: 'Please upload YOUR OWN credit report that matches your account.'
            }
          );
        } else {
          toast.error(err?.message || 'Could not load report. Try again.');
        }
      }
    };

    savePreviewIfNeeded();
  }, [creditReports, hasTriedSave, savePreviewAnalysisMutation, utils]);

  // Per-bureau scores from endpoint (each bureau has its own number from the report)
  const scores = {
    transunion: scoresByBureau?.transunion ?? creditReports?.find(r => r.bureau === 'transunion')?.creditScore ?? null,
    equifax: scoresByBureau?.equifax ?? creditReports?.find(r => r.bureau === 'equifax')?.creditScore ?? null,
    experian: scoresByBureau?.experian ?? creditReports?.find(r => r.bureau === 'experian')?.creditScore ?? null,
  };
  const validScore = (n: number | null | undefined) => (n != null && n >= 300 && n <= 850 ? n : null);
  const scoresValid = {
    transunion: validScore(scores.transunion),
    equifax: validScore(scores.equifax),
    experian: validScore(scores.experian),
  };

  const avgScore = Object.values(scores).filter(s => s !== null).reduce((a, b) => a! + b!, 0) / 
                   (Object.values(scores).filter(s => s !== null).length || 1);
  
  const potentialDelta = 85;
  const targetScore = avgScore > 0 ? Math.min(850, Math.round(avgScore + potentialDelta)) : 750;

  // Auto-show onboarding modal after user sees their reports for a few seconds (once per session)
  // MUST be before early returns - hooks must run unconditionally
  const [hasAutoShownOnboarding, setHasAutoShownOnboarding] = useState(false);
  useEffect(() => {
    if (authLoading || !user || userProfile?.isComplete || hasAutoShownOnboarding) return;
    const timer = setTimeout(() => {
      setShowIdentityBridgeModal(true);
      setHasAutoShownOnboarding(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [authLoading, user, userProfile?.isComplete, hasAutoShownOnboarding]);

  // Build prefill data for onboarding modal - MUST be before early returns (hooks rule)
  const prefillData = React.useMemo(() => {
    const fromProfile = {
      fullName: userProfile?.fullName ?? '',
      currentAddress: userProfile?.currentAddress ?? '',
      currentCity: userProfile?.currentCity ?? '',
      currentState: userProfile?.currentState ?? '',
      currentZip: userProfile?.currentZip ?? '',
      previousAddress: userProfile?.previousAddress ?? '',
      previousCity: userProfile?.previousCity ?? '',
      previousState: userProfile?.previousState ?? '',
      previousZip: userProfile?.previousZip ?? '',
      dateOfBirth: userProfile?.dateOfBirth ?? '',
      phone: userProfile?.phone ?? '',
      ssnLast4: userProfile?.ssnLast4 ?? '',
    };
    
    const fromStorage = (() => {
      try {
        const raw = sessionStorage.getItem('previewAnalysis') || localStorage.getItem('previewAnalysis');
        if (!raw) {
          console.log('[Dashboard] No preview in storage');
          return null;
        }
        const analysis = JSON.parse(raw);
        const ci = analysis?.consumerInfo;
        if (!ci || typeof ci !== 'object') {
          console.log('[Dashboard] No consumerInfo in preview:', analysis);
          return null;
        }
        console.log('[Dashboard] Found consumerInfo in storage:', ci);
        return {
          fullName: ci.fullName ?? '',
          currentAddress: ci.currentAddress ?? '',
          currentCity: ci.currentCity ?? '',
          currentState: ci.currentState ?? '',
          currentZip: ci.currentZip ?? '',
          previousAddress: ci.previousAddress ?? '',
          previousCity: ci.previousCity ?? '',
          previousState: ci.previousState ?? '',
          previousZip: ci.previousZip ?? '',
          dateOfBirth: ci.dateOfBirth ?? '',
          phone: ci.phone ?? '',
          ssnLast4: ci.ssnLast4 ?? '',
        };
      } catch (e) {
        console.error('[Dashboard] Error parsing storage:', e);
        return null;
      }
    })();
    
    const fromServer = onboardingPrefill ?? null;
    console.log('[Dashboard] Prefill sources:', { fromProfile, fromStorage, fromServer });
    
    // Merge: storage as base (from upload), server overrides (from saved reports), profile fills remaining gaps
    const merged = { ...fromProfile };
    if (fromStorage) {
      for (const k of Object.keys(fromStorage) as (keyof typeof fromStorage)[]) {
        if (fromStorage[k]) merged[k] = fromStorage[k];
      }
    }
    if (fromServer) {
      for (const k of Object.keys(fromServer) as (keyof typeof fromServer)[]) {
        if (fromServer[k]) merged[k] = fromServer[k];
      }
    }
    
    console.log('[Dashboard] Final prefill:', merged);
    return merged;
  }, [userProfile, onboardingPrefill]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please sign in</div>;

  const handleGenerateLetters = () => {
    if (!userProfile?.isComplete) {
      setShowIdentityBridgeModal(true);
    } else {
      submitGenerateLetters();
    }
  };

  const submitGenerateLetters = async (override?: { currentAddress?: string; previousAddress?: string }) => {
    setIsGeneratingLetters(true);
    try {
      const currentAddress = override?.currentAddress ?? userProfile?.currentAddress;
      if (!currentAddress) {
        toast.error("Please complete your profile with a current mailing address.");
        setIsGeneratingLetters(false);
        return;
      }
      const previousAddress = override?.previousAddress ?? userProfile?.previousAddress;

      await generateLettersMutation.mutateAsync({
        bureaus: ['transunion', 'equifax', 'experian'],
        currentAddress,
        previousAddress: previousAddress || undefined,
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
    try {
      await completeIdentityBridgeMutation.mutateAsync(data);
      setShowIdentityBridgeModal(false);
      
      if (data.saveForLater) {
        // Essential: saved without ID/utility; they can complete later
        await utils.profile.get.invalidate();
        toast.success('Profile saved. When you have your ID and utility bill, click Complete Onboarding again to finish.');
        return;
      }
      
      // Full completion: clear cached preview and refresh
      sessionStorage.removeItem('previewAnalysis');
      localStorage.removeItem('previewAnalysis');
      
      await utils.profile.get.invalidate();
      await utils.creditReports.list.invalidate();
      await utils.creditReports.scoresByBureau.invalidate();
      await utils.dashboardStats.get.invalidate();
      await utils.negativeAccounts.list.invalidate();
      
      toast.success('✅ Onboarding complete! Your account is secured. You can now generate letters.');
    } catch (error: any) {
      // Identity validation failed - show clear error
      if (error.message?.includes('Identity verification failed')) {
        toast.error(error.message, { duration: 10000 }); // Show longer
      } else {
        toast.error(error.message || 'Failed to complete onboarding');
      }
      // Keep modal open so user can correct data
    }
  };

  // Manual save: pull report from storage into app (for debugging or if auto-save didn't run)
  const handleManualSave = async () => {
    const previewData = sessionStorage.getItem('previewAnalysis') || localStorage.getItem('previewAnalysis');
    if (!previewData) {
      toast.error('No preview analysis in storage');
      return;
    }
    try {
      const analysis = JSON.parse(previewData);
      await savePreviewAnalysisMutation.mutateAsync({ analysis });
      
      // Clear cached data after successful save
      sessionStorage.removeItem('previewAnalysis');
      localStorage.removeItem('previewAnalysis');
      
      // Refresh all data
      await utils.creditReports.list.invalidate();
      await utils.creditReports.scoresByBureau.invalidate();
      await utils.dashboardStats.get.invalidate();
      await utils.negativeAccounts.list.invalidate();
      await utils.profile.getOnboardingPrefill.invalidate();
      
      toast.success('Report loaded successfully.');
    } catch (err: any) {
      // Show identity validation errors clearly
      if (err?.message?.includes('Identity verification failed')) {
        toast.error(err.message, { duration: 10000 });
      } else {
        toast.error(err?.message || 'Save failed');
      }
    }
  };

  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Debug: Show if preview data exists */}
          {(sessionStorage.getItem('previewAnalysis') || localStorage.getItem('previewAnalysis')) && (!creditReports || creditReports.length === 0) && (
            <Alert className="mb-4 border border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="flex items-center justify-between">
                <span>Preview analysis found but not saved. Click to save:</span>
                <Button 
                  size="sm" 
                  onClick={handleManualSave}
                  disabled={savePreviewAnalysisMutation.isPending}
                  className="ml-4 bg-orange-500 hover:bg-orange-600"
                >
                  {savePreviewAnalysisMutation.isPending ? 'Saving...' : 'Save Analysis'}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Financial War Room</h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">Strategic Credit Restoration in Progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white text-gray-600 border-gray-200 font-medium px-3 py-1.5 text-sm">
                {userProfile?.subscriptionTier === 'complete' ? 'Complete Tier' : 'Essential Tier'}
              </Badge>
              <Button 
                onClick={handleGenerateLetters}
                disabled={isGeneratingLetters}
                className={cn(
                  userProfile?.isComplete
                    ? "bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                    : "bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md"
                )}
              >
                {isGeneratingLetters ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : userProfile?.isComplete ? (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Letters
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Live Credit Scores + AI Strategist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  Live Credit Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { short: 'TU', bureau: 'transunion' as const },
                    { short: 'EQ', bureau: 'equifax' as const },
                    { short: 'EX', bureau: 'experian' as const }
                  ].map((b) => {
                    const score = scoresValid[b.bureau];
                    return (
                      <div key={b.short} className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{b.short}</p>
                        <p className={cn("text-2xl font-bold mt-1 tracking-tight", score != null ? "text-gray-900" : "text-gray-400")}>
                          {score ?? "—"}
                        </p>
                        {score == null && <p className="text-xs text-gray-400 mt-0.5">From report</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 flex-1">
                    <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-600 text-center">Potential Increse After Round One</p>
                      <p className="text-xl font-bold text-gray-900 text-center">+{potentialDelta} Points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 flex-1 justify-end">
                    <div style={{     alignItems: "center", display: "flex", flexDirection: "column", width: "100%" }} className="text-right">
                      <p className="text-xs font-medium text-orange-600">AI Target Score After Round One</p>
                      <p className="text-xl font-bold text-gray-900">{targetScore}</p>
                    </div>
                    <Target className="w-5 h-5 text-orange-600 shrink-0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-orange-200 bg-orange-50 shadow-sm">
              <CardHeader className="pb-4 border-b border-orange-100">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bot className="w-4 h-4 text-orange-600" />
                  </div>
                  AI Strategist
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  We've identified <span className="font-semibold text-orange-600">{stats?.totalNegativeAccounts || 0} violations</span> across your reports. By targeting the high-severity collections first, we can maximize your score delta in Round 1.
                </p>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  onClick={() => setLocation('/dashboard/dispute-manager')}
                >
                  View Full Strategy
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding - Complete to unlock letter generation */}
          <Card
            className={cn(
              "transition-all cursor-pointer",
              userProfile?.isComplete
                ? "border-gray-200 bg-gray-50 opacity-75"
                : "border-orange-300 bg-orange-50 shadow-md hover:shadow-lg"
            )}
            onClick={() => !userProfile?.isComplete && setShowIdentityBridgeModal(true)}
          >
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    userProfile?.isComplete ? "bg-gray-200 text-gray-500" : "bg-orange-500 text-white"
                  )}
                >
                  {userProfile?.isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className={cn("font-semibold", userProfile?.isComplete ? "text-gray-500" : "text-orange-800")}>
                    {userProfile?.isComplete ? "Onboarding Complete" : "Complete Onboarding"}
                  </p>
                  <p className={cn("text-sm", userProfile?.isComplete ? "text-gray-400" : "text-orange-700")}>
                    {userProfile?.isComplete
                      ? "Your profile is saved for letter generation"
                      : "Confirm your info from your credit report to generate letters"}
                  </p>
                </div>
              </div>
              {!userProfile?.isComplete && (
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIdentityBridgeModal(true);
                  }}
                >
                  Complete Now
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-6">
              <div className="flex justify-between mb-4">
                {['Analyze', 'Generate', 'Send', 'Track'].map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                      i === 0 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
              <Progress value={25} className="h-2" />
            </CardContent>
          </Card>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Negative Items</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalNegativeAccounts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Found in AI analysis</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Letters Sent</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalLettersSent || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total dispute letters</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deletions</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalDeletions || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Items removed</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg. Time</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">34</p>
                <p className="text-xs text-gray-500 mt-1">Days to first result</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="letters" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Dispute Letters</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Credit Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {disputeLetters?.slice(0, 3).map((letter) => (
                        <div key={letter.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200">
                              <FileText className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{letter.bureau.toUpperCase()} Dispute Letter</p>
                              <p className="text-xs text-gray-500">{new Date(letter.createdAt!).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-medium">{letter.status}</Badge>
                        </div>
                      ))}
                      {(!disputeLetters || disputeLetters.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold shrink-0">1</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Generate your dispute letters</p>
                        <p className="text-xs text-gray-500 mt-0.5">Our AI will create custom letters for each bureau.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold shrink-0">2</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Review and send</p>
                        <p className="text-xs text-gray-500 mt-0.5">Download and mail your letters to the bureaus.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="letters" className="mt-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Dispute Letters</CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-0.5">Manage and track your generated dispute letters</CardDescription>
                  </div>
                  <Button onClick={handleGenerateLetters} disabled={isGeneratingLetters} className="bg-orange-500 hover:bg-orange-600">
                    {isGeneratingLetters ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Zap className="w-4 h-4 mr-2" />Generate New Letters</>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {disputeLetters?.map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{letter.bureau.toUpperCase()} Dispute Letter</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(letter.createdAt!).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Round {letter.round}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={letter.status === 'sent' ? 'default' : 'secondary'} className="font-medium">
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
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No letters generated yet</p>
                        <Button variant="outline" className="mt-4 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={handleGenerateLetters} disabled={isGeneratingLetters}>
                          {isGeneratingLetters ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                          ) : (
                            "Generate Your First Letters"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Credit Reports</CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-0.5">Your uploaded credit report files</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setLocation('/get-reports')} className="border-gray-200">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {creditReports?.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-gray-100 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.bureau.toUpperCase()} Report</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded on {new Date(report.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!creditReports || creditReports.length === 0) && (
                      <div className="text-center py-12">
                        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No reports uploaded yet</p>
                        <Button variant="outline" className="mt-4 border-gray-200" onClick={() => setLocation('/get-reports')}>
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
          requiresIdAndUtility={userProfile?.subscriptionTier === 'essential'}
          prefillData={prefillData}
        />
      </DashboardLayout>
    </React.Suspense>
  );
}
