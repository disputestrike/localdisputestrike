import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
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

export default function TrialCheckout() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<'diy' | 'complete' | null>(null);
  const [step, setStep] = useState<'select' | 'form' | 'processing'>('select');
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
    if (!validateForm()) return;
    setStep('processing');
    // TODO: Submit to API
    console.log('Submitting:', { plan: selectedPlan, ...formData });
    setTimeout(() => {
      setLocation('/credit-analysis');
    }, 2000);
  };

  const planPrice = selectedPlan === 'complete' ? '$79.99' : '$49.99';

  // Step 1: Plan Selection (Pricing Page Style)
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
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                onClick={() => handlePlanSelect('diy')}
              >
                Start DIY - $1 Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">Upgrade to Complete anytime</p>
            </div>

            {/* Complete Plan */}
            <div 
              className="bg-white border-2 border-orange-300 rounded-2xl p-8 relative hover:shadow-xl transition-all cursor-pointer shadow-lg"
              onClick={() => handlePlanSelect('complete')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  MOST POPULAR
                </span>
              </div>
              
              <div className="text-center mb-6 pt-4">
                <h2 className="text-2xl font-bold text-gray-900">Complete</h2>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-orange-600">$79</span>
                <span className="text-2xl text-orange-600">.99</span>
                <span className="text-gray-500">/month</span>
                <p className="text-sm text-gray-400 mt-1">After $1 trial</p>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Everything in DIY, plus:</p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-900 font-medium">Printing &amp; mailing service included</span>
                    <p className="text-xs text-gray-400">Certified mail - save 3+ hours per round</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-900 font-medium">One-click "Send Disputes"</span>
                    <p className="text-xs text-gray-400">No printing, no post office</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-900 font-medium">Real-time USPS tracking</span>
                    <p className="text-xs text-gray-400">Delivery tracking in your dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-900 font-medium">CFPB complaint generator</span>
                    <p className="text-xs text-gray-400">For stubborn items after 3 rounds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-900 font-medium">Furnisher dispute letters</span>
                    <p className="text-xs text-gray-400">Dispute directly with creditors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-900 font-medium">Priority support</span>
                    <p className="text-xs text-gray-400">Email + chat support</p>
                  </div>
                </div>
              </div>

              <button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                onClick={() => handlePlanSelect('complete')}
              >
                Start Complete - $1 Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">Save $50/mo vs. Lexington Law</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Compare Plans</h2>
            <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-4 px-6 text-gray-700">Feature</th>
                    <th className="text-center py-4 px-6 text-gray-700">DIY $49.99/mo</th>
                    <th className="text-center py-4 px-6 bg-orange-50 text-gray-700">Complete $79.99/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Unlimited Rounds (30-day intervals)', diy: true, complete: true },
                    { feature: '30-Day Strategy', diy: true, complete: true },
                    { feature: '3-Bureau Monitoring', diy: true, complete: true },
                    { feature: 'AI Letter Generation', diy: true, complete: true },
                    { feature: 'Mailing Service', diy: false, complete: 'Included' },
                    { feature: 'Certified Mail', diy: false, complete: 'Included' },
                    { feature: 'Delivery Tracking', diy: false, complete: 'Included' },
                    { feature: 'CFPB Complaints', diy: false, complete: true },
                    { feature: 'Furnisher Disputes', diy: false, complete: true },
                    { feature: 'Money-Back Guarantee', diy: true, complete: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-4 px-6 text-gray-700">{row.feature}</td>
                      <td className="text-center py-4 px-6">
                        {typeof row.diy === 'boolean' ? (
                          row.diy ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-gray-500">{row.diy}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6 bg-orange-50">
                        {typeof row.complete === 'boolean' ? (
                          row.complete ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-orange-600 font-medium">{row.complete}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Both plans have unlimited rounds?',
                  a: 'Yes! Both DIY and Complete include unlimited dispute rounds with 30-day intervals. The difference is WHO handles the mailing and whether you get advanced features (CFPB, furnisher disputes).'
                },
                {
                  q: 'Why 30-day intervals between rounds?',
                  a: 'Credit bureaus legally have 30-45 days to investigate disputes. Our 30-day intervals ensure FCRA compliance and maximize effectiveness. Disputing too frequently gets flagged as frivolous.'
                },
                {
                  q: 'Can I switch from DIY to Complete later?',
                  a: 'Absolutely! Upgrade anytime. Your progress carries over, and you\'ll immediately get the mailing service for your next round.'
                },
                {
                  q: 'What\'s included in "furnisher disputes"?',
                  a: 'After rounds with bureaus, sometimes you need to dispute directly with the creditor (the furnisher). Complete plan includes these letter templates.'
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-orange-50 rounded-2xl p-8 max-w-2xl mx-auto border border-orange-100 mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to See Your Real Credit Data?</h2>
            <p className="text-gray-600 mb-6">Start your $1 trial now and get AI-powered recommendations in minutes.</p>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2 transition-colors"
              onClick={() => handlePlanSelect('complete')}
            >
              Get My Credit Analysis - $1
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Legal Disclaimer */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-xs text-gray-500 space-y-3">
              <p className="font-semibold text-gray-700">IMPORTANT CONSUMER DISCLOSURE:</p>
              <p>
                DisputeStrike is dispute preparation software. We are NOT a credit repair organization as defined 
                under the Credit Repair Organizations Act (CROA), 15 U.S.C. § 1679.
              </p>
              <p>
                <strong>YOU are in control:</strong> You review and approve all dispute letters before they are sent. 
                Our "Complete" plan includes a mailing convenience service where we print and mail letters on your 
                behalf, but YOU remain responsible for all disputes.
              </p>
              <p>
                You have the right to dispute inaccurate information directly with credit bureaus at no cost. 
                Visit <a href="https://www.annualcreditreport.com" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">AnnualCreditReport.com</a> for free credit reports.
              </p>
              <p>
                We do not guarantee removal of any information or specific credit score improvements. 
                Results vary based on individual circumstances.
              </p>
              <p>
                <strong>Your Rights:</strong> You may cancel at any time. See our <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a> and <a href="/refund-policy" className="text-orange-600 hover:underline">Refund Policy</a> for details.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            <p>© 2026 DisputeStrike. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
              <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
              <a href="/disclaimer" className="hover:text-gray-700">Disclaimer</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Step 2: Form (after plan selection)
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
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
              <span className="text-sm font-medium text-gray-700">Plan Selected</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm font-medium text-gray-700">Your Information</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm text-gray-500">Credit Analysis</span>
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
              <CreditCard className="w-5 h-5" />
              Get My Credit Analysis - $1
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                256-bit SSL
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Bank-level security
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                FCRA compliant
              </div>
            </div>
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

  // Step 3: Processing
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pulling Your Credit Reports...</h2>
        <p className="text-gray-600">This usually takes 30-60 seconds</p>
      </div>
    </div>
  );
}
