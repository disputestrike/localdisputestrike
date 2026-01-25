import { useState } from 'react';
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, ExternalLink, Zap, Mail, Download, TrendingUp, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CONSUMER_PRICE_LABELS, 
  SMARTCREDIT_PRICING, 
  formatPrice 
} from "@/lib/pricing";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleStartFree = () => {
    setLocation("/start");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleStartFree}>
                  Start Free Preview
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>

      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            {/* FREE PREVIEW */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-gray-100">
                    FREE FOREVER
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Free Preview</CardTitle>
                <CardDescription>See what's wrong with your credit</CardDescription>
                <div className="mt-4">
                  <div className="text-5xl font-bold">{formatPrice(0)}</div>
                  <p className="text-sm text-muted-foreground mt-1">No credit card required</p>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Upload unlimited credit reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>See total violation count</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Category breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Deletion potential estimate</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <X className="w-5 h-5 mt-0.5" />
                    <span>Cannot see specific violations</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <X className="w-5 h-5 mt-0.5" />
                    <span>Cannot generate letters</span>
                  </li>
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleStartFree}
                >
                  Start Free Preview
                </Button>
              </CardFooter>
            </Card>

            {/* ESSENTIAL */}
            <Card className="border-2 border-orange-500 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-4 py-1.5">
                  <Star className="w-3 h-3 mr-1" /> MOST POPULAR
                </Badge>
              </div>
              
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">Essential</CardTitle>
                <CardDescription>Everything you need to fix your credit</CardDescription>
                <div className="mt-4">
                  <div className="text-5xl font-bold">{CONSUMER_PRICE_LABELS.essential}</div>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Upload reports from <strong>anywhere</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Full AI violation analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span><strong>Unlimited</strong> dispute letter generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Download letters as PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Round 2 & 3 escalation strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Progress tracking dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Download className="w-5 h-5 text-blue-500 mt-0.5" />
                    <span className="text-muted-foreground">You print & mail letters yourself</span>
                  </li>
                </ul>

                {/* Optional SmartCredit Addon */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-sm">Optional Add-On:</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>SmartCredit provides monthly updated reports from all 3 bureaus. Perfect for tracking progress over time.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">SmartCredit Monitoring</span>
                      <Badge variant="outline" className="bg-white">+{formatPrice(SMARTCREDIT_PRICING.customerPrice)}/mo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Billed separately by ConsumerDirect
                    </p>
                    <ul className="text-sm space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>3-bureau monitoring</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>Monthly updated reports</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>Score tracking</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>Perfect for ongoing disputes</span>
                      </li>
                    </ul>
                    
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Total with SmartCredit: {CONSUMER_PRICE_LABELS.essentialWithSmartCredit}/month</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => setLocation('/checkout?plan=essential')}
                >
                  Get Essential
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  3-day money-back guarantee
                </p>
              </CardFooter>
            </Card>

            {/* COMPLETE */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    HANDS-FREE
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Complete</CardTitle>
                <CardDescription>We mail everything for you</CardDescription>
                <div className="mt-4">
                  <div className="text-5xl font-bold">{CONSUMER_PRICE_LABELS.complete}</div>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Everything in Essential, PLUS:</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                    <span><strong>Automated certified mailing</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-purple-500 mt-0.5" />
                    <span>One-click dispute sending</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>USPS certified mail tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Automatic 30-day follow-ups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span><strong>5 mailings/month included</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Additional mailings: $6.99 each</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Priority email support</span>
                  </li>
                </ul>

                {/* Required SmartCredit */}
                <div className="border-t pt-4 mt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-sm">Requires SmartCredit</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      SmartCredit monitoring required for automated mailing ($29.99/mo - billed separately)
                    </p>
                    <p className="text-xs font-semibold">
                      Total with SmartCredit: {CONSUMER_PRICE_LABELS.completeWithSmartCredit}/month
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full"
                  onClick={() => setLocation('/checkout?plan=complete')}
                >
                  Get Complete
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  3-day money-back guarantee
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* SmartCredit Explanation Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">About SmartCredit Monitoring</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>DisputeStrike</strong> provides the software tools (AI analysis, letter generation, tracking).
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>SmartCredit</strong> (by ConsumerDirect) provides 3-bureau credit monitoring and monthly report access.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="text-sm mb-2"><strong>You'll have two charges if you add SmartCredit:</strong></p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• DisputeStrike: {CONSUMER_PRICE_LABELS.essential} or {CONSUMER_PRICE_LABELS.complete}/month (billed by us)</li>
                        <li>• SmartCredit: {formatPrice(SMARTCREDIT_PRICING.customerPrice)}/month (billed separately by ConsumerDirect)</li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Essential users:</strong> SmartCredit is optional. You can upload reports from AnnualCreditReport.com or any other source.
                      <br />
                      <strong>Complete users:</strong> SmartCredit is required for automated mailing features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Feature Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold bg-orange-50">Essential</th>
                    <th className="text-center p-4 font-semibold">Complete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Violation count</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Full violation details</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Generate dispute letters</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-50">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">SmartCredit monitoring</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-50">Optional (+$29.99)</td>
                    <td className="text-center p-4">Required (+$29.99)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Automated mailing</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4">5/month</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">USPS tracking</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b bg-gray-50 font-semibold">
                    <td className="p-4">Monthly cost</td>
                    <td className="text-center p-4">{formatPrice(0)}</td>
                    <td className="text-center p-4 bg-orange-100">{CONSUMER_PRICE_LABELS.essential}</td>
                    <td className="text-center p-4">{CONSUMER_PRICE_LABELS.complete}</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-4">With SmartCredit</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4 bg-orange-100">{CONSUMER_PRICE_LABELS.essentialWithSmartCredit}</td>
                    <td className="text-center p-4">{CONSUMER_PRICE_LABELS.completeWithSmartCredit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I need SmartCredit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <strong>For Essential:</strong> No, SmartCredit is optional. You can upload reports from AnnualCreditReport.com (free once per year) or any other source.
                    <br /><br />
                    <strong>For Complete:</strong> Yes, SmartCredit is required because we need access to pull your updated reports for automated mailing.
                    <br /><br />
                    <strong>Recommended:</strong> If you're doing multiple dispute rounds (most people need 2-3 rounds), SmartCredit is worth it for monthly updated reports and score tracking.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does billing work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You'll see <strong>two separate charges</strong> if you use SmartCredit:
                    <br /><br />
                    1. <strong>DisputeStrike</strong> ({CONSUMER_PRICE_LABELS.essential} or {CONSUMER_PRICE_LABELS.complete}) - billed monthly by us
                    <br />
                    2. <strong>SmartCredit</strong> ({formatPrice(SMARTCREDIT_PRICING.customerPrice)}) - billed monthly by ConsumerDirect
                    <br /><br />
                    Both are separate subscriptions and can be canceled independently.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Yes! Both DisputeStrike and SmartCredit can be canceled anytime. We offer a 3-day money-back guarantee on DisputeStrike subscriptions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's included in "automated mailing"?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    With Complete, we handle everything:
                    <br />
                    • Professional letterhead printing
                    <br />
                    • USPS certified mail with tracking
                    <br />
                    • Return receipt requested
                    <br />
                    • Automatic 30-day follow-up reminders
                    <br />
                    <br />
                    You just click "Send" and we take care of the rest. Includes 5 mailings per month (additional at $6.99 each).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Ready to fix your credit?</h2>
            <p className="text-muted-foreground mb-6">Start with a free preview - no credit card required</p>
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleStartFree}
            >
              Start Free Preview
            </Button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-8 w-8" />
                <span className="font-bold text-xl text-white">DisputeStrike</span>
              </div>
              <p className="text-sm">
                AI-powered credit dispute platform helping you exercise your rights under FCRA.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features"><a className="hover:text-white transition-colors">Features</a></Link></li>
                <li><Link href="/pricing"><a className="hover:text-white transition-colors">Pricing</a></Link></li>
                <li><Link href="/how-it-works"><a className="hover:text-white transition-colors">How It Works</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
                <li><Link href="/privacy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
                <li><Link href="/croa-disclosure"><a className="hover:text-white transition-colors">CROA Disclosure</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq"><a className="hover:text-white transition-colors">FAQ</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-white transition-colors">Contact Us</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} DisputeStrike. All rights reserved.</p>
            <p className="mt-2 text-xs">
              DisputeStrike is not a credit repair organization. We provide software tools to help you exercise your rights under the Fair Credit Reporting Act.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
