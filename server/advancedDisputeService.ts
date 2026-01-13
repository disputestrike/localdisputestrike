/**
 * Advanced Dispute Service
 * 
 * Handles CFPB complaints and Furnisher disputes for the Complete tier.
 */

import { db } from "@/_core/db";
import { negativeAccounts, disputeLetters, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export const advancedDisputeService = {
  /**
   * Generate a CFPB complaint for a verified item
   */
  async generateCFPBComplaint(userId: number, accountId: number) {
    const account = await db.query.negativeAccounts.findFirst({
      where: and(
        eq(negativeAccounts.id, accountId),
        eq(negativeAccounts.userId, userId)
      )
    });

    if (!account) throw new Error("Account not found");

    const complaint = {
      subject: `Formal Complaint against ${account.accountName}`,
      issue: "Incorrect information on credit report",
      subIssue: "Information belongs to someone else or is inaccurate",
      description: `I am filing a formal complaint against ${account.accountName} regarding account #${account.accountNumber}. I have previously disputed this item with the credit bureaus, but it remains on my report despite being inaccurate. This is a violation of the Fair Credit Reporting Act (FCRA).`,
      desiredResolution: "Correction or removal of the inaccurate information from all credit reports.",
      bureau: account.bureau
    };

    return complaint;
  },

  /**
   * Generate a Furnisher dispute letter (Direct to Creditor)
   */
  async generateFurnisherLetter(userId: number, accountId: number) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const account = await db.query.negativeAccounts.findFirst({
      where: and(
        eq(negativeAccounts.id, accountId),
        eq(negativeAccounts.userId, userId)
      )
    });

    if (!user || !account) throw new Error("User or Account not found");

    const letterContent = `
${user.fullName}
${user.address}
${user.city}, ${user.state} ${user.zipCode}

Date: ${new Date().toLocaleDateString()}

To: ${account.accountName} - Dispute Department
Regarding Account #: ${account.accountNumber}

NOTICE OF DISPUTE UNDER FCRA SECTION 623(a)(8)

I am writing to formally dispute the accuracy of the information you are reporting to the credit bureaus regarding the above-referenced account.

The following information is inaccurate:
- Account Status: ${account.status}
- Balance: $${account.balance}

I request that you conduct an investigation into this matter and provide me with documentation verifying the accuracy of this reporting. If you cannot verify this information, you are required by law to notify the credit bureaus to delete this item from my credit file.

Sincerely,

${user.fullName}
    `;

    return letterContent;
  }
};
