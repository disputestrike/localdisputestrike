import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
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
  Loader2,
} from "lucide-react";

export default function ReferralProgram() {
  // Get user's referral data from database
  const { data: referralData, isLoading: loadingReferral } = trpc.referrals.get.useQuery();
  
  // Get all referrals made by user
  const { data: referralsList, isLoading: loadingList } = trpc.referrals.list.useQuery();

  // Calculate stats from real data
  const stats = {
    totalReferrals: referralsList?.length || 0,
    pendingReferrals: referralsList?.filter(r => r.status === 'pending' || r.status === 'signed_up').length || 0,
    completedReferrals: referralsList?.filter(r => r.status === 'subscribed' || r.status === 'paid_out').length || 0,
    totalEarnings: referralsList?.reduce((sum, r) => {
      if (r.status === 'subscribed' || r.status === 'paid_out') {
        return sum + Number(r.commissionAmount || 50);
      }
      return sum;
    }, 0) || 0,
    pendingEarnings: referralsList?.reduce((sum, r) => {
      if (r.status === 'subscribed') {
        return sum + Number(r.commissionAmount || 50);
      }
      return sum;
    }, 0) || 0,
    paidEarnings: referralsList?.reduce((sum, r) => {
      if (r.status === 'paid_out') {
        return sum + Number(r.commissionAmount || 50);
      }
      return sum;
    }, 0) || 0,
  };

  // Generate referral link from real code
  const referralCode = referralData?.referralCode || '';
  const referralLink = referralCode ? `${window.location.origin}/ref/${referralCode}` : '';

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    }
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

  const isLoading = loadingReferral || loadingList;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-500" />
            Referral Program
          </h1>
          <p className="text-gray-500 mt-1">
            Earn $50 for every friend who signs up and subscribes
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-orange-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalEarnings}</p>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">${stats.pendingEarnings}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">${stats.paidEarnings}</p>
                  <p className="text-sm text-gray-500">Paid Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-orange-500" />
              Your Referral Link
            </CardTitle>
            <CardDescription className="text-gray-500">
              Share this link with friends and earn $50 for each signup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink || "Generating your referral link..."}
                readOnly
                className="bg-gray-100 border-gray-300 text-gray-900 font-mono text-sm"
              />
              <Button
                onClick={copyLink}
                disabled={!referralLink}
                className="bg-cyan-500 hover:bg-orange-500 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={shareOnTwitter}
                disabled={!referralLink}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={shareOnFacebook}
                disabled={!referralLink}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={shareByEmail}
                disabled={!referralLink}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                disabled={!referralLink}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Stats */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Referral Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Referrals</span>
                  <span className="text-xl font-bold text-gray-900">{stats.totalReferrals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Completed</span>
                  <span className="text-xl font-bold text-green-500">{stats.completedReferrals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Pending</span>
                  <span className="text-xl font-bold text-yellow-500">{stats.pendingReferrals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Link Clicks</span>
                  <span className="text-xl font-bold text-blue-500">{referralData?.clickCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Gift className="h-5 w-5 text-orange-500" />
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
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral History */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Referral History</CardTitle>
            <CardDescription className="text-gray-500">
              Track your referrals and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!referralsList || referralsList.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No referrals yet. Start sharing your link!</p>
                <p className="text-sm text-gray-400 mt-2">
                  When friends sign up using your link, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referralsList.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 font-medium">
                        {referral.referredUserId ? "U" : "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {referral.referredUserId ? `User #${referral.referredUserId}` : "Pending Signup"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {referral.signedUpAt 
                            ? new Date(referral.signedUpAt).toLocaleDateString()
                            : new Date(referral.createdAt).toLocaleDateString()
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          referral.status === "paid_out"
                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                            : referral.status === "subscribed"
                            ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                            : referral.status === "signed_up"
                            ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                            : "bg-gray-500/20 text-gray-600 border-gray-500/30"
                        }
                      >
                        {referral.status === "paid_out" ? "Paid" 
                          : referral.status === "subscribed" ? "Subscribed"
                          : referral.status === "signed_up" ? "Signed Up"
                          : "Pending"}
                      </Badge>
                      {(referral.status === "subscribed" || referral.status === "paid_out") && (
                        <span className="text-green-500 font-medium">+${referral.commissionAmount || 50}</span>
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
