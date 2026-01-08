import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function LetterView() {
  const [, params] = useRoute("/letter/:letterId");
  const letterId = params?.letterId ? parseInt(params.letterId) : 0;

  const { data: letter, isLoading } = trpc.disputeLetters.get.useQuery({ id: letterId });
  const updateStatus = trpc.disputeLetters.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Letter status updated!");
    },
  });
  const downloadPDF = trpc.disputeLetters.downloadPDF.useMutation({
    onSuccess: (data) => {
      // Open PDF in new tab
      window.open(data.url, '_blank');
      toast.success("PDF generated! Opening in new tab...");
    },
    onError: () => {
      toast.error("Failed to generate PDF. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Letter Not Found</CardTitle>
            <CardDescription>The Dispute letter you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    toast.loading("Generating PDF...");
    downloadPDF.mutate({ id: letter.id });
  };

  const handleMarkAsMailed = () => {
    const trackingNumber = prompt("Enter tracking number (optional):");
    updateStatus.mutate({
      id: letter.id,
      status: "mailed",
      trackingNumber: trackingNumber || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {letter.status !== "mailed" && letter.status !== "resolved" && (
            <Button onClick={handleMarkAsMailed} className="gradient-primary text-primary-foreground">
              <Mail className="h-4 w-4 mr-2" />
              Mark as Mailed
            </Button>
          )}
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        {/* Letter Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="capitalize">{letter.bureau} Dispute Letter</CardTitle>
                <CardDescription>
                  Round {letter.round} • {letter.letterType} • Generated {new Date(letter.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge 
                variant={
                  letter.status === "resolved" ? "default" :
                  letter.status === "mailed" ? "secondary" :
                  "outline"
                }
              >
                {letter.status}
              </Badge>
            </div>
          </CardHeader>
          {letter.mailedAt && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>Mailed on {new Date(letter.mailedAt).toLocaleDateString()}</span>
                {letter.trackingNumber && (
                  <Badge variant="outline">{letter.trackingNumber}</Badge>
                )}
              </div>
              {letter.responseDeadline && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  <span>Response due by {new Date(letter.responseDeadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Mailing Instructions Alert */}
        {letter.status === "generated" || letter.status === "downloaded" ? (
          <Alert className="mb-6 border-accent bg-accent/10">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <strong>Ready to mail?</strong> Follow our complete mailing guide to ensure your dispute is processed correctly.
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>What documents to include (ID, utility bill)</li>
                    <li>How to send via Certified Mail with Return Receipt</li>
                    <li>Step-by-step post office instructions</li>
                    <li>Common mistakes to avoid</li>
                  </ul>
                </div>
                <Button asChild variant="default" size="sm" className="flex-shrink-0">
                  <Link href="/mailing-instructions">
                    <Mail className="h-4 w-4 mr-2" />
                    View Complete Guide
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Letter Content */}
        <Card>
          <CardHeader>
            <CardTitle>Letter Content</CardTitle>
            <CardDescription>
              This letter is ready to print and mail. Do not edit the content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <Streamdown>{letter.letterContent}</Streamdown>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Download and Print</p>
                <p className="text-sm text-muted-foreground">
                  Download this letter and print it on white paper
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Sign in Blue Ink</p>
                <p className="text-sm text-muted-foreground">
                  Sign the letter at the bottom in blue ink (not black)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Prepare Envelope</p>
                <p className="text-sm text-muted-foreground">
                  Handwrite the bureau's address on envelope in blue ink
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                4
              </div>
              <div>
                <p className="font-semibold">Include Documents</p>
                <p className="text-sm text-muted-foreground">
                  Add copies of: ID, utility bill, and credit reports (with disputed items highlighted)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                5
              </div>
              <div>
                <p className="font-semibold">Mail from Local Post Office</p>
                <p className="text-sm text-muted-foreground">
                  Go to your nearest post office and send via certified mail with return receipt
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold">Track & Wait</p>
                <p className="text-sm text-muted-foreground">
                  Mark as mailed in the dashboard and track the 30-day response deadline
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
