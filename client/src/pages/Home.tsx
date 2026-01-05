import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle2, FileText, Mail, Shield, TrendingUp, Zap, AlertCircle, Star, Play, Check, X } from "lucide-react";
import { Link } from "wouter";
import { LiveCounter } from "@/components/LiveCounter";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LiveCounter />
      <ExitIntentPopup />
      
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CreditCounsel AI" className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-900">CreditCounsel AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">Pricing</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium">How It Works</a>
            <a href="#reviews" className="text-gray-700 hover:text-gray-900 font-medium">Reviews</a>
            {isAuthenticated ? (
              <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                  <Link href="/quiz">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Original Content, CreditFixrr Style */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                The Most{" "}
                <span className="text-green-600">Advanced Litigation-Grade</span>{" "}
                Credit Repair Platform Ever Created
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Get 70-85% deletion rates with AI-generated dispute letters that credit bureaus can't detect. 
                Same quality as $2,500 attorneys, starting at just $29.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6" asChild>
                      <Link href="/quiz">Start Free Analysis</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                      <a href={getLoginUrl()}>Login</a>
                    </Button>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                Join 2,847 customers who've already deleted negative items and raised their scores 80-120 points.
              </p>
              
              {/* Customer Avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">2,847 happy customers</span>
                </div>
              </div>
            </div>
            
            {/* Right: Hero Image */}
            <div className="relative">
              <img 
                src="/hero-lifestyle.png" 
                alt="Credit repair success" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Bureau Conflict Detection - Our Secret Weapon */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="order-2 md:order-1">
              <img 
                src="/couple-lifestyle.png" 
                alt="Credit analysis" 
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            {/* Right: Content */}
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Cross-Bureau Conflict Detection
              </h2>
              
              <p className="text-lg text-gray-700">
                Our AI scans all 3 bureaus (TransUnion, Equifax, Experian) simultaneously to find <strong>impossible discrepancies</strong> that credit bureaus MUST delete under FCRA law.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Balance Conflicts
                    </h3>
                    <p className="text-gray-700">
                      TransUnion shows $5,000, Equifax shows $3,200 for the same account? <strong>That's impossible</strong> — we demand deletion.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Date Impossibilities
                    </h3>
                    <p className="text-gray-700">
                      Account opened in 2020 on one bureau, 2018 on another? <strong>Timeline violations</strong> trigger automatic deletion.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Status Discrepancies
                    </h3>
                    <p className="text-gray-700">
                      "Paid" on TransUnion but "Charged Off" on Experian? <strong>Conflicting statuses</strong> prove unverifiable reporting.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Re-Aging Detection
                    </h3>
                    <p className="text-gray-700">
                      Our AI detects illegal <strong>re-aging violations</strong> where bureaus reset dates to keep negative items longer — a direct FCRA violation.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="/quiz">Analyze My Credit Reports</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Litigation-Grade AI Engine */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                <span className="text-green-600">Litigation-Grade</span> AI Engine
              </h2>
              
              <p className="text-lg text-gray-700">
                Our advanced AI system generates dispute letters with the same quality as $2,500 attorneys — complete with proper FCRA citations, legal precedents, and violation analysis.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      Proper FCRA Citations
                    </h3>
                    <p className="text-gray-700">
                      Every letter includes exact legal citations: <strong>§ 1681i(a)(1)(A)</strong> for investigation requirements, <strong>§ 1681s-2(b)</strong> for furnisher duties, and more.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      Account-by-Account Analysis
                    </h3>
                    <p className="text-gray-700">
                      Detailed breakdown of <strong>each negative item</strong> with specific violations, timeline impossibilities, and legal arguments for deletion.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      Legal Consequences Warning
                    </h3>
                    <p className="text-gray-700">
                      Our letters cite <strong>statutory damages ($1,000 per violation)</strong> and attorney fees to pressure bureaus into compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Dashboard Mockup */}
            <div className="flex justify-center">
              <img 
                src="/dashboard-mockup.png" 
                alt="Credit monitoring dashboard" 
                className="w-full max-w-md h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Real Cost of Bad Credit */}
      <section id="pain-points" className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              The Real Cost of <span className="text-red-600">Bad Credit</span>
            </h2>
            
            <p className="text-xl text-gray-700">
              Bad credit isn't just a number — it's costing you thousands every year:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Higher Interest Rates</h3>
                      <p className="text-gray-700">
                        Pay <strong>$10,000+ more</strong> in interest over the life of a car loan or mortgage
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Loan Denials</h3>
                      <p className="text-gray-700">
                        Get rejected for mortgages, car loans, and credit cards you deserve
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Job Rejections</h3>
                      <p className="text-gray-700">
                        Lose job opportunities — 47% of employers check credit reports
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Security Deposits</h3>
                      <p className="text-gray-700">
                        Pay <strong>$500-1,000+</strong> in deposits for utilities, apartments, and phones
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Competitors Charge $1,500/Year. We're Just $29.
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Get the same litigation-grade dispute letters that attorneys charge $2,500 for — powered by AI with cross-bureau conflict detection.
              </p>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="/quiz">Start Fixing Your Credit Today</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section id="how-it-works" className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Your Reports</h3>
                <p className="text-gray-700">
                  Upload credit reports from all 3 bureaus. Our AI scans them in seconds and detects cross-bureau conflicts automatically.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Generates Letters</h3>
                <p className="text-gray-700">
                  Our litigation-grade AI writes customized dispute letters with proper FCRA citations, conflict analysis, and legal arguments.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mail & Track Results</h3>
                <p className="text-gray-700">
                  Download PDFs, mail via Certified Mail, and track your 30-day deadline. Most users see deletions within 45 days.
                </p>
              </div>
            </div>
            
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6" asChild>
              <Link href="/quiz">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Credit Repair Should Be Affordable.
            </h2>
            <p className="text-2xl">
              For everyone. Always.
            </p>
            <p className="text-lg opacity-90">
              We believe everyone deserves access to litigation-grade credit repair tools without paying thousands to attorneys or credit repair companies. 
              That's why we built CreditCounsel AI — the most advanced credit repair platform ever created, starting at just $29.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-700">
                No hidden fees. No subscriptions. Pay once, own forever.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* DIY Package */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">DIY Package</CardTitle>
                  <div className="text-4xl font-bold text-gray-900">$29</div>
                  <CardDescription>One-time payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-left">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>3 bureau dispute letters</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Cross-bureau conflict detection</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>FCRA legal citations</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>PDF download</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Mailing instructions</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/quiz">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Complete Repair */}
              <Card className="border-4 border-green-600 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Complete Repair</CardTitle>
                  <div className="text-4xl font-bold text-gray-900">$79</div>
                  <CardDescription>One-time payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-left">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Everything in DIY</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Furnisher dispute letters</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>CFPB complaint generator</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Email delivery</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Priority AI support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/quiz">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* White Glove */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">White Glove</CardTitle>
                  <div className="text-4xl font-bold text-gray-900">$199</div>
                  <CardDescription>One-time payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-left">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Everything in Complete</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Manual letter review</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Custom strategy session</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Unlimited revisions</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>1-on-1 expert support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/quiz">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              What Our Customers Say
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700">
                    "The cross-bureau conflict detection found 8 discrepancies I didn't even know existed. All 8 deleted within 30 days. Score went from 580 to 675!"
                  </p>
                  <div className="text-sm font-semibold text-gray-900">
                    - John D., Miami FL
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700">
                    "Saved $12,000 compared to credit repair companies. The AI letters are better than what my attorney wrote — proper FCRA citations and everything!"
                  </p>
                  <div className="text-sm font-semibold text-gray-900">
                    - Sarah M., Atlanta GA
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700">
                    "Finally got approved for my mortgage! The litigation-grade letters with legal consequences warnings got results in 21 days."
                  </p>
                  <div className="text-sm font-semibold text-gray-900">
                    - Michael R., Houston TX
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 bg-green-600 text-white rounded-lg p-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Delete Negative Items?
            </h2>
            <p className="text-xl">
              Join 2,847 customers who've already improved their credit scores with litigation-grade AI dispute letters.
            </p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
              <Link href="/quiz">Start Your Free Analysis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="CreditCounsel AI" className="h-8 w-8" />
                <span className="font-bold text-xl">CreditCounsel AI</span>
              </div>
              <p className="text-sm text-gray-600">
                Litigation-grade credit repair powered by AI.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/mailing-instructions">Mailing Instructions</Link></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="mailto:support@creditcounsel.ai">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© 2026 CreditCounsel AI. All rights reserved.</p>
            <p className="mt-2">
              This is educational software. We are not a credit repair organization as defined by federal law.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
