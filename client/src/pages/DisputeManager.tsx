import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Star,
  FileText,
  Loader2,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from "wouter";

// Interfaces copied from MyLiveReport.tsx / CreditAnalysis.tsx
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

const BUREAU_LABELS: Record<string, string> = {
  transunion: "TransUnion",
  equifax: "Equifax",
  experian: "Experian",
};

const MAX_ITEMS_PER_ROUND = 5;

export default function DisputeManager() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: negativeAccounts = [], isLoading: accountsLoading } = trpc.negativeAccounts.list.useQuery();
  const { data: creditReports = [], isLoading: reportsLoading } = trpc.creditReports.list.useQuery();

  const negativeItems: NegativeItem[] = useMemo(() => {
    return negativeAccounts.map((a) => {
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
  }, [negativeAccounts]);

  const isLoading = accountsLoading || reportsLoading;

  const allNegativeItems = negativeItems;
  const recommendedItems = allNegativeItems.filter(item => item.isRecommended);
  const otherItems = allNegativeItems.filter(item => !item.isRecommended);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      if (prev.length >= MAX_ITEMS_PER_ROUND && !prev.includes(itemId)) {
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
            <p className="text-gray-600">Loading dispute items...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasNoData = negativeItems.length === 0 && creditReports.length === 0;
  if (hasNoData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center max-w-md mx-auto">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No dispute data yet</h1>
          <p className="text-gray-600 mb-6">
            Upload your credit reports from the dashboard to see negative items and start disputing.
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
        <h1 className="text-3xl font-bold text-gray-900">Dispute Manager</h1>
        <p className="text-lg text-gray-600">Select items for your next dispute round and generate letters.</p>

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
