import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditScoreSimulator } from "@/components/CreditScoreSimulator";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  TrendingUp,
  Calculator,
  AlertTriangle,
  Upload,
} from "lucide-react";

export default function ScoreSimulator() {
  // Fetch negative accounts from database
  const { data: accounts, isLoading } = trpc.negativeAccounts.list.useQuery();
  
  // Fetch credit reports to get current score
  const { data: creditReports } = trpc.creditReports.list.useQuery();
  
  // Get average credit score from reports
  const getCurrentScore = () => {
    if (!creditReports || creditReports.length === 0) return 580;
    
    let totalScore = 0;
    let scoreCount = 0;
    
    creditReports.forEach(report => {
      if (report.parsedData) {
        let parsed = report.parsedData;
        if (typeof report.parsedData === 'string') {
          try {
            parsed = JSON.parse(report.parsedData);
          } catch (e) {
            console.error("Failed to parse JSON for report in ScoreSimulator:", report.bureau, e);
            return; // Skip this report
          }
        }
        if (parsed?.creditScore) {
          totalScore += parsed.creditScore;
          scoreCount++;
        }
      }
    });
    
    return scoreCount > 0 ? Math.round(totalScore / scoreCount) : 580;
  };

  const currentScore = getCurrentScore();
  const hasAccounts = accounts && accounts.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-orange-500" />
              Score Simulator
            </h1>
            <p className="text-gray-500 mt-1">
              See how removing negative accounts could improve your credit score
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Credit Score Impact Estimator
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  This simulator estimates potential score improvements based on industry data. 
                  Actual results may vary based on your complete credit profile, credit mix, 
                  account age, and other factors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {isLoading ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading your accounts...</p>
            </CardContent>
          </Card>
        ) : hasAccounts ? (
          <CreditScoreSimulator 
            accounts={accounts.map(a => ({
              id: a.id,
              accountName: a.accountName,
              accountType: a.accountType || 'Unknown',
              balance: a.balance,
              paymentStatus: a.status,
              dateOpened: a.dateOpened,
              hasConflicts: a.hasConflicts || false,
            }))}
            currentScore={currentScore}
          />
        ) : (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700">No Accounts to Simulate</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Upload your credit reports first. The simulator will analyze your negative accounts 
                and show you potential score improvements from successful disputes.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/dashboard/reports">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Credit Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">How Score Simulation Works</CardTitle>
            <CardDescription className="text-gray-500">
              Understanding the impact of negative items on your credit score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Collections</h4>
                <p className="text-sm text-gray-600">
                  Collection accounts can drop your score by 25-100 points depending on the balance 
                  and recency. Removing them often provides significant score improvement.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Late Payments</h4>
                <p className="text-sm text-gray-600">
                  Late payments impact varies by severity: 30-day lates (15-20 pts), 60-day (20-30 pts), 
                  90+ days (30-50 pts). Recent lates hurt more than older ones.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Charge-Offs</h4>
                <p className="text-sm text-gray-600">
                  Charge-offs are among the most damaging items, potentially reducing scores by 
                  50-100+ points. Successful removal can dramatically improve your score.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
