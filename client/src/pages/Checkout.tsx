/**
 * Checkout Page - Embedded Stripe Checkout
 * 
 * Features embedded Stripe Elements for on-site payment collection.
 * No redirect to stripe.com - better conversion and brand consistency.
 */

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { 
  Shield, 
  Check, 
  Lock, 
  CreditCard,
  ArrowLeft,
  Loader2,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

// Initialize Stripe - use your publishable key from env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PLANS = {
  essential: {
    id: 'essential',
    name: 'Essential Plan',
    price: '$79.99',
    priceNum: 79.99,
    period: '/month',
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
    priceNum: 129.99,
    period: '/month',
    features: [
      'Everything in Essential',
      'We Mail For You (Certified)',
      'Real-Time USPS Tracking',
      'Priority Support',
    ]
  }
};

// Payment Form Component (inside Elements provider)
function CheckoutForm({ 
  plan, 
  selectedTier,
  onSuccess 
}: { 
  plan: typeof PLANS.essential;
  selectedTier: 'essential' | 'complete';
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError('');

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment=success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      onSuccess();
    } else {
      // Payment requires additional action or redirect happened
      setIsProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Redirecting to your dashboard...</p>
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Order Summary */}
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
      
      {/* Features */}
      <ul className="space-y-3 mb-6">
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

      {/* Payment Element */}
      <div className="border-t-2 border-gray-200 pt-6">
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-3">Payment Details</label>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <PaymentElement 
              options={{
                layout: 'tabs',
              }}
            />
          </div>
        </div>

        {/* Total */}
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
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-7 text-lg font-black shadow-lg"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing Payment...</>
          ) : (
            <>Subscribe Now - {plan.price}/month</>
          )}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4 font-medium">
          Your subscription will renew monthly. Cancel anytime.
        </p>
      </div>
    </form>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState('');

  // Get tier from URL params
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier') || 'complete';
  const selectedTier = (tierParam === 'essential' || tierParam === 'complete') ? tierParam : 'complete';
  const plan = PLANS[selectedTier];

  const createSubscriptionMutation = trpc.payments.createSubscription.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout (the working approach)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setInitError('Failed to get checkout URL. Please try again.');
        setIsLoading(false);
      }
    },
    onError: (err) => {
      setInitError(err.message || 'Failed to initialize checkout. Please try again.');
      setIsLoading(false);
    }
  });

  useEffect(() => {
    // Create checkout session on mount and redirect
    createSubscriptionMutation.mutate({ tier: selectedTier });
  }, [selectedTier]);

  const handleSuccess = () => {
    // Redirect to dashboard after short delay
    setTimeout(() => {
      setLocation('/dashboard?payment=success');
    }, 2000);
  };

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#f97316', // Orange-500
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.webp" alt="DisputeStrike" className="h-8" />
              <span className="font-bold text-xl">DisputeStrike</span>
            </a>
          </Link>
          <Link href="/preview-results">
            <a className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Analysis
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          <h1 className="text-3xl font-black text-center text-gray-900">Complete Your Checkout</h1>
          
          {/* Main Card */}
          <div className="bg-white p-8 rounded-xl border-2 border-gray-300 shadow-lg">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
                <p className="text-gray-600 font-medium">Setting up secure checkout...</p>
              </div>
            ) : initError ? (
              <div className="text-center py-12">
                <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                  {initError}
                </div>
                <Button 
                  onClick={() => {
                    setIsLoading(true);
                    setInitError('');
                    createSubscriptionMutation.mutate({ tier: selectedTier });
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
                <p className="text-gray-600 font-medium">Redirecting to secure checkout...</p>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" /> <span className="font-medium">Secure SSL</span></div>
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-green-600" /> <span className="font-medium">256-bit Encryption</span></div>
            <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> <span className="font-medium">Powered by Stripe</span></div>
          </div>

          <p className="text-center text-sm text-gray-500 font-medium">
            By subscribing, you agree to our <a href="/terms" className="underline text-orange-600 hover:text-orange-700">Terms of Service</a> and authorize the monthly subscription charge. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
