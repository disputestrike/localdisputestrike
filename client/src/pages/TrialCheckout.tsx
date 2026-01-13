/**
 * $1 Trial Checkout Page
 * 
 * Combined sign-up + payment page for the $1 trial
 * Collects: Email, Password, Full Name, DOB, SSN, Address, Payment
 * After payment: Pulls credit data via IdentityIQ and shows analysis
 */

import { useState } from 'react';
import { useLocation, Link } from 'wouter';
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
  const [location, setLocation] = useLocation();
  const navigate = setLocation;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

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
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
    setFormData(prev => ({ ...prev, ssn: formatted }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.fullName) newErrors.fullName = 'Full legal name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    if (!formData.ssn) {
      newErrors.ssn = 'SSN is required for credit pull';
    } else if (formData.ssn.replace(/\D/g, '').length !== 9) {
      newErrors.ssn = 'SSN must be 9 digits';
    }
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    if (!formData.authorizeCreditPull) newErrors.authorizeCreditPull = 'You must authorize the credit pull';
    
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <a className="text-gray-600 hover:text-orange-600 text-sm">View Pricing</a>
            </Link>
            <Link href="/">
              <a className="text-gray-600 hover:text-orange-600 text-sm">Back to Home</a>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            See Your Real Credit Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Get instant access to your 3-bureau credit data + AI recommendations
          </p>
          
          {/* Price badge */}
          <div className="mt-4 inline-flex items-center bg-orange-100 border border-orange-200 rounded-full px-6 py-2">
            <span className="text-orange-600 font-bold text-2xl">$1</span>
            <span className="text-gray-600 ml-2">for 7 days</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Then $69.95/mo if you continue. Cancel anytime.
          </p>
        </div>

        {/* What you get */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-4">What you'll see:</h3>
          <ul className="space-y-3">
            {[
              'Real credit scores from TransUnion, Equifax & Experian',
              'All negative items hurting your score',
              'AI-recommended items to dispute (with win probability)',
              'Estimated score increase potential',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Create Account
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Personal Information
                <span className="text-gray-400 text-sm font-normal">(Required for credit pull)</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full bg-white border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                    placeholder="John Michael Smith"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Social Security Number</label>
                    <div className="relative">
                      <input
                        type={showSSN ? 'text' : 'password'}
                        name="ssn"
                        value={formData.ssn}
                        onChange={handleSSNChange}
                        className={`w-full bg-white border ${errors.ssn ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10`}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSSN(!showSSN)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showSSN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Your SSN is encrypted and only used to pull your credit reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Current Address
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full bg-white border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                    placeholder="123 Main Street, Apt 4B"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                    >
                      <option value="">Select</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
                      placeholder="10001"
                      maxLength={5}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Authorization Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Authorization & Payment
              </h3>
              
              <div className="space-y-4">
                <label className={`flex items-start gap-3 p-3 rounded-lg border ${errors.authorizeCreditPull ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} cursor-pointer`}>
                  <input
                    type="checkbox"
                    name="authorizeCreditPull"
                    checked={formData.authorizeCreditPull}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700 text-sm">
                    I authorize DisputeStrike to pull my credit reports from TransUnion, Equifax, and Experian for the purpose of credit analysis and dispute letter generation.
                  </span>
                </label>
                
                <label className={`flex items-start gap-3 p-3 rounded-lg border ${errors.agreeToTerms ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} cursor-pointer`}>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700 text-sm">
                    I agree to the <Link href="/terms"><a className="text-orange-600 hover:underline">Terms of Service</a></Link> and <Link href="/privacy"><a className="text-orange-600 hover:underline">Privacy Policy</a></Link>. I understand this is a 7-day trial for $1, and I will be charged $69.95/month if I don't cancel.
                  </span>
                </label>
                
                <button
                  type="submit"
                  disabled={createTrialMutation.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createTrialMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Get My Analysis - $1
                    </>
                  )}
                </button>
                
                <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Processing State */}
        {step === 'processing' && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Request</h3>
            <p className="text-gray-600">Please wait while we set up your trial...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto text-center text-sm text-gray-500 px-4">
          <p className="mb-2">
            DisputeStrike is dispute automation software, not a credit repair service. 
            You generate and mail your own dispute letters. Results vary and are not guaranteed.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/terms"><a className="hover:text-orange-600">Terms of Service</a></Link>
            <Link href="/privacy"><a className="hover:text-orange-600">Privacy Policy</a></Link>
            <Link href="/croa-disclosure"><a className="hover:text-orange-600">CROA Disclosure</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
