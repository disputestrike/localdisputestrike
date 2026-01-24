/**
 * Checkout Page - For upgrading from trial to paid subscription
 * Handles /checkout?tier=diy or /checkout?tier=complete
 */

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Shield, 
  Check, 
  Lock, 
  CreditCard,
  ArrowLeft,
  Star,
  Loader2
} from 'lucide-react';

const PLANS = {
  essential: {
    id: 'essential',
    name: 'Essential',
    price: '$79.99',
    priceAmount: 7999,
    period: '/month',
    features: [
      'Unlimited dispute rounds',
      '30-day intervals',
      'AI letter generation',
      'FCRA-compliant letters',
      'You print & mail letters'
    ]
  },
  complete: {
    id: 'complete',
    name: 'Complete',
    price: '$129.99',
    priceAmount: 12999,
    period: '/month',
    popular: true,
    features: [
      'Everything in Essential, plus:',
      'We mail letters for you',
      '5 mailings/month included',
      'CFPB complaint filing',
      'Furnisher disputes'
    ]
  },
  // Legacy mapping
  diy: {
    id: 'essential',
    name: 'Essential',
    price: '$79.99',
    priceAmount: 7999,
    period: '/month',
    features: [
      'Unlimited dispute rounds',
      'AI letter generation',
      'FCRA-compliant letters',
      'You print & mail letters'
    ]
  }
};

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  // Get tier from URL params
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier') || params.get('plan');
  const mappedTier = tierParam === 'diy' ? 'essential' : (tierParam as 'essential' | 'complete' | null);
  const [selectedTier, setSelectedTier] = useState<'essential' | 'complete'>(mappedTier || 'complete');

  const plan = PLANS[selectedTier];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Validate
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      setIsProcessing(false);
      return;
    }
    if (!expiry || expiry.length < 5) {
      setError('Please enter a valid expiry date');
      setIsProcessing(false);
      return;
    }
    if (!cvc || cvc.length < 3) {
      setError('Please enter a valid CVC');
      setIsProcessing(false);
      return;
    }

    try {
      // TODO: Call Stripe API to process payment
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to dashboard on success
      setLocation('/dashboard');
    } catch (err) {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8" />
              <span className="font-bold text-xl text-gray-900">DisputeStrike</span>
            </a>
          </Link>
          <Link href="/credit-analysis">
            <a className="flex items-center gap-2 text-gray-600 hover:text-orange-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Analysis
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h1>
            
            <div className="space-y-4">
              {Object.values(PLANS).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedTier(p.id as 'diy' | 'complete')}
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    selectedTier === p.id
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 bg-white'
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-orange-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{p.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {p.price}
                        <span className="text-gray-500 text-sm font-normal">{p.period}</span>
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedTier === p.id ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                    }`}>
                      {selectedTier === p.id && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  
                  <ul className="mt-4 space-y-2">
                    {p.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>{plan.name} Plan</span>
                    <span>{plan.price}{plan.period}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-gray-900 pt-2 border-t">
                    <span>Total Today</span>
                    <span>{plan.price}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Upgrade to {plan.name} - {plan.price}/mo
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                  <Shield className="w-4 h-4" />
                  <span>256-bit SSL encrypted • Cancel anytime</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
