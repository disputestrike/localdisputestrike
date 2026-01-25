import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightAnalysisResult } from "@/server/creditReportParser";
import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, Lock, TrendingUp, ArrowRight, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PreviewResultsProps {
  analysis: LightAnalysisResult & { fileUrl: string };
  onUpgrade: () => void;
}

const SmartCreditAffiliateLink = "https://www.smartcredit.com/?PID=87529";

const PreviewResults: React.FC<PreviewResultsProps> = ({ analysis, onUpgrade }) => {
  const { totalViolations, severityBreakdown, categoryBreakdown } = analysis;

  // Simple check to prevent division by zero
  const totalSeverity = severityBreakdown.critical + severityBreakdown.high + severityBreakdown.medium + severityBreakdown.low;
  const isZero = totalSeverity === 0;
  
  const criticalPercent = isZero ? 0 : Math.round((severityBreakdown.critical / totalSeverity) * 100);
  const highPercent = isZero ? 0 : Math.round((severityBreakdown.high / totalSeverity) * 100);
  const mediumPercent = isZero ? 0 : Math.round((severityBreakdown.medium / totalSeverity) * 100);
  const lowPercent = isZero ? 0 : Math.round((severityBreakdown.low / totalSeverity) * 100);

  return (
    <div className="p-4 space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Free Credit Report Preview is Ready!</h1>
        <p className="text-center text-lg text-muted-foreground mt-2">
          Our AI has performed a **Light Analysis** to identify potential violations. Choose an option below to unlock the full report details and start disputing!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Violations Card */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Total Potential Violations Found
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-700">{totalViolations}</div>
            <p className="text-xs text-red-500 mt-1">
              {totalViolations > 20 ? "High potential for score increase!" : "Good starting point for dispute."}
            </p>
          </CardContent>
        </Card>

        {/* Severity Breakdown Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severity Breakdown</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Critical ({severityBreakdown.critical})</span>
              <span className="font-semibold text-red-600">{criticalPercent}%</span>
            </div>
            <Progress value={criticalPercent} className="h-2 bg-red-200" indicatorClassName="bg-red-600" />
            
            <div className="flex justify-between text-sm">
              <span>High ({severityBreakdown.high})</span>
              <span className="font-semibold text-orange-500">{highPercent}%</span>
            </div>
            <Progress value={highPercent} className="h-2 bg-orange-200" indicatorClassName="bg-orange-500" />
            
            <div className="flex justify-between text-sm">
              <span>Medium ({severityBreakdown.medium})</span>
              <span className="font-semibold text-yellow-500">{mediumPercent}%</span>
            </div>
            <Progress value={mediumPercent} className="h-2 bg-yellow-200" indicatorClassName="bg-yellow-500" />
          </CardContent>
        </Card>

        {/* Category Breakdown Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violation Categories</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')} ({count})
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Gated Content Section - Primary Call to Action */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-blue-700">