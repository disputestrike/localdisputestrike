import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, BookOpen, Zap, Star, TrendingUp, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CountdownTimer } from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const createPayment = trpc.payments.createCheckout.useMutation({
    onSuccess: (data: { checkoutUrl: string; sessionId: string }) => {
      toast.success("Redirecting to checkout...");
      window.open(data.checkoutUrl, '_blank');
    },
    onError: (error: any) => {
      toast.error(`Payment failed: ${error.message}`);
    },
  });

  const tiers = [
    {
      name: "DIY Starter",
      price: "$29",
      period: "one-time",
      description: "Perfect for getting started with credit monitoring and dispute tools",
      icon: BookOpen,
      popular: false,
      tier: "diy_quick" as const,
      features: [
        "Credit Education Course",
        "3 Bureau Dispute Letters (1 Round)",
        "Cross-Bureau Conflict Detection",
        "Mailing Instructions & Checklist",
        "30-Day Software Access",
        "Email Support",
      ],
      cta: "Start Your Journey",
      value: "Best for first-time users",
    },
    {
      name: "Complete Package",
      price: "$79",
      period: "one-time",
      description: "Most popular choice for comprehensive credit monitoring",
      icon: Zap,
      popular: true,
      tier: "diy_complete" as const,
      features: [
        "Advanced Credit Education Course",
        "9 Bureau Letters (3 Rounds)",
        "Furnisher Dispute Letters",
        "CFPB Complaint Templates",
        "Cross-Bureau Analysis Engine",
        "Mailing Guidance & Tracking",
        "90-Day Software Access",
        "Priority Email Support",
      ],
      cta: "Start Your Journey",
      value: "Save $120 vs monthly plans",
    },
    {
      name: "Pro Subscription",
      price: "$39.99",
      period: "/month",
      description: "Ultimate credit monitoring and dispute automation platform",
      icon: Star,
      popular: false,
      tier: "white_glove" as const,
      features: [
        "Everything in Complete Package",
        "Credit Monitoring (Vantage 3.0)",
        "Unlimited Dispute Letters",
        "Automated Deadline Tracking",
        "Monthly Progress Reports",
        "Priority Support",
        "Monthly Educational Coaching (not legal advice)",
        "Cancel Anytime",
      ],
      cta: "Go Pro",
      value: "Best for ongoing optimization",
    },
  ];

  const handleSelectPlan = (tier: "diy_quick" | "diy_complete" | "white_glove") => {
    if (!isAuthenticated) {
      // Redirect to quiz to capture lead first
      toast.info("Please complete our quick quiz to get started");
      setLocation("/quiz");
      return;
    }
    createPayment.mutate({ tier });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.png" alt="DisputeStrike" className="h-10 w-10" />
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
      <section className="container py-16 text-center">
        <Badge className="mb-4" variant="outline">
          <TrendingUp className="mr-1 h-3 w-3" />
          Results Vary By Case
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your <span className="text-primary">Credit Monitoring</span> Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Credit monitoring + AI dispute tools. You generate, print, and mail letters yourself. No forced subscriptions.
        </p>
        
        {/* Legal Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto text-sm text-gray-700 mb-6">
          <p className="font-semibold text-blue-900 mb-1">IMPORTANT:</p>
          <p>DisputeStrike is dispute automation software, not a credit repair service. You generate and mail your own dispute letters. Federal law allows you to dispute credit information for free. We provide AI-powered tools to help you manage your disputes. Results vary and are not guaranteed.</p>
        </div>
        <div className="flex justify-center mb-8">
          <CountdownTimer initialMinutes={15} />
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            <span>FCRA Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            <span>110% Software Satisfaction Guarantee</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </section>

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
                    onClick={() => handleSelectPlan(tierData.tier)}
                    disabled={createPayment.isPending}
                  >
                    {createPayment.isPending ? "Processing..." : tierData.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comparison with Dispute Beast */}
      <section className="container py-16 bg-muted/50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Choose DisputeStrike AI?
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* DisputeStrike AI */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  DisputeStrike AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">$29-79 one-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Documentation-driven letters (10/10 quality)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Cross-bureau conflict detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>results vary by case</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>No forced subscription</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Optional $39.99/month monitoring</span>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Beast */}
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground">Dispute Beast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$49.99/month required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Generic AI letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Basic analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Undisclosed success rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Forced monthly subscription</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$599.88/year minimum</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="container py-16">
        <Card className="max-w-4xl mx-auto bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Important Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>DisputeStrike is dispute automation software and an educational platform.</strong> You are responsible for your own credit disputes. We provide AI-powered tools, education, and guidance to help you exercise your rights under the Fair Credit Reporting Act (FCRA).
            </p>
            <p>
              You are purchasing access to educational materials and dispute automation software, not credit repair services. Results vary based on your individual situation and effort. We do not guarantee specific credit score improvements.
            </p>
            <p>
              <strong>Your Rights:</strong> You have the right to dispute inaccurate information in your credit report yourself, at no cost, by contacting the credit reporting agency directly. You may cancel this contract without penalty or obligation at any time before midnight of the 3rd business day after the date on which you signed the contract.
            </p>
            <p>
              <strong>110% Software Satisfaction Guarantee:</strong> If you're not satisfied with our software tools and platform experience within 30 days, you'll receive 110% of your purchase price back. This guarantee covers platform usability — not credit outcomes. <Link href="/money-back-guarantee" className="text-primary underline">See full terms</Link>.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is this legal?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! We provide educational materials and software tools to help YOU exercise your rights under the Fair Credit Reporting Act (FCRA). You are doing your own credit monitoring, not us. This is the same model used by LegalZoom for legal documents.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How is this different from Dispute Beast?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We offer one-time pricing ($29-79) instead of forcing a $49.99/month subscription. Our letters are documentation-driven (10/10 quality) with cross-bureau conflict detection, not generic AI templates. You can choose to add monitoring later for $39.99/month if you want it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's included in each tier?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>DIY Starter ($29):</strong> Basic course + 3 letters + 30 days access<br />
                <strong>Complete Package ($79):</strong> Advanced course + 9 letters + furnisher disputes + 90 days access<br />
                <strong>Pro Subscription ($39.99/mo):</strong> Everything + credit monitoring + unlimited letters + coaching
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do I have to mail the letters myself?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, for best results. Credit bureaus use AI to detect third-party mailers (like Dispute Beast's Sprint Mail). When YOU mail from your local post office in a handwritten envelope, it's undetectable and gets results vary by cases vs 30-40% for bulk mail.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What if it doesn't work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You're protected by our 110% software satisfaction guarantee. If you're not satisfied with our software tools within 30 days, you'll receive 110% of your purchase price back. This covers platform usability — not credit outcomes. <Link href="/guarantee" className="text-primary underline">Learn more</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-16 text-center">
        <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Fix Your Credit?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Join thousands who've improved their credit with our documentation-driven Dispute letters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleSelectPlan("diy_quick")}
                disabled={createPayment.isPending}
              >
                Start with $29 Package
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => handleSelectPlan("diy_complete")}
                disabled={createPayment.isPending}
              >
                Get Complete Package ($79)
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
