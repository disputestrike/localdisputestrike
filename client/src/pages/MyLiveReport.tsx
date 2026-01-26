import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Lock,
  Clock,
  ChevronRight,
  Zap,
  Target,
  DollarSign,
  Star,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from '@/components/DashboardLayout';
import { CONSUMER_PRICE_LABELS } from "@/lib/pricing";

// Interfaces copied from CreditAnalysis.tsx
interface CreditScore {
  bureau: string;
  score: number;
  change?: number;
}

interface NegativeItem {
  id: number;
  accountName: string;
  accountType: string;
  balance: number;
  bureau: string;
  status: string;
  dateOpened?: string;
  lastActivity?: string;
  isRecommended: boolean;
  winProbability: number;
  recommendationReason: string;
  hasConflicts: boolean;
}

interface AnalysisData {
  scores: CreditScore[];
  negativeItems: NegativeItem[];
  totalNegativeItems: number;
  estimatedScoreIncrease: number;
  estimatedInterestSavings: number;
  trialEndsAt: string;
  subscription: { status: string; tier: string };
}

const BUREAU_LABELS: Record<string, string> = {
  transunion: "TransUnion",
  equifax: "Equifax",
  experian: "Experian",
};

const MAX_ITEMS_PER_ROUND = 5;

const getScoreColor = (score: number) => {
  if (score >= 740) return 'text-green-600';
  if (score >= 670) return 'text-yellow-600';
  if (score >= 580) return 'text-orange-600';
  return 'text-red-600';
};

