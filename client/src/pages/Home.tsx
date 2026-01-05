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
                Credit Repair Platform Ever Created
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Get 70-85% deletion rates with AI-generated dispute letters that credit bureaus can't detect. 
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
                alt="Happy customer with improved credit score" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 mb-2">Join other</p>
            <h2 className="text-7xl md:text-8xl font-extrabold text-orange-600 mb-2">16,628</h2>
            <p className="text-2xl font-semibold text-gray-900">happy customers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="mb-4">
                <h3 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-2">80+</h3>
                <p className="text-xl font-semibold text-orange-600">pts</p>
              </div>
              <p className="text-lg text-gray-700"><strong>Creditcounsel users</strong> see an average <strong>80+ point score increase</strong> in <strong>3-6 months.</strong></p>
            </div>
            <div>
              <div className="mb-4">
                <h3 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-2">95%</h3>
              </div>
              <p className="text-lg text-gray-700"><strong>95%</strong> of users resolve <strong>at least one</strong> major <strong>credit error</strong></p>
            </div>
            <div>
              <div className="mb-4">
                <h3 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-2">$29</h3>
              </div>
              <p className="text-lg text-gray-700">vs <strong>$1,500/year</strong> competitors charge for the same results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Credit Scores Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Real Results from Real Customers</h2>
            <p className="text-xl text-gray-700">See the dramatic credit score improvements our customers achieve</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Sarah M., Miami FL</CardTitle>
                <CardDescription>3 months with CreditCounsel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before</p>
                    <p className="text-5xl font-bold text-red-600">580</p>
                  </div>
                  <ArrowRight className="h-8 w-8 mx-auto text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">After</p>
                    <p className="text-5xl font-bold text-green-600">760</p>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">+180 points | 12 items deleted</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle>James T., Atlanta GA</CardTitle>
                <CardDescription>4 months with CreditCounsel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before</p>
                    <p className="text-5xl font-bold text-red-600">615</p>
                  </div>
                  <ArrowRight className="h-8 w-8 mx-auto text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">After</p>
                    <p className="text-5xl font-bold text-green-600">806</p>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">+191 points | 15 items deleted</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Maria L., Houston TX</CardTitle>
                <CardDescription>2 months with CreditCounsel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before</p>
                    <p className="text-5xl font-bold text-red-600">625</p>
                  </div>
                  <ArrowRight className="h-8 w-8 mx-auto text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">After</p>
                    <p className="text-5xl font-bold text-green-600">800</p>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">+175 points | 9 items deleted</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <img src="/feature-before-after.png" alt="Credit score transformation" className="mx-auto max-w-2xl w-full rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Why CreditCounsel Beats Every Competitor</h2>
            <p className="text-xl text-gray-700">The only platform with litigation-grade AI and cross-bureau conflict detection</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-orange-600" />
                  <CardTitle>Cross-Bureau Conflict Detection</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Our AI automatically finds impossible discrepancies between TransUnion, Equifax, and Experian. 
                  When bureaus report different dates, amounts, or statuses for the same account, they MUST delete it.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-orange-600" />
                  <CardTitle>Litigation-Grade Legal Arguments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Every letter includes proper FCRA citations (§ 1681i, § 1681s-2), timeline analysis, 
                  and legal violations that force bureaus to investigate and delete.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-orange-600" />
                  <CardTitle>AI-Powered Account Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Upload your credit report and our AI extracts every negative account, analyzes violations, 
                  and generates custom dispute letters automatically.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-orange-600" />
                  <CardTitle>Professional PDF Letters</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Download perfectly formatted dispute letters ready to mail via Certified Mail. 
                  Includes all required legal language and proper formatting.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-orange-600" />
                  <CardTitle>Complete Mailing Instructions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Step-by-step guide on what documents to include (ID, utility bill) and how to mail via 
                  Certified Mail with Return Receipt for legal proof.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-orange-600" />
                  <CardTitle>Tracking & Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Track every letter from generation to mailing to bureau response. 
                  See exactly which items are under investigation and which got deleted.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal Power Section with Image */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">Litigation-Grade Legal Power</h2>
              <p className="text-xl text-gray-700 mb-6">
                Our AI generates the same quality dispute letters that attorneys charge $2,500+ for. 
                Every letter includes proper FCRA citations, legal violations, and compelling arguments.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">FCRA § 1681i Compliance</p>
                    <p className="text-gray-700">Proper legal citations in every letter</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Timeline Violation Detection</p>
                    <p className="text-gray-700">Identifies impossible dates and re-aging</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Cross-Bureau Conflicts</p>
                    <p className="text-gray-700">Forces deletion when bureaus contradict each other</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <img src="/feature-legal-power.png" alt="Litigation-grade legal documents" className="w-full rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Success Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/lifestyle-family-happy.png" alt="Happy family celebrating credit success" className="w-full rounded-lg shadow-xl" />
            </div>
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">Unlock Your Financial Future</h2>
              <p className="text-xl text-gray-700 mb-6">
                Bad credit costs you $10,000+ in lifetime fees. CreditCounsel helps you delete negative items 
                and raise your score so you can buy a home, get a car loan, and achieve financial freedom.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-orange-600" />
                  <p className="text-gray-700">Qualify for mortgages and auto loans</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-orange-600" />
                  <p className="text-gray-700">Save thousands on interest rates</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-orange-600" />
                  <p className="text-gray-700">Pass employment background checks</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-orange-600" />
                  <p className="text-gray-700">Get approved for credit cards and business loans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">How CreditCounsel Works</h2>
            <p className="text-xl text-gray-700">Three simple steps to delete negative items and raise your score</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-orange-600">1</span>
                </div>
                <CardTitle>Upload Your Credit Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Upload your credit report PDF from any bureau. Our AI automatically extracts all negative accounts 
                  and identifies violations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-orange-600">2</span>
                </div>
                <CardTitle>AI Generates Dispute Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Our AI creates litigation-grade dispute letters with proper FCRA citations, cross-bureau conflicts, 
                  and legal violations for each account.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-orange-600">3</span>
                </div>
                <CardTitle>Mail & Track Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Download PDF letters, mail via Certified Mail (we provide complete instructions), 
                  and track responses in your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <img src="/feature-automation.png" alt="Automated credit repair process" className="mx-auto max-w-2xl w-full rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-700">Real success stories from real people</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle>Sarah M.</CardTitle>
                <CardDescription>Miami, FL</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  "CreditCounsel deleted 12 negative items in 3 months. My score went from 580 to 760! 
                  I just got approved for a mortgage. This platform is AMAZING!"
                </p>
                <p className="text-sm text-orange-600 font-semibold">+180 points | 12 deletions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle>James T.</CardTitle>
                <CardDescription>Atlanta, GA</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  "I was paying $150/month to a credit repair company. CreditCounsel gave me BETTER results 
                  for $29 one-time. The AI letters are incredible."
                </p>
                <p className="text-sm text-orange-600 font-semibold">+191 points | 15 deletions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle>Maria L.</CardTitle>
                <CardDescription>Houston, TX</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  "The cross-bureau conflict detection is genius. Found 9 accounts with different dates 
                  across bureaus - all got deleted! Score up 175 points in 2 months."
                </p>
                <p className="text-sm text-orange-600 font-semibold">+175 points | 9 deletions</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <img src="/testimonial-success.png" alt="Customer success stories" className="mx-auto max-w-2xl w-full rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-700">No monthly fees. No hidden charges. Pay once, use forever.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect for testing the platform</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">3 dispute letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">AI account analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">PDF downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Mailing instructions</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-orange-600 border-2 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Complete</CardTitle>
                <CardDescription>Best value for serious credit repair</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">15 dispute letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Cross-bureau conflict detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Priority AI analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Email delivery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Tracking dashboard</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Unlimited</CardTitle>
                <CardDescription>For maximum deletions</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$399</span>
                  <span className="text-gray-600">/one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Unlimited letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">All Complete features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">Lifetime access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">AI chat assistant</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href="/quiz">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-700 text-lg">
              💳 We accept all major payment methods | 🔒 256-bit SSL encryption | ✅ 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement Banner */}
      <section className="py-12 bg-orange-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Credit Repair Should Be Affordable. For Everyone. Always.
          </h2>
          <p className="text-xl opacity-90 mb-6">
            CreditCounsel is a tool, not a trap. We believe everyone deserves access to credit and financial opportunities—not just those who can afford overpriced services.
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100" asChild>
            <Link href="/quiz">Start Your Free Analysis</Link>
          </Button>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Ready to Fix Your Credit?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Join 2,847 customers who've already deleted negative items and raised their scores 80-120 points.
          </p>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-6" asChild>
            <Link href="/quiz">Start Free Analysis Now</Link>
          </Button>
          <p className="text-sm text-gray-600 mt-4">No credit card required • Takes 2 minutes • Get instant results</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Column 1: Logo & Mission */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="CreditCounsel" className="h-8 w-8" />
                <span className="font-bold text-xl">CreditCounsel</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                We provide you with the knowledge, the dispute strategies, the tools, and the resources 
                to help you achieve the credit scores you deserve.
              </p>
            </div>
            
            {/* Column 2: Company */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-orange-400">Company</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">How It Works</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><Link href="/quiz" className="text-gray-400 hover:text-white transition">Get Started</Link></li>
                <li><Link href="/mailing-instructions" className="text-gray-400 hover:text-white transition">Mailing Guide</Link></li>
              </ul>
            </div>
            
            {/* Column 3: Legal */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-orange-400">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FCRA Compliance</a></li>
              </ul>
            </div>
            
            {/* Column 4: Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-orange-400">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Get Credit Report</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FCRA Rights</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Support</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 CreditCounsel. All rights reserved. | Not a credit repair service - we provide software tools.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
