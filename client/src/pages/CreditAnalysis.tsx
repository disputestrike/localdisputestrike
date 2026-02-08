/**
 * Credit Analysis Dashboard
 *
 * Shown after subscription payment - displays real credit data and AI recommendations
 * Full access for Essential and Complete subscribers
 */

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { CONSUMER_PRICE_LABELS } from "@/lib/pricing";

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

export default function CreditAnalysis() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<"essential" | "complete">("complete");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const MAX_ITEMS_PER_ROUND = 5;

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
        const score = r.creditScore != null && r.creditScore >= 300 && r.creditScore <= 850 ? r.creditScore : null;
        if (existing && score != null) existing.score = score;
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
  }, [creditReports, scoresByBureau, negativeAccounts, profile]);

  const isLoading = reportsLoading || accountsLoading;

  const getDaysRemaining = () => {
    if (!analysis?.trialEndsAt) return 7;
    const endDate = new Date(analysis.trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysRemaining = getDaysRemaining();
  const isTrialActive = analysis?.subscription?.status === 'trial';

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

  const tiers = [
    {
      id: 'essential' as const,
      name: 'Essential',
      price: CONSUMER_PRICE_LABELS.essential,
      period: '/month',
      rounds: 'Unlimited',
      features: ['Unlimited dispute rounds', '30-day intervals', 'AI letter generation', 'You mail letters'],
    },
    {
      id: 'complete' as const,
      name: 'Complete',
      price: CONSUMER_PRICE_LABELS.complete,
      period: '/month',
      rounds: 'Unlimited',
      popular: true,
      features: ['Unlimited rounds', '5 mailings/month included', 'Certified mail', 'CFPB complaints'],
    },
  ];

  const handleUpgrade = () => {
    // Redirect to Stripe checkout with selected tier
    setLocation(`/checkout?tier=${selectedTier}`);
  };

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

  // Auto-select recommended items up to max on mount
  useEffect(() => {
    if (recommendedItems.length > 0 && selectedItems.length === 0) {
      const autoSelected = recommendedItems.slice(0, MAX_ITEMS_PER_ROUND).map(item => item.id);
      setSelectedItems(autoSelected);
    }
  }, [recommendedItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your credit analysis...</p>
        </div>
      </div>
    );
  }

  const hasNoData = !analysis.totalNegativeItems && !creditReports.length;
  if (hasNoData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No credit data yet</h1>
          <p className="text-gray-600 mb-6">
            Upload your credit reports from the dashboard to see your scores, negative items, and AI recommendations.
          </p>
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium">
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            {isTrialActive && (
              <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                <span>{daysRemaining} days left in trial</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4">
        {/* Trial Banner */}
        {isTrialActive && (
          <div className="bg-accent/5 border-2 border-border rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" />
              <div>
                <p className="font-semibold text-gray-900">Your trial ends in {daysRemaining} days</p>
                <p className="text-gray-600 text-sm">Upgrade now to start disputing and improve your credit</p>
              </div>
            </div>
            <button 
              onClick={() => document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Credit Scores */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-600" />
            Your Credit Scores
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {analysis?.scores.map((score) => {
              const hasScore = score.score >= 300 && score.score <= 850;
              const short = score.bureau === 'TransUnion' ? 'TU' : score.bureau === 'Equifax' ? 'EQ' : 'EX';
              return (
                <div key={score.bureau} className={`${hasScore ? getScoreBgColor(score.score) : 'bg-gray-100'} rounded-lg p-4 text-center border border-gray-200`}>
                  <p className="text-xs font-medium text-gray-600 mb-1">{short}</p>
                  <p className={`text-2xl font-bold ${hasScore ? getScoreColor(score.score) : 'text-gray-400'}`}>
                    {hasScore ? score.score : '—'}
                  </p>
                  {!hasScore && <p className="text-xs text-gray-500 mt-0.5">From report</p>}
                  {hasScore && score.change != null && (
                    <p className={`text-xs mt-1 ${score.change > 0 ? 'text-primary' : 'text-accent'}`}>
                      {score.change > 0 ? '+' : ''}{score.change} pts
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span className="text-gray-600">Negative Items</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analysis?.totalNegativeItems}</p>
            <p className="text-gray-500 text-sm">hurting your score</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-gray-600">Potential Increase</span>
            </div>
            <p className="text-3xl font-bold text-green-600">+{analysis?.estimatedScoreIncrease}</p>
            <p className="text-gray-500 text-sm">estimated points</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-accent" />
              <span className="text-gray-600">Interest Savings</span>
            </div>
            <p className="text-3xl font-bold text-accent">${analysis?.estimatedInterestSavings?.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">per year potential</p>
          </div>
        </div>

        {/* All Negative Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-600" />
              Your Negative Items
            </h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedItems.length >= MAX_ITEMS_PER_ROUND 
                  ? 'bg-accent/10 text-accent' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedItems.length}/{MAX_ITEMS_PER_ROUND} selected for Round 1
              </span>
            </div>
          </div>

          {selectedItems.length >= MAX_ITEMS_PER_ROUND && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-700">
              <strong>Maximum 5 items per round.</strong> You can dispute more items in subsequent rounds after 30 days.
            </div>
          )}

          {/* Recommended Items Section */}
          {recommendedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Recommended (High Win Probability)
              </h3>
              <div className="space-y-3">
                {recommendedItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItemSelection(item.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-orange-600 bg-orange-50'
                        : selectedItems.length >= MAX_ITEMS_PER_ROUND
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedItems.includes(item.id)
                            ? 'border-border bg-accent'
                            : 'border-gray-300'
                        }`}>
                          {selectedItems.includes(item.id) && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.accountName}</h3>
                          <p className="text-gray-600 text-sm">{item.accountType} • {item.bureau}</p>
                          <p className="text-gray-500 text-sm mt-1">${item.balance.toLocaleString()} • {item.status}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        item.winProbability >= 70 ? 'bg-green-100 text-green-700' :
                        item.winProbability >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <Zap className="w-4 h-4" />
                        {item.winProbability}% win probability
                      </div>
                    </div>
                    <div className="mt-3 ml-10 bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">AI Analysis:</span> {item.recommendationReason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Items Section */}
          {otherItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Other Negative Items
              </h3>
              <div className="space-y-3">
                {otherItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItemSelection(item.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-orange-600 bg-orange-50'
                        : selectedItems.length >= MAX_ITEMS_PER_ROUND
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedItems.includes(item.id)
                            ? 'border-border bg-accent'
                            : 'border-gray-300'
                        }`}>
                          {selectedItems.includes(item.id) && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.accountName}</h3>
                          <p className="text-gray-600 text-sm">{item.accountType} • {item.bureau}</p>
                          <p className="text-gray-500 text-sm mt-1">${item.balance.toLocaleString()} • {item.status}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        item.winProbability >= 70 ? 'bg-green-100 text-green-700' :
                        item.winProbability >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <Zap className="w-4 h-4" />
                        {item.winProbability}% win probability
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked CTA */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Generate Dispute Letters</h3>
            <p className="text-gray-600 text-sm mb-4">
              Choose a plan below to start disputing these items and improve your credit score
            </p>
          </div>
        </div>

        {/* Upgrade Section */}
        <div id="upgrade-section" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Plan to Start Disputing
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6 max-w-2xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                } ${tier.popular ? 'ring-2 ring-orange-600' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {tier.price}
                    <span className="text-gray-500 text-base font-normal">{tier.period}</span>
                  </p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded mt-2">
                    {tier.rounds}
                  </span>
                </div>
                
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {selectedTier === tier.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Upgrade to {tiers.find(t => t.id === selectedTier)?.name} - {tiers.find(t => t.id === selectedTier)?.price}/mo
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto text-center text-sm text-gray-500 px-4">
          <p className="mb-2">
            DisputeStrike is dispute automation software, not a credit repair service. 
            Results vary and are not guaranteed.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/terms"><a className="hover:text-accent">Terms of Service</a></Link>
            <Link href="/privacy"><a className="hover:text-accent">Privacy Policy</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
