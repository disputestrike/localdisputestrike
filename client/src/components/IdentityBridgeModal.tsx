/**
 * Identity Bridge Modal (Blueprint §5)
 * 
 * Blocking modal before letter generation to collect:
 * - Full Legal Name (pre-filled)
 * - Date of Birth (pre-filled)
 * - Current Mailing Address (pre-filled)
 * - Previous Address (if moved in last 2 years)
 * - Phone Number (pre-filled)
 * - SSN (Last 4 Digits Only) ← USER ENTERS
 * - Digital Signature ← Signature checkbox
 * - 3 Legal Consent Checkboxes
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Lock, 
  PenTool, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IdentityBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => Promise<void>;
  prefillData?: any;
}

export default function IdentityBridgeModal({
  isOpen,
  onClose,
  onComplete,
  prefillData,
}: IdentityBridgeModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    currentAddress: '',
    currentCity: '',
    currentState: '',
    currentZip: '',
    previousAddress: '',
    previousCity: '',
    previousState: '',
    previousZip: '',
    dateOfBirth: '',
    phone: '',
    ssnLast4: '',
  });

  const [consents, setConsents] = useState({
    signature: false,
    authorize: false,
    noGuarantee: false,
    terms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({ ...prev, ...prefillData }));
    }
  }, [prefillData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.ssnLast4 || formData.ssnLast4.length !== 4) {
      setError("Please enter the last 4 digits of your SSN");
      return;
    }
    if (!consents.signature || !consents.authorize || !consents.noGuarantee || !consents.terms) {
      setError("Please accept all legal consents to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({ ...formData, ...consents });
    } catch (err: any) {
      setError(err.message || "Failed to save information");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <Shield className="h-6 w-6 text-blue-600" />
            Identity Verification Bridge
          </DialogTitle>
          <DialogDescription className="font-medium">
            Confirm your details to generate your legal dispute letters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-xs">
              <strong>Bank-Level Security:</strong> Your information is encrypted and used only for letter generation.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">Full Legal Name</Label>
              <Input value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">Date of Birth</Label>
              <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-gray-500">Current Mailing Address</Label>
            <Input value={formData.currentAddress} onChange={(e) => handleInputChange('currentAddress', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">City</Label>
              <Input value={formData.currentCity} onChange={(e) => handleInputChange('currentCity', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">State</Label>
              <Input value={formData.currentState} onChange={(e) => handleInputChange('currentState', e.target.value)} maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">ZIP</Label>
              <Input value={formData.currentZip} onChange={(e) => handleInputChange('currentZip', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">Phone Number</Label>
              <Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500 text-orange-600">SSN (Last 4 Digits Only) *</Label>
              <Input 
                value={formData.ssnLast4} 
                onChange={(e) => handleInputChange('ssnLast4', e.target.value.replace(/\D/g, '').slice(0, 4))} 
                placeholder="xxxx"
                className="font-mono text-lg tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
              <Checkbox 
                id="sig" 
                checked={consents.signature} 
                onCheckedChange={(v) => setConsents(prev => ({ ...prev, signature: !!v }))} 
              />
              <label htmlFor="sig" className="text-xs leading-tight cursor-pointer">
                I certify that <strong>{formData.fullName || '[Your Name]'}</strong> is my legal name and this serves as my digital signature for all dispute letters.
              </label>
            </div>

            <div className="space-y-3 px-1">
              <div className="flex items-center gap-3">
                <Checkbox id="c1" checked={consents.authorize} onCheckedChange={(v) => setConsents(prev => ({ ...prev, authorize: !!v }))} />
                <label htmlFor="c1" className="text-xs cursor-pointer">I authorize DisputeStrike to send disputes on my behalf</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="c2" checked={consents.noGuarantee} onCheckedChange={(v) => setConsents(prev => ({ ...prev, noGuarantee: !!v }))} />
                <label htmlFor="c2" className="text-xs cursor-pointer">I understand results are not guaranteed</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="c3" checked={consents.terms} onCheckedChange={(v) => setConsents(prev => ({ ...prev, terms: !!v }))} />
                <label htmlFor="c3" className="text-xs cursor-pointer">I agree to the Terms of Service</label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Generate My Letters"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
