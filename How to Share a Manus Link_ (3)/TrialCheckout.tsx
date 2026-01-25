import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  Shield, 
  Check, 
  Clock, 
  ArrowRight,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Info
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface FormData {
  // Account Information
  email: string;
  password: string;
  confirmPassword: string;
  
  // Personal Information
  firstName: string;
  middleInitial: string;
  lastName: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Identity Information
  ssn: string;
  dateOfBirth: string;
  phoneNumber: string;
  
  // Agreements
  agreeToTerms: boolean;
  addressConfirmation: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Payment Form Component
function PaymentForm({ 
  formData, 
  selectedPlan,
  onSuccess 
}: { 
  formData: FormData; 
  selectedPlan: 'diy' | 'complete';
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
          },
        },
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Create subscription with trial
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          plan: selectedPlan,
          userData: {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            middleInitial: formData.middleInitial,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            ssn: formData.ssn,
            dateOfBirth: formData.dateOfBirth,
            phoneNumber: formData.phoneNumber,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // Handle 3D Secure if needed
      if (data.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          data.clientSecret
        );
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <Lock className="w-4 h-4" />
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Start $1 Trial
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          256-bit SSL
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          Secured by Stripe
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4" />
          FCRA compliant
        </div>
      </div>
    </form>
  );
}

export default function TrialCheckout() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlan, setSelectedPlan] = useState<'diy' | 'complete'>('complete');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ssn: '',
    dateOfBirth: '',
    phoneNumber: '',
    agreeToTerms: false,
    addressConfirmation: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const plans = {
    diy: {
      name: 'DIY Plan',
      price: 49.99,
      features: [
        'AI-Powered Credit Analysis',
        'Dispute Letter Generator',
        'Credit Score Tracking',
        'Educational Resources',
        'Email Support',
      ],
    },
    complete: {
      name: 'Complete Plan',
      price: 79.99,
      features: [
        'Everything in DIY Plan',
        'Certified Mail Service',
        'Priority Support',
        'Advanced Dispute Strategies',
        'Monthly Progress Reports',
      ],
    },
  };

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!selectedPlan) {
      alert('Please select a plan');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code';
    }
    if (!formData.addressConfirmation) {
      newErrors.addressConfirmation = 'Please confirm your address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.ssn.trim()) {
      newErrors.ssn = 'SSN is required';
    } else if (!/^\d{9}$/.test(formData.ssn.replace(/-/g, ''))) {
      newErrors.ssn = 'Invalid SSN format';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePaymentSuccess = () => {
    setLocation('/credit-analysis');
  };

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.png" alt="DisputeStrike" className="w-10 h-10" />
              <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
            </a>
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Select Plan' },
              { num: 2, label: 'Account Info' },
              { num: 3, label: 'Identity Info' },
              { num: 4, label: 'Payment' },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.num
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span className="text-sm mt-2 text-gray-600">{step.label}</span>
                </div>
                {idx < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.num ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Step 1: Plan Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                    <p className="text-gray-600">Start with a 7-day trial for just $1</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(plans).map(([key, plan]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPlan(key as 'diy' | 'complete')}
                        className={`p-6 rounded-lg border-2 text-left transition-all ${
                          selectedPlan === key
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPlan === key
                                ? 'border-orange-600 bg-orange-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedPlan === key && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-600">/month</span>
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Account & Address Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Information</h2>
                    <p className="text-gray-600">Create your account and provide your address</p>
                  </div>

                  <div className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name*
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">MI</label>
                        <input
                          type="text"
                          maxLength={1}
                          value={formData.middleInitial}
                          onChange={(e) =>
                            setFormData({ ...formData, middleInitial: e.target.value.toUpperCase() })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name*
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email*
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password*
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password*
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Address</h3>

                      {/* Address */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address*
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      {/* City, State, ZIP */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City*
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State*
                            </label>
                            <select
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                errors.state ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select</option>
                              {US_STATES.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            {errors.state && (
                              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP*
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={formData.zipCode}
                              onChange={(e) =>
                                setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })
                              }
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                errors.zipCode ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {errors.zipCode && (
                              <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Confirmation */}
                      <div className="mt-4">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.addressConfirmation}
                            onChange={(e) =>
                              setFormData({ ...formData, addressConfirmation: e.target.checked })
                            }
                            className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">
                            I have been at my current address for six months or more.
                          </span>
                        </label>
                        {errors.addressConfirmation && (
                          <p className="text-red-500 text-sm mt-1">{errors.addressConfirmation}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Identity Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Information</h2>
                    <p className="text-gray-600">
                      Your social security number and DOB are used to confirm your identity. This info
                      will be securely transmitted to the credit reporting agencies.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* SSN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        SSN*
                        <Info className="w-4 h-4 text-gray-400" />
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        value={formData.ssn}
                        onChange={(e) =>
                          setFormData({ ...formData, ssn: formatSSN(e.target.value) })
                        }
                        placeholder="XXX-XX-XXXX"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors.ssn ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        Date of Birth*
                        <Info className="w-4 h-4 text-gray-400" />
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        Phone Number*
                        <Info className="w-4 h-4 text-gray-400" />
                      </label>
                      <input
                        type="tel"
                        maxLength={14}
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNumber: formatPhone(e.target.value) })
                        }
                        placeholder="(XXX) XXX-XXXX"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Privacy & Security Protected</p>
                        <p>
                          Your personal information is encrypted and securely stored. We comply with all
                          FCRA regulations and never share your data without your consent.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Information</h2>
                    <p className="text-gray-600">Secure payment powered by Stripe</p>
                  </div>

                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      formData={formData}
                      selectedPlan={selectedPlan}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>

                  <button
                    onClick={handleBack}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-gray-900">{plans[selectedPlan].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">7-Day Trial</span>
                  <span className="font-semibold text-gray-900">$1.00</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Due Today</span>
                  <span className="text-2xl font-bold text-orange-600">$1.00</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-900">
                  After your 7-day trial, you'll be charged{' '}
                  <span className="font-semibold">${plans[selectedPlan].price}/month</span>. Cancel
                  anytime before the trial ends to avoid charges.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                {plans[selectedPlan].features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>7-Day Money-Back Guarantee</span>
                </div>
                <p className="text-xs text-gray-500">
                  Cancel anytime within 7 days for a full refund
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
