import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle2, FileText, Mail, Shield, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CreditCounsel AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#how-it-works">How It Works</a>
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

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Powered by AI + FCRA Law
            </Badge>
            <h1 className="text-balance">
              Delete Negative Credit Items with <span className="gradient-primary bg-clip-text text-transparent">Litigation-Grade</span> Dispute Letters
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Get 70-85% deletion rates with AI-generated dispute letters that credit bureaus can't detect. 
              Same quality as $2,500 attorneys, starting at just $29.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                  Start Disputing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-8 justify-center items-center pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>70-85% Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>FCRA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>No Monthly Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-lg border-2 border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Why Other Services Fail</h3>
                <p className="text-muted-foreground">
                  Services like Dispute Beast use bulk mailing (Sprint Mail) that credit bureaus easily detect with AI. 
                  Result? Stall letters, delays, and only 30-40% success rates. You pay $50/month for mediocre results.
                </p>
                <p className="font-semibold text-foreground">
                  Our platform teaches you the RIGHT way to mail locally - undetectable by bureaus, 70-85% success rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Why CreditCounsel AI Beats the Competition</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Litigation-grade letters + undetectable mailing method = maximum deletions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Cross-Bureau Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI automatically detects conflicts across TransUnion, Equifax, and Experian. 
                  Balance discrepancies, status conflicts, and date mismatches become your strongest weapons.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Litigation-Grade Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete FCRA citations (§ 1681i, § 1681s-2), account-by-account analysis, 
                  and legal consequences. Same quality as $2,500 attorney letters.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Undetectable Mailing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Step-by-step guidance for mailing from YOUR local post office. Bureaus can't detect it, 
                  no stall letters, maximum effectiveness.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Proven Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  70-85% deletion rates vs 30-40% industry average. Users see 80-120 point score increases 
                  within 3-6 months.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Instant Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload credit reports, get customized letters in minutes. No waiting weeks for attorneys 
                  or credit repair companies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Complete System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mailing checklists, tracking, 30-day reminders, CFPB complaints, follow-up letters. 
                  Everything you need to win.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No monthly subscriptions. Pay once, get results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* DIY Quick */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>DIY Quick</CardTitle>
                <CardDescription>Perfect for 1-3 negative accounts</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>3 bureau letters (1 round)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Cross-bureau conflict analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Mailing instructions + video</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Interactive checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>Get Started</a>
                </Button>
              </CardFooter>
            </Card>

            {/* Complete Repair - POPULAR */}
            <Card className="relative border-primary shadow-lg scale-105">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Complete Repair</CardTitle>
                <CardDescription>For 4-10 negative accounts</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">9 letters (3 rounds)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Everything in DIY Quick</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>CFPB complaint templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Follow-up letter automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>90-day tracking & reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full gradient-primary text-primary-foreground" asChild>
                  <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>Get Started</a>
                </Button>
              </CardFooter>
            </Card>

            {/* White Glove */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>White Glove</CardTitle>
                <CardDescription>Premium concierge service</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">Everything in Complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>Pre-printed letters mailed to you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>Pre-addressed envelopes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>1-on-1 coaching call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full gradient-premium text-accent-foreground" asChild>
                  <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>Get Started</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans include lifetime access to your letters and tracking dashboard
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From credit reports to deletions in 4 simple steps
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="mb-2">Upload Your Credit Reports</h3>
                <p className="text-muted-foreground">
                  Upload all 3 bureau reports (TransUnion, Equifax, Experian). Our AI automatically extracts 
                  negative accounts and detects cross-bureau conflicts.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-success flex items-center justify-center text-secondary-foreground font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="mb-2">Generate Litigation-Grade Letters</h3>
                <p className="text-muted-foreground">
                  Our AI creates customized dispute letters for each bureau with complete FCRA citations, 
                  cross-bureau conflicts, and account-by-account analysis. Download instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-premium flex items-center justify-center text-accent-foreground font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="mb-2">Mail Using Our Proven Method</h3>
                <p className="text-muted-foreground">
                  Follow our step-by-step mailing guide: handwrite envelope, sign in blue ink, mail from 
                  your local post office. Bureaus can't detect it - no stall letters!
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="mb-2">Track & Win</h3>
                <p className="text-muted-foreground">
                  Track your disputes, get 30-day deadline reminders, upload responses. If they fail to respond 
                  or verify, we generate CFPB complaints and escalation letters automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2>Ready to Clean Your Credit?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who've deleted negative items and increased their credit scores by 80-120 points.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 gradient-primary text-primary-foreground" asChild>
                <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                  Start Your Dispute Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required to start • 70-85% success rate • FCRA compliant
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold">CreditCounsel AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Litigation-grade credit repair powered by AI and FCRA law.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 CreditCounsel AI. All rights reserved.</p>
            <p className="mt-2">
              Disclaimer: We are not a law firm. This platform generates informational templates only. 
              Consult an attorney before proceeding.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
