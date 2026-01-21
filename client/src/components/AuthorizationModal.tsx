/**
 * Authorization Modal Component
 * 
 * Required for Complete Plan users before sending letters via Lob.
 * Contains 4 checkboxes that must all be checked before proceeding.
 * Records authorization timestamp and IP for compliance.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Shield, 
  Mail, 
  DollarSign, 
  FileCheck,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize: (checkboxes: AuthorizationCheckboxes) => Promise<void>;
  letterCount: number;
  totalCost: number;
  bureaus: string[];
}

export interface AuthorizationCheckboxes {
  accuracyConfirmed: boolean;
  authorizedToSend: boolean;
  understandCosts: boolean;
  agreeToTerms: boolean;
}

export default function AuthorizationModal({
  isOpen,
  onClose,
  onAuthorize,
  letterCount,
  totalCost,
  bureaus,
}: AuthorizationModalProps) {
  const [checkboxes, setCheckboxes] = useState<AuthorizationCheckboxes>({
    accuracyConfirmed: false,
    authorizedToSend: false,
    understandCosts: false,
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = Object.values(checkboxes).every(Boolean);

  const handleCheckboxChange = (key: keyof AuthorizationCheckboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setError(null);
  };

  const handleAuthorize = async () => {
    if (!allChecked) {
      setError('Please confirm all checkboxes before proceeding');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAuthorize(checkboxes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCheckboxes({
        accuracyConfirmed: false,
        authorizedToSend: false,
        understandCosts: false,
        agreeToTerms: false,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-primary" />
            Authorize Letter Mailing
          </DialogTitle>
          <DialogDescription>
            Please review and confirm the following before we send your dispute letters via certified mail.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Card */}
        <div className="bg-muted/50 rounded-lg p-4 my-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Mailing Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Letters to Send</p>
              <p className="font-semibold text-lg">{letterCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Cost</p>
              <p className="font-semibold text-lg text-primary">${totalCost.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Bureaus</p>
              <p className="font-medium">{bureaus.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Authorization Checkboxes */}
        <div className="space-y-4">
          {/* Checkbox 1: Accuracy */}
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id="accuracyConfirmed"
              checked={checkboxes.accuracyConfirmed}
              onCheckedChange={() => handleCheckboxChange('accuracyConfirmed')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="accuracyConfirmed" className="flex items-center gap-2 cursor-pointer">
                <FileCheck className="w-4 h-4 text-blue-500" />
                <span className="font-medium">I confirm the information is accurate</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I have reviewed the dispute letters and confirm all information is accurate to the best of my knowledge.
              </p>
            </div>
          </div>

          {/* Checkbox 2: Authorization */}
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id="authorizedToSend"
              checked={checkboxes.authorizedToSend}
              onCheckedChange={() => handleCheckboxChange('authorizedToSend')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="authorizedToSend" className="flex items-center gap-2 cursor-pointer">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="font-medium">I authorize DisputeStrike to mail on my behalf</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I authorize DisputeStrike to send these dispute letters via USPS certified mail to the credit bureaus on my behalf.
              </p>
            </div>
          </div>

          {/* Checkbox 3: Cost Understanding */}
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id="understandCosts"
              checked={checkboxes.understandCosts}
              onCheckedChange={() => handleCheckboxChange('understandCosts')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="understandCosts" className="flex items-center gap-2 cursor-pointer">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">I understand the mailing costs</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand that mailing costs (${totalCost.toFixed(2)} total) are included in my Complete Plan subscription and no additional charges will apply.
              </p>
            </div>
          </div>

          {/* Checkbox 4: Terms Agreement */}
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id="agreeToTerms"
              checked={checkboxes.agreeToTerms}
              onCheckedChange={() => handleCheckboxChange('agreeToTerms')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="agreeToTerms" className="flex items-center gap-2 cursor-pointer">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="font-medium">I agree to the Terms of Service</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I agree to the <a href="/terms" className="text-primary underline" target="_blank">Terms of Service</a> and understand that results are not guaranteed. DisputeStrike provides software tools, not legal advice.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="flex items-start gap-2 text-sm bg-amber-50 text-amber-800 p-3 rounded-lg mt-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Important Notice</p>
            <p className="text-amber-700">
              Once authorized, letters will be printed and mailed within 1-2 business days. 
              This action cannot be undone. Bureaus have 30 days to respond.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAuthorize} 
            disabled={!allChecked || isSubmitting}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authorizing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Authorize & Send Letters
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Footer Info */}
        <div className="text-xs text-center text-muted-foreground mt-2">
          <Info className="w-3 h-3 inline mr-1" />
          Your authorization will be recorded with timestamp and IP address for compliance purposes.
        </div>
      </DialogContent>
    </Dialog>
  );
}
