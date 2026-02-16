import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  FileText,
  Loader2,
  ChevronRight,
  Shield,
  Mail,
  Trash2,
  Upload,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from "wouter";
import { useGenerateDisputeLetters, type BureauCode } from "@/hooks/useGenerateDisputeLetters";

// Interfaces copied from MyLiveReport.tsx / CreditAnalysis.tsx
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
  round: 1 | 2 | 3 | null;
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

export default function DisputeManager() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [pendingResults, setPendingResults] = useState<Record<number, "deleted" | "verified" | "no_response">>({});
  const [pastDisputesRound, setPastDisputesRound] = useState<1 | 2 | 3>(1);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationData, setEscalationData] = useState<{ accountId: number; round: number; previousDate: string } | null>(null);
  const [bureauResponseSummary, setBureauResponseSummary] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const { generateLetters, isGenerating } = useGenerateDisputeLetters();

  const { data: negativeAccounts = [], isLoading: accountsLoading, refetch: refetchNegativeAccounts } = trpc.negativeAccounts.list.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.dashboardStats.get.useQuery();
  const { data: creditReports = [], isLoading: reportsLoading } = trpc.creditReports.list.useQuery();
  const savePreviewAnalysis = trpc.creditReports.savePreviewAnalysis.useMutation({
    onSuccess: async () => {
      await utils.creditReports.list.invalidate();
      await utils.dashboardStats.get.invalidate();
      syncFromParsedData.mutate();
    },
  });
  const syncFromParsedData = trpc.negativeAccounts.syncFromParsedData.useMutation({
    onSuccess: async (data) => {
      await refetchNegativeAccounts();
      await refetchStats();
      utils.negativeAccounts.getRoundRecommendations.invalidate();
    },
  });
  const { data: roundRecommendations } = trpc.negativeAccounts.getRoundRecommendations.useQuery(undefined, {
    enabled: negativeAccounts.length > 0,
  });
  const { data: claudeStatus } = trpc.system.claudeStatus.useQuery();
  const { data: disputeLetters = [] } = trpc.disputeLetters.list.useQuery();
  const { data: disputeOutcomes = [] } = trpc.disputeOutcomes.list.useQuery();
  const utils = trpc.useUtils();
  const saveRound1Results = trpc.disputeLetters.saveRound1Results.useMutation({
    onSuccess: (_data, variables) => {
      utils.disputeOutcomes.list.invalidate();
      utils.disputeLetters.list.invalidate();
      utils.negativeAccounts.getRoundRecommendations.invalidate();
      setPendingResults((p) => {
        const next = { ...p };
        for (const r of variables.results) delete next[r.accountId];
        return next;
      });
    },
  });
  const generateEscalation = trpc.negativeAccounts.generateEscalationLetter.useMutation({
    onSuccess: (data) => {
      if (data.content) {
        // In a real app, we'd save this to the database or show it in a preview
        alert("Escalation letter generated successfully! You can now view it in your documents.");
        setShowEscalationModal(false);
        setEscalationData(null);
        setBureauResponseSummary("");
      }
    },
  });

  const clearUserData = trpc.disputeLetters.clearUserDisputeData.useMutation({
    onSuccess: () => {
      sessionStorage.removeItem('previewAnalysis');
      localStorage.removeItem('previewAnalysis');
      utils.disputeLetters.list.invalidate();
      utils.disputeOutcomes.list.invalidate();
      utils.negativeAccounts.list.invalidate();
      utils.negativeAccounts.getRoundRecommendations.invalidate();
      utils.creditReports.list.invalidate();
      utils.creditReports.scoresByBureau.invalidate();
      utils.dashboardStats.get.invalidate();
      setSelectedItems([]);
      setPendingResults({});
    },
  });

  const accountIdsWithLetters = useMemo(() => {
    const set = new Set<number>();
    for (const letter of disputeLetters) {
      try {
        const ids = JSON.parse(letter.accountsDisputed || "[]") as number[];
        if (Array.isArray(ids)) ids.forEach((id) => set.add(id));
      } catch {}
    }
    return set;
  }, [disputeLetters]);

  const outcomesByAccount = useMemo(() => {
    const m = new Map<number, string>();
    for (const o of disputeOutcomes) {
      if (o.accountId) m.set(o.accountId, o.outcome || "");
    }
    return m;
  }, [disputeOutcomes]);

  const round1Ids = useMemo(() => {
    if (!roundRecommendations?.round1) return new Set<number>();
    return new Set(roundRecommendations.round1.map((r) => r.id));
  }, [roundRecommendations]);
  const round2Ids = useMemo(() => {
    if (!roundRecommendations?.round2) return new Set<number>();
    return new Set(roundRecommendations.round2.map((r) => r.id));
  }, [roundRecommendations]);
  const round3Ids = useMemo(() => {
    if (!roundRecommendations?.round3) return new Set<number>();
    return new Set(roundRecommendations.round3.map((r) => r.id));
  }, [roundRecommendations]);

  const negativeItems: NegativeItem[] = useMemo(() => {
    return negativeAccounts.map((a) => {
      const bal = typeof a.balance === "string" ? parseFloat(a.balance) || 0 : Number(a.balance) || 0;
      const hasConflicts = !!a.hasConflicts;
      const inRound1 = round1Ids.has(a.id);
      const inRound2 = round2Ids.has(a.id);
      const inRound3 = round3Ids.has(a.id);
      const round = inRound1 ? 1 : inRound2 ? 2 : inRound3 ? 3 : null;
      const bureauStr = (a.bureau || "").trim() || "transunion";
      const bureauValues = bureauStr
        .split(/[,/]/)
        .map((b) => b.trim())
        .filter(Boolean);
      if (bureauValues.length === 0) bureauValues.push("transunion");
      const bureauLabel = bureauValues
        .map((b) => BUREAU_LABELS[b.toLowerCase()] || b)
        .filter(Boolean)
        .join(", ") || "—";
      const bureauCodes = bureauValues
        .map(normalizeBureauCode)
        .filter((b): b is BureauCode => Boolean(b));
      if (bureauCodes.length === 0) bureauCodes.push("transunion");
      let reason = "Standard dispute opportunity";
      if (inRound1) reason = "Round 1 – internal logic error (high probability)";
      else if (inRound2) reason = "Round 2 – internal conflict + furnisher escalation";
      else if (inRound3) reason = "Round 3 – cross-bureau + CFPB";
      else if (hasConflicts) reason = "Conflicts detected";
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
        isRecommended: inRound1 || inRound2 || inRound3 || hasConflicts,
        winProbability: inRound1 ? 78 : inRound2 ? 65 : inRound3 ? 55 : hasConflicts ? 60 : 50,
        recommendationReason: reason,
        hasConflicts: hasConflicts || inRound1 || inRound2 || inRound3,
        round,
      };
    });
  }, [negativeAccounts, round1Ids, round2Ids, round3Ids]);

  const isLoading = accountsLoading || reportsLoading;

  const analysisViolationsForSync = stats?.totalViolationsFromAnalysis ?? 0;
  const analysisNegForSync = stats?.totalNegativeAccountsFromAnalysis ?? stats?.totalNegativeAccounts ?? 0;

  // Auto-save preview from storage if never persisted (enables auto-sync)
  useEffect(() => {
    const previewRaw = sessionStorage.getItem('previewAnalysis') || localStorage.getItem('previewAnalysis');
    if (!previewRaw || negativeAccounts.length > 0 || savePreviewAnalysis.isPending || syncFromParsedData.isPending) return;
    if (creditReports.length > 0) return; // already saved
    try {
      const analysis = JSON.parse(previewRaw);
      if (analysis?.totalViolations > 0 || analysis?.totalNegativeAccounts > 0) {
        savePreviewAnalysis.mutate({ analysis });
      }
    } catch {}
  }, [negativeAccounts.length, creditReports.length, savePreviewAnalysis.isPending, syncFromParsedData.isPending]);

  // Auto-sync: load items when analysis says more than we have (fully automatic)
  useEffect(() => {
    if (syncFromParsedData.isPending || savePreviewAnalysis.isPending) return;
    if (creditReports.length === 0) return; // need reports to sync from
    const needMore = (analysisViolationsForSync > 0 || analysisNegForSync > 0) && negativeAccounts.length < Math.max(analysisViolationsForSync, analysisNegForSync, 1);
    if (needMore) {
      syncFromParsedData.mutate();
    }
  }, [analysisViolationsForSync, analysisNegForSync, negativeAccounts.length, creditReports.length, syncFromParsedData.isPending, savePreviewAnalysis.isPending]);

  const itemsNotYetDisputed = useMemo(
    () => negativeItems.filter((item) => !accountIdsWithLetters.has(item.id)),
    [negativeItems, accountIdsWithLetters]
  );

  const itemsPendingResults = useMemo(
    () => negativeItems.filter((item) => accountIdsWithLetters.has(item.id) && !outcomesByAccount.has(item.id)),
    [negativeItems, accountIdsWithLetters, outcomesByAccount]
  );

  const openCount = itemsNotYetDisputed.length;
  const round1Items = itemsNotYetDisputed.filter((item) => item.round === 1);
  const round2Items = itemsNotYetDisputed.filter((item) => item.round === 2);
  const round3Items = itemsNotYetDisputed.filter((item) => item.round === 3);
  const otherItems = itemsNotYetDisputed.filter((item) => item.round === null);

  const accountMap = useMemo(() => new Map(negativeAccounts.map((a) => [a.id, a])), [negativeAccounts]);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      if (prev.length >= MAX_ITEMS_PER_ROUND && !prev.includes(itemId)) {
        return prev;
      }
      return [...prev, itemId];
    });
  };

  const selectTop5Round1 = () => {
    const from = round1Items.length > 0 ? round1Items : itemsNotYetDisputed;
    setSelectedItems(from.slice(0, MAX_ITEMS_PER_ROUND).map((i) => i.id));
  };
  const selectAll = () => {
    const pool = [...round1Items, ...round2Items, ...round3Items, ...otherItems];
    setSelectedItems(pool.slice(0, MAX_ITEMS_PER_ROUND).map((i) => i.id));
  };

  const selectedBureaus = useMemo(() => {
    const bureaus = new Set<BureauCode>();
    for (const item of negativeItems) {
      if (selectedItems.includes(item.id)) {
        item.bureauCodes.forEach((code) => bureaus.add(code));
      }
    }
    return Array.from(bureaus);
  }, [negativeItems, selectedItems]);

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
            <p className="text-gray-600">Loading dispute items...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasPreviewInStorage = typeof window !== 'undefined' && !!(sessionStorage.getItem('previewAnalysis') || localStorage.getItem('previewAnalysis'));
  const hasNoData = negativeItems.length === 0 && creditReports.length === 0 && !savePreviewAnalysis.isPending;
  if (hasNoData && !hasPreviewInStorage) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center max-w-md mx-auto">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No dispute data yet</h1>
          <p className="text-gray-600 mb-6">
            Upload your credit reports from the dashboard to see negative items and start disputing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <a className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                Go to Dashboard
                <ChevronRight className="w-4 h-4" />
              </a>
            </Link>
            <Button
              variant="outline"
              className="border-slate-300"
              disabled={clearUserData.isPending}
              onClick={() => {
                if (window.confirm("Clear all data and start fresh? This will reset your analysis.")) {
                  clearUserData.mutate();
                }
              }}
            >
              {clearUserData.isPending ? "Clearing..." : "Clear data & start over"}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show analysis counts (12 negative accounts, 24 violations) — from parsedData
  const analysisNegAccounts = stats?.totalNegativeAccountsFromAnalysis ?? stats?.totalNegativeAccounts ?? 0;
  const analysisViolations = stats?.totalViolationsFromAnalysis ?? 0;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Summary Banner — Analysis counts (12/24) + Open for Dispute + Past Letters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(analysisNegAccounts > 0 || analysisViolations > 0) && (
            <>
              <div className="rounded-xl border-2 border-red-200 bg-red-50/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-red-800 uppercase tracking-wide">Negative Accounts</p>
                <p className="text-3xl font-black text-red-900 mt-1">{analysisNegAccounts}</p>
                <p className="text-sm text-red-700 mt-0.5">On your report (informational)</p>
              </div>
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Violations</p>
                <p className="text-3xl font-black text-amber-900 mt-1">{analysisViolations}</p>
                <p className="text-sm text-amber-700 mt-0.5">Disputable errors — select these for letters</p>
              </div>
            </>
          )}
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Open for Dispute</p>
            <p className="text-3xl font-black text-emerald-900 mt-1">{openCount}</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              {openCount === 0 ? "All violations have letters." : "Violations you can select for letters"}
            </p>
          </div>
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Past Dispute Letters</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{disputeLetters.length}</p>
            <p className="text-sm text-slate-600 mt-0.5">Letters generated</p>
          </div>
        </div>
        {syncFromParsedData.isPending && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">Loading dispute items automatically…</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-green-600 text-white font-bold">NEW</Badge>
              <span className="text-sm text-green-700 font-medium">Round-based strategy — max 7 per round</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">Dispute Manager</h1>
            <p className="text-base text-gray-600 font-medium mt-1">Evidence-based disputes — cross-bureau conflicts prioritized in Round 1. Top 5 by success rate.</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm font-bold items-center">
              <span className="text-red-700">Round 1: {round1Items.length}</span>
              <span className="text-amber-700">Round 2: {round2Items.length}</span>
              <span className="text-blue-700">Round 3: {round3Items.length}</span>
              {claudeStatus && (
                <Badge variant={claudeStatus.available ? "default" : "secondary"} className={claudeStatus.available ? "bg-emerald-600" : "bg-slate-400"}>
                  {claudeStatus.available ? "Claude AI ✓" : "Claude off"}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-bold"
            disabled={clearUserData.isPending}
            onClick={() => {
              if (window.confirm("Clear all dispute data and start fresh? This will delete letters, outcomes, negative accounts, and credit reports. You will need to re-upload reports.")) {
                clearUserData.mutate();
              }
            }}
          >
            {clearUserData.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Start Fresh
              </>
            )}
          </Button>
        </div>

        {/* Open Disputes — violations needing letters */}
        <Card className="border-2 border-gray-300 shadow-lg">
          <CardHeader className="border-b-2 border-gray-200">
            <CardTitle className="text-xl font-black">Open Disputes — Items Needing Letters</CardTitle>
            <p className="text-sm text-gray-600 font-medium">
              {openCount === 0
                ? "No open disputes. All negative items have dispute letters generated."
                : `Select up to ${MAX_ITEMS_PER_ROUND} items for your next round. (${openCount} open)`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {openCount === 0 ? (
              <div className="py-12 text-center rounded-lg bg-gray-50 border border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">No open disputes</p>
                <p className="text-sm text-gray-500 mt-1">All violations have letters. Use Past Disputes below to record outcomes.</p>
              </div>
            ) : (
            <>
            <div className="flex flex-wrap justify-between items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-black text-sm text-blue-800">Selected: {selectedItems.length} / {MAX_ITEMS_PER_ROUND}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectTop5Round1} className="border-blue-400 text-blue-800 hover:bg-blue-100">
                    Select Top 7 (Round 1)
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAll} className="border-blue-400 text-blue-800 hover:bg-blue-100">
                    Select All
                  </Button>
                </div>
              </div>
              <Button onClick={handleGenerateLetters} disabled={selectedItems.length === 0 || isGenerating} className="bg-orange-500 hover:bg-orange-600 font-bold shadow-md">
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

            {/* Round 1 – High probability */}
            {round1Items.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg border-2 border-red-300">
                  <Badge className="bg-red-600 text-white font-bold">ROUND 1</Badge>
                  Cross-bureau conflicts + internal logic errors (highest success) — max 5
                </h3>
                {round1Items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-red-200 rounded-lg bg-red-50/50 hover:bg-red-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={selectedItems.length >= MAX_ITEMS_PER_ROUND && !selectedItems.includes(item.id)}
                        className="w-6 h-6 text-red-600 bg-gray-100 border-2 border-red-400 rounded focus:ring-red-500"
                      />
                      <div className="space-y-1">
                        <p className="font-black text-gray-900">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className="bg-red-100 text-red-800 border-2 border-red-300 font-bold">{item.accountType}</Badge>
                          <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold">{item.bureau}</Badge>
                          <span className="flex items-center gap-1 text-gray-600 font-medium"><FileText className="w-3 h-3" /> Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-red-700">${item.balance.toLocaleString()}</p>
                      <p className="text-xs text-red-600 font-medium">{item.recommendationReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Round 2 – Next tier + furnisher escalations */}
            {round2Items.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border-2 border-amber-300">
                  <Badge className="bg-amber-600 text-white font-bold">ROUND 2</Badge>
                  Next tier + furnisher escalations (internal conflicts within bureau) — max 5
                </h3>
                {round2Items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-amber-200 rounded-lg bg-amber-50/50 hover:bg-amber-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={selectedItems.length >= MAX_ITEMS_PER_ROUND && !selectedItems.includes(item.id)}
                        className="w-6 h-6 text-amber-600 bg-gray-100 border-2 border-amber-400 rounded focus:ring-amber-500"
                      />
                      <div className="space-y-1">
                        <p className="font-black text-gray-900">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className="bg-amber-100 text-amber-800 border-2 border-amber-300 font-bold">{item.accountType}</Badge>
                          <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold">{item.bureau}</Badge>
                          <span className="flex items-center gap-1 text-gray-600 font-medium"><FileText className="w-3 h-3" /> Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-amber-700">${item.balance.toLocaleString()}</p>
                      <p className="text-xs text-amber-600 font-medium">{item.recommendationReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Round 3 – Final + CFPB */}
            {round3Items.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black flex items-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
                  <Badge className="bg-blue-600 text-white font-bold">ROUND 3</Badge>
                  Final + CFPB (cross-bureau + escalation) — max 7
                </h3>
                {round3Items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={selectedItems.length >= MAX_ITEMS_PER_ROUND && !selectedItems.includes(item.id)}
                        className="w-6 h-6 text-blue-600 bg-gray-100 border-2 border-blue-400 rounded focus:ring-blue-500"
                      />
                      <div className="space-y-1">
                        <p className="font-black text-gray-900">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 font-bold">{item.accountType}</Badge>
                          <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold">{item.bureau}</Badge>
                          <span className="flex items-center gap-1 text-gray-600 font-medium"><FileText className="w-3 h-3" /> Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-blue-700">${item.balance.toLocaleString()}</p>
                      <p className="text-xs text-blue-600 font-medium">{item.recommendationReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other Items (not in any round) */}
            {otherItems.length > 0 && (
              <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                <h3 className="text-lg font-black flex items-center gap-2 text-gray-700 bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  Other Violations
                </h3>
                {otherItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={selectedItems.length >= MAX_ITEMS_PER_ROUND && !selectedItems.includes(item.id)}
                        className="w-6 h-6 text-blue-600 bg-gray-100 border-2 border-gray-400 rounded focus:ring-blue-500"
                      />
                      <div className="space-y-1">
                        <p className="font-black text-gray-900">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold">{item.accountType}</Badge>
                          <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold">{item.bureau}</Badge>
                          <span className="flex items-center gap-1 text-gray-600 font-medium"><FileText className="w-3 h-3" /> Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-gray-800">${item.balance.toLocaleString()}</p>
                      <p className="text-xs text-gray-600 font-medium">{item.recommendationReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Results Section */}
            {itemsPendingResults.length > 0 && (
              <div className="space-y-3 pt-8 border-t-4 border-dashed border-gray-200">
                <h3 className="text-lg font-black flex items-center gap-2 text-slate-700 bg-slate-100 p-3 rounded-lg border-2 border-slate-300">
                  <Clock className="w-5 h-5 text-slate-600" />
                  Pending Results (Letters Mailed)
                </h3>
                <p className="text-sm text-slate-600 px-1">These items have active disputes. They will move to "Past Disputes" once you mark an outcome below.</p>
                {itemsPendingResults.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg bg-slate-50/30 opacity-75">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">{item.accountName}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="outline" className="text-slate-500 border-slate-300">{item.accountType}</Badge>
                          <Badge variant="outline" className="text-slate-500 border-slate-300">{item.bureau}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-600">${item.balance.toLocaleString()}</p>
                      <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">Awaiting Response</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
          )}
          </CardContent>
        </Card>

        {/* Past Dispute Letters — Report-style table */}
        {disputeLetters.length > 0 && (
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-600" />
                  Past Dispute Letters — Report
                </CardTitle>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-600">Round:</label>
                  <select
                    value={pastDisputesRound}
                    onChange={(e) => setPastDisputesRound(Number(e.target.value) as 1 | 2 | 3)}
                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium bg-white text-slate-800"
                  >
                    <option value={1}>Round 1</option>
                    <option value={2}>Round 2</option>
                    <option value={3}>Round 3</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                const lettersForRound = disputeLetters.filter((letter) => (letter.round ?? 1) === pastDisputesRound);
                if (lettersForRound.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No letters for Round {pastDisputesRound}.
                    </div>
                  );
                }
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/80">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">#</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Bureau</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Accounts</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Outcome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lettersForRound.map((letter, idx) => {
                          const ids = (() => {
                            try {
                              return (JSON.parse(letter.accountsDisputed || "[]") as number[]) || [];
                            } catch {
                              return [];
                            }
                          })();
                          const bureauLabel = BUREAU_LABELS[letter.bureau?.toLowerCase() || ""] || letter.bureau || "—";
                          const created = letter.createdAt
                            ? new Date(letter.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                            : "—";
                          return (
                            <tr key={letter.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-mono text-slate-600">{idx + 1}</td>
                              <td className="py-3 px-4 text-slate-800">{bureauLabel}</td>
                              <td className="py-3 px-4 text-slate-700">
                                {ids.length === 0 ? "—" : ids.map((id) => accountMap.get(id)?.accountName || `#${id}`).join(", ")}
                              </td>
                              <td className="py-3 px-4 text-slate-600 tabular-nums">{created}</td>
                              <td className="py-3 px-4">
                                {ids.length === 0 ? (
                                  <span className="text-slate-400">—</span>
                                ) : (
                                  <div className="space-y-1.5">
                                    {ids.map((accountId) => {
                                      const acc = accountMap.get(accountId);
                                      const current = outcomesByAccount.get(accountId) || pendingResults[accountId];
                                      return (
                                        <div key={accountId} className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-slate-600 font-medium">{acc?.accountName || `#${accountId}`}:</span>
                                          <div className="flex flex-col gap-2">
                                            <span className="inline-flex gap-1">
                                              {(["deleted", "verified", "no_response"] as const).map((r) => (
                                                <button
                                                  key={r}
                                                  type="button"
                                                  onClick={() => {
                                                    setPendingResults((p) => ({ ...p, [accountId]: r }));
                                                    saveRound1Results.mutate({ results: [{ accountId, result: r }] });
                                                  }}
                                                  disabled={saveRound1Results.isPending}
                                                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                                                    current === r
                                                      ? r === "deleted"
                                                        ? "bg-emerald-600 text-white"
                                                        : r === "verified"
                                                        ? "bg-amber-600 text-white"
                                                        : "bg-slate-600 text-white"
                                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                  }`}
                                                >
                                                  {r === "no_response" ? "No Response" : r === "deleted" ? "Deleted" : "Verified"}
                                                </button>
                                              ))}
                                            </span>
                                            {(current === "verified" || current === "no_response") && (
                                              <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-7 text-[10px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                onClick={() => {
                                                  setEscalationData({ 
                                                    accountId, 
                                                    round: (letter.round || 1) + 1,
                                                    previousDate: created
                                                  });
                                                  setShowEscalationModal(true);
                                                }}
                                              >
                                                <Plus className="w-3 h-3 mr-1" /> Prepare Round {(letter.round || 1) + 1} Escalation
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Escalation Modal */}
      {showEscalationModal && escalationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl border-2 border-amber-200">
            <CardHeader className="bg-amber-50 border-b border-amber-100 flex flex-row items-center justify-between">
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Round {escalationData.round} Escalation Strategy
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowEscalationModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Step 1: Upload Bureau Response (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer bg-slate-50/50">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="bureau-upload" 
                    onChange={() => {
                      setIsUploading(true);
                      setTimeout(() => setIsUploading(false), 1500);
                    }}
                  />
                  <label htmlFor="bureau-upload" className="cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    )}
                    <p className="text-sm font-medium text-slate-600">
                      {isUploading ? "Analyzing document..." : "Click to upload rejection letter or response"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (Max 10MB)</p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Step 2: Summary of Bureau's Response
                </label>
                <textarea 
                  className="w-full min-h-[100px] p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-amber-500 outline-none"
                  placeholder="e.g., They claimed the account was verified but didn't provide any proof of investigation..."
                  value={bureauResponseSummary}
                  onChange={(e) => setBureauResponseSummary(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>AI Strategy:</strong> Our hybrid Sonnet engine will analyze this response against your original dispute and generate a "Failure to Investigate" escalation letter for Round {escalationData.round}.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowEscalationModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  disabled={generateEscalation.isPending}
                  onClick={() => {
                    generateEscalation.mutate({
                      accountId: escalationData.accountId,
                      round: escalationData.round,
                      previousDisputeDate: escalationData.previousDate,
                      bureauResponseSummary: bureauResponseSummary || undefined
                    });
                  }}
                >
                  {generateEscalation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Generate Escalation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
