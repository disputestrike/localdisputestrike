import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Mail,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";

export default function DashboardSettings() {
  const [notifications, setNotifications] = useState({
    emailDisputes: true,
    emailLetters: true,
    emailResponses: true,
    emailMarketing: false,
    pushDisputes: true,
    pushResponses: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Settings saved successfully!");
    setIsSaving(false);
  };

  // Mock subscription data
  const subscription = {
    plan: "Professional",
    price: 99,
    status: "active",
    nextBilling: "February 8, 2026",
    startDate: "January 8, 2026",
  };

  // Mock payment history
  const paymentHistory = [
    { id: 1, date: "Jan 8, 2026", amount: 99, status: "paid", description: "Professional Plan" },
    { id: 2, date: "Dec 8, 2025", amount: 99, status: "paid", description: "Professional Plan" },
    { id: 3, date: "Nov 8, 2025", amount: 99, status: "paid", description: "Professional Plan" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-orange-500" />
            Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-100 border border-gray-300">
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-500">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-500">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-500">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-500">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Profile Information</CardTitle>
                <CardDescription className="text-gray-500">
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">First Name</Label>
                    <Input
                      defaultValue="John"
                      className="bg-gray-100 border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Last Name</Label>
                    <Input
                      defaultValue="Doe"
                      className="bg-gray-100 border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Email Address</Label>
                  <Input
                    type="email"
                    defaultValue="john.doe@email.com"
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Phone Number</Label>
                  <Input
                    defaultValue="(555) 123-4567"
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="bg-cyan-500 hover:bg-orange-500 text-gray-900"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-500" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "emailDisputes", label: "Dispute Updates", desc: "Get notified when dispute status changes" },
                  { key: "emailLetters", label: "Letter Generated", desc: "Get notified when new letters are ready" },
                  { key: "emailResponses", label: "Bureau Responses", desc: "Get notified when bureaus respond" },
                  { key: "emailMarketing", label: "Marketing Emails", desc: "Receive tips, offers, and updates" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-orange-500" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "pushDisputes", label: "Dispute Updates", desc: "Real-time dispute status updates" },
                  { key: "pushResponses", label: "Bureau Responses", desc: "Instant notification when bureaus respond" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-orange-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{subscription.plan} Plan</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Active
                      </Badge>
                    </div>
                    <p className="text-gray-700">${subscription.price}/month</p>
                  </div>
                  <Button variant="outline" className="border-gray-400 text-gray-700">
                    Change Plan
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Next Billing Date</p>
                    <p className="text-gray-900 font-medium">{subscription.nextBilling}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900 font-medium">{subscription.startDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-medium text-gray-900">{payment.description}</p>
                          <p className="text-sm text-gray-500">{payment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-medium">${payment.amount}</span>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-400">Cancel Subscription</h4>
                    <p className="text-sm text-gray-500">
                      Your subscription will remain active until {subscription.nextBilling}
                    </p>
                  </div>
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    Cancel Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Change Password</CardTitle>
                <CardDescription className="text-gray-500">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Current Password</Label>
                  <Input
                    type="password"
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">New Password</Label>
                  <Input
                    type="password"
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Confirm New Password</Label>
                  <Input
                    type="password"
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <Button className="bg-cyan-500 hover:bg-orange-500 text-gray-900">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-medium text-gray-900">2FA is not enabled</p>
                      <p className="text-sm text-gray-500">
                        Protect your account with two-factor authentication
                      </p>
                    </div>
                  </div>
                  <Button className="bg-cyan-500 hover:bg-orange-500 text-gray-900">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
