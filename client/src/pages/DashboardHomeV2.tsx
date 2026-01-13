import { useAuth } from "@/_core/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Download, 
  ArrowRight,
  Shield,
  Zap,
  FileText,
  ExternalLink,
  Lock
} from "lucide-react";
import RoundStatus from "@/components/RoundStatus";
import { useLocation } from "wouter";
import { useState } from "react";

export default function DashboardHomeV2() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isMailing, setIsMailing] = useState(false);

  // Mock data for demo
  const dashboardData = {
    user: {
      fullName: user?.fullName || "John Doe",
      tier: "complete", // or "diy"
    },
    scores: [
      { bureau: "TransUnion", score: 642, change: 12 },
      { bureau: "Equifax", score: 638, change: 12 },
      { bureau: "Experian", score: 651, change: 12 },
    ],
    stats: {
      negativeItems: 8,
      inProgress: 3,
      deleted: 2,
      pending: 1,
    },
    roundStatus: {
      currentRound: 1,
      status: "letters_generated",
      mailedAt: null,
      lockedUntil: null,
      daysRemaining: 0,
      roundId: 1,
    },
    roundHistory: [
      { id: 1, roundNumber: 1, status: "letters_generated", itemsCount: 3, startedAt: new Date().toISOString() }
    ],
    recommendations: [
      { id: 1, accountName: "PORTFOLIO RECOVERY", balance: 2847, winProbability: 89, reason: "Balance conflicts across bureaus" },
      { id: 2, accountName: "CAPITAL ONE", balance: 1200, winProbability: 76, reason: "Date reporting error detected" },
      { id: 3, accountName: "MIDLAND CREDIT", balance: 1203, winProbability: 82, reason: "Original creditor info missing" },
    ],
    mailings: [
      { id: 1, bureau: "TransUnion", status: "processing", trackingNumber: "9400111899567890123456", sentAt: new Date().toISOString() }
    ]
  };

  const isCompleteTier = dashboardData.user.tier === "complete";

  const handleMailDisputes = async () => {
    setIsMailing(true);
    // Simulate API call
    setTimeout(() => {
      setIsMailing(false);
      alert("Letters sent to mailing queue! You'll see tracking numbers shortly.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Welcome back, {dashboardData.user.fullName}!</h1>
            <Badge className={isCompleteTier ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-blue-100 text-blue-700 border-blue-200"}>
              {isCompleteTier ? "Complete Plan" : "DIY Plan"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-500">Round {dashboardData.roundStatus.currentRound}</Badge>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Credit Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardData.scores.map((s) => (
            <Card key={s.bureau} className="border-none shadow-sm overflow-hidden">
              <div className="h-1 bg-orange-500" />
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{s.bureau}</span>
                  <Badge className="bg-green-50 text-green-700 border-green-100">+{s.change} pts</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-900">{s.score}</div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(s.score / 850) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.negativeItems}</div>
                <div className="text-xs text-gray-500">Negative Items</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.inProgress}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.deleted}</div>
                <div className="text-xs text-gray-500">Deleted</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Round Status & Letters */}
          <div className="lg:col-span-2 space-y-8">
            <RoundStatus 
              currentRound={dashboardData.roundStatus.currentRound}
              maxRounds={-1}
              isLocked={false}
              lockedUntil={null}
              daysRemaining={0}
              canStartNextRound={true}
              subscriptionTier={dashboardData.user.tier}
              roundHistory={dashboardData.roundHistory}
              onStartRound={() => {}}
              onUploadResponses={() => setLocation(`/responses/${dashboardData.roundStatus.currentRound}`)}
            />

            {/* Mailing Section */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-500" />
                    {isCompleteTier ? "Mailing Service" : "Mailing Instructions"}
                  </CardTitle>
                  {isCompleteTier && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Certified Mail Included</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isCompleteTier ? (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-4">
                      <Zap className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-orange-900">One-Click Mailing Ready</h4>
                        <p className="text-sm text-orange-700">Your Round 1 letters are ready. We'll print and mail them via USPS Certified Mail with tracking.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['TransUnion', 'Equifax', 'Experian'].map(bureau => (
                        <div key={bureau} className="border rounded-lg p-3 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{bureau}</span>
                            <FileText className="w-4 h-4 text-gray-400" />
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs h-8">Preview Letter</Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold shadow-lg shadow-orange-200"
                      onClick={handleMailDisputes}
                      disabled={isMailing}
                    >
                      {isMailing ? "Processing..." : "Send My Disputes Now"}
                    </Button>

                    {dashboardData.mailings.length > 0 && (
                      <div className="mt-6 border-t pt-6">
                        <h4 className="font-semibold mb-4">Recent Mailings</h4>
                        <div className="space-y-3">
                          {dashboardData.mailings.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{m.bureau} Dispute</div>
                                  <div className="text-xs text-gray-500">Tracking: {m.trackingNumber}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 capitalize">{m.status}</Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
                      <Download className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Download & Mail Your Letters</h4>
                        <p className="text-sm text-blue-700">On the DIY plan, you must print and mail these letters yourself via USPS Certified Mail.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {['TransUnion', 'Equifax', 'Experian'].map(bureau => (
                        <div key={bureau} className="flex justify-between items-center p-4 border rounded-xl hover:border-orange-200 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                              <FileText className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                            </div>
                            <div>
                              <div className="font-medium">{bureau} Dispute Letter</div>
                              <div className="text-xs text-gray-500">Round 1 • PDF Format</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" /> Download
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 text-center">
                      <h4 className="font-semibold mb-2">Tired of the Post Office?</h4>
                      <p className="text-sm text-gray-500 mb-4">Upgrade to Complete and we'll mail everything for you via Certified Mail.</p>
                      <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50" onClick={() => setLocation('/pricing')}>
                        Upgrade to Complete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: AI Recommendations & Advanced Features */}
          <div className="space-y-8">
            {/* AI Recommendations */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {dashboardData.recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900 text-sm">{rec.accountName}</span>
                        <Badge className="bg-green-100 text-green-700 border-green-200">{rec.winProbability}% Win</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">Balance: ${rec.balance.toLocaleString()}</div>
                      <p className="text-xs text-gray-600 italic">"{rec.reason}"</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <Button variant="ghost" className="w-full text-xs text-orange-600 hover:text-orange-700 font-semibold">
                    View All Analysis <ArrowRight className="ml-1 w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features (Complete Only) */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  Advanced Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className={isCompleteTier ? "opacity-100" : "opacity-50 grayscale pointer-events-none"}>
                  <Button variant="outline" className="w-full justify-start gap-3 py-6 border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">CFPB Complaint</div>
                      <div className="text-xs text-gray-500">Escalate to federal regulators</div>
                    </div>
                  </Button>
                </div>

                <div className={isCompleteTier ? "opacity-100" : "opacity-50 grayscale pointer-events-none"}>
                  <Button variant="outline" className="w-full justify-start gap-3 py-6 border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Furnisher Dispute</div>
                      <div className="text-xs text-gray-500">Dispute directly with creditors</div>
                    </div>
                  </Button>
                </div>

                {!isCompleteTier && (
                  <div className="text-center pt-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Complete Plan Only</p>
                    <Button variant="link" className="text-orange-600 text-xs h-auto p-0" onClick={() => setLocation('/pricing')}>Upgrade to Unlock</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
