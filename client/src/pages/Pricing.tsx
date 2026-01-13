import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Zap, Star, TrendingUp, CreditCard, Mail, Clock, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CountdownTimer } from "@/components/CountdownTimer";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleStartTrial = () => {
    setLocation("/trial-checkout");
  };

  const tiers = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for getting started with credit repair",
      icon: Zap,
      popular: false,
      features: [
        "Real credit data from all 3 bureaus",
        "AI-powered dispute recommendations",
        "2 dispute rounds included",
        "Cross-bureau conflict detection",
        "Professional dispute letters",
        "Mailing instructions & tracking",
        "Email support",
      ],
      cta: "Start with $1 Trial",
      value: "Best for beginners",
      rounds: "2 Rounds",
    },
    {
      name: "Professional",
      price: "$69.95",
      period: "/month",
      description: "Most popular choice for serious credit repair",
      icon: Star,
      popular: true,
      features: [
        "Everything in Starter, plus:",
        "3 dispute rounds included",
        "Ongoing credit monitoring",
        "Response analysis & escalation",
        "Furnisher dispute letters",
        "Priority email support",
        "Round unlock notifications",
      ],
      cta: "Start with $1 Trial",
      value: "Most Popular",
      rounds: "3 Rounds",
    },
    {
      name: "Complete",
      price: "$99.95",
      period: "/month",
      description: "Ultimate credit repair with full service",
      icon: Shield,
      popular: false,
      features: [
        "Everything in Professional, plus:",
        "Unlimited dispute rounds",
        "We print & mail for you",
        "CFPB complaint generator",
        "1-on-1 credit coaching calls",
        "Dedicated support line",
        "Fastest results possible",
      ],
      cta: "Start with $1 Trial",
      value: "Best Results",
      rounds: "Unlimited",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
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

      {/* Hero Section - $1 Trial CTA */}
      <section className="container py-12 text-center">
        <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
          <Sparkles className="mr-1 h-3 w-3" />
          Limited Time Offer
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          See Your <span className="text-primary">Real Credit Data</span> for Just $1
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Get instant access to your 3-bureau credit report + AI recommendations. 
          Then choose your plan to start disputing.
        </p>
        
        {/* $1 Trial Box */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 max-w-xl mx-auto mb-8 text-white shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="h-8 w-8" />
            <span className="text-5xl font-bold">$1</span>
            <span className="text-xl">for 7 days</span>
          </div>
          <p className="text-emerald-100 mb-6">
            See your real credit scores, negative items, and AI-recommended disputes. 
            Cancel anytime before day 7 - no commitment.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-lg px-8 py-6"
            onClick={handleStartTrial}
          >
            Get My Credit Analysis - $1
          </Button>
          <p className="text-emerald-200 text-sm mt-4">
            Then $69.95/mo for Professional plan. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <CountdownTimer initialMinutes={15} />
        </div>
        
        {/* What you get with $1 trial */}
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold">Real Credit Scores</p>
            <p className="text-sm text-muted-foreground">From all 3 bureaus</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold">Negative Items</p>
            <p className="text-sm text-muted-foreground">Full account details</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold">AI Recommendations</p>
            <p className="text-sm text-muted-foreground">Win probability scores</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold">7-Day Access</p>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            <span>FCRA Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="border-t border-gray-200 my-8"></div>
        <p className="text-center text-muted-foreground mb-8">
          After your $1 trial, choose the plan that fits your needs:
        </p>
      </div>

      {/* Pricing Cards */}
      <section className="container pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tierData) => {
            const Icon = tierData.icon;
            return (
              <Card
                key={tierData.name}
                className={`relative ${
                  tierData.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {tierData.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <Badge variant="outline">{tierData.value}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{tierData.name}</CardTitle>
                  <CardDescription>{tierData.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tierData.price}</span>
                    <span className="text-muted-foreground ml-1">{tierData.period}</span>
                  </div>
                  <Badge variant="secondary" className="mt-2 w-fit">
                    {tierData.rounds}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tierData.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tierData.popular ? "default" : "outline"}
                    size="lg"
                    onClick={handleStartTrial}
                  >
                    {tierData.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 bg-muted/50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">
          How the $1 Trial Works
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-semibold mb-2">Pay $1</h3>
              <p className="text-sm text-muted-foreground">Enter your info and pay $1 to start your trial</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-semibold mb-2">See Your Data</h3>
              <p className="text-sm text-muted-foreground">We pull your real credit data from all 3 bureaus</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-semibold mb-2">Get AI Recommendations</h3>
              <p className="text-sm text-muted-foreground">See which items to dispute with win probability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="font-semibold mb-2">Upgrade to Dispute</h3>
              <p className="text-sm text-muted-foreground">Choose a plan to generate letters and start Round 1</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-2">What happens after the $1 trial?</h3>
            <p className="text-muted-foreground">After 7 days, you'll be charged $69.95/mo for the Professional plan unless you cancel or choose a different tier. You can upgrade immediately to start disputing - no need to wait.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-2">Can I cancel during the trial?</h3>
            <p className="text-muted-foreground">Yes! Cancel anytime within 7 days and you won't be charged anything beyond the $1. You keep access to view your credit data until the trial ends.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-2">What's the difference between the plans?</h3>
            <p className="text-muted-foreground">
              <strong>Starter ($49/mo):</strong> 2 dispute rounds, DIY mailing<br/>
              <strong>Professional ($69.95/mo):</strong> 3 rounds, ongoing monitoring, response analysis<br/>
              <strong>Complete ($99.95/mo):</strong> Unlimited rounds, we mail for you, CFPB complaints, coaching
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-2">What is a "round"?</h3>
            <p className="text-muted-foreground">A round is one cycle of dispute letters to all 3 bureaus. After mailing, you wait 30 days for responses before starting the next round. Each round escalates the pressure on bureaus to delete items.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-16">
        <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to See Your Real Credit Data?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Start your $1 trial now and get AI-powered recommendations in minutes.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-orange-50 font-bold text-lg px-8 py-6"
            onClick={handleStartTrial}
          >
            Get My Credit Analysis - $1
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="mb-2">
            DisputeStrike is dispute automation software, not a credit repair service. 
            You generate and mail your own dispute letters. Results vary and are not guaranteed.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/terms"><a className="hover:text-primary">Terms of Service</a></Link>
            <Link href="/privacy"><a className="hover:text-primary">Privacy Policy</a></Link>
            <Link href="/croa-disclosure"><a className="hover:text-primary">CROA Disclosure</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
