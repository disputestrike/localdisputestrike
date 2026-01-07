import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Scale, Shield, CheckCircle2, AlertTriangle } from "lucide-react";

export default function BlogFCRARights() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            
            <Badge className="mb-4 bg-orange-600">Legal Rights</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your FCRA § 611 Rights Explained
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Understand your federal rights to dispute inaccurate credit information and hold credit bureaus accountable.
            </p>
            
            <img 
              src="/blog-thumb-fcra-rights.png" 
              alt="FCRA § 611 Rights" 
              className="w-full rounded-lg shadow-xl mb-8"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is the Fair Credit Reporting Act (FCRA)?</h2>
            
            <p className="text-gray-700 mb-6">
              The Fair Credit Reporting Act (FCRA) is a federal law enacted in 1970 to promote accuracy, fairness, and privacy of consumer information in credit reports. Section 611 specifically outlines your rights to dispute inaccurate information and requires credit bureaus to investigate your disputes.
            </p>

            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Scale className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Federal Law Protects You</h3>
                    <p className="text-gray-700">
                      FCRA § 611 gives you the legal right to dispute any information in your credit report that you believe is inaccurate, incomplete, or unverifiable. Credit bureaus MUST investigate your disputes - it's not optional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights Under FCRA § 611</h2>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. The Right to Dispute Inaccurate Information</h3>
            <p className="text-gray-700 mb-6">
              <strong>FCRA § 611(a)(1)(A):</strong> You have the right to dispute the completeness or accuracy of any item in your credit report. This includes:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Accounts that don't belong to you</li>
              <li>Late payments you believe were reported incorrectly</li>
              <li>Incorrect balances or credit limits</li>
              <li>Accounts listed as "open" that you closed</li>
              <li>Duplicate accounts (same debt listed multiple times)</li>
              <li>Any information you believe is inaccurate or incomplete</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. The Right to a Reasonable Investigation</h3>
            <p className="text-gray-700 mb-6">
              <strong>FCRA § 611(a)(1)(A):</strong> When you dispute information, the credit bureau must conduct a "reasonable investigation" to determine whether the disputed information is accurate. This is not optional - it's required by federal law.
            </p>

            <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl mb-4">What is a "Reasonable Investigation"?</h3>
                <p className="text-gray-700 mb-4">
                  A reasonable investigation means the bureau must:
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• Review all relevant information you provide</li>
                  <li>• Contact the furnisher (company that reported the information)</li>
                  <li>• Request documentation from the furnisher</li>
                  <li>• Make a determination based on evidence, not just the furnisher's word</li>
                </ul>
              </CardContent>
            </Card>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. The Right to a 30-Day Response</h3>
            <p className="text-gray-700 mb-6">
              <strong>FCRA § 611(a)(1)(A):</strong> The credit bureau must complete its investigation within 30 days of receiving your dispute (or 45 days if you provide additional information during the investigation).
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">4. The Right to Know the Results</h3>
            <p className="text-gray-700 mb-6">
              <strong>FCRA § 611(a)(6)(B):</strong> After the investigation, the bureau must provide you with:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Written notice of the results</li>
              <li>A free copy of your credit report if the dispute results in a change</li>
              <li>Notice that they will send the corrected report to anyone who received your report in the past 6 months</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">5. The Right to Method of Verification (MOV)</h3>
            <p className="text-gray-700 mb-6">
              <strong>FCRA § 611(a)(7):</strong> If the bureau verifies the disputed information, you have the right to request the "method of verification" - meaning they must tell you how they verified it and what documentation they reviewed.
            </p>

            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl mb-4">Why MOV Requests Are Powerful</h3>
                <p className="text-gray-700 mb-4">
                  Many credit bureaus conduct "lazy" investigations by simply asking the furnisher "Is this accurate?" without requesting proof. When you demand the MOV, you're forcing them to show their work - and many times, they can't provide adequate documentation.
                </p>
              </CardContent>
            </Card>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">6. The Right to Add a Statement</h3>
            <p className="text-gray-700 mb-6">
              <strong>FCRA § 611(b):</strong> If the bureau refuses to remove disputed information, you have the right to add a 100-word statement to your credit report explaining your side of the story. This statement will be included whenever your report is accessed.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Happens If Credit Bureaus Violate Your Rights?</h2>

            <p className="text-gray-700 mb-6">
              If a credit bureau fails to conduct a reasonable investigation or violates your FCRA rights, you may be entitled to:
            </p>

            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Statutory damages:</strong> $100 to $1,000 per violation</li>
              <li><strong>Actual damages:</strong> Compensation for harm caused (denied loans, higher interest rates, etc.)</li>
              <li><strong>Punitive damages:</strong> Additional damages if the violation was willful</li>
              <li><strong>Attorney fees:</strong> The bureau may have to pay your legal costs</li>
            </ul>

            <Card className="mb-8 border-2 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Common FCRA Violations</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Failing to investigate disputes within 30 days</li>
                      <li>• Conducting "rubber stamp" investigations (just asking the furnisher without reviewing evidence)</li>
                      <li>• Refusing to provide Method of Verification when requested</li>
                      <li>• Re-reporting deleted information without notifying you</li>
                      <li>• Failing to notify furnishers when information is disputed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Exercise Your FCRA § 611 Rights</h2>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Identify Inaccurate Information</h3>
            <p className="text-gray-700 mb-6">
              Review your credit reports from all three bureaus (Equifax, Experian, TransUnion). Look for any information you believe is inaccurate, incomplete, or unverifiable.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Send a Dispute Letter</h3>
            <p className="text-gray-700 mb-6">
              Write a formal dispute letter citing FCRA § 611 and clearly identifying the items you're disputing. Include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Your full name, address, and last 4 digits of SSN</li>
              <li>Specific items you're disputing</li>
              <li>Reason for the dispute</li>
              <li>Request for investigation and removal</li>
              <li>Supporting documentation (if available)</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Send via Certified Mail</h3>
            <p className="text-gray-700 mb-6">
              Always send dispute letters via certified mail with return receipt requested. This creates a paper trail proving when the bureau received your dispute.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 4: Wait for Investigation (30 Days)</h3>
            <p className="text-gray-700 mb-6">
              The bureau has 30 days to investigate and respond. Keep copies of all correspondence.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 5: Request MOV if Verified</h3>
            <p className="text-gray-700 mb-6">
              If the bureau verifies the information, immediately send a Method of Verification request citing FCRA § 611(a)(7). Demand documentation showing how they verified it.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 6: Escalate if Necessary</h3>
            <p className="text-gray-700 mb-6">
              If the bureau fails to provide adequate MOV or continues to report inaccurate information, send a final escalation letter citing specific FCRA violations and signaling potential legal action.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">How DisputeForce Helps You Exercise Your Rights</h2>

            <p className="text-gray-700 mb-6">
              DisputeForce makes it easy to exercise your FCRA § 611 rights without hiring an expensive attorney:
            </p>

            <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-2">
              <li><strong>AI-powered dispute letters:</strong> Generate professional letters with proper FCRA citations</li>
              <li><strong>MOV request templates:</strong> Automatically generate Method of Verification demands</li>
              <li><strong>Escalation strategy:</strong> 3-Round Attack approach mirrors what attorneys use</li>
              <li><strong>Progress tracking:</strong> Dashboard shows status of all disputes</li>
              <li><strong>Mailing instructions:</strong> Step-by-step guidance for certified mail</li>
            </ul>

            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl mb-4">Defend Your Rights with DisputeForce</h3>
                <p className="text-gray-700 mb-4">
                  Take control of your credit journey and hold credit bureaus accountable under federal law.
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Takeaways</h2>

            <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-2">
              <li>FCRA § 611 gives you the legal right to dispute inaccurate credit information</li>
              <li>Credit bureaus MUST conduct a reasonable investigation within 30 days</li>
              <li>You have the right to request Method of Verification if items are verified</li>
              <li>Bureaus that violate your rights can face statutory damages of $100-$1,000 per violation</li>
              <li>Always send disputes via certified mail to create a paper trail</li>
              <li>Persistence and escalation are key to success</li>
            </ul>

            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-600 italic">
                <strong>Disclaimer:</strong> DisputeForce is dispute automation software. We provide AI-powered tools to help you generate and track your own credit disputes. Federal law allows you to dispute credit information for free. You are responsible for mailing your own letters to credit bureaus. Results vary and are not guaranteed. This article is for educational purposes only and does not constitute legal advice.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Defend Your Rights?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start exercising your FCRA § 611 rights today with DisputeForce
            </p>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6" asChild>
              <Link href="/quiz">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
