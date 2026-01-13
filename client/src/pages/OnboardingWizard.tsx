/**
 * Onboarding Wizard
 * 
 * 5-step wizard for new paid users:
 * 1. Personal Info (name, DOB, SSN)
 * 2. Address (current + previous)
 * 3. Identity Documents (ID, utility bill)
 * 4. Credit Reports (upload or auto-pull)
 * 5. Review & Start Round 1
 */

import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { 
  User, 
  MapPin, 
  FileText, 
  CreditCard, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Shield,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface OnboardingData {
  // Step 1: Personal Info
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  phone: string;
  
  // Step 2: Address
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  previousAddress: string;
  previousCity: string;
  previousState: string;
  previousZip: string;
  hasPreviousAddress: boolean;
  
  // Step 3: Documents
  idDocument: File | null;
  utilityBill: File | null;
  
  // Step 4: Credit Reports
  creditReportMethod: 'auto' | 'manual';
  transunionReport: File | null;
  equifaxReport: File | null;
  experianReport: File | null;
}

const initialData: OnboardingData = {
  fullName: '',
  dateOfBirth: '',
  ssn: '',
  phone: '',
  currentAddress: '',
  currentCity: '',
  currentState: '',
  currentZip: '',
  previousAddress: '',
  previousCity: '',
  previousState: '',
  previousZip: '',
  hasPreviousAddress: false,
  idDocument: null,
  utilityBill: null,
  creditReportMethod: 'auto',
  transunionReport: null,
  equifaxReport: null,
  experianReport: null,
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Address', icon: MapPin },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Credit Reports', icon: CreditCard },
  { id: 5, title: 'Review', icon: CheckCircle },
];

