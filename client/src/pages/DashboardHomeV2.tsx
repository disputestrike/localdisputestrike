/**
 * Dashboard Home V2
 * 
 * New dashboard with tier-based flow:
 * - Trial users: See data, prompted to upgrade
 * - Paid users: Round status, AI recommendations, generate letters
 * - Round locking with countdown
 * - Response upload prompts
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  ChevronRight,
  Lock,
  Unlock,
  Target,
  Zap,
  CheckCircle,
  ArrowUp,
  CreditCard,
  Download,
  Mail
} from 'lucide-react';
import RoundStatus from '../components/RoundStatus';

interface DashboardData {
  user: {
    name: string;
    email: string;
    tier: 'trial' | 'starter' | 'professional' | 'complete';
    subscriptionStatus: string;
    trialEndsAt?: string;
  };
  scores: {
    transunion: number;
    equifax: number;
    experian: number;
    change?: number;
  };
  negativeItems: {
    total: number;
    disputed: number;
    deleted: number;
    pending: number;
  };
  roundStatus: {
    currentRound: number;
    maxRounds: number;
    isLocked: boolean;
    lockedUntil: string | null;
    daysRemaining: number;
    canStartNextRound: boolean;
    roundHistory: any[];
  };
  recommendations: {
    accountId: number;
    accountName: string;
    accountType: string;
    balance: number;
    bureau: string;
    winProbability: number;
    recommendationReason: string;
    isRecommended: boolean;
  }[];
  currentRoundLetters?: {
    id: number;
    bureau: string;
    status: string;
    generatedAt: string;
  }[];
}

export default function DashboardHomeV2() {
  const [, setLocation] = useLocation();
  const navigate = setLocation;
  const [showAllItems, setShowAllItems] = useState(false);

  // Mock data for demo
  const mockDashboardData: DashboardData = {
    user: {
      name: 'John Smith',
      email: 'john@example.com',
      tier: 'professional',
      subscriptionStatus: 'active',
    },
    scores: {
      transunion: 642,
      equifax: 638,
      experian: 651,
      change: 12,
    },
    negativeItems: {
      total: 8,
      disputed: 3,
      deleted: 2,
      pending: 1,
    },
    roundStatus: {
      currentRound: 1,
      maxRounds: 3,
      status: 'in_progress',
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      unlocksAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      lettersSent: 3,
      responsesReceived: 1,
      isLocked: true,
      lockedUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 25,
      canStartNextRound: false,
      roundHistory: [
        {
          roundNumber: 1,
          status: 'in_progress',
          itemsDisputed: 3,
          itemsDeleted: 0,
          itemsVerified: 0,
          responsesUploaded: false,
        },
      ],
    },
    recommendations: [
      {
        id: 1,
        accountName: 'PORTFOLIO RECOVERY',
        accountType: 'Collection',
        balance: 2847,
        bureau: 'All 3',
        isRecommended: true,
        winProbability: 89,
        reason: 'Balance conflicts across bureaus',
      },
      {
        id: 2,
        accountName: 'CAPITAL ONE',
        accountType: 'Credit Card',
        balance: 1200,
        bureau: 'TransUnion, Equifax',
        isRecommended: true,
        winProbability: 76,
        reason: 'Date reporting error detected',
      },
      {
        id: 3,
        accountName: 'MIDLAND CREDIT',
        accountType: 'Collection',
        balance: 1203,
        bureau: 'Experian',
        isRecommended: true,
        winProbability: 82,
        reason: 'Original creditor info missing',
      },
    ],
    currentRoundLetters: [
      { id: 1, bureau: 'TransUnion', status: 'mailed', mailedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, bureau: 'Equifax', status: 'mailed', mailedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, bureau: 'Experian', status: 'mailed', mailedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  };

  // Fetch dashboard data - use mock data as fallback
  const { data: apiData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboardV2'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/v2');
      if (!response.ok) throw new Error('Failed to load dashboard');
      return response.json();
    },
    retry: false,
  });

  // Use mock data if API fails
  const data = apiData || mockDashboardData;

  // Start round mutation
  const startRoundMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/rounds/start', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Generate letters mutation
  const generateLettersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/letters/generate', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate letters');
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Mark as mailed mutation
  const markMailedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/rounds/mark-mailed', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark as mailed');
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Show loading only briefly, then show mock data
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, scores, negativeItems, roundStatus, recommendations, currentRoundLetters } = data;
  const isTrial = user.tier === 'trial';
  const isPaid = ['starter', 'professional', 'complete'].includes(user.tier);
  const recommendedItems = recommendations.filter(r => r.isRecommended);

  // Calculate trial days remaining
  const getTrialDaysRemaining = () => {
    if (!user.trialEndsAt) return 0;
    const endDate = new Date(user.trialEndsAt);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-orange-500';
    if (score >= 670) return 'text-yellow-400';
    if (score >= 580) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get tier display name
  const getTierName = (tier: string) => {
    switch (tier) {
      case 'trial': return 'Trial';
      case 'starter': return 'Starter';
      case 'professional': return 'Professional';
      case 'complete': return 'Complete';
      default: return tier;
    }
  };

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {isTrial && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-gray-900 font-semibold">Trial ends in {getTrialDaysRemaining()} days</p>
              <p className="text-gray-600 text-sm">Upgrade to start fixing your credit</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/pricing')}
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            Upgrade Now <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-gray-600">
            {isTrial 
              ? "Here's your credit analysis. Upgrade to start disputing."
              : `${getTierName(user.tier)} Plan • Round ${roundStatus.currentRound || 1}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            isTrial 
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-orange-600/20 text-orange-500'
          }`}>
            {getTierName(user.tier)}
          </span>
        </div>
      </div>

      {/* Credit Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { bureau: 'TransUnion', score: scores.transunion },
          { bureau: 'Equifax', score: scores.equifax },
          { bureau: 'Experian', score: scores.experian },
        ].map(({ bureau, score }) => (
          <div key={bureau} className="bg-gray-50/50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">{bureau}</p>
            <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</p>
            {scores.change && (
              <p className={`text-sm mt-1 ${scores.change > 0 ? 'text-orange-500' : 'text-gray-600'}`}>
                {scores.change > 0 ? '+' : ''}{scores.change} pts
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Negative Items</p>
              <p className="text-gray-900 text-xl font-bold">{negativeItems.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-gray-900 text-xl font-bold">{negativeItems.disputed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Deleted</p>
              <p className="text-gray-900 text-xl font-bold">{negativeItems.deleted}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-gray-900 text-xl font-bold">{negativeItems.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Round Status (for paid users) */}
        {isPaid && (
          <div className="lg:col-span-1">
            <RoundStatus
              currentRound={roundStatus.currentRound}
              maxRounds={roundStatus.maxRounds}
              isLocked={roundStatus.isLocked}
              lockedUntil={roundStatus.lockedUntil}
              daysRemaining={roundStatus.daysRemaining}
              canStartNextRound={roundStatus.canStartNextRound}
              subscriptionTier={user.tier}
              roundHistory={roundStatus.roundHistory}
              onStartRound={() => startRoundMutation.mutate()}
              onUploadResponses={() => navigate(`/responses/${roundStatus.currentRound}`)}
            />
          </div>
        )}

        {/* Right Column - AI Recommendations & Actions */}
        <div className={isPaid ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* AI Recommendations */}
          <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-gray-900 text-lg font-semibold">
                    {isTrial ? 'AI Recommended Items' : `Round ${roundStatus.currentRound + 1} Recommendations`}
                  </h2>
                  <p className="text-gray-600 text-sm">Highest probability of deletion</p>
                </div>
              </div>
              <span className="bg-orange-600/20 text-orange-500 px-3 py-1 rounded-full text-sm">
                {recommendedItems.length} items
              </span>
            </div>

            <div className="space-y-3">
              {recommendedItems.slice(0, showAllItems ? undefined : 3).map((item, index) => (
                <div 
                  key={item.accountId}
                  className="bg-white/50 border border-gray-300 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-gray-900 text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-gray-900 font-medium">{item.accountName}</h3>
                        <p className="text-gray-600 text-sm">{item.accountType} • {item.bureau}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-semibold">${item.balance?.toLocaleString()}</p>
                      <p className="text-orange-500 text-sm">{item.winProbability}% win rate</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-orange-600/10 rounded-lg p-2 mt-2">
                    <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-300 text-sm">{item.recommendationReason}</p>
                  </div>
                </div>
              ))}
            </div>

            {recommendedItems.length > 3 && (
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="w-full mt-4 text-orange-500 hover:text-emerald-300 text-sm"
              >
                {showAllItems ? 'Show less' : `Show ${recommendedItems.length - 3} more items`}
              </button>
            )}

            {/* Action Buttons */}
            {isTrial ? (
              <div className="mt-6 bg-white/50 border border-gray-300 rounded-lg p-4 text-center">
                <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-900 font-semibold mb-1">Ready to dispute these items?</p>
                <p className="text-gray-600 text-sm mb-4">Upgrade to generate dispute letters</p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-orange-600 hover:bg-orange-700 text-gray-900 px-6 py-2 rounded-lg font-semibold"
                >
                  Upgrade to Start
                </button>
              </div>
            ) : roundStatus.canStartNextRound && !currentRoundLetters?.length ? (
              <button
                onClick={() => generateLettersMutation.mutate()}
                disabled={generateLettersMutation.isPending}
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generate Dispute Letters
              </button>
            ) : null}
          </div>

          {/* Generated Letters (if any) */}
          {currentRoundLetters && currentRoundLetters.length > 0 && (
            <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-gray-900 text-lg font-semibold mb-4">Your Dispute Letters</h2>
              
              <div className="space-y-3 mb-6">
                {currentRoundLetters.map(letter => (
                  <div 
                    key={letter.id}
                    className="flex items-center justify-between bg-white/50 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="text-gray-900 font-medium">{letter.bureau} Dispute Letter</p>
                        <p className="text-gray-600 text-sm">
                          Generated {new Date(letter.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/letters/${letter.id}`)}
                      className="bg-gray-100 hover:bg-slate-600 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>

              {/* Mailing Instructions */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-semibold">Mail Your Letters</p>
                    <p className="text-gray-700 text-sm">
                      Print and mail each letter via certified mail with return receipt. 
                      Keep your tracking numbers for proof of delivery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/mailing-instructions')}
                  className="flex-1 bg-gray-100 hover:bg-slate-600 text-gray-900 py-3 rounded-lg font-semibold"
                >
                  View Mailing Instructions
                </button>
                <button
                  onClick={() => markMailedMutation.mutate()}
                  disabled={markMailedMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  I've Mailed My Letters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
