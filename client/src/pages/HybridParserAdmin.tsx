/**
 * Hybrid Parser Admin Dashboard
 * 
 * Monitors parser accuracy, cost savings, and comparison logs
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle2 } from "lucide-react";

export function HybridParserAdmin() {
  // Fetch metrics (these endpoints will be created in routers.ts)
  const { data: metrics, isLoading: metricsLoading } = trpc.admin.getParserMetrics.useQuery();
  const { data: comparisons, isLoading: comparisonsLoading } = trpc.admin.getRecentComparisons.useQuery({ limit: 50 });

  if (metricsLoading) {
    return <div className="p-8">Loading metrics...</div>;
  }

  const currentAccuracy = metrics?.averageAccuracy || 0;
  const costSavings = metrics?.monthlyCostSavings || 0;
  const customParserUsage = metrics?.customParserUsagePercentage || 0;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hybrid Parser Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor custom parser accuracy, cost savings, and SmartCredit validation
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parser Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              {currentAccuracy >= 85 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Excellent
                </span>
              ) : currentAccuracy >= 75 ? (
                <span className="text-yellow-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Good
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Needs Improvement
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Parser Usage</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customParserUsage}%</div>
            <p className="text-xs text-muted-foreground">
              {100 - customParserUsage}% SmartCredit fallback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              vs 100% SmartCredit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Data</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalComparisons || 0}</div>
            <p className="text-xs text-muted-foreground">
              Comparisons logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparisons">Recent Comparisons</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Trend</CardTitle>
              <CardDescription>Custom parser accuracy over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Perfect Matches (100%)</span>
                  <span className="text-sm font-medium">{metrics?.perfectMatches || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Good Matches (90-99%)</span>
                  <span className="text-sm font-medium">{metrics?.goodMatches || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Poor Matches (&lt;90%)</span>
                  <span className="text-sm font-medium">{metrics?.poorMatches || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source Distribution</CardTitle>
              <CardDescription>Where credit data is coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom Parser (Validated)</span>
                  <Badge variant="default">{metrics?.customParserUsed || 0} uses</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SmartCredit (Fallback)</span>
                  <Badge variant="secondary">{metrics?.smartcreditUsed || 0} uses</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Parser Comparisons</CardTitle>
              <CardDescription>Last 50 comparisons between custom parser and SmartCredit</CardDescription>
            </CardHeader>
            <CardContent>
              {comparisonsLoading ? (
                <div>Loading comparisons...</div>
              ) : comparisons && comparisons.length > 0 ? (
                <div className="space-y-4">
                  {comparisons.map((comp: any) => (
                    <div key={comp.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{comp.bureau.toUpperCase()}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(comp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant={comp.matchPercentage >= 90 ? "default" : comp.matchPercentage >= 75 ? "secondary" : "destructive"}>
                          {comp.matchPercentage}% match
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Confidence: {comp.customParserConfidence}%</div>
                        <div>Discrepancies: {comp.majorDiscrepancies}</div>
                        <div>Selected: {comp.selectedSource}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No comparisons yet. Upload credit reports to start collecting training data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Data Insights</CardTitle>
              <CardDescription>Patterns and improvements from comparison logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Your custom parser has been validated against SmartCredit {metrics?.totalComparisons || 0} times.
                    {currentAccuracy >= 85 ? (
                      <span className="block mt-2 text-green-600">
                        ✓ Parser is performing excellently! Consider increasing rollout percentage.
                      </span>
                    ) : currentAccuracy >= 75 ? (
                      <span className="block mt-2 text-yellow-600">
                        ⚠ Parser is good but needs more training data to reach 85%+ accuracy.
                      </span>
                    ) : (
                      <span className="block mt-2 text-red-600">
                        ✗ Parser needs significant improvement. Keep using SmartCredit as primary source.
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommended Actions</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {currentAccuracy < 75 && (
                      <li>• Collect at least 100 more comparison samples before increasing rollout</li>
                    )}
                    {currentAccuracy >= 75 && currentAccuracy < 85 && (
                      <li>• Analyze discrepancies to identify common failure patterns</li>
                    )}
                    {currentAccuracy >= 85 && (
                      <li>• Consider increasing custom parser rollout to 50-75%</li>
                    )}
                    <li>• Export training data for ML model retraining</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>SmartCredit API usage and cost savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">SmartCredit API Calls (This Month)</div>
                    <div className="text-sm text-muted-foreground">{metrics?.smartcreditApiCalls || 0} calls</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${((metrics?.smartcreditApiCalls || 0) * 0.05).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">@ $0.05/call</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-300">Cost Savings (This Month)</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      By using custom parser {customParserUsage}% of the time
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-700 dark:text-green-300">${costSavings.toFixed(2)}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">saved</div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Projected Annual Savings</h4>
                  <div className="text-2xl font-bold text-green-600">${(costSavings * 12).toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on current usage patterns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
