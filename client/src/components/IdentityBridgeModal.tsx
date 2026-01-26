/**
 * Identity Bridge Modal Component (Blueprint §5)
 * 
 * Blocking modal before letter generation to collect:
 * - Full Legal Name * (pre-filled from credit report)
 * - Date of Birth * (pre-filled from credit report)
 * - Current Mailing Address * (pre-filled from credit report)
 * - Previous Address (if moved in last 2 years)
 * - Phone Number * (pre-filled if available)
 * - SSN (Last 4 Digits Only) * ← USER ENTERS
 * - Digital Signature * ← Signature checkbox
 * - 3 Legal Consent Checkboxes
 * 
 * High-trust, secure form. Data saved to userProfiles table.
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
  Upload, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  PenTool,
  ArrowRight
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IdentityBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: IdentityBridgeData) => Promise<void>;
  prefillData?: {
    fullName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    dateOfBirth?: string;
    phone?: string;
    previousAddress?: string;
    previousCity?: string;
    previousState?: string;
    previousZip?: string;
  };
}

export interface IdentityBridgeData {
  fullName: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  previousAddress?: string;
  previousCity?: string;
  previousState?: string;
  previousZip?: string;
  dateOfBirth: string; // YYYY-MM-DD
  phoneNumber: string;
  ssnLast4: string; // Last 4 digits only (Blueprint spec)
  ssnFull: string; // Keep for backward compatibility (will be padded with zeros)
  signatureCertified: boolean;
  consentAuthorize: boolean;
  consentNoGuarantee: boolean;
  consentTerms: boolean;
  exhibitAFile?: File; // ID photo (optional)
  exhibitBFile?: File; // Utility bill (optional)
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
    phoneNumber: '',
    ssnLast4: '',
  });

  const [signatureCertified, setSignatureCertified] = useState(false);
  const [consentAuthorize, setConsentAuthorize] = useState(false);
  const [consentNoGuarantee, setConsentNoGuarantee] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  const [exhibitAFile, setExhibitAFile] = useState<File | null>(null);
  const [exhibitBFile, setExhibitBFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form data when prefillData changes
  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        fullName: prefillData.fullName || prev.fullName,
        currentAddress: prefillData.address || prev.currentAddress,
        currentCity: prefillData.city || prev.currentCity,
        currentState: prefillData.state || prev.currentState,
        currentZip: prefillData.zip || prev.currentZip,
        dateOfBirth: prefillData.dateOfBirth || prev.dateOfBirth,
        phoneNumber: prefillData.phone || prev.phoneNumber,
        previousAddress: prefillData.previousAddress || prev.previousAddress,
        previousCity: prefillData.previousCity || prev.previousCity,
        previousState: prefillData.previousState || prev.previousState,
        previousZip: prefillData.previousZip || prev.previousZip,
      }));
    }
  }, [prefillData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileChange = (exhibit: 'A' | 'B', file: File | null) => {
    if (exhibit === 'A') setExhibitAFile(file);
    else setExhibitBFile(file);
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Full legal name is required";
    if (!formData.currentAddress.trim()) return "Current address is required";
    if (!formData.currentCity.trim()) return "City is required";
    if (!formData.currentState.trim()) return "State is required";
    if (!formData.currentZip.trim()) return "ZIP code is required";
    
    // DOB validation
    if (!formData.dateOfBirth) {
      return "Date of birth is required";
    }
    
    // Phone validation
    const phoneClean = formData.phoneNumber.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    
    // SSN Last 4 validation (Blueprint spec: last 4 only)
    const ssnClean = formData.ssnLast4.replace(/[^0-9]/g, '');
    if (ssnClean.length !== 4) {
      return "Please enter the last 4 digits of your SSN";
    }
    
    // Signature certification
    if (!signatureCertified) {
      return "Please certify your digital signature";
    }
    
    // Legal consent checkboxes (all 3 required)
    if (!consentAuthorize) {
      return "Please authorize DisputeStrike to send disputes on your behalf";
    }
    if (!consentNoGuarantee) {
      return "Please acknowledge that results are not guaranteed";
    }
    if (!consentTerms) {
      return "Please agree to the Terms of Service";
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // For backward compatibility, pad ssnLast4 with zeros for ssnFull
      const ssnFull = '00000' + formData.ssnLast4.replace(/[^0-9]/g, '');
      
      await onComplete({
        fullName: formData.fullName,
        currentAddress: formData.currentAddress,
        currentCity: formData.currentCity,
        currentState: formData.currentState,
        currentZip: formData.currentZip,
        previousAddress: formData.previousAddress || undefined,
        previousCity: formData.previousCity || undefined,
        previousState: formData.previousState || undefined,
        previousZip: formData.previousZip || undefined,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        ssnLast4: formData.ssnLast4,
        ssnFull: ssnFull,
        signatureCertified,
        consentAuthorize,
        consentNoGuarantee,
        consentTerms,
        exhibitAFile: exhibitAFile || undefined,
        exhibitBFile: exhibitBFile || undefined,
      });
      // Modal will be closed by parent after successful completion
    } catch (err: any) {
      setError(err.message || "Failed to save identity information. Please try again.");
      setIsSubmitting(false);
    }
  };

  const allConsentsChecked = signatureCertified && consentAuthorize && consentNoGuarantee && consentTerms;

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

        <div className="space-y-5 py-4">
          {/* Security Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Your data is secure:</strong> All information is encrypted and stored securely.
            </AlertDescription>
          </Alert>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Full Legal Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold">
              Full Legal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="John Doe"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled from credit report (edit if needed)
            </p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-semibold">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled from credit report (edit if needed)
            </p>
          </div>

          {/* Current Mailing Address */}
          <div className="space-y-2">
            <Label htmlFor="currentAddress" className="text-sm font-semibold">
              Current Mailing Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => handleInputChange('currentAddress', e.target.value)}
              placeholder="123 Main St, Apt 110"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled from credit report, user confirms (edit if needed)
            </p>
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentCity" className="text-sm font-semibold">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="currentCity"
                value={formData.currentCity}
                onChange={(e) => handleInputChange('currentCity', e.target.value)}
                placeholder="Washington"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentState" className="text-sm font-semibold">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="currentState"
                value={formData.currentState}
                onChange={(e) => handleInputChange('currentState', e.target.value)}
                placeholder="DC"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentZip" className="text-sm font-semibold">
                ZIP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="currentZip"
                value={formData.currentZip}
                onChange={(e) => handleInputChange('currentZip', e.target.value)}
                placeholder="20008"
              />
            </div>
          </div>

          {/* Previous Address (if moved in last 2 years) */}
          <div className="space-y-2">
            <Label htmlFor="previousAddress" className="text-sm font-semibold">
              Previous Address <span className="text-gray-400">(if moved in last 2 years)</span>
            </Label>
            <Input
              id="previousAddress"
              value={formData.previousAddress}
              onChange={(e) => handleInputChange('previousAddress', e.target.value)}
              placeholder="456 Oak Ave, Apt 200"
              className="text-base"
            />
          </div>

          {/* Previous City, State, ZIP */}
          {formData.previousAddress && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousCity" className="text-sm font-semibold">City</Label>
                <Input
                  id="previousCity"
                  value={formData.previousCity}
                  onChange={(e) => handleInputChange('previousCity', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousState" className="text-sm font-semibold">State</Label>
                <Input
                  id="previousState"
                  value={formData.previousState}
                  onChange={(e) => handleInputChange('previousState', e.target.value)}
                  placeholder="ST"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousZip" className="text-sm font-semibold">ZIP</Label>
                <Input
                  id="previousZip"
                  value={formData.previousZip}
                  onChange={(e) => handleInputChange('previousZip', e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-semibold">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="(555) 123-4567"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled if available (edit if needed)
            </p>
          </div>

          {/* SSN (Last 4 Digits Only) - Blueprint spec */}
          <div className="space-y-2">
            <Label htmlFor="ssnLast4" className="text-sm font-semibold">
              SSN (Last 4 Digits Only) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ssnLast4"
              type="text"
              value={formData.ssnLast4}
              onChange={(e) => handleInputChange('ssnLast4', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="____"
              maxLength={4}
              className="text-base font-mono text-center text-2xl tracking-widest w-32"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Encrypted & stored securely
            </p>
          </div>

          {/* Digital Signature */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Digital Signature <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border">
              <Checkbox
                id="signatureCertified"
                checked={signatureCertified}
                onCheckedChange={(checked) => setSignatureCertified(checked === true)}
              />
              <label htmlFor="signatureCertified" className="text-sm leading-tight cursor-pointer">
                I certify that <strong>{formData.fullName || '[Your Name]'}</strong> is my legal name and this serves as my digital signature for all dispute letters.
              </label>
            </div>
          </div>

          {/* Legal Consent (Required to continue) */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">
              LEGAL CONSENT (Required to continue)
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentAuthorize"
                  checked={consentAuthorize}
                  onCheckedChange={(checked) => setConsentAuthorize(checked === true)}
                />
                <label htmlFor="consentAuthorize" className="text-sm leading-tight cursor-pointer">
                  I authorize DisputeStrike to send disputes on my behalf
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentNoGuarantee"
                  checked={consentNoGuarantee}
                  onCheckedChange={(checked) => setConsentNoGuarantee(checked === true)}
                />
                <label htmlFor="consentNoGuarantee" className="text-sm leading-tight cursor-pointer">
                  I understand results are not guaranteed
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentTerms"
                  checked={consentTerms}
                  onCheckedChange={(checked) => setConsentTerms(checked === true)}
                />
                <label htmlFor="consentTerms" className="text-sm leading-tight cursor-pointer">
                  I agree to the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a>
                </label>
              </div>
            </div>
          </div>

          {/* Optional: Exhibit A & B (ID + Utility Bill) - Blueprint says optional */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold text-gray-600">
              Supporting Documents (Optional - Strengthens Your Dispute)
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Exhibit A: ID Photo */}
              <div className="space-y-2">
                <Label htmlFor="exhibitA" className="text-xs text-gray-500">
                  Exhibit A: Photo ID
                </Label>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition">
                  <input
                    id="exhibitA"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileChange('A', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="exhibitA" className="cursor-pointer flex flex-col items-center gap-1">
                    {exhibitAFile ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-xs font-medium text-green-700 truncate max-w-full">{exhibitAFile.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-gray-400" />
                        <p className="text-xs text-gray-500">Upload ID</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Exhibit B: Utility Bill */}
              <div className="space-y-2">
                <Label htmlFor="exhibitB" className="text-xs text-gray-500">
                  Exhibit B: Utility Bill
                </Label>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition">
                  <input
                    id="exhibitB"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileChange('B', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="exhibitB" className="cursor-pointer flex flex-col items-center gap-1">
                    {exhibitBFile ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-xs font-medium text-green-700 truncate max-w-full">{exhibitBFile.name}</p>
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 text-gray-400" />
                        <p className="text-xs text-gray-500">Upload Bill</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !allConsentsChecked}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate My Letters
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
