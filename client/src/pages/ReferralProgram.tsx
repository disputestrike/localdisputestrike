import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  CheckCircle2,
  Clock,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
} from "lucide-react";

export default function ReferralProgram() {
  const [referralLink] = useState("https://disputestrike.com/ref/ABC123XYZ");
  
  // Mock referral stats
  const stats = {
    totalReferrals: 12,
    pendingReferrals: 3,
    completedReferrals: 9,
    totalEarnings: 450,
    pendingEarnings: 150,
    paidEarnings: 300,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent("I'm using DisputeStrike to repair my credit! Use my link to get started:");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, "_blank");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent("Check out DisputeStrike - Credit Repair Software");
    const body = encodeURIComponent(`Hey!\n\nI've been using DisputeStrike to dispute errors on my credit reports and it's been great. You should check it out!\n\n${referralLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Mock referral history
  const referralHistory = [
    { id: 1, name: "John D.", date: "2025-01-05", status: "completed", earned: 50 },
    { id: 2, name: "Sarah M.", date: "2025-01-03", status: "completed", earned: 50 },
    { id: 3, name: "Mike R.", date: "2025-01-01", status: "pending", earned: 0 },
    { id: 4, name: "Lisa K.", date: "2024-12-28", status: "completed", earned: 50 },
    { id: 5, name: "Tom B.", date: "2024-12-25", status: "pending", earned: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Referral Program
          </h1>
          <p className="text-slate-400 mt-1">
            Earn $50 for every friend who signs up and subscribes
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">${stats.totalEarnings}</p>
                  <p className="text-sm text-slate-400">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">${stats.pendingEarnings}</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">${stats.paidEarnings}</p>
                  <p className="text-sm text-slate-400">Paid Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-cyan-400" />
              Your Referral Link
            </CardTitle>
            <CardDescription className="text-slate-400">
              Share this link with friends and earn $50 for each signup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
              />
              <Button
                onClick={copyLink}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={shareOnTwitter}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={shareOnFacebook}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={shareByEmail}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Stats */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Referral Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Total Referrals</span>
                  <span className="text-xl font-bold text-white">{stats.totalReferrals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Completed</span>
                  <span className="text-xl font-bold text-green-400">{stats.completedReferrals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Pending</span>
                  <span className="text-xl font-bold text-yellow-400">{stats.pendingReferrals}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="h-5 w-5 text-cyan-400" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Share Your Link", desc: "Send your unique referral link to friends" },
                  { step: 2, title: "Friend Signs Up", desc: "They create an account using your link" },
                  { step: 3, title: "Friend Subscribes", desc: "They purchase any subscription plan" },
                  { step: 4, title: "You Get Paid", desc: "Earn $50 credited to your account" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral History */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Referral History</CardTitle>
            <CardDescription className="text-slate-400">
              Track your referrals and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralHistory.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No referrals yet. Start sharing your link!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referralHistory.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                        {referral.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{referral.name}</p>
                        <p className="text-xs text-slate-500">{referral.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          referral.status === "completed"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {referral.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                      {referral.earned > 0 && (
                        <span className="text-green-400 font-medium">+${referral.earned}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
