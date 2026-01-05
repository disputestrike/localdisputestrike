import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle2, FileText, Mail, Shield, TrendingUp, Zap, AlertCircle, Star, Play, Check, X, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "wouter";
import { LiveCounter } from "@/components/LiveCounter";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

export default function Home() {
  const { isAuthenticated } = useAuth();

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
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CreditCounsel" className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-900">CreditCounsel</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">Pricing</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium">How It Works</a>
            <a href="#reviews" className="text-gray-700 hover:text-gray-900 font-medium">Reviews</a>
            {isAuthenticated ? (
              <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 leading-tight">
                The Most{" "}
                <span className="text-orange-600">Advanced Litigation-Grade</span>{" "}
                Credit Repair Platform
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Get 70-85% deletion rates with AI-powered dispute letters that include proper FCRA citations and cross-bureau conflict detection. 
                Same quality as $2,500 attorneys, starting at just $29.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6" asChild>
                      <Link href="/quiz">Start Free Analysis</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                      <a href={getLoginUrl()}>Login</a>
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
                <span className="text-gray-700 ml-2 font-semibold">4.9/5 from 2,847 customers</span>
              </div>
            </div>
            
            {/* Right: Hero Image */}
            <div>
              <img src="/hero-lifestyle.png" alt="Happy customer with improved credit score" className="w-full rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Proven Results</h2>
            <p className="text-xl text-gray-700">Real numbers from real customers</p>
          </div>
          
          <img src="/success-metrics.png" alt="16,628 customers helped, 80+ points average increase, 95% success rate" className="w-full max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Why CreditCounsel Wins</h2>
            <p className="text-xl text-gray-700">The most advanced credit repair technology ever created</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Cross-Bureau Conflict Detection */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mb-4">
                  <img src="/icon-conflict-detection.png" alt="Cross-bureau conflict detection" className="w-24 h-24 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">Cross-Bureau Conflict Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Our AI automatically finds discrepancies between TransUnion, Equifax, and Experian. 
                  When bureaus report different information, they MUST delete the account under FCRA § 1681i(a)(5).
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: FCRA Legal Citations */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mb-4">
                  <img src="/icon-legal-citations.png" alt="FCRA legal citations" className="w-24 h-24 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">Litigation-Grade Legal Arguments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Every letter includes proper FCRA citations (§ 1681i, § 1681s-2), legal violations, 
                  and compelling arguments. Same quality as $2,500 attorneys.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: AI Letter Generation */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mb-4">
                  <img src="/icon-ai-generation.png" alt="AI letter generation" className="w-24 h-24 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">Undetectable AI Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Our AI generates unique, human-like letters that credit bureaus can't detect as templates. 
                  70-85% deletion rate vs 30-40% for generic templates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-700">Three simple steps to delete negative items and raise your score</p>
          </div>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img src="/step-upload.png" alt="Step 1: Upload credit report" className="w-full rounded-lg shadow-xl" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">1</div>
                  <h3 className="text-4xl font-extrabold text-gray-900">Upload Your Credit Report</h3>
                </div>
                <p className="text-xl text-gray-700">
                  Upload your credit reports from TransUnion, Equifax, and Experian. Our AI automatically extracts 
                  all negative accounts and identifies violations.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">2</div>
                  <h3 className="text-4xl font-extrabold text-gray-900">AI Analyzes & Creates Letters</h3>
                </div>
                <p className="text-xl text-gray-700">
                  Our AI detects cross-bureau conflicts, FCRA violations, and generates litigation-grade dispute letters 
                  with proper legal citations. Each letter is unique and undetectable.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <img src="/step-analyze.png" alt="Step 2: AI analyzes credit report" className="w-full rounded-lg shadow-xl" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img src="/step-send.png" alt="Step 3: Send dispute letters" className="w-full rounded-lg shadow-xl" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">3</div>
                  <h3 className="text-4xl font-extrabold text-gray-900">Send & Track Results</h3>
                </div>
                <p className="text-xl text-gray-700">
                  Download professional PDFs and mail via Certified Mail. Track delivery status and bureau responses. 
                  Most customers see deletions within 30-45 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-700">Real success stories from real people</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img src="/testimonial-person-1.png" alt="Sarah M." className="w-16 h-16 rounded-full" />
                  <div>
                    <p className="font-bold text-lg">Sarah M.</p>
                    <p className="text-sm text-gray-600">Miami, FL</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  "Deleted 8 negative accounts in 6 weeks! My score went from 580 to 760. 
                  The cross-bureau conflict detection found discrepancies I never knew existed. Worth every penny!"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img src="/testimonial-person-2.png" alt="James R." className="w-16 h-16 rounded-full" />
                  <div>
                    <p className="font-bold text-lg">James R.</p>
                    <p className="text-sm text-gray-600">Dallas, TX</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  "I tried DisputeBeast and Credit Repair Cloud - nothing worked. CreditCounsel's litigation-grade letters 
                  deleted 12 items in 2 months. Score jumped from 615 to 806. Finally got approved for my dream home!"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-2xl">
                    M
                  </div>
                  <div>
                    <p className="font-bold text-lg">Maria G.</p>
                    <p className="text-sm text-gray-600">Phoenix, AZ</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  "The FCRA citations in the letters are incredible. Bureaus had no choice but to delete. 
                  Went from 625 to 800 in 3 months. Best $99 I ever spent!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-700">No monthly fees. No hidden charges. Pay once, use forever.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>Perfect for 1-3 negative items</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">$29</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>3 dispute letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>Cross-bureau conflict detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>FCRA legal citations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>PDF downloads</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Professional (Most Popular) */}
            <Card className="border-4 border-orange-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-600 text-white px-4 py-1">MOST POPULAR</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription>Best for 4-10 negative items</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600 line-through ml-2">$149</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold">10 dispute letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>Everything in Starter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>Email delivery</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Complete */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Complete</CardTitle>
                <CardDescription>For serious credit repair</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">$199</span>
                  <span className="text-gray-600 line-through ml-2">$399</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold">Unlimited letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>Everything in Professional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>1-on-1 strategy call</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-orange-600" />
                  <span>Lifetime updates</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Statement Banner */}
      <section className="py-8 bg-orange-600 text-white">
        <div className="container text-center">
          <h3 className="text-3xl md:text-4xl font-bold">
            Credit Should Be Affordable. For everyone. Always.
          </h3>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Ready to Fix Your Credit?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Join 16,628 customers who've already deleted negative items and raised their scores 80+ points.
          </p>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-6" asChild>
            <Link href="/quiz">Start Free Analysis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="CreditCounsel" className="h-8 w-8" />
                <span className="font-bold text-xl">CreditCounsel</span>
              </div>
              <p className="text-gray-400 text-sm">
                The most advanced litigation-grade credit repair platform. Delete negative items and raise your score fast.
              </p>
            </div>

            {/* Column 2: Product */}
            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#reviews" className="hover:text-white">Reviews</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <h4 className="font-bold text-lg mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 CreditCounsel. All rights reserved.</p>
            <p className="mt-2">
              This is a software tool, not a credit repair service. We provide dispute letter generation software only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
