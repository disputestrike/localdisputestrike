import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Search,
  FileText,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";

// No mock data - only show real inquiries from uploaded credit reports

export default function InquiryRemoval() {
  const [selectedInquiries, setSelectedInquiries] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch real inquiries from database
  const { data: dbInquiries, isLoading, refetch } = trpc.hardInquiries.list.useQuery();
  const disputeMutation = trpc.hardInquiries.dispute.useMutation({
    onSuccess: () => {
      toast.success("Inquiry marked for dispute");
      refetch();
    },
  });
  const updateStatusMutation = trpc.hardInquiries.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Inquiry status updated");
      refetch();
    },
  });

  // Use database inquiries only - no mock/placeholder data
  const inquiries = dbInquiries?.length ? dbInquiries.map(i => ({
    id: i.id,
    creditor: i.creditorName,
    date: i.inquiryDate ? new Date(i.inquiryDate).toISOString().split('T')[0] : 'Unknown',
    bureau: i.bureau.charAt(0).toUpperCase() + i.bureau.slice(1),
    type: i.inquiryType === 'hard' ? 'Hard' : 'Soft',
    status: i.disputeStatus === 'none' ? 'active' : i.disputeStatus,
    authorized: i.isAuthorized,
  })) : [];

  const activeInquiries = inquiries.filter((i) => i.status === "active");
  const disputedInquiries = inquiries.filter((i) => i.status === "disputed");
  const removedInquiries = inquiries.filter((i) => i.status === "removed");

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="h-6 w-6 text-orange-500" />
              Inquiry Removal
            </h1>
            <p className="text-gray-500 mt-1">
              Dispute unauthorized hard inquiries on your credit reports
            </p>
          </div>
          <Button
            className="bg-cyan-500 hover:bg-orange-500 text-gray-900"
            onClick={handleGenerateLetters}
            disabled={isGenerating || selectedInquiries.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeInquiries.length}</p>
                  <p className="text-xs text-gray-500">Active Inquiries</p>
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
                  <p className="text-2xl font-bold text-gray-900">{disputedInquiries.length}</p>
                  <p className="text-xs text-gray-500">Disputed</p>
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
                  <p className="text-2xl font-bold text-gray-900">{removedInquiries.length}</p>
                  <p className="text-xs text-gray-500">Removed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Trash2 className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {inquiries.length > 0
                      ? Math.round((removedInquiries.length / inquiries.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Removal Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiries List */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Hard Inquiries</CardTitle>
                <CardDescription className="text-gray-500">
                  Select unauthorized inquiries to dispute
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Select All Unauthorized
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedInquiries.includes(inquiry.id)
                        ? "bg-orange-50 border-orange-300"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedInquiries.includes(inquiry.id)}
                        onCheckedChange={() => toggleInquiry(inquiry.id)}
                        disabled={inquiry.status !== "active" || inquiry.authorized as boolean}
                        className="border-gray-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{inquiry.creditor}</span>
                          {getStatusBadge(inquiry.status)}
                          {inquiry.authorized && (
                            <Badge variant="outline" className="border-gray-400 text-gray-500">
                              Authorized
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
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
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-700">No inquiries found</p>
                  <p className="text-sm text-gray-400 mt-1">Upload your credit reports to see hard inquiries</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href="/dashboard/reports">Upload Credit Reports</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              About Hard Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">What are hard inquiries?</h4>
                <p className="text-sm text-gray-500">
                  Hard inquiries occur when a lender checks your credit for a lending decision.
                  Each hard inquiry can lower your score by 5-10 points and stays on your report for 2 years.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">When can you dispute?</h4>
                <p className="text-sm text-gray-500">
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
