import { Link } from "wouter";
import { Shield, Users, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { CreditScoreAnimation } from "@/components/CreditScoreAnimation";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">DisputeForce</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-700 hover:text-orange-600 font-medium">Features</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-orange-600 font-medium">How It Works</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-orange-600 font-medium">Pricing</Link>
              <Link href="/faq" className="text-gray-700 hover:text-orange-600 font-medium">FAQ</Link>
              <UserDropdown />
            </nav>

            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-orange-50 to-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              About <span className="text-orange-600">DisputeForce</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              We're on a mission to democratize credit monitoring by making litigation-grade Attack letters accessible to everyone—not just those who can afford expensive attorneys.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Our Story</h2>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                DisputeForce was born from a simple observation: traditional credit monitoring services charge thousands of dollars for work that can be automated with artificial intelligence. We watched as families struggled with bad credit, unable to afford the $1,500-$3,000 annual fees charged by credit monitoring companies, while knowing that the same results could be achieved for a fraction of the cost.
              </p>
              
              <p>
                Our founders spent years studying the Fair Credit Reporting Act (FCRA), analyzing thousands of successful Attack letters, and understanding what makes credit bureaus delete negative items. We discovered that the secret wasn't magic—it was proper legal citations, cross-bureau conflict detection, and personalized arguments that credit bureaus couldn't ignore.
              </p>
              
              <p>
                In 2024, we launched DisputeForce with a bold vision: use cutting-edge AI technology to generate litigation-grade Attack letters that rival what $2,500 attorneys produce, but make them available for just $29. We wanted to level the playing field and give everyone access to the same powerful tools that wealthy individuals use to improve their credit.
              </p>
              
              <p>
                Today, we've helped over 16,000 customers delete negative items from their credit reports, raising scores by an average of 80+ points. Our AI-powered platform analyzes credit reports, detects cross-bureau conflicts, and generates personalized Attack letters with proper FCRA citations—all automatically. We've proven that credit monitoring doesn't have to be expensive to be effective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-orange-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-2xl text-gray-800 font-semibold mb-6">
              Credit Should Be Affordable. For everyone. Always.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              We believe that everyone deserves access to powerful credit monitoring tools, regardless of their income. Our mission is to make litigation-grade Attack letters accessible to all Americans, helping families escape the cycle of bad credit and build the financial future they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Our Values</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Legal Excellence</h3>
              <p className="text-gray-700 leading-relaxed">
                Every letter we generate includes proper FCRA citations, legal arguments, and compelling evidence. We don't cut corners—our AI produces attorney-quality work that credit bureaus take seriously.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Success</h3>
              <p className="text-gray-700 leading-relaxed">
                Your success is our success. We measure ourselves by the number of negative items deleted and credit scores raised. We're not satisfied until you see real results in your credit report.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-700 leading-relaxed">
                No hidden fees, no recurring subscriptions, no surprises. You pay once and get exactly what we promise: professional Attack letters with full mailing instructions. Simple, honest, transparent.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                We continuously improve our AI algorithms, study new FCRA case law, and refine our letter generation process. We're committed to staying ahead of the curve and delivering the best results possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container">
          <h2 className="text-4xl font-extrabold mb-12 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center mb-16">
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">16,628+</div>
              <div className="text-xl font-medium">Happy Customers</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">80+ pts</div>
              <div className="text-xl font-medium">Average Score Increase</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">70-85%</div>
              <div className="text-xl font-medium">Deletion Rate</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-extrabold mb-2">95%</div>
              <div className="text-xl font-medium">Success Rate</div>
            </div>
          </div>
          
          {/* Visual Proof - Animated Transformation */}
          <div className="max-w-4xl mx-auto">
            <CreditScoreAnimation className="w-full" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of customers who've successfully deleted negative items and raised their credit scores.
            </p>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-12 py-7 rounded-full" asChild>
              <Link href="/quiz">Start Free Analysis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link href="/mailing-instructions" className="text-gray-400 hover:text-white">Mailing Guide</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DisputeForce. All rights reserved.</p>
            <p className="mt-2 text-sm">Credit Should Be Affordable. For everyone. Always.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
