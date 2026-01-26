
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
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl shadow-2xl">
        <div className="bg-[#002b5c] p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-300" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                Identity Bridge
              </DialogTitle>
            </div>
            <DialogDescription className="text-blue-100 font-medium text-sm opacity-80">
              Final verification required to generate your legal dispute documents.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Lock className="h-5 w-5 text-blue-600" />
            <p className="text-[11px] text-blue-800 font-black uppercase tracking-wider">
              Bank-Level Security: 256-Bit Encryption Active
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-2xl border-red-100 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-bold uppercase tracking-tight">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Legal Name</Label>
              <Input 
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
                value={formData.fullName} 
                onChange={(e) => handleInputChange('fullName', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date of Birth</Label>
              <Input 
                type="date" 
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
                value={formData.dateOfBirth} 
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Mailing Address</Label>
            <Input 
              className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
              value={formData.currentAddress} 
              onChange={(e) => handleInputChange('currentAddress', e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">City</Label>
              <Input 
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
                value={formData.currentCity} 
                onChange={(e) => handleInputChange('currentCity', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">State</Label>
              <Input 
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
                value={formData.currentState} 
                onChange={(e) => handleInputChange('currentState', e.target.value)} 
                maxLength={2} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">ZIP</Label>
              <Input 
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
                value={formData.currentZip} 
                onChange={(e) => handleInputChange('currentZip', e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</Label>
              <Input 
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 font-bold"
                value={formData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-orange-600">SSN (Last 4 Digits Only) *</Label>
              <Input 
                value={formData.ssnLast4} 
                onChange={(e) => handleInputChange('ssnLast4', e.target.value.replace(/\D/g, '').slice(0, 4))} 
                placeholder="xxxx"
                className="rounded-xl border-orange-100 bg-orange-50/30 focus:bg-white transition-all h-12 font-mono text-lg tracking-widest font-black"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 group cursor-pointer transition-all hover:bg-white hover:shadow-md">
              <Checkbox 
                id="sig" 
                className="mt-1 rounded-md border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                checked={consents.signature} 
                onCheckedChange={(v) => setConsents(prev => ({ ...prev, signature: !!v }))} 
              />
              <label htmlFor="sig" className="text-[11px] font-bold leading-relaxed text-gray-600 cursor-pointer uppercase tracking-tight">
                I certify that <span className="text-gray-900 font-black">{formData.fullName || '[Your Name]'}</span> is my legal name and this serves as my digital signature for all dispute letters.
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 px-2">
              {[
                { id: 'c1', label: 'I authorize DisputeStrike to send disputes on my behalf', key: 'authorize' },
                { id: 'c2', label: 'I understand results are not guaranteed', key: 'noGuarantee' },
                { id: 'c3', label: 'I agree to the Terms of Service', key: 'terms' }
              ].map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <Checkbox 
                    id={c.id} 
                    className="rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    checked={(consents as any)[c.key]} 
                    onCheckedChange={(v) => setConsents(prev => ({ ...prev, [c.key]: !!v }))} 
                  />
                  <label htmlFor={c.id} className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                    {c.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">
            Cancel
          </Button>
          <Button 
            className="bg-[#ff6b00] hover:bg-[#e66000] text-white font-black px-8 py-6 rounded-xl shadow-xl shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98] text-[11px] uppercase tracking-widest"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Generate My Letters"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
