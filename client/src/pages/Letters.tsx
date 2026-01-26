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
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from "wouter";
import { format } from "date-fns";

export default function Letters() {
  const { data: disputeLetters = [], isLoading: lettersLoading } = trpc.disputeLetters.list.useQuery();
  const { data: creditReports = [], isLoading: reportsLoading } = trpc.creditReports.list.useQuery();
  const downloadPdfMutation = trpc.disputeLetters.downloadPdf.useMutation();

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

  const isLoading = lettersLoading || reportsLoading;

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
                      <p className="font-black text-gray-900">Round {letter.roundNumber} - {letter.bureau}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 font-bold">{letter.type}</Badge>
                        <span className="text-gray-600 font-medium">Generated: {format(new Date(letter.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="border-2 border-gray-400 font-bold">
                      <Link href={`/letter/${letter.id}`}>
                        <FileText className="w-4 h-4 mr-2" /> View PDF
                      </Link>
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(letter.id)} disabled={downloadPdfMutation.isLoading} className="bg-orange-500 hover:bg-orange-600 font-bold shadow-md">
                      <Printer className="w-4 h-4 mr-2" /> Print
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