export default function OnboardingWizard() {
  const [, setLocation] = useLocation();
  const navigate = setLocation;
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSSN, setShowSSN] = useState(false);

  // Check if user already has profile data
  const { data: existingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Pre-fill data if exists
  useState(() => {
    if (existingProfile) {
      setData(prev => ({
        ...prev,
        fullName: existingProfile.fullName || '',
        dateOfBirth: existingProfile.dateOfBirth || '',
        phone: existingProfile.phone || '',
        currentAddress: existingProfile.currentAddress || '',
        currentCity: existingProfile.currentCity || '',
        currentState: existingProfile.currentState || '',
        currentZip: existingProfile.currentZip || '',
      }));
    }
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (stepData: Partial<OnboardingData>) => {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(stepData).forEach(([key, value]) => {
        if (value !== null && !(value instanceof File)) {
          formData.append(key, String(value));
        }
      });
      
      // Add files
      if (stepData.idDocument) formData.append('idDocument', stepData.idDocument);
      if (stepData.utilityBill) formData.append('utilityBill', stepData.utilityBill);
      if (stepData.transunionReport) formData.append('transunionReport', stepData.transunionReport);
      if (stepData.equifaxReport) formData.append('equifaxReport', stepData.equifaxReport);
      if (stepData.experianReport) formData.append('experianReport', stepData.experianReport);
      
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to save progress');
      return response.json();
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

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
    setData(prev => ({ ...prev, ssn: formatted }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!data.fullName) newErrors.fullName = 'Full name is required';
        if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!data.ssn || data.ssn.replace(/\D/g, '').length !== 9) {
          newErrors.ssn = 'Valid SSN is required';
        }
        break;
        
      case 2:
        if (!data.currentAddress) newErrors.currentAddress = 'Address is required';
        if (!data.currentCity) newErrors.currentCity = 'City is required';
        if (!data.currentState) newErrors.currentState = 'State is required';
        if (!data.currentZip) newErrors.currentZip = 'ZIP code is required';
        break;
        
      case 3:
        if (!data.idDocument) newErrors.idDocument = 'ID document is required';
        if (!data.utilityBill) newErrors.utilityBill = 'Utility bill is required';
        break;
        
      case 4:
        if (data.creditReportMethod === 'manual') {
          if (!data.transunionReport && !data.equifaxReport && !data.experianReport) {
            newErrors.creditReports = 'At least one credit report is required';
          }
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    
    // Save progress
    await saveProgressMutation.mutateAsync(data);
    
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      completeOnboardingMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // File upload component
  const FileUpload = ({ 
    label, 
    file, 
    onDrop, 
    onRemove, 
    accept,
    error 
  }: { 
    label: string;
    file: File | null;
    onDrop: (files: File[]) => void;
    onRemove: () => void;
    accept: Record<string, string[]>;
    error?: string;
  }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => onDrop(acceptedFiles),
      accept,
      maxFiles: 1,
    });

    return (
      <div>
        <label className="block text-gray-700 text-sm mb-2">{label}</label>
        {file ? (
          <div className="flex items-center justify-between bg-white border border-orange-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-gray-900 text-sm">{file.name}</p>
                <p className="text-gray-600 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button onClick={onRemove} className="text-gray-600 hover:text-red-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-orange-600 bg-orange-600/10' 
                : error 
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-300 hover:border-orange-300'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-orange-500' : 'text-gray-600'}`} />
            <p className="text-gray-700 text-sm">
              {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-gray-500 text-xs mt-1">PDF, JPG, or PNG</p>
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Setup</h1>
          <p className="text-gray-600">Just a few more steps before we can start your credit repair</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isComplete 
                      ? 'bg-orange-600 text-gray-900'
                      : isActive
                        ? 'bg-orange-600/20 border-2 border-orange-600 text-orange-500'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-orange-600' : 'bg-gray-100'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6 mb-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Personal Information</h2>
                <p className="text-gray-600 text-sm">This information is required to pull your credit reports and generate dispute letters.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={data.fullName}
                    onChange={handleInputChange}
                    className={`w-full bg-white border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600`}
                    placeholder="John Michael Smith"
                  />
                  {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={data.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600`}
                    />
                    {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={data.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Social Security Number</label>
                  <div className="relative">
                    <input
                      type={showSSN ? 'text' : 'password'}
                      name="ssn"
                      value={data.ssn}
                      onChange={handleSSNChange}
                      maxLength={11}
                      className={`w-full bg-white border ${errors.ssn ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600 pr-10`}
                      placeholder="XXX-XX-XXXX"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSSN(!showSSN)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                    >
                      {showSSN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.ssn && <p className="text-red-400 text-sm mt-1">{errors.ssn}</p>}
                </div>
                
                <div className="flex items-start gap-2 bg-white/50 rounded-lg p-3">
                  <Lock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Your SSN is encrypted with AES-256 and only used to verify your identity with credit bureaus.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Address Information</h2>
                <p className="text-gray-600 text-sm">Bureaus use your address to verify your identity. Include previous addresses if you've moved in the last 2 years.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-gray-900 font-medium">Current Address</h3>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Street Address</label>
                  <input
                    type="text"
                    name="currentAddress"
                    value={data.currentAddress}
                    onChange={handleInputChange}
                    className={`w-full bg-white border ${errors.currentAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600`}
                    placeholder="123 Main Street, Apt 4B"
                  />
                  {errors.currentAddress && <p className="text-red-400 text-sm mt-1">{errors.currentAddress}</p>}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">City</label>
                    <input
                      type="text"
                      name="currentCity"
                      value={data.currentCity}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.currentCity ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600`}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">State</label>
                    <select
                      name="currentState"
                      value={data.currentState}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.currentState ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600`}
                    >
                      <option value="">Select</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">ZIP</label>
                    <input
                      type="text"
                      name="currentZip"
                      value={data.currentZip}
                      onChange={handleInputChange}
                      maxLength={10}
                      className={`w-full bg-white border ${errors.currentZip ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600`}
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasPreviousAddress"
                    checked={data.hasPreviousAddress}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-gray-300 bg-white text-orange-600"
                  />
                  <span className="text-gray-700">I have a previous address (moved in last 2 years)</span>
                </label>
                
                {data.hasPreviousAddress && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-gray-900 font-medium">Previous Address</h3>
                    
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Street Address</label>
                      <input
                        type="text"
                        name="previousAddress"
                        value={data.previousAddress}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">City</label>
                        <input
                          type="text"
                          name="previousCity"
                          value={data.previousCity}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">State</label>
                        <select
                          name="previousState"
                          value={data.previousState}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600"
                        >
                          <option value="">Select</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">ZIP</label>
                        <input
                          type="text"
                          name="previousZip"
                          value={data.previousZip}
                          onChange={handleInputChange}
                          maxLength={10}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Identity Documents</h2>
                <p className="text-gray-600 text-sm">These documents will be attached to your dispute letters to verify your identity with the bureaus.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload
                  label="Government-Issued ID (Driver's License, Passport, or State ID)"
                  file={data.idDocument}
                  onDrop={(files) => setData(prev => ({ ...prev, idDocument: files[0] }))}
                  onRemove={() => setData(prev => ({ ...prev, idDocument: null }))}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }}
                  error={errors.idDocument}
                />
                
                <FileUpload
                  label="Proof of Address (Utility Bill, Bank Statement)"
                  file={data.utilityBill}
                  onDrop={(files) => setData(prev => ({ ...prev, utilityBill: files[0] }))}
                  onRemove={() => setData(prev => ({ ...prev, utilityBill: null }))}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }}
                  error={errors.utilityBill}
                />
              </div>
              
              <div className="flex items-start gap-2 bg-white/50 rounded-lg p-3">
                <Shield className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">
                  Your documents are encrypted and stored securely. They are only used for dispute letter verification.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Credit Reports */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Credit Reports</h2>
                <p className="text-gray-600 text-sm">We need your credit reports to analyze negative items and generate dispute letters.</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setData(prev => ({ ...prev, creditReportMethod: 'auto' }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.creditReportMethod === 'auto'
                        ? 'border-orange-600 bg-orange-600/10'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        data.creditReportMethod === 'auto' ? 'border-orange-600' : 'border-gray-300'
                      }`}>
                        {data.creditReportMethod === 'auto' && (
                          <div className="w-3 h-3 rounded-full bg-orange-600" />
                        )}
                      </div>
                      <span className="text-gray-900 font-semibold">Auto-Pull (Recommended)</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-8">
                      We'll automatically pull your reports from all 3 bureaus using your monitoring service.
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setData(prev => ({ ...prev, creditReportMethod: 'manual' }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.creditReportMethod === 'manual'
                        ? 'border-orange-600 bg-orange-600/10'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        data.creditReportMethod === 'manual' ? 'border-orange-600' : 'border-gray-300'
                      }`}>
                        {data.creditReportMethod === 'manual' && (
                          <div className="w-3 h-3 rounded-full bg-orange-600" />
                        )}
                      </div>
                      <span className="text-gray-900 font-semibold">Manual Upload</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-8">
                      Upload credit reports you've downloaded from AnnualCreditReport.com or other sources.
                    </p>
                  </button>
                </div>
                
                {data.creditReportMethod === 'manual' && (
                  <div className="space-y-4 pt-4">
                    <FileUpload
                      label="TransUnion Report"
                      file={data.transunionReport}
                      onDrop={(files) => setData(prev => ({ ...prev, transunionReport: files[0] }))}
                      onRemove={() => setData(prev => ({ ...prev, transunionReport: null }))}
                      accept={{ 'application/pdf': ['.pdf'] }}
                    />
                    
                    <FileUpload
                      label="Equifax Report"
                      file={data.equifaxReport}
                      onDrop={(files) => setData(prev => ({ ...prev, equifaxReport: files[0] }))}
                      onRemove={() => setData(prev => ({ ...prev, equifaxReport: null }))}
                      accept={{ 'application/pdf': ['.pdf'] }}
                    />
                    
                    <FileUpload
                      label="Experian Report"
                      file={data.experianReport}
                      onDrop={(files) => setData(prev => ({ ...prev, experianReport: files[0] }))}
                      onRemove={() => setData(prev => ({ ...prev, experianReport: null }))}
                      accept={{ 'application/pdf': ['.pdf'] }}
                    />
                    
                    {errors.creditReports && (
                      <p className="text-red-400 text-sm">{errors.creditReports}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Review & Start</h2>
                <p className="text-gray-600 text-sm">Please review your information before we start analyzing your credit.</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <h3 className="text-gray-600 text-sm mb-2">Personal Information</h3>
                  <p className="text-gray-900">{data.fullName}</p>
                  <p className="text-gray-700 text-sm">DOB: {data.dateOfBirth}</p>
                  <p className="text-gray-700 text-sm">SSN: ***-**-{data.ssn.slice(-4)}</p>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4">
                  <h3 className="text-gray-600 text-sm mb-2">Address</h3>
                  <p className="text-gray-900">{data.currentAddress}</p>
                  <p className="text-gray-700 text-sm">{data.currentCity}, {data.currentState} {data.currentZip}</p>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4">
                  <h3 className="text-gray-600 text-sm mb-2">Documents</h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-900 text-sm">ID Document: {data.idDocument?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-900 text-sm">Utility Bill: {data.utilityBill?.name}</span>
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4">
                  <h3 className="text-gray-600 text-sm mb-2">Credit Reports</h3>
                  <p className="text-gray-900">
                    {data.creditReportMethod === 'auto' 
                      ? 'Auto-pull from monitoring service'
                      : `Manual upload (${[data.transunionReport, data.equifaxReport, data.experianReport].filter(Boolean).length} reports)`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-semibold">Ready to Start Round 1</p>
                  <p className="text-gray-700 text-sm">
                    After you click "Start Credit Repair", we'll analyze your credit reports and generate your first round of dispute letters.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={saveProgressMutation.isPending || completeOnboardingMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-gray-900 px-8 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            {(saveProgressMutation.isPending || completeOnboardingMutation.isPending) && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {currentStep === 5 ? 'Start Credit Repair' : 'Continue'}
            {currentStep < 5 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
