import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type BureauCode = "transunion" | "equifax" | "experian";

interface GenerateLettersInput {
  accountIds: number[];
  bureaus: BureauCode[];
}

export function useGenerateDisputeLetters() {
  const { data: userProfile } = trpc.profile.get.useQuery();
  const generateLettersMutation = trpc.disputeLetters.generate.useMutation();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLetters = async ({ accountIds, bureaus }: GenerateLettersInput) => {
    if (!accountIds.length) {
      toast.error("Please select at least one item to dispute.");
      return false;
    }

    const currentAddress = userProfile?.currentAddress;
    if (!currentAddress) {
      toast.error("Please complete your profile with a current mailing address.");
      return false;
    }

    setIsGenerating(true);
    try {
      await generateLettersMutation.mutateAsync({
        accountIds,
        bureaus,
        currentAddress,
        previousAddress: userProfile?.previousAddress || undefined,
      });
      toast.success("Letters generated successfully!");
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to generate letters");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateLetters, isGenerating };
}
