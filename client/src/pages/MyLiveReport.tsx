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
import { cn, safeJsonParse } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from '@/components/DashboardLayout';
import { CONSUMER_PRICE_LABELS } from "@/lib/pricing";
import { useGenerateDisputeLetters, type BureauCode } from "@/hooks/useGenerateDisputeLetters";

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
  bureauCodes: BureauCode[];
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
  totalNegativeAccountsFromAnalysis: number;
  totalViolations: number;
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

const MAX_ITEMS_PER_ROUND = 7;
const ALL_BUREAUS: BureauCode[] = ["transunion", "equifax", "experian"];

const normalizeBureauCode = (value: string): BureauCode | null => {
  const key = value.trim().toLowerCase();
  if (!key) return null;
  if (key === "trans union") return "transunion";
  if (key === "transunion") return "transunion";
  if (key === "equifax") return "equifax";
  if (key === "experian") return "experian";
  return null;
};

const getScoreColor = (score: number) => {
  if (score >= 670) return 'text-primary';
  return 'text-accent';
};

const getScoreLabel = (score: number) => {
  if (score >= 740) return 'Excellent';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

const getScoreBgColor = (score: number) => {
  if (score >= 670) return 'bg-primary/10';
  return 'bg-accent/10';
};

export default function MyLiveReport() {
  const [, setLocation] = useLocation();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { generateLetters, isGenerating } = useGenerateDisputeLetters();

  const { data: creditReports = [], isLoading: reportsLoading } = trpc.creditReports.list.useQuery();
  const { data: scoresByBureau } = trpc.creditReports.scoresByBureau.useQuery();
  const { data: negativeAccounts = [], isLoading: accountsLoading } = trpc.negativeAccounts.list.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();

  const analysis = useMemo((): AnalysisData => {
    const valid = (n: number | null | undefined) => (n != null && n >= 300 && n <= 850 ? n : null);
    const tu = valid(scoresByBureau?.transunion);
    const eq = valid(scoresByBureau?.equifax);
    const ex = valid(scoresByBureau?.experian);
    const scores: CreditScore[] = [
      { bureau: "TransUnion", score: tu ?? 0 },
      { bureau: "Equifax", score: eq ?? 0 },
      { bureau: "Experian", score: ex ?? 0 },
    ];
    if (tu == null && eq == null && ex == null) {
      for (const r of creditReports) {
        const label = BUREAU_LABELS[r.bureau] || r.bureau;
        const existing = scores.find(s => s.bureau === label);
        if (existing) {
          const scoreFromReport = r.creditScore != null && r.creditScore >= 300 && r.creditScore <= 850 ? r.creditScore : null;
          const score = scoreFromReport ?? (safeJsonParse(r.parsedData, null)?.creditScore ?? null);
          if (score != null && score >= 300 && score <= 850) existing.score = score;
        }
      }
    }
    const negativeItems: NegativeItem[] = negativeAccounts.map((a) => {
      const bal = typeof a.balance === "string" ? parseFloat(a.balance) || 0 : Number(a.balance) || 0;
      const hasConflicts = !!a.hasConflicts;
      const bureauValues = (a.bureau || "")
        .split(/[,/]/)
        .map((b) => b.trim())
        .filter(Boolean);
      const bureauLabel = bureauValues
        .map((b) => BUREAU_LABELS[b.toLowerCase()] || b)
        .filter(Boolean)
        .join(", ") || "—";
      const bureauCodes = bureauValues
        .map(normalizeBureauCode)
        .filter((b): b is BureauCode => Boolean(b));
      return {
        id: a.id,
        accountName: a.accountName || "Unknown",
        accountType: a.accountType || "Unknown",
        balance: bal,
        bureau: bureauLabel || "—",
        bureauCodes,
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
    const parsedViolationCounts = creditReports
      .map((report) => {
        const parsedData = safeJsonParse(report.parsedData, null);
        return parsedData && typeof parsedData.totalViolations === "number" ? parsedData.totalViolations : null;
      })
      .filter((count): count is number => typeof count === "number" && count > 0);
    const totalViolations = parsedViolationCounts.length
      ? (new Set(parsedViolationCounts).size === 1
          ? parsedViolationCounts[0]
          : parsedViolationCounts.reduce((sum, count) => sum + count, 0))
      : totalNegativeItems;
    const parsedNegAccountCounts = creditReports
      .map((report) => {
        const parsedData = safeJsonParse(report.parsedData, null);
        return parsedData && typeof parsedData.totalNegativeAccounts === "number" ? parsedData.totalNegativeAccounts : null;
      })
      .filter((count): count is number => typeof count === "number" && count > 0);
    const totalNegativeAccountsFromAnalysis = parsedNegAccountCounts.length
      ? Math.max(...parsedNegAccountCounts)
      : totalNegativeItems;
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
      totalViolations,
      estimatedScoreIncrease,
      estimatedInterestSavings,
      trialEndsAt: trialEnd.toISOString(),
      subscription: { status: subStatus, tier: subscriptionTier },
    };
  }, [creditReports, scoresByBureau, negativeAccounts, profile]);

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

  const selectTop7 = () => setSelectedItems(allNegativeItems.slice(0, MAX_ITEMS_PER_ROUND).map(i => i.id));
  const selectAll = () => setSelectedItems(allNegativeItems.slice(0, MAX_ITEMS_PER_ROUND).map(i => i.id));

  const selectedBureaus = useMemo(() => {
    const bureaus = new Set<BureauCode>();
    for (const item of allNegativeItems) {
      if (selectedItems.includes(item.id)) {
        item.bureauCodes.forEach((code) => bureaus.add(code));
      }
    }
    return Array.from(bureaus);
  }, [allNegativeItems, selectedItems]);

  const handleGenerateLetters = async () => {
    const bureaus = selectedBureaus.length ? selectedBureaus : ALL_BUREAUS;
    const success = await generateLetters({ accountIds: selectedItems, bureaus });
    if (success) {
      setSelectedItems([]);
    }
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

  const hasNoData = !analysis.totalViolations && !analysis.totalNegativeItems && !creditReports.length;
  if (hasNoData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center max-w-md mx-auto">
          <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
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

        {/* Score Section - all 3 bureaus from report (each bureau has its own number) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.scores.map((s) => {
            const hasScore = s.score >= 300 && s.score <= 850;
            const short = s.bureau === 'TransUnion' ? 'TU' : s.bureau === 'Equifax' ? 'EQ' : 'EX';
            return (
              <Card key={s.bureau} className="shadow border border-gray-200">
                <CardHeader className="py-2 px-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium text-gray-600">{short}</CardTitle>
                  <Shield className="h-3.5 w-3.5 text-gray-400" />
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className={cn("text-2xl font-bold", hasScore ? getScoreColor(s.score) : "text-gray-400")}>
                    {hasScore ? s.score : "—"}
                  </div>
                  {!hasScore && <p className="text-xs text-gray-500 mt-0.5">From report</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Metrics — show both Negative Accounts & Violations so user can get letters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-red-50 border-2 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Negative Accounts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{analysis.totalNegativeAccountsFromAnalysis}</div>
              <p className="text-xs text-red-600 mt-1">Items on report</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-2 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{analysis.totalViolations}</div>
              <p className="text-xs text-accent mt-1">Disputable issues — generate letters</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Est. Score Increase</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">+{analysis.estimatedScoreIncrease}</div>
              <p className="text-xs text-green-500 mt-1">Points Potential</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-2 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Est. Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">${analysis.estimatedInterestSavings.toLocaleString()}</div>
              <p className="text-xs text-accent mt-1">In Interest</p>
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
            <div className="flex flex-wrap justify-between items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-bold text-sm">Selected for Round 1: {selectedItems.length} / {MAX_ITEMS_PER_ROUND}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectTop7} className="text-gray-700">
                    Select Top 7
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAll} className="text-gray-700">
                    Select All
                  </Button>
                </div>
              </div>
              <Button onClick={handleGenerateLetters} disabled={selectedItems.length === 0 || isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Letters ({selectedItems.length})</>
                )}
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
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-border rounded-lg hover:bg-accent/5 transition-colors">
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
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-2 border-border">{item.accountType}</Badge>
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
                        className="w-5 h-5 text-primary bg-secondary border-2 border-border rounded focus:ring-primary"
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
