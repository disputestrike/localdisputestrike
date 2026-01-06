import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How is this different from other credit repair services?",
      a: "We use AI to detect cross-bureau conflicts that force deletions under FCRA law. Most services use generic templates with 30-40% success rates. Our litigation-grade letters get 70-85% deletion rates. Plus, we're a one-time payment - not a monthly subscription trap."
    },
    {
      q: "Is this legal?",
      a: "Absolutely. We're exercising your rights under the Fair Credit Reporting Act (FCRA). You have the legal right to dispute inaccurate information on your credit reports. Our letters cite specific FCRA sections (§ 1681i, § 1681s-2) and are 100% compliant with federal law."
    },
    {
      q: "How long does it take to see results?",
      a: "Credit bureaus have 30-45 days to investigate disputes by law (FCRA § 1681i). Most customers see deletions within 45-60 days. Some see results in as little as 30 days. If bureaus don't respond within 30 days, they must delete the items automatically."
    },
    {
      q: "Do I need to upload all 3 bureau reports?",
      a: "Yes! Our cross-bureau conflict detection compares all 3 reports (TransUnion, Equifax, Experian) to find discrepancies. This is our secret weapon for forcing deletions. When bureaus have conflicting information, they're required to delete under FCRA § 1681i(a)(5)."
    },
    {
      q: "What if nothing gets deleted?",
      a: "While we have a 95% success rate, results vary by case. We provide escalation strategies and round 2 letters for stubborn items. Complete Repair package includes unlimited letters. We also offer a 110% money-back guarantee if you're not satisfied."
    },
    {
      q: "How much does traditional credit repair cost?",
      a: "Traditional credit repair companies charge $99-$149/month with 6-12 month contracts. That's $1,200-$1,800 per year! Our one-time payment of $29-$399 gives you the same (or better) results without the subscription trap."
    },
    {
      q: "What documents do I need to mail with my letters?",
      a: "You need: (1) Government-issued photo ID (driver's license, passport, state ID), (2) Recent utility bill within 90 days (electric, gas, water, cable, or bank statement), (3) Signed dispute letter, (4) SSN (last 4 digits - already in letter). We provide complete mailing instructions with addresses and checklist."
    },
    {
      q: "Do I have to mail letters via Certified Mail?",
      a: "Yes! Certified Mail with Return Receipt is required for legal proof of delivery. This costs about $8 per letter at the post office. Without proof of delivery, bureaus can claim they never received your dispute. We provide step-by-step mailing instructions."
    },
    {
      q: "Can I dispute accurate information?",
      a: "No. You can only dispute inaccurate, unverifiable, or outdated information. Our system focuses on finding legal violations and cross-bureau conflicts - not helping you dispute legitimate debts. We operate 100% within FCRA guidelines."
    },
    {
      q: "What happens after I mail my letters?",
      a: "Bureaus have 30 days to investigate (FCRA § 1681i). They'll contact the creditor to verify the information. If the creditor can't verify within 30 days, the item must be deleted. You'll receive a response letter by mail showing what was deleted or verified. We track deadlines and provide escalation templates if needed."
    },
    {
      q: "Will this hurt my credit score?",
      a: "No! Disputing inaccurate information is your legal right and does not hurt your score. In fact, successful deletions will increase your score. Our customers see an average increase of 80+ points after deletions."
    },
    {
      q: "Can I use this for bankruptcies or foreclosures?",
      a: "Yes, but results vary. Bankruptcies and foreclosures are public records and harder to remove unless there are errors or FCRA violations. Our AI looks for reporting errors, timeline inconsistencies, and cross-bureau conflicts that can force deletions even for major items."
    },
    {
      q: "Do you offer refunds?",
      a: "Yes! We offer a 110% money-back guarantee. If you follow our process and don't see any deletions within 60 days, we'll refund your purchase plus 10%. No questions asked."
    },
    {
      q: "Is my personal information secure?",
      a: "Absolutely. We use bank-level encryption (256-bit SSL) and store all data on secure servers. Your credit reports and personal information are never shared with third parties. We're fully GDPR and CCPA compliant."
    },
    {
      q: "Can I dispute items that are already 7 years old?",
      a: "Most negative items must be removed after 7 years automatically (bankruptcies after 10 years). If an item is past the reporting limit and still showing, you should definitely dispute it - that's an FCRA violation and must be deleted immediately."
    },
    {
      q: "What if I need help or have questions?",
      a: "All packages include email support. Complete Repair package includes priority support with faster response times. We also provide comprehensive guides, mailing instructions, and escalation templates for every scenario."
    }
  ];

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
              <a className="text-orange-600 hover:text-orange-700 font-medium transition-colors">FAQ</a>
            </Link>
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                  <Link href="/quiz">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
              Frequently Asked <span className="text-orange-600">Questions</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Everything you need to know about credit repair with CreditCounsel
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card 
                key={i} 
                className="border-2 cursor-pointer hover:border-orange-600 transition-colors" 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 pr-8">{faq.q}</CardTitle>
                    <ChevronDown 
                      className={`h-6 w-6 text-gray-600 transition-transform flex-shrink-0 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
                {openFaq === i && (
                  <CardContent>
                    <p className="text-gray-700 text-lg leading-relaxed">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Start your free analysis and we'll guide you through the process.
          </p>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/quiz">Start Free Analysis</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Ready to Delete Negative Items?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join 16,628 customers who've raised their credit scores by 80+ points
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-7 rounded-full" asChild>
            <Link href="/quiz">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container">
          <div className="text-center">
            <p className="text-sm">© 2024 CreditCounsel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
