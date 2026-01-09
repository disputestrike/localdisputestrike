import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Calculator, Info, CheckCircle2, XCircle, Zap } from "lucide-react";

interface Account {
  id: number;
  accountName: string;
  accountType: string;
  balance: string | number | null;
  paymentStatus: string | null;
  dateOpened: string | null;
  hasConflicts: boolean;
}

interface CreditScoreSimulatorProps {
  accounts: Account[];
  currentScore?: number;
}

// Credit score impact estimates based on account type and status
const getAccountImpact = (account: Account): number => {
  const balance = parseFloat(String(account.balance || '0'));
  const accountType = account.accountType?.toLowerCase() || '';
  const status = account.paymentStatus?.toLowerCase() || '';
  
  let impact = 0;
  
  // Collections have highest negative impact
  if (accountType.includes('collection') || status.includes('collection')) {
    impact = balance > 1000 ? 50 : balance > 500 ? 35 : 25;
  }
  // Charge-offs
  else if (status.includes('charge') || status.includes('charged off')) {
    impact = balance > 5000 ? 60 : balance > 1000 ? 45 : 30;
  }
  // Late payments
  else if (status.includes('late') || status.includes('delinquent') || status.includes('past due')) {
    if (status.includes('120') || status.includes('150') || status.includes('180')) {
      impact = 40;
    } else if (status.includes('90')) {
      impact = 30;
    } else if (status.includes('60')) {
      impact = 20;
    } else if (status.includes('30')) {
      impact = 15;
    } else {
      impact = 20;
    }
  }
  // Repossession
  else if (accountType.includes('repo') || status.includes('repo')) {
    impact = 65;
  }
  // Foreclosure
  else if (accountType.includes('foreclosure') || status.includes('foreclosure')) {
    impact = 100;
  }
  // Bankruptcy
  else if (accountType.includes('bankruptcy') || status.includes('bankruptcy')) {
    impact = 130;
  }
  // Judgment/Public record
  else if (accountType.includes('judgment') || accountType.includes('public')) {
    impact = 50;
  }
  // Default negative account
  else if (status.includes('negative') || status.includes('adverse')) {
    impact = 25;
  }
  // Unknown negative
  else {
    impact = 15;
  }
  
  // Conflicts add extra potential for deletion
  if (account.hasConflicts) {
    impact = Math.round(impact * 1.1); // 10% higher impact for conflict accounts
  }
  
  return impact;
};

export function CreditScoreSimulator({ accounts, currentScore = 580 }: CreditScoreSimulatorProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  const accountsWithImpact = useMemo(() => {
    return accounts.map(account => ({
      ...account,
      estimatedImpact: getAccountImpact(account),
    }));
  }, [accounts]);
  
  const totalPotentialGain = useMemo(() => {
    return accountsWithImpact.reduce((sum, acc) => sum + acc.estimatedImpact, 0);
  }, [accountsWithImpact]);
  
  const selectedGain = useMemo(() => {
    return accountsWithImpact
      .filter(acc => selectedAccounts.includes(acc.id))
      .reduce((sum, acc) => sum + acc.estimatedImpact, 0);
  }, [accountsWithImpact, selectedAccounts]);
  
  const projectedScore = Math.min(850, currentScore + selectedGain);
  const maxProjectedScore = Math.min(850, currentScore + totalPotentialGain);
  
  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 740) return { label: 'Very Good', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 670) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 580) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };
  
  const currentCategory = getScoreCategory(currentScore);
  const projectedCategory = getScoreCategory(projectedScore);
  const maxCategory = getScoreCategory(maxProjectedScore);
  
  const toggleAccount = (id: number) => {
    setSelectedAccounts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };
  
  const selectAll = () => {
    setSelectedAccounts(accounts.map(a => a.id));
  };
  
  const deselectAll = () => {
    setSelectedAccounts([]);
  };

  return (
    <Card className="bg-white border-orange-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-orange-500" />
          Credit Score Simulator
        </CardTitle>
        <CardDescription className="text-gray-500">
          See the estimated impact of removing negative items from your credit report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Comparison */}
        <div className="grid grid-cols-3 gap-4">
          {/* Current Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Current Score</p>
            <p className={`text-3xl font-bold ${currentCategory.color}`}>{currentScore}</p>
            <Badge className={`${currentCategory.bg} ${currentCategory.color} border-0 mt-2`}>
              {currentCategory.label}
            </Badge>
          </div>
          
          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <p className="text-green-600 font-bold text-lg">+{selectedGain}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
          
          {/* Projected Score */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
            <p className="text-xs text-gray-500 mb-1">Projected Score</p>
            <p className={`text-3xl font-bold ${projectedCategory.color}`}>{projectedScore}</p>
            <Badge className={`${projectedCategory.bg} ${projectedCategory.color} border-0 mt-2`}>
              {projectedCategory.label}
            </Badge>
          </div>
        </div>
        
        {/* Max Potential Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-orange-700 font-medium">Maximum Potential</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{maxProjectedScore}</p>
              <p className="text-xs text-gray-500">if all items removed</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Removing all {accounts.length} negative items could increase your score by up to <strong className="text-green-600">+{totalPotentialGain} points</strong>
          </p>
        </div>
        
        {/* Account Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Select accounts to simulate removal:</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="text-xs border-gray-300 text-gray-600">
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs border-gray-300 text-gray-600">
                Clear
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {accountsWithImpact.map(account => (
              <div
                key={account.id}
                onClick={() => toggleAccount(account.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  selectedAccounts.includes(account.id)
                    ? 'bg-green-50 border border-green-300'
                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedAccounts.includes(account.id)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-400'
                  }`}>
                    {selectedAccounts.includes(account.id) && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                    <p className="text-xs text-gray-500">
                      {account.accountType} • {account.paymentStatus || 'Unknown status'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{account.estimatedImpact}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            <strong>Disclaimer:</strong> These are estimates based on industry averages. Actual score changes 
            depend on many factors including your full credit history, credit mix, and scoring model used. 
            Results are not guaranteed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreditScoreSimulator;
