import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";
import {
  UserCog,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Save,
  Shield,
} from "lucide-react";

export default function ProfileOptimizer() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    ssn: "***-**-1234",
    dob: "1985-03-15",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
    currentAddress: "1234 Main Street, Dallas, TX 75201",
    previousAddress1: "5678 Oak Avenue, Houston, TX 77001",
    previousAddress2: "",
    employer: "ABC Company",
    employerAddress: "100 Business Park, Dallas, TX 75202",
    jobTitle: "Software Engineer",
    yearsEmployed: "3",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Calculate profile completeness
  const fields = Object.values(profile);
  const filledFields = fields.filter((f) => f && f.trim() !== "").length;
  const completeness = Math.round((filledFields / fields.length) * 100);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Profile updated successfully!");
    setIsSaving(false);
  };

  const updateField = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCog className="h-6 w-6 text-orange-500" />
              Profile Optimizer
            </h1>
            <p className="text-gray-500 mt-1">
              Keep your personal information accurate across all bureaus
            </p>
          </div>
          <Button
            className="bg-cyan-500 hover:bg-orange-500 text-gray-900"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Profile Completeness */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${completeness === 100 ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                  {completeness === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Profile Completeness</h3>
                  <p className="text-sm text-gray-500">
                    {completeness === 100
                      ? "Your profile is complete!"
                      : "Complete your profile for better dispute results"}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your identity information as it should appear on credit reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">First Name</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Last Name</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Social Security Number</Label>
                  <Input
                    value={profile.ssn}
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address History */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Address History
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your current and previous addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Current Address</Label>
                <Input
                  value={profile.currentAddress}
                  onChange={(e) => updateField("currentAddress", e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Previous Address 1</Label>
                <Input
                  value={profile.previousAddress1}
                  onChange={(e) => updateField("previousAddress1", e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Previous Address 2</Label>
                <Input
                  value={profile.previousAddress2}
                  onChange={(e) => updateField("previousAddress2", e.target.value)}
                  placeholder="Optional"
                  className="bg-gray-100 border-gray-300 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="bg-white border-gray-200 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-500" />
                Employment Information
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your current employment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Employer Name</Label>
                  <Input
                    value={profile.employer}
                    onChange={(e) => updateField("employer", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Job Title</Label>
                  <Input
                    value={profile.jobTitle}
                    onChange={(e) => updateField("jobTitle", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Years Employed</Label>
                  <Input
                    value={profile.yearsEmployed}
                    onChange={(e) => updateField("yearsEmployed", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Employer Address</Label>
                  <Input
                    value={profile.employerAddress}
                    onChange={(e) => updateField("employerAddress", e.target.value)}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-orange-50 border-orange-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Why is this important?</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Keeping your personal information consistent across all three credit bureaus helps ensure
                  your disputes are processed correctly. Inconsistent information can lead to delays or
                  rejected disputes. This information is used to generate your dispute letters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
