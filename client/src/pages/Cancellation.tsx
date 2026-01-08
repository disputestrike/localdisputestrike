import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { XCircle, Clock, Mail, CheckCircle2 } from "lucide-react";

export default function Cancellation() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/money-back-guarantee" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              110% Guarantee
            </Link>
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
          
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <XCircle className="h-16 w-16 text-orange-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xl text-gray-700">
              Your right to cancel is protected by federal law
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* 3-Day Right to Cancel */}
            <Card className="border-2 border-orange-500">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Clock className="h-6 w-6" />
                  YOUR 3-DAY RIGHT TO CANCEL
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <p className="text-gray-800 font-medium mb-4 text-lg">
                    NOTICE OF RIGHT TO CANCEL
                  </p>
                  <p className="text-gray-700 mb-4">
                    Under the Credit Repair Organizations Act (15 U.S.C. § 1679e), you have the right to cancel your contract with DisputeStrike for any reason within <strong>3 business days</strong> from the date you signed it or received this notice, whichever is later.
                  </p>
                  <p className="text-gray-700 mb-4">
                    If you cancel within this 3-day period, you will receive a <strong>full refund</strong> of any money paid, with no questions asked.
                  </p>
                  <p className="text-gray-700 font-medium">
                    To cancel, you must notify us in writing by mail or email before midnight of the third business day.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Cancel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-orange-600" />
                  How to Cancel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-3">Option 1: Email</h4>
                    <p className="text-gray-700 mb-2">Send an email to:</p>
                    <p className="text-orange-600 font-medium">cancel@disputestrike.com</p>
                    <p className="text-sm text-gray-600 mt-3">
                      Include your full name, email address used for registration, and the word "CANCEL" in the subject line.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-3">Option 2: Mail</h4>
                    <p className="text-gray-700 mb-2">Send written notice to:</p>
                    <p className="text-gray-700">
                      DisputeStrike LLC<br />
                      Attn: Cancellation Department<br />
                      1712 Pioneer Ave, Suite 500, Cheyenne, WY 82001<br />
                      [City, State ZIP]
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Tip:</strong> For fastest processing, email is recommended. You will receive a confirmation within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Refund Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                      Within 3 Days
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong>Full refund, no questions asked.</strong> This is your federally protected right under CROA.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-sm font-medium">
                      4-30 Days
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong>Pro-rated refund</strong> based on unused portion of your subscription, minus any dispute letters already generated.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-sm font-medium">
                      110% Guarantee
                    </div>
                    <div>
                      <p className="text-gray-700">
                        If you're not satisfied with our software tools within 30 days, we'll refund 110% of your purchase price. Simply email us explaining why our tools didn't meet your expectations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Time */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Processing</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Refund requests are processed within 3-5 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Refunds are issued to the original payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">You will receive email confirmation when your refund is processed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">Bank processing may take an additional 5-10 business days</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-gray-800">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-gray-700">
                  <li>
                    • Your cancellation rights under CROA cannot be waived, even if you signed a contract stating otherwise.
                  </li>
                  <li>
                    • We will never charge you for services before they are fully performed.
                  </li>
                  <li>
                    • Cancellation does not affect any dispute letters you have already generated and mailed.
                  </li>
                  <li>
                    • You may dispute inaccurate information on your credit report directly with credit bureaus at no cost, without using any service.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Links */}
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Button variant="outline" asChild>
                <Link href="/croa-disclosure">CROA Disclosure</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="container">
          <div className="text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} DisputeStrike LLC. All rights reserved.
            </p>
            <p className="text-xs mt-2">
              DisputeStrike is dispute preparation software. We are NOT a credit repair organization as defined under CROA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
