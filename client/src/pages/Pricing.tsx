import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  const createPayment = trpc.payments.createIntent.useMutation({
    onSuccess: (data) => {
      toast.success(`Payment initiated: $${data.amount}`);
      // TODO: Integrate with actual Stripe checkout
      // For now, just show success
    },
    onError: (error) => {
      toast.error(`Payment failed: ${error.message}`);
    },
  });

  const handlePurchase = (tier: "diy_quick" | "diy_complete" | "white_glove") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    createPayment.mutate({ tier });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">CreditCounsel AI</span>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="text-center mb-16">
          <h1 className="mb-4">Choose Your Plan</h1>
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
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handlePurchase("diy_quick")}
                disabled={createPayment.isPending}
              >
                {createPayment.isPending ? "Processing..." : "Get Started"}
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
              <Button 
                className="w-full gradient-primary text-primary-foreground"
                onClick={() => handlePurchase("diy_complete")}
                disabled={createPayment.isPending}
              >
                {createPayment.isPending ? "Processing..." : "Get Started"}
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
              <Button 
                className="w-full gradient-premium text-accent-foreground"
                onClick={() => handlePurchase("white_glove")}
                disabled={createPayment.isPending}
              >
                {createPayment.isPending ? "Processing..." : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include lifetime access to your letters and tracking dashboard
        </p>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why is this better than Dispute Beast?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dispute Beast uses bulk mailing (Sprint Mail) that credit bureaus easily detect. 
                  We teach you the RIGHT way to mail locally - undetectable by bureaus, resulting in 
                  70-85% success rates vs their 30-40%.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I need to mail the letters myself?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For DIY Quick and Complete Repair, yes - we provide step-by-step instructions. 
                  For White Glove, we mail pre-printed letters to your home with everything you need. 
                  Mailing yourself from your local post office is the most effective method.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does it take to see results?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bureaus have 30 days to respond. Most users see first deletions within 45-60 days. 
                  For complete credit repair (multiple rounds), expect 3-6 months to reach 700+ scores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is this legal?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. We use the Fair Credit Reporting Act (FCRA) - federal law that gives you 
                  the right to dispute inaccurate information. Our letters cite specific FCRA violations 
                  and are 100% compliant.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
