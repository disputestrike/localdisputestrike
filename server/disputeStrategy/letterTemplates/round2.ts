/**
 * Round 2 Letter Templates
 * 2A: Internal conflict bureau letter (re-aging, status, account number) — no cross-bureau
 * 2B-1: Debt validation demand (general) — to furnisher
 * 2B-2: Furnisher challenge for verified errors — to furnisher
 * 2B-3: Duplicate account challenge — to furnisher
 * 2C: Bureau follow-up (inadequate investigation)
 */

export interface Round2TemplateContext {
  fullName: string;
  currentAddress: string;
  date: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: string;
  dateOpened: string;
  lastActivity: string;
  bureauName: string;
  bureauAddress: string;
  furnisherName?: string;
  furnisherAddress?: string;
}

const BUREAU_ADDRESSES: Record<string, string> = {
  transunion: 'TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016-2000',
  equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374-0256',
  experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
};

const BUREAU_NAMES: Record<string, string> = {
  transunion: 'TransUnion',
  equifax: 'Equifax',
  experian: 'Experian',
};

export function getBureauAddressR2(bureau: string): string {
  return BUREAU_ADDRESSES[bureau.toLowerCase()] || BUREAU_ADDRESSES.transunion;
}

export function getBureauNameR2(bureau: string): string {
  return BUREAU_NAMES[bureau.toLowerCase()] || bureau;
}

/** 2A - Internal conflict (re-aging, status, account number) — bureau letter */
export function template2A(ctx: Round2TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Second Dispute — Internal Conflict — Inadequate Investigation — FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I previously disputed the below account. Your investigation was inadequate. The information remains internally inconsistent and cannot be verified.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**INTERNAL CONFLICTS IDENTIFIED:**
The dates, status, and/or account identifiers reported are internally inconsistent. This tradeline cannot be accurate as reported.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you delete this account. You have 30 days to conduct a reasonable reinvestigation. If the furnisher cannot provide adequate verification, delete the item.

Sincerely,

${ctx.fullName}`;
}

/** 2B-1 - Debt validation demand (general) — to furnisher */
export function template2B1(ctx: Round2TemplateContext): string {
  const addr = ctx.furnisherAddress || ctx.furnisherName || ctx.accountName;
  return `${ctx.currentAddress}
${ctx.date}

${ctx.furnisherName || ctx.accountName}
${ctx.furnisherAddress || 'RE: Debt Validation Demand'}

Re: Formal Debt Validation Demand — FDCPA § 809 — FCRA § 1681s-2(b)

Dear Sir or Madam:

I dispute the debt you are reporting to the credit bureaus regarding: ${ctx.accountName} (Account: ${ctx.accountNumber}).

Pursuant to the Fair Debt Collection Practices Act (FDCPA) and the Fair Credit Reporting Act (FCRA), I demand that you provide:

1. Documentation proving I owe this debt
2. The name and address of the original creditor
3. Verification that you are licensed to collect in my state
4. A copy of the contract or agreement creating this debt

Until you provide proper validation, cease reporting this account to any credit bureau. Failure to validate within 30 days may result in deletion of the tradeline and a complaint to the CFPB.

Sincerely,

${ctx.fullName}`;
}

/** 2B-2 - Furnisher challenge for verified errors — to furnisher */
export function template2B2(ctx: Round2TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.furnisherName || ctx.accountName}
${ctx.furnisherAddress || ''}

Re: Furnisher Challenge — Verified but Incorrect — FCRA § 1681s-2(a)(1)(A)

Dear Sir or Madam:

The credit bureaus "verified" the below account after my dispute. The information you are furnishing is inaccurate.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**SPECIFIC ERRORS:**
The dates, balance, and/or status you report are incorrect. Under FCRA § 1681s-2(a)(1)(A), you may not report information you know or have reason to believe is inaccurate.

**DEMAND:**
Correct or delete this tradeline within 30 days. Provide the bureaus with updated information. If you cannot verify the accuracy of this account, instruct the bureaus to delete it.

Sincerely,

${ctx.fullName}`;
}

/** 2B-3 - Duplicate account challenge — to furnisher */
export function template2B3(ctx: Round2TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.furnisherName || ctx.accountName}
${ctx.furnisherAddress || ''}

Re: Duplicate Reporting — Demand for Deletion — FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

You are reporting the same debt multiple times on my credit report. Duplicate reporting inflates my indebtedness and damages my credit.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}

**SPECIFIC ERROR:**
This account appears as a duplicate. Only one reporting of this debt is accurate.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), instruct the credit bureaus to delete the duplicate entry. Provide written confirmation within 30 days.

Sincerely,

${ctx.fullName}`;
}

/** 2C - Bureau follow-up (inadequate investigation) */
export function template2C(ctx: Round2TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Second Dispute — Inadequate Investigation — Method of Verification Demand — FCRA § 1681i(a)(7)

Dear Sir or Madam:

I previously disputed the below account. You responded that it was "verified." I am challenging the adequacy of your investigation.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**DEMAND FOR METHOD OF VERIFICATION:**
Under FCRA § 1681i(a)(7), I demand documentation of your reinvestigation:
- Who verified this account (name, title, company)
- What documents were reviewed
- How verification was conducted
- Copies of all verification materials

If you cannot provide adequate verification within 30 days, delete this account. A generic "verified" response is insufficient.

Sincerely,

${ctx.fullName}`;
}

export function fillRound2Template(
  templateId: string,
  ctx: Omit<Round2TemplateContext, 'bureauName' | 'bureauAddress'> & { bureau: string }
): string {
  const bureau = ctx.bureau.toLowerCase();
  const fullCtx: Round2TemplateContext = {
    ...ctx,
    bureauName: getBureauNameR2(bureau),
    bureauAddress: getBureauAddressR2(bureau),
  };

  switch (templateId) {
    case '2A': return template2A(fullCtx);
    case '2B-1': return template2B1(fullCtx);
    case '2B-2': return template2B2(fullCtx);
    case '2B-3': return template2B3(fullCtx);
    case '2C': return template2C(fullCtx);
    default: return template2C(fullCtx);
  }
}
