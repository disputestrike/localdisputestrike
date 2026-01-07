import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function ExitIntentEmailPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const submitEmailMutation = trpc.leads.captureEmail.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Check your email for the free guide.",
      });
      // Store in localStorage to prevent showing again
      localStorage.setItem("exitIntentEmailCaptured", "true");
      // Close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit email. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Check if user already submitted email
    const alreadyCaptured = localStorage.getItem("exitIntentEmailCaptured");
    if (alreadyCaptured) return;

    // Check if popup was already shown in this session
    const shownInSession = sessionStorage.getItem("exitIntentShown");
    if (shownInSession) return;

    let exitIntentTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport (user trying to close tab/navigate away)
      if (e.clientY <= 0 && !exitIntentTriggered) {
        exitIntentTriggered = true;
        setIsOpen(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Add small delay before activating to avoid false triggers
    const timeoutId = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    submitEmailMutation.mutate({ email, source: "exit_intent_popup" });
  };

  const handleClose = () => {
    setIsOpen(false);
    // Mark as shown in session to prevent re-triggering
    sessionStorage.setItem("exitIntentShown", "true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {!isSubmitted ? (
          <>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">
                    Wait! Don't Leave Empty-Handed
                  </DialogTitle>
                  <DialogDescription className="text-orange-50 text-base">
                    Get your free guide before you go
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-xl font-bold mb-3">
                Free Guide: How to Read Your Credit Report Like a Pro
              </h3>
              <p className="text-gray-600 mb-6">
                Learn exactly what to look for when analyzing your credit report. This guide reveals the most commonly missed errors that could be dragging down your score.
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Identify the 7 most common credit report errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Understand FCRA § 611 rights and how to use them</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Step-by-step checklist for reviewing your report</span>
                </li>
              </ul>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700"
                  disabled={submitEmailMutation.isPending}
                >
                  {submitEmailMutation.isPending ? "Sending..." : "Send Me the Free Guide"}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Check Your Email!</DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              We've sent the free guide to <strong>{email}</strong>. Check your inbox (and spam folder) in the next few minutes.
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
