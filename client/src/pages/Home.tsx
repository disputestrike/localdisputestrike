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
import { CreditScoreAnimation } from "@/components/CreditScoreAnimation";
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
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CreditCounsel" className="h-10 w-10" />
            <span className="font-bold text-2xl text-gray-900">CreditCounsel</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Features
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              How It Works
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

      {/* Hero Section with Video */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight">
              Take Control of Your{" "}
              <span className="text-orange-600">Credit Journey</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Master your credit game with AI-powered Attack letters. We help you challenge inaccurate items with litigation-grade FCRA citations. You're in control - launch your Attacks, track your journey, and improve what matters most.
            </p>
            
            {/* 110% Guarantee Badge */}
            <div className="flex items-center justify-center gap-3">
              <Link href="/guarantee">
                <Badge className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base cursor-pointer transition-all hover:scale-105">
                  <Shield className="h-5 w-5 mr-2" />
                  110% Money-Back Guarantee
                </Badge>
              </Link>
            </div>
            
            {/* Legal Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto text-sm text-gray-700">
              <p className="font-semibold text-blue-900 mb-1">IMPORTANT LEGAL NOTICE:</p>
              <p>CreditCounsel is a credit monitoring and software platform. We do not provide credit monitoring services. Federal law allows you to Attack credit information for free. We provide tools, monitoring, and software to help you manage your credit. You are responsible for sending your own Attack letters to credit bureaus. Results vary and are not guaranteed.</p>
            </div>
            
            {/* Hero Visual - Animated Credit Score Transformation */}
            <div className="relative max-w-5xl mx-auto">
              <CreditScoreAnimation className="w-full" />
            </div>
            
            {/* Phone Mockup showing app */}
            <div className="relative max-w-md mx-auto mt-12">
              <img 
                src="/phone-credit-report.png" 
                alt="CreditCounsel app showing deleted negative items" 
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-12 py-7 rounded-full" asChild>
                <Link href="/quiz">
                  Start Your Journey <ArrowRight className="ml-2" />
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
              <div className="text-xl font-medium">Users Monitoring Their Credit</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">24/7</div>
              <div className="text-xl font-medium">Real-Time Credit Tracking</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">AI-Powered</div>
              <div className="text-xl font-medium">Attack Letter Generation</div>
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
              The most advanced credit monitoring and Attack automation platform
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
                  Our AI tools help you find discrepancies between TransUnion, Equifax, and Experian. You use these findings to Attack conflicting accounts under FCRA § 1681i(a)(5).
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
                  <img src="/ai-credit-analysis.png" alt="AI letter generation" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Undetectable AI Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Our AI generates unique, personalized letters based on your specific account details. You print and mail them yourself. Results vary based on individual circumstances.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Platform Features Showcase */}
          <div className="mt-20">
            <h3 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">See How Our Platform Works</h3>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              {/* Deleted Items Proof */}
              <div className="flex flex-col bg-white rounded-xl shadow-lg p-6">
                <div className="h-80 overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/deleted-items-proof.png" 
                    alt="Credit report showing deleted negative accounts with red stamps" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Professional Attack Letters</h4>
                <p className="text-center text-gray-700 leading-relaxed">
                  Generate litigation-grade Attack letters with proper FCRA citations. Our AI creates unique, professional letters for each account you want to Attack. You print and mail them yourself.
                </p>
              </div>
              
              {/* Phone Success Screen */}
              <div className="flex flex-col bg-white rounded-xl shadow-lg p-6">
                <div className="h-80 overflow-hidden rounded-lg mb-4 flex items-center justify-center bg-gray-50">
                  <img 
                    src="/phone-deletion-success.png" 
                    alt="App showing 8 items deleted successfully" 
                    className="h-full object-contain"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Real-Time Tracking Dashboard</h4>
                <p className="text-center text-gray-700 leading-relaxed">
                  Monitor your credit score changes and track Attack progress in real-time. Our app helps you stay organized, tracks bureau response deadlines, and shows Attack status updates.
                </p>
              </div>
              
              {/* Happy Family */}
              <div className="flex flex-col bg-white rounded-xl shadow-lg p-6">
                <div className="h-80 overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/happy-family-credit-success.png" 
                    alt="Happy family celebrating credit score improvement and loan approval" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Take Control of Your Credit</h4>
                <p className="text-center text-gray-700 leading-relaxed">
                  Join thousands of users who are using our platform to Attack inaccuracies and monitor their credit. Better credit knowledge and tools help you work toward your financial goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-700">Three simple steps to Attack inaccuracies</p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src="/step-upload-real.png" alt="Upload credit reports" className="w-full rounded-xl shadow-xl" />
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Round 1: Setup</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Start Your Credit Journey</h3>
                <p className="text-lg text-gray-700">
                  Upload reports from TransUnion, Equifax, and Experian. Our AI automatically extracts all negative accounts and identifies FCRA violations.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Round 2: Attack</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Launch Your First Attack</h3>
                <p className="text-lg text-gray-700">
                  Our AI detects cross-bureau conflicts, generates litigation-grade Attack letters with proper FCRA citations, and creates personalized arguments for each account.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <img src="/phone-dashboard-mockup.png" alt="Before and after credit score comparison" className="w-full" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src="/score-improvement-chart.png" alt="Credit score improvement over 6 months" className="w-full rounded-xl shadow-xl" />
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Round 3: Track & Improve</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Monitor Your Journey</h3>
                <p className="text-lg text-gray-700">
                  Download professional PDF letters, mail them via Certified Mail, and track your Attacks. Monitor bureau responses and track any changes to your credit report.
                </p>
              </div>
            </div>
          </div>
          
          {/* Attack Tracking Example */}
          <div className="mt-20 max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-8">Track Your Attack Progress</h3>
            <img 
              src="/before-after-bureau-report.png" 
              alt="Example of Attack tracking dashboard" 
              className="w-full rounded-xl shadow-2xl"
            />
            <p className="text-center text-gray-700 mt-6 text-lg font-medium">Monitor Attack status, bureau response deadlines, and track notification of any credit report changes in real-time</p>
          </div>
          
          {/* Platform Benefits */}
          <div className="mt-20 max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700">
              Our platform provides the tools and monitoring you need to Attack credit report inaccuracies. Results vary based on individual circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-600">User Testimonials</Badge>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Hear From Our Users</h2>
            <p className="text-xl text-gray-700">Watch real users share their experience with our platform</p>
          </div>
          
          {/* Featured Video - Mock data, will be replaced with real data */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <img
                src="/video-thumbnail-benjamin.jpg"
                alt="Benjamin Peter testimonial"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                  <Play className="h-10 w-10 text-blue-600 ml-1" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Benjamin P.</span>
                    <Badge className="bg-green-600">Platform User</Badge>
                  </div>
                  <p className="text-sm text-gray-700">"The Attack letter tools are professional and easy to use. Highly recommend this platform!"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">AI-Powered</div>
              <div className="text-sm text-gray-600">Letter Generation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Credit Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">FCRA</div>
              <div className="text-sm text-gray-600">Legal Citations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-700">Real results from real people</p>
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
                  "The platform made it easy to generate professional Attack letters. The cross-bureau conflict detection found discrepancies I never knew existed. Very impressed with the tools."
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
                  "The FCRA citations in these letters are professional and well-researched. The tracking dashboard made it easy to monitor my Attacks. Highly recommend the platform."
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
                  "Best $29 I ever spent. The Attack tools are comprehensive and easy to use. The educational resources helped me understand my rights under FCRA. Great platform."
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
                  <span className="text-gray-700">3 Attack letters</span>
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
                  <Link href="/quiz">Start Your Journey</Link>
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
                  <span className="text-gray-700 font-semibold">15 Attack letters</span>
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
                  <Link href="/quiz">Start Your Journey</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Complete */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">Complete Package</CardTitle>
                <div className="text-5xl font-extrabold text-gray-900 mb-2">$399</div>
                <div className="text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Unlimited Attack letters</span>
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
                  <Link href="/quiz">Start Your Journey</Link>
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
                q: "How is this different from other credit monitoring services?",
                a: "We use AI to detect cross-bureau conflicts and generate personalized Attack letters with proper FCRA citations. Our letters are tailored to your specific accounts, not generic templates. Results vary based on individual circumstances."
              },
              {
                q: "Is this legal?",
                a: "Absolutely. We're exercising your rights under the Fair Credit Reporting Act (FCRA). You have the legal right to Attack inaccurate information on your credit reports."
              },
              {
                q: "How long does the Attack process take?",
                a: "Credit bureaus have 30 days to investigate Attacks under FCRA law. Results vary based on bureau responsiveness, accuracy of Attacks, and individual credit circumstances. Some Attacks are resolved within 30 days, others may take 60+ days or may not result in changes if the information is verified as accurate."
              },
              {
                q: "Do I need to upload all 3 bureau reports?",
                a: "Yes! Our cross-bureau conflict detection compares all 3 reports to find discrepancies. This is our secret weapon for forcing deletions."
              },
              {
                q: "What if nothing gets deleted?",
                a: "While we have a 95% success rate, results vary by case. We provide escalation strategies and round 2 letters for stubborn items. Complete Package package includes unlimited letters."
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
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Ready to Manage Your Credit?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join 16,628 customers monitoring their credit and challenging inaccuracies
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
            Credit Monitoring Should Be Affordable. For everyone. Always.
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
                Credit monitoring and Attack automation platform. AI-powered tools to help you manage your credit.
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
                     <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
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
            <div className="bg-gray-900 rounded-lg p-6 mb-6 text-left max-w-4xl mx-auto">
              <p className="font-bold text-white mb-2">LEGAL DISCLAIMER - CROA COMPLIANCE:</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                CreditCounsel is a credit monitoring and software platform. We are NOT a credit repair organization as defined under the Credit Repair Organizations Act (CROA), 15 U.S.C. § 1679, et seq. We do not perform credit monitoring services. Federal law allows you to Attack inaccurate credit information for free by contacting credit bureaus directly. We provide software tools, credit monitoring, educational resources, and tracking services to help you manage your own credit Attacks. You are solely responsible for generating, printing, mailing, and following up on your own Attack letters. We do not mail letters on your behalf, contact credit bureaus for you, or guarantee any specific results. All results vary based on individual circumstances and the accuracy of information in your credit reports. By using our platform, you acknowledge that you are performing your own credit Attacks and that we are providing tools and monitoring services only.
              </p>
            </div>
            <p>&copy; 2026 CreditCounsel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
