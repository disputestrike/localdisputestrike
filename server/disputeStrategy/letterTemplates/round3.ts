/**
 * Round 3 Letter Templates
 * 3A: Final bureau disputes (can use Experian Master Template structure)
 * 3B-1: CFPB complaint vs furnisher
 * 3B-2: CFPB complaint vs bureau
 * 3B-3: CFPB complaint (multiple failures)
 * 3C-1: Pre-litigation to furnisher (10-day, statutory damages)
 * 3C-2: Pre-litigation to bureau
 */

export interface Round3TemplateContext {
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

/** 3A - Final bureau dispute */
export function template3A(ctx: Round3TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

SENT VIA CERTIFIED MAIL — RETURN RECEIPT REQUESTED

${ctx.bureauName}
${ctx.bureauAddress}

Re: FINAL DISPUTE — FORMAL DEMAND — FCRA § 1681i(a)(5)(A) — 30-DAY DEADLINE

Dear Sir or Madam:

This is my FINAL dispute regarding inaccurate information on my credit report. I have previously disputed the below account. The bureaus have failed to conduct a reasonable reinvestigation.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**LEGAL BASIS:**
- FCRA § 1681i(a)(1)(A) — duty to reinvestigate
- FCRA § 1681i(a)(5)(A) — delete unverifiable information
- FCRA § 1681i(a)(3)(A) — 30-day reasonable reinvestigation

**DEMAND:**
Within 30 days of receipt, conduct a complete reinvestigation. If the furnisher cannot provide adequate verification, DELETE this account. Provide written confirmation of deletion or correction.

**CONSEQUENCES:**
Failure to comply may result in a CFPB complaint, state Attorney General complaint, and litigation under FCRA §§ 1681n and 1681o (statutory and actual damages).

Sincerely,

${ctx.fullName}`;
}

/** 3B-1 - CFPB complaint vs furnisher */
export function template3B1(ctx: Round3TemplateContext): string {
  return `CFPB CONSUMER COMPLAINT — FURNISHER

Consumer: ${ctx.fullName}
Address: ${ctx.currentAddress}
Date: ${ctx.date}

COMPANY: ${ctx.furnisherName || ctx.accountName}
ACCOUNT: ${ctx.accountNumber}
BALANCE: $${ctx.balance}
STATUS: ${ctx.status}

ISSUE DESCRIPTION:
The furnisher is reporting inaccurate information to the credit bureaus regarding the above account. Despite my dispute, the furnisher continues to report incorrect dates, balance, and/or status. Under FCRA § 1681s-2(a)(1)(A), furnishers may not report information they know or have reason to believe is inaccurate.

DESIRED RESOLUTION:
I want the furnisher to correct or delete this tradeline and instruct all three credit bureaus to update my file accordingly.

LEGAL CITATIONS:
- FCRA § 1681s-2(a)(1)(A) — accuracy duty
- FCRA § 1681s-2(b) — dispute reinvestigation by furnisher
- 15 U.S.C. § 1681s-2`;
}

/** 3B-2 - CFPB complaint vs bureau */
export function template3B2(ctx: Round3TemplateContext): string {
  return `CFPB CONSUMER COMPLAINT — CREDIT BUREAU

Consumer: ${ctx.fullName}
Address: ${ctx.currentAddress}
Date: ${ctx.date}

BUREAU: ${ctx.bureauName}
ACCOUNT: ${ctx.accountName} (${ctx.accountNumber})
BALANCE: $${ctx.balance}

ISSUE DESCRIPTION:
I disputed the above account with ${ctx.bureauName}. The bureau conducted an inadequate reinvestigation and "verified" the account without proper investigation. The bureau failed to provide Method of Verification (MOV) upon request. Under FCRA § 1681i(a), bureaus must conduct a reasonable reinvestigation and delete unverifiable information.

DESIRED RESOLUTION:
I want ${ctx.bureauName} to delete this account or provide complete documentation of its verification. If the furnisher cannot verify, the bureau must delete pursuant to § 1681i(a)(5)(A).

LEGAL CITATIONS:
- FCRA § 1681i(a)(1)(A) — reinvestigation duty
- FCRA § 1681i(a)(5)(A) — delete unverifiable
- FCRA § 1681i(a)(7) — MOV disclosure`;
}

/** 3B-3 - CFPB complaint (multiple failures) */
export function template3B3(ctx: Round3TemplateContext): string {
  return `CFPB CONSUMER COMPLAINT — MULTIPLE FAILURES

Consumer: ${ctx.fullName}
Address: ${ctx.currentAddress}
Date: ${ctx.date}

ACCOUNT: ${ctx.accountName} (${ctx.accountNumber})

ISSUE DESCRIPTION:
I have disputed the above account through multiple rounds. Both the credit bureaus and the furnisher have failed to:
1. Conduct adequate reinvestigations
2. Delete demonstrably inaccurate information
3. Provide Method of Verification documentation
4. Comply with FCRA § 1681i(a)(5)(A) (delete unverifiable)

The continued reporting of inaccurate information has damaged my credit and caused me harm.

DESIRED RESOLUTION:
I want the CFPB to investigate and require the bureaus and furnisher to delete or correct this tradeline. I am prepared to pursue litigation under FCRA §§ 1681n and 1681o if necessary.

LEGAL CITATIONS:
- FCRA § 1681i — bureau duties
- FCRA § 1681s-2 — furnisher duties
- 15 U.S.C. Ch. 41`;
}

/** 3C-1 - Pre-litigation to furnisher (10-day, statutory damages) */
export function template3C1(ctx: Round3TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.furnisherName || ctx.accountName}
${ctx.furnisherAddress || ''}

Re: FINAL DEMAND — 10-DAY DEADLINE — FCRA § 1681s-2 — LITIGATION IMMINENT

Dear Sir or Madam:

This is my FINAL demand before litigation. You are reporting inaccurate information regarding: ${ctx.accountName} (${ctx.accountNumber}).

**DEMAND:**
Within 10 days of receipt:
1. Instruct all credit bureaus to DELETE this account, OR
2. Provide complete documentation proving the accuracy of this tradeline

**LEGAL NOTICE:**
Under FCRA §§ 1681n and 1681o, you may be liable for:
- Statutory damages of $100 to $1,000 per violation (willful)
- Actual damages (negligent)
- Attorney's fees and costs

I will file a CFPB complaint and consider litigation if you do not comply within 10 days.

Sincerely,

${ctx.fullName}`;
}

/** 3C-2 - Pre-litigation to bureau */
export function template3C2(ctx: Round3TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

SENT VIA CERTIFIED MAIL — RETURN RECEIPT REQUESTED

${ctx.bureauName}
${ctx.bureauAddress}

Re: FINAL DEMAND — 10-DAY DEADLINE — FCRA § 1681i — LITIGATION IMMINENT

Dear Sir or Madam:

This is my FINAL demand before litigation. You have failed to conduct an adequate reinvestigation of the below account.

**ACCOUNT:** ${ctx.accountName} (${ctx.accountNumber}) — $${ctx.balance}

**DEMAND:**
Within 10 days of receipt, DELETE this account pursuant to FCRA § 1681i(a)(5)(A). If you do not, I will file a CFPB complaint and consider litigation under FCRA §§ 1681n and 1681o for statutory and actual damages.

Sincerely,

${ctx.fullName}`;
}

export function fillRound3Template(
  templateId: string,
  ctx: Omit<Round3TemplateContext, 'bureauName' | 'bureauAddress'> & { bureau: string }
): string {
  const bureau = ctx.bureau.toLowerCase();
  const fullCtx: Round3TemplateContext = {
    ...ctx,
    bureauName: BUREAU_NAMES[bureau] || bureau,
    bureauAddress: BUREAU_ADDRESSES[bureau] || BUREAU_ADDRESSES.transunion,
  };

  switch (templateId) {
    case '3A': return template3A(fullCtx);
    case '3B-1': return template3B1(fullCtx);
    case '3B-2': return template3B2(fullCtx);
    case '3B-3': return template3B3(fullCtx);
    case '3C-1': return template3C1(fullCtx);
    case '3C-2': return template3C2(fullCtx);
    default: return template3A(fullCtx);
  }
}
