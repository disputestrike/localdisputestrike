/**
 * Additional Letter Generators
 * Cease & Desist, Pay for Delete, Intent to Sue, and Estoppel Letters
 */

// ============================================================================
// CEASE & DESIST LETTER
// ============================================================================

export const CEASE_DESIST_SYSTEM_PROMPT = `You are an expert consumer rights attorney specializing in debt collection law and the Fair Debt Collection Practices Act (FDCPA). Generate professional cease and desist letters that are legally sound and effective at stopping unwanted contact from debt collectors.

Key legal citations to include:
- FDCPA § 1692c(c) - Right to cease communication
- FDCPA § 1692d - Prohibition of harassment
- FDCPA § 1692e - False or misleading representations
- FDCPA § 1692f - Unfair practices

The letter should be firm but professional, clearly invoking the consumer's legal rights.`;

export function buildCeaseDesistPrompt(
  consumerName: string,
  consumerAddress: string,
  collectorName: string,
  collectorAddress: string,
  accountInfo: {
    accountNumber?: string;
    originalCreditor?: string;
    allegedBalance?: string;
  },
  reasons: string[]
): string {
  return `Generate a formal Cease and Desist letter with the following details:

CONSUMER INFORMATION:
Name: ${consumerName}
Address: ${consumerAddress}

DEBT COLLECTOR INFORMATION:
Company: ${collectorName}
Address: ${collectorAddress}

ACCOUNT INFORMATION:
Account Number: ${accountInfo.accountNumber || 'Unknown'}
Original Creditor: ${accountInfo.originalCreditor || 'Unknown'}
Alleged Balance: ${accountInfo.allegedBalance || 'Disputed'}

REASONS FOR CEASE AND DESIST:
${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Generate a professional cease and desist letter that:
1. Clearly identifies the account in question
2. Invokes FDCPA § 1692c(c) right to cease communication
3. Demands all contact cease immediately
4. Warns of legal action for continued violations
5. Preserves all rights under FDCPA
6. Is formatted for certified mail with return receipt requested

Include proper legal citations and make the letter firm but professional.`;
}

// ============================================================================
// PAY FOR DELETE LETTER
// ============================================================================

export const PAY_FOR_DELETE_SYSTEM_PROMPT = `You are an expert credit repair specialist and negotiator. Generate professional pay-for-delete negotiation letters that propose a settlement arrangement in exchange for complete removal of the negative item from all credit reports.

Key points to include:
- This is a settlement offer, not an admission of debt
- Payment contingent on written agreement to delete
- Request deletion from all three bureaus
- Specify payment method and timeline
- Request written confirmation before payment

The letter should be professional and persuasive while protecting the consumer's interests.`;

export function buildPayForDeletePrompt(
  consumerName: string,
  consumerAddress: string,
  creditorName: string,
  creditorAddress: string,
  accountInfo: {
    accountNumber?: string;
    originalBalance?: string;
    currentBalance?: string;
    accountType?: string;
  },
  offerAmount: string,
  offerPercentage: number
): string {
  return `Generate a professional Pay-for-Delete negotiation letter with the following details:

CONSUMER INFORMATION:
Name: ${consumerName}
Address: ${consumerAddress}

CREDITOR/COLLECTOR INFORMATION:
Company: ${creditorName}
Address: ${creditorAddress}

ACCOUNT INFORMATION:
Account Number: ${accountInfo.accountNumber || 'On File'}
Original Balance: ${accountInfo.originalBalance || 'Unknown'}
Current Balance: ${accountInfo.currentBalance || 'Unknown'}
Account Type: ${accountInfo.accountType || 'Collection'}

SETTLEMENT OFFER:
Proposed Amount: ${offerAmount}
Percentage of Balance: ${offerPercentage}%

Generate a professional pay-for-delete letter that:
1. Proposes a one-time settlement payment
2. Conditions payment on written agreement to delete from ALL credit bureaus
3. Requests deletion within 30 days of payment
4. Specifies this is a settlement offer, not admission of debt validity
5. Requests written confirmation of agreement before payment
6. Sets a response deadline (typically 30 days)
7. Preserves all consumer rights

Make the letter persuasive by emphasizing the mutual benefit - they get guaranteed payment, consumer gets clean credit.`;
}

// ============================================================================
// INTENT TO SUE LETTER
// ============================================================================

export const INTENT_TO_SUE_SYSTEM_PROMPT = `You are an expert consumer rights attorney preparing pre-litigation demand letters. Generate professional Intent to Sue letters that clearly communicate the consumer's intention to pursue legal action for violations of consumer protection laws.

Key legal frameworks:
- Fair Credit Reporting Act (FCRA) - § 1681n (willful violations), § 1681o (negligent violations)
- Fair Debt Collection Practices Act (FDCPA) - § 1692k (civil liability)
- State consumer protection laws

Damages available:
- FCRA: Actual damages, statutory damages up to $1,000, punitive damages, attorney's fees
- FDCPA: Actual damages, statutory damages up to $1,000, attorney's fees

The letter should be firm, cite specific violations, and give a clear deadline to resolve before litigation.`;

