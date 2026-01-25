import { Shield } from "lucide-react";

interface CROADisclaimerProps {
  variant?: 'full' | 'compact' | 'footer';
  className?: string;
}

export function CROADisclaimer({ variant = 'footer', className = '' }: CROADisclaimerProps) {
  if (variant === 'full') {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important Disclosure</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              DisputeStrike is a technology platform that provides tools and resources to help you understand and exercise your rights under the Fair Credit Reporting Act (FCRA). We are not a credit repair organization as defined under the Credit Repair Organizations Act (CROA), and we do not provide credit repair services.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              <strong>Your Rights Under FCRA:</strong> You have the right to dispute inaccurate information on your credit report directly with credit bureaus at no cost. You can do this yourself without using any paid service.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              <strong>No Guarantees:</strong> Results vary based on individual circumstances. We cannot guarantee any specific outcome or improvement to your credit score.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 border-l-4 border-blue-500 p-4 ${className}`}>
        <p className="text-sm text-blue-800">
          <strong>Disclosure:</strong> DisputeStrike provides technology tools to help you exercise your FCRA rights. We are not a credit repair organization. You can dispute errors on your credit report for free directly with credit bureaus. Results vary by individual.
        </p>
      </div>
    );
  }

  // Footer variant (default)
  return (
    <div className={`text-center text-xs text-gray-500 max-w-4xl mx-auto ${className}`}>
      <p className="leading-relaxed">
        DisputeStrike is a technology platform that provides tools to help you understand and exercise your rights under the Fair Credit Reporting Act (FCRA). We are not a credit repair organization as defined under CROA. You have the right to dispute inaccurate information directly with credit bureaus at no cost. Results vary based on individual circumstances. No specific outcomes are guaranteed.
      </p>
    </div>
  );
}

export function FCRARightsNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
      <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Your Rights Under Federal Law
      </h3>
      <div className="text-sm text-amber-800 space-y-3">
        <p>
          Under the Fair Credit Reporting Act (FCRA), you have the right to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Obtain a free copy of your credit report annually from each bureau at <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="underline">AnnualCreditReport.com</a></li>
          <li>Dispute inaccurate or incomplete information directly with credit bureaus at no cost</li>
          <li>Have credit bureaus investigate your disputes within 30 days</li>
          <li>Have inaccurate information corrected or removed if it cannot be verified</li>
          <li>Add a statement of dispute to your credit file</li>
        </ul>
        <p className="mt-4 font-medium">
          You do not need to pay anyone to exercise these rights. You can dispute errors yourself for free.
        </p>
      </div>
    </div>
  );
}

export function PricingDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center text-xs text-gray-500 max-w-3xl mx-auto ${className}`}>
      <p>
        Subscription prices shown are in USD and billed monthly. You may cancel at any time. DisputeStrike provides technology tools to assist with credit disputes. We are not a credit repair organization. You can dispute errors for free directly with credit bureaus. Individual results vary and no specific outcomes are guaranteed.
      </p>
    </div>
  );
}

export function SignupDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <p>
        By creating an account, you acknowledge that DisputeStrike is a technology platform that provides tools to help you exercise your rights under the FCRA. We are not a credit repair organization. You understand that you can dispute credit report errors for free directly with credit bureaus, and that individual results vary with no guaranteed outcomes.
      </p>
    </div>
  );
}
