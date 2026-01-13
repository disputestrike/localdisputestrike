/**
 * $1 Trial Checkout Page
 * 
 * Combined sign-up + payment page for the $1 trial
 * Collects: Email, Password, Full Name, DOB, SSN, Address, Payment
 * After payment: Pulls credit data via IdentityIQ and shows analysis
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Shield, Lock, CreditCard, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface FormData {
  // Account
  email: string;
  password: string;
  confirmPassword: string;
  
  // Personal Info (required for credit pull)
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Consent
  agreeToTerms: boolean;
  authorizeCreditPull: boolean;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  dateOfBirth: '',
  ssn: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  agreeToTerms: false,
  authorizeCreditPull: false,
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function TrialCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  // Get quiz results from navigation state (if coming from quiz)
  const quizResults = location.state?.quizResults;

  const createTrialMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/trial/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create trial');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      setErrors({ email: error.message });
      setStep('form');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const formatSSN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXX-XX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setFormData(prev => ({ ...prev, ssn: formatted }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Personal info
    if (!formData.fullName) {
      newErrors.fullName = 'Full legal name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.ssn) {
      newErrors.ssn = 'SSN is required for credit pull';
    } else if (formData.ssn.replace(/\D/g, '').length !== 9) {
      newErrors.ssn = 'SSN must be 9 digits';
    }
    
    // Address
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    // Consent
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    if (!formData.authorizeCreditPull) {
      newErrors.authorizeCreditPull = 'You must authorize the credit pull';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStep('processing');
    createTrialMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            See Your Real Credit Analysis
          </h1>
          <p className="text-slate-400 text-lg">
            Get instant access to your 3-bureau credit data + AI recommendations
          </p>
          
          {/* Price badge */}
          <div className="mt-4 inline-flex items-center bg-emerald-500/20 border border-emerald-500/30 rounded-full px-6 py-2">
            <span className="text-emerald-400 font-bold text-2xl">$1</span>
            <span className="text-slate-400 ml-2">for 7 days</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Then $69.95/mo if you continue. Cancel anytime.
          </p>
        </div>

        {/* What you get */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">What you'll see:</h3>
          <ul className="space-y-3">
            {[
              'Real credit scores from TransUnion, Equifax & Experian',
              'All negative items hurting your score',
              'AI-recommended items to dispute (with win probability)',
              'Estimated score increase potential',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-sm">1</span>
                Create Account
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-sm">2</span>
                Personal Information
                <span className="text-slate-500 text-sm font-normal ml-2">(Required for credit pull)</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-900 border ${errors.fullName ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                    placeholder="John Michael Smith"
                  />
                  {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-900 border ${errors.dateOfBirth ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                    />
                    {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Social Security Number</label>
                    <div className="relative">
                      <input
                        type={showSSN ? 'text' : 'password'}
                        name="ssn"
                        value={formData.ssn}
                        onChange={handleSSNChange}
                        maxLength={11}
                        className={`w-full bg-slate-900 border ${errors.ssn ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 pr-10`}
                        placeholder="XXX-XX-XXXX"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSSN(!showSSN)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showSSN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.ssn && <p className="text-red-400 text-sm mt-1">{errors.ssn}</p>}
                  </div>
                </div>
                
                {/* Security notice */}
                <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3">
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-400 text-sm">
                    Your SSN is encrypted and only used to pull your credit reports. We never store your full SSN.
                  </p>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-sm">3</span>
                Current Address
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-900 border ${errors.address ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                    placeholder="123 Main Street, Apt 4B"
                  />
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-900 border ${errors.city ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-900 border ${errors.state ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                    >
                      <option value="">Select</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      maxLength={10}
                      className={`w-full bg-slate-900 border ${errors.zipCode ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500`}
                      placeholder="10001"
                    />
                    {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Consent & Payment */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-sm">4</span>
                Authorization & Payment
              </h3>
              
              <div className="space-y-4">
                {/* Consent checkboxes */}
                <label className={`flex items-start gap-3 cursor-pointer ${errors.authorizeCreditPull ? 'text-red-400' : ''}`}>
                  <input
                    type="checkbox"
                    name="authorizeCreditPull"
                    checked={formData.authorizeCreditPull}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 text-sm">
                    I authorize DisputeStrike to pull my credit reports from TransUnion, Equifax, and Experian for the purpose of credit analysis and dispute letter generation.
                  </span>
                </label>
                
                <label className={`flex items-start gap-3 cursor-pointer ${errors.agreeToTerms ? 'text-red-400' : ''}`}>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 text-sm">
                    I agree to the <a href="/terms" className="text-emerald-400 underline">Terms of Service</a> and <a href="/privacy" className="text-emerald-400 underline">Privacy Policy</a>. I understand this is a 7-day trial for $1, and I will be charged $69.95/month if I don't cancel.
                  </span>
                </label>
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={createTrialMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Get My Analysis - $1
                </button>
                
                <p className="text-center text-slate-500 text-sm">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Processing state */}
        {step === 'processing' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Creating your account...</h3>
            <p className="text-slate-400">Redirecting to secure payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}
