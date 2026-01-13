import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Upload, Brain, Send, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Features</a>
            </Link>
            <Link href="/how-it-works">
              <a className="text-orange-600 hover:text-orange-700 font-medium transition-colors">How It Works</a>
            </Link>
            <Link href="/pricing">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Pricing</a>
            </Link>
            <Link href="/faq">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">FAQ</a>
            </Link>
            <Link href="/money-back-guarantee">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Money Back Guarantee</a>
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
              How <span className="text-orange-600">DisputeStrike</span> Works
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Professional-grade dispute automation in three powerful rounds. Launch your disputes with precision strikes.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-20">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img loading="lazy" src="/step-upload-real.webp" alt="Upload credit reports" className="w-full rounded-xl shadow-xl" />
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Step 1</Badge>
                <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">Upload Your Credit Reports</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Upload reports from TransUnion, Equifax, and Experian. Our AI automatically extracts all negative accounts and identifies FCRA violations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Accepts PDF or images</p>
                      <p className="text-gray-600">Upload any format - we handle the rest</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Automatic extraction</p>
                      <p className="text-gray-600">AI reads and categorizes every negative item</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Secure & encrypted</p>
                      <p className="text-gray-600">Your data is protected with bank-level security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Step 2</Badge>
                <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">AI Analyzes & Creates Letters</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Our AI detects cross-bureau conflicts, generates documentation-driven Dispute letters with proper FCRA citations, and creates personalized arguments for each account.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Cross-bureau conflict detection</p>
                      <p className="text-gray-600">Finds discrepancies that support removal requests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">FCRA legal citations</p>
                      <p className="text-gray-600">§ 1681i, § 1681s-2, and penalty warnings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Unique, human-like letters</p>
                      <p className="text-gray-600">No templates - bureaus can't detect AI</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img loading="lazy" src="/step-analyze-real.webp" alt="AI analyzes and creates letters" className="w-full rounded-xl shadow-xl" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img loading="lazy" src="/step-send-real.webp" alt="Send and track" className="w-full rounded-xl shadow-xl" />
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Step 3</Badge>
                <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">Send & Track Results</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Download professional PDF letters, mail via Certified Mail, and track your disputes. Watch negative items get deleted and your score rise.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Professional PDF format</p>
                      <p className="text-gray-600">Ready to print and mail immediately</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Mailing instructions included</p>
                      <p className="text-gray-600">Complete guide with addresses and requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">30-day deadline tracking</p>
                      <p className="text-gray-600">Automatic reminders and escalation templates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Expected Timeline</h2>
            <p className="text-xl text-gray-700">Here's what to expect after you start</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Day 0 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    Day 0
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Upload & Generate Letters</h4>
                  <p className="text-gray-700">Upload your credit reports and let our AI generate your Dispute letters. Takes 5-10 minutes.</p>
                </div>
              </div>

              {/* Day 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    Day 1
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Mail Your Letters</h4>
                  <p className="text-gray-700">Print letters, gather required documents (ID, utility bill), and mail via Certified Mail with Return Receipt.</p>
                </div>
              </div>

              {/* Day 3-5 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    Day 3-5
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Letters Delivered</h4>
                  <p className="text-gray-700">Track delivery via USPS tracking number. You'll receive confirmation when bureaus receive your letters.</p>
                </div>
              </div>

              {/* Day 30 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    Day 30
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Response Deadline</h4>
                  <p className="text-gray-700">Bureaus must respond within 30 days by law (FCRA § 1681i). If they don't respond, items must be deleted.</p>
                </div>
              </div>

              {/* Day 35-45 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    Day 35+
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Check Results</h4>
                  <p className="text-gray-700">Check your mail for bureau responses. Pull updated credit reports to confirm deletions. Watch your score rise!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Our Track Record</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-extrabold text-orange-600 mb-4">3</div>
              <p className="text-xl text-gray-700">Powerful Rounds</p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-extrabold text-orange-600 mb-4">16,628</div>
              <p className="text-xl text-gray-700">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-extrabold text-orange-600 mb-4">4.9/5</div>
              <p className="text-xl text-gray-700">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Ready to Strike with Precision?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join 16,628 users who are striking with precision and defending with decisive action
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
