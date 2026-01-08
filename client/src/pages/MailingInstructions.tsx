import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Home,
  CheckCircle2,
  AlertTriangle,
  Mail,
  FileText,
  CreditCard,
  MapPin,
  Clock,
  Printer,
  Package,
} from "lucide-react";
import { Link } from "wouter";

export default function MailingInstructions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DisputeStrike AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Mail className="h-3 w-3 mr-1" />
            Complete Mailing Guide
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            How to Mail Your Dispute Letters
          </h1>
          <p className="text-xl text-muted-foreground">
            Follow these steps to ensure your disputes are processed correctly and you have proof of delivery
          </p>
        </div>

        {/* Critical Alert */}
        <Alert className="mb-8 border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <strong>IMPORTANT:</strong> You MUST send via <strong>Certified Mail with Return Receipt</strong>. 
            This provides legal proof of delivery and forces the bureaus to respond within 30 days under FCRA § 1681i(a)(1).
          </AlertDescription>
        </Alert>

        {/* What to Include Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              What to Include in Your Envelope
            </CardTitle>
            <CardDescription>
              Each envelope should contain these documents (in this order)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Your Dispute Letter (Printed)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Print the letter we generated for you. Make sure it's clear and legible. Keep a copy for your records.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Government-Issued Photo ID (Copy)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Required to verify your identity.</strong> Acceptable IDs:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Driver's License (front and back)</li>
                    <li>• State ID Card (front and back)</li>
                    <li>• Passport (photo page)</li>
                    <li>• Military ID</li>
                  </ul>
                  <Alert className="mt-3 bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-900">
                      <strong>Why?</strong> FCRA requires bureaus to verify your identity before processing disputes. 
                      Without ID, they'll reject your letter immediately.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Proof of Address (Recent Utility Bill)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Must show your current address and be dated within the last 90 days.</strong> Acceptable documents:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Electric bill</li>
                    <li>• Gas bill</li>
                    <li>• Water bill</li>
                    <li>• Cable/Internet bill</li>
                    <li>• Bank statement (with address visible)</li>
                    <li>• Lease agreement (if recent)</li>
                  </ul>
                  <Alert className="mt-3 bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-900">
                      <strong>Why?</strong> Bureaus need to confirm you live at the address on file. This prevents fraud 
                      and ensures responses are sent to the correct location.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Social Security Number (Last 4 Digits Only)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The letter already includes this. <strong>NEVER send your full SSN</strong> - only the last 4 digits 
                    are needed for verification.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Mailing Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Step-by-Step Mailing Process
            </CardTitle>
            <CardDescription>
              Follow these exact steps at the post office
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Step 1: Prepare Your Documents</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Print your Dispute letter</li>
                  <li>✓ Make a copy of your photo ID (front and back)</li>
                  <li>✓ Get a recent utility bill or bank statement</li>
                  <li>✓ Keep copies of EVERYTHING for your records</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Step 2: Address the Envelope</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the bureau addresses provided with your letter. Write clearly or print address labels.
                </p>
                <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                  <p><strong>TransUnion:</strong><br />
                  TransUnion Consumer Solutions<br />
                  P.O. Box 2000<br />
                  Chester, PA 19016</p>
                  
                  <p><strong>Equifax:</strong><br />
                  Equifax Information Services LLC<br />
                  P.O. Box 740256<br />
                  Atlanta, GA 30374</p>
                  
                  <p><strong>Experian:</strong><br />
                  Experian<br />
                  P.O. Box 4500<br />
                  Allen, TX 75013</p>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Step 3: Go to the Post Office</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Say this exactly:</strong>
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm">
                  "I need to send this <strong>Certified Mail with Return Receipt (green card)</strong>."
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cost: ~$8-10 per letter (Certified Mail ~$4 + Return Receipt ~$3 + postage)
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Step 4: Get Your Tracking Number</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The clerk will give you:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• A receipt with a tracking number (starts with 9407...)</li>
                  <li>• A small green card (PS Form 3811) that will be returned to you when delivered</li>
                </ul>
                <Alert className="mt-3 bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-sm text-yellow-900">
                    <strong>SAVE THESE!</strong> This is your legal proof of mailing and delivery. Take a photo 
                    and upload the tracking number to your dashboard.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Step 5: Track Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Track your letter at <a href="https://tools.usps.com/go/TrackConfirmAction" target="_blank" rel="noopener noreferrer" className="text-primary underline">USPS.com</a> using 
                  your tracking number. Delivery usually takes 3-5 business days.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Step 6: Wait for Response</h3>
                <p className="text-sm text-muted-foreground">
                  The bureau has <strong>30 days from receipt</strong> to investigate and respond (FCRA § 1681i(a)(1)). 
                  Mark your calendar and set a reminder in your dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Mistakes to Avoid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Common Mistakes to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-destructive">✗</span>
                <p><strong>Sending via regular mail</strong> - You'll have no proof of delivery</p>
              </div>
              <div className="flex gap-2">
                <span className="text-destructive">✗</span>
                <p><strong>Forgetting to include ID</strong> - Your letter will be rejected immediately</p>
              </div>
              <div className="flex gap-2">
                <span className="text-destructive">✗</span>
                <p><strong>Using an old utility bill</strong> - Must be within 90 days</p>
              </div>
              <div className="flex gap-2">
                <span className="text-destructive">✗</span>
                <p><strong>Not keeping copies</strong> - Always keep copies of everything you send</p>
              </div>
              <div className="flex gap-2">
                <span className="text-destructive">✗</span>
                <p><strong>Losing your tracking number</strong> - This is your legal proof!</p>
              </div>
              <div className="flex gap-2">
                <span className="text-destructive">✗</span>
                <p><strong>Sending all 3 bureaus in one envelope</strong> - Send separate envelopes to each bureau</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Expected Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  <Badge variant="outline">Day 0</Badge>
                </div>
                <div>
                  <p className="font-semibold">Mail your letters</p>
                  <p className="text-sm text-muted-foreground">Send via Certified Mail with Return Receipt</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  <Badge variant="outline">Day 3-5</Badge>
                </div>
                <div>
                  <p className="font-semibold">Letters delivered</p>
                  <p className="text-sm text-muted-foreground">Track delivery on USPS.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  <Badge variant="outline">Day 30</Badge>
                </div>
                <div>
                  <p className="font-semibold">Response deadline</p>
                  <p className="text-sm text-muted-foreground">Bureaus must respond within 30 days of receipt</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  <Badge variant="secondary">Day 35+</Badge>
                </div>
                <div>
                  <p className="font-semibold">Check your mail and credit reports</p>
                  <p className="text-sm text-muted-foreground">Look for response letters and verify deletions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Printable Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Printable Mailing Checklist
            </CardTitle>
            <CardDescription>
              Print this checklist and check off each item before mailing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Dispute letter printed and signed</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Copy of government-issued photo ID (front and back)</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Recent utility bill or bank statement (within 90 days)</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Envelope addressed correctly</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Made copies of all documents for my records</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Sent via Certified Mail with Return Receipt</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Saved tracking number and receipt</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Uploaded tracking number to dashboard</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5" />
                <label className="text-sm">Set 30-day reminder for response deadline</label>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print This Checklist
            </Button>
          </CardContent>
        </Card>

        {/* Success Tips */}
        <Card className="mb-8 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Pro Tips for Maximum Success
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-900">
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Mail all 3 bureaus on the same day for synchronized 30-day deadlines</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Take photos of your tracking receipts immediately (phones get lost!)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Check USPS tracking daily until delivered</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Save the green return receipt card when it arrives (usually 7-14 days)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>If no response after 30 days, you can file a CFPB complaint (our platform provides the tools)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              <Home className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