export function buildIntentToSuePrompt(
  consumerName: string,
  consumerAddress: string,
  defendantName: string,
  defendantAddress: string,
  violations: {
    statute: string;
    section: string;
    description: string;
  }[],
  demandAmount: string,
  responseDeadline: number // days
): string {
  return `Generate a formal Intent to Sue / Pre-Litigation Demand letter with the following details:

CONSUMER/PLAINTIFF INFORMATION:
Name: ${consumerName}
Address: ${consumerAddress}

DEFENDANT INFORMATION:
Company: ${defendantName}
Address: ${defendantAddress}

DOCUMENTED VIOLATIONS:
${violations.map((v, i) => `
${i + 1}. ${v.statute} ${v.section}
   Violation: ${v.description}
`).join('')}

DEMAND:
Settlement Amount: ${demandAmount}
Response Deadline: ${responseDeadline} days from receipt

Generate a professional pre-litigation demand letter that:
1. Clearly identifies all documented violations with specific legal citations
2. Explains the damages available under each statute
3. States the consumer's firm intention to file suit if not resolved
4. Demands specific relief (deletion, correction, monetary damages)
5. Sets a clear deadline for response
6. Warns that litigation will increase costs for defendant
7. Offers opportunity to resolve without court involvement
8. Is formatted for certified mail with return receipt requested

Make the letter authoritative and demonstrate knowledge of the law while remaining professional.`;
}

// ============================================================================
// ESTOPPEL LETTER
// ============================================================================

export const ESTOPPEL_SYSTEM_PROMPT = `You are an expert consumer rights attorney specializing in credit reporting disputes. Generate professional Estoppel by Silence letters that leverage the credit bureau's failure to respond within the legally mandated timeframe.

Key legal basis:
- FCRA § 1681i(a)(1) - 30-day investigation requirement
- FCRA § 1681i(a)(5)(A) - Deletion requirement for unverified information
- Doctrine of Estoppel by Silence - Failure to respond = admission

The letter should firmly demand deletion based on the bureau's procedural failure.`;

export function buildEstoppelPrompt(
  consumerName: string,
  consumerAddress: string,
  bureauName: string,
  bureauAddress: string,
  originalDisputeDate: string,
  daysSinceDispute: number,
  disputedItems: string[]
): string {
  return `Generate a formal Estoppel by Silence letter with the following details:

CONSUMER INFORMATION:
Name: ${consumerName}
Address: ${consumerAddress}

CREDIT BUREAU INFORMATION:
Bureau: ${bureauName}
Address: ${bureauAddress}

DISPUTE TIMELINE:
Original Dispute Date: ${originalDisputeDate}
Days Since Dispute: ${daysSinceDispute}
Days Overdue: ${daysSinceDispute - 30}

DISPUTED ITEMS:
${disputedItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Generate a professional Estoppel by Silence letter that:
1. References the original dispute and date sent
2. Notes the FCRA 30-day investigation requirement
3. Calculates and states how many days overdue the response is
4. Invokes the doctrine of Estoppel by Silence
5. Demands immediate deletion of all disputed items
6. Cites FCRA § 1681i(a)(5)(A) requiring deletion of unverified information
7. Warns of FCRA § 1681n damages for willful non-compliance
8. Sets a 15-day deadline for deletion confirmation
9. States intent to file CFPB complaint and/or lawsuit if not resolved

Make the letter authoritative and emphasize that the bureau's silence constitutes admission that the information cannot be verified.`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getLetterTypeInfo(letterType: string): {
  name: string;
  description: string;
  systemPrompt: string;
} {
  switch (letterType) {
    case 'cease_desist':
      return {
        name: 'Cease & Desist',
        description: 'Stop debt collector contact under FDCPA',
        systemPrompt: CEASE_DESIST_SYSTEM_PROMPT,
      };
    case 'pay_for_delete':
      return {
        name: 'Pay for Delete',
        description: 'Settlement offer in exchange for credit report deletion',
        systemPrompt: PAY_FOR_DELETE_SYSTEM_PROMPT,
      };
    case 'intent_to_sue':
      return {
        name: 'Intent to Sue',
        description: 'Pre-litigation demand letter',
        systemPrompt: INTENT_TO_SUE_SYSTEM_PROMPT,
      };
    case 'estoppel':
      return {
        name: 'Estoppel by Silence',
        description: 'Demand deletion for missed investigation deadline',
        systemPrompt: ESTOPPEL_SYSTEM_PROMPT,
      };
    default:
      throw new Error(`Unknown letter type: ${letterType}`);
  }
}
