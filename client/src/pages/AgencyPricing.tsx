import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Building2,
  Users,
  FileText,
  Zap,
  Shield,
  HeadphonesIcon,
  ArrowRight,
  Star,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { MerchantNavigation } from "@/components/MerchantNavigation";
import { MobileMenu } from "@/components/MobileMenu";
import { useAuth } from "@/_core/hooks/useAuth";
import { AGENCY_PRICE_LABELS, AGENCY_PRICING } from "@/lib/pricing";

const plans = [
  {
    name: "Starter",
    tier: "starter" as const,
    priceLabel: AGENCY_PRICE_LABELS.starter,
    clients: AGENCY_PRICING.STARTER.clientLimit,
    description: "Perfect for new credit repair businesses",
    popular: false,
    features: [
      "Up to 50 client slots",
      "Unlimited dispute letters",
      "Cross-bureau conflict detection",
      "AI-powered letter generation",
      "Client portal access",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Professional",
    tier: "professional" as const,
    priceLabel: AGENCY_PRICE_LABELS.professional,
    clients: AGENCY_PRICING.PROFESSIONAL.clientLimit,
    description: "For growing credit repair agencies",
    popular: true,
    features: [
      "Up to 200 client slots",
      "Everything in Starter, plus:",
      "White-label client portal",
      "Advanced analytics dashboard",
      "Automated follow-up reminders",
      "Priority email support",
      "Monthly strategy call",
      "Custom letter templates",
    ],
  },
  {
    name: "Enterprise",
    tier: "enterprise" as const,
    priceLabel: AGENCY_PRICE_LABELS.enterprise,
    clients: AGENCY_PRICING.ENTERPRISE.clientLimit,
    description: "For established credit repair firms",
    popular: false,
    features: [
      "Up to 500 client slots",
      "Everything in Professional, plus:",
      "Unlimited sub-users",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Quarterly business reviews",
      "Custom training sessions",
    ],
  },
];

export default function AgencyPricing() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { data: agencyStatus } = trpc.agency.isAgency.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const upgradeToAgency = trpc.agency.upgradeToAgency.useMutation({
    onSuccess: () => {
      setIsUpgradeOpen(false);
      setLocation("/agency");
    },
  });

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (!user) {
      // Redirect to custom login page
      window.location.href = "/login";
      return;
    }
    setSelectedPlan(plan);
    setIsUpgradeOpen(true);
  };

  const handleUpgrade = () => {
    if (!selectedPlan || !agencyName.trim()) return;
    upgradeToAgency.mutate({
      agencyName: agencyName.trim(),
      planTier: selectedPlan.tier,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
              <span className="text-2xl font-bold text-gray-900">DisputeStrike</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-orange-600 font-medium">Pricing</Link>
              <Link href="/agency-pricing" className="text-orange-600 font-medium">Agency Plans</Link>
              <MerchantNavigation />
            </nav>
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/30 inline-flex items-center gap-2 px-3 py-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            Agency & Merchant Accounts
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Scale Your Credit Repair Business
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Manage multiple clients, generate unlimited dispute letters, and grow your 
            credit repair agency with our powerful B2B platform.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-400" />
              <span>Multi-client management</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-400" />
              <span>Unlimited letters</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              <span>AI-powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.tier}
                className={`relative bg-white ${plan.popular ? 'border-2 border-orange-500 shadow-xl scale-[1.02] ring-2 ring-orange-500/20' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1.5 inline-flex items-center gap-2 font-semibold text-sm">
                      <Star className="h-3.5 w-3.5 fill-current shrink-0" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                  <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-1">{plan.description}</CardDescription>
                  <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.priceLabel}</span>
                    <span className="text-base text-gray-500 font-medium">/month</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-orange-600">
                    Up to {plan.clients} clients
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-[15px] leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
                    variant="default"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={agencyStatus?.isAgency && agencyStatus.planTier === plan.tier}
                  >
                    {agencyStatus?.isAgency && agencyStatus.planTier === plan.tier ? (
                      "Current Plan"
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run a Successful Agency
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our agency platform provides all the tools you need to manage clients, 
              generate dispute letters, and track results at scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-gray-600">
                Add clients, store their information securely, and manage all their 
                credit reports and disputes in one place.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Letters</h3>
              <p className="text-gray-600">
                Generate unlimited AI-powered dispute letters for all your clients 
                with our litigation-grade templates.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">FCRA Compliant</h3>
              <p className="text-gray-600">
                All letters are fully FCRA-compliant with proper legal language 
                and documentation requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be 
                prorated and reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">What happens if I exceed my client slots?</h3>
              <p className="text-gray-600">
                You can archive inactive clients to free up slots, or upgrade to a higher 
                plan for more capacity. We also offer additional slot packages.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Is there a contract or commitment?</h3>
              <p className="text-gray-600">
                No long-term contracts. All plans are month-to-month and you can cancel 
                at any time. We're confident you'll love the platform.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Do you offer white-label solutions?</h3>
              <p className="text-gray-600">
                Yes! Professional and Enterprise plans include white-label client portal 
                options. Contact us for custom branding requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Credit Repair Business?</h2>
          <p className="text-xl text-orange-100 mb-8">
            Join hundreds of credit repair professionals who trust DisputeStrike to manage their clients.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-gray-100"
            onClick={() => handleSelectPlan(plans[1])}
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-8 w-8" />
                <span className="text-xl font-bold">DisputeStrike</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered credit dispute platform for individuals and agencies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/agency-pricing">Agency Plans</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/croa-disclosure">CROA Disclosure</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} DisputeStrike. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name} Plan</DialogTitle>
            <DialogDescription>
              Enter your business name to create your agency account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Business Name *</Label>
              <Input
                id="agencyName"
                placeholder="Your Credit Repair Company"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Client Slots</span>
                <span className="font-medium">{selectedPlan?.clients}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="text-gray-600">Monthly Price</span>
                <span className="font-bold text-lg">{selectedPlan?.priceLabel}/mo</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade}
              disabled={!agencyName.trim() || upgradeToAgency.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {upgradeToAgency.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upgrade Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
