import { useState } from 'react';
import { Zap, Clock, ArrowRight, X, Loader2, Check } from 'lucide-react';

interface UpgradeBannerProps {
  trialEndsAt: Date;
  currentPlan: 'essential' | 'complete';
  onUpgrade: () => Promise<void>;
}

export default function UpgradeBanner({ trialEndsAt, currentPlan, onUpgrade }: UpgradeBannerProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [success, setSuccess] = useState(false);
  
  if (dismissed || success) return null;
  
  const now = new Date();
  const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  const planPrice = currentPlan === 'complete' ? '$129.99' : '$79.99';
  
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await onUpgrade();
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>
      
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">You're on a Trial</h3>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : `${hoursLeft} hours left`}
              </span>
            </div>
            
            <p className="text-white/90 mb-4">
              {daysLeft > 3 
                ? `Upgrade now to unlock full access and start improving your credit immediately.`
                : `Your trial ends soon! Upgrade now to keep access to your credit reports and dispute tools.`
              }
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-white text-orange-600 hover:bg-orange-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upgrading...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-5 h-5" />
                    Upgraded!
                  </>
                ) : (
                  <>
                    Upgrade to {currentPlan === 'complete' ? 'Complete' : 'Essential'} - {planPrice}/mo
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <span className="text-white/80 text-sm">
                Cancel anytime • No long-term commitment
              </span>
            </div>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm font-semibold mb-3">What you get with {currentPlan === 'complete' ? 'Complete' : 'Essential'}:</p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Unlimited dispute rounds</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>3-bureau credit monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>AI-powered recommendations</span>
            </div>
            {currentPlan === 'complete' && (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span><strong>We mail everything for you</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
