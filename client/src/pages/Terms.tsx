import { Link } from "wouter";
import { Shield } from "lucide-react";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium">Features</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-orange-600 font-medium">How It Works</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-orange-600 font-medium">Pricing</Link>
              <Link href="/faq" className="text-gray-700 hover:text-orange-600 font-medium">FAQ</Link>
              <Link href="/money-back-guarantee" className="text-gray-700 hover:text-orange-600 font-medium">110% Guarantee</Link>
              <UserDropdown />
            </nav>

            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="py-20">
        <div className="container max-w-4xl">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-12">Last Updated: January 5, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using DisputeStrike ("Service," "Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                DisputeStrike is a software platform that provides educational resources, document generation tools, and credit monitoring services. We are NOT a credit monitoring organization as defined by the Credit Monitoring Organizations Act (CROA). We provide software tools that enable you to exercise your legal rights under the Fair Credit Reporting Act (FCRA).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                DisputeStrike provides the following services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Software Tools:</strong> AI-powered document generation software that creates Dispute letters based on your input</li>
                <li><strong>Educational Resources:</strong> Credit education, FCRA training, and mailing instructions</li>
                <li><strong>Credit Analysis:</strong> Automated analysis of credit reports to identify potential inaccuracies</li>
                <li><strong>Document Templates:</strong> Professional letter templates with proper legal citations</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You retain full control over the dispute process. We do not contact credit bureaus on your behalf, nor do we guarantee any specific results. All actions taken with credit bureaus are performed by you, the consumer, exercising your rights under federal law.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using DisputeStrike, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and truthful information when using our services</li>
                <li>Only challenge items on your credit report that you believe to be inaccurate, incomplete, or unverifiable</li>
                <li>Comply with all applicable federal and state laws, including the FCRA</li>
                <li>Not use our service to dispute accurate information or engage in fraudulent activity</li>
                <li>Review all generated documents before sending them to credit bureaus</li>
                <li>Take full responsibility for all communications sent to credit bureaus</li>
                <li>Maintain the confidentiality of your account credentials</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                DisputeStrike offers one-time payment packages with no recurring subscriptions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Starter Package ($29):</strong> 3 Dispute letters, basic FCRA citations, PDF downloads</li>
                <li><strong>Professional Package ($99):</strong> 15 Dispute letters, cross-bureau conflict detection, priority support</li>
                <li><strong>Complete Package ($399):</strong> Unlimited letters, advanced FCRA documentation, 1-on-1 educational coaching (not legal advice)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                All payments are processed securely through Stripe. By purchasing a package, you agree to pay the stated price and authorize us to charge your payment method.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Refund Policy:</strong> We offer a 30-day software satisfaction guarantee. If you're not satisfied with our service, contact us within 30 days of purchase for a full refund. Refunds are not available after Dispute letters have been mailed to credit bureaus.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. No Guarantees</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                DisputeStrike provides software tools and educational resources, but we cannot and do not guarantee any specific results. Credit dispute outcomes depend on many factors outside our control, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>The accuracy of information on your credit reports</li>
                <li>The responsiveness of credit bureaus and data furnishers</li>
                <li>The strength of evidence supporting your disputes</li>
                <li>Your compliance with FCRA procedures and deadlines</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                While our customers have achieved an average results vary by case and score improvements (results vary), your individual results may vary. Past performance does not guarantee future results.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, software, algorithms, and materials provided through DisputeStrike are protected by copyright, trademark, and other intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Copy, modify, or distribute our software or content without permission</li>
                <li>Reverse engineer or attempt to extract our source code</li>
                <li>Resell or redistribute our services to third parties</li>
                <li>Remove copyright or proprietary notices from any materials</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CREDITCOUNSEL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for any claims arising from your use of the Service shall not exceed the amount you paid us in the twelve months prior to the claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless DisputeStrike, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for any reason, including if we believe you have violated these Terms. Upon termination, you will lose access to your account and any unused credits or services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of Wyoming, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the state or federal courts located in Wyoming.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>DisputeStrike</strong><br />
                Email: support@disputestrike.com<br />
                Website: <Link href="/" className="text-orange-600 hover:underline">disputestrike.com</Link>
              </p>
            </section>
          </div>
        </div>
      </div>

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
            <p>&copy; 2024 DisputeStrike. All rights reserved.</p>
            <p className="mt-2 text-sm">Credit Should Be Affordable. For everyone. Always.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
