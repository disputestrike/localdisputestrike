import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Clock, CheckCircle, AlertTriangle, ExternalLink, ArrowLeft } from "lucide-react";

export default function FCRARights() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Rights Under the Fair Credit Reporting Act (FCRA)</h1>
          <p className="text-xl text-gray-600">
            Understanding your legal rights to dispute credit report errors
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important: You Can Do This For Free</h3>
                <p className="text-amber-800">
                  You have the legal right to dispute inaccurate information on your credit report directly with credit bureaus <strong>at no cost</strong>. You do not need to pay anyone to exercise these rights. DisputeStrike provides technology tools to make this process easier, but using our service is entirely optional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Your Rights Under FCRA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Free Annual Credit Reports</h4>
                  <p className="text-gray-600">You are entitled to one free credit report every 12 months from each of the three major credit bureaus (Equifax, Experian, TransUnion) through <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">AnnualCreditReport.com</a>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Right to Dispute Inaccurate Information</h4>
                  <p className="text-gray-600">You have the right to dispute any information in your credit report that you believe is inaccurate, incomplete, or unverifiable. You can do this directly with the credit bureau at no cost.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">30-Day Investigation Requirement</h4>
                  <p className="text-gray-600">Credit bureaus must investigate your dispute within 30 days (45 days if you provide additional information during the investigation). They must also forward your dispute to the furnisher (the company that reported the information).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Right to Correction or Deletion</h4>
                  <p className="text-gray-600">If the credit bureau cannot verify the disputed information, they must correct or delete it from your credit report.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Right to Add a Statement</h4>
                  <p className="text-gray-600">If your dispute is not resolved in your favor, you have the right to add a 100-word statement to your credit file explaining your side of the story.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Right to Sue for Violations</h4>
                  <p className="text-gray-600">If a credit bureau or furnisher violates your FCRA rights, you may be entitled to sue for damages.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Dispute for Free */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              How to Dispute Errors for Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-700">
                <strong>Get your free credit reports</strong> from <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">AnnualCreditReport.com</a>
              </li>
              <li className="text-gray-700">
                <strong>Review each report carefully</strong> for errors, inaccuracies, or outdated information
              </li>
              <li className="text-gray-700">
                <strong>Write a dispute letter</strong> to each credit bureau that has incorrect information. Include:
                <ul className="list-disc list-inside ml-6 mt-2 text-gray-600">
                  <li>Your full name, address, and date of birth</li>
                  <li>The specific item(s) you are disputing</li>
                  <li>Why you believe the information is inaccurate</li>
                  <li>Copies of any supporting documents</li>
                </ul>
              </li>
              <li className="text-gray-700">
                <strong>Send your dispute via certified mail</strong> with return receipt requested to:
                <div className="mt-2 grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-100 p-3 rounded">
                    <strong>Equifax</strong><br />
                    P.O. Box 740256<br />
                    Atlanta, GA 30374
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <strong>Experian</strong><br />
                    P.O. Box 4500<br />
                    Allen, TX 75013
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <strong>TransUnion</strong><br />
                    P.O. Box 2000<br />
                    Chester, PA 19016
                  </div>
                </div>
              </li>
              <li className="text-gray-700">
                <strong>Wait for the investigation results</strong> (30-45 days)
              </li>
              <li className="text-gray-700">
                <strong>Review the results</strong> and follow up if necessary
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Official Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a href="https://www.consumer.ftc.gov/articles/0151-disputing-errors-credit-reports" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                <ExternalLink className="h-4 w-4" />
                FTC: Disputing Errors on Credit Reports
              </a>
              <a href="https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                <ExternalLink className="h-4 w-4" />
                CFPB: Credit Reports and Scores
              </a>
              <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                <ExternalLink className="h-4 w-4" />
                AnnualCreditReport.com (Free Credit Reports)
              </a>
            </div>
          </CardContent>
        </Card>

        {/* About DisputeStrike */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">About DisputeStrike</h3>
            <p className="text-blue-800 mb-4">
              DisputeStrike is a technology platform that provides tools to help you understand and exercise your rights under the FCRA. Our AI-powered system can help you identify potential errors and generate dispute letters, but using our service is entirely optional.
            </p>
            <p className="text-blue-800 mb-4">
              <strong>We are not a credit repair organization</strong> as defined under the Credit Repair Organizations Act (CROA). We do not guarantee any specific results, and individual outcomes vary based on your unique circumstances.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/start">Try DisputeStrike Free</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container text-center">
          <p className="text-sm text-gray-400">
            © 2025 DisputeStrike Technology. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-3xl mx-auto">
            DisputeStrike is a technology platform that provides tools to help you exercise your rights under the FCRA. We are not a credit repair organization. Results vary by individual and no specific outcomes are guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}
