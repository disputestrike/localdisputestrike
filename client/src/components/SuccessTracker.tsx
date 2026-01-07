import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle2, XCircle, Clock, Award } from "lucide-react";

interface SuccessTrackerProps {
  stats: {
    totalAccountsDisputed: number;
    accountsDeleted: number;
    accountsVerified: number;
    accountsPending: number;
    scoreIncrease: number | null;
    beforeScore: number | null;
    afterScore: number | null;
  };
}

export default function SuccessTracker({ stats }: SuccessTrackerProps) {
  const deletionRate = stats.totalAccountsDisputed > 0 
    ? Math.round((stats.accountsDeleted / stats.totalAccountsDisputed) * 100)
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Score Improvement Card */}
      {stats.scoreIncrease !== null && stats.scoreIncrease > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Credit Score Improvement</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-green-600">+{stats.scoreIncrease}</span>
                <span className="text-xl text-gray-500">points</span>
              </div>
              {stats.beforeScore && stats.afterScore && (
                <p className="text-sm text-gray-600 mt-2">
                  {stats.beforeScore} → {stats.afterScore}
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deleted */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Deleted</p>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.accountsDeleted}</p>
          <p className="text-xs text-gray-500 mt-1">
            {deletionRate}% deletion rate
          </p>
        </Card>
        
        {/* Verified (Needs Round 2) */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Verified</p>
            <XCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.accountsVerified}</p>
          <p className="text-xs text-gray-500 mt-1">
            Send Round 2 letters
          </p>
        </Card>
        
        {/* Pending */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.accountsPending}</p>
          <p className="text-xs text-gray-500 mt-1">
            Under investigation
          </p>
        </Card>
      </div>
      
      {/* Achievement Badge */}
      {deletionRate >= 70 && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-lg">Excellent Results!</p>
              <p className="text-sm text-gray-600">
                Your {deletionRate}% deletion rate is above the national average of 60-65%
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Progress Summary */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Dispute Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Accounts Deleted</span>
              <span className="font-medium">{stats.accountsDeleted} / {stats.totalAccountsDisputed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${deletionRate}%` }}
              />
            </div>
          </div>
          
          {stats.accountsVerified > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>{stats.accountsVerified} accounts were verified.</strong> Send Round 2 escalation letters demanding Method of Verification (MOV) under FCRA § 1681i(a)(7). Success rate for Round 2: 40-60%.
              </p>
            </div>
          )}
          
          {stats.accountsPending > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{stats.accountsPending} accounts are under investigation.</strong> Bureaus have 30 days to respond. Check your mail daily for results.
              </p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Real Results Comparison */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-lg mb-3">How You Compare</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Your deletion rate:</span>
            <Badge variant={deletionRate >= 70 ? "default" : "secondary"} className="text-lg">
              {deletionRate}%
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">National average:</span>
            <Badge variant="secondary" className="text-lg">60-65%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">DisputeStrike AI average:</span>
            <Badge variant="default" className="text-lg">70-85%</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
