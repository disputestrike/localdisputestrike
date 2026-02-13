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
  const [hasCreditReport, setHasCreditReport] = useState<'yes' | 'no' | null>(null);
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

  // File upload handler — supports 1 file (combined) or 3 files (TU, EQ, EX)
  const onDrop = useCallback((acceptedFiles: File[], bureau: 'transunion' | 'equifax' | 'experian' | 'combined') => {
    if (acceptedFiles.length > 0) {
      setError(null); // clear previous network/upload error when user adds a file
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
      
      const uploadUrl = `${window.location.origin}/api/credit-reports/upload-and-analyze`;
      // 3-file upload + server AI can take 3–5 min; use 6 min so we don't abort early
      const UPLOAD_TIMEOUT_MS = 6 * 60 * 1000;
      const ac = new AbortController();
      const timeoutId = setTimeout(() => ac.abort(), UPLOAD_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
          signal: ac.signal,
        });
      } finally {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string; message?: string; suggestion?: string };
        const msg = data?.error || data?.message || `Upload failed (${response.status})`;
        const extra = data?.suggestion ? ` ${data.suggestion}` : '';
        throw new Error(msg + extra);
      }

      setAnalysisProgress(100);
      setAnalysisStatus('Analysis complete!');
      
      const data = await response.json();
      const json = JSON.stringify(data);
      sessionStorage.setItem('previewAnalysis', json);
      localStorage.setItem('previewAnalysis', json);
      
      // Brief delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      setLocation('/preview-results');
    } catch (e: any) {
      const msg = e?.message ?? '';
      const isAbort = e?.name === 'AbortError' || msg.toLowerCase().includes('abort');
      const isNetwork = !msg || msg === 'Failed to fetch' || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('Load failed');
      if (isAbort || isNetwork) {
        setError('Connection lost or request timed out. Analysis of 3 reports can take 3–5 minutes. Click "Retry upload" or try again.');
      } else {
        setError(msg || 'Upload failed. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Centered logo at top - like reference (logo in the middle) */}
      <div className="flex flex-col items-center justify-center pt-12 pb-6 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-14 w-14" />
          <span className="text-2xl md:text-3xl font-black text-gray-900">DisputeStrike</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 text-center">Get Your Credit Reports</h1>
        <p className="text-gray-600 text-sm font-medium text-center">We need your 3-bureau credit report to analyze for violations</p>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 px-4 pb-12">

        <div className="mb-12 bg-white border-2 border-border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Radio question - Do you have your credit report? */}
        {hasCreditReport === null && (
          <Card className="mb-8 border-2 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Do you have your credit report?</CardTitle>
              <CardDescription>Choose the option that applies to you. We'll show you the right next steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  hasCreditReport === 'yes' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-gray-50"
                )}
                onClick={() => setHasCreditReport('yes')}
              >
                <input 
                  type="radio" 
                  name="hasReport" 
                  checked={hasCreditReport === 'yes'} 
                  onChange={() => setHasCreditReport('yes')}
                  className="w-5 h-5 text-primary"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Yes, I have my credit report</p>
                  <p className="text-sm text-gray-600">I have a PDF or file ready to upload</p>
                </div>
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  hasCreditReport === 'no' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-gray-50"
                )}
                onClick={() => setHasCreditReport('no')}
              >
                <input 
                  type="radio" 
                  name="hasReport" 
                  checked={hasCreditReport === 'no'} 
                  onChange={() => setHasCreditReport('no')}
                  className="w-5 h-5 text-primary"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">No, I need to get my credit report</p>
                  <p className="text-sm text-gray-600">Show me options like SmartCredit, Credit Hero, or AnnualCreditReport</p>
                </div>
                <ExternalLink className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2A: Upload only - when user has report */}
        {hasCreditReport === 'yes' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={() => setHasCreditReport(null)} className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change answer
              </Button>
            </div>
            <div className="bg-white border-2 border-border rounded-xl p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-1">Upload Your Reports</h3>
              <p className="text-sm text-gray-600 font-medium mb-6">You can upload a combined 3-bureau report (one PDF) or three separate reports (TransUnion, Equifax, Experian).</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="lg:col-span-2 bg-primary/5 border-2 border-border rounded-lg p-4">
                  <BureauUpload bureau="combined" label="Combined 3-Bureau Report (Recommended)" color="bg-primary" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
                </div>
                <div className="bg-primary/5 border-2 border-border rounded-lg p-4">
                  <BureauUpload bureau="transunion" label="TransUnion" color="bg-primary" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
                </div>
                <div className="bg-accent/5 border-2 border-border rounded-lg p-4">
                  <BureauUpload bureau="equifax" label="Equifax" color="bg-accent" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
                </div>
                <div className="lg:col-span-2 bg-primary/5 border-2 border-border rounded-lg p-4">
                  <BureauUpload bureau="experian" label="Experian" color="bg-primary" onDrop={onDrop} uploadedReports={uploadedReports} removeFile={removeFile} />
                </div>
              </div>

              {error && (
                <div className="bg-accent/10 border-2 border-border text-accent text-sm rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-border text-accent hover:bg-accent/10"
                    onClick={() => { setError(null); handleStartAnalysis(); }}
                    disabled={isAnalyzing || uploadedReports.length === 0}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      "Retry upload"
                    )}
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="mb-6 bg-accent/5 border-2 border-border rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center animate-pulse">
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
                      <span className="font-bold text-accent">{analysisProgress}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    This typically takes 1-3 minutes depending on file size
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleStartAnalysis()}
                  disabled={isAnalyzing || uploadedReports.length === 0}
                  className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-accent hover:bg-accent/90 shadow-lg"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing ({analysisProgress}%)...</>
                  ) : (
                    <>Start Analysis <ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2B: 3 options only - when user needs to get report */}
        {hasCreditReport === 'no' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={() => setHasCreditReport(null)} className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change answer
              </Button>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-stretch">
          {/* Option 1: SmartCredit (RECOMMENDED) */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg flex flex-col h-full min-h-[280px]",
              selectedOption === 'smartcredit' 
                ? "border-[3px] border-accent ring-4 ring-accent/20 bg-accent/5" 
                : "border-2 border-border hover:border-accent hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('smartcredit')}
          >
            <div className="absolute -top-3 left-4 bg-accent text-white text-[11px] font-black px-3 py-1 rounded-full uppercase shadow-md">
              Recommended
            </div>
            <CardHeader className="pb-2 pt-6 px-4 shrink-0">
                <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-md shrink-0">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                  <CardTitle className="text-base font-black text-gray-900">SmartCredit</CardTitle>
                </div>
                <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase">$29.99/mo</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex-1 flex flex-col">
              <ul className="text-xs text-gray-700 mb-3 space-y-1 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> <span className="font-medium">All 3 bureaus in one place</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> <span className="font-medium">Daily monitoring + Score tracking</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> <span className="font-medium">Easy PDF export for upload</span></li>
              </ul>
              <Button className="w-full h-10 text-xs font-bold bg-accent hover:bg-accent/90 shadow-md mt-auto shrink-0" onClick={handleSmartCreditClick}>
                Get SmartCredit <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Credit Hero */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg flex flex-col h-full min-h-[280px]",
              selectedOption === 'credithero' 
                ? "border-[3px] border-primary ring-4 ring-primary/20 bg-primary/5" 
                : "border-2 border-border hover:border-primary hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('credithero')}
          >
            <CardHeader className="pb-2 pt-4 px-4 shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3 text-primary" />
                  </div>
                  <CardTitle className="text-base font-black text-gray-900">Credit Hero</CardTitle>
                </div>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">One-Time Fee</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex-1 flex flex-col">
              <ul className="text-xs text-gray-700 mb-3 space-y-1 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> <span className="font-medium">1 combined file with all 3 bureaus</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> <span className="font-medium">Fast & easy upload</span></li>
              </ul>
              <Button variant="outline" className="w-full h-10 text-xs font-bold border-2 border-primary text-primary hover:bg-primary/10 mt-auto shrink-0" onClick={handleCreditHeroClick}>
                Get Credit Hero <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 3: AnnualCreditReport (FREE) */}
          <Card 
            className={cn(
              "relative cursor-pointer transition-all shadow-lg flex flex-col h-full min-h-[280px]",
              selectedOption === 'annual' 
                ? "border-[3px] border-primary ring-4 ring-primary/20 bg-primary/5" 
                : "border-2 border-border hover:border-primary hover:shadow-xl bg-white"
            )}
            onClick={() => setSelectedOption('annual')}
          >
            <CardHeader className="pb-2 pt-4 px-4 shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <CardTitle className="text-base font-black text-gray-900">AnnualCreditReport</CardTitle>
                </div>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">FREE • Gov</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex-1 flex flex-col">
              <ul className="text-xs text-gray-700 mb-3 space-y-1 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> <span className="font-medium">Government-mandated free reports</span></li>
                <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-accent shrink-0" /> <span className="font-medium">Once per year per bureau</span></li>
              </ul>
              <Button variant="outline" className="w-full h-10 text-xs font-bold border-2 border-primary text-primary hover:bg-primary/10 mt-auto shrink-0" onClick={handleAnnualCreditReportClick}>
                Visit Site <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
          </>
        )}

        <div className="text-center mt-12">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Where can I get my credit reports?</h3>
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>SmartCredit.com - Instant access to all 3 bureaus</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
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
              ? "border-primary bg-primary/10 shadow-inner" 
              : "border-2 border-border hover:border-primary hover:bg-primary/5 bg-white"
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
