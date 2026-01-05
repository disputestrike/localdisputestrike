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
                  <Link href="/quiz">Create Your Free Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - CreditFixrr Style */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Boost Your Credit Score{" "}
                <span className="text-green-600">FAST</span> with CreditCounsel AI!
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Take control of your credit yourself. CreditCounsel AI helps you fix your credit step by step.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6" asChild>
                      <Link href="/quiz">Become a Credit Warrior</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                      <a href={getLoginUrl()}>Login</a>
                    </Button>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                See how easy it is to improve your credit!
              </p>
              
              {/* Customer Avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">happy customers</span>
              </div>
            </div>
            
            {/* Right: Hero Image */}
            <div className="relative">
              <img 
                src="/hero-lifestyle.png" 
                alt="Happy woman with credit factors" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our AI Tools Section - CreditFixrr Style */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="order-2 md:order-1">
              <img 
                src="/couple-lifestyle.png" 
                alt="Happy couple using credit repair app" 
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            {/* Right: Content */}
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our AI Tools — Made Simple
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Find Mistakes on Your Credit Report
                    </h3>
                    <p className="text-gray-700">
                      Our smart tech reviews your credit report and spots errors, missing info, and things that could be hurting your score{" "}
                      <strong>even if you don't know what to look for.</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Break Down Your 3 Credit Reports
                    </h3>
                    <p className="text-gray-700">
                      We pull your reports from <strong>Experian, Equifax, and TransUnion</strong>, then explain what's helping or hurting you{" "}
                      <strong>in plain English.</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Create Dispute Letters Automatically
                    </h3>
                    <p className="text-gray-700">
                      No guessing. Our AI writes powerful letters for you to fix credit mistakes{" "}
                      <strong>fast and correctly.</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Personalized Credit Plan
                    </h3>
                    <p className="text-gray-700">
                      Want a <strong>car, house, or business credit?</strong> We'll show you what to fix and where to focus to help you reach your goal.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Credit Profile Tips
                    </h3>
                    <p className="text-gray-700">
                      Get clear, easy-to-follow suggestions to achieve your financial goals like buying a{" "}
                      <strong>home, car or personal and business credit.</strong>
                    </p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="/quiz">Join Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Powerhouse Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-green-600">
                Credit Powerhouse.
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      AI-Powered Violation Detection
                    </h3>
                    <p className="text-gray-700">
                      Our advanced system scans your entire credit report using{" "}
                      <strong>Metro-2 and FCRA standards</strong> instantly flagging errors, inconsistencies, and legal violations most people (and other platforms) miss.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      AI-Powered Credit Report Sync & Analysis
                    </h3>
                    <p className="text-gray-700">
                      Stay ahead with <strong>real-time monitoring</strong> and instant AI insights when your report changes including{" "}
                      <strong>inquiries, new accounts, deletions, and score drops.</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      AI-Driven Dispute & Legal Escalation Engine
                    </h3>
                    <p className="text-gray-700">
                      We automatically generate <strong>custom, compliant dispute letters</strong> and escalate to{" "}
                      <strong>legal-level action</strong> when your rights are ignored or violated.
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
                Get the same litigation-grade dispute letters that attorneys charge $2,500 for — powered by AI.
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
                <h3 className="text-xl font-bold text-gray-900">Upload Your Report</h3>
                <p className="text-gray-700">
                  Upload your credit report from any bureau. Our AI scans it in seconds.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create Dispute Letters</h3>
                <p className="text-gray-700">
                  Our AI generates litigation-grade letters with proper FCRA citations automatically.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900">Send & Track</h3>
                <p className="text-gray-700">
                  Download PDFs, mail via Certified Mail, and track your results in real-time.
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
              Credit Should Be Affordable.
            </h2>
            <p className="text-2xl">
              For everyone. Always.
            </p>
            <p className="text-lg opacity-90">
              We believe everyone deserves access to powerful credit repair tools without paying thousands to credit repair companies. 
              That's why we built CreditCounsel AI — litigation-grade dispute letters powered by AI, starting at just $29.
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
                      <span>AI-powered conflict detection</span>
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
                    "Deleted 8 negative accounts in 30 days! My score went from 580 to 675. This actually works!"
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
                    "Saved $12,000 compared to credit repair companies. The AI letters are better than what my attorney wrote!"
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
                    "Finally got approved for my mortgage! The cross-bureau conflict detection found issues I didn't even know existed."
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
              Ready to Fix Your Credit?
            </h2>
            <p className="text-xl">
              Join 2,847 happy customers who've already improved their credit scores.
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
