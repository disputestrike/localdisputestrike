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
import { cn } from "@/lib/utils";

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
          <h1 className="text-3xl font-black text-center text-gray-900">Complete Your Upgrade</h1>
          
          {/* Order Summary - STRONG BORDERS */}
          <div className="bg-white p-8 rounded-xl border-2 border-gray-300 shadow-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
              <div>
                <span className="font-black text-xl text-gray-900">{plan.name}</span>
                <p className="text-sm text-gray-600 font-medium">Monthly subscription</p>
              </div>
              <div className="text-right bg-orange-50 p-3 rounded-lg border-2 border-orange-300">
                <span className="font-black text-2xl text-orange-600">{plan.price}</span>
                <span className="text-gray-600 font-medium">{plan.period}</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 p-2 rounded-lg hover:bg-gray-50">
                  {selectedTier === 'complete' && i === 1 ? (
                    <div className="p-1 bg-orange-100 rounded-full">
                      <Zap className="w-5 h-5 text-orange-600 shrink-0" />
                    </div>
                  ) : (
                    <div className="p-1 bg-green-100 rounded-full">
                      <Check className="w-5 h-5 text-green-600 shrink-0" />
                    </div>
                  )}
                  <span className={cn("font-medium", selectedTier === 'complete' && i === 1 ? 'font-bold text-orange-700' : '')}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                <span className="font-black text-lg text-gray-900">Total Due Today</span>
                <span className="font-black text-3xl text-gray-900">{plan.price}</span>
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-7 text-lg font-black shadow-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Redirecting to Secure Checkout...</>
                ) : (
                  <>Continue to Secure Checkout</>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                You'll be redirected to Stripe's secure checkout to complete your payment.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" /> <span className="font-medium">Secure SSL</span></div>
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-green-600" /> <span className="font-medium">256-bit Encryption</span></div>
            <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> <span className="font-medium">Powered by Stripe</span></div>
          </div>

          <p className="text-center text-sm text-gray-500 font-medium">
            By continuing, you agree to our <a href="/terms" className="underline text-orange-600 hover:text-orange-700">Terms of Service</a> and authorize the monthly subscription charge. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
