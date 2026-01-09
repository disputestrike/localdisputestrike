import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  X,
  Loader2,
  FileText,
  Ban,
  DollarSign,
  Gavel,
  Clock,
} from "lucide-react";

type LetterType = 'cease_desist' | 'pay_for_delete' | 'intent_to_sue' | 'estoppel';

interface LetterGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterType: LetterType;
  account?: {
    id: number;
    accountName: string;
    accountNumber?: string;
    balance?: string;
    originalCreditor?: string;
  };
}

const letterTypeInfo: Record<LetterType, {
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
}> = {
  cease_desist: {
    title: "Cease & Desist Letter",
    description: "Stop debt collector contact under FDCPA § 1692c(c)",
    icon: Ban,
    color: "red",
  },
  pay_for_delete: {
    title: "Pay for Delete Letter",
    description: "Settlement offer in exchange for credit report deletion",
    icon: DollarSign,
    color: "green",
  },
  intent_to_sue: {
    title: "Intent to Sue Letter",
    description: "Pre-litigation demand letter citing specific violations",
    icon: Gavel,
    color: "orange",
  },
  estoppel: {
    title: "Estoppel by Silence Letter",
    description: "Demand deletion for missed 30-day investigation deadline",
    icon: Clock,
    color: "purple",
  },
};

