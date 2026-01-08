import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  CreditCard,
  Users,
  PiggyBank,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  DollarSign,
} from "lucide-react";

const creditBuildingStrategies = [
  {
    title: "Secured Credit Cards",
    description: "Start with a secured card to build positive payment history",
    icon: CreditCard,
    difficulty: "Easy",
    timeToImpact: "3-6 months",
    tips: [
      "Deposit $200-500 as collateral",
      "Keep utilization under 30%",
      "Pay balance in full each month",
      "Graduate to unsecured after 6-12 months",
    ],
  },
  {
    title: "Authorized User",
    description: "Get added to someone else's credit card with good history",
    icon: Users,
    difficulty: "Easy",
    timeToImpact: "1-2 months",
    tips: [
      "Ask a family member with excellent credit",
      "Ensure the card reports to all 3 bureaus",
      "Account age matters - older is better",
      "You don't need the physical card",
    ],
  },
  {
    title: "Credit Builder Loans",
    description: "Build credit while saving money at the same time",
    icon: PiggyBank,
    difficulty: "Medium",
    timeToImpact: "6-12 months",
    tips: [
      "Payments are held in savings account",
      "Reports to all 3 bureaus monthly",
      "Typical loan: $300-1000 over 12-24 months",
      "Get your savings back at the end",
    ],
  },
  {
    title: "Rent Reporting",
    description: "Report your rent payments to credit bureaus",
    icon: DollarSign,
    difficulty: "Easy",
    timeToImpact: "1-3 months",
    tips: [
      "Services like Rental Kharma, Boom",
      "Can add years of payment history",
      "Reports to Experian, TransUnion, or Equifax",
      "One-time or monthly fee required",
    ],
  },
];

export default function CreditBuilding() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            Credit Building
          </h1>
          <p className="text-slate-400 mt-1">
            Strategies to build and improve your credit score
          </p>
        </div>

        {/* Credit Utilization Calculator */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-cyan-400" />
              Credit Utilization Calculator
            </CardTitle>
            <CardDescription className="text-slate-400">
              Keep your utilization under 30% for best results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Total Credit Limit</label>
                <div className="text-2xl font-bold text-white">$10,000</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Current Balance</label>
                <div className="text-2xl font-bold text-white">$2,500</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Utilization Rate</label>
                <div className="text-2xl font-bold text-yellow-400">25%</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>0%</span>
                <span className="text-green-400">Excellent (1-9%)</span>
                <span className="text-yellow-400">Good (10-29%)</span>
                <span className="text-red-400">High (30%+)</span>
              </div>
              <Progress value={25} className="h-3 bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Credit Building Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creditBuildingStrategies.map((strategy, index) => (
            <Card key={index} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <strategy.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{strategy.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {strategy.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className={
                      strategy.difficulty === "Easy"
                        ? "border-green-500/30 text-green-400"
                        : "border-yellow-500/30 text-yellow-400"
                    }
                  >
                    {strategy.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {strategy.timeToImpact}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {strategy.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Score Improvement Tips */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Quick Score Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Pay Down Balances",
                  desc: "Reducing credit card balances can boost your score within 30 days",
                  impact: "+20-50 points",
                },
                {
                  title: "Don't Close Old Cards",
                  desc: "Keep old accounts open to maintain credit history length",
                  impact: "+10-30 points",
                },
                {
                  title: "Dispute Errors",
                  desc: "Remove inaccurate negative items from your reports",
                  impact: "+50-100 points",
                },
              ].map((tip, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{tip.title}</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {tip.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{tip.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Target className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Ready to start building credit?
                  </h3>
                  <p className="text-sm text-slate-300">
                    Check out our marketplace for credit building products
                  </p>
                </div>
              </div>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                View Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
