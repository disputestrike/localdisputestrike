import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  Shield, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Zap,
  Star,
  ArrowRight,
  Lock,
  CreditCard,
  FileText,
  Truck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  agreeToTerms: boolean;
  authorizeCreditPull: boolean;
}

// Payment Form Component (Step 3)
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
      setError('Stripe has not loaded yet. Please wait a moment and try again.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Get payment intent from backend
      const response = await fetch('/api/v2/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.fullName,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US',
            },
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment successful, now create the trial account
        const trialResponse = await fetch('/api/v2/trial/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            plan: selectedPlan,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (!trialResponse.ok) {
          throw new Error('Payment succeeded but account creation failed. Please contact support.');
        }

        onSuccess();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        '::placeholder': {
          color: '#9CA3AF',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#EF4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">
            <CreditCard className="w-4 h-4" />
          </span>
          Payment Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-2">Card Details</label>
            <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Your payment is secured by Stripe. We never store your card details.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium text-sm">Payment Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay $1 & Get Credit Analysis
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          256-bit SSL
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          Secured by Stripe
        </div>
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          FCRA compliant
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          <strong className="text-gray-900">7-Day Money-Back Guarantee</strong>
          <br />
          Cancel anytime within 7 days for a full refund
        </p>
      </div>
    </form>
  );
}

