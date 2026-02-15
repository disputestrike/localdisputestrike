/**
 * Dashboard Home - "Financial War Room" (Blueprint §2)
 * 
 * Features:
 * - Scoreboard Row: Real-time scores, Potential Delta, AI Strategist
 * - Progress Bar: 4-step dispute lifecycle
 * - 4 Metric Boxes: Violations, Deletions, Letters, Items Deleted
 * - Primary CTA: "Generate My Round 1 Dispute Letters" (triggers Identity Bridge)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import IdentityBridgeModal from "@/components/IdentityBridgeModal";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Bot,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardHome() {
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  
  // Fetch real data
  const { data: stats } = trpc.dashboardStats.get.useQuery();
  const { data: scoresByBureau } = trpc.creditReports.scoresByBureau.useQuery();
  const { data: userProfile } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  // Per-bureau scores from endpoint (each bureau has its own number from the report)
  const valid = (n: number | null | undefined) => (n != null && n >= 300 && n <= 850 ? n : null);
  const scores = {
    transunion: valid(scoresByBureau?.transunion),
    equifax: valid(scoresByBureau?.equifax),
    experian: valid(scoresByBureau?.experian),
  };

  const avgScore = Object.values(scores).filter(s => s !== null).reduce((a, b) => a! + b!, 0) / 
                   Object.values(scores).filter(s => s !== null).length || 0;
  
  // From AI analysis of report (dashboardStats); fallback when backend returns 0
  const violationsCount = stats?.totalViolationsFromAnalysis ?? stats?.totalNegativeAccounts ?? 0;
  let potentialDelta = stats?.potentialIncreaseAfterRound1 ?? 0;
  if (potentialDelta <= 0 && violationsCount > 0) {
    potentialDelta = Math.min(150, Math.min(5, violationsCount) * 25);
  }
  let targetScore = stats?.aiTargetScoreAfterRound1 ?? 0;
  if (targetScore <= 0 && avgScore > 0) {
    targetScore = Math.min(850, Math.round(avgScore + (potentialDelta || 85)));
  } else if (targetScore <= 0 && potentialDelta > 0) {
    targetScore = Math.min(850, 650 + potentialDelta);
  }

  const handleCompleteIdentity = async (data: any) => {
    // Save identity data and proceed to letter generation
    await utils.profile.update.mutateAsync(data);
    setIsIdentityModalOpen(false);
    // Redirect to letters page or start generation
    window.location.href = '/dashboard/letters?generate=true';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial War Room</h1>
            <p className="text-sm text-gray-500">Strategic Credit Restoration in Progress</p>
          </div>
          <Badge className="bg-accent/10 text-accent border-2 border-border self-start md:self-center">
            {userProfile?.subscriptionTier === 'complete' ? 'COMPLETE TIER' : 'ESSENTIAL TIER'}
          </Badge>
        </div>

        {/* SCOREBOARD ROW (Blueprint §2.1) - STRONG BORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-Time Scores */}
          <Card className="lg:col-span-2 bg-white border-2 border-gray-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Live Credit Scores</h3>
                <span className="text-xs text-primary font-bold flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> UPDATED FROM REPORT
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['transunion', 'equifax', 'experian'] as const).map((bureau) => {
                  const score = scores[bureau];
                  const colors: Record<string, { bg: string; border: string; text: string }> = {
                    transunion: { bg: 'bg-primary/5', border: 'border-border', text: 'text-primary' },
                    equifax: { bg: 'bg-primary/5', border: 'border-border', text: 'text-primary' },
                    experian: { bg: 'bg-accent/5', border: 'border-border', text: 'text-accent' },
                  };
                  const c = colors[bureau] || colors.transunion;
                  const short = bureau === 'transunion' ? 'TU' : bureau === 'equifax' ? 'EQ' : 'EX';
                  return (
                    <div key={bureau} className={cn("text-center p-3 rounded-lg border", c.bg, c.border)}>
                      <p className="text-xs font-medium text-gray-600 mb-1">{short}</p>
                      <p className={cn("text-2xl font-bold", score != null ? c.text : "text-gray-400")}>
                        {score != null ? score : "—"}
                      </p>
                      {score == null && <p className="text-xs text-gray-500 mt-0.5">From report</p>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
                <div className="p-3 bg-primary/10 rounded-lg border-2 border-border">
                  <p className="text-xs font-bold text-primary uppercase">Potential Increase After Round One</p>
                  <p className="text-2xl font-black text-primary">{potentialDelta > 0 ? `+${potentialDelta} Points` : "—"}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg border-2 border-border text-right">
                  <p className="text-xs font-bold text-accent uppercase">AI Target Score After Round One</p>
                  <p className="text-2xl font-black text-accent">{targetScore > 0 ? targetScore : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Strategist Widget */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-orange-400 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-orange-400/50">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">AI Strategist</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/95">
                "We've identified <span className="font-black text-accent">{stats?.totalViolationsFromAnalysis ?? stats?.totalNegativeAccounts ?? 0} violations</span> across your reports. By targeting the high-severity collections first, we can maximize your score delta in Round 1."
              </p>
              <div className="mt-6">
                <Button 
                  className="w-full bg-white hover:bg-gray-100 text-orange-600 font-bold h-10 shadow-md border-2 border-white"
                  onClick={() => window.location.href = '/dashboard/dispute-manager'}
                >
                  View Full Strategy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PROGRESS BAR (Blueprint §2.2) - STRONG BORDERS */}
        <Card className="bg-white border-2 border-gray-300 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between mb-4">
              {['Analyze', 'Generate', 'Send', 'Track'].map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                    i === 0 ? "bg-primary text-white border-border" : "bg-secondary text-muted-foreground border-border"
                  )}>
                    {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={cn("text-xs font-bold uppercase", i === 0 ? "text-gray-900" : "text-gray-500")}>{step}</span>
                </div>
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '25%' }} />
            </div>
          </CardContent>
        </Card>

        {/* 4 METRIC BOXES (Blueprint §2.3) - COLOR CODED WITH STRONG BORDERS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Violations', value: stats?.totalViolationsFromAnalysis ?? stats?.totalNegativeAccounts ?? 0, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
            { label: 'Estimated Deletions', value: Math.round(((stats?.totalViolationsFromAnalysis ?? stats?.totalNegativeAccounts ?? 0)) * 0.8), icon: TrendingUp, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
            { label: 'Letters Sent', value: stats?.totalLetters || 0, icon: Send, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
            { label: 'Items Deleted', value: stats?.deletedAccounts || 0, icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
          ].map((m) => (
            <Card key={m.label} className={cn("border-2 shadow-md", m.bg, m.border)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-lg bg-white border-2", m.border)}>
                    <m.icon className={cn("w-5 h-5", m.color)} />
                  </div>
                  <div>
                    <p className={cn("text-3xl font-black", m.color)}>{m.value}</p>
                    <p className="text-xs font-bold text-gray-600 uppercase">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PRIMARY CTA (Blueprint §2.4) */}
        <div className="flex justify-center pt-4">
          <Button 
            className="bg-accent hover:bg-accent/90 text-white px-12 py-8 text-xl font-black shadow-xl group"
            onClick={() => setIsIdentityModalOpen(true)}
          >
            GENERATE MY ROUND 1 DISPUTE LETTERS
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Identity Bridge Modal (Blueprint §5) */}
        <IdentityBridgeModal 
          isOpen={isIdentityModalOpen}
          onClose={() => setIsIdentityModalOpen(false)}
          onComplete={handleCompleteIdentity}
          requiresIdAndUtility={userProfile?.subscriptionTier === 'essential'}
          prefillData={{
            fullName: userProfile?.fullName ?? '',
            currentAddress: userProfile?.currentAddress ?? '',
            currentCity: userProfile?.currentCity ?? '',
            currentState: userProfile?.currentState ?? '',
            currentZip: userProfile?.currentZip ?? '',
            dateOfBirth: userProfile?.dateOfBirth ?? '',
            phone: userProfile?.phone ?? '',
            ssnLast4: userProfile?.ssnLast4 ?? '',
          }}
        />
      </div>
    </DashboardLayout>
  );
}
