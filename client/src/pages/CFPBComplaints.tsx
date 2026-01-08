import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import {
  FileWarning,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Building2,
  Calendar,
  Info,
} from "lucide-react";

const complaintTypes = [
  { value: "incorrect_info", label: "Incorrect information on your report" },
  { value: "improper_investigation", label: "Improper use of your report" },
  { value: "problem_notification", label: "Problem with a credit reporting company's investigation" },
  { value: "unable_to_get_report", label: "Unable to get your credit report or credit score" },
  { value: "credit_monitoring", label: "Problem with credit monitoring or identity theft protection" },
  { value: "other", label: "Other" },
];

const bureaus = [
  { value: "transunion", label: "TransUnion" },
  { value: "equifax", label: "Equifax" },
  { value: "experian", label: "Experian" },
];

// Mock complaints data
const mockComplaints = [
  {
    id: 1,
    bureau: "TransUnion",
    type: "Incorrect information on your report",
    status: "submitted",
    submittedDate: "2025-01-05",
    responseDate: null,
    caseNumber: "CFPB-2025-001234",
  },
  {
    id: 2,
    bureau: "Equifax",
    type: "Problem with investigation",
    status: "response_received",
    submittedDate: "2024-12-20",
    responseDate: "2025-01-03",
    caseNumber: "CFPB-2024-098765",
  },
];

export default function CFPBComplaints() {
  const [selectedBureau, setSelectedBureau] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [desiredResolution, setDesiredResolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedBureau || !complaintType || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("CFPB complaint generated! Review and submit on CFPB website.");
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Submitted</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
      case "response_received":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Response Received</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileWarning className="h-6 w-6 text-cyan-400" />
              CFPB Complaints
            </h1>
            <p className="text-slate-400 mt-1">
              File complaints with the Consumer Financial Protection Bureau
            </p>
          </div>
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => window.open("https://www.consumerfinance.gov/complaint/", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            CFPB Website
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">When to file a CFPB complaint</h3>
                <p className="text-sm text-slate-300 mt-1">
                  File a CFPB complaint if a credit bureau fails to properly investigate your dispute,
                  doesn't respond within 30 days, or continues to report inaccurate information after
                  you've disputed it. CFPB complaints have a 97% response rate and often result in faster resolution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Complaint Form */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-cyan-400" />
                File New Complaint
              </CardTitle>
              <CardDescription className="text-slate-400">
                Generate a CFPB complaint for submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Credit Bureau *</Label>
                <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select bureau" />
                  </SelectTrigger>
                  <SelectContent>
                    {bureaus.map((bureau) => (
                      <SelectItem key={bureau.value} value={bureau.value}>
                        {bureau.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Complaint Type *</Label>
                <Select value={complaintType} onValueChange={setComplaintType}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select complaint type" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Describe the Issue *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, including dates and specific accounts..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Desired Resolution</Label>
                <Textarea
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  placeholder="What would you like to happen as a result of your complaint?"
                  className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                />
              </div>

              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Complaint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Complaint History */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                Complaint History
              </CardTitle>
              <CardDescription className="text-slate-400">
                Track your submitted CFPB complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileWarning className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No complaints filed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-white">{complaint.bureau}</span>
                        </div>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{complaint.type}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Submitted: {complaint.submittedDate}
                        </span>
                        {complaint.responseDate && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                            Response: {complaint.responseDate}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Case #: {complaint.caseNumber}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Tips for Effective CFPB Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Be Specific",
                  desc: "Include account numbers, dates, and specific inaccuracies. Attach copies of your dispute letters and bureau responses.",
                },
                {
                  title: "Document Everything",
                  desc: "Keep copies of all correspondence. Reference your certified mail tracking numbers and dates.",
                },
                {
                  title: "State Violations",
                  desc: "Cite specific FCRA violations like failure to investigate (§1681i) or reporting inaccurate information (§1681e).",
                },
              ].map((tip, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">{tip.title}</h4>
                  <p className="text-sm text-slate-400">{tip.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
