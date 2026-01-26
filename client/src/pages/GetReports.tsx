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
        // The backend parser will handle the combined content
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

  const BureauUpload = ({ bureau, label, isCombined = false }: { bureau: 'transunion' | 'equifax' | 'experian' | 'combined'; label: string; isCombined?: boolean }) => {
    const existingFile = uploadedReports.find(r => r.bureau === bureau);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, bureau),
      accept: { 'application/pdf': ['.pdf'], 'text/html': ['.html', '.htm'] },
      maxFiles: 1,
    });

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        {existingFile ? (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-xs font-medium truncate">{existingFile.file.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); removeFile(bureau); }}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
            <p className="text-[10px] text-gray-500">{isCombined ? "Drop Combined PDF" : "Drop PDF/HTML"}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Credit Reports</h1>
          <p className="text-gray-600">Choose how you want to provide your 3-bureau credit reports</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 2x2 GRID LAYOUT (Blueprint §1.1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: SmartCredit */}
          <Card 
            className={cn(
              "relative border-2 cursor-pointer transition-all",
              selectedOption === 'smartcredit' ? "border-orange-500 ring-2 ring-orange-200" : "hover:border-orange-300"
            )}
            onClick={() => setSelectedOption('smartcredit')}
          >
            <div className="absolute -top-3 left-4 z-10">
              <Badge className="bg-orange-500 text-white">RECOMMENDED</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                SmartCredit
              </CardTitle>
              <CardDescription>$29.99/mo • All 3 Bureaus</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Instant access to all 3 bureaus. Best for automated tracking and monthly updates.</p>
              <Button variant="outline" className="w-full" onClick={handleSmartCreditClick}>
                Get SmartCredit <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: CreditScore Hero */}
          <Card 
            className={cn(
              "border-2 cursor-pointer transition-all",
              selectedOption === 'credithero' ? "border-purple-500 ring-2 ring-purple-200" : "hover:border-purple-300"
            )}
            onClick={() => setSelectedOption('credithero')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                CreditScore Hero
              </CardTitle>
              <CardDescription>One-time fee • 3-Bureau Report</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Get a single combined 3-bureau report for a one-time fee. No monthly subscription.</p>
              <Button variant="outline" className="w-full" onClick={handleCreditHeroClick}>
                Get Report <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 3: AnnualCreditReport.com */}
          <Card 
            className={cn(
              "border-2 cursor-pointer transition-all",
              selectedOption === 'annual' ? "border-green-500 ring-2 ring-green-200" : "hover:border-green-300"
            )}
            onClick={() => setSelectedOption('annual')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                AnnualCreditReport
              </CardTitle>
              <CardDescription>FREE • Government Mandated</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Get your free annual reports as required by law. Requires manual PDF download.</p>
              <Button variant="outline" className="w-full" onClick={handleAnnualCreditReportClick}>
                Visit Site <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 4: I Already Have My Reports */}
          <Card 
            className={cn(
              "border-2 cursor-pointer transition-all",
              selectedOption === 'upload' ? "border-blue-500 ring-2 ring-blue-200" : "hover:border-blue-300"
            )}
            onClick={() => setSelectedOption('upload')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                I Have My Reports
              </CardTitle>
              <CardDescription>Upload PDF or HTML files</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Already have your reports? Upload them directly to start your free AI analysis.</p>
              <Button variant="outline" className="w-full">
                Upload Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* UPLOAD SECTION (Blueprint §1.2) */}
        {selectedOption && selectedOption !== 'smartcredit' && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Upload Your Reports</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option A: Combined File */}
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="text-sm font-bold mb-1">Option A: 1 Combined File</h4>
                    <p className="text-xs text-gray-500 mb-3">Best for CreditScore Hero or SmartCredit PDFs</p>
                    <BureauUpload bureau="combined" label="Combined 3-Bureau Report" isCombined />
                    <p className="text-[10px] text-primary mt-2 italic">Analysis starts automatically after upload</p>
                  </div>
                </div>

                {/* Option B: Separate Files */}
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="text-sm font-bold mb-1">Option B: 3 Separate Files</h4>
                    <p className="text-xs text-gray-500 mb-3">Best for AnnualCreditReport.com files</p>
                    <div className="grid grid-cols-3 gap-2">
                      <BureauUpload bureau="transunion" label="TU" />
                      <BureauUpload bureau="equifax" label="EQ" />
                      <BureauUpload bureau="experian" label="EX" />
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      disabled={uploadedReports.filter(r => r.bureau !== 'combined').length < 1 || isAnalyzing}
                      onClick={() => handleStartAnalysis()}
                    >
                      {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start FREE AI Analysis"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* SmartCredit Modal */}
      <Dialog open={showSmartCreditModal} onOpenChange={setShowSmartCreditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SmartCredit Subscription</DialogTitle>
            <DialogDescription>
              SmartCredit is billed separately at $29.99/mo by ConsumerDirect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input 
                type="checkbox" 
                id="confirm" 
                className="mt-1" 
                checked={smartCreditConfirmed}
                onChange={(e) => setSmartCreditConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm" className="text-sm text-gray-600">
                I understand that I am subscribing to SmartCredit separately and will see a charge from SMARTCREDIT or CONSUMERDIRECT on my statement.
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSmartCreditModal(false)}>Cancel</Button>
            <Button onClick={confirmSmartCredit}>Continue to SmartCredit</Button>
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
