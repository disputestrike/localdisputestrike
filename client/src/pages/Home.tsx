import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle2, FileText, Mail, Shield, TrendingUp, Zap, AlertCircle, Star, Play, Check, X } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CreditCounsel AI" className="h-8 w-8" />
            <span className="font-bold text-xl">CreditCounsel AI</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#how-it-works">How It Works</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#reviews">Reviews</a>
            </Button>
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Trust Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        <div className="container flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="font-medium">NEW: Get Litigation-Grade Dispute Letters - Same Quality as $2,500 Attorneys!</span>
        </div>
      </div>

      {/* Hero Section - Redesigned */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Rated 4.9 Stars by 500+ Beta Users</span>
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Main Headline - Larger and Bolder */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              The most{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                advanced litigation-grade
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent">
                credit repair platform
              </span>
              <br />
              ever created
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Get 70-85% deletion rates with AI-generated dispute letters that credit bureaus can't detect. 
              Same quality as $2,500 attorneys, starting at just $29.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href={getLoginUrl()}>
                    Start Disputing Now <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            {/* Hero Graphic */}
            <div className="mt-8 mb-4">
              <img src="/hero-graphic.png" alt="Credit Report Analysis" className="max-w-2xl mx-auto rounded-2xl shadow-2xl" />
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>70-85% Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>FCRA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No Monthly Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>110% Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl overflow-hidden border-2 border-primary/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/90 hover:bg-primary transition-colors cursor-pointer">
                    <Play className="h-10 w-10 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-lg font-semibold">How to use CreditCounsel AI</p>
                  <p className="text-sm text-muted-foreground">Watch our 3-minute explainer video</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <Badge variant="secondary" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Secure & Private - Your data is encrypted end-to-end
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Millions struggle with poor credit scores
              <br />
              <span className="text-primary">You don't have to</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              {[
                "What? Why did my credit score go down?",
                "I can't get rid of this interest on my card!",
                "Why can't I get an increase on my credit limit?",
                "It's been months and I can't get approved for my new home.",
                "I can't catch a break with all this interest piling up.",
                "Where did all these negative accounts come from?"
              ].map((pain, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{pain}</p>
                </div>
              ))}
            </div>

            {/* Success Transformation Graphic */}
            <div className="mt-8">
              <img src="/success-graphic.png" alt="Credit Score Transformation" className="max-w-3xl mx-auto" />
            </div>

            <div className="pt-4">
              <p className="text-xl font-semibold">
                Join 10,000+ users who've improved their credit with our litigation-grade dispute letters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="reviews" className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by thousands of users</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-muted-foreground">4.9 out of 5 based on 500+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "After the 1st round, my score shot up over 120 points. I couldn't believe it!",
                author: "John M.",
                rating: 5
              },
              {
                quote: "The platform's user-friendly interface made it incredibly easy for me to dispute errors.",
                author: "Sarah K.",
                rating: 5
              },
              {
                quote: "An absolute game-changer. The letters are professional and actually work!",
                author: "Michael R.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-background">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">"{testimonial.quote}"</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="font-semibold">{testimonial.author}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Powered by AI + FCRA Law
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why CreditCounsel AI beats the competition
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We don't just generate generic letters. We create litigation-grade disputes that exploit cross-bureau conflicts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mb-4">
                  <img src="/feature-legal-citations.png" alt="Legal FCRA Citations" className="w-full h-full object-contain" />
                </div>
                <CardTitle>Litigation-Grade Letters</CardTitle>
                <CardDescription>
                  Same quality as $2,500 attorneys. Complete FCRA citations, cross-bureau conflict analysis, and account-by-account breakdowns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>70-85% Success Rate</CardTitle>
                <CardDescription>
                  Our cross-bureau conflict detection finds impossible discrepancies that bureaus MUST delete. Industry average is only 30-40%.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>No Monthly Fees</CardTitle>
                <CardDescription>
                  Pay once ($29-199) and you're done. No $50/month subscriptions. No hidden fees. Just results.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mb-4">
                  <img src="/feature-conflict-detection.png" alt="Cross-Bureau Conflict Detection" className="w-full h-full object-contain" />
                </div>
                <CardTitle>Cross-Bureau Conflicts</CardTitle>
                <CardDescription>
                  We detect when TransUnion says $10,914 but Equifax says $2,552. Bureaus can't defend these violations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mb-4">
                  <img src="/feature-pdf-generation.png" alt="PDF Letter Generation" className="w-full h-full object-contain" />
                </div>
                <CardTitle>Undetectable Mailing</CardTitle>
                <CardDescription>
                  We teach you how to mail from YOUR local post office so bureaus can't detect third-party services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>110% Money-Back Guarantee</CardTitle>
                <CardDescription>
                  If we don't help you delete negative items within 12 months, we'll refund 110% of your payment. Risk-free.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start your DIY process in just 5 minutes
            </h2>
            <p className="text-xl text-muted-foreground">
              Four simple steps to delete negative credit items
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: 1,
                title: "Upload Your Credit Reports",
                description: "Get your free reports from AnnualCreditReport.com and upload all 3 bureaus (TransUnion, Equifax, Experian). Our AI will analyze them instantly.",
                icon: FileText
              },
              {
                step: 2,
                title: "AI Detects Cross-Bureau Conflicts",
                description: "Our engine finds impossible discrepancies: different balances, conflicting dates, status mismatches. These are your nuclear weapons.",
                icon: Zap
              },
              {
                step: 3,
                title: "Generate Litigation-Grade Letters",
                description: "Get 3 customized dispute letters (one for each bureau) with complete FCRA citations and account-by-account analysis. Download as PDF or TXT.",
                icon: Shield
              },
              {
                step: 4,
                title: "Mail & Track Results",
                description: "Follow our step-by-step mailing guide (handwrite envelope, blue ink, local post office). Track your 30-day deadline and watch deletions happen.",
                icon: Mail
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
                <div className="hidden md:block flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              No monthly fees. No subscriptions. Pay once and you're done.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* DIY Quick */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">DIY Quick</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$29</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <CardDescription className="mt-4">Perfect for 1-3 negative accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>3 bureau letters (1 round)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Cross-bureau analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Mailing instructions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Email support</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/pricing">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Complete Repair - Popular */}
            <Card className="border-4 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Complete Repair</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$79</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <CardDescription className="mt-4">For 4-10 negative accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">9 letters (3 rounds)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Everything in DIY Quick</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>CFPB complaint templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Follow-up letter automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>90-day support</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/pricing">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* White Glove */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">White Glove</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$199</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <CardDescription className="mt-4">For 10+ negative accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Unlimited letters (12 months)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Everything in Complete Repair</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>1-on-1 strategy consultation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>12-month access</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/pricing">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Comparison with Dispute Beast */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">How we compare to Dispute Beast</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">CreditCounsel AI</th>
                    <th className="text-center py-4 px-4">Dispute Beast</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4">Monthly Cost</td>
                    <td className="text-center py-4 px-4 font-bold text-green-600">$0</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">$49.99/month</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">One-time Cost</td>
                    <td className="text-center py-4 px-4 font-bold text-green-600">$29-199</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">N/A</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Letter Quality</td>
                    <td className="text-center py-4 px-4 font-bold text-green-600">Litigation-Grade</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Generic AI</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Success Rate</td>
                    <td className="text-center py-4 px-4 font-bold text-green-600">70-85%</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Not disclosed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Cross-Bureau Conflicts</td>
                    <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="text-center py-4 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">Money-Back Guarantee</td>
                    <td className="text-center py-4 px-4 font-bold text-green-600">110%</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">110%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              110% Money-Back Guarantee
            </h2>
            <p className="text-xl text-muted-foreground">
              We believe in the quality of our platform. If you're not satisfied, we will return <strong>110%</strong> (yes, 110!) of your money if CreditCounsel AI doesn't help you delete negative items after 12 months.
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Risk-Free Process</CardTitle>
                  <CardDescription>
                    Built to deliver real results. If no deletions occur, every payment you've made will be fully refunded plus 10%.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Trust & Transparency</CardTitle>
                  <CardDescription>
                    We stand by the effectiveness of our service, which is why we offer the best guarantee in the industry.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Proven Results</CardTitle>
                  <CardDescription>
                    70-85% of our users successfully delete negative items. We're confident you will too.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to delete negative credit items?
            </h2>
            <p className="text-xl opacity-90">
              Join 10,000+ users who've improved their credit scores with CreditCounsel AI
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <p className="text-sm opacity-75">
              No credit card required to start • 110% money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">CreditCounsel AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Litigation-grade credit repair powered by AI
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
                <li><a href="#reviews" className="hover:text-foreground">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Training</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 CreditCounsel AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
