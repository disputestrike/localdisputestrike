import { Link } from "wouter";
import { Shield, CheckCircle2, AlertTriangle, FileText, Mail, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";

export default function MoneyBackGuarantee() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="DisputeStrike" className="h-8 w-8" />
              <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium">Features</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-orange-600 font-medium">How It Works</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-orange-600 font-medium">Pricing</Link>
              <Link href="/faq" className="text-gray-700 hover:text-orange-600 font-medium">FAQ</Link>
              <Link href="/money-back-guarantee" className="text-orange-600 hover:text-orange-700 font-medium">110% Guarantee</Link>
              <UserDropdown />
            </nav>

            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
              DisputeStrike <span className="text-green-600">110%</span> Guarantee
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              We believe in the quality of our software. If you're not satisfied with our platform tools, we will return 110% of your money back.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> This is a software satisfaction guarantee covering platform usability and access — not credit outcomes, which vary by individual and cannot be guaranteed by any service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Trust Matters */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Your Trust Matters to Us!</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              We understand that managing your credit disputes can feel intimidating, especially if you've had disappointing experiences with other DIY solutions. At DisputeStrike, we're confident in our software tools' ability to help you organize and execute your disputes. That's why we offer the DisputeStrike 110% Software Satisfaction Guarantee, giving you peace of mind and eliminating any financial risk when trying our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Terms and Conditions */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Terms and Conditions of the 110% Software Satisfaction Guarantee</h2>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  This guarantee applies to all DisputeStrike customers who purchase any software package. The guarantee becomes effective on the date of purchase and remains valid for 30 days from that date. This guarantee covers your satisfaction with the software platform, tools, and user experience — not credit outcomes, which depend on individual circumstances and actions taken by credit bureaus.
                </p>
              </CardContent>
            </Card>

            {/* Eligibility Requirements */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Eligibility Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 font-medium">To qualify for the 110% Software Satisfaction Guarantee, you must meet the following criteria:</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <span><strong>Access the Platform:</strong> You must log in and access the DisputeStrike platform within 30 days of purchase.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <span><strong>Generate at Least One Letter:</strong> You must use our AI tools to generate at least one dispute letter to evaluate the software quality.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <span><strong>Provide Feedback:</strong> You must explain why the software did not meet your expectations when submitting your claim.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <span><strong>No Chargebacks:</strong> You must not have filed a chargeback with your payment provider prior to submitting a guarantee claim.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Claim Process */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Claim Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 font-medium">If you meet all eligibility requirements and are not satisfied with our software, follow these steps:</p>
                <ol className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                    <span>Email your claim to <strong>support@disputestrike.com</strong> with "110% Guarantee Claim" in the subject line.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                    <div>
                      <span>Attach the following documentation:</span>
                      <ul className="mt-2 ml-4 space-y-1 text-sm">
                        <li>• Your account email address</li>
                        <li>• Date of purchase</li>
                        <li>• Explanation of why the software did not meet your expectations</li>
                        <li>• Screenshots of any issues encountered (if applicable)</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                    <span><strong>Response Time:</strong> DisputeStrike will acknowledge receipt of your claim within 7 business days. Your claim will be reviewed, and a final decision will be provided within 14 business days.</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Disqualification Criteria */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  Disqualification Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 font-medium">You will be disqualified from the 110% Software Satisfaction Guarantee for any of the following:</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                    <span>Filing a chargeback with your payment provider before submitting a guarantee claim</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                    <span>Submitting a claim after the 30-day guarantee period has expired</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                    <span>Never accessing the platform or generating any letters</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                    <span>Claiming dissatisfaction based on credit outcomes rather than software functionality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                    <span>Providing false or misleading information in your claim</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Important Disclaimers */}
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-2xl text-blue-900">Important Disclaimers</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Credit Outcomes Not Guaranteed</h4>
                  <p className="text-gray-700">
                    This guarantee covers your satisfaction with the DisputeStrike software platform — not credit outcomes. Credit dispute results depend on many factors outside our control, including the accuracy of information on your credit reports, the responsiveness of credit bureaus and data furnishers, and your individual credit circumstances. No credit repair or dispute service can guarantee specific results.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Limitation of Liability</h4>
                  <p className="text-gray-700">
                    DisputeStrike shall not be liable for any indirect, incidental, special, or consequential damages, including but not limited to lost profits, loss of credit opportunities, or emotional distress resulting from the use of our services. The total liability for any claim arising under this guarantee shall not exceed 110% of the amount paid for the software package.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No Double Recovery</h4>
                  <p className="text-gray-700">
                    Customers who submit a claim under this guarantee and receive compensation are not eligible to pursue additional refunds or damages through other means for the same services.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Non-Transferable</h4>
                  <p className="text-gray-700">
                    The DisputeStrike 110% Software Satisfaction Guarantee applies only to the original purchaser and cannot be assigned or transferred to any other party.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  This guarantee shall be governed by the laws of the State of Wyoming and is subject to compliance with all applicable federal and state refund laws. In the event of a conflict between state law and this agreement, the applicable state law shall prevail.
                </p>
              </CardContent>
            </Card>

            {/* Modification */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Modification and Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  DisputeStrike reserves the right to modify or terminate this guarantee at any time without prior notice. Modifications will be effective immediately upon posting on the DisputeStrike website. This guarantee will be periodically reviewed to ensure compliance with evolving laws and regulations.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-green-800">
                  <Mail className="h-6 w-6" />
                  Questions or Concerns?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  For questions or concerns about the DisputeStrike 110% Software Satisfaction Guarantee, email <strong>support@disputestrike.com</strong>. Include "110% Guarantee Inquiry" in the subject line for a prompt response.
                </p>
              </CardContent>
            </Card>

            {/* Final Note */}
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-gray-700">
                By using DisputeStrike services, you acknowledge that you have read, understood, and agree to the terms outlined in this guarantee. Visit <Link href="/" className="text-orange-600 hover:underline">disputestrike.com</Link> for the most up-to-date version of this guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Try DisputeStrike Risk-Free</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get your credit disputes organized with our professional software tools. Protected by our 110% Software Satisfaction Guarantee.
          </p>
          <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/quiz">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/money-back-guarantee" className="text-gray-400 hover:text-white">110% Guarantee</Link></li>
                <li><Link href="/money-back-guarantee" className="text-gray-400 hover:text-white">110% Guarantee</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link href="/mailing-instructions" className="text-gray-400 hover:text-white">Mailing Guide</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DisputeStrike LLC. All rights reserved.</p>
            <p className="mt-2 text-sm">Registered in Wyoming, USA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