export default function LetterGeneratorModal({
  isOpen,
  onClose,
  letterType,
  account,
}: LetterGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  
  // Cease & Desist fields
  const [collectorName, setCollectorName] = useState(account?.accountName || "");
  const [collectorAddress, setCollectorAddress] = useState("");
  const [reasons, setReasons] = useState<string[]>([
    "Repeated phone calls at inconvenient times",
    "Failure to validate the debt upon request",
  ]);
  
  // Pay for Delete fields
  const [offerAmount, setOfferAmount] = useState("");
  const [offerPercentage, setOfferPercentage] = useState(30);
  
  // Intent to Sue fields
  const [violations, setViolations] = useState([
    { statute: "FCRA", section: "§ 1681e(b)", description: "Failure to ensure maximum possible accuracy" },
  ]);
  const [demandAmount, setDemandAmount] = useState("$1,000");
  
  // Estoppel fields
  const [originalDisputeDate, setOriginalDisputeDate] = useState("");
  const [daysSinceDispute, setDaysSinceDispute] = useState(45);
  const [bureau, setBureau] = useState<'transunion' | 'equifax' | 'experian'>('transunion');
  const [disputedItems, setDisputedItems] = useState<string[]>([
    account?.accountName || "Account in dispute",
  ]);

  const ceaseDesistMutation = trpc.disputeLetters.generateCeaseDesist.useMutation({
    onSuccess: (data) => {
      toast.success("Cease & Desist letter generated!");
      onClose();
      window.open(`/letter/${data.letterId}`, '_blank');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate letter");
    },
  });

  const payForDeleteMutation = trpc.disputeLetters.generatePayForDelete.useMutation({
    onSuccess: (data) => {
      toast.success("Pay for Delete letter generated!");
      onClose();
      window.open(`/letter/${data.letterId}`, '_blank');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate letter");
    },
  });

  const intentToSueMutation = trpc.disputeLetters.generateIntentToSue.useMutation({
    onSuccess: (data) => {
      toast.success("Intent to Sue letter generated!");
      onClose();
      window.open(`/letter/${data.letterId}`, '_blank');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate letter");
    },
  });

  const estoppelMutation = trpc.disputeLetters.generateEstoppel.useMutation({
    onSuccess: (data) => {
      toast.success("Estoppel letter generated!");
      onClose();
      window.open(`/letter/${data.letterId}`, '_blank');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate letter");
    },
  });

  const handleGenerate = async () => {
    if (!userAddress) {
      toast.error("Please enter your address");
      return;
    }

    setIsGenerating(true);

    try {
      switch (letterType) {
        case 'cease_desist':
          await ceaseDesistMutation.mutateAsync({
            collectorName,
            collectorAddress,
            accountNumber: account?.accountNumber,
            originalCreditor: account?.originalCreditor,
            allegedBalance: account?.balance,
            reasons,
            userAddress,
          });
          break;

        case 'pay_for_delete':
          await payForDeleteMutation.mutateAsync({
            creditorName: collectorName,
            creditorAddress: collectorAddress,
            accountNumber: account?.accountNumber,
            currentBalance: account?.balance,
            offerAmount,
            offerPercentage,
            userAddress,
          });
          break;

        case 'intent_to_sue':
          await intentToSueMutation.mutateAsync({
            defendantName: collectorName,
            defendantAddress: collectorAddress,
            violations,
            demandAmount,
            responseDeadline: 30,
            userAddress,
          });
          break;

        case 'estoppel':
          await estoppelMutation.mutateAsync({
            bureau,
            originalDisputeDate,
            daysSinceDispute,
            disputedItems,
            userAddress,
          });
          break;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const info = letterTypeInfo[letterType];
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${info.color}-500/10 rounded-lg`}>
              <Icon className={`h-6 w-6 text-${info.color}-400`} />
            </div>
            <div>
              <CardTitle className="text-gray-900">{info.title}</CardTitle>
              <CardDescription className="text-gray-500">{info.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common: User Address */}
          <div>
            <Label className="text-gray-700">Your Current Address</Label>
            <Textarea
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="123 Main St&#10;City, State ZIP"
              className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
              rows={3}
            />
          </div>

          {/* Cease & Desist Fields */}
          {letterType === 'cease_desist' && (
            <>
              <div>
                <Label className="text-gray-700">Debt Collector Name</Label>
                <Input
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  placeholder="Collection Agency Name"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-700">Collector Address</Label>
                <Textarea
                  value={collectorAddress}
                  onChange={(e) => setCollectorAddress(e.target.value)}
                  placeholder="123 Collector St&#10;City, State ZIP"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-gray-700">Reasons for Cease & Desist</Label>
                <div className="space-y-2 mt-1">
                  {reasons.map((reason, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={reason}
                        onChange={(e) => {
                          const newReasons = [...reasons];
                          newReasons[i] = e.target.value;
                          setReasons(newReasons);
                        }}
                        className="bg-gray-100 border-gray-300 text-gray-900"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReasons(reasons.filter((_, idx) => idx !== i))}
                        className="text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReasons([...reasons, ""])}
                    className="border-gray-300 text-gray-700"
                  >
                    + Add Reason
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Pay for Delete Fields */}
          {letterType === 'pay_for_delete' && (
            <>
              <div>
                <Label className="text-gray-700">Creditor/Collector Name</Label>
                <Input
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  placeholder="Creditor or Collection Agency"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-700">Creditor Address</Label>
                <Textarea
                  value={collectorAddress}
                  onChange={(e) => setCollectorAddress(e.target.value)}
                  placeholder="123 Creditor St&#10;City, State ZIP"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Settlement Offer Amount</Label>
                  <Input
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="$500"
                    className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">% of Balance</Label>
                  <Input
                    type="number"
                    value={offerPercentage}
                    onChange={(e) => setOfferPercentage(Number(e.target.value))}
                    placeholder="30"
                    className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Intent to Sue Fields */}
          {letterType === 'intent_to_sue' && (
            <>
              <div>
                <Label className="text-gray-700">Defendant Name</Label>
                <Input
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  placeholder="Company/Bureau Name"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-700">Defendant Address</Label>
                <Textarea
                  value={collectorAddress}
                  onChange={(e) => setCollectorAddress(e.target.value)}
                  placeholder="123 Defendant St&#10;City, State ZIP"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-gray-700">Demand Amount</Label>
                <Input
                  value={demandAmount}
                  onChange={(e) => setDemandAmount(e.target.value)}
                  placeholder="$1,000"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                />
              </div>
            </>
          )}

          {/* Estoppel Fields */}
          {letterType === 'estoppel' && (
            <>
              <div>
                <Label className="text-gray-700">Credit Bureau</Label>
                <select
                  value={bureau}
                  onChange={(e) => setBureau(e.target.value as any)}
                  className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-md px-3 py-2 mt-1"
                >
                  <option value="transunion">TransUnion</option>
                  <option value="equifax">Equifax</option>
                  <option value="experian">Experian</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-700">Original Dispute Date</Label>
                <Input
                  type="date"
                  value={originalDisputeDate}
                  onChange={(e) => setOriginalDisputeDate(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-700">Days Since Dispute</Label>
                <Input
                  type="number"
                  value={daysSinceDispute}
                  onChange={(e) => setDaysSinceDispute(Number(e.target.value))}
                  placeholder="45"
                  className="bg-gray-100 border-gray-300 text-gray-900 mt-1"
                />
              </div>
            </>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-orange-500 hover:bg-orange-600 text-gray-900 mt-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Letter
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
