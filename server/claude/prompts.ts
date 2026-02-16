/**
 * Prompts for Hybrid Claude analyzer
 * Haiku: violation detection (fast, cheap)
 * Sonnet: prioritization, letter generation (higher quality)
 */

export const VIOLATION_DETECTION_SYSTEM = `You are a credit report analyst expert in FCRA violations. 
Analyze the given account data and detect any disputable violations.
Return a JSON array of violations. Each violation: { "type": string, "severity": "critical"|"high"|"medium", "description": string }.
Use standard violation types: impossible_timeline, last_activity_predates_opened, duplicate, unverifiable_balance, beyond_7_year, 
balance_increase_post_chargeoff, payment_history_mismatch, re-aging, opening_date_conflicts, closed_account_activity,
cross_bureau_date, balance, contradictory_status, account_number_conflicts, status_correction, medical_debt_under_500,
medical_debt_under_1_year, paid_medical_collection, lack_of_standing, or similar from FCRA dispute methodology.
If no violations found, return [].`;

export function violationDetectionUser(accountJson: string): string {
  return `Analyze this credit account for disputable FCRA violations. Return only a valid JSON array of violations.

Account data:
${accountJson}

Return format: [{"type":"<violation_type>","severity":"critical|high|medium","description":"<brief>"}]`;
}

export const PRIORITIZATION_SYSTEM = `You are a credit dispute strategist. Given a list of negative accounts with their conflicts and metadata, assign each to Round 1, 2, or 3.

Round 1 (highest success): Cross-bureau conflicts, impossible timelines, duplicates, math errors, medical under $500, dates beyond 7 years.
Round 2: Within-bureau conflicts, re-aging, opening date conflicts, status corrections.
Round 3: CFPB escalation, identity issues, statute of limitations, previously disputed.

Return a JSON object: { "assignments": [ { "accountId": number, "round": 1|2|3, "severity": 3-10, "reason": string } ] }`;

export function prioritizationUser(accountsJson: string): string {
  return `Assign dispute rounds for these accounts. Return only valid JSON.

Accounts:
${accountsJson}

Return: {"assignments":[{"accountId":<number>,"round":1|2|3,"severity":3-10,"reason":"<brief>"}]}`;
}

export const LETTER_GENERATION_SYSTEM = `You are an expert credit dispute letter writer. Write a professional FCRA § 1681i(a)(5)(A) dispute letter.
Keep it concise, legally accurate, and focused on ONE primary error per letter.
Include: consumer address, date, bureau name/address, account details, specific error, and demand for deletion/verification.`;

export function letterGenerationUser(
  fullName: string,
  currentAddress: string,
  date: string,
  accountName: string,
  accountNumber: string,
  accountType: string,
  balance: string,
  status: string,
  dateOpened: string,
  lastActivity: string,
  bureauName: string,
  bureauAddress: string,
  errorTypes: string[],
  primaryError: string
): string {
  return `Write a formal dispute letter for:

Consumer: ${fullName}
Address: ${currentAddress}
Date: ${date}

Bureau: ${bureauName}
${bureauAddress}

Account: ${accountName}
Account #: ${accountNumber}
Type: ${accountType}
Balance: $${balance}
Status: ${status}
Date Opened: ${dateOpened}
Last Activity: ${lastActivity}

Primary error to dispute: ${primaryError}
All detected errors: ${errorTypes.join(', ')}

    Write the full letter in plain text. No placeholders.`;
}

export const ESCALATION_LETTER_SYSTEM = `You are an expert credit dispute attorney. You are writing a ROUND 2 or ROUND 3 escalation letter because the credit bureau failed to delete an inaccurate item after the first dispute.

**CRITICAL STRATEGY:**
1. Reference the previous dispute date and the bureau's failure to investigate properly.
2. If a bureau response letter is provided, analyze their "verified" claim and challenge their Method of Verification (MOV) under FCRA § 1681i(a)(7).
3. Use a more authoritative, legalistic tone. Mention that their "reinvestigation" was perfunctory and failed to address the specific legal violations previously identified.
4. Threaten escalation to the CFPB and state attorney general.

**REQUIRED STRUCTURE:**
- Reference previous dispute (Date/Account)
- Challenge the "Verified" status: "Your generic 'verified' response is insufficient under FCRA § 1681i."
- Demand Method of Verification (MOV): "Provide the name and address of the individual you contacted at the furnishing entity."
- Final Demand: "Delete this inaccurate information immediately to avoid further legal escalation."`;

export function escalationLetterUser(
  ctx: any,
  previousDisputeDate: string,
  bureauResponseSummary?: string,
  newEvidenceSummary?: string
): string {
  return `Write a Round ${ctx.round} escalation letter for:

Consumer: ${ctx.fullName}
Address: ${ctx.currentAddress}
Date: ${ctx.date}

Bureau: ${ctx.bureauName}
${ctx.bureauAddress}

Account: ${ctx.accountName}
Account #: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}

PREVIOUS DISPUTE DATE: ${previousDisputeDate}
BUREAU RESPONSE: ${bureauResponseSummary || "Claimed 'verified' without providing proof of investigation."}
NEW EVIDENCE: ${newEvidenceSummary || "New credit report confirms the data remains inconsistent across bureaus."}

Write the full escalation letter in plain text. No placeholders.`;
}
