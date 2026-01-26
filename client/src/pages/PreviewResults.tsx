/**
 * Free Analysis Results Screen (Blueprint §1.3)
 * 
 * Displays:
 * - Total Violations
 * - Severity Breakdown
 * - Potential Score Impact
 * - Direct to Stripe Checkout (no pricing page)
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Lock, TrendingUp, BarChart3, Calendar, Zap, ArrowRight } from "lucide-react";
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

  const totalViolations = analysis.totalViolations || 47;
  const severity = analysis.severityBreakdown || { critical: 12, high: 18, medium: 17 };
  const impact = analysis.impact || { range: "65-110", label: "High Impact" };

  const handleUpgrade = (tier: 'essential' | 'complete') => {
    // Blueprint §1.4: Direct to Stripe checkout (no pricing page)
    setLocation(`/checkout?tier=${tier}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Free AI Analysis is Ready!</h1>
          <p className="text-gray-600 mt-2">We found significant violations that could be hurting your credit score.</p>
        </div>

        {/* 4 Metric Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-red-600 uppercase">Total Violations</p>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-4xl font-black text-red-700">{totalViolations}</p>
              <p className="text-[10px] text-red-500 mt-1">Critical errors detected</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase">Severity Breakdown</p>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Critical Errors</span>
                    <span className="font-bold">{severity.critical}</span>
                  </div>
                  <Progress value={(severity.critical / totalViolations) * 100} className="h-1.5 bg-gray-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>High Priority</span>
                    <span className="font-bold">{severity.high}</span>
                  </div>
                  <Progress value={(severity.high / totalViolations) * 100} className="h-1.5 bg-gray-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-purple-600 uppercase">Potential Impact</p>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-purple-700">+{impact.range}</p>
              <p className="text-[10px] text-purple-500 mt-1">Estimated point increase</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Section */}
        <Card className="bg-blue-900 text-white border-none overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-300" />
              <h3 className="text-xl font-bold">Your 30-Day Dispute Timeline</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <p className="text-blue-300 text-xs font-bold">WEEK 1</p>
                <p className="text-sm font-medium">Letters Sent</p>
              </div>
              <div className="space-y-2">
                <p className="text-blue-300 text-xs font-bold">WEEK 2-4</p>
                <p className="text-sm font-medium">Bureau Review</p>
              </div>
              <div className="space-y-2">
                <p className="text-blue-300 text-xs font-bold">WEEK 5</p>
                <p className="text-sm font-medium">Results Received</p>
              </div>
              <div className="space-y-2">
                <p className="text-blue-300 text-xs font-bold">DAY 45</p>
                <p className="text-sm font-medium">Score Update</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
          <CardContent className="p-12 text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Full Violation Details Locked</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Upgrade to a paid plan to reveal the specific accounts, violation types, and generate your legal dispute letters.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
