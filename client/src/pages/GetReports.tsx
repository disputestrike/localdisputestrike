/**
 * Get Your Reports Screen (Blueprint §1)
 * 
 * Four options in a 2x2 grid:
 * 1. SmartCredit (RECOMMENDED) - $29.99/month
 * 2. CreditScore Hero (NEW AFFILIATE) - One-time fee
 * 3. AnnualCreditReport.com (FREE) - Government-mandated
 * 4. I Already Have My Reports - Upload existing PDFs
 */

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

  const BureauUpload = ({ bureau, label, color }: { bureau: 'transunion' | 'equifax' | 'experian' | 'combined'; label: string; color: string }) => {
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
                  <Upload className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-base font-bold">I Have My Reports</CardTitle>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upload PDF or HTML files</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">Already have your reports? Upload them directly to start your free AI analysis.</p>
              <Button variant="outline" className="w-full h-9 text-xs font-bold">
                Upload Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* UPLOAD SECTION - MATCHING SCREENSHOT STYLE */}
        {selectedOption && (
          <div className="bg-[#f0f7ff] border border-[#d0e7ff] rounded-xl overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-900">Upload Your Reports for FREE Preview</h3>
              </div>
              
              <p className="text-xs text-gray-500 mb-6">Upload your credit reports from AnnualCreditReport.com or any other source:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Option A: Combined File */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Option A: 1 Combined File</h4>
                    <p className="text-[11px] text-gray-500 mb-4">Best for CreditScore Hero or SmartCredit PDFs</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs font-medium text-gray-700">Combined 3-Bureau Report</span>
                      </div>
                      {uploadedReports.find(r => r.bureau === 'combined') ? (
                        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg p-3 h-[60px]">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-900 truncate">{uploadedReports.find(r => r.bureau === 'combined')?.file.name}</p>
                            <p className="text-[10px] text-gray-500">{(uploadedReports.find(r => r.bureau === 'combined')!.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button onClick={() => removeFile('combined')} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <div
                          {...useDropzone({ onDrop: (files) => onDrop(files, 'combined'), accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 }).getRootProps()}
                          className="border border-dashed border-gray-200 rounded-lg h-[60px] flex flex-col items-center justify-center cursor-pointer bg-gray-50/30"
                        >
                          <Upload className="w-4 h-4 text-gray-400 mb-1" />
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Drop PDF/HTML</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-blue-500 mt-3 italic">Analysis starts automatically after upload</p>
                  </div>
                </div>

                {/* Option B: Separate Files */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Option B: 3 Separate Files</h4>
                    <p className="text-[11px] text-gray-500 mb-4">Best for AnnualCreditReport.com files</p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <BureauUpload bureau="transunion" label="TransUnion" color="bg-blue-500" />
                      <BureauUpload bureau="equifax" label="Equifax" color="bg-red-500" />
                      <BureauUpload bureau="experian" label="Experian" color="bg-purple-500" />
                    </div>

                    <Button 
                      className="w-full mt-6 bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold h-10" 
                      disabled={uploadedReports.filter(r => r.bureau !== 'combined').length < 1 || isAnalyzing}
                      onClick={() => handleStartAnalysis()}
                    >
                      {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          Start FREE AI Analysis
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-[11px] text-gray-600">Upload at least one report to continue. More reports = more violations found.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-[#fff1f1] border border-[#ffe0e0] text-[#d32f2f] text-xs rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#d32f2f] flex items-center justify-center shrink-0">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* HELP SECTION */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Where can I get my credit reports?</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-700"><span className="font-bold">SmartCredit.com</span> - Instant access to all 3 bureaus</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-700"><span className="font-bold">AnnualCreditReport.com</span> - Free once per year from each bureau</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button className="text-xs font-bold text-gray-400 flex items-center gap-2 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to Profile
          </button>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Bank-Level Security
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Analysis in 60 Seconds
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Comprehensive Violation Detection
            </div>
          </div>

          <p className="text-[9px] text-gray-400 text-center max-w-2xl leading-relaxed">
            DisputeStrike is not affiliated with SmartCredit, AnnualCreditReport.com, IdentityIQ, or the credit bureaus. We are a software tool that helps you dispute inaccurate information on your credit reports. Results not guaranteed.
          </p>
        </div>
      </div>

      {/* SmartCredit Modal */}
      <Dialog open={showSmartCreditModal} onOpenChange={setShowSmartCreditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">SmartCredit Subscription</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              SmartCredit is billed separately at $29.99/mo by ConsumerDirect.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <input 
                type="checkbox" 
                id="confirm" 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                checked={smartCreditConfirmed}
                onChange={(e) => setSmartCreditConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm" className="text-xs text-gray-600 leading-relaxed">
                I understand that I am subscribing to SmartCredit separately and will see a charge from SMARTCREDIT or CONSUMERDIRECT on my statement.
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setShowSmartCreditModal(false)}>Cancel</Button>
            <Button className="bg-[#0052cc] hover:bg-[#0041a3] text-white text-xs font-bold px-6" onClick={confirmSmartCredit}>Continue to SmartCredit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", className)}>
      {children}
    </span>
  );
}