const getScoreLabel = (score: number) => {
  if (score >= 740) return 'Excellent';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

const getScoreBgColor = (score: number) => {
  if (score >= 740) return 'bg-green-100';
  if (score >= 670) return 'bg-yellow-100';
  if (score >= 580) return 'bg-orange-100';
  return 'bg-red-100';
};

export default function MyLiveReport() {
  const [, setLocation] = useLocation();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: creditReports = [], isLoading: reportsLoading } = trpc.creditReports.list.useQuery();
  const { data: negativeAccounts = [], isLoading: accountsLoading } = trpc.negativeAccounts.list.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();

  const analysis = useMemo((): AnalysisData => {
    const scores: CreditScore[] = [
      { bureau: "TransUnion", score: 0 },
      { bureau: "Equifax", score: 0 },
      { bureau: "Experian", score: 0 },
    ];
    const byBureau: Record<string, CreditScore> = {
      TransUnion: scores[0],
      Equifax: scores[1],
      Experian: scores[2],
    };
    for (const r of creditReports) {
      const label = BUREAU_LABELS[r.bureau] || r.bureau;
      const existing = byBureau[label];
      if (existing && r.creditScore != null) {
        existing.score = r.creditScore;
      }
    }
    const negativeItems: NegativeItem[] = negativeAccounts.map((a) => {
      const bal = typeof a.balance === "string" ? parseFloat(a.balance) || 0 : Number(a.balance) || 0;
      const hasConflicts = !!a.hasConflicts;
      const bureauLabel = (a.bureau || "")
        .split(/[,/]/)
        .map((b) => BUREAU_LABELS[b.trim().toLowerCase()] || b.trim())
        .filter(Boolean)
        .join(", ") || "—";
      return {
        id: a.id,
        accountName: a.accountName || "Unknown",
        accountType: a.accountType || "Unknown",
        balance: bal,
        bureau: bureauLabel || "—",
        status: a.status || "—",
        dateOpened: a.dateOpened ?? undefined,
        lastActivity: a.lastActivity ?? undefined,
        isRecommended: hasConflicts,
        winProbability: hasConflicts ? 78 : 55,
        recommendationReason: hasConflicts
          ? "Conflicts across bureaus – strong dispute case"
          : "Standard dispute opportunity",
        hasConflicts,
      };
    });

    const totalNegativeItems = negativeItems.length;
    const conflictCount = negativeItems.filter((i) => i.hasConflicts).length;
    const estimatedScoreIncrease = Math.min(120, conflictCount * 15 + (totalNegativeItems - conflictCount) * 6);
    const totalBalance = negativeItems.reduce((sum, i) => sum + i.balance, 0);
    const estimatedInterestSavings = Math.round(totalBalance * 0.12);

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    const subscriptionTier = (profile as { subscriptionTier?: string })?.subscriptionTier ?? "none";
    const subStatus = subscriptionTier === "none" ? "trial" : "active";

    return {
      scores,
      negativeItems,
      totalNegativeItems,
      estimatedScoreIncrease,
      estimatedInterestSavings,
      trialEndsAt: trialEnd.toISOString(),
      subscription: { status: subStatus, tier: subscriptionTier },
    };
  }, [creditReports, negativeAccounts, profile]);

  const isLoading = reportsLoading || accountsLoading;

  const allNegativeItems = analysis?.negativeItems || [];
  const recommendedItems = allNegativeItems.filter(item => item.isRecommended);
  const otherItems = allNegativeItems.filter(item => !item.isRecommended);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      if (prev.length >= MAX_ITEMS_PER_ROUND) {
        return prev; // Don't add if already at max
      }
      return [...prev, itemId];
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your credit analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasNoData = !analysis.totalNegativeItems && !creditReports.length;
  if (hasNoData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center max-w-md mx-auto">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No credit data yet</h1>
          <p className="text-gray-600 mb-6">
            Upload your credit reports from the dashboard to see your scores, negative items, and AI recommendations.
          </p>
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">My Live Report & Analysis</h1>
        <p className="text-lg text-gray-600">Your interactive 3-bureau credit report with AI-powered violation analysis.</p>

        {/* Score Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysis.scores.map((s) => (
            <Card key={s.bureau} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.bureau}</CardTitle>
                <Shield className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{s.score}</div>
                <p className={cn("text-xs font-medium mt-1", getScoreColor(s.score))}>
                  {getScoreLabel(s.score)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{analysis.totalNegativeItems}</div>
              <p className="text-xs text-red-500 mt-1">Identified by AI</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Est. Score Increase</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">+{analysis.estimatedScoreIncrease}</div>
              <p className="text-xs text-green-500 mt-1">Points Potential</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Est. Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">${analysis.estimatedInterestSavings.toLocaleString()}</div>
              <p className="text-xs text-blue-500 mt-1">In Interest</p>
            </CardContent>
          </Card>
        </div>

        {/* Negative Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Negative Items for Dispute</CardTitle>
            <p className="text-sm text-gray-500">Select up to {MAX_ITEMS_PER_ROUND} items for your next dispute round.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-sm">Selected for Round 1: {selectedItems.length} / {MAX_ITEMS_PER_ROUND}</p>
              <Button disabled={selectedItems.length === 0}>
                Generate Letters ({selectedItems.length})
              </Button>
            </div>

            {/* Recommended Items */}
            {recommendedItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                  <Star className="w-5 h-5 fill-red-600 text-white" />
                  AI Recommended (High Priority)
                </h3>
                {recommendedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-red-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={selectedItems.length >= MAX_ITEMS_PER_ROUND && !selectedItems.includes(item.id)}
                        className="w-5 h-5 text-red-600 bg-gray-100 border-red-300 rounded focus:ring-red-500"
                      />
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">{item.accountType}</Badge>
                          <Badge variant="secondary">{item.bureau}</Badge>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-700">${item.balance.toLocaleString()}</p>
                      <p className="text-xs text-red-500">{item.recommendationReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other Items */}
            {otherItems.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                  <AlertTriangle className="w-5 h-5 text-gray-500" />
                  Other Negative Items
                </h3>
                {otherItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={selectedItems.length >= MAX_ITEMS_PER_ROUND && !selectedItems.includes(item.id)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <Badge variant="secondary">{item.accountType}</Badge>
                          <Badge variant="secondary">{item.bureau}</Badge>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-700">${item.balance.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{item.recommendationReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
