import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
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
  MapPin,
  Calendar,
  Lock,
  Phone,
  Home,
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

  // Profile form state
  const [profile, setProfile] = useState({
    fullName: "",
    dateOfBirth: "",
    ssnLast4: "",
    phone: "",
    email: "",
    currentAddress: "",
    currentCity: "",
    currentState: "",
    currentZip: "",
    previousAddress: "",
    previousCity: "",
    previousState: "",
    previousZip: "",
  });

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: user } = trpc.auth.me.useQuery();
  
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save profile");
    },
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profileData) {
      setProfile({
        fullName: profileData.fullName || user?.name || "",
        dateOfBirth: profileData.dateOfBirth || "",
        ssnLast4: profileData.ssnLast4 || "",
        phone: profileData.phone || "",
        email: profileData.email || user?.email || "",
        currentAddress: profileData.currentAddress || "",
        currentCity: profileData.currentCity || "",
        currentState: profileData.currentState || "",
        currentZip: profileData.currentZip || "",
        previousAddress: profileData.previousAddress || "",
        previousCity: profileData.previousCity || "",
        previousState: profileData.previousState || "",
        previousZip: profileData.previousZip || "",
      });
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [profileData, user]);

  const handleSaveProfile = async () => {
    updateProfileMutation.mutate(profile);
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

  // US States for dropdown
  const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
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
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-gray-500">
                  This information will be used in your dispute letters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Full Legal Name *</Label>
                    <Input
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="John Michael Doe"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <p className="text-xs text-gray-500">As it appears on your credit report</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth *
                    </Label>
                    <Input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <p className="text-xs text-gray-500">Required by credit bureaus for verification</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Last 4 Digits of SSN *
                    </Label>
                    <Input
                      value={profile.ssnLast4}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setProfile({ ...profile, ssnLast4: value });
                      }}
                      placeholder="1234"
                      maxLength={4}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <p className="text-xs text-gray-500">Required by bureaus - stored securely</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="john.doe@email.com"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Address */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-orange-500" />
                  Current Address
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Your current mailing address for dispute letters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Street Address *</Label>
                  <Input
                    value={profile.currentAddress}
                    onChange={(e) => setProfile({ ...profile, currentAddress: e.target.value })}
                    placeholder="123 Main Street, Apt 4B"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-gray-700">City *</Label>
                    <Input
                      value={profile.currentCity}
                      onChange={(e) => setProfile({ ...profile, currentCity: e.target.value })}
                      placeholder="New York"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">State *</Label>
                    <select
                      value={profile.currentState}
                      onChange={(e) => setProfile({ ...profile, currentState: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900"
                    >
                      <option value="">Select</option>
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">ZIP Code *</Label>
                    <Input
                      value={profile.currentZip}
                      onChange={(e) => setProfile({ ...profile, currentZip: e.target.value })}
                      placeholder="10001"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Previous Address */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Previous Address (Optional)
                </CardTitle>
                <CardDescription className="text-gray-500">
                  If you've moved in the last 2 years, include your previous address for better bureau verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Street Address</Label>
                  <Input
                    value={profile.previousAddress}
                    onChange={(e) => setProfile({ ...profile, previousAddress: e.target.value })}
                    placeholder="456 Oak Avenue"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-gray-700">City</Label>
                    <Input
                      value={profile.previousCity}
                      onChange={(e) => setProfile({ ...profile, previousCity: e.target.value })}
                      placeholder="Los Angeles"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">State</Label>
                    <select
                      value={profile.previousState}
                      onChange={(e) => setProfile({ ...profile, previousState: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900"
                    >
                      <option value="">Select</option>
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">ZIP Code</Label>
                    <Input
                      value={profile.previousZip}
                      onChange={(e) => setProfile({ ...profile, previousZip: e.target.value })}
                      placeholder="90001"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>

            {/* Profile Completion Status */}
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Why is this information needed?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Credit bureaus require your full name, date of birth, SSN (last 4), and current address to verify your identity and process disputes. 
                      Without this information, your dispute letters may be rejected or delayed.
                    </p>
                  </div>
                </div>
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
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{subscription.plan} Plan</h3>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Active
                      </Badge>
                    </div>
                    <p className="text-gray-700">${subscription.price}/month</p>
                  </div>
                  <Button variant="outline" className="border-gray-400 text-gray-700">
                    Change Plan
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-orange-200 grid grid-cols-2 gap-4">
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
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
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

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-600">Cancel Subscription</h4>
                    <p className="text-sm text-gray-500">
                      Your subscription will remain active until {subscription.nextBilling}
                    </p>
                  </div>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
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
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">New Password</Label>
                  <Input
                    type="password"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Confirm New Password</Label>
                  <Input
                    type="password"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
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
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">2FA is not enabled</p>
                      <p className="text-sm text-gray-500">
                        Protect your account with two-factor authentication
                      </p>
                    </div>
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
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
