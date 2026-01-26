import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Lock, TrendingUp, BarChart3, Calendar, Zap, ArrowRight, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface PreviewResultsProps {
  analysis?: any;
}

export default function PreviewResults({ analysis: propAnalysis }: PreviewResultsProps) {
  const [, setLocation] = useLocation();
  
  // Get analysis from props or session storage
  const sessionAnalysis = JSON.parse(sessionStorage.getItem('previewAnalysis') || '{}');
  const analysis = propAnalysis || sessionAnalysis;

  const totalViolations = analysis.totalViolations || 0;
  const severity = analysis.severityBreakdown || { critical: 0, high: 0, medium: 0 };
  const impact = analysis.impact || { range: "0-0", label: "Analysis Pending" };

  const handleUpgrade = (tier: 'essential' | 'complete') => {
    // Blueprint §1.4: Direct to Stripe checkout (no pricing page)
    setLocation(`/checkout?tier=${tier}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Free Credit Report Preview is Ready!</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Our AI has performed a <strong>Light Analysis</strong> to identify potential violations. Choose an option below to unlock the full report details and start disputing!
        </p>
      </div>

      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Box 1: Total Violations */}
        <Card className="bg-red-50 border-2 border-red-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Potential Violations Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-700">{totalViolations}</div>
            <p className="text-xs text-red-500 mt-1">
              {totalViolations > 20 ? "High potential for score increase!" : "Good starting point for dispute."}
            </p>
          </CardContent>
        </Card>

        {/* Box 2: Severity Breakdown */}
        <Card className="bg-white border-2 border-gray-300">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severity Breakdown</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Critical</span>
              <span className="font-semibold text-red-600">{severity.critical}</span>
            </div>
            <Progress value={totalViolations > 0 ? (severity.critical / totalViolations) * 100 : 0} className="h-2" />
            <div className="flex justify-between text-sm">
              <span>High</span>
              <span className="font-semibold text-orange-500">{severity.high}</span>
            </div>
            <Progress value={totalViolations > 0 ? (severity.high / totalViolations) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>

        {/* Box 3: Violation Categories */}
        <Card className="bg-white border-2 border-gray-300">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violation Categories</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">Collections</Badge>
            <Badge variant="secondary">Late Payments</Badge>
            <Badge variant="secondary">Charge-offs</Badge>
          </CardContent>
        </Card>

        {/* Box 4: Potential Impact */}
        <Card className="bg-purple-50 border-2 border-purple-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Potential Score Impact</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
              <div className="text-xl font-bold text-purple-700">+{impact.range}</div>
              <div className="text-xs text-purple-600">points estimated</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Your Dispute Timeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-6">
          <div>
            <p className="font-bold text-blue-700 text-sm">Week 1</p>
            <p className="text-xs text-gray-700">Letters Sent</p>
          </div>
          <div>
            <p className="font-bold text-blue-700 text-sm">Week 2-4</p>
            <p className="text-xs text-gray-700">Investigation</p>
          </div>
          <div>
            <p className="font-bold text-blue-700 text-sm">Week 5</p>
            <p className="text-xs text-gray-700">Results</p>
          </div>
          <div>
            <p className="font-bold text-blue-700 text-sm">Day 45</p>
            <p className="text-xs text-gray-700">Score Update</p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="border-2 border-gray-200 hover:border-blue-500 transition-all">
          <CardHeader>
            <CardTitle>Essential Plan</CardTitle>
            <p className="text-2xl font-bold">$79.99<span className="text-sm font-normal text-gray-500">/mo</span></p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited Dispute Rounds</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> AI Letter Generation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> You Print & Mail</li>
            </ul>
            <Button className="w-full" variant="outline" onClick={() => handleUpgrade('essential')}>
              Upgrade to Essential
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500 bg-orange-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            MOST POPULAR
          </div>
          <CardHeader>
            <CardTitle>Complete Plan</CardTitle>
            <p className="text-2xl font-bold">$129.99<span className="text-sm font-normal text-gray-500">/mo</span></p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Everything in Essential</li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> <strong>We Mail For You</strong></li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Certified Mail Tracking</li>
            </ul>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => handleUpgrade('complete')}>
              Upgrade to Complete <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Blurred Preview */}
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50 max-w-4xl mx-auto">
        <CardContent className="p-12 text-center">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">Full Violation Details Locked</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Upgrade to a paid plan to reveal the specific accounts, violation types, and generate your legal dispute letters.</p>
        </CardContent>
      </Card>

      {/* Footer CTA */}
      <div className="text-center py-12 border-t border-gray-200">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Secure checkout • Cancel anytime • 100% FCRA Compliant
        </p>
      </div>
    </div>
  );
}
