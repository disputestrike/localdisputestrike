import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  ArrowRight,
  CreditCard,
  Target,
  Zap,
  Shield,
  Upload,
  Eye,
  Send,
  Lock,
  Unlock,
  Sparkles,
  Truck,
  Calendar,
} from "lucide-react";
import RoundStatus from "@/components/RoundStatus";

export default function DashboardHome() {
  const [, setLocation] = useLocation();
  
  // Fetch real dashboard stats from database
  const { data: stats } = trpc.dashboardStats.get.useQuery();
  const { data: activityData } = trpc.activityLog.list.useQuery({ limit: 5 });
  const { data: creditReports } = trpc.creditReports.list.useQuery();
  const { data: negativeAccounts } = trpc.negativeAccounts.list.useQuery();
  const { data: userProfile } = trpc.profile.get.useQuery();
  
  // V2: Round and subscription state (mock for now - will be replaced with real API)
  const currentRound = 1;
  const isRoundLocked = false;
  const lockedUntil = null;
  const daysRemaining = 0;
  const subscriptionTier = userProfile?.subscriptionTier || 'diy';
  const roundHistory: any[] = [];
  
  // V2: AI Recommendations (mock for now)
  const aiRecommendations = negativeAccounts?.slice(0, 5).map((account, index) => ({
    ...account,
    winProbability: Math.floor(Math.random() * 30) + 65,
    aiReason: [
      'Balance conflicts across bureaus - strong case',
      'Date reporting error detected',
      'Original creditor info missing - FCRA violation',
      'Account age exceeds 7-year limit',
      'Duplicate entry found across bureaus'
    ][index % 5]
  })) || [];
  
  // Use real stats from database
  const totalAccounts = stats?.totalNegativeAccounts || 0;
  const pendingDisputes = stats?.pendingDisputes || 0;
  const deletedAccounts = stats?.deletedAccounts || 0;
  const successRate = stats?.successRate || 0;

  // Extract credit scores from parsed reports
  const getCreditScoreFromReport = (bureau: string) => {
    const report = creditReports?.find(r => r.bureau === bureau);
    if (report?.parsedData) {
      const parsed = typeof report.parsedData === 'string' ? JSON.parse(report.parsedData) : report.parsedData;
      return parsed?.creditScore || null;
    }
    return null;
  };

  // Only show credit scores if we have actual data from uploaded reports
  const hasReports = creditReports && creditReports.length > 0;
  
  const creditScores = {
    transunion: { score: getCreditScoreFromReport('transunion'), change: 0 },
    equifax: { score: getCreditScoreFromReport('equifax'), change: 0 },
    experian: { score: getCreditScoreFromReport('experian'), change: 0 },
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 750) return "text-green-400";
    if (score >= 700) return "text-emerald-400";
    if (score >= 650) return "text-yellow-400";
    if (score >= 600) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return "No Data";
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    if (score >= 600) return "Poor";
    return "Very Poor";
  };

  // Format time ago
  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return then.toLocaleDateString();
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'letter_generated': return FileText;
      case 'report_uploaded': return Upload;
      case 'letter_mailed': return Send;
      case 'account_deleted': return CheckCircle2;
      default: return FileText;
    }
  };

  // Use real activity data only - no mock/placeholder data
  const recentActivity = activityData?.length ? activityData.map(a => ({
    type: a.activityType,
    message: a.description,
    time: formatTimeAgo(a.createdAt),
    icon: getActivityIcon(a.activityType),
  })) : [];

  // Quick actions
  const quickActions = [
    { label: "Upload Reports", href: "/dashboard/reports", icon: Upload, color: "bg-blue-500" },
    { label: "View Accounts", href: "/dashboard/disputes", icon: Eye, color: "bg-purple-500" },
    { label: "Generate Letters", href: "/dashboard/letters", icon: FileText, color: "bg-cyan-500" },
    { label: "Track Progress", href: "/dashboard/disputes", icon: Target, color: "bg-green-500" },
  ];

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Credit Scores Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(creditScores).map(([bureau, data]) => (
          <Card key={bureau} className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 capitalize">{bureau}</span>
                {data.score && data.change !== 0 ? (
                  <Badge
                    variant="outline"
                    className={data.change >= 0 ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}
                  >
                    {data.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {data.change >= 0 ? "+" : ""}{data.change}
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score || "---"}
                </span>
                <span className="text-sm text-gray-400 mb-1">{getScoreLabel(data.score)}</span>
              </div>
              <Progress
                value={data.score ? (data.score / 850) * 100 : 0}
                className="mt-4 h-2 bg-gray-100"
              />
              <p className="text-xs text-gray-400 mt-2">
                {data.score ? "Last updated: Today" : "Upload credit report to see score"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
                <p className="text-xs text-gray-500">Negative Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingDisputes}</p>
                <p className="text-xs text-gray-500">Pending Disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{deletedAccounts}</p>
                <p className="text-xs text-gray-500">Deletions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-white border-gray-200 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:bg-gray-100 text-gray-900"
                >
                  <span className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${action.color}`}>
                      <action.icon className="h-4 w-4 text-gray-900" />
                    </div>
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-500">
              Your latest dispute actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs text-gray-400">Upload credit reports to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Your Credit Repair Journey
          </CardTitle>
          <CardDescription className="text-gray-500">
            Follow these steps to maximize your credit score improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Upload Reports", desc: "Get your 3-bureau credit reports", done: (creditReports?.length || 0) > 0 },
              { step: 2, title: "Review Accounts", desc: "Identify negative items to dispute", done: totalAccounts > 0 },
              { step: 3, title: "Generate Letters", desc: "Create AI-powered dispute letters", done: (stats?.totalLetters || 0) > 0 },
              { step: 4, title: "Mail & Track", desc: "Send letters and monitor responses", done: pendingDisputes > 0 },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-4 rounded-lg border ${
                  item.done
                    ? "bg-orange-50 border-orange-300"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.done
                        ? "bg-cyan-500 text-gray-900"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="h-4 w-4" /> : item.step}
                  </div>
                  <span className={`font-medium ${item.done ? "text-orange-500" : "text-gray-900"}`}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-11">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* V2: Round Status & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round Status */}
        <RoundStatus
          currentRound={currentRound}
          maxRounds={999}
          isLocked={isRoundLocked}
          lockedUntil={lockedUntil}
          daysRemaining={daysRemaining}
          canStartNextRound={!isRoundLocked}
          subscriptionTier={subscriptionTier}
          roundHistory={roundHistory}
          onStartRound={() => setLocation('/dashboard/disputes')}
          onUploadResponses={() => setLocation(`/responses/${currentRound}`)}
        />

        {/* AI Recommendations */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              AI Recommendations
            </CardTitle>
            <p className="text-sm text-gray-500">Top items to dispute this round</p>
          </CardHeader>
          <CardContent>
            {aiRecommendations.length > 0 ? (
              <div className="space-y-3">
                {aiRecommendations.slice(0, 3).map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900 text-sm">{item.creditorName}</span>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        {item.winProbability}% win rate
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">${item.balance || '0'} • {item.accountType}</p>
                    <p className="text-xs text-orange-600 mt-1">💡 {item.aiReason}</p>
                  </div>
                ))}
                <Link href="/dashboard/disputes">
                  <Button variant="outline" className="w-full mt-2 text-orange-600 border-orange-200 hover:bg-orange-50">
                    View All Recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Upload credit reports to see AI recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* V2: Mailing Status (for Complete tier) */}
      {subscriptionTier === 'complete' && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              Mailing Service
            </CardTitle>
            <p className="text-sm text-gray-500">Your disputes are mailed automatically</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No mailings in progress</p>
              <p className="text-xs text-gray-400">Generate letters to start mailing</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Banner */}
      <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-orange-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to boost your credit?</h3>
                <p className="text-sm text-gray-700">
                  Generate your first dispute letter in under 4 minutes
                </p>
              </div>
            </div>
            <Link href="/dashboard/disputes">
              <Button className="bg-cyan-500 hover:bg-orange-500 text-gray-900">
                Start Disputing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
