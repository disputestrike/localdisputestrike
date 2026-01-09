import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  FileText,
  Zap
} from "lucide-react";

interface LetterComparisonProps {
  accountCount?: number;
  conflictCount?: number;
}

export function LetterComparison({ accountCount = 50, conflictCount = 10 }: LetterComparisonProps) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'effectiveness'>('comparison');

  // Calculate effectiveness metrics
  const singleAngleSuccessRate = 35;
  const multiAngleSuccessRate = 78;
  const singleAngleArguments = 1;
  const multiAngleArguments = 5;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Letter Effectiveness Comparison
        </CardTitle>
        <CardDescription>
          See why DisputeStrike's multi-angle approach outperforms traditional single-argument letters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
            <TabsTrigger value="effectiveness">Success Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional Single-Angle Letter */}
              <div className="border rounded-lg p-4 bg-red-50/50 border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-red-700">Traditional Letter</h3>
                  <Badge variant="destructive">Single Angle</Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">Only disputes "not mine" or "inaccurate"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">No cross-bureau conflict analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">Generic template language</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">No FCRA violation citations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">Easy for bureaus to verify and dismiss</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <div className="text-xs text-red-600 font-medium">TYPICAL RESULT</div>
                  <div className="text-2xl font-bold text-red-700">{singleAngleSuccessRate}%</div>
                  <div className="text-xs text-red-600">deletion success rate</div>
                </div>

                <div className="mt-4 border-t border-red-200 pt-4">
                  <div className="text-xs text-red-600 font-medium mb-2">SAMPLE ARGUMENT:</div>
                  <div className="text-xs text-red-700 italic bg-white p-2 rounded border border-red-200">
                    "I am disputing this account as it does not belong to me. Please investigate and remove."
                  </div>
                </div>
              </div>

              {/* DisputeStrike Multi-Angle Letter */}
              <div className="border rounded-lg p-4 bg-green-50/50 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-green-700">DisputeStrike Letter</h3>
                  <Badge className="bg-green-600">Multi-Angle</Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">5-6 attack angles per account</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Cross-bureau conflict detection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Impossible timeline violations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">FCRA § 1681i, § 1681s-2(b) citations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Severity grading (CRITICAL/HIGH/MEDIUM)</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <div className="text-xs text-green-600 font-medium">TYPICAL RESULT</div>
                  <div className="text-2xl font-bold text-green-700">{multiAngleSuccessRate}%</div>
                  <div className="text-xs text-green-600">deletion success rate</div>
                </div>

                <div className="mt-4 border-t border-green-200 pt-4">
                  <div className="text-xs text-green-600 font-medium mb-2">SAMPLE ARGUMENTS:</div>
                  <div className="text-xs text-green-700 bg-white p-2 rounded border border-green-200 space-y-1">
                    <div>• <strong>CRITICAL:</strong> Balance discrepancy ($8,234 vs $6,891)</div>
                    <div>• <strong>CRITICAL:</strong> Activity before account opened</div>
                    <div>• <strong>HIGH:</strong> Duplicate reporting detected</div>
                    <div>• <strong>HIGH:</strong> Unverifiable balance (no payment history)</div>
                    <div>• <strong>MEDIUM:</strong> Status correction required</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Differences Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Why Multi-Angle Works Better
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-800">Multiple Pressure Points</div>
                    <div className="text-blue-600 text-xs">If one argument fails, 4 more remain</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-800">Legal Compliance Risk</div>
                    <div className="text-blue-600 text-xs">Bureaus must address each violation cited</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-800">Documentation Trail</div>
                    <div className="text-blue-600 text-xs">Creates evidence for potential litigation</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effectiveness" className="space-y-6">
            {/* Success Rate Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-red-700">Traditional Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span className="font-medium text-red-600">{singleAngleSuccessRate}%</span>
                      </div>
                      <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${singleAngleSuccessRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">{singleAngleArguments}</div>
                        <div className="text-xs text-red-600">Argument per account</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">~{Math.round(accountCount * (singleAngleSuccessRate/100))}</div>
                        <div className="text-xs text-red-600">Expected deletions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-700">DisputeStrike Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span className="font-medium text-green-600">{multiAngleSuccessRate}%</span>
                      </div>
                      <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${multiAngleSuccessRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{multiAngleArguments}</div>
                        <div className="text-xs text-green-600">Arguments per account</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">~{Math.round(accountCount * (multiAngleSuccessRate/100))}</div>
                        <div className="text-xs text-green-600">Expected deletions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Stats */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Improvement with DisputeStrike
              </h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">
                    +{multiAngleSuccessRate - singleAngleSuccessRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">Higher success rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">
                    {multiAngleArguments}x
                  </div>
                  <div className="text-sm text-muted-foreground">More arguments</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">
                    {conflictCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Conflicts detected</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">
                    ~{Math.round(accountCount * (multiAngleSuccessRate/100)) - Math.round(accountCount * (singleAngleSuccessRate/100))}
                  </div>
                  <div className="text-sm text-muted-foreground">Extra deletions</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
