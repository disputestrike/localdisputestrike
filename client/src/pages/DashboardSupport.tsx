import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  Search,
  BookOpen,
  Video,
  ExternalLink,
  Loader2,
} from "lucide-react";

const faqs = [
  {
    question: "How long does it take to see results?",
    answer: "Most users see their first deletions within 30-45 days. The credit bureaus have 30 days to investigate disputes, and results typically arrive within 2-4 weeks after that.",
  },
  {
    question: "How do I upload my credit reports?",
    answer: "Go to the Dashboard, click on 'Upload Reports', and either drag & drop your PDF files or click to browse. You can upload reports from all three bureaus.",
  },
  {
    question: "What format should my credit reports be in?",
    answer: "We accept PDF files from AnnualCreditReport.com, IdentityIQ, or direct bureau reports. Make sure the files are not password protected.",
  },
  {
    question: "How do I send my dispute letters?",
    answer: "After generating letters, download the PDFs and send them via Certified Mail with Return Receipt Requested. This provides proof of delivery.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel anytime from Settings > Subscription. Your access will continue until the end of your billing period.",
  },
];

const resources = [
  { title: "Getting Started Guide", icon: BookOpen, type: "Article" },
  { title: "How to Read Your Credit Report", icon: FileText, type: "Article" },
  { title: "Dispute Letter Best Practices", icon: FileText, type: "Article" },
  { title: "Video: Complete Walkthrough", icon: Video, type: "Video" },
  { title: "FCRA Rights Explained", icon: BookOpen, type: "Article" },
];

export default function DashboardSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Support ticket submitted! We'll respond within 24 hours.");
    setTicketForm({ subject: "", message: "" });
    setIsSubmitting(false);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-orange-500" />
            Help & Support
          </h1>
          <p className="text-gray-500 mt-1">
            Get help with your account and disputes
          </p>
        </div>

        {/* Search */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200 hover:border-cyan-500/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-orange-50 rounded-xl w-fit mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-500">Chat with our support team</p>
              <p className="text-xs text-orange-500 mt-2">Available 9am-6pm EST</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-cyan-500/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-orange-50 rounded-xl w-fit mx-auto mb-3">
                <Mail className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-500">support@disputestrike.com</p>
              <p className="text-xs text-orange-500 mt-2">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-cyan-500/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-orange-50 rounded-xl w-fit mx-auto mb-3">
                <Phone className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Phone Support</h3>
              <p className="text-sm text-gray-500">1-800-DISPUTE</p>
              <p className="text-xs text-orange-500 mt-2">Mon-Fri 9am-6pm EST</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQs */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-gray-50 rounded-lg"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                      <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                      <ChevronRight className="h-4 w-4 text-gray-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-500">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <resource.icon className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-900">{resource.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{resource.type}</span>
                      <ExternalLink className="h-3 w-3 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Ticket */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Submit a Support Ticket</CardTitle>
            <CardDescription className="text-gray-500">
              Can't find what you're looking for? Send us a message.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Subject</Label>
              <Input
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Message</Label>
              <Textarea
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="bg-gray-100 border-gray-300 text-gray-900 resize-none"
              />
            </div>
            <Button
              onClick={handleSubmitTicket}
              className="bg-cyan-500 hover:bg-orange-500 text-gray-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
