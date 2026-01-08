import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Shield, AlertTriangle, FileText, Phone, Mail, MapPin } from "lucide-react";

export default function CROADisclosure() {
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
            <Shield className="h-16 w-16 text-orange-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Consumer Rights & CROA Disclosure
            </h1>
            <p className="text-xl text-gray-700">
              Important information about your rights under federal law
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* CROA Disclosure - Verbatim Required Statement */}
            <Card className="border-2 border-orange-500">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-6 w-6" />
                  CREDIT REPAIR ORGANIZATIONS ACT DISCLOSURE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <p className="text-gray-800 font-medium mb-4">
                    CONSUMER CREDIT FILE RIGHTS UNDER STATE AND FEDERAL LAW
                  </p>
                  <p className="text-gray-700 mb-4">
                    You have a right to dispute inaccurate information in your credit report by contacting the credit bureau directly. However, neither you nor any "credit repair" company or credit repair organization has the right to have accurate, current, and verifiable information removed from your credit report. The credit bureau must remove accurate, negative information from your report only if it is over 7 years old. Bankruptcy information can be reported for 10 years.
                  </p>
                  <p className="text-gray-700 mb-4">
                    You have a right to obtain a free copy of your credit report from a credit bureau. You may obtain a free copy of your credit report once every 12 months from each of the three nationwide credit bureaus by visiting www.annualcreditreport.com or by calling 1-877-322-8228.
                  </p>
                  <p className="text-gray-700 mb-4">
                    You have a right to receive a free copy of your credit report if a company takes adverse action against you, such as denying your application for credit, insurance, or employment, and you request your report within 60 days of receiving notice of the action. The notice will give you the name, address, and phone number of the credit bureau.
                  </p>
                  <p className="text-gray-700 mb-4">
                    You have a right to add a summary explanation to your credit report if your dispute is not resolved to your satisfaction.
                  </p>
                  <p className="text-gray-700 mb-4">
                    You have a right to sue a credit repair organization that violates the Credit Repair Organization Act. This law prohibits deceptive practices by credit repair organizations.
                  </p>
                  <p className="text-gray-700 font-medium">
                    You have the right to cancel your contract with any credit repair organization for any reason within 3 business days from the date you signed it.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                  Your Rights Under the CROA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">✓ Right to Dispute Directly</h4>
                    <p className="text-sm text-gray-700">
                      You can dispute inaccurate information directly with credit bureaus at no cost. DisputeStrike provides tools to help you exercise this right, but you are not required to use any service.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">✓ Right to Free Credit Reports</h4>
                    <p className="text-sm text-gray-700">
                      You are entitled to one free credit report per year from each bureau at AnnualCreditReport.com or by calling 1-877-322-8228.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">✓ Right to Cancel</h4>
                    <p className="text-sm text-gray-700">
                      You may cancel any contract with a credit repair organization within 3 business days of signing, for any reason, without penalty.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">✓ Right to Written Contract</h4>
                    <p className="text-sm text-gray-700">
                      You have the right to a written contract specifying services, duration, total cost, and any guarantees before any services are performed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What We Do NOT Do */}
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800">What DisputeStrike Does NOT Do</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-gray-700">We do NOT guarantee removal of any information from your credit report</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-gray-700">We do NOT promise specific credit score improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-gray-700">We do NOT remove accurate, current, and verifiable information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-gray-700">We do NOT provide legal advice or act as attorneys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-gray-700">We are NOT affiliated with any credit bureau</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-gray-700">We do NOT charge fees before services are fully performed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* What We DO */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">What DisputeStrike DOES Provide</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">AI-assisted document preparation tools to help you draft dispute letters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">Educational resources about your rights under the FCRA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">Organization tools to track your dispute progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">Templates aligned with FCRA documentation standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">YOU generate and mail your own letters - you remain in control</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* No Upfront Fees */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">Fee Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">
                  Under the Credit Repair Organizations Act, credit repair organizations are prohibited from charging or receiving money or other valuable consideration for the performance of any service which the credit repair organization has agreed to perform for any consumer before such service is fully performed.
                </p>
                <p className="text-gray-700 font-medium">
                  DisputeStrike is a software platform that provides dispute preparation tools. You pay for access to our software tools, not for credit repair services. You are responsible for generating and mailing your own dispute letters.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Business Address</h4>
                      <p className="text-sm text-gray-600">
                        DisputeStrike LLC<br />
                        1712 Pioneer Ave, Suite 500, Cheyenne, WY 82001<br />
                        [City, State ZIP]
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-sm text-gray-600">
                        support@disputestrike.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Phone</h4>
                      <p className="text-sm text-gray-600">
                        (307) 555-0123
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Button variant="outline" asChild>
                <Link href="/cancellation">Cancellation Policy</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/privacy">Privacy Policy</Link>
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
