import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
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
} from "lucide-react";

export default function DashboardHome() {
  // Fetch real dashboard stats from database
  const { data: stats } = trpc.dashboardStats.get.useQuery();
  const { data: activityData } = trpc.activityLog.list.useQuery({ limit: 5 });
  const { data: creditReports } = trpc.creditReports.list.useQuery();
  
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

  const creditScores = {
    transunion: { score: getCreditScoreFromReport('transunion') || 612, change: +15 },
    equifax: { score: getCreditScoreFromReport('equifax') || 598, change: -3 },
    experian: { score: getCreditScoreFromReport('experian') || 621, change: +22 },
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-400";
    if (score >= 700) return "text-emerald-400";
    if (score >= 650) return "text-yellow-400";
    if (score >= 600) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
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

  // Use real activity data or fallback to mock
  const recentActivity = activityData?.length ? activityData.map(a => ({
    type: a.activityType,
    message: a.description,
    time: formatTimeAgo(a.createdAt),
    icon: getActivityIcon(a.activityType),
  })) : [
    { type: "letter_generated", message: "TransUnion dispute letter generated", time: "2 hours ago", icon: FileText },
    { type: "report_uploaded", message: "Equifax credit report uploaded", time: "1 day ago", icon: Upload },
    { type: "letter_mailed", message: "Experian dispute letter marked as mailed", time: "3 days ago", icon: Send },
    { type: "account_deleted", message: "Collection account removed from TransUnion", time: "1 week ago", icon: CheckCircle2 },
  ];

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
          <Card key={bureau} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400 capitalize">{bureau}</span>
                <Badge
                  variant="outline"
                  className={data.change >= 0 ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}
                >
                  {data.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {data.change >= 0 ? "+" : ""}{data.change}
                </Badge>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(data.score)}`}>{data.score}</span>
                <span className="text-sm text-slate-500 mb-1">{getScoreLabel(data.score)}</span>
              </div>
              <Progress
                value={(data.score / 850) * 100}
                className="mt-4 h-2 bg-slate-800"
              />
              <p className="text-xs text-slate-500 mt-2">Last updated: Today</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalAccounts}</p>
                <p className="text-xs text-slate-400">Negative Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pendingDisputes}</p>
                <p className="text-xs text-slate-400">Pending Disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{deletedAccounts}</p>
                <p className="text-xs text-slate-400">Deletions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Target className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{successRate}%</p>
                <p className="text-xs text-slate-400">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full justify-between border-slate-700 hover:bg-slate-800 text-white"
                >
                  <span className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your latest dispute actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <activity.icon className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            Your Credit Repair Journey
          </CardTitle>
          <CardDescription className="text-slate-400">
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
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.done
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="h-4 w-4" /> : item.step}
                  </div>
                  <span className={`font-medium ${item.done ? "text-cyan-400" : "text-white"}`}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 ml-11">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Banner */}
      <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <CreditCard className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ready to boost your credit?</h3>
                <p className="text-sm text-slate-300">
                  Generate your first dispute letter in under 4 minutes
                </p>
              </div>
            </div>
            <Link href="/dashboard/disputes">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
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
