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
  AlertCircle,
  CheckCircle2,
  Info,
  Upload,
  Loader2
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
    if (!formData.fullName) {
      setError("Full legal name is required");
      return;
    }
    if (!formData.currentAddress) {
      setError("Current address is required");
      return;
    }
    if (!formData.dateOfBirth) {
      setError("Date of birth is required");
      return;
    }
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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            We need this information to generate your letters and verify with the credit bureaus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Your data is secure:</strong> All information is encrypted and stored securely.
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
              <Label>Full Legal Name</Label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => handleInputChange('fullName', e.target.value)} 
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input 
                type="date" 
                value={formData.dateOfBirth} 
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Mailing Address</Label>
            <Input 
              value={formData.currentAddress} 
              onChange={(e) => handleInputChange('currentAddress', e.target.value)} 
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input 
                value={formData.currentCity} 
                onChange={(e) => handleInputChange('currentCity', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input 
                value={formData.currentState} 
                onChange={(e) => handleInputChange('currentState', e.target.value)} 
                maxLength={2} 
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP</Label>
              <Input 
                value={formData.currentZip} 
                onChange={(e) => handleInputChange('currentZip', e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>SSN (Last 4 Digits Only) *</Label>
              <Input 
                value={formData.ssnLast4} 
                onChange={(e) => handleInputChange('ssnLast4', e.target.value.replace(/\D/g, '').slice(0, 4))} 
                placeholder="1234"
                maxLength={4}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-bold text-gray-900">Legal Authorization & Consent</h3>
            
            <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border">
              <Checkbox 
                id="sig" 
                checked={consents.signature} 
                onCheckedChange={(v) => setConsents(prev => ({ ...prev, signature: !!v }))} 
              />
              <div className="space-y-1">
                <Label htmlFor="sig" className="text-sm font-bold flex items-center gap-2">
                  <PenTool className="h-3 w-3" /> Digital Signature Certification
                </Label>
                <p className="text-xs text-gray-600">
                  I certify that the information provided is true and correct, and I authorize the use of my digital signature on dispute letters.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="c1" 
                  checked={consents.authorize} 
                  onCheckedChange={(v) => setConsents(prev => ({ ...prev, authorize: !!v }))} 
                />
                <Label htmlFor="c1" className="text-xs text-gray-600">I authorize DisputeStrike to send disputes on my behalf</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="c2" 
                  checked={consents.noGuarantee} 
                  onCheckedChange={(v) => setConsents(prev => ({ ...prev, noGuarantee: !!v }))} 
                />
                <Label htmlFor="c2" className="text-xs text-gray-600">I understand results are not guaranteed</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="c3" 
                  checked={consents.terms} 
                  onCheckedChange={(v) => setConsents(prev => ({ ...prev, terms: !!v }))} 
                />
                <Label htmlFor="c3" className="text-xs text-gray-600">I agree to the Terms of Service</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Generate My Letters
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
