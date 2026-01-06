import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, FileText, Star, Play, Check, X, Facebook, Twitter, Instagram, Linkedin, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { LiveCounter } from "@/components/LiveCounter";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { useState } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LiveCounter />
      <ExitIntentPopup />
      
      {/* Blue Header CTA Banner */}
      <div className="bg-blue-600 text-white py-3">
        <div className="container flex items-center justify-between">
          <p className="text-sm md:text-base font-medium">
            🎉 Limited Time: Get 30% OFF Your First Package - Ends in 24 Hours!
          </p>
          <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link href="/quiz">Claim Discount</Link>
          </Button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.png" alt="CreditCounsel" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-900">CreditCounsel</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Features</a>
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
                  <Link href="/quiz">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight">
              Delete Negative Items with{" "}
              <span className="text-orange-600">Litigation-Grade</span>{" "}
              Dispute Letters
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Get 70-85% deletion rates with AI-powered letters featuring proper FCRA citations and cross-bureau conflict detection. Same quality as $2,500 attorneys, starting at just $29.
            </p>
            
            {/* Hero Image - Real Person */}
            <div className="relative max-w-4xl mx-auto">
              <img src="/hero-real-person.png" alt="Happy customer using CreditCounsel" className="w-full rounded-2xl shadow-2xl" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-12 py-7 rounded-full" asChild>
                <Link href="/quiz">
                  Start Free Analysis <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
              <span className="text-gray-900 ml-2 font-bold text-lg">4.9/5 from 16,628 customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-orange-600 text-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">16,628+</div>
              <div className="text-xl font-medium">Happy Customers</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">80+ pts</div>
              <div className="text-xl font-medium">Average Score Increase</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">95%</div>
              <div className="text-xl font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Why CreditCounsel Dominates</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              The most advanced credit repair technology ever created
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img src="/icon-shield-check.png" alt="Cross-bureau conflict detection" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Cross-Bureau Conflict Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Our AI finds discrepancies between TransUnion, Equifax, and Experian. Bureaus MUST delete conflicting accounts under FCRA § 1681i(a)(5).
                </p>
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
                <p className="text-gray-700 text-center text-lg">
                  Every letter includes proper FCRA citations (§ 1681i, § 1681s-2), legal violations, and compelling arguments. Attorney-level quality.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img src="/icon-brain-ai.png" alt="AI letter generation" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Undetectable AI Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Unique, human-like letters that bureaus can't detect as templates. 70-85% deletion rate vs 30-40% for generic templates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-700">Three simple steps to delete negative items</p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src="/step-upload-real.png" alt="Upload credit reports" className="w-full rounded-xl shadow-xl" />
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Step 1</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Upload Your Credit Reports</h3>
                <p className="text-lg text-gray-700">
                  Upload reports from TransUnion, Equifax, and Experian. Our AI automatically extracts all negative accounts and identifies FCRA violations.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Step 2</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">AI Analyzes & Creates Letters</h3>
                <p className="text-lg text-gray-700">
                  Our AI detects cross-bureau conflicts, generates litigation-grade dispute letters with proper FCRA citations, and creates personalized arguments for each account.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <img src="/step-analyze-real.png" alt="AI analyzes and creates letters" className="w-full rounded-xl shadow-xl" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src="/step-send-real.png" alt="Send and track" className="w-full rounded-xl shadow-xl" />
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Step 3</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Send & Track Results</h3>
                <p className="text-lg text-gray-700">
                  Download professional PDF letters, mail via Certified Mail, and track your disputes. Watch negative items get deleted and your score rise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Real Results from Real People</h2>
            <p className="text-xl text-gray-700">See what our customers are saying</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img src="/testimonial-sarah-real.png" alt="Sarah Martinez" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-lg">Sarah Martinez</div>
                    <div className="text-gray-600">Miami, FL</div>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">
                  "Deleted 8 negative accounts in 45 days! My score went from 580 to 760. The cross-bureau conflict detection found discrepancies I never knew existed."
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img src="/testimonial-james-real.png" alt="James Chen" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-lg">James Chen</div>
                    <div className="text-gray-600">San Francisco, CA</div>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">
                  "The FCRA citations in these letters are no joke. Bureaus deleted 11 items without even investigating. Score jumped from 615 to 806!"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img src="/testimonial-maria-real.png" alt="Maria Rodriguez" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-lg">Maria Rodriguez</div>
                    <div className="text-gray-600">Houston, TX</div>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">
                  "Best $29 I ever spent. Deleted 6 collections and 2 charge-offs. Got approved for a mortgage I thought was impossible. Score went from 625 to 800!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-700">No subscriptions. Pay once, use forever.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">Starter</CardTitle>
                <div className="text-5xl font-extrabold text-gray-900 mb-2">$29</div>
                <div className="text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">3 dispute letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Basic FCRA citations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">PDF downloads</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Cross-bureau conflict detection</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6" size="lg" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional - Most Popular */}
            <Card className="border-4 border-orange-600 relative shadow-2xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-600 text-white text-sm px-4 py-1">MOST POPULAR</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">Professional</CardTitle>
                <div className="text-5xl font-extrabold text-orange-600 mb-2">$99</div>
                <div className="text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">15 dispute letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">Cross-bureau conflict detection</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">Litigation-grade FCRA citations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">AI-powered unique letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">Priority support</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6" size="lg" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Complete */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">Complete Repair</CardTitle>
                <div className="text-5xl font-extrabold text-gray-900 mb-2">$399</div>
                <div className="text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Unlimited dispute letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Everything in Professional</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Advanced legal arguments</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Round 2 & 3 escalation letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">1-on-1 strategy consultation</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6" size="lg" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "How is this different from other credit repair services?",
                a: "We use AI to detect cross-bureau conflicts that force deletions under FCRA law. Most services use generic templates with 30-40% success rates. Our litigation-grade letters get 70-85% deletion rates."
              },
              {
                q: "Is this legal?",
                a: "Absolutely. We're exercising your rights under the Fair Credit Reporting Act (FCRA). You have the legal right to dispute inaccurate information on your credit reports."
              },
              {
                q: "How long does it take to see results?",
                a: "Credit bureaus have 30-45 days to investigate disputes by law. Most customers see deletions within 45-60 days. Some see results in as little as 30 days."
              },
              {
                q: "Do I need to upload all 3 bureau reports?",
                a: "Yes! Our cross-bureau conflict detection compares all 3 reports to find discrepancies. This is our secret weapon for forcing deletions."
              },
              {
                q: "What if nothing gets deleted?",
                a: "While we have a 95% success rate, results vary by case. We provide escalation strategies and round 2 letters for stubborn items. Complete Repair package includes unlimited letters."
              }
            ].map((faq, i) => (
              <Card key={i} className="border-2 cursor-pointer hover:border-orange-600 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{faq.q}</CardTitle>
                    <ChevronDown className={`h-6 w-6 text-gray-600 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
                {openFaq === i && (
                  <CardContent>
                    <p className="text-gray-700 text-lg">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Ready to Delete Negative Items?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join 16,628 customers who've raised their credit scores by 80+ points
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/quiz">
              Start Free Analysis <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Mission Statement Banner */}
      <section className="py-8 bg-gray-900 text-white">
        <div className="container text-center">
          <p className="text-xl md:text-2xl font-bold">
            Credit Repair Should Be Affordable. For everyone. Always.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">About CreditCounsel</h3>
              <p className="text-sm">
                The most advanced credit repair platform. Litigation-grade dispute letters powered by AI.
              </p>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link href="/mailing-instructions" className="hover:text-white transition-colors">Mailing Guide</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Connect */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2026 CreditCounsel. All rights reserved.</p>
            <p className="mt-2 text-gray-400">
              CreditCounsel is a software platform. We are not a credit repair organization as defined under federal or state law.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
