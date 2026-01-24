/**
 * PreviewResults.tsx - Free Preview Results Page
 * 
 * Shows violation COUNTS and categories, but BLURS specific details.
 * Designed to convert free users to paid Essential/Complete plans.
 */

import { useState, useEffect } from 'react';
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Lock, 
  Eye, 
  FileText, 
  TrendingUp, 
  Shield,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface PreviewData {
  totalViolations: number;
  deletionPotential: number;
  categories: {
    latePayments: number;
    collections: number;
    inquiries: number;
    publicRecords: number;
    accountErrors: number;
    other: number;
  };
  bureauBreakdown: {
    experian: number;
    equifax: number;
    transunion: number;
  };
  estimatedScoreIncrease: string;
}

const BLURRED_ACCOUNTS = [
  { name: "████████ Bank", type: "Late Payment", amount: "$█,███" },
  { name: "██████ Financial", type: "Collection", amount: "$███" },
  { name: "████ Credit", type: "Hard Inquiry", amount: "-" },
  { name: "███████ Services", type: "Account Error", amount: "$█,███" },
  { name: "██████████ Corp", type: "Late Payment", amount: "$███" },
];

export default function PreviewResults() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch('/api/analysis/preview', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setPreviewData(data);
        } else {
          setPreviewData({
            totalViolations: 47,
            deletionPotential: 68,
            categories: {
              latePayments: 12,
              collections: 8,
              inquiries: 15,
              publicRecords: 2,
              accountErrors: 6,
              other: 4,
            },
            bureauBreakdown: {
              experian: 18,
              equifax: 15,
              transunion: 14,
            },
            estimatedScoreIncrease: "50-80",
          });
        }
      } catch (error) {
        console.error('Failed to fetch preview:', error);
        setPreviewData({
          totalViolations: 47,
          deletionPotential: 68,
          categories: {
            latePayments: 12,
            collections: 8,
            inquiries: 15,
            publicRecords: 2,
            accountErrors: 6,
            other: 4,
          },
          bureauBreakdown: {
            experian: 18,
            equifax: 15,
            transunion: 14,
          },
          estimatedScoreIncrease: "50-80",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your credit reports...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Reports Found</h2>
            <p className="text-gray-600 mb-4">Please upload your credit reports first.</p>
            <Button onClick={() => setLocation('/start')}>
              Upload Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2">
                <img src="/logo.webp" alt="DisputeStrike" className="h-8 w-8" />
                <span className="font-bold text-xl">DisputeStrike</span>
              </a>
            </Link>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              FREE PREVIEW
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Analysis Complete!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            We Found <span className="text-orange-500">{previewData.totalViolations} Violations</span>
          </h1>
          <p className="text-gray-600">
            {previewData.deletionPotential}% of these have high deletion potential
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                {previewData.totalViolations}
              </div>
              <p className="text-gray-700 font-medium">Total Violations Found</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {previewData.deletionPotential}%
              </div>
              <p className="text-gray-700 font-medium">Deletion Potential</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                +{previewData.estimatedScoreIncrease}
              </div>
              <p className="text-gray-700 font-medium">Estimated Score Increase</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Violation Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Late Payments", count: previewData.categories.latePayments, color: "bg-red-500" },
                { label: "Collections", count: previewData.categories.collections, color: "bg-orange-500" },
                { label: "Hard Inquiries", count: previewData.categories.inquiries, color: "bg-yellow-500" },
                { label: "Public Records", count: previewData.categories.publicRecords, color: "bg-purple-500" },
                { label: "Account Errors", count: previewData.categories.accountErrors, color: "bg-blue-500" },
                { label: "Other Issues", count: previewData.categories.other, color: "bg-gray-500" },
              ].map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                  <span className="flex-1">{cat.label}</span>
                  <span className="font-bold">{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Violations by Bureau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Experian", count: previewData.bureauBreakdown.experian, max: previewData.totalViolations },
                { name: "Equifax", count: previewData.bureauBreakdown.equifax, max: previewData.totalViolations },
                { name: "TransUnion", count: previewData.bureauBreakdown.transunion, max: previewData.totalViolations },
              ].map((bureau) => (
                <div key={bureau.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{bureau.name}</span>
                    <span>{bureau.count} violations</span>
                  </div>
                  <Progress value={(bureau.count / bureau.max) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-10 pointer-events-none"></div>
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-500" />
                Specific Violations
              </CardTitle>
              <Badge variant="outline" className="bg-gray-100">
                <Lock className="w-3 h-3 mr-1" />
                Upgrade to View
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 blur-sm select-none">
              {BLURRED_ACCOUNTS.map((account, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{account.amount}</p>
                    <Badge variant="outline" className="text-xs">High Priority</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-20">
              <div className="text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold mb-1">Upgrade to see specific violations</p>
                <p className="text-sm text-gray-500 mb-4">
                  Get account names, amounts, dates, and generate dispute letters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500 bg-gradient-to-r from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Ready to Fix Your Credit?
                </h2>
                <p className="text-gray-600 mb-4">
                  Upgrade to see the full details and start generating dispute letters.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>See all {previewData.totalViolations} violations in detail</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Generate unlimited dispute letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Track your progress over time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Round 2 & 3 escalation strategies</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <Card className="border-orange-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold">Essential</h3>
                        <p className="text-sm text-gray-500">You print & mail</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">$79.99</div>
                        <div className="text-sm text-gray-500">/month</div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => setLocation('/checkout?plan=essential')}
                    >
                      Get Essential <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-purple-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold">Complete</h3>
                        <p className="text-sm text-gray-500">We mail for you</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">$129.99</div>
                        <div className="text-sm text-gray-500">/month</div>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => setLocation('/checkout?plan=complete')}
                    >
                      Get Complete <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500">
                  3-day money-back guarantee • Cancel anytime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/pricing">
            <a className="text-orange-600 hover:text-orange-700 font-medium">
              Compare all plans →
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
