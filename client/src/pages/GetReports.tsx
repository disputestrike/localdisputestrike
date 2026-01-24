/**
 * Get Your Reports Screen (Step 5 in new onboarding flow)
 * 
 * Two options:
 * 1. SmartCredit Affiliate Link (recommended) - FREE analysis
 * 2. Direct Upload - FREE preview analysis
 */

import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

// SmartCredit Affiliate Link
const SMARTCREDIT_AFFILIATE_URL = 'https://www.smartcredit.com/?PID=87529';

// Initialize Stripe
interface UploadedReport {
  bureau: 'transunion' | 'equifax' | 'experian';
  file: File;
}

export default function GetReports() {
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<'smartcredit' | 'upload' | null>(null);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 6;
  const currentStep = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Handle SmartCredit link click
  const handleSmartCreditClick = async () => {
    // Track affiliate click
    try {
      await fetch('/api/affiliate/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'smartcredit' }),
      });
    } catch (e) {
      console.error('Failed to track affiliate click:', e);
    }
    
    // Open SmartCredit in new tab
    window.open(SMARTCREDIT_AFFILIATE_URL, '_blank');
    
    // Set selected option
    setSelectedOption('smartcredit');
  };


  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[], bureau: 'transunion' | 'equifax' | 'experian') => {
    if (acceptedFiles.length > 0) {
      setUploadedReports(prev => {
        // Remove existing file for this bureau
        const filtered = prev.filter(r => r.bureau !== bureau);
        return [...filtered, { bureau, file: acceptedFiles[0] }];
      });
    }
  }, []);

  // Remove uploaded file
  const removeFile = (bureau: string) => {
    setUploadedReports(prev => prev.filter(r => r.bureau !== bureau));
  };

  // Start FREE AI analysis
  const handleStartAnalysis = async () => {
    if (uploadedReports.length === 0) {
      setError('Please upload at least one credit report');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Upload files and start analysis
      const formData = new FormData();
      uploadedReports.forEach(report => {
        formData.append(report.bureau, report.file);
      });
      
      const response = await fetch('/api/credit-reports/upload-and-analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload reports');
      }
      
      // Navigate to analysis page
      setLocation('/credit-analysis');
    } catch (e) {
      setError('Failed to upload reports. Please try again.');
      console.error('Upload error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File upload component for each bureau
  const BureauUpload = ({ bureau, label }: { bureau: 'transunion' | 'equifax' | 'experian'; label: string }) => {
    const existingFile = uploadedReports.find(r => r.bureau === bureau);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, bureau),
      accept: {
        'application/pdf': ['.pdf'],
        'text/html': ['.html', '.htm'],
      },
      maxFiles: 1,
      maxSize: 50 * 1024 * 1024, // 50MB
    });

    const bureauColors = {
      transunion: 'blue',
      equifax: 'red',
      experian: 'purple',
    };
    const color = bureauColors[bureau];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
          {label}
        </label>
        
        {existingFile ? (
          <div className={`flex items-center justify-between bg-${color}-50 border border-${color}-200 rounded-lg p-3`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 text-${color}-500`} />
              <div>
                <p className="text-sm font-medium truncate max-w-[150px]">{existingFile.file.name}</p>
                <p className="text-xs text-muted-foreground">{(existingFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeFile(bureau)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? `border-${color}-500 bg-${color}-50` 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-500">Drop PDF or HTML</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-2xl">DisputeStrike</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Get Your Credit Reports
          </h1>
          <p className="text-muted-foreground">
            We need your 3-bureau credit report to analyze for violations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Option A: SmartCredit (Recommended) */}
          <Card 
            className={`border-2 cursor-pointer transition-all ${
              selectedOption === 'smartcredit' 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('smartcredit')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">RECOMMENDED</span>
                </div>
      
              </div>
              <CardTitle className="text-lg">Get Reports via SmartCredit</CardTitle>
              <CardDescription>
                Sign up for SmartCredit and get instant access to all 3 bureaus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>All 3 bureau reports instantly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Daily credit monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Score tracking & alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>FREE AI analysis included</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSmartCreditClick();
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get SmartCredit
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                Opens in new tab. Return here after signup.
              </p>
            </CardContent>
          </Card>

          {/* Option B: Direct Upload (FREE Preview) */}
          <Card 
            className={`border-2 cursor-pointer transition-all ${
              selectedOption === 'upload' 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('upload')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-green-600">FREE</span>
              </div>
              <CardTitle className="text-lg">Option 2: Already Have Reports?</CardTitle>
              <CardDescription>
                Upload your existing reports for FREE preview analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
	                  <span>✅ FREE preview (violation count only)</span>
	                </li>
	                <li className="flex items-center gap-2">
	                  <CheckCircle2 className="w-4 h-4 text-green-500" />
	                  <span>✅ No credit card required</span>
	                </li>
	                <li className="flex items-center gap-2">
	                  <CheckCircle2 className="w-4 h-4 text-green-500" />
	                  <span>✅ Instant analysis</span>
	                </li>
	                <li className="flex items-center gap-2">
	                  <CheckCircle2 className="w-4 h-4 text-green-500" />
	                  <span>✅ Upgrade to see full details</span>
                </li>
              </ul>
              
              <Button 
	                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption('upload');
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
	                Upload Reports (FREE Preview)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* SmartCredit Return Flow */}
        {selectedOption === 'smartcredit' && (
          <Card className="border-2 border-green-200 bg-green-50 mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Signed up for SmartCredit? Great!
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  After signing up for SmartCredit, download your credit reports and upload them below:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BureauUpload bureau="transunion" label="TransUnion" />
                  <BureauUpload bureau="equifax" label="Equifax" />
                  <BureauUpload bureau="experian" label="Experian" />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white p-3 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Upload at least one report to continue. More reports = more violations found.</span>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleStartAnalysis}
                  disabled={uploadedReports.length === 0 || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Reports...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Start FREE AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

	        {/* Direct Upload Flow (FREE Preview) */}
        {selectedOption === 'upload' && (
          <Card className="border-2 border-blue-200 bg-blue-50 mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
	                Upload Your Reports for FREE Preview
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload your credit reports from AnnualCreditReport.com or any other source:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BureauUpload bureau="transunion" label="TransUnion" />
                  <BureauUpload bureau="equifax" label="Equifax" />
                  <BureauUpload bureau="experian" label="Experian" />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white p-3 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Upload at least one report to continue. More reports = more violations found.</span>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleStartAnalysis}
                  disabled={uploadedReports.length === 0 || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Reports...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Start FREE AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Where to Get Reports Info */}
        <Card className="border bg-muted/50 mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Where can I get my credit reports?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span><strong>SmartCredit.com</strong> - Instant access to all 3 bureaus</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span><strong>AnnualCreditReport.com</strong> - Free once per year from each bureau</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => setLocation('/complete-profile')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span>Analysis in 60 Seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-500" />
	            <span>Comprehensive Violation Detection</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-xs text-muted-foreground max-w-lg mx-auto">
          <p>
	            DisputeStrike is not affiliated with SmartCredit, AnnualCreditReport.com, IdentityIQ, or the credit bureaus. 

            We are a software tool that helps you dispute inaccurate information on your credit reports.
            Results not guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
