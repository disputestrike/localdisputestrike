import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Upload,
  ArrowUp,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    startedAt: string;
    itemsCount?: number;
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
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
  const isUnlimited = true; // Both Essential and Complete are unlimited rounds now

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-white border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Dispute Progress
          </CardTitle>
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            Round {currentRound}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0" />
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step < currentRound 
                    ? "bg-green-500 border-green-500 text-white" 
                    : step === currentRound 
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200" 
                      : "bg-white border-gray-200 text-gray-400"
                }`}>
                  {step < currentRound ? <CheckCircle className="w-6 h-6" /> : <span className="font-bold">{step}</span>}
                </div>
                <span className={`text-xs font-medium ${step === currentRound ? "text-orange-600" : "text-gray-500"}`}>
                  Round {step}
                </span>
              </div>
            ))}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white border-gray-200 text-gray-400">
                <span className="text-lg">∞</span>
              </div>
              <span className="text-xs font-medium text-gray-500">Unlimited</span>
            </div>
          </div>

          {/* Lock Status */}
          <div className={`rounded-2xl p-6 border transition-all ${
            isLocked 
              ? "bg-slate-50 border-slate-200" 
              : "bg-orange-50 border-orange-100"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isLocked ? "bg-slate-200 text-slate-600" : "bg-orange-500 text-white shadow-lg shadow-orange-200"
              }`}>
                {isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {isLocked ? `Round ${nextRound} Locked` : `Round ${nextRound} Available!`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isLocked 
                        ? `Next round unlocks in ${daysRemaining} days` 
                        : "You can now start your next round of disputes."}
                    </p>
                  </div>
                  {isLocked && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-700">{daysRemaining}d</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Remaining</div>
                    </div>
                  )}
                </div>

                {isLocked && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Unlocks on {new Date(lockedUntil!).toLocaleDateString()}
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">Unlock Early?</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Upload the response letters you received from the bureaus to unlock your next round immediately.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={onUploadResponses}
                      >
                        Upload Responses
                      </Button>
                    </div>
                  </div>
                )}

                {!isLocked && (
                  <Button 
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                    onClick={onStartRound}
                  >
                    Start Round {nextRound}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Round History */}
          {roundHistory.length > 0 && (
            <div className="pt-4">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Round History</h5>
              <div className="space-y-2">
                {roundHistory.map((round) => (
                  <div key={round.roundNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Round {round.roundNumber}</div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(round.startedAt).toLocaleDateString()} • {round.itemsDisputed || round.itemsCount} items
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">Completed</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
