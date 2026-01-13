/**
 * Credit Analysis Dashboard
 * 
 * Shown after $1 trial payment - displays real credit data and AI recommendations
 * Users can see their problems but can't generate letters until they upgrade
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  FileText,
  ArrowRight
} from 'lucide-react';

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
  subscription: {
    status: string;
    tier: string;
  };
}

export default function CreditAnalysis() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<'starter' | 'professional' | 'complete'>('professional');

  const { data: analysis, isLoading, error } = useQuery<AnalysisData>({
    queryKey: ['creditAnalysis'],
    queryFn: async () => {
      const response = await fetch('/api/credit/analysis');
      if (!response.ok) throw new Error('Failed to load analysis');
      return response.json();
    },
  });

  // Calculate days remaining in trial
  const getDaysRemaining = () => {
    if (!analysis?.trialEndsAt) return 7;
    const endDate = new Date(analysis.trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysRemaining = getDaysRemaining();
  const isTrialActive = analysis?.subscription?.status === 'trial';
  const isPaid = analysis?.subscription?.status === 'active';

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-emerald-400';
    if (score >= 670) return 'text-yellow-400';
    if (score >= 580) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 740) return 'Excellent';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your credit analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Unable to load analysis</h2>
          <p className="text-slate-400 mb-4">Please try again or contact support.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const recommendedItems = analysis?.negativeItems?.filter(item => item.isRecommended) || [];
  const otherItems = analysis?.negativeItems?.filter(item => !item.isRecommended) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Trial Banner */}
        {isTrialActive && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-white font-semibold">Trial ends in {daysRemaining} days</p>
                <p className="text-slate-400 text-sm">Upgrade now to start fixing your credit</p>
              </div>
            </div>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              Upgrade Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Credit Analysis</h1>
          <p className="text-slate-400">Here's what's hurting your score and how to fix it</p>
        </div>

        {/* Credit Scores */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {analysis?.scores?.map((score) => (
            <div key={score.bureau} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">{score.bureau}</p>
              <p className={`text-5xl font-bold ${getScoreColor(score.score)} mb-1`}>
                {score.score}
              </p>
              <p className={`text-sm ${getScoreColor(score.score)}`}>
                {getScoreLabel(score.score)}
              </p>
              {score.change && (
                <p className={`text-sm mt-2 ${score.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {score.change > 0 ? '+' : ''}{score.change} pts this month
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Impact Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Negative Items</p>
                <p className="text-white text-2xl font-bold">{analysis?.totalNegativeItems || 0}</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">Items hurting your score</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Potential Increase</p>
                <p className="text-white text-2xl font-bold">+{analysis?.estimatedScoreIncrease || 0} pts</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">If disputed items removed</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Interest Savings</p>
                <p className="text-white text-2xl font-bold">${analysis?.estimatedInterestSavings?.toLocaleString() || 0}/yr</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">With improved credit</p>
          </div>
        </div>

        {/* AI Recommended Items */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold">AI Recommended for Round 1</h2>
                <p className="text-slate-400 text-sm">Highest probability of deletion</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
              {recommendedItems.length} items selected
            </span>
          </div>

          <div className="space-y-4">
            {recommendedItems.map((item, index) => (
              <div 
                key={item.id}
                className="bg-slate-900/50 border border-slate-600 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-white font-semibold">{item.accountName}</h3>
                      <p className="text-slate-400 text-sm">{item.accountType} • {item.bureau}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${item.balance?.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm">{item.status}</p>
                  </div>
                </div>

                {/* Win probability bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Win Probability</span>
                    <span className="text-emerald-400 font-semibold">{item.winProbability}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${item.winProbability}%` }}
                    />
                  </div>
                </div>

                {/* AI Reason */}
                <div className="flex items-start gap-2 bg-emerald-500/10 rounded-lg p-3">
                  <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-emerald-300 text-sm">{item.recommendationReason}</p>
                </div>

                {item.hasConflicts && (
                  <div className="flex items-center gap-2 mt-2 text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Cross-bureau conflicts detected - strong case for deletion
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Locked CTA for trial users */}
          {isTrialActive && (
            <div className="mt-6 bg-slate-900/50 border border-slate-600 rounded-xl p-6 text-center">
              <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Ready to dispute these items?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Upgrade to generate dispute letters and start improving your credit
              </p>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
              >
                <FileText className="w-5 h-5" />
                Upgrade to Generate Letters
              </button>
            </div>
          )}
        </div>

        {/* Other Negative Items */}
        {otherItems.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-white text-xl font-semibold mb-4">
              Other Negative Items ({otherItems.length})
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              These items will be addressed in future rounds after the recommended items are resolved.
            </p>
            
            <div className="space-y-3">
              {otherItems.slice(0, 5).map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between bg-slate-900/30 rounded-lg p-3"
                >
                  <div>
                    <p className="text-white">{item.accountName}</p>
                    <p className="text-slate-400 text-sm">{item.accountType} • {item.bureau}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">${item.balance?.toLocaleString()}</p>
                    <p className="text-slate-500 text-sm">{item.winProbability}% win rate</p>
                  </div>
                </div>
              ))}
              
              {otherItems.length > 5 && (
                <p className="text-slate-500 text-sm text-center pt-2">
                  +{otherItems.length - 5} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div id="pricing" className="scroll-mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
            <p className="text-slate-400">Start fixing your credit today</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div 
              className={`bg-slate-800/50 border rounded-xl p-6 cursor-pointer transition-all ${
                selectedTier === 'starter' 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedTier('starter')}
            >
              <h3 className="text-white text-xl font-semibold mb-1">Starter</h3>
              <p className="text-slate-400 text-sm mb-4">2 rounds of disputes</p>
              <p className="text-3xl font-bold text-white mb-4">
                $49<span className="text-slate-400 text-base font-normal">/mo</span>
              </p>
              
              <ul className="space-y-3 mb-6">
                {[
                  '2 dispute rounds',
                  '3-bureau monitoring',
                  'AI item selection',
                  'DIY print & mail',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedTier === 'starter'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {selectedTier === 'starter' ? 'Selected' : 'Select'}
              </button>
            </div>

            {/* Professional */}
            <div 
              className={`bg-slate-800/50 border rounded-xl p-6 cursor-pointer transition-all relative ${
                selectedTier === 'professional' 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedTier('professional')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              
              <h3 className="text-white text-xl font-semibold mb-1">Professional</h3>
              <p className="text-slate-400 text-sm mb-4">3 rounds of disputes</p>
              <p className="text-3xl font-bold text-white mb-4">
                $69.95<span className="text-slate-400 text-base font-normal">/mo</span>
              </p>
              
              <ul className="space-y-3 mb-6">
                {[
                  '3 dispute rounds',
                  '3-bureau monitoring',
                  'AI item selection',
                  'Response analysis',
                  'Escalation templates',
                  'DIY print & mail',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedTier === 'professional'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {selectedTier === 'professional' ? 'Selected' : 'Select'}
              </button>
            </div>

            {/* Complete */}
            <div 
              className={`bg-slate-800/50 border rounded-xl p-6 cursor-pointer transition-all ${
                selectedTier === 'complete' 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedTier('complete')}
            >
              <h3 className="text-white text-xl font-semibold mb-1">Complete</h3>
              <p className="text-slate-400 text-sm mb-4">Unlimited + white-glove</p>
              <p className="text-3xl font-bold text-white mb-4">
                $99.95<span className="text-slate-400 text-base font-normal">/mo</span>
              </p>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Unlimited rounds',
                  '3-bureau monitoring',
                  'AI item selection',
                  'Response analysis',
                  'We print & mail for you',
                  'CFPB complaints',
                  'Monthly coaching call',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedTier === 'complete'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {selectedTier === 'complete' ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate(`/checkout?tier=${selectedTier}`)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 mx-auto"
            >
              Continue with {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-slate-500 text-sm mt-3">
              Cancel anytime. No long-term contracts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
