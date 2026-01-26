import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ExternalLink,
  Upload,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Star,
  Zap,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

// Affiliate Links
const SMARTCREDIT_AFFILIATE_URL = 'https://www.smartcredit.com/?PID=87529';
const CREDIT_SCORE_HERO_URL = 'https://www.creditscorehero.com/'; 
const ANNUAL_CREDIT_REPORT_URL = 'https://www.annualcreditreport.com/';

interface UploadedReport {
  bureau: 'transunion' | 'equifax' | 'experian' | 'combined';
  file: File;
}

export default function GetReports() {
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<'smartcredit' | 'credithero' | 'annual' | 'upload' | null>(null);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [showSmartCreditModal, setShowSmartCreditModal] = useState(false);
  const [smartCreditConfirmed, setSmartCreditConfirmed] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 6;
  const currentStep = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Handle SmartCredit link click
  const handleSmartCreditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSmartCreditModal(true);
  };

  const confirmSmartCredit = () => {
    if (!smartCreditConfirmed) {
      setError('Please confirm you understand the SmartCredit billing before continuing.');
      return;
    }
    window.open(SMARTCREDIT_AFFILIATE_URL, '_blank');
    setShowSmartCreditModal(false);
    setSelectedOption('smartcredit');
  };

  const handleCreditHeroClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(CREDIT_SCORE_HERO_URL, '_blank');
    setSelectedOption('credithero');
  };

  const handleAnnualCreditReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(ANNUAL_CREDIT_REPORT_URL, '_blank');
    setSelectedOption('annual');
  };

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[], bureau: 'transunion' | 'equifax' | 'experian' | 'combined') => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setUploadedReports(prev => {
        const filtered = prev.filter(r => r.bureau !== bureau);
        const updated = [...filtered, { bureau, file: newFile }];
        
        // AUTO-ANALYZE LOGIC (Blueprint §1.2):
        // If it's a combined file, start analysis automatically
        if (bureau === 'combined') {
          setTimeout(() => handleStartAnalysis(updated), 500);
        }
        
        return updated;
      });
    }
  }, []);

  const removeFile = (bureau: string) => {
    setUploadedReports(prev => prev.filter(r => r.bureau !== bureau));
  };

  const handleStartAnalysis = async (reportsToUpload = uploadedReports) => {
    if (reportsToUpload.length === 0) {
      setError('Please upload at least one credit report');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Check if we have a combined file
      const combinedReport = reportsToUpload.find(r => r.bureau === 'combined');
      
      if (combinedReport) {
        // If combined, we send it as 'transunion' to satisfy the backend's requirement for at least one bureau
        formData.append('transunion', combinedReport.file);
      } else {
        // Otherwise send individual files
        reportsToUpload.forEach(report => {
          if (report.bureau !== 'combined') {
            formData.append(report.bureau, report.file);
          }
        });
      }
      
      const response = await fetch('/api/credit-reports/upload-and-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      sessionStorage.setItem('previewAnalysis', JSON.stringify(data));
      setLocation('/preview-results');
    } catch (e: any) {
      setError(e.message || 'Failed to upload reports. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Credit Reports</h1>
          <p className="text-gray-500 text-sm">We need your 3-bureau credit report to analyze for violations</p>
        </div>

        <div className="mb-12">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-gray-100" />
        </div>

        {/* 2x2 GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: AnnualCreditReport */}
          <Card 
            className={cn(
              "relative border cursor-pointer transition-all shadow-sm",
              selectedOption === 'annual' ? "border-green-500 ring-1 ring-green-500" : "hover:border-gray-300"
            )}
            onClick={() => setSelectedOption('annual')}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </div>
                  <CardTitle className="text-base font-bold">AnnualCreditReport</CardTitle>
                </div>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">FREE • Government Mandated</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">Get your free annual reports as required by law. Requires manual PDF download.</p>
              <Button variant="outline" className="w-full h-9 text-xs font-bold" onClick={handleAnnualCreditReportClick}>
                Visit Site <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: I Have My Reports */}
          <Card 
            className={cn(
              "relative border cursor-pointer transition-all shadow-sm",
              selectedOption === 'upload' ? "border-blue-500 ring-1 ring-blue-500" : "hover:border-gray-300"
            )}
            onClick={() => setSelectedOption('upload')}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center">
                    <Upload className="w-3 h-3 text-blue-500" />
                  </div>
                  <CardTitle className="text-base font-bold">I Have My Reports</CardTitle>
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">UPLOAD PDF OR HTML</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">Already have your reports? Upload them directly to start your free AI analysis.</p>
              <Button className="w-full h-9 text-xs font-bold" onClick={() => handleStartAnalysis()}>
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <>Upload Now <Upload className="w-3 h-3 ml-2" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {selectedOption === 'upload' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Your Reports</h3>
            <p className="text-sm text-gray-500 mb-6">You can upload a combined 3-bureau report, or individual reports for each bureau.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Combined Upload */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
                <BureauUpload bureau="combined" label="Combined 3-Bureau Report (Recommended)" color="bg-purple-500" onDrop={onDrop} />
              </div>

              {/* Individual Uploads */}
              <BureauUpload bureau="transunion" label="TransUnion" color="bg-red-500" onDrop={onDrop} />
              <BureauUpload bureau="equifax" label="Equifax" color="bg-yellow-500" onDrop={onDrop} />
              <BureauUpload bureau="experian" label="Experian" color="bg-blue-500" onDrop={onDrop} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => handleStartAnalysis()}
                disabled={isAnalyzing || uploadedReports.length === 0}
                className="w-full sm:w-auto"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <>Start Analysis <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Where can I get my credit reports?</h3>
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>SmartCredit.com - Instant access to all 3 bureaus</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>AnnualCreditReport.com - Free once per year from each bureau</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button variant="link" className="text-xs text-gray-500" onClick={() => setLocation("/complete-profile")}>
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Profile
          </Button>
        </div>

        <div className="mt-16 border-t pt-8">
          <div className="flex justify-center items-center gap-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Analysis in 60 Seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Comprehensive Violation Detection</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            DisputeStrike is not affiliated with SmartCredit, AnnualCreditReport.com, IdentityIQ, or the credit bureaus. We are a software tool that helps you dispute inaccurate information on your credit reports. Results not guaranteed.
          </p>
        </div>
      </div>

      {/* SmartCredit Modal */}
      <Dialog open={showSmartCreditModal} onOpenChange={setShowSmartCreditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Important: SmartCredit Billing</DialogTitle>
            <DialogDescription>
              By clicking "Continue", you will be redirected to SmartCredit.com. Please be aware that SmartCredit is a third-party subscription service with its own billing cycle (typically a 7-day trial for $1, then $29.99/month). DisputeStrike is not responsible for any charges from SmartCredit.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start space-x-2 mt-4">
            <input 
              type="checkbox" 
              id="confirm-billing" 
              checked={smartCreditConfirmed}
              onChange={(e) => setSmartCreditConfirmed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="confirm-billing" className="text-sm text-gray-700">
              I understand that SmartCredit is a separate subscription and I am responsible for managing my billing with them.
            </label>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowSmartCreditModal(false)}>Cancel</Button>
            <Button onClick={confirmSmartCredit} disabled={!smartCreditConfirmed}>Continue to SmartCredit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const BureauUpload = ({ bureau, label, color, onDrop }: { bureau: 'transunion' | 'equifax' | 'experian' | 'combined'; label: string; color: string; onDrop: (files: File[], bureau: 'transunion' | 'equifax' | 'experian' | 'combined') => void }) => {
  const existingFile = uploadedReports.find(r => r.bureau === bureau);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, bureau),
    accept: { 'application/pdf': ['.pdf'], 'text/html': ['.html', '.htm'] },
    maxFiles: 1,
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      {existingFile ? (
        <div className="relative group">
          <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg p-3 h-[60px]">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-900 truncate">{existingFile.file.name}</p>
              <p className="text-[10px] text-gray-500">{(existingFile.file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); removeFile(bureau); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border border-dashed rounded-lg h-[60px] flex flex-col items-center justify-center cursor-pointer transition-all",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-gray-50/30"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-4 h-4 text-gray-400 mb-1" />
          <p className="text-[9px] text-gray-400 uppercase font-bold">Drop PDF/HTML</p>
        </div>
      )}
    </div>
  );
};
