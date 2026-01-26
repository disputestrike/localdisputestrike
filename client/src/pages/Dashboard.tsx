
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
  Send
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { LightAnalysisResult } from "@shared/types";
import { Link, useLocation } from "wouter";
import PreviewResults from "./PreviewResults";
import { cn } from "@/lib/utils";

const DashboardLayout = React.lazy(() => import("@/components/DashboardLayout"));
import { FurnisherLetterModal } from "@/components/FurnisherLetterModal";
import { LetterComparison } from "@/components/LetterComparison";
import { CreditScoreChart } from "@/components/CreditScoreChart";
import IdentityBridgeModal, { type IdentityBridgeData } from "@/components/IdentityBridgeModal";
import { Building2, Calculator, Scale, LineChart, Target, Calendar, BarChart3, LayoutDashboard } from "lucide-react";
import { DisputeSuccessPredictor } from "@/components/DisputeSuccessPredictor";
import { SmartLetterScheduler } from "@/components/SmartLetterScheduler";
import { BureauResponseAnalyzer } from "@/components/BureauResponseAnalyzer";
import { MobileUploadZone } from "@/components/MobileUploadZone";
import DocumentVault from "@/components/DocumentVault";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const pathname = location || "";
  const { user, loading: authLoading } = useAuth();
  const [uploadingBureau, setUploadingBureau] = useState<'transunion' | 'equifax' | 'experian' | 'combined' | null>(null);
  const [lightAnalysisResult, setLightAnalysisResult] = useState<LightAnalysisResult & { fileUrl: string } | null>(null);
  const [hydratedFromPreview, setHydratedFromPreview] = useState(false);
  const [uploadMode, setUploadMode] = useState<'separate' | 'combined'>('separate');
  const [dashboardTab, setDashboardTab] = useState<string>('mission');
  const [furnisherModalAccount, setFurnisherModalAccount] = useState<any>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<number>>(new Set());
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);

  // Fetch data - ALL HOOKS AT TOP LEVEL
  const { data: userProfile } = trpc.profile.get.useQuery();
  const { data: creditReports, refetch: refetchReports } = trpc.creditReports.list.useQuery();
  const { data: stats } = trpc.dashboardStats.get.useQuery();
  const { data: negativeAccounts, refetch: refetchAccounts } = trpc.negativeAccounts.list.useQuery(
    undefined,
    {
      refetchInterval: (data) => {
        const hasUnparsedReports = creditReports?.some(r => !r.isParsed);
        return hasUnparsedReports ? 3000 : false;
      },
    }
  );
  const { data: disputeLetters, refetch: refetchLetters } = trpc.disputeLetters.list.useQuery();
  const { data: userDocuments, refetch: refetchDocuments, isLoading: isLoadingDocuments } = trpc.documents.list.useQuery();
  
  const utils = trpc.useUtils();
  const uploadToS3 = trpc.upload.uploadToS3.useMutation();
  const createDocument = trpc.documents.create.useMutation();
  const deleteDocument = trpc.documents.delete.useMutation();
  const generateLettersMutation = trpc.disputeLetters.generate.useMutation();
  const completeIdentityBridgeMutation = trpc.userProfile.completeIdentityBridge.useMutation();
  const previewLetterMutation = trpc.disputeLetters.preview.useMutation();
  const uploadReport = trpc.creditReports.upload.useMutation();
  const deleteReport = trpc.creditReports.delete.useMutation();
  const reparseReport = trpc.creditReports.reparse.useMutation();

  const [sortBy, setSortBy] = useState<'default' | 'conflicts' | 'balance'>('default');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [isGeneratingLetters, setIsGeneratingLetters] = useState(false);
  const [showIdentityBridgeModal, setShowIdentityBridgeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [reparsingReportId, setReparsingReportId] = useState<number | null>(null);

  // Scoreboard Row Logic (Blueprint §2.1)
  const getScore = (bureau: string) => {
    const report = creditReports?.find(r => r.bureau === bureau);
    if (report?.parsedData) {
      const parsed = typeof report.parsedData === 'string' ? JSON.parse(report.parsedData) : report.parsedData;
      return parsed?.creditScore || null;
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

  // Sync tab to route
  useEffect(() => {
    if (pathname === "/dashboard/disputes") setDashboardTab("accounts");
    else if (pathname === "/dashboard/letters") setDashboardTab("letters");
    else if (pathname === "/dashboard" || pathname === "/dashboard/home") {
      setDashboardTab("mission");
    }
  }, [pathname]);

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
        <div className="space-y-8 pb-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial War Room</h1>
              <p className="text-sm text-gray-500">Strategic Credit Restoration in Progress</p>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 self-start md:self-center">
              {userProfile?.subscriptionTier === 'complete' ? 'COMPLETE TIER' : 'ESSENTIAL TIER'}
            </Badge>
          </div>

          {/* SCOREBOARD ROW (Blueprint §2.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border-2 border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Credit Scores</h3>
                  <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> UPDATED FROM REPORT
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(scores).map(([bureau, score]) => (
                    <div key={bureau} className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{bureau}</p>
                      <p className={cn("text-3xl font-black", score ? "text-gray-900" : "text-gray-300")}>
                        {score || "---"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Potential Delta</p>
                    <p className="text-xl font-black text-green-600">+{potentialDelta} Points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">AI Target Score</p>
                    <p className="text-xl font-black text-blue-600">{targetScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900 text-white border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-blue-300" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">AI Strategist</h3>
                </div>
                <p className="text-sm leading-relaxed text-blue-100 italic">
                  "We've identified {stats?.totalNegativeAccounts || 0} violations across your reports. By targeting the high-severity collections first, we can maximize your score delta in Round 1."
                </p>
                <div className="mt-6">
                  <Button variant="outline" className="w-full border-blue-700 text-blue-100 hover:bg-blue-800 text-xs h-8">
                    View Full Strategy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PROGRESS BAR (Blueprint §2.2) */}
          <Card className="bg-white border-2 border-gray-100">
            <CardContent className="p-6">
              <div className="flex justify-between mb-4">
                {['Analyze', 'Generate', 'Send', 'Track'].map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      i === 0 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {i === 0 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase", i === 0 ? "text-gray-900" : "text-gray-400")}>{step}</span>
                  </div>
                ))}
              </div>
              <Progress value={25} className="h-2 bg-gray-100" />
            </CardContent>
          </Card>

          {/* 4 METRIC BOXES (Blueprint §2.3) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Violations', value: stats?.totalNegativeAccounts || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Estimated Deletions', value: Math.round((stats?.totalNegativeAccounts || 0) * 0.8), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Letters Sent', value: stats?.totalLetters || 0, icon: Send, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Items Deleted', value: stats?.deletedAccounts || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((m) => (
              <Card key={m.label} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", m.bg)}>
                      <m.icon className={cn("w-4 h-4", m.color)} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900">{m.value}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{m.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* PRIMARY CTA (Blueprint §2.4) */}
          <div className="flex justify-center pt-4">
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-8 text-xl font-black shadow-xl shadow-orange-200 group"
              onClick={handleGenerateLetters}
            >
              GENERATE MY ROUND 1 DISPUTE LETTERS
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Identity Bridge Modal */}
          <IdentityBridgeModal 
            isOpen={showIdentityBridgeModal}
            onClose={() => setShowIdentityBridgeModal(false)}
            onComplete={handleIdentityBridgeComplete}
            prefillData={{
              fullName: userProfile?.fullName || '',
              address: userProfile?.currentAddress || '',
              city: userProfile?.currentCity || '',
              state: userProfile?.currentState || '',
              zip: userProfile?.currentZip || '',
              dateOfBirth: userProfile?.dateOfBirth || '',
              phone: userProfile?.phone || '',
            }}
          />
        </div>
      </DashboardLayout>
    </React.Suspense>
  );
}
