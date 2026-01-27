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
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
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
    setAnalysisProgress(0);
    setAnalysisStatus('Preparing files...');
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Check if we have a combined file
      const combinedReport = reportsToUpload.find(r => r.bureau === 'combined');
      const fileCount = combinedReport ? 1 : reportsToUpload.filter(r => r.bureau !== 'combined').length;
      
      // Progress simulation with realistic stages
      const progressStages = [
        { percent: 5, status: 'Uploading files...' },
        { percent: 15, status: 'Extracting text from PDFs...' },
        { percent: 30, status: 'Running AI analysis...' },
        { percent: 50, status: 'Identifying negative accounts...' },
        { percent: 70, status: 'Detecting FCRA violations...' },
        { percent: 85, status: 'Calculating score impact...' },
        { percent: 95, status: 'Finalizing results...' },
      ];
      
      // Start progress animation
      let currentStage = 0;
      const progressInterval = setInterval(() => {
        if (currentStage < progressStages.length) {
          setAnalysisProgress(progressStages[currentStage].percent);
          setAnalysisStatus(progressStages[currentStage].status);
          currentStage++;
        }
      }, fileCount > 1 ? 3000 : 2000); // Slower for multiple files
      
      if (combinedReport) {
        formData.append('transunion', combinedReport.file);
      } else {
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

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setAnalysisProgress(100);
      setAnalysisStatus('Analysis complete!');
      
      const data = await response.json();
      sessionStorage.setItem('previewAnalysis', JSON.stringify(data));
      
      // Brief delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      setLocation('/preview-results');
    } catch (e: any) {
      setError(e.message || 'Failed to upload reports. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">DisputeStrike</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Get Your Credit Reports</h1>
          <p className="text-gray-600 text-sm font-medium">We need your 3-bureau credit report to analyze for violations</p>
        </div>

        <div className="mb-12 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 2x2 GRID LAYOUT - All 4 Options - STRONG BORDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: SmartCredit (RECOMMENDED) */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg",
              selectedOption === 'smartcredit' 
                ? "border-[3px] border-orange-500 ring-4 ring-orange-100 bg-orange-50" 
                : "border-2 border-gray-300 hover:border-orange-400 hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('smartcredit')}
          >
            <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase shadow-md">
              Recommended
            </div>
            <CardHeader className="pb-2 pt-7">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                  <CardTitle className="text-lg font-black text-gray-900">SmartCredit</CardTitle>
                </div>
                <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-1 rounded uppercase">$29.99/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 mb-4 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">All 3 bureaus in one place</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">Daily monitoring + Score tracking</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">Easy PDF export for upload</span></li>
              </ul>
              <Button className="w-full h-11 text-sm font-bold bg-orange-500 hover:bg-orange-600 shadow-md" onClick={handleSmartCreditClick}>
                Get SmartCredit <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Credit Hero */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg",
              selectedOption === 'credithero' 
                ? "border-[3px] border-purple-500 ring-4 ring-purple-100 bg-purple-50" 
                : "border-2 border-gray-300 hover:border-purple-400 hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('credithero')}
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-black text-gray-900">Credit Hero</CardTitle>
                </div>
                <span className="text-xs font-black text-purple-600 bg-purple-100 px-2 py-1 rounded uppercase">One-Time Fee</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 mb-4 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">1 combined file with all 3 bureaus</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">Fast & easy upload</span></li>
              </ul>
              <Button variant="outline" className="w-full h-11 text-sm font-bold border-2 border-purple-400 text-purple-700 hover:bg-purple-100" onClick={handleCreditHeroClick}>
                Get Credit Hero <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 3: AnnualCreditReport (FREE) */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg",
              selectedOption === 'annual' 
                ? "border-[3px] border-green-500 ring-4 ring-green-100 bg-green-50" 
                : "border-2 border-gray-300 hover:border-green-400 hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('annual')}
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-black text-gray-900">AnnualCreditReport</CardTitle>
                </div>
                <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded uppercase">FREE • Government</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 mb-4 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">Government-mandated free reports</span></li>
                <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-600" /> <span className="font-medium">Once per year per bureau</span></li>
              </ul>
              <Button variant="outline" className="w-full h-11 text-sm font-bold border-2 border-gray-400 text-gray-700 hover:bg-gray-100" onClick={handleAnnualCreditReportClick}>
                Visit Site <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 4: I Already Have My Reports */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg",
              selectedOption === 'upload' 
                ? "border-[3px] border-blue-500 ring-4 ring-blue-100 bg-blue-50" 
                : "border-2 border-gray-300 hover:border-blue-400 hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('upload')}
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-black text-gray-900">I Have My Reports</CardTitle>
                </div>
                <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded uppercase">Upload PDF/HTML</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 mb-4 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">Upload files you already have</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="font-medium">Start free AI analysis instantly</span></li>
              </ul>
              <Button className="w-full h-11 text-sm font-bold bg-orange-500 hover:bg-orange-600 shadow-md" onClick={() => setSelectedOption('upload')}>
                Upload Now <Upload className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {selectedOption === 'upload' && (
          <div className="bg-white border-2 border-gray-300 rounded-xl p-6 mb-8 shadow-lg">
            <h3 className="text-xl font-black text-gray-900 mb-1">Upload Your Reports</h3>
            <p className="text-sm text-gray-600 font-medium mb-6">You can upload a combined 3-bureau report, or individual reports for each bureau.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Combined Upload */}
              <div className="lg:col-span-2 bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <BureauUpload bureau="combined" label="Combined 3-Bureau Report (Recommended)" color="bg-purple-600" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
              </div>

              {/* Individual Uploads */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <BureauUpload bureau="transunion" label="TransUnion" color="bg-red-600" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <BureauUpload bureau="equifax" label="Equifax" color="bg-yellow-600" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
              </div>
              <div className="lg:col-span-2 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <BureauUpload bureau="experian" label="Experian" color="bg-blue-600" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 text-sm rounded-lg p-4 flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Analysis Progress Overlay */}
            {isAnalyzing && (
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">AI Analysis in Progress</h3>
                    <p className="text-sm text-gray-600">{analysisStatus || 'Processing...'}</p>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Progress</span>
                    <span className="font-bold text-orange-600">{analysisProgress}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  This typically takes 15-45 seconds depending on file size
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => handleStartAnalysis()}
                disabled={isAnalyzing || uploadedReports.length === 0}
                className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-orange-500 hover:bg-orange-600 shadow-lg"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing ({analysisProgress}%)...</>
                ) : (
                  <>Start Analysis <ArrowRight className="w-5 h-5 ml-2" /></>
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

const BureauUpload = ({ bureau, label, color, onDrop, uploadedReports, removeFile }: { 
  bureau: 'transunion' | 'equifax' | 'experian' | 'combined'; 
  label: string; 
  color: string; 
  onDrop: (files: File[], bureau: 'transunion' | 'equifax' | 'experian' | 'combined') => void;
  uploadedReports: UploadedReport[];
  removeFile: (bureau: string) => void;
}) => {
  const existingFile = uploadedReports.find(r => r.bureau === bureau);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, bureau),
    accept: { 'application/pdf': ['.pdf'], 'text/html': ['.html', '.htm'] },
    maxFiles: 1,
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-3 h-3 rounded-full shadow-sm", color)} />
        <span className="text-sm font-bold text-gray-800">{label}</span>
      </div>
      {existingFile ? (
        <div className="relative group">
          <div className="flex items-center gap-3 bg-white border-2 border-green-400 rounded-lg p-4 h-[70px] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{existingFile.file.name}</p>
              <p className="text-xs text-gray-600">{(existingFile.file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); removeFile(bureau); }}
              className="p-2 hover:bg-red-100 rounded-full transition-colors border border-gray-300"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg h-[70px] flex flex-col items-center justify-center cursor-pointer transition-all",
            isDragActive 
              ? "border-blue-500 bg-blue-100 shadow-inner" 
              : "border-gray-400 hover:border-blue-500 hover:bg-blue-50 bg-white"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-5 h-5 text-gray-500 mb-1" />
          <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">Drop PDF/HTML</p>
        </div>
      )}
    </div>
  );
};
