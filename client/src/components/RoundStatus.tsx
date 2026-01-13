/**
 * Round Status Component
 * 
 * Displays current round status with countdown timer
 * Shows progress through rounds and lock status
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Upload,
  ArrowUp
} from 'lucide-react';

interface RoundStatusProps {
  currentRound: number;
  maxRounds: number;
  isLocked: boolean;
  lockedUntil: string | null;
  daysRemaining: number;
  canStartNextRound: boolean;
  subscriptionTier: string;
  roundHistory: {
    roundNumber: number;
    status: string;
    itemsDisputed: number;
    itemsDeleted: number;
    itemsVerified: number;
    responsesUploaded: boolean;
  }[];
  onStartRound: () => void;
  onUploadResponses: () => void;
}

export default function RoundStatus({
  currentRound,
  maxRounds,
  isLocked,
  lockedUntil,
  daysRemaining,
  canStartNextRound,
  subscriptionTier,
  roundHistory,
  onStartRound,
  onUploadResponses,
}: RoundStatusProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Update countdown every second
  useEffect(() => {
    if (!lockedUntil || !isLocked) return;

    const updateCountdown = () => {
      const now = new Date();
      const unlock = new Date(lockedUntil);
      const diff = unlock.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil, isLocked]);

  const nextRound = currentRound + 1;
  const isUnlimited = maxRounds === -1;
  const needsUpgrade = !isUnlimited && currentRound >= maxRounds;

  // Get tier display name
  const getTierName = (tier: string) => {
    switch (tier) {
      case 'starter': return 'Starter';
      case 'professional': return 'Professional';
      case 'complete': return 'Complete';
      default: return tier;
    }
  };

  // Get suggested upgrade tier
  const getUpgradeTier = () => {
    if (subscriptionTier === 'starter') return 'professional';
    if (subscriptionTier === 'professional') return 'complete';
    return null;
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">Dispute Rounds</h2>
          <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
            {getTierName(subscriptionTier)} Plan
          </span>
        </div>

        {/* Round Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((round) => {
            const isComplete = round <= currentRound && roundHistory.find(r => r.roundNumber === round)?.status === 'complete';
            const isActive = round === currentRound && !isComplete;
            const isFuture = round > currentRound;
            const isAvailable = isUnlimited || round <= maxRounds;

            return (
              <div key={round} className="flex items-center">
                <div className={`flex flex-col items-center ${!isAvailable ? 'opacity-40' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete 
                      ? 'bg-emerald-500 text-white'
                      : isActive
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                        : isFuture && isAvailable
                          ? 'bg-slate-700 text-slate-400'
                          : 'bg-slate-800 text-slate-600'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : !isAvailable ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="font-semibold">{round}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${
                    isComplete ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-500'
                  }`}>
                    Round {round}
                  </span>
                </div>
                {round < 3 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    round < currentRound ? 'bg-emerald-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            );
          })}
          
          {/* CFPB indicator for Complete tier */}
          {subscriptionTier === 'complete' && (
            <>
              <div className="w-8 h-0.5 mx-1 bg-slate-700" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center">
                  <span className="text-xs font-semibold">CFPB</span>
                </div>
                <span className="text-xs mt-1 text-slate-500">Escalate</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="p-6">
        {/* Locked State with Countdown */}
        {isLocked && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">Round {nextRound} Locked</span>
            </div>

            {/* Countdown Timer */}
            <div className="bg-slate-900/50 rounded-xl p-6 text-center mb-4">
              <p className="text-slate-400 text-sm mb-3">Unlocks in</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{countdown.days}</div>
                  <div className="text-slate-500 text-xs">DAYS</div>
                </div>
                <div className="text-2xl text-slate-600">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{countdown.hours.toString().padStart(2, '0')}</div>
                  <div className="text-slate-500 text-xs">HOURS</div>
                </div>
                <div className="text-2xl text-slate-600">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{countdown.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-slate-500 text-xs">MINS</div>
                </div>
                <div className="text-2xl text-slate-600">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{countdown.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-slate-500 text-xs">SECS</div>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                Check your mail around {new Date(lockedUntil!).toLocaleDateString()}
              </p>
            </div>

            {/* Early Unlock Option */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Unlock Early</p>
                  <p className="text-slate-400 text-sm mb-3">
                    Upload your bureau response letters to unlock Round {nextRound} immediately and get AI-powered recommendations.
                  </p>
                  <button
                    onClick={onUploadResponses}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Responses
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Start Next Round */}
        {!isLocked && canStartNextRound && !needsUpgrade && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Round {nextRound} Ready</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-white mb-3">
                You're ready to start Round {nextRound}. AI will select the best items to dispute based on your previous results.
              </p>
              <button
                onClick={onStartRound}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                Start Round {nextRound}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Needs Upgrade */}
        {needsUpgrade && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">Round Limit Reached</span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-white mb-3">
                You've completed all {maxRounds} rounds included in your {getTierName(subscriptionTier)} plan. 
                Upgrade to {getTierName(getUpgradeTier()!)} for {getUpgradeTier() === 'complete' ? 'unlimited' : '3'} rounds.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <ArrowUp className="w-5 h-5" />
                Upgrade to {getTierName(getUpgradeTier()!)}
              </button>
            </div>
          </div>
        )}

        {/* Round History */}
        {roundHistory.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">Round History</h3>
            <div className="space-y-3">
              {roundHistory.map((round) => (
                <div 
                  key={round.roundNumber}
                  className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      round.status === 'complete' 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {round.status === 'complete' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">Round {round.roundNumber}</p>
                      <p className="text-slate-400 text-sm">
                        {round.itemsDisputed} items disputed
                      </p>
                    </div>
                  </div>
                  
                  {round.status === 'complete' && (
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold">
                        {round.itemsDeleted} deleted
                      </p>
                      <p className="text-slate-400 text-sm">
                        {round.itemsVerified} verified
                      </p>
                    </div>
                  )}
                  
                  {round.status === 'mailed' && (
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                      Awaiting Response
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