export default function TrialCheckout() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<'diy' | 'complete' | null>(null);
  const [step, setStep] = useState<'select' | 'form' | 'payment' | 'processing'>('select');
  const [showPassword, setShowPassword] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [countdown, setCountdown] = useState({ minutes: 14, seconds: 59 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlanSelect = (plan: 'diy' | 'complete') => {
    setSelectedPlan(plan);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (!validateForm()) {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Move to payment step
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = () => {
    setStep('processing');
    // Simulate credit pull
    setTimeout(() => {
      setLocation('/credit-analysis');
    }, 3000);
  };

  const planPrice = selectedPlan === 'complete' ? '$79.99' : '$49.99';

  // Step 1: Plan Selection (keeping existing code)
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {/* Header */}
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/">
              <a className="flex items-center gap-2">
                <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
                <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
              </a>
            </Link>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')} left at this price
              </span>
            </div>
          </div>
        </nav>

        <main className="container mx-auto max-w-6xl px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Start with $1 for 7 days - See your real credit data
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Both plans include <strong>monitoring + unlimited dispute tools</strong>
            </p>
            <p className="text-gray-500">
              30-day intervals between rounds for maximum effectiveness &amp; FCRA compliance
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* DIY Plan */}
            <div 
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handlePlanSelect('diy')}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">DIY</h2>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">$49</span>
                <span className="text-2xl text-gray-900">.99</span>
                <span className="text-gray-500">/month</span>
                <p className="text-sm text-gray-400 mt-1">After $1 trial</p>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What's included:</p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited dispute rounds (30-day intervals)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">3-bureau credit monitoring (daily updates)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI analyzes &amp; selects best items to dispute</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">FCRA-compliant dispute letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Round 1-2-3 escalation strategy</span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">You print &amp; mail yourself (~$30/round at USPS)</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">No CFPB complaints</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">No furnisher disputes</span>
                </div>
              </div>

              <button 
                onClick={() => handlePlanSelect('diy')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Start $1 Trial
              </button>
            </div>

            {/* Complete Plan */}
            <div 
              className="bg-white border-2 border-orange-500 rounded-2xl p-8 hover:shadow-lg transition-all cursor-pointer relative"
              onClick={() => handlePlanSelect('complete')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Complete</h2>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">$79</span>
                <span className="text-2xl text-gray-900">.99</span>
                <span className="text-gray-500">/month</span>
                <p className="text-sm text-gray-400 mt-1">After $1 trial</p>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Everything in DIY, plus:</p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">All DIY features included</span>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>We mail everything for you</strong> via certified mail</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">CFPB complaint letters (if needed)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Furnisher dispute letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Proof of delivery tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority support</span>
                </div>
              </div>

              <button 
                onClick={() => handlePlanSelect('complete')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Start $1 Trial
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: Information Form
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/">
              <a className="flex items-center gap-2">
                <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
                <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
              </a>
            </Link>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPlan === 'complete' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                {selectedPlan === 'complete' ? 'Complete Plan' : 'DIY Plan'} - {planPrice}/mo
              </span>
              <button 
                onClick={() => setStep('select')}
                className="text-sm text-orange-600 hover:underline"
              >
                Change plan
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto max-w-2xl py-12 px-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-sm font-medium text-gray-700">Plan</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm font-medium text-gray-700">Info</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm text-gray-500">Payment</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">4</div>
              <span className="text-sm text-gray-500">Analysis</span>
            </div>
          </div>

          {/* Trial Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold">
              $1 for 7 days
            </div>
            <p className="text-gray-500 mt-2">Then {planPrice}/mo if you continue. Cancel anytime.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
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
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
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
                      256-bit encrypted. Only used to pull your credit reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
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

            {/* Authorizations */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-xs ml-7">{errors.agreeToTerms}</p>}
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="authorizeCreditPull"
                  name="authorizeCreditPull"
                  checked={formData.authorizeCreditPull}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="authorizeCreditPull" className="text-sm text-gray-600 cursor-pointer">
                  I authorize DisputeStrike to access my credit reports from TransUnion, Equifax, and Experian for the purpose of credit monitoring and dispute assistance.
                </label>
              </div>
              {errors.authorizeCreditPull && <p className="text-red-500 text-xs ml-7">{errors.authorizeCreditPull}</p>}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Continue to Payment
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* What happens next */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 border">
            <h3 className="font-bold mb-4 text-gray-900">What happens after you pay $1:</h3>
            <div className="space-y-3">
              {[
                'We pull your credit reports from all 3 bureaus (30-60 seconds)',
                'AI analyzes your reports and identifies the best items to dispute',
                'You see your scores, negative items, and AI recommendations',
                `Choose to continue with ${selectedPlan === 'complete' ? 'Complete' : 'DIY'} (${planPrice}/mo) or cancel within 7 days`,
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Payment
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/">
              <a className="flex items-center gap-2">
                <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
                <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
              </a>
            </Link>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPlan === 'complete' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                {selectedPlan === 'complete' ? 'Complete Plan' : 'DIY Plan'} - {planPrice}/mo
              </span>
            </div>
          </div>
        </nav>

        <div className="container mx-auto max-w-2xl py-12 px-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-sm font-medium text-gray-700">Plan</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-sm font-medium text-gray-700">Info</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm font-medium text-gray-700">Payment</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">4</div>
              <span className="text-sm text-gray-500">Analysis</span>
            </div>
          </div>

          {/* Trial Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold">
              $1 for 7 days
            </div>
            <p className="text-gray-500 mt-2">Then {planPrice}/mo if you continue. Cancel anytime.</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <h3 className="text-gray-900 font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900">{selectedPlan === 'complete' ? 'Complete' : 'DIY'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">7-Day Trial</span>
                <span className="font-medium text-gray-900">$1.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Due Today</span>
                <span className="font-bold text-2xl text-orange-600">$1.00</span>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                After your 7-day trial, you'll be charged {planPrice}/month. Cancel anytime before the trial ends to avoid charges.
              </p>
            </div>
          </div>

          {/* Payment Form wrapped in Stripe Elements */}
          <Elements stripe={stripePromise}>
            <PaymentForm 
              formData={formData} 
              selectedPlan={selectedPlan!}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>

          {/* What happens next */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 border">
            <h3 className="font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" />
              After payment:
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Instant access to your 3-bureau credit reports</p>
              <p>✓ AI analysis of all negative items</p>
              <p>✓ Personalized dispute strategy</p>
              <p>✓ 7 days to try risk-free</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Processing
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pulling Your Credit Reports...</h2>
        <p className="text-gray-600">This usually takes 30-60 seconds</p>
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Payment confirmed</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span>Accessing credit bureaus...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
