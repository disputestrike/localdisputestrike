/**
 * Complete Profile Screen (Step 4 in new onboarding flow)
 * 
 * Collects:
 * - Full Legal Name (First, Middle, Last)
 * - Date of Birth
 * - SSN (full or last 4)
 * - Current Address (USPS validated)
 * - Previous Address (if < 2 years)
 * - Digital Signature
 * - Government ID upload
 * - Utility Bill upload
 */

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  MapPin, 
  FileText, 
  PenTool,
  Shield,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { trpc } from "@/lib/trpc";
import { safeJsonParse } from "@/lib/utils";

interface ProfileData {
  // Personal Info
  firstName: string;
  middleInitial: string;
  lastName: string;
  dateOfBirth: string;
  ssnFull: string;
  phone: string;
  
  // Current Address
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  
  // Previous Address
  hasPreviousAddress: boolean;
  previousAddress: string;
  previousCity: string;
  previousState: string;
  previousZip: string;
  
  // Documents
  idDocument: File | null;
  utilityBill: File | null;
  
  // Signature
  signatureDataUrl: string;
}

const initialData: ProfileData = {
  firstName: '',
  middleInitial: '',
  lastName: '',
  dateOfBirth: '',
  ssnFull: '',
  phone: '',
  currentAddress: '',
  currentCity: '',
  currentState: '',
  currentZip: '',
  hasPreviousAddress: false,
  previousAddress: '',
  previousCity: '',
  previousState: '',
  previousZip: '',
  idDocument: null,
  utilityBill: null,
  signatureDataUrl: '',
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Signature Pad Component
function SignaturePad({ 
  onSave, 
  initialSignature 
}: { 
  onSave: (dataUrl: string) => void;
  initialSignature?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 150;
    
    // Set drawing style
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Load initial signature if exists
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Digital Signature *</Label>
        {hasSignature && (
          <Button variant="ghost" size="sm" onClick={clearSignature}>
            Clear
          </Button>
        )}
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          style={{ height: '150px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Sign here with your mouse or finger</p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Your signature will be used on dispute letters sent to credit bureaus
      </p>
    </div>
  );
}

// File Upload Component
function FileUpload({ 
  label, 
  description,
  file, 
  onDrop, 
  onRemove, 
  error,
  required = true
}: { 
  label: string;
  description?: string;
  file: File | null;
  onDrop: (files: File[]) => void;
  onRemove: () => void;
  error?: string;
  required?: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      
      {file ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : error 
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG (max 10MB)</p>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function CompleteProfile() {
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    }
  });
  const [step, setStep] = useState(1); // 1: Personal, 2: Address, 3: Documents & Signature
  const [data, setData] = useState<ProfileData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSSN, setShowSSN] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 6; // Total steps in the full onboarding flow
  const currentOverallStep = 3 + step; // Steps 4, 5, 6 in overall flow
  const progress = (currentOverallStep / totalSteps) * 100;

  // Load quiz answers from localStorage
  useEffect(() => {
    const quizData = localStorage.getItem('onboardingQuiz');
    if (quizData) {
      const parsed = safeJsonParse(quizData, {});
      console.log('Loaded quiz data:', parsed);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setData(prev => ({ ...prev, ssnFull: formatted }));
    if (errors.ssnFull) {
      setErrors(prev => ({ ...prev, ssnFull: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setData(prev => ({ ...prev, phone: formatted }));
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (stepNum) {
      case 1: // Personal Info
        if (!data.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!data.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!data.ssnFull || data.ssnFull.replace(/\D/g, '').length !== 9) {
          newErrors.ssnFull = 'Valid 9-digit SSN is required';
        }
        if (!data.phone || data.phone.replace(/\D/g, '').length !== 10) {
          newErrors.phone = 'Valid 10-digit phone number is required';
        }
        break;
        
      case 2: // Address
        if (!data.currentAddress.trim()) newErrors.currentAddress = 'Street address is required';
        if (!data.currentCity.trim()) newErrors.currentCity = 'City is required';
        if (!data.currentState) newErrors.currentState = 'State is required';
        if (!data.currentZip || !/^\d{5}(-\d{4})?$/.test(data.currentZip)) {
          newErrors.currentZip = 'Valid ZIP code is required';
        }
        
        if (data.hasPreviousAddress) {
          if (!data.previousAddress.trim()) newErrors.previousAddress = 'Previous address is required';
          if (!data.previousCity.trim()) newErrors.previousCity = 'Previous city is required';
          if (!data.previousState) newErrors.previousState = 'Previous state is required';
          if (!data.previousZip || !/^\d{5}(-\d{4})?$/.test(data.previousZip)) {
            newErrors.previousZip = 'Valid previous ZIP code is required';
          }
        }
        break;
        
      case 3: // Documents & Signature
        if (!data.idDocument) newErrors.idDocument = 'Government ID is required';
        if (!data.utilityBill) newErrors.utilityBill = 'Proof of address is required';
        if (!data.signatureDataUrl) newErrors.signature = 'Digital signature is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      // Submit profile and go to Get Reports screen
      setIsSubmitting(true);
      try {
        // Save profile data to server
        const formData = new FormData();
        
        // Add text fields
        formData.append('firstName', data.firstName);
        formData.append('middleInitial', data.middleInitial);
        formData.append('lastName', data.lastName);
        formData.append('dateOfBirth', data.dateOfBirth);
        formData.append('ssnFull', data.ssnFull);
        formData.append('phone', data.phone);
        formData.append('currentAddress', data.currentAddress);
        formData.append('currentCity', data.currentCity);
        formData.append('currentState', data.currentState);
        formData.append('currentZip', data.currentZip);
        formData.append('hasPreviousAddress', String(data.hasPreviousAddress));
        
        if (data.hasPreviousAddress) {
          formData.append('previousAddress', data.previousAddress);
          formData.append('previousCity', data.previousCity);
          formData.append('previousState', data.previousState);
          formData.append('previousZip', data.previousZip);
        }
        
        formData.append('signatureDataUrl', data.signatureDataUrl);
        
        // Add files
        if (data.idDocument) formData.append('idDocument', data.idDocument);
        if (data.utilityBill) formData.append('utilityBill', data.utilityBill);
        
        const response = await fetch('/api/profile/complete', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to save profile');
        }
        
        // Navigate to Get Reports screen
        setLocation('/get-reports');
      } catch (error) {
        console.error('Error saving profile:', error);
        setErrors({ submit: 'Failed to save profile. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      setLocation('/get-reports');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-2xl">DisputeStrike</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            We need this information to generate your dispute letters
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentOverallStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className="text-primary font-medium">✓ Concern</span>
            <span className="text-primary font-medium">✓ Goal</span>
            <span className="text-primary font-medium">✓ Account</span>
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Profile</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>Address</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>Verify</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-4 mb-6">
          {[
            { num: 1, label: 'Personal', icon: User },
            { num: 2, label: 'Address', icon: MapPin },
            { num: 3, label: 'Verify', icon: FileText },
          ].map(({ num, label, icon: Icon }) => (
            <div 
              key={num}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step === num 
                  ? 'bg-primary text-primary-foreground' 
                  : step > num 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > num ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-red-500"
            onClick={() => logoutMutation.mutate()}
          >
            <X className="w-4 h-4 mr-2" />
            Logout & Start Over
          </Button>
        </div>

        {/* Form Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Your information is encrypted and secure. We need your legal name as it appears on your credit reports.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={data.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="middleInitial">Middle Initial</Label>
                    <Input
                      id="middleInitial"
                      name="middleInitial"
                      value={data.middleInitial}
                      onChange={handleInputChange}
                      placeholder="M"
                      maxLength={1}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={data.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={data.dateOfBirth}
                      onChange={handleInputChange}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={data.phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ssnFull">Social Security Number *</Label>
                  <div className="relative">
                    <Input
                      id="ssnFull"
                      name="ssnFull"
                      type={showSSN ? 'text' : 'password'}
                      value={data.ssnFull}
                      onChange={handleSSNChange}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                      className={`pr-10 ${errors.ssnFull ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSSN(!showSSN)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showSSN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.ssnFull && <p className="text-sm text-red-500 mt-1">{errors.ssnFull}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Required for credit bureau verification. Encrypted with AES-256.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Enter your current mailing address. This is where dispute responses will be sent.</span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Current Address
                  </h3>
                  
                  <div>
                    <Label htmlFor="currentAddress">Street Address *</Label>
                    <Input
                      id="currentAddress"
                      name="currentAddress"
                      value={data.currentAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apt 4B"
                      className={errors.currentAddress ? 'border-red-500' : ''}
                    />
                    {errors.currentAddress && <p className="text-sm text-red-500 mt-1">{errors.currentAddress}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="currentCity">City *</Label>
                      <Input
                        id="currentCity"
                        name="currentCity"
                        value={data.currentCity}
                        onChange={handleInputChange}
                        placeholder="Los Angeles"
                        className={errors.currentCity ? 'border-red-500' : ''}
                      />
                      {errors.currentCity && <p className="text-sm text-red-500 mt-1">{errors.currentCity}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="currentState">State *</Label>
                      <select
                        id="currentState"
                        name="currentState"
                        value={data.currentState}
                        onChange={handleInputChange}
                        className={`w-full h-10 px-3 rounded-md border ${errors.currentState ? 'border-red-500' : 'border-input'} bg-background`}
                      >
                        <option value="">Select</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.currentState && <p className="text-sm text-red-500 mt-1">{errors.currentState}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="currentZip">ZIP Code *</Label>
                      <Input
                        id="currentZip"
                        name="currentZip"
                        value={data.currentZip}
                        onChange={handleInputChange}
                        placeholder="90210"
                        maxLength={10}
                        className={errors.currentZip ? 'border-red-500' : ''}
                      />
                      {errors.currentZip && <p className="text-sm text-red-500 mt-1">{errors.currentZip}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPreviousAddress"
                    checked={data.hasPreviousAddress}
                    onCheckedChange={(checked) => 
                      setData(prev => ({ ...prev, hasPreviousAddress: checked as boolean }))
                    }
                  />
                  <Label htmlFor="hasPreviousAddress" className="text-sm">
                    I've lived at a different address in the past 2 years
                  </Label>
                </div>

                {data.hasPreviousAddress && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Previous Address
                    </h3>
                    
                    <div>
                      <Label htmlFor="previousAddress">Street Address *</Label>
                      <Input
                        id="previousAddress"
                        name="previousAddress"
                        value={data.previousAddress}
                        onChange={handleInputChange}
                        placeholder="456 Oak Avenue"
                        className={errors.previousAddress ? 'border-red-500' : ''}
                      />
                      {errors.previousAddress && <p className="text-sm text-red-500 mt-1">{errors.previousAddress}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="previousCity">City *</Label>
                        <Input
                          id="previousCity"
                          name="previousCity"
                          value={data.previousCity}
                          onChange={handleInputChange}
                          placeholder="San Francisco"
                          className={errors.previousCity ? 'border-red-500' : ''}
                        />
                        {errors.previousCity && <p className="text-sm text-red-500 mt-1">{errors.previousCity}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="previousState">State *</Label>
                        <select
                          id="previousState"
                          name="previousState"
                          value={data.previousState}
                          onChange={handleInputChange}
                          className={`w-full h-10 px-3 rounded-md border ${errors.previousState ? 'border-red-500' : 'border-input'} bg-background`}
                        >
                          <option value="">Select</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        {errors.previousState && <p className="text-sm text-red-500 mt-1">{errors.previousState}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="previousZip">ZIP Code *</Label>
                        <Input
                          id="previousZip"
                          name="previousZip"
                          value={data.previousZip}
                          onChange={handleInputChange}
                          placeholder="94102"
                          maxLength={10}
                          className={errors.previousZip ? 'border-red-500' : ''}
                        />
                        {errors.previousZip && <p className="text-sm text-red-500 mt-1">{errors.previousZip}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Documents & Signature */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Upload your ID and proof of address. These are required by credit bureaus to process disputes.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    label="Government-Issued ID"
                    description="Driver's license, passport, or state ID"
                    file={data.idDocument}
                    onDrop={(files) => setData(prev => ({ ...prev, idDocument: files[0] }))}
                    onRemove={() => setData(prev => ({ ...prev, idDocument: null }))}
                    error={errors.idDocument}
                  />
                  
                  <FileUpload
                    label="Proof of Address"
                    description="Utility bill, bank statement, or lease (within 60 days)"
                    file={data.utilityBill}
                    onDrop={(files) => setData(prev => ({ ...prev, utilityBill: files[0] }))}
                    onRemove={() => setData(prev => ({ ...prev, utilityBill: null }))}
                    error={errors.utilityBill}
                  />
                </div>

                <div className="border-t pt-6">
                  <SignaturePad
                    onSave={(dataUrl) => {
                      setData(prev => ({ ...prev, signatureDataUrl: dataUrl }));
                      if (errors.signature) {
                        setErrors(prev => ({ ...prev, signature: '' }));
                      }
                    }}
                    initialSignature={data.signatureDataUrl}
                  />
                  {errors.signature && <p className="text-sm text-red-500 mt-1">{errors.signature}</p>}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : step === 3 ? (
                  <>
                    Continue to Reports
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-500" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>FCRA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
