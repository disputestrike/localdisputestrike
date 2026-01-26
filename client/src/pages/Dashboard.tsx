
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
  Info
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { LightAnalysisResult } from "@shared/types";
import { Link, useLocation } from "wouter";
import PreviewResults from "./PreviewResults";
import { cn } from "@/lib/utils";

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
        <div className="space-y-8 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial War Room</h1>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Strategic Credit Restoration in Progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                {userProfile?.subscriptionTier === 'complete' ? 'COMPLETE TIER' : 'ESSENTIAL TIER'}
              </Badge>
              <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {userProfile?.fullName?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>

          {/* SCOREBOARD ROW (Blueprint §2.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Credit Scores</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-600 font-black uppercase tracking-wider">Live from Report</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8">
                  {[
                    { name: 'TransUnion', score: scores.transunion, color: 'text-blue-600', dot: 'bg-blue-500' },
                    { name: 'Equifax', score: scores.equifax, color: 'text-red-600', dot: 'bg-red-500' },
                    { name: 'Experian', score: scores.experian, color: 'text-purple-600', dot: 'bg-purple-500' }
                  ].map((b) => (
                    <div key={b.name} className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", b.dot)} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{b.name}</p>
                      </div>
                      <p className={cn("text-4xl font-black tracking-tighter", b.score ? "text-gray-900" : "text-gray-200")}>
                        {b.score || "---"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Potential Delta</p>
                      <p className="text-2xl font-black text-green-600">+{potentialDelta} Points</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4 flex-row-reverse">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">AI Target Score</p>
                      <p className="text-2xl font-black text-blue-600">{targetScore}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#002b5c] text-white border-none shadow-xl rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot className="w-32 h-32" />
              </div>
              <CardContent className="p-8 relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-300" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">AI Strategist</h3>
                </div>
                <div className="flex-1">
                  <p className="text-base leading-relaxed text-blue-50 font-medium italic mb-6">
                    "We've identified <span className="text-blue-300 font-black">{stats?.totalNegativeAccounts || 0} violations</span> across your reports. By targeting the high-severity collections first, we can maximize your score delta in Round 1."
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none font-black text-[11px] uppercase tracking-widest h-11 rounded-xl shadow-lg shadow-blue-900/50">
                  View Full Strategy
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PROGRESS BAR (Blueprint §2.2) */}
          <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between mb-6">
                {[
                  { name: 'Analyze', icon: Search },
                  { name: 'Generate', icon: FileText },
                  { name: 'Send', icon: Send },
                  { name: 'Track', icon: Target }
                ].map((step, i) => (
                  <div key={step.name} className="flex flex-col items-center gap-3 relative z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500",
                      i === 0 ? "bg-green-500 text-white shadow-lg shadow-green-100" : "bg-gray-50 text-gray-300 border border-gray-100"
                    )}>
                      {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", i === 0 ? "text-gray-900" : "text-gray-300")}>{step.name}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: '25%' }} />
              </div>
            </CardContent>
          </Card>

          {/* 4 METRIC BOXES (Blueprint §2.3) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Violations', value: stats?.totalNegativeAccounts || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
              { label: 'Estimated Deletions', value: Math.round((stats?.totalNegativeAccounts || 0) * 0.8), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Letters Sent', value: stats?.totalLettersSent || 0, icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
              { label: 'Items Deleted', value: stats?.totalDeletions || 0, icon: Trash2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            ].map((m) => (
              <Card key={m.label} className={cn("border shadow-sm rounded-2xl overflow-hidden", m.border)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", m.bg)}>
                      <m.icon className={cn("w-5 h-5", m.color)} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 tracking-tight">{m.value}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* PRIMARY CTA (Blueprint §2.4) */}
          <div className="flex flex-col items-center gap-4 pt-8">
            <Button 
              className="bg-[#ff6b00] hover:bg-[#e66000] text-white px-16 py-10 text-xl font-black rounded-2xl shadow-2xl shadow-orange-200 group transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleGenerateLetters}
              disabled={isGeneratingLetters}
            >
              {isGeneratingLetters ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  GENERATE MY ROUND 1 DISPUTE LETTERS
                  <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <Shield className="w-3 h-3" />
              Secure AI Generation • 256-Bit Encryption
            </div>
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

function Search(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
