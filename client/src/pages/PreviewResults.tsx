import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LightAnalysisResult } from "@shared/types";
import {
  calculateImpactPrediction,
  calculatePotentialRange,
  scoreToRating,
  rangeToRatingLabel,
} from "@/lib/analysisUtils";
import { CONSUMER_PRICE_LABELS } from "@/lib/pricing";
import { AlertTriangle, CheckCircle2, Lock, TrendingUp, BarChart3, Calendar, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PreviewResultsProps {
  analysis: LightAnalysisResult & { fileUrl?: string };
  /** Legacy single upgrade handler - use onUpgradeEssential/onUpgradeComplete for direct Stripe */
  onUpgrade: () => void;
  /** Direct to Stripe checkout for Essential plan (Blueprint §4) */
  onUpgradeEssential?: () => void;
  /** Direct to Stripe checkout for Complete plan (Blueprint §4) */
  onUpgradeComplete?: () => void;
  /** Post-payment "revealed" view: hide upgrade CTA, show upload fallback. */
  revealed?: boolean;
  /** When revealed, called when user taps "Upload reports" / "Refresh data". */
  onUpload?: () => void;
}

const TIMELINE_STEPS = [
  { week: "Week 1-2", action: "Send Dispute Letters", explanation: "User initiates disputes via mail or electronic" },
  { week: "Week 3-6", action: "Bureaus Investigate (FCRA Required)", explanation: "15 U.S.C. § 1681i requires investigation within 30 days" },
  { week: "Week 7-10", action: "Get Responses From Bureaus", explanation: "Bureaus must respond by day 30 with results" },
  { week: "Day 30+", action: "Score Updates", explanation: "If items deleted, credit card companies update within 1-3 billing cycles" },
] as const;

const defaultSeverity = { critical: 0, high: 0, medium: 0, low: 0 };
const defaultCategory = { collections: 0, latePayments: 0, chargeOffs: 0, judgments: 0, other: 0 };

const PreviewResults: React.FC<PreviewResultsProps> = ({ analysis, onUpgrade, onUpgradeEssential, onUpgradeComplete, revealed, onUpload }) => {
  const severityBreakdown = analysis.severityBreakdown ?? defaultSeverity;
  const categoryBreakdown = analysis.categoryBreakdown ?? defaultCategory;
  const totalViolations = analysis.totalViolations ?? 0;
  const { accountPreviews, creditScore } = analysis;

  const totalSeverity = severityBreakdown.critical + severityBreakdown.high + severityBreakdown.medium + severityBreakdown.low;
  const isZero = totalSeverity === 0;
  const criticalPercent = isZero ? 0 : Math.round((severityBreakdown.critical / totalSeverity) * 100);
  const highPercent = isZero ? 0 : Math.round((severityBreakdown.high / totalSeverity) * 100);
  const mediumPercent = isZero ? 0 : Math.round((severityBreakdown.medium / totalSeverity) * 100);

  const impact = calculateImpactPrediction({
    collections: categoryBreakdown.collections,
    latePayments: categoryBreakdown.latePayments,
    chargeOffs: categoryBreakdown.chargeOffs,
  });

  const potentialRange = creditScore != null
    ? calculatePotentialRange(creditScore, impact)
    : null;

  const topAccounts = (accountPreviews ?? [])
    .slice()
    .sort((a, b) => {
      const na = parseFloat(String(a.balance).replace(/[$,]/g, "")) || 0;
      const nb = parseFloat(String(b.balance).replace(/[$,]/g, "")) || 0;
      return nb - na;
    })
    .slice(0, 4);

  const remainingCount = Math.max(0, totalViolations - topAccounts.length);

  return (
    <div className="p-4 space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Free Credit Report Preview is Ready!</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Our AI has performed a <strong>Light Analysis</strong> to identify potential violations. Choose an option below to unlock the full report details and start disputing!
        </p>
      </div>

      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Box 1: Total Violations */}
        <Card className="bg-red-50 border-2 border-red-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Potential Violations Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-700">{totalViolations}</div>
            <p className="text-xs text-red-500 mt-1">
              {totalViolations > 20 ? "High potential for score increase!" : "Good starting point for dispute."}
            </p>
          </CardContent>
        </Card>

        {/* Box 2: Severity Breakdown */}
        <Card className="bg-white border-2 border-gray-300">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severity Breakdown</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Critical ({severityBreakdown.critical})</span>
              <span className="font-semibold text-red-600">{criticalPercent}%</span>
            </div>
            <Progress value={criticalPercent} className="h-2 bg-red-200 [&_[data-slot=progress-indicator]]:bg-red-600" />
            <div className="flex justify-between text-sm">
              <span>High ({severityBreakdown.high})</span>
              <span className="font-semibold text-orange-500">{highPercent}%</span>
            </div>
            <Progress value={highPercent} className="h-2 bg-orange-200 [&_[data-slot=progress-indicator]]:bg-orange-500" />
            <div className="flex justify-between text-sm">
              <span>Medium ({severityBreakdown.medium})</span>
              <span className="font-semibold text-yellow-500">{mediumPercent}%</span>
            </div>
            <Progress value={mediumPercent} className="h-2 bg-yellow-200 [&_[data-slot=progress-indicator]]:bg-yellow-500" />
            <p className="text-xs text-muted-foreground pt-1">Most impactful: Collections, Charge-offs, Late payments</p>
          </CardContent>
        </Card>

        {/* Box 3: Violation Categories */}
        <Card className="bg-white border-2 border-gray-300">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violation Categories</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <Badge key={category} variant="secondary" className="text-xs bg-green-600 text-white hover:bg-green-600">
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, " $1")} ({count})
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Box 4: Potential Impact */}
        <Card className="bg-purple-50 border-2 border-purple-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Potential Score Impact</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600 shrink-0" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
              <div className="text-xl font-bold text-purple-700">{impact.rangeLabel}</div>
              <div className="text-xs text-purple-600">points if disputes succeed</div>
            </div>
            <div className="space-y-1 text-sm">
              <div><strong className="text-purple-700">Conservative:</strong> <span className="text-gray-700">{impact.conservative.label} pts</span></div>
              <div><strong className="text-purple-700">Moderate:</strong> <span className="text-gray-700">{impact.moderate.label} pts</span></div>
              <div><strong className="text-purple-700">Optimistic:</strong> <span className="text-gray-700">{impact.optimistic.label} pts</span></div>
            </div>
            {creditScore != null && potentialRange && (
              <p className="text-xs text-gray-600 mt-2">
                <strong>Current:</strong> {creditScore} ({scoreToRating(creditScore)}) →{" "}
                <strong>Potential:</strong> {potentialRange.range} ({rangeToRatingLabel(potentialRange.minPotential, potentialRange.maxPotential)})
              </p>
            )}
            {creditScore == null && (
              <p className="text-xs text-gray-500 mt-2">Add a report with a score to see current → potential.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Section (static FCRA) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Your Dispute Timeline
        </h3>
        <p className="text-sm text-gray-700 mb-6">Here&apos;s exactly what happens when you start disputing:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
          {TIMELINE_STEPS.map((step) => (
            <div key={step.week} className="flex flex-col items-center">
              <div className="font-bold text-blue-700 text-sm mb-2">{step.week}</div>
              <div className="text-xs text-gray-700 leading-tight">{step.action}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-blue-200 pt-4">
          <p className="text-center font-bold text-blue-700 text-sm">30–60 days to first results</p>
          <p className="text-center text-xs text-gray-700 mt-2">Round 2 disputes can gain 60+ additional points</p>
        </div>
      </div>

      {/* Unlock Full Report (hidden when revealed) */}
      {!revealed && (
        <Card className="border-2 border-blue-500 bg-blue-50 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-blue-700">
              <Lock className="w-6 h-6 mr-2" />
              Unlock Full Report Details & Dispute Letters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-semibold text-gray-700">
              The following critical details are currently blurred to protect our proprietary analysis and your privacy:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
              <li><span className="font-bold">Specific Account Names</span> (e.g., Chase Bank, Portfolio Recovery)</li>
              <li><span className="font-bold">Advanced FCRA Analysis</span> (Our dispute analysis and violation checks)</li>
              <li><span className="font-bold">Full Report Analysis</span> (Required to generate legal dispute letters)</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                onClick={onUpgradeEssential || onUpgrade}
                className="w-full min-w-0 h-auto py-6 px-4 flex flex-col items-center justify-center text-center bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg whitespace-normal break-words"
              >
                <span>Upgrade to Essential ({CONSUMER_PRICE_LABELS.essential}/mo)</span>
                <span className="text-sm font-normal mt-1">Print & mail letters yourself.</span>
              </Button>
              <Button
                onClick={onUpgradeComplete || onUpgrade}
                className="w-full min-w-0 h-auto py-6 px-4 flex flex-col items-center justify-center text-center bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-lg whitespace-normal break-words relative"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">MOST POPULAR</span>
                <span>Upgrade to Complete ({CONSUMER_PRICE_LABELS.complete}/mo)</span>
                <span className="text-sm font-normal mt-1">We mail for you (5/month included).</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revealed: upload fallback (Phase 1 zero-friction) */}
      {revealed && onUpload && (
        <Card className="border-2 border-green-200 bg-green-50 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-green-800">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Your preview is unlocked
            </CardTitle>
            <CardDescription>
              Upload full reports to generate dispute letters, or refresh data with new reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onUpload} variant="outline" className="w-full sm:w-auto border-green-300 bg-white hover:bg-green-50">
              <Upload className="w-4 h-4 mr-2" />
              Upload reports / Refresh data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Accounts Found (Partial Preview) */}
      <Card className="max-w-4xl mx-auto border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-lg">
            {topAccounts.length ? "Accounts Found (Partial Preview)" : "Accounts Found (Blurred Preview)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topAccounts.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {revealed
                  ? `Below is a sample of accounts we found. Upload full reports to generate dispute letters for all ${totalViolations} accounts.`
                  : `Below is a sample of accounts we found. Upgrade to see all ${totalViolations} accounts and generate dispute letters.`}
              </p>
              {topAccounts.map((a, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{a.name} ****{a.last4}</div>
                    <div className="text-sm text-gray-600">Status: {a.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{a.balance.startsWith("$") ? a.balance : `$${a.balance}`}</div>
                    <div className="text-xs text-gray-600">{a.amountType ?? "Balance"}</div>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-700 font-bold">+ {remainingCount} more accounts found</p>
                <p className="text-xs text-blue-600 mt-1">
                  {revealed ? "Upload full reports to generate letters for all accounts." : "Upgrade to see all accounts and generate dispute letters"}
                </p>
              </div>
            </>
          ) : (
            <>
              {Array.from({ length: Math.min(totalViolations, 5) }).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
                </div>
              ))}
              {totalViolations > 5 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  ...and {totalViolations - 5} more accounts found. Upgrade to see all details.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Disclaimers */}
      <div className="max-w-4xl mx-auto text-center text-xs text-gray-600 space-y-3">
        <p><strong>⚠️ IMPORTANT DISCLAIMERS:</strong></p>
        <p>
          Potential score improvements are estimates for educational purposes only and do not guarantee results. Actual improvements depend on credit bureau responses, your credit history, and payment behavior. Results vary significantly by individual. Some items may be verified and remain on your report.
        </p>
        <p>
          DisputeStrike is not a credit repair organization. You have the right to dispute inaccurate information for FREE directly with credit bureaus under 15 U.S.C. § 1681i (FCRA). DisputeStrike makes this process faster and easier, but you control the disputes.
        </p>
        <p>
          Estimates based on: {categoryBreakdown.collections} collections + {categoryBreakdown.latePayments} late payments + {categoryBreakdown.chargeOffs} charge-offs (your highest-impact items).
        </p>
      </div>
    </div>
  );
};

export default PreviewResults;
