import { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

interface IdentityBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => Promise<void>;
  prefillData?: any;
  /** Essential tier: ID + utility bill required to complete onboarding. Complete tier: no uploads needed. */
  requiresIdAndUtility?: boolean;
}

export default function IdentityBridgeModal({
  isOpen,
  onClose,
  onComplete,
  prefillData,
  requiresIdAndUtility = false,
}: IdentityBridgeModalProps) {
  const idFileRef = useRef<HTMLInputElement>(null);
  const utilityFileRef = useRef<HTMLInputElement>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [utilityFile, setUtilityFile] = useState<File | null>(null);
  const uploadToS3 = trpc.upload.uploadToS3.useMutation();

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
      console.log('[IdentityBridgeModal] Applying prefill:', prefillData);
      setFormData(prev => ({ ...prev, ...prefillData }));
    }
  }, [prefillData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /** Essential only: save profile without ID/utility; user can complete onboarding later. */
  const handleSaveForLater = async () => {
    if (!formData.fullName || !formData.currentAddress || !formData.dateOfBirth || (formData.ssnLast4?.length ?? 0) !== 4) {
      setError("Please fill in name, address, date of birth, and SSN last 4 to save.");
      return;
    }
    if (!consents.signature || !consents.authorize || !consents.noGuarantee || !consents.terms) {
      setError("Please accept all legal consents to continue");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete({
        ...formData,
        ...consents,
        saveForLater: true,
        subscriptionTier: 'essential',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
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
    // Essential: ID + utility required only when doing full "Complete onboarding"
    if (requiresIdAndUtility) {
      if (!idFile) {
        setError("Please upload a copy of your government-issued ID (driver's license, passport, or state ID)");
        return;
      }
      if (!utilityFile) {
        setError("Please upload a recent utility bill (proof of address)");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let idDocumentUrl: string | undefined;
      let utilityBillUrl: string | undefined;

      if (requiresIdAndUtility && idFile && utilityFile) {
        const toContentType = (f: File) =>
          f.type === 'application/pdf' ? 'application/pdf' as const
          : f.type === 'image/png' ? 'image/png' as const
          : f.type === 'image/jpeg' || f.type === 'image/jpg' ? 'image/jpeg' as const
          : 'image/jpeg' as const;
        const toFileData = (f: File) =>
          new Promise<number[]>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(Array.from(new Uint8Array(r.result as ArrayBuffer)));
            r.onerror = rej;
            r.readAsArrayBuffer(f);
          });
        const idKey = `onboarding-id/${Date.now()}-${idFile.name}`;
        const utilKey = `onboarding-utility/${Date.now()}-${utilityFile.name}`;
        const [idRes, utilRes] = await Promise.all([
          uploadToS3.mutateAsync({
            fileKey: idKey,
            fileData: await toFileData(idFile),
            contentType: toContentType(idFile),
          }),
          uploadToS3.mutateAsync({
            fileKey: utilKey,
            fileData: await toFileData(utilityFile),
            contentType: toContentType(utilityFile),
          }),
        ]);
        idDocumentUrl = idRes.url;
        utilityBillUrl = utilRes.url;
      }

      await onComplete({
        ...formData,
        ...consents,
        idDocumentUrl,
        utilityBillUrl,
        subscriptionTier: requiresIdAndUtility ? 'essential' : 'complete',
      });
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
            <Shield className="h-6 w-6 text-orange-500" />
            Complete Onboarding
          </DialogTitle>
          <DialogDescription>
            Confirm your information from your credit report. Update any fields that are missing or incorrect, then save. 
            <strong className="text-orange-600"> This will lock your identity to this account permanently to prevent abuse.</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Your data is secure:</strong> Once saved, your name, date of birth, and SSN last 4 will be permanently locked to this account. 
              This ensures one account = one person and prevents unauthorized sharing.
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

          <div className="space-y-2">
            <Label>Previous Address (optional)</Label>
            <Input 
              value={formData.previousAddress} 
              onChange={(e) => handleInputChange('previousAddress', e.target.value)} 
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Prev. City</Label>
              <Input 
                value={formData.previousCity} 
                onChange={(e) => handleInputChange('previousCity', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Prev. State</Label>
              <Input 
                value={formData.previousState} 
                onChange={(e) => handleInputChange('previousState', e.target.value)} 
                maxLength={2} 
              />
            </div>
            <div className="space-y-2">
              <Label>Prev. ZIP</Label>
              <Input 
                value={formData.previousZip} 
                onChange={(e) => handleInputChange('previousZip', e.target.value)} 
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

          {requiresIdAndUtility && (
            <div className="space-y-4 pt-4 border-t border-orange-100 bg-orange-50/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900">ID & Utility Bill (Required for Essential)</h3>
              <p className="text-sm text-gray-600">
                Essential plan requires a government-issued ID and a recent utility bill for verification. You can save your info now and add these documents later to complete onboarding.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Government-issued ID *</Label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={idFileRef}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => idFileRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {idFile ? idFile.name : 'Choose file'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Utility Bill (proof of address) *</Label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={utilityFileRef}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setUtilityFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => utilityFileRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {utilityFile ? utilityFile.name : 'Choose file'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

        <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {requiresIdAndUtility && (
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => handleSaveForLater()}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save for later'}
            </Button>
          )}
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save & Complete Onboarding
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
