import { trpc } from "@/lib/trpc";
import {
  Mail,
  Download,
  FileText,
  Loader2,
  ChevronRight,
  Shield,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";

export default function Letters() {
  const { data: disputeLetters = [], isLoading: lettersLoading } = trpc.disputeLetters.list.useQuery();
  const { data: creditReports = [], isLoading: reportsLoading } = trpc.creditReports.list.useQuery();
  const downloadPdfMutation = trpc.disputeLetters.downloadPdf.useMutation();
  const updateTrackingMutation = trpc.disputeLetters.updateTrackingNumber.useMutation();
  const utils = trpc.useContext();
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<number | null>(null);

  const handleDownload = async (letterId: number) => {
    try {
      const result = await downloadPdfMutation.mutateAsync({ id: letterId });
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF', error);
    }
  };

  const handleSaveTracking = async (letterId: number) => {
    const value = (trackingInputs[letterId] || "").trim();
    if (!value) return;
    setSavingTrackingId(letterId);
    try {
      await updateTrackingMutation.mutateAsync({ id: letterId, trackingNumber: value });
      await utils.disputeLetters.list.invalidate();
      setTrackingInputs((prev) => ({ ...prev, [letterId]: "" }));
    } catch (error) {
      console.error("Failed to save tracking number", error);
    } finally {
      setSavingTrackingId(null);
    }
  };

  const isLoading = lettersLoading || reportsLoading;
  const statusLabels: Record<string, string> = {
    generated: "Generated",
    downloaded: "Downloaded",
    mailed: "Mailed",
    response_received: "Response received",
    resolved: "Resolved",
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dispute letters...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasNoData = disputeLetters.length === 0 && creditReports.length === 0;
  if (hasNoData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center max-w-md mx-auto">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No dispute letters yet</h1>
          <p className="text-gray-600 mb-6">
            Generate your first set of dispute letters from the main Dashboard or the Dispute Manager.
          </p>
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dispute Letters History</h1>
          <p className="text-base text-gray-600 font-medium mt-1">View, download, and print all generated dispute letters.</p>
        </div>

        <Card className="border-2 border-gray-300 shadow-lg">
          <CardHeader className="border-b-2 border-gray-200">
            <CardTitle className="text-xl font-black">Generated Letters ({disputeLetters.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {disputeLetters.map((letter) => (
                <div key={letter.id} className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white border-2 border-blue-300 rounded-lg">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-gray-900">Round {letter.round} - {letter.bureau}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 font-bold">{letter.letterType}</Badge>
                        <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-bold">
                          {statusLabels[letter.status] || letter.status}
                        </Badge>
                        <span className="text-gray-600 font-medium">Generated: {format(new Date(letter.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      {letter.trackingNumber ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Tracking: {letter.trackingNumber}</span>
                          <a
                            href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${letter.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Track
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            className="h-8 w-56 text-xs"
                            placeholder="Enter USPS tracking number"
                            value={trackingInputs[letter.id] ?? ""}
                            onChange={(e) =>
                              setTrackingInputs((prev) => ({
                                ...prev,
                                [letter.id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-bold"
                            onClick={() => handleSaveTracking(letter.id)}
                            disabled={savingTrackingId === letter.id || !trackingInputs[letter.id]}
                          >
                            {savingTrackingId === letter.id ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Tracking"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="border-2 border-gray-400 font-bold">
                      <Link href={`/letter/${letter.id}`}>
                        <FileText className="w-4 h-4 mr-2" /> View PDF
                      </Link>
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(letter.id)} disabled={downloadPdfMutation.isPending} className="bg-orange-500 hover:bg-orange-600 font-bold shadow-md">
                      {downloadPdfMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4 mr-2" /> Print
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
