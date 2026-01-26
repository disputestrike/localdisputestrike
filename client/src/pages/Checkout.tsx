/**
 * Checkout Page (Blueprint §1.4)
 * 
 * Direct Stripe checkout for Essential ($79.99) or Complete ($129.99).
 * Redirects to Stripe Checkout then back to /dashboard?payment=success
 */

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Shield, 
  Check, 
  Lock, 
  CreditCard,
  ArrowLeft,
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const PLANS = {
  essential: {
    id: 'essential',
    name: 'Essential Plan',
    price: '$79.99',
    period: '/month',
    stripeTier: 'subscription_monthly' as const,
    features: [
      'Unlimited Dispute Rounds',
      'AI-Powered Letter Generation',
      'You Print & Mail',
      'Secure Document Storage',
    ]
  },
  complete: {
    id: 'complete',
    name: 'Complete Plan',
    price: '$129.99',
    period: '/month',
    stripeTier: 'subscription_monthly' as const,
    features: [
      'Everything in Essential',
      'We Mail For You (Certified)',
      'Real-Time USPS Tracking',
      'Priority Support',
    ]
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

  const createCheckoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err) => {
      setError(err.message || 'Failed to create checkout session. Please try again.');
      setIsProcessing(false);
    }
  });

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError('');
    createCheckoutMutation.mutate({ tier: plan.stripeTier });
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

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-center">Complete Your Upgrade</h1>
          
          {/* Order Summary */}
          <div className="bg-white p-8 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <span className="font-bold text-xl text-gray-900">{plan.name}</span>
                <p className="text-sm text-gray-500">Monthly subscription</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-2xl text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  {selectedTier === 'complete' && i === 1 ? (
                    <Zap className="w-5 h-5 text-orange-500 shrink-0" />
                  ) : (
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                  <span className={selectedTier === 'complete' && i === 1 ? 'font-bold text-orange-600' : ''}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total Due Today</span>
                <span className="font-bold text-2xl text-gray-900">{plan.price}</span>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Redirecting to Secure Checkout...</>
                ) : (
                  <>Continue to Secure Checkout</>
                )}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-4">
                You'll be redirected to Stripe's secure checkout to complete your payment.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1"><Shield className="w-4 h-4" /> Secure SSL</div>
            <div className="flex items-center gap-1"><Lock className="w-4 h-4" /> 256-bit Encryption</div>
            <div className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> Powered by Stripe</div>
          </div>

          <p className="text-center text-xs text-gray-400">
            By continuing, you agree to our <a href="/terms" className="underline">Terms of Service</a> and authorize the monthly subscription charge. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
