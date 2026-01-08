import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info, Shield } from "lucide-react";

export default function WhatToExpect() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">What to Expect During Your Dispute</h1>
          <p className="text-xl text-gray-600">
            Understanding the credit dispute process and your legal protections
          </p>
        </div>

        {/* Key Protections */}
        <Alert className="mb-8 bg-green-50 border-green-200">
          <Shield className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>You are fully protected by federal law.</strong> Challenging inaccurate information is your legal right under the Fair Credit Reporting Act (FCRA). You will NOT face collections, late payments, or legal action for exercising this right.
          </AlertDescription>
        </Alert>

        {/* Timeline */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📅 30-Day Investigation Timeline</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                Day 1
              </div>
              <div>
                <h3 className="font-bold">Bureau Receives Your Letters</h3>
                <p className="text-gray-600">Credit bureaus log your dispute and begin the investigation process.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                Day 2-5
              </div>
              <div>
                <h3 className="font-bold">Score May Improve Immediately</h3>
                <p className="text-gray-600">Many users see score increases of 20-50 points as disputed items are "soft deleted" during investigation.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                Day 5-25
              </div>
              <div>
                <h3 className="font-bold">Bureau Contacts Creditors</h3>
                <p className="text-gray-600">Bureaus send verification requests to creditors. If creditors don't respond or can't verify, items MUST be deleted.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                Day 30
              </div>
              <div>
                <h3 className="font-bold">Final Results Sent</h3>
                <p className="text-gray-600">Bureau must send you written results showing which items were deleted, updated, or verified.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Three Possible Outcomes */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🎯 Three Possible Outcomes</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-lg text-green-700 mb-2">
                <CheckCircle2 className="inline mr-2" />
                Outcome 1: Account Deleted (BEST)
              </h3>
              <p className="text-gray-700 mb-2">
                The entire account is removed from your credit report. This happens when:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Creditor doesn't respond to verification request</li>
                <li>Creditor can't verify the information</li>
                <li>Bureau finds information is inaccurate</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                <strong>Your obligation:</strong> You may still technically owe the debt, but it won't appear on your credit report.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-lg text-blue-700 mb-2">
                <Info className="inline mr-2" />
                Outcome 2: Negative Remark Removed (GOOD)
              </h3>
              <p className="text-gray-700 mb-2">
                The account stays, but damaging remarks are deleted:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>"Charged Off" status removed</li>
                <li>"Collection" status removed</li>
                <li>"Late Payment" marks removed</li>
                <li>Account shows as "Closed" or "Paid"</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                <strong>Score impact:</strong> Significant improvement (20-40 points) even though account remains.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold text-lg text-yellow-700 mb-2">
                <AlertTriangle className="inline mr-2" />
                Outcome 3: Account Verified (NEEDS ROUND 2)
              </h3>
              <p className="text-gray-700 mb-2">
                Creditor responds and verifies the account. Next steps:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Request Method of Verification (MOV) under FCRA § 1681i(a)(7)</li>
                <li>Send Round 2 escalation letter with stronger arguments</li>
                <li>Challenge the verification process itself</li>
                <li>File CFPB complaint if verification is inadequate</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                <strong>Success rate:</strong> 40-60% of verified accounts get deleted in Round 2.
              </p>
            </div>
          </div>
        </Card>

        {/* Common Fears Addressed */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-bold mb-4">❌ What Will NOT Happen</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
              <div>
                <strong>No New Collections:</strong> Challenging does NOT trigger new collection attempts. This is your legal right under FCRA § 1681i.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
              <div>
                <strong>No New Late Payments:</strong> The dispute process is separate from payment history. You won't get new late payment marks.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
              <div>
                <strong>No Increased Debt:</strong> Challenging doesn't increase what you owe. Your debt amount stays the same.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
              <div>
                <strong>No Lawsuits:</strong> Creditors cannot sue you for challenging. It's your constitutional right to challenge inaccurate information.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
              <div>
                <strong>Statute of Limitations Doesn't Reset:</strong> Challenging does NOT restart the clock on old debts.
              </div>
            </div>
          </div>
        </Card>

        {/* Legal Protections */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🛡️ Your Legal Protections</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">FCRA § 1681i(a)(1)(A)</h3>
              <p className="text-gray-600">You have the right to dispute any inaccurate information on your credit report.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">FCRA § 1681i(a)(5)(A)</h3>
              <p className="text-gray-600">Bureaus MUST delete information they cannot verify within 30 days.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">FCRA § 1681s-2(b)</h3>
              <p className="text-gray-600">Creditors cannot report disputed information as accurate without proper investigation.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">FDCPA § 1692g</h3>
              <p className="text-gray-600">Debt collectors must verify debts upon your request.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">FCRA § 1681n & § 1681o</h3>
              <p className="text-gray-600">Bureaus face penalties of $100-$1,000 per violation for willful noncompliance, plus actual damages for negligence.</p>
            </div>
          </div>
        </Card>

        {/* Real Results */}
        <Card className="p-6 bg-green-50 border-green-200">
          <h2 className="text-2xl font-bold mb-4">✅ Real Results from Real Users</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="font-bold text-lg text-green-700">+42 Points in 2 Days</p>
              <p className="text-gray-600">Equifax score jumped from 582 to 624 immediately after dispute was filed.</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-bold text-lg text-green-700">3 Accounts Deleted</p>
              <p className="text-gray-600">"Charged Off" remarks removed from Credit Union, PNC Bank, and Ford Motor Credit accounts.</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-bold text-lg text-green-700">8+ More Under Investigation</p>
              <p className="text-gray-600">Additional accounts showing "reinvestigation in progress" - more deletions expected within 30 days.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
