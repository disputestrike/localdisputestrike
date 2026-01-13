import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Zap, Star, TrendingUp, CreditCard, Mail, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CountdownTimer } from "@/components/CountdownTimer";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleStartTrial = () => {
    setLocation("/trial-checkout");
  };

  return (
    <div className="min-h-screen bg-white">
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
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">How It Works</a>
            </Link>
            <Link href="/pricing">
              <a className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Pricing</a>
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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleStartTrial}>
                  Start $1 Trial
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="container text-center px-4">
          <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
            <Sparkles className="mr-1 h-3 w-3" />
            Start with $1 for 7 days - See your real credit data
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Both plans include <span className="font-semibold text-gray-900">unlimited dispute rounds</span>
          </p>
          <p className="text-gray-500">
            30-day intervals between rounds for maximum effectiveness
          </p>
          <div className="flex justify-center mt-8">
            <CountdownTimer initialMinutes={15} />
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Complete Plan - Featured */}
            <div className="relative order-1 md:order-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 border-none">
                  <Star className="w-4 h-4" /> MOST POPULAR
                </Badge>
              </div>
              <Card className="border-2 border-orange-500 shadow-xl overflow-hidden h-full">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-gray-900">Complete</CardTitle>
                  <CardDescription className="text-gray-500">Zero hassle - we handle everything</CardDescription>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">$79</span>
                    <span className="text-2xl font-bold text-gray-900">.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">After $1 trial</p>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                  <p className="font-medium text-gray-700 text-xs uppercase tracking-wider">Everything in DIY, plus:</p>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">We mail everything via certified mail</span>
                      <p className="text-xs text-gray-500">Save 3+ hours per round</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">One-click "Send Disputes"</span>
                      <p className="text-xs text-gray-500">No printing, no post office</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Real-time delivery tracking</span>
                      <p className="text-xs text-gray-500">USPS tracking in your dashboard</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">CFPB complaint generator</span>
                      <p className="text-xs text-gray-500">For stubborn items after 3 rounds</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Furnisher dispute letters</span>
                      <p className="text-xs text-gray-500">Dispute directly with creditors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Priority support</span>
                      <p className="text-xs text-gray-500">Email + chat support</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pb-8">
                  <Button 
                    className="w-full bg-orange-500 text-white py-6 rounded-xl font-semibold text-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
                    onClick={handleStartTrial}
                  >
                    Start Complete - $1 Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    <span className="font-medium text-green-600">Save $50/mo</span> vs. Lexington Law
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* DIY Plan */}
            <div className="order-2 md:order-1">
              <Card className="border border-gray-200 rounded-2xl overflow-hidden h-full">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-gray-900">DIY</CardTitle>
                  <CardDescription className="text-gray-500">You handle the mailing</CardDescription>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">$49</span>
                    <span className="text-2xl font-bold text-gray-900">.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">After $1 trial</p>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                  <p className="font-medium text-gray-700 text-xs uppercase tracking-wider">What's included:</p>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Unlimited dispute rounds (30-day intervals)</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">3-bureau credit monitoring (daily updates)</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">AI analyzes & selects best items to dispute</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">FCRA-compliant dispute letters</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Round 1-2-3 escalation strategy</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-3 h-3 text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-700">You print & mail yourself (~$30/round at USPS)</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">No CFPB complaints</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">No furnisher disputes</span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pb-8">
                  <Button 
                    variant="outline"
                    className="w-full py-6 rounded-xl font-semibold text-lg hover:bg-gray-50 transition"
                    onClick={handleStartTrial}
                  >
                    Start DIY - $1 Trial
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Upgrade to Complete anytime
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container py-16 px-4 bg-gray-50 rounded-3xl my-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Compare Plans
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Feature</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">DIY<br/><span className="text-xs font-normal text-gray-500">$49.99/mo</span></th>
                  <th className="text-center py-4 px-6 font-medium text-orange-600 bg-orange-50">Complete<br/><span className="text-xs font-normal">$79.99/mo</span></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">Unlimited Rounds</td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">30-Day Strategy</td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">3-Bureau Monitoring</td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">AI Letter Generation</td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100 bg-yellow-50/30">
                  <td className="py-4 px-6 text-sm text-gray-700 font-medium">Mailing</td>
                  <td className="py-4 px-6 text-center text-xs text-gray-500">You do it</td>
                  <td className="py-4 px-6 text-center bg-orange-50 font-medium text-orange-600 text-sm">We do it ✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">Certified Mail</td>
                  <td className="py-4 px-6 text-center text-xs text-gray-500">You pay USPS</td>
                  <td className="py-4 px-6 text-center bg-orange-50 font-medium text-orange-600 text-sm">Included ✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">Delivery Tracking</td>
                  <td className="py-4 px-6 text-center text-xs text-gray-500">Manual</td>
                  <td className="py-4 px-6 text-center bg-orange-50 font-medium text-orange-600 text-sm">Auto ✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">CFPB Complaints</td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-700">Furnisher Disputes</td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-sm text-gray-700">Money-Back Guarantee</td>
                  <td className="py-4 px-6 text-center text-xs text-gray-500">7 days</td>
                  <td className="py-4 px-6 text-center bg-orange-50 font-medium text-orange-600 text-sm">30 days ✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Both plans have unlimited rounds?</h3>
            <p className="text-gray-600 text-sm">Yes! Both DIY and Complete include unlimited dispute rounds. The difference is WHO mails the letters and whether you get advanced features (CFPB, furnisher disputes).</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Why 30-day intervals between rounds?</h3>
            <p className="text-gray-600 text-sm">Credit bureaus legally have 30-45 days to investigate disputes. Our 30-day intervals ensure compliance and maximize effectiveness. Disputing too frequently gets flagged as frivolous.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Can I switch from DIY to Complete later?</h3>
            <p className="text-gray-600 text-sm">Absolutely! Upgrade anytime. Your progress carries over, and you'll immediately get white-glove mailing for your next round.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">What's included in "furnisher disputes"?</h3>
            <p className="text-gray-600 text-sm">After rounds with bureaus, sometimes you need to dispute directly with the creditor (the furnisher). Complete plan includes these letters.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-16">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to See Your Real Credit Data?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Start your $1 trial now and get AI-powered recommendations in minutes.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg px-8 py-6 rounded-xl"
            onClick={handleStartTrial}
          >
            Get My Credit Analysis - $1
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <div className="flex justify-center gap-6 mb-6">
            <Link href="/terms"><a className="hover:text-orange-600 transition-colors">Terms of Service</a></Link>
            <Link href="/privacy"><a className="hover:text-orange-600 transition-colors">Privacy Policy</a></Link>
            <Link href="/disclaimer"><a className="hover:text-orange-600 transition-colors">Disclaimer</a></Link>
          </div>
          <p className="max-w-2xl mx-auto mb-4">
            DisputeStrike is dispute automation software, not a credit repair service. 
            You generate and mail your own dispute letters. Results vary and are not guaranteed.
          </p>
          <p>© 2026 DisputeStrike. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
