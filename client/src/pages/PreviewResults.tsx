import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Lock, TrendingUp, BarChart3, Calendar, Zap, ArrowRight, Shield, FileText, Clock, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { safeJsonParse } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { calculateImpactPrediction, capImpactForDisplay, calculatePotentialRange, CREDIT_SCORE_MAX } from "@/lib/analysisUtils";

interface PreviewResultsProps {
  analysis?: any;
}

export default function PreviewResults({ analysis: propAnalysis }: PreviewResultsProps) {
  const [, setLocation] = useLocation();
  
  // Get analysis from props or session storage - NO FALLBACK PLACEHOLDERS
  const sessionAnalysis = safeJsonParse(sessionStorage.getItem('previewAnalysis'), null);
  const analysis = propAnalysis || sessionAnalysis;

  // DEBUG: Log what we received
  console.log('[PreviewResults] propAnalysis:', propAnalysis);
  console.log('[PreviewResults] sessionAnalysis:', sessionAnalysis);
  console.log('[PreviewResults] final analysis:', analysis);
  console.log('[PreviewResults] accountPreviews:', analysis?.accountPreviews);

  // If no real analysis data, show error state
  // Allow totalViolations: 0 (clean report) — only reject missing or invalid analysis
  const hasValidAnalysis = analysis && typeof analysis.totalViolations === 'number';
  if (!hasValidAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-border">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              No Analysis Data Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We couldn't find your credit report analysis. This could mean:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 mb-4">
              <li>Your session expired</li>
              <li>The report hasn't been uploaded yet</li>
              <li>There was an error during parsing</li>
            </ul>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation('/get-reports')}
            >
              Back to upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use REAL data from analysis - no placeholders
  const totalViolations = analysis.totalViolations;
  const divisor = totalViolations || 1; // avoid divide-by-zero for clean reports
  const severity = analysis.severityBreakdown || { critical: 0, high: 0, medium: 0, low: 0 };
  const categories = analysis.categoryBreakdown || analysis.categories || {
    latePayments: 0,
    collections: 0,
    chargeOffs: 0,
    judgments: 0,
    other: 0
  };
  
  // Get real accounts from analysis - check multiple possible field names
  // API returns accountPreviews with: name, last4, balance, status, amountType
  const rawAccounts = analysis.accountPreviews || analysis.sampleAccounts || analysis.accounts || [];
  const sampleAccounts = rawAccounts.map((acc: any) => ({
    accountName: acc.name || acc.accountName || 'Unknown',
    accountNumber: acc.last4 || acc.accountNumber || '****',
    balance: acc.balance || 0,
    status: acc.status || 'Negative',
    accountType: acc.amountType || acc.accountType || 'Account',
    negativeReason: acc.status || acc.negativeReason || 'Negative item'
  }));
  
  // Current scores: per-bureau only. Never show one number for all three — use API or analysis per-bureau, or "—".
  const { data: scoresByBureau } = trpc.creditReports.scoresByBureau.useQuery(undefined, { retry: false });
  const valid = (n: number | null | undefined) => (n != null && n >= 300 && n <= CREDIT_SCORE_MAX ? n : null);
  const fromApi = {
    transunion: valid(scoresByBureau?.transunion),
    equifax: valid(scoresByBureau?.equifax),
    experian: valid(scoresByBureau?.experian),
  };
  const creditScores = analysis.creditScores || analysis.bureauScores;
  const fromAnalysis = {
    transunion: valid(creditScores?.transunion) ?? null,
    equifax: valid(creditScores?.equifax) ?? null,
    experian: valid(creditScores?.experian) ?? null,
  };
  const currentScores = {
    transunion: fromApi.transunion ?? fromAnalysis.transunion,
    equifax: fromApi.equifax ?? fromAnalysis.equifax,
    experian: fromApi.experian ?? fromAnalysis.experian,
  };
  const representativeScore = currentScores.transunion ?? currentScores.equifax ?? currentScores.experian ?? valid(analysis.creditScore) ?? null;
  // Never show one score for all three bureaus — each bureau must be unique or "—". No static duplicate.
  const displayScores = currentScores;
  const hasAnyPerBureau = (currentScores.transunion ?? currentScores.equifax ?? currentScores.experian) != null;
  const singleScoreNote = false;

  const categoryCounts = {
    collections: Math.max(0, categories.collections ?? 0),
    latePayments: Math.max(0, categories.latePayments ?? 0),
    chargeOffs: Math.max(0, categories.chargeOffs ?? categories.other ?? 0),
  };
  const impactPredictionRaw = calculateImpactPrediction(categoryCounts);

  const bureaus = [
    { key: 'transunion' as const, short: 'TU' },
    { key: 'equifax' as const, short: 'EQ' },
    { key: 'experian' as const, short: 'EX' },
  ] as const;

  const impactPrediction = representativeScore != null
    ? capImpactForDisplay(representativeScore, impactPredictionRaw)
    : impactPredictionRaw;

  const getPotentialForScore = (current: number | null) => {
    if (current == null || current < 300 || current > CREDIT_SCORE_MAX) return null;
    const capped = capImpactForDisplay(current, impactPredictionRaw);
    return calculatePotentialRange(current, capped);
  };

  const savePreviewMutation = trpc.creditReports.savePreviewAnalysis.useMutation();

  const handleUpgrade = async (tier: 'essential' | 'complete') => {
    // Save the report to the app NOW (before checkout) so after payment Dashboard/My Live Report show it
    if (analysis?.totalViolations != null) {
      try {
        await savePreviewMutation.mutateAsync({
          analysis: {
            totalViolations: analysis.totalViolations,
            severityBreakdown: analysis.severityBreakdown || { critical: 0, high: 0, medium: 0, low: 0 },
            categoryBreakdown: analysis.categoryBreakdown || { collections: 0, latePayments: 0, chargeOffs: 0, judgments: 0, other: 0 },
            accountPreviews: analysis.accountPreviews,
            creditScore: analysis.creditScore,
            creditScores: analysis.creditScores,
          },
        });
      } catch (_) {
        // If not logged in or save fails, sessionStorage will be used on Checkout after payment
      }
    }
    setLocation(`/checkout?tier=${tier}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar with logo - centered */}
      <header className="sticky top-0 z-50 border-b-2 border-border bg-white shadow-sm">
        <div className="flex h-14 items-center justify-center gap-4 px-4 md:px-8 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center justify-center gap-2">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-gray-900 hidden sm:inline">DisputeStrike</span>
          </Link>
        </div>
      </header>
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Free Credit Report Preview is Ready!</h1>
          <p className="text-sm text-gray-600 mt-2">
            Our AI has performed a <strong className="text-orange-600">Light Analysis</strong> to identify potential violations. Choose an option below to unlock the full report details and start disputing!
          </p>
        </div>

        {/* 4 Metric Boxes - Strong borders and color coding */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box 1: Total Violations - RED theme */}
          <Card className="bg-accent/10 border-2 border-border shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
              <div>
                <CardTitle className="text-xs font-semibold text-accent uppercase tracking-wide">Total Potential Violations Found</CardTitle>
              </div>
              <AlertTriangle className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-5xl font-black text-accent">{totalViolations}</div>
              <p className="text-xs text-accent mt-2 font-medium">
                High potential for score increase!
              </p>
            </CardContent>
          </Card>

          {/* Box 2: Severity Breakdown - with progress bars */}
          <Card className="bg-white border-2 border-gray-300 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Severity Breakdown</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">Critical ({severity.critical})</span>
                  <span className="font-bold text-accent">{Math.round((severity.critical / divisor) * 100)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(severity.critical / divisor) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">High ({severity.high})</span>
                  <span className="font-bold text-orange-500">{Math.round((severity.high / divisor) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(severity.high / divisor) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">Medium ({severity.medium})</span>
                  <span className="font-bold text-yellow-600">{Math.round((severity.medium / divisor) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(severity.medium / divisor) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Box 3: Violation Categories - color-coded badges */}
          <Card className="bg-white border-2 border-gray-300 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Violation Categories</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-2 border-border font-semibold">Late Payments ({categories.latePayments})</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-2 border-border font-semibold">Collections ({categories.collections})</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-accent/10 text-accent border-2 border-border font-semibold">Charge-Offs ({categories.chargeOffs})</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-accent/10 text-accent border-2 border-border font-semibold">Judgments ({categories.judgments})</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-secondary text-foreground border-2 border-border font-semibold">Other ({categories.other})</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Box 4: Potential Impact - all 3 bureaus: current → potential */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Potential Score Impact</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="bg-primary/10 border-l-4 border-primary p-2 rounded-r mb-2">
                <div className="text-sm font-bold text-primary">{impactPrediction.rangeLabel}</div>
                <div className="text-xs text-primary">points if disputes succeed</div>
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Conservative:</span>
                  <span className="font-medium text-gray-800">{impactPrediction.conservative.label} pts</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Moderate:</span>
                  <span className="font-medium text-blue-700">{impactPrediction.moderate.label} pts</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Optimistic:</span>
                  <span className="font-medium text-primary">{impactPrediction.optimistic.label} pts</span>
                </div>
                <div className="pt-2 mt-2 border-t border-purple-200 space-y-1">
                  <p className="text-xs font-medium text-gray-600">
                    {hasAnyPerBureau ? "Per bureau — Current → Potential" : "Current → Potential"}
                  </p>
                  {bureaus.map(({ key, short }) => {
                    const current = displayScores[key];
                    const potential = getPotentialForScore(current);
                    return (
                      <div key={key} className="text-xs text-gray-700 flex justify-between items-baseline gap-2">
                        <span className="font-medium">{short}:</span>
                        <span>
                          <strong>{current != null ? current : "—"}</strong>
                          {" → "}
                          <strong className="text-primary">{potential != null ? potential.range : "—"}</strong>
                        </span>
                      </div>
                    );
                  })}
                  {!hasAnyPerBureau && representativeScore != null && (
                    <div className="text-xs text-gray-500 flex justify-between items-baseline gap-2 pt-0.5">
                      <span className="font-medium">Report:</span>
                      <span>
                        <strong>{representativeScore}</strong>
                        {" → "}
                        <strong className="text-green-600">{getPotentialForScore(representativeScore)?.range ?? "—"}</strong>
                        <span className="ml-1">(single score from report)</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Section - Strong blue border */}
        <Card className="bg-primary/5 border-2 border-border shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Your Dispute Timeline</CardTitle>
                <p className="text-xs text-gray-600">Here's exactly what happens when you start disputing:</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: "Day 0", desc: "Mail letter", color: "bg-primary" },
                { label: "Transit 5–7 days", desc: "Bureau receives (Return Receipt = receipt date)", color: "bg-primary/80" },
                { label: "30 days from receipt", desc: "Bureau investigates (FCRA); response sent by day 30", color: "bg-accent" },
                { label: "Days 35–40", desc: "You receive response", color: "bg-accent/80" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm mb-2`}>
                    {i + 1}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{step.label}</p>
                  <p className="text-xs text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-blue-200 text-center">
              <p className="text-sm font-semibold text-blue-800">~40 days max from when you mail</p>
              <p className="text-xs text-gray-600">30-day clock starts when bureau <strong>receives</strong> (proof: Return Receipt). Round 2 disputes can gain 80+ additional points.</p>
            </div>
          </CardContent>
        </Card>

        {/* Unlock Section - Strong purple border */}
        <Card className="bg-accent/5 border-2 border-border shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg font-bold text-gray-900">Unlock Full Report Details & Dispute Letters</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">The following critical details are currently blurred to protect our proprietary analysis and your privacy:</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-accent">Specific Account Names</strong> (e.g., Chase Bank, Portfolio Recovery)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-accent">Advanced FCRA Analysis</strong> (Our dispute analysis and violation checks)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-accent">Full Report Analysis</strong> (Required to generate legal dispute letters)</span>
              </li>
            </ul>

            {/* Upgrade Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Button 
                className="h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg"
                onClick={() => handleUpgrade('essential')}
              >
                <div className="text-center">
                  <div>Choose Essential ($79.99/mo)</div>
                  <div className="text-xs font-normal opacity-90">Print & mail letters yourself.</div>
                </div>
              </Button>
              <Button 
                className="h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base shadow-lg"
                onClick={() => handleUpgrade('complete')}
              >
                <div className="text-center">
                  <div>Choose Complete ($129.99/mo)</div>
                  <div className="text-xs font-normal opacity-90">We mail for you (5/month included).</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Preview Section - REAL DATA */}
        <Card className="border-2 border-border shadow-md">
          <CardHeader className="border-b-2 border-border pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">Accounts Found (Partial Preview)</CardTitle>
            <p className="text-sm text-gray-600">Below is a sample of accounts we found. Choose a plan to see all {totalViolations} accounts and generate dispute letters.</p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Show first 2 REAL accounts from analysis */}
            {sampleAccounts.slice(0, 2).map((account: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border-b-2 border-border hover:bg-secondary">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${index === 0 ? 'bg-primary/10' : 'bg-accent/10'} rounded-lg flex items-center justify-center`}>
                    <FileText className={`w-5 h-5 ${index === 0 ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{account.accountName || 'Unknown Account'} ****</p>
                    <p className="text-xs text-gray-500">Status: {account.status || account.negativeReason || 'Negative'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${index === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    ${typeof account.balance === 'number' ? account.balance.toLocaleString() : account.balance || '0'}
                  </p>
                  <p className="text-xs text-gray-500">{account.accountType || 'Balance'}</p>
                </div>
              </div>
            ))}

            {/* If no sample accounts, show placeholder message */}
            {sampleAccounts.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Account details are being processed...</p>
              </div>
            )}

            {/* More accounts locked */}
            <div className="p-6 text-center bg-secondary border-t-2 border-border">
              <p className="text-sm text-primary font-semibold">+ {Math.max(0, totalViolations - 2)} more accounts found</p>
              <p className="text-xs text-gray-500 mt-1">Choose a plan to see all accounts and generate dispute letters.</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimer */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1">Important Disclaimers</p>
              <p className="text-xs text-yellow-700 leading-relaxed">
                Potential score improvements are estimates for educational purposes only and do not guarantee results. Actual improvements depend on credit bureau responses, your credit history, and payment behavior. Results vary significantly by individual. Some items may be verified and remain on your report.
              </p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                DisputeStrike is not a credit repair organization. You have the right to dispute inaccurate information for FREE directly with credit bureaus under 15 U.S.C. § 1681i (FCRA). DisputeStrike makes this process faster and easier, but you control the disputes.
              </p>
              <p className="text-xs text-yellow-600 mt-2 italic">
                Estimates based on your analysis: {categoryCounts.collections} collection(s), {categoryCounts.latePayments} late payment(s), {categoryCounts.chargeOffs} charge-off(s).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t-2 border-border">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Secure checkout • Cancel anytime • 100% FCRA Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
