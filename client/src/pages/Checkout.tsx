/**
 * Checkout Page - For upgrading from trial to paid subscription
 * Handles /checkout?tier=essential or /checkout?tier=complete
 */

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  Shield, 
  Check, 
  Lock, 
  CreditCard,
  ArrowLeft,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

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
  }
};

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Payment Form Component (inside Elements provider)
function PaymentForm({ 
  plan, 
  selectedTier,
  clientSecret,
  onSuccess 
}: { 
  plan: typeof PLANS.essential;
  selectedTier: 'essential' | 'complete';
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!stripe || !elements) {
      setError('Payment system is loading. Please wait a moment and try again.');
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm payment with card element
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful - redirect to dashboard
        onSuccess();
      } else {
        setError('Payment is being processed. Please wait...');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
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
        disabled={isProcessing || !stripe || !elements}
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
            Choose {plan.name} - {plan.price}/mo
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
        <Shield className="w-4 h-4" />
        <span>256-bit SSL encrypted • Cancel anytime</span>
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
  const [selectedTier, setSelectedTier] = useState<'essential' | 'complete'>(
    (tierParam === 'essential' || tierParam === 'complete') ? tierParam : 'complete'
  );

  const plan = PLANS[selectedTier];

  // Create subscription to get clientSecret
  const createSubscriptionMutation = trpc.payments.createSubscription.useMutation({
    onSuccess: (data) => {
      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      } else {
        setInitError('Failed to initialize checkout. Please try again.');
        setIsLoading(false);
      }
    },
    onError: (err) => {
      setInitError(err.message || 'Failed to initialize checkout. Please try again.');
      setIsLoading(false);
    }
  });

  useEffect(() => {
    createSubscriptionMutation.mutate({ tier: selectedTier });
  }, [selectedTier]);

  // Save preview analysis after payment
  const savePreviewAnalysisMutation = trpc.creditReports.savePreviewAnalysis.useMutation();

  const handleSuccess = async () => {
    // Try to save preview analysis from sessionStorage
    try {
      const previewData = sessionStorage.getItem('previewAnalysis');
      if (previewData) {
        const analysis = JSON.parse(previewData);
        console.log('[Checkout] Saving preview analysis to database...');
        await savePreviewAnalysisMutation.mutateAsync({ analysis });
        console.log('[Checkout] Preview analysis saved successfully');
        // Clear session storage after saving
        sessionStorage.removeItem('previewAnalysis');
      }
    } catch (err) {
      console.error('[Checkout] Failed to save preview analysis:', err);
      // Continue to dashboard even if save fails
    }
    
    setLocation('/dashboard?payment=success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
          <p className="text-gray-600 font-medium">Setting up secure checkout...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
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
      </div>
    );
  }

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
          <Link href="/preview-results">
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
                  onClick={() => setSelectedTier(p.id as 'essential' | 'complete')}
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
                    {p.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
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
              
              {clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe' as const,
                      variables: {
                        colorPrimary: '#f97316',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <PaymentForm 
                    plan={plan}
                    selectedTier={selectedTier}
                    clientSecret={clientSecret}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-4" />
                  <p className="text-gray-600">Loading payment form...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
