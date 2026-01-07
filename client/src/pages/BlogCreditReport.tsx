import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function BlogCreditReport() {
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
            
            <Badge className="mb-4 bg-orange-600">Credit Education</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How to Read Your Credit Report
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn to identify errors, late payments, and collection accounts that may be affecting your credit journey.
            </p>
            
            <img 
              src="/blog-thumb-credit-report.png" 
              alt="How to Read Your Credit Report" 
              className="w-full rounded-lg shadow-xl mb-8"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Your Credit Report</h2>
            
            <p className="text-gray-700 mb-6">
              Your credit report is a detailed record of your credit history. Understanding how to read it is the first step in taking control of your credit journey. Federal law gives you the right to dispute inaccurate information under the Fair Credit Reporting Act (FCRA § 611).
            </p>

            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Your FCRA Rights</h3>
                    <p className="text-gray-700">
                      Under federal law, you have the right to dispute any information you believe is inaccurate, incomplete, or unverifiable. Credit bureaus must investigate your disputes within 30 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">The 5 Main Sections of Your Credit Report</h2>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Personal Information</h3>
            <p className="text-gray-700 mb-6">
              This section contains your name, current and previous addresses, Social Security number, date of birth, and employment history. <strong>Check for errors carefully</strong> - incorrect personal information can be a sign of identity theft or mixed credit files.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Credit Accounts (Trade Lines)</h3>
            <p className="text-gray-700 mb-4">
              This is the most important section. Each account shows:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Account type:</strong> Credit card, mortgage, auto loan, student loan, etc.</li>
              <li><strong>Date opened:</strong> When you opened the account</li>
              <li><strong>Credit limit or loan amount:</strong> Your maximum credit line or original loan amount</li>
              <li><strong>Current balance:</strong> How much you currently owe</li>
              <li><strong>Payment history:</strong> Shows if you've paid on time or had late payments (30, 60, 90+ days late)</li>
              <li><strong>Account status:</strong> Open, closed, paid off, charged off, in collections, etc.</li>
            </ul>

            <Card className="mb-8 border-2 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Common Errors to Look For</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Accounts that don't belong to you</li>
                      <li>• Late payments you believe were paid on time</li>
                      <li>• Incorrect balances or credit limits</li>
                      <li>• Accounts listed as "open" that you closed</li>
                      <li>• Duplicate accounts (same debt listed twice)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Credit Inquiries</h3>
            <p className="text-gray-700 mb-6">
              There are two types of inquiries:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Hard inquiries:</strong> When you apply for credit (credit cards, loans, mortgages). These can affect your score and stay on your report for 2 years.</li>
              <li><strong>Soft inquiries:</strong> When you check your own credit or when companies check your credit for pre-approval offers. These do NOT affect your score.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Public Records</h3>
            <p className="text-gray-700 mb-6">
              This section includes bankruptcies, tax liens, and civil judgments. Bankruptcies can stay on your report for 7-10 years depending on the type.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Collections</h3>
            <p className="text-gray-700 mb-6">
              Accounts that have been sent to collection agencies appear here. Collections can significantly impact your credit and typically remain on your report for 7 years from the date of first delinquency.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">What to Do If You Find Errors</h2>

            <p className="text-gray-700 mb-6">
              If you find information you believe is inaccurate, you have the right to dispute it under FCRA § 611. Here's what you can do:
            </p>

            <ol className="list-decimal pl-6 mb-8 text-gray-700 space-y-4">
              <li>
                <strong>Document the error:</strong> Take screenshots or make copies of the inaccurate information
              </li>
              <li>
                <strong>Gather evidence:</strong> Collect any documents that support your claim (payment receipts, account statements, etc.)
              </li>
              <li>
                <strong>File a dispute:</strong> You can dispute directly with the credit bureaus (Equifax, Experian, TransUnion) in writing
              </li>
              <li>
                <strong>Wait for investigation:</strong> The bureau has 30 days to investigate and respond to your dispute
              </li>
              <li>
                <strong>Follow up:</strong> If the bureau verifies the information, you can escalate with additional evidence or request Method of Verification (MOV)
              </li>
            </ol>

            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl mb-4">DisputeForce Can Help</h3>
                <p className="text-gray-700 mb-4">
                  DisputeForce helps you generate professional, litigation-grade dispute letters with proper FCRA citations. Our AI-powered platform makes it easy to:
                </p>
                <ul className="text-gray-700 space-y-2 mb-6">
                  <li>• Identify items to dispute across all 3 bureaus</li>
                  <li>• Generate Attack letters with legal citations</li>
                  <li>• Track your disputes in real-time</li>
                  <li>• Escalate with Round 2 and Round 3 strategies</li>
                </ul>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Start Your Journey Free</Link>
                </Button>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Takeaways</h2>

            <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-2">
              <li>Review your credit report from all 3 bureaus at least once per year</li>
              <li>Look for errors in personal information, account details, and payment history</li>
              <li>You have the legal right to dispute inaccurate information under FCRA § 611</li>
              <li>Credit bureaus must investigate disputes within 30 days</li>
              <li>Keep detailed records of all disputes and correspondence</li>
            </ul>

            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-600 italic">
                <strong>Disclaimer:</strong> DisputeForce is dispute automation software. We provide AI-powered tools to help you generate and track your own credit disputes. Federal law allows you to dispute credit information for free. You are responsible for mailing your own letters to credit bureaus. Results vary and are not guaranteed.
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
              Ready to Take Control of Your Credit?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your dispute journey with DisputeForce today
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
