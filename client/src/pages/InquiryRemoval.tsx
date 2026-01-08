import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  FileText,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";

// Mock inquiries data
const mockInquiries = [
  {
    id: 1,
    creditor: "Capital One",
    date: "2025-01-02",
    bureau: "TransUnion",
    type: "Hard",
    status: "active",
    authorized: false,
  },
  {
    id: 2,
    creditor: "Chase Bank",
    date: "2024-12-15",
    bureau: "Equifax",
    type: "Hard",
    status: "active",
    authorized: true,
  },
  {
    id: 3,
    creditor: "Discover",
    date: "2024-11-20",
    bureau: "Experian",
    type: "Hard",
    status: "disputed",
    authorized: false,
  },
  {
    id: 4,
    creditor: "American Express",
    date: "2024-10-05",
    bureau: "TransUnion",
    type: "Hard",
    status: "removed",
    authorized: false,
  },
  {
    id: 5,
    creditor: "Wells Fargo",
    date: "2024-09-18",
    bureau: "Equifax",
    type: "Hard",
    status: "active",
    authorized: false,
  },
];

export default function InquiryRemoval() {
  const [selectedInquiries, setSelectedInquiries] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeInquiries = mockInquiries.filter((i) => i.status === "active");
  const disputedInquiries = mockInquiries.filter((i) => i.status === "disputed");
  const removedInquiries = mockInquiries.filter((i) => i.status === "removed");

  const toggleInquiry = (id: number) => {
    setSelectedInquiries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const unauthorizedIds = activeInquiries.filter((i) => !i.authorized).map((i) => i.id);
    setSelectedInquiries(unauthorizedIds);
  };

  const handleGenerateLetters = async () => {
    if (selectedInquiries.length === 0) {
      toast.error("Please select at least one inquiry to dispute");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success(`Generated ${selectedInquiries.length} inquiry removal letter(s)!`);
    setIsGenerating(false);
    setSelectedInquiries([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Active</Badge>;
      case "disputed":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Disputed</Badge>;
      case "removed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Removed</Badge>;
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
              <Search className="h-6 w-6 text-cyan-400" />
              Inquiry Removal
            </h1>
            <p className="text-slate-400 mt-1">
              Dispute unauthorized hard inquiries on your credit reports
            </p>
          </div>
          <Button
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={handleGenerateLetters}
            disabled={isGenerating || selectedInquiries.length === 0}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Letters ({selectedInquiries.length})
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeInquiries.length}</p>
                  <p className="text-xs text-slate-400">Active Inquiries</p>
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
                  <p className="text-2xl font-bold text-white">{disputedInquiries.length}</p>
                  <p className="text-xs text-slate-400">Disputed</p>
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
                  <p className="text-2xl font-bold text-white">{removedInquiries.length}</p>
                  <p className="text-xs text-slate-400">Removed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Trash2 className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {mockInquiries.length > 0
                      ? Math.round((removedInquiries.length / mockInquiries.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-slate-400">Removal Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiries List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Hard Inquiries</CardTitle>
                <CardDescription className="text-slate-400">
                  Select unauthorized inquiries to dispute
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Select All Unauthorized
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedInquiries.includes(inquiry.id)
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-slate-800/50 border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedInquiries.includes(inquiry.id)}
                      onCheckedChange={() => toggleInquiry(inquiry.id)}
                      disabled={inquiry.status !== "active" || inquiry.authorized}
                      className="border-slate-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-white">{inquiry.creditor}</span>
                        {getStatusBadge(inquiry.status)}
                        {inquiry.authorized && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            Authorized
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {inquiry.date}
                        </span>
                        <span>{inquiry.bureau}</span>
                        <span className="text-red-400">{inquiry.type} Inquiry</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              About Hard Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-2">What are hard inquiries?</h4>
                <p className="text-sm text-slate-400">
                  Hard inquiries occur when a lender checks your credit for a lending decision.
                  Each hard inquiry can lower your score by 5-10 points and stays on your report for 2 years.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-2">When can you dispute?</h4>
                <p className="text-sm text-slate-400">
                  You can dispute inquiries you didn't authorize, inquiries from companies you don't recognize,
                  or duplicate inquiries from the same creditor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
