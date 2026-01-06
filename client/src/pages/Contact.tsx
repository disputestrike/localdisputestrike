import { Link } from "wouter";
import { Shield, Mail, MessageSquare, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserDropdown } from "@/components/UserDropdown";
import { MobileMenu } from "@/components/MobileMenu";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

// Toast functionality - using simple alerts for now
const toast = ({ title, description }: { title: string; description?: string }) => {
  alert(`${title}${description ? '\n' + description : ''}`);
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: formData.message,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">CreditCounsel</span>
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
              Get in <span className="text-orange-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Have questions? We're here to help. Our support team typically responds within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-2">support@creditcounsel.com</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-2">Available in dashboard</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9am-6pm EST</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600 mb-2">Typically under 24 hours</p>
              <p className="text-sm text-gray-500">Priority support available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full"
                  />
                </div>



                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your question or issue..."
                    rows={6}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Looking for Quick Answers?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Check out our FAQ page for instant answers to common questions about credit repair, dispute letters, and our service.
            </p>
            <Button size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 text-lg px-8 py-6" asChild>
              <Link href="/faq">View FAQ</Link>
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
            <p>&copy; 2024 CreditCounsel. All rights reserved.</p>
            <p className="mt-2 text-sm">Credit Should Be Affordable. For everyone. Always.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
