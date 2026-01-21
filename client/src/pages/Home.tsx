import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, FileText, Star, Play, Check, X, XCircle, Facebook, Twitter, Instagram, Linkedin, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { LiveCounter } from "@/components/LiveCounter";
import { CreditScoreAnimation } from "@/components/CreditScoreAnimation";
import ExitIntentEmailPopup from "@/components/ExitIntentEmailPopup";
import { BannerCountdown } from "@/components/BannerCountdown";
import MonitorYourCredit from "@/components/MonitorYourCredit";
import { useState } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LiveCounter />
      <ExitIntentEmailPopup />
      
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-2xl text-gray-900">DisputeStrike</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5 ml-8 whitespace-nowrap">
            <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm">
              Features
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm">
              How It Works
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm">
              FAQ
            </Link>
            <Link href="/fcra-rights" className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm">
              Your Rights
            </Link>
            <Link href="/money-back-guarantee" className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm">
              Money Back Guarantee
            </Link>
            <Link href="/agency-pricing" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors text-sm">
              Become a Merchant
            </Link>
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50" asChild>
                  <Link href="/start">Start Free Analysis</Link>
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/start">Sign Up</Link>
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
              Strike <span className="text-orange-600">Precision</span> Into Your{" "}
              <span className="text-orange-600">Credit Disputes</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Technology-assisted credit dispute support. Generate FCRA-compliant dispute letters with AI assistance. You're in control - you generate, print, and mail your own letters. Track your progress and exercise your rights under federal law.
            </p>
            
            {/* Money Back Guarantee Badge */}
            <div className="flex items-center justify-center gap-3">
              <Link href="/guarantee">
                <Badge className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base cursor-pointer transition-all hover:scale-105">
                  <Shield className="h-5 w-5 mr-2" />
                  Money Back Guarantee
                </Badge>
              </Link>
            </div>
            
            
            {/* Hero Visual - Animated Credit Score Transformation */}
            <div className="relative max-w-5xl mx-auto">
              <CreditScoreAnimation className="w-full" />
            </div>
            
            {/* Phone Mockup showing app */}
            <div className="relative max-w-md mx-auto mt-12">
              <img 
                src="/phone-credit-report.webp" 
                alt="DisputeStrike app showing deleted negative items" 
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-8 sm:px-12 py-6 sm:py-7 rounded-full" asChild>
                <Link href="/start">
                  Start Free Analysis <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 text-xl px-8 sm:px-12 py-6 sm:py-7 rounded-full" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">No credit card required. See all your violations for free.</p>
            
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
              <span className="text-gray-900 ml-2 font-bold text-lg">4.9/5 from 16,628 registered users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Phone Mockup Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Dark gradient background with wave pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q 25 30, 50 50 T 100 50' stroke='%234338ca' stroke-width='2' fill='none' opacity='0.3'/%3E%3Cpath d='M0 70 Q 25 50, 50 70 T 100 70' stroke='%234338ca' stroke-width='2' fill='none' opacity='0.2'/%3E%3Cpath d='M0 30 Q 25 10, 50 30 T 100 30' stroke='%234338ca' stroke-width='2' fill='none' opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 100px'
          }} />
        </div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-8">
                <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="w-10 h-10" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                AI that helps you take control of your <span className="text-orange-500">Credit</span> & financial future
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Generate FCRA-compliant dispute letters, track your progress, and exercise your rights under federal law — all from one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6" asChild>
                  <Link href="/start">Start Free Analysis <ArrowRight className="ml-2" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
            
            {/* Right side - Phone mockups */}
            <div className="relative flex justify-center items-center">
              {/* Phone 1 - Dashboard */}
              <div className="relative z-20 transform -rotate-6 translate-x-8">
                <div className="w-64 h-[520px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
                  {/* Screen content */}
                  <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4 pt-8">
                    <div className="text-center mb-4">
                      <p className="text-xs text-gray-500">Welcome Back,</p>
                      <p className="text-sm font-bold text-gray-900">Sarah Mitchell</p>
                    </div>
                    {/* Score circle */}
                    <div className="flex justify-center mb-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                          <circle cx="64" cy="64" r="56" stroke="#22c55e" strokeWidth="8" fill="none" strokeDasharray="352" strokeDashoffset="70" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-gray-900">724</span>
                          <span className="text-xs text-green-600">+28 pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Good Standing</span>
                    </div>
                    {/* Dispute tracker */}
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Dispute Tracker</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <p className="text-xs text-gray-600">3 disputes in progress</p>
                      </div>
                    </div>
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-orange-600">12</p>
                        <p className="text-xs text-gray-600">Letters Sent</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-green-600">5</p>
                        <p className="text-xs text-gray-600">Items Resolved</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phone 2 - Credit Report */}
              <div className="relative z-10 transform rotate-6 -translate-x-8">
                <div className="w-64 h-[520px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
                  {/* Screen content */}
                  <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4 pt-8">
                    <p className="text-sm font-bold text-gray-900 mb-4">Credit Report</p>
                    <p className="text-xs text-gray-500 mb-3">All Accounts</p>
                    {/* Account items */}
                    {['CAPITAL ONE', 'CHASE BANK', 'DISCOVER', 'AMEX'].map((account, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs">🏦</span>
                            </div>
                            <span className="text-xs font-medium text-gray-900">{account}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${i === 2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {i === 2 ? 'Disputed' : 'Positive'}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <span className="text-xs bg-blue-50 text-blue-600 px-1 rounded">Experian</span>
                          <span className="text-xs bg-purple-50 text-purple-600 px-1 rounded">TransUnion</span>
                          <span className="text-xs bg-orange-50 text-orange-600 px-1 rounded">Equifax</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Sound Familiar?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              You're not alone. Thousands face these credit challenges every day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8 text-center">
                <img loading="lazy" src="/icon-pain-score-drop.webp" alt="Score Drop" className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">"My score dropped 50 points overnight and I don't know why..."</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8 text-center">
                <img loading="lazy" src="/icon-pain-interest.webp" alt="High Interest" className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">"I'm paying 24% interest because of old mistakes..."</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8 text-center">
                <img loading="lazy" src="/icon-pain-limit.webp" alt="Low Limit" className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">"My credit limit is so low I can't even book a hotel..."</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8 text-center">
                <img loading="lazy" src="/icon-pain-home.webp" alt="Home Denial" className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">"I got denied for a mortgage because of errors on my report..."</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8 text-center">
                <img loading="lazy" src="/icon-pain-debt.webp" alt="Debt Burden" className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">"I feel trapped by debt I didn't even know I had..."</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8 text-center">
                <img loading="lazy" src="/icon-pain-negative.webp" alt="Negative Accounts" className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">"Negative accounts appeared out of nowhere on my credit..."</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6" asChild>
              <Link href="/start">Take Control of Your Credit <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Monitor Your Credit Section */}
      <MonitorYourCredit />

      {/* How It Works Timeline */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">How DisputeStrike Works</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Four simple steps to launch your credit dispute journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative">
                <img loading="lazy" src="/icon-step1-quiz.webp" alt="Take Quiz" className="w-32 h-32 mx-auto mb-6" />
                <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Take the Quiz</h3>
              <p className="text-gray-700">Answer a few questions about your credit situation</p>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <img loading="lazy" src="/icon-step2-upload.webp" alt="Upload Reports" className="w-32 h-32 mx-auto mb-6" />
                <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Reports</h3>
              <p className="text-gray-700">Upload your credit reports from all 3 bureaus</p>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <img loading="lazy" src="/icon-step3-dispute.webp" alt="Submit Disputes" className="w-32 h-32 mx-auto mb-6" />
                <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Submit Disputes</h3>
              <p className="text-gray-700">AI generates documentation-driven Dispute letters instantly</p>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <img loading="lazy" src="/icon-step4-track.webp" alt="Track Progress" className="w-32 h-32 mx-auto mb-6" />
                <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">4</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-700">Monitor your disputes in real-time dashboard</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6" asChild>
              <Link href="/start">Start Your Journey Free <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <img loading="lazy" src="/icon-trust-ssl.webp" alt="256-Bit SSL" className="w-20 h-20 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">256-Bit SSL</h4>
              <p className="text-sm text-gray-600">Bank-level encryption</p>
            </div>
            
            <div className="text-center">
              <img loading="lazy" src="/icon-trust-fcra.webp" alt="FCRA Compliant" className="w-20 h-20 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">FCRA Compliant</h4>
              <p className="text-sm text-gray-600">Federal law protection</p>
            </div>
            
            <div className="text-center">
              <img loading="lazy" src="/icon-trust-control.webp" alt="You're In Control" className="w-20 h-20 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">You're In Control</h4>
              <p className="text-sm text-gray-600">You mail your letters</p>
            </div>
            
            <div className="text-center">
              <img loading="lazy" src="/icon-trust-access.webp" alt="24/7 Access" className="w-20 h-20 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">24/7 Dashboard</h4>
              <p className="text-sm text-gray-600">Access anytime, anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Professional-grade tools to strike with precision and defend with confidence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8">
                <img loading="lazy" src="/icon-feature-ai-letters.webp" alt="AI Letters" className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Dispute Letters</h3>
                <p className="text-gray-700">Documentation-driven letters with FCRA citations generated instantly</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8">
                <img loading="lazy" src="/icon-feature-3-bureau.webp" alt="3 Bureaus" className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">3-Bureau Disputes</h3>
                <p className="text-gray-700">Challenge items across Equifax, Experian, and TransUnion simultaneously</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8">
                <img loading="lazy" src="/icon-feature-rounds.webp" alt="Rounds" className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Round 1-2-3 Escalation</h3>
                <p className="text-gray-700">Automated escalation strategy from initial claim to legal-grade pressure</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8">
                <img loading="lazy" src="/icon-feature-mailing.webp" alt="Mailing" className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Mailing Instructions</h3>
                <p className="text-gray-700">Pre-formatted labels and certified mail instructions included</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8">
                <img loading="lazy" src="/icon-feature-tracking.webp" alt="Tracking" className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
                <p className="text-gray-700">Real-time dashboard shows exactly where each dispute stands</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all">
              <CardContent className="pt-8">
                <img loading="lazy" src="/icon-feature-unlimited.webp" alt="Unlimited" className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlimited Letters</h3>
                <p className="text-gray-700">Generate as many Dispute letters as you need, no limits</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <img loading="lazy" src="/icon-stat-users.webp" alt="Users" className="w-24 h-24 mx-auto mb-4" />
              <div className="text-5xl font-extrabold mb-2">1,247+</div>
              <p className="text-xl text-gray-300">Users monitoring their credit journey</p>
            </div>
            
            <div>
              <img loading="lazy" src="/icon-stat-letters.webp" alt="Letters" className="w-24 h-24 mx-auto mb-4" />
              <div className="text-5xl font-extrabold mb-2">3,891+</div>
              <p className="text-xl text-gray-300">Dispute letters generated by users using our tools</p>
            </div>
            
            <div>
              <img loading="lazy" src="/icon-stat-guarantee.webp" alt="Guarantee" className="w-24 h-24 mx-auto mb-4" />
              <div className="text-5xl font-extrabold mb-2">110%</div>
              <p className="text-xl text-gray-300">Money-back guarantee if not satisfied</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Credit Dispute Resources</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Learn the strategies that help you take control of your credit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all overflow-hidden">
              <img loading="lazy" src="/blog-thumb-credit-report.webp" alt="How to Read Your Credit Report" className="w-full h-48 object-cover" />
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Read Your Credit Report</h3>
                <p className="text-gray-700 mb-4">Learn to identify errors, late payments, and collection accounts that are dragging down your score.</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/blog/how-to-read-credit-report">Read Article <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all overflow-hidden">
              <img loading="lazy" src="/blog-thumb-3-round-strategy.webp" alt="3-Round Dispute Strategy" className="w-full h-48 object-cover" />
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">3-Round Dispute Strategy Explained</h3>
                <p className="text-gray-700 mb-4">Understand how Round 1, 2, and 3 escalation works to maximize your dispute effectiveness.</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/blog/3-round-strategy">Read Article <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200 hover:border-orange-500 transition-all overflow-hidden">
              <img loading="lazy" src="/blog-thumb-fcra-rights.webp" alt="Your FCRA Rights" className="w-full h-48 object-cover" />
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Your FCRA § 611 Rights</h3>
                <p className="text-gray-700 mb-4">Federal law gives you powerful rights to challenge inaccurate information on your credit report.</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/blog/fcra-rights">Read Article <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
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
              <div className="text-xl font-medium">Dispute Letter Generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">The Power of DisputeStrike</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Professional-grade dispute automation with professionally-structured dispute letters
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img loading="lazy" src="/icon-shield-check.webp" alt="Cross-bureau conflict detection" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">Cross-Bureau Conflict Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Our AI tools help you find discrepancies between TransUnion, Equifax, and Experian. You use these findings to dispute conflicting accounts under FCRA § 1681i(a)(5).
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all">
              <CardHeader className="text-center">
                <div className="mb-6">
                  <img loading="lazy" src="/icon-document-legal.webp" alt="FCRA legal citations" className="w-20 h-20 mx-auto" />
                </div>
                <CardTitle className="text-2xl font-bold">FCRA-Aligned Legal Arguments</CardTitle>
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
                  <img loading="lazy" src="/ai-credit-analysis.webp" alt="AI letter generation" className="w-20 h-20 mx-auto" />
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
                    src="/deleted-items-proof.webp" 
                    alt="Credit report showing deleted negative accounts with red stamps" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Professional Dispute Letters</h4>
                <p className="text-center text-gray-700 leading-relaxed">
                  Generate documentation-driven Dispute letters with proper FCRA citations. Our AI creates unique, professional letters for each account you want to dispute. You print and mail them yourself.
                </p>
              </div>
              
              {/* Phone Success Screen */}
              <div className="flex flex-col bg-white rounded-xl shadow-lg p-6">
                <div className="h-80 overflow-hidden rounded-lg mb-4 flex items-center justify-center bg-gray-50">
                  <img 
                    src="/phone-deletion-success.webp" 
                    alt="App showing 8 items deleted successfully" 
                    className="h-full object-contain"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Real-Time Tracking Dashboard</h4>
                <p className="text-center text-gray-700 leading-relaxed">
                  Monitor your credit score changes and track dispute progress in real-time. Our app helps you stay organized, tracks bureau response deadlines, and shows dispute status updates.
                </p>
              </div>
              
              {/* Happy Family */}
              <div className="flex flex-col bg-white rounded-xl shadow-lg p-6">
                <div className="h-80 overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/happy-family-credit-success.webp" 
                    alt="Happy family celebrating credit score improvement and loan approval" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Take Control of Your Credit</h4>
                <p className="text-center text-gray-700 leading-relaxed">
                  Join thousands of users who are using our platform to dispute inaccuracies and monitor their credit. Better credit knowledge and tools help you work toward your financial goals.
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
            <p className="text-xl text-gray-700">Three simple steps to dispute inaccuracies</p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img loading="lazy" src="/step-upload-real.webp" alt="Upload credit reports" className="w-full rounded-xl shadow-xl" />
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
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Round 2: Challenge</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Launch Your First Dispute</h3>
                <p className="text-lg text-gray-700">
                  Our AI detects cross-bureau conflicts, generates documentation-driven Dispute letters with proper FCRA citations, and creates personalized arguments for each account.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <img loading="lazy" src="/phone-dashboard-mockup.webp" alt="Before and after credit score comparison" className="w-full" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img loading="lazy" src="/score-improvement-chart.webp" alt="Credit score improvement over 6 months" className="w-full rounded-xl shadow-xl" />
                <p className="text-xs text-gray-500 text-center mt-2 italic">Illustrative example. Not typical. No score improvement guaranteed.</p>
              </div>
              <div>
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">Round 3: Track & Improve</Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Monitor Your Journey</h3>
                <p className="text-lg text-gray-700">
                  Download professional PDF letters, mail them via Certified Mail, and track your disputes. Monitor bureau responses and track any changes to your credit report.
                </p>
              </div>
            </div>
          </div>
          
          {/* Dispute Tracking Example */}
          <div className="mt-20 max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-8">Track Your Dispute Progress</h3>
            <img 
              src="/before-after-bureau-report.webp" 
              alt="Example of dispute tracking dashboard" 
              className="w-full rounded-xl shadow-2xl"
            />
            <p className="text-center text-gray-700 mt-6 text-lg font-medium">Monitor dispute status, bureau response deadlines, and track notification of any credit report changes in real-time</p>
            <p className="text-xs text-gray-500 text-center mt-2 italic">Dashboard screenshot for illustration. Actual results vary by individual.</p>
          </div>
          
          {/* Platform Benefits */}
          <div className="mt-20 max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700">
              Our platform provides the tools and monitoring you need to dispute credit report inaccuracies. Results vary based on individual circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* Who This Is For / Not For */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Is DisputeStrike Right For You?</h2>
            <p className="text-xl text-gray-700">We're transparent about who we can help</p>
          </div>
          
          <div className="flex justify-center">
            {/* Who This IS For */}
            <Card className="border-2 border-green-200 bg-green-50 max-w-2xl w-full">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  DisputeStrike IS For You If...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  You have inaccurate, incomplete, or unverifiable information on your credit report
                </p>
                <p className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  You want to exercise your rights under the Fair Credit Reporting Act (FCRA)
                </p>
                <p className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  You're willing to print and mail your own dispute letters
                </p>
                <p className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  You want AI-assisted tools to help organize and track your disputes
                </p>
                <p className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  You understand results vary and are not guaranteed
                </p>
              </CardContent>
            </Card>

          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 max-w-3xl mx-auto">
              <strong>Important:</strong> You can dispute inaccurate information directly with credit bureaus for free at <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">AnnualCreditReport.com</a>. DisputeStrike provides tools to help you exercise this right more efficiently.
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
                  <p className="text-sm text-gray-700">"The Dispute letter tools are professional and easy to use. Highly recommend this platform!"</p>
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
                  <img loading="lazy" src="/testimonial-sarah-real.webp" alt="Sarah Martinez" className="w-16 h-16 rounded-full object-cover" />
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
                  "The platform made it easy to generate professional Dispute letters. The cross-bureau conflict detection found discrepancies I never knew existed. Very impressed with the tools."
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img loading="lazy" src="/testimonial-james-real.webp" alt="James Chen" className="w-16 h-16 rounded-full object-cover" />
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
                  "The FCRA citations in these letters are professional and well-researched. The tracking dashboard made it easy to monitor my disputes. Highly recommend the platform."
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img loading="lazy" src="/testimonial-maria-real.webp" alt="Maria Rodriguez" className="w-16 h-16 rounded-full object-cover" />
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
                  "Best investment I ever made. The dispute tools are comprehensive and easy to use. The educational resources helped me understand my rights under FCRA. Great platform."
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
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-1">
              Start FREE - See ALL your credit violations
            </Badge>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-700">Both plans include <span className="font-semibold">unlimited dispute rounds</span> with 30-day intervals</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* DIY Plan */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">DIY</CardTitle>
                <div className="text-5xl font-extrabold text-gray-900 mb-2">$49<span className="text-2xl font-normal text-gray-600">.99</span></div>
                <div className="text-gray-600">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Unlimited AI-generated dispute letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Unlimited dispute rounds (30-day intervals)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">FCRA-compliant letter templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Cross-bureau conflict detection</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">You print & mail letters yourself</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400">No certified mail tracking</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6" size="lg" asChild>
                  <Link href="/start">Start Free Analysis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Complete Plan - Most Popular */}
            <Card className="border-4 border-orange-600 relative shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-600 text-white text-sm px-4 py-1">MOST POPULAR</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">Complete</CardTitle>
                <div className="text-5xl font-extrabold text-orange-600 mb-2">$79<span className="text-2xl font-normal text-gray-600">.99</span></div>
                <div className="text-gray-600">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">Everything in DIY, plus:</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">We mail your letters for you</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">USPS Certified Mail included</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">Real-time delivery tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">CFPB complaint generator</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-semibold">Furnisher dispute letters</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6" size="lg" asChild>
                  <Link href="/start">Start Free Analysis</Link>
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
                a: "We use AI to detect cross-bureau conflicts and generate personalized Dispute letters with proper FCRA citations. Our letters are tailored to your specific accounts, not generic templates. Results vary based on individual circumstances."
              },
              {
                q: "Is this legal?",
                a: "Absolutely. We're exercising your rights under the Fair Credit Reporting Act (FCRA). You have the legal right to dispute inaccurate information on your credit reports."
              },
              {
                q: "How long does the dispute process take?",
                a: "Credit bureaus have 30 days to investigate disputes under FCRA law. Results vary based on bureau responsiveness, accuracy of disputes, and individual credit circumstances. Some disputes are resolved within 30 days, others may take 60+ days or may not result in changes if the information is verified as accurate."
              },
              {
                q: "Do I need to upload all 3 bureau reports?",
                a: "Yes! Our cross-bureau conflict detection compares all 3 reports to find discrepancies. This is our secret weapon for forcing deletions."
              },
              {
                q: "What if nothing gets deleted?",
                a: "While many users see positive results, results vary by case. We provide escalation strategies and round 2 letters for stubborn items. Complete Package package includes unlimited letters."
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
            Join 16,628 registered users monitoring their credit and challenging inaccuracies
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/start">
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
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">About DisputeStrike</h3>
              <p className="text-sm">
                Professional-grade dispute automation. Strike inaccuracies with precision, Challenge errors with confidence.
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
            
            {/* For Businesses */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">For Businesses</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/agency-pricing" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Become a Merchant →</Link></li>
                <li><Link href="/agency-pricing" className="hover:text-white transition-colors">Agency Pricing</Link></li>
                <li><Link href="/agency-pricing" className="hover:text-white transition-colors">Multi-Client Management</Link></li>
                <li><Link href="/agency-pricing" className="hover:text-white transition-colors">White-Label Options</Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/croa-disclosure" className="hover:text-white transition-colors">CROA Disclosure</Link></li>
                <li><Link href="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/admin/login" className="text-gray-500 hover:text-gray-400 transition-colors text-xs">Admin</Link></li>
              </ul>
            </div>
            
            {/* Connect */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/DisputeStrike" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="https://www.instagram.com/DisputeStrike" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://www.youtube.com/@DisputeStrike" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@DisputeStrikeAI" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Legal Entity Info */}
          <div className="border-t border-gray-700 pt-8 mb-6">
            <div className="grid md:grid-cols-3 gap-6 text-sm text-center md:text-left">
              <div>
                <p className="text-white font-medium">DisputeStrike LLC</p>
                <p className="text-gray-400">30 N Gould St Ste R</p>
                <p className="text-gray-400">Sheridan, WY 82801</p>
              </div>
              <div>
                <p className="text-gray-400">Email: support@disputestrike.com</p>
                <p className="text-gray-400">Phone: 202-858-9557</p>
                <p className="text-gray-400"><Link href="/contact" className="text-orange-400 hover:text-orange-300">Contact Us →</Link></p>
              </div>
              <div>
                <p className="text-gray-400">We are NOT affiliated with any credit bureau.</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center px-2 py-1 bg-green-900/50 border border-green-700 rounded text-xs text-green-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    GDPR Compliant
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-900/50 border border-green-700 rounded text-xs text-green-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    CCPA Compliant
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-blue-900/50 border border-blue-700 rounded text-xs text-blue-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    256-bit SSL
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            <div className="bg-gray-900 rounded-lg p-6 mb-6 text-left max-w-4xl mx-auto">
              <p className="font-bold text-white mb-2">IMPORTANT CONSUMER DISCLOSURE:</p>
              <p className="text-gray-300 text-xs leading-relaxed mb-3">
                DisputeStrike is dispute preparation software. We are NOT a credit repair organization as defined under the Credit Repair Organizations Act (CROA), 15 U.S.C. § 1679. You have the right to dispute inaccurate information directly with credit bureaus at no cost. Visit <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">AnnualCreditReport.com</a> for free credit reports.
              </p>
              <p className="text-gray-300 text-xs leading-relaxed mb-3">
                We provide AI-assisted document preparation tools and educational resources. YOU generate, print, and mail your own dispute letters. We do not contact credit bureaus on your behalf. We do not guarantee removal of any information or specific credit score improvements. Results vary based on individual circumstances.
              </p>
              <p className="text-gray-300 text-xs leading-relaxed">
                <strong>Your Rights:</strong> You may cancel within 3 business days for a full refund. <Link href="/croa-disclosure" className="text-orange-400 hover:text-orange-300">Read full CROA disclosure →</Link>
              </p>
            </div>
            <p>&copy; 2025 DisputeStrike LLC. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-1">Registered in Wyoming, USA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
