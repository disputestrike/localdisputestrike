import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Shield, FileText, Brain, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Features() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.png" alt="DisputeStrike" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features">
              <a className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Features</a>
            </Link>
            <Link href="/how-it-works">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">How It Works</a>
            </Link>
            <Link href="/pricing">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Pricing</a>
            </Link>
            <Link href="/faq">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">FAQ</a>
            </Link>
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Start Your Journey Free</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
              <span className="text-orange-600">Strike Precision</span> Into Professional-Grade <span className="text-orange-600">Dispute Automation</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              AI-assisted document preparation tools focused on accuracy, documentation, and FCRA compliance. You generate and mail your own letters.
            </p>
            
            {/* Plain-English Software Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mt-6">
              <p className="text-sm text-blue-800">
                <strong>DisputeStrike is software — not a credit repair service.</strong> You remain fully in control of all disputes. Results vary by individual.
              </p>
            </div>
            
            {/* Credit Score Gauge Visual */}
            <div className="max-w-md mx-auto mt-12">
              <img 
                src="/credit-score-gauge.png" 
                alt="Excellent credit score of 750" 
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* Feature 1 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img src="/icon-shield-check.png" alt="Cross-bureau conflict detection" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Cross-Bureau Conflict Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg mb-4">
                  Our AI finds discrepancies between TransUnion, Equifax, and Experian. Bureaus MUST delete conflicting accounts under FCRA § 1681i(a)(5).
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Automatic discrepancy detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Balance inconsistencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Date mismatches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Status conflicts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img src="/icon-document-legal.png" alt="FCRA legal citations" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Litigation-Grade Legal Arguments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg mb-4">
                  Every letter includes proper FCRA citations (§ 1681i, § 1681s-2), legal violations, and compelling arguments. Attorney-level quality.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">FCRA § 1681i citations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Legal violation documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Precedent case references</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Penalty warnings</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img src="/ai-credit-analysis.png" alt="AI letter generation" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Undetectable AI Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg mb-4">
                  Unique, human-like letters that bureaus can't detect as templates. results vary by case vs 30-40% for generic templates.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unique letter generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Human-like writing style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Personalized arguments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">No template detection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Feature Detail 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">FCRA Compliance</h3>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  Every letter is 100% compliant with the Fair Credit Reporting Act. We leverage your legal rights under federal law to force credit bureaus to investigate and delete inaccurate information.
                </p>
                <p className="text-lg text-gray-700">
                  Our system automatically includes the correct legal citations, deadlines, and consequences for non-compliance, making it impossible for bureaus to ignore your disputes.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Key Legal Protections:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">30-day investigation requirement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Mandatory deletion of unverifiable items</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">$1,000+ penalties for violations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Attorney fees if they break the law</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Detail 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-50 p-8 rounded-xl">
                <h4 className="text-xl font-bold text-gray-900 mb-4">What Gets Analyzed:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Collections accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Charge-offs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Late payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Bankruptcies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Foreclosures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Inquiries</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">AI-Powered Analysis</h3>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  Our advanced AI automatically extracts every negative item from your credit reports and analyzes them for legal violations, inconsistencies, and dispute opportunities.
                </p>
                <p className="text-lg text-gray-700">
                  The system compares all three bureaus simultaneously to find conflicts that support removal requests under FCRA law. This is the secret weapon that gives us results vary by cases.
                </p>
              </div>
            </div>

            {/* Feature Detail 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">Deadline Tracking</h3>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  Credit bureaus have 30 days to investigate your disputes by law. Our system automatically tracks deadlines and alerts you when responses are due.
                </p>
                <p className="text-lg text-gray-700">
                  If bureaus fail to respond within 30 days, the items MUST be deleted automatically. We provide escalation templates for non-compliance.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Timeline Features:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Automatic 30-day countdown</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Email reminders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Escalation letter templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">CFPB complaint assistance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Examples Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl md:text-6xl font-extrabold text-center text-gray-900 mb-4">See How It Works</h2>
          <p className="text-xl text-gray-700 text-center mb-16 max-w-3xl mx-auto">
            Real examples of our documentation-driven letters and cross-bureau conflict detection
          </p>
          
          <div className="space-y-20">
            {/* Dispute Letter Example */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Litigation-Grade Dispute Letter</h3>
              <img 
                src="/Attack-letter-example.png" 
                alt="Example Dispute letter with FCRA citations highlighted" 
                className="w-full rounded-xl shadow-2xl"
              />
              <p className="text-center text-gray-700 mt-6 text-lg">Notice the highlighted FCRA citations and statute references - this is what makes our letters so effective</p>
            </div>
            
            {/* Cross-Bureau Comparison */}
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Cross-Bureau Conflict Detection</h3>
              <img 
                src="/triple-bureau-comparison.png" 
                alt="Three credit bureaus showing conflicting information" 
                className="w-full rounded-xl shadow-2xl"
              />
              <p className="text-center text-gray-700 mt-6 text-lg">Our AI automatically detects these conflicts - conflicting information = automatic deletion under FCRA law</p>
            </div>
            
            {/* FCRA Citations */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Legal Weapons We Use</h3>
              <img 
                src="/fcra-citations-graphic.png" 
                alt="Key FCRA legal citations infographic" 
                className="w-full"
              />
              <p className="text-center text-gray-700 mt-6 text-lg">These are the exact legal citations that force bureaus to delete negative items</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Ready to Strike with Precision?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Start your free credit analysis and experience the precision of professional-grade dispute automation
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/quiz">Start Free Analysis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container">
          <div className="text-center">
            <p className="text-sm">© 2025 DisputeStrike LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
