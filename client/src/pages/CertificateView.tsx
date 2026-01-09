import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Home } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef } from "react";

interface CertificateData {
  userName: string;
  completionDate: string;
  courseName: string;
}

export default function CertificateView() {
  const { id } = useParams<{ id: string }>();
  const certificateRef = useRef<HTMLDivElement>(null);

  // Mock certificate data - in production, fetch from database
  const certificate: CertificateData = {
    userName: "Benjamin Peter",
    completionDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    courseName: "Credit Education Course",
  };

  const handleDownloadPDF = () => {
    // In production, use a PDF library like jsPDF or html2pdf
    const element = certificateRef.current;
    if (element) {
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleShare = () => {
    const text = `I just completed the DisputeStrike Credit Education Course! 🎓 Join me in learning about credit repair and FCRA rights.`;
    if (navigator.share) {
      navigator.share({
        title: "DisputeStrike Certificate",
        text: text,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert("Certificate link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Certificate */}
        <div
          ref={certificateRef}
          className="bg-white rounded-xl shadow-2xl p-12 mb-8 border-8 border-orange-500"
        >
          {/* Certificate Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-blue-600 mx-auto"></div>
          </div>

          {/* Certificate Body */}
          <div className="text-center space-y-6 my-12">
            <p className="text-lg text-gray-700">This certifies that</p>
            
            <div className="border-b-4 border-gray-900 py-4">
              <p className="text-4xl font-bold text-gray-900">{certificate.userName}</p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-gray-700">has successfully completed the</p>
              <p className="text-2xl font-bold text-orange-600">{certificate.courseName}</p>
              <p className="text-gray-700">
                and demonstrated proficiency in understanding credit reports, FCRA rights, and dispute strategies.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2 border-gray-300">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Date of Completion</p>
                <p className="text-lg font-semibold text-gray-900">{certificate.completionDate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Certificate ID</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">{id || "CERT-2025-001"}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t-2 border-gray-300">
            <p className="text-sm text-gray-600">
              Issued by DisputeStrike - Litigation-Grade Credit Repair Platform
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This certificate verifies completion of the DisputeStrike Credit Education Course
            </p>
          </div>
        </div>

        {/* Actions */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Share Your Achievement</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share on Social Media
            </Button>

            <Link href="/dashboard">
              <Button variant="outline" className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              ✨ <strong>Next Step:</strong> Now that you understand credit repair, upload your credit reports and start disputing inaccuracies. Your knowledge is your power!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
