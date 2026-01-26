/**
 * Checkout Page (Blueprint §1.4)
 * 
 * Direct Stripe-style checkout for Essential ($79.99) or Complete ($129.99).
 */

import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Shield, 
  Check, 
  Lock, 
  CreditCard,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const PLANS = {
  essential: {
    id: 'essential',
    name: 'Essential',
    price: '$79.99',
    period: '/month',
  },
  complete: {
    id: 'complete',
    name: 'Complete',
    price: '$129.99',
    period: '/month',
  }
};

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Get tier from URL params
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier') || 'complete';
  const selectedTier = (tierParam === 'essential' || tierParam === 'complete') ? tierParam : 'complete';
  const plan = PLANS[selectedTier];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate Stripe processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to dashboard with success flag
      setLocation('/dashboard?payment=success');
    } catch (err) {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8" />
              <span className="font-bold text-xl">DisputeStrike</span>
            </a>
          </Link>
          <Link href="/preview-results">
            <a className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Analysis
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Complete Your Upgrade</h1>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">{plan.name} Plan</span>
                <span className="font-bold text-gray-900">{plan.price}</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited Dispute Rounds</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> AI-Powered Letter Generation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Secure Document Storage</li>
                {selectedTier === 'complete' && (
                  <li className="flex items-center gap-2 font-bold text-orange-600"><Check className="w-4 h-4" /> Automated Certified Mailing</li>
                )}
              </ul>
              <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                <span>Total Due Today</span>
                <span>{plan.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure SSL</div>
              <div className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</div>
              <div>Cancel Anytime</div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-8 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Payment Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                <input 
                  type="text" 
                  placeholder="xxxx xxxx xxxx xxxx" 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold mt-4"
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${plan.price}`}
              </Button>
              <p className="text-center text-[10px] text-gray-400 mt-4">
                By clicking "Pay", you agree to our Terms of Service and authorize the monthly subscription charge.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
