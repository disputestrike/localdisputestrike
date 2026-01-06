import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Shield, Clock, DollarSign, FileCheck } from "lucide-react";
import { Link } from "wouter";

export default function Guarantee() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src="/logo.png" alt="CreditCounsel" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-900">CreditCounsel</span>
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
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Pricing</a>
            </Link>
            <Link href="/faq">
              <a className="text-gray-700 hover:text-orange-600 font-medium transition-colors">FAQ</a>
            </Link>
            {isAuthenticated && <UserDropdown />}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-8">
              <Shield className="h-12 w-12 text-orange-600" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
              30-Day <span className="text-orange-600">Money-Back</span> Guarantee
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              We're so confident in our system that if you don't see results, we'll refund every penny. No questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-16">How Our Guarantee Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 mx-auto">
                  <FileCheck className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Step 1: Try It Risk-Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Purchase any package and use our platform for 30 days. Generate your letters, send your disputes, and track your results.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 mx-auto">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Step 2: See Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Wait for bureau responses (typically 30-45 days). Most customers see 70-85% of disputed items deleted.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 mx-auto">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Step 3: Get Refund if Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg">
                  Not satisfied? Email us within 30 days of purchase for a full refund. No questions, no hassle.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">What's Covered</h2>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Full Refund Within 30 Days</h3>
                    <p className="text-gray-700">
                      If you're not satisfied for any reason within 30 days of purchase, we'll refund 100% of your payment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Asked</h3>
                    <p className="text-gray-700">
                      We don't make you jump through hoops. Simply email support@creditcounsel.ai and we'll process your refund immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Keep Your Letters</h3>
                    <p className="text-gray-700">
                      Even if you request a refund, you can keep all the dispute letters you've generated. We want you to succeed either way.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">All Packages Covered</h3>
                    <p className="text-gray-700">
                      Whether you purchased the $29 Starter or the $399 Complete Repair package, our guarantee covers every tier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Offer This */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-8">Why We Offer This Guarantee</h2>
            <p className="text-xl text-gray-700 text-center mb-12">
              Because we know our system works. Our 70-85% deletion rate speaks for itself.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-extrabold text-orange-600 mb-2">16,628+</div>
                <div className="text-lg text-gray-700">Satisfied Customers</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold text-orange-600 mb-2">70-85%</div>
                <div className="text-lg text-gray-700">Deletion Rate</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold text-orange-600 mb-2">95%</div>
                <div className="text-lg text-gray-700">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Try It Risk-Free Today</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join 16,628+ customers who've successfully deleted negative items and raised their credit scores
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/quiz">Start Free Analysis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features"><a className="hover:text-white transition-colors">Features</a></Link></li>
                <li><Link href="/pricing"><a className="hover:text-white transition-colors">Pricing</a></Link></li>
                <li><Link href="/how-it-works"><a className="hover:text-white transition-colors">How It Works</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about"><a className="hover:text-white transition-colors">About Us</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-white transition-colors">Contact</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/faq"><a className="hover:text-white transition-colors">FAQ</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-white transition-colors">Contact Support</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-sm">© 2024 CreditCounsel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
