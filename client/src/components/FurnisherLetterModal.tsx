import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface FurnisherLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: number;
    accountName: string;
    accountNumber?: string | null;
    accountType?: string | null;
    balance?: string | null;
    status?: string | null;
    originalCreditor?: string | null;
  };
  onSuccess: () => void;
}

// Known furnisher addresses
const KNOWN_FURNISHERS: Record<string, { name: string; address: string }> = {
  chase: { name: "JPMorgan Chase Bank, N.A.", address: "P.O. Box 15299, Wilmington, DE 19850-5299" },
  "bank of america": { name: "Bank of America, N.A.", address: "P.O. Box 982238, El Paso, TX 79998-2238" },
  "wells fargo": { name: "Wells Fargo Bank, N.A.", address: "P.O. Box 14517, Des Moines, IA 50306-3517" },
  "capital one": { name: "Capital One", address: "P.O. Box 30281, Salt Lake City, UT 84130-0281" },
  citibank: { name: "Citibank, N.A.", address: "P.O. Box 6500, Sioux Falls, SD 57117-6500" },
  discover: { name: "Discover Financial Services", address: "P.O. Box 30943, Salt Lake City, UT 84130-0943" },
  "american express": { name: "American Express", address: "P.O. Box 981535, El Paso, TX 79998-1535" },
  synchrony: { name: "Synchrony Bank", address: "P.O. Box 965012, Orlando, FL 32896-5012" },
  midland: { name: "Midland Credit Management, Inc.", address: "350 Camino de la Reina, Suite 100, San Diego, CA 92108" },
  portfolio: { name: "Portfolio Recovery Associates, LLC", address: "120 Corporate Boulevard, Norfolk, VA 23502" },
  lvnv: { name: "LVNV Funding LLC", address: "P.O. Box 25028, Greenville, SC 29616" },
  cavalry: { name: "Cavalry SPV I, LLC", address: "500 Summit Lake Drive, Suite 400, Valhalla, NY 10595" },
  navient: { name: "Navient Solutions, LLC", address: "P.O. Box 9635, Wilkes-Barre, PA 18773-9635" },
  nelnet: { name: "Nelnet, Inc.", address: "P.O. Box 82561, Lincoln, NE 68501-2561" },
  ally: { name: "Ally Financial Inc.", address: "P.O. Box 380901, Bloomington, MN 55438-0901" },
  toyota: { name: "Toyota Financial Services", address: "P.O. Box 105386, Atlanta, GA 30348-5386" },
};

export function FurnisherLetterModal({ isOpen, onClose, account, onSuccess }: FurnisherLetterModalProps) {
  const [currentAddress, setCurrentAddress] = useState("");
  const [furnisherName, setFurnisherName] = useState("");
  const [furnisherAddress, setFurnisherAddress] = useState("");
  const [customReasons, setCustomReasons] = useState("");
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  const generateFurnisherLetter = trpc.disputeLetters.generateFurnisherLetter.useMutation({
    onSuccess: (data) => {
      toast.success(`Furnisher letter generated for ${data.furnisherName}`);
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to generate letter: ${error.message}`);
    },
  });

  // Try to auto-detect furnisher from account name
  const tryAutoDetect = () => {
    const creditorName = (account.originalCreditor || account.accountName).toLowerCase();
    
    for (const [key, value] of Object.entries(KNOWN_FURNISHERS)) {
      if (creditorName.includes(key)) {
        setFurnisherName(value.name);
        setFurnisherAddress(value.address);
        setIsAutoDetected(true);
        return true;
      }
    }
    return false;
  };

  // Auto-detect on open
  useState(() => {
    if (isOpen) {
      tryAutoDetect();
    }
  });

  const handleSubmit = () => {
    if (!currentAddress.trim()) {
      toast.error("Please enter your current address");
      return;
    }

    generateFurnisherLetter.mutate({
      accountId: account.id,
      currentAddress: currentAddress.trim(),
      furnisherName: furnisherName.trim() || undefined,
      furnisherAddress: furnisherAddress.trim() || undefined,
      customReasons: customReasons.trim() ? customReasons.split("\n").filter(r => r.trim()) : undefined,
    });
  };

  const isCollection = (account.accountType?.toLowerCase().includes("collection") || 
                       account.status?.toLowerCase().includes("collection"));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-500" />
            Generate Furnisher Dispute Letter
          </DialogTitle>
          <DialogDescription>
            Send a dispute letter directly to the creditor or collection agency. This invokes 
            FCRA § 1681s-2(b) - the furnisher's duty to investigate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Account Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{account.accountName}</span>
              {isCollection && (
                <Badge variant="destructive">Collection Account</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              {account.accountNumber && (
                <div>Account #: {account.accountNumber}</div>
              )}
              {account.balance && (
                <div>Balance: ${account.balance}</div>
              )}
              {account.status && (
                <div>Status: {account.status}</div>
              )}
              {account.originalCreditor && (
                <div>Original Creditor: {account.originalCreditor}</div>
              )}
            </div>
          </div>

          {/* Your Address */}
          <div className="space-y-2">
            <Label htmlFor="currentAddress">Your Current Address *</Label>
            <Textarea
              id="currentAddress"
              placeholder="123 Main Street&#10;City, State 12345"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
              rows={3}
            />
          </div>

          {/* Furnisher Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Furnisher Information</Label>
              {isAutoDetected && (
                <Badge variant="outline" className="text-green-600 border-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Auto-detected
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Input
                  placeholder="Furnisher Name (e.g., Midland Credit Management)"
                  value={furnisherName}
                  onChange={(e) => {
                    setFurnisherName(e.target.value);
                    setIsAutoDetected(false);
                  }}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Furnisher Address (leave blank to auto-lookup)"
                  value={furnisherAddress}
                  onChange={(e) => {
                    setFurnisherAddress(e.target.value);
                    setIsAutoDetected(false);
                  }}
                  rows={2}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Leave blank to use our database of 20+ known creditor addresses
            </p>
          </div>

          {/* Custom Reasons */}
          <div className="space-y-2">
            <Label htmlFor="customReasons">Custom Dispute Reasons (Optional)</Label>
            <Textarea
              id="customReasons"
              placeholder="Enter custom reasons, one per line (optional)&#10;Example: I dispute the reported balance of $1,500&#10;Example: This account was paid in full on 01/15/2024"
              value={customReasons}
              onChange={(e) => setCustomReasons(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Leave blank to use standard FCRA dispute reasons
            </p>
          </div>

          {/* Info Alert */}
          {isCollection && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-800">
                <strong>Collection Account Detected:</strong> Your letter will include FDCPA debt 
                validation demands and request for chain of assignment documentation.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={generateFurnisherLetter.isPending}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {generateFurnisherLetter.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Letter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
