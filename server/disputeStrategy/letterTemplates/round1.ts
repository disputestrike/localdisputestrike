/**
 * Round 1 Letter Templates
 * Short, one-error-per-letter, no cross-bureau. FCRA § 1681i(a)(5)(A)
 */

export interface Round1TemplateContext {
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

export function getBureauAddress(bureau: string): string {
  return BUREAU_ADDRESSES[bureau.toLowerCase()] || BUREAU_ADDRESSES.transunion;
}

export function getBureauName(bureau: string): string {
  return BUREAU_NAMES[bureau.toLowerCase()] || bureau;
}

/** 1A - Impossible timeline (last_activity < date_opened) */
export function template1A(ctx: Round1TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Formal Dispute - Impossible Timeline - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute inaccurate information on my credit report. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation of disputed information.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**SPECIFIC ERROR:**
The reported "Last Activity" date (${ctx.lastActivity}) is earlier than the "Date Opened" (${ctx.dateOpened}). This is impossible—activity cannot occur before an account was opened. This is a clear data error that renders the entire tradeline unreliable.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you delete this account from my credit file. The information is demonstrably inaccurate and cannot be verified.

Sincerely,

${ctx.fullName}`;
}

/** 1B - Duplicate reporting */
export function template1B(ctx: Round1TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Formal Dispute - Duplicate Account Reporting - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute duplicate reporting of the same debt on my credit report. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}

**SPECIFIC ERROR:**
This account appears to be a duplicate of another tradeline. The same debt is being reported more than once, which inflates my indebtedness and damages my credit standing. Duplicate reporting is inaccurate and misleading.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you delete the duplicate entry. Only one reporting of this debt is accurate.

Sincerely,

${ctx.fullName}`;
}

/** 1C - Unverifiable balance / request verification */
export function template1C(ctx: Round1TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Formal Dispute - Unverifiable Information - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute information on my credit report that I believe to be inaccurate. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation of disputed items.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**SPECIFIC ERROR:**
I have no record of this account in the manner reported. The balance, dates, and/or status cannot be verified. I request that you verify this information with the furnisher or delete it if it cannot be verified.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you investigate and either verify this information or delete it from my credit file. If the furnisher cannot provide adequate verification, the item must be removed.

Sincerely,

${ctx.fullName}`;
}

/** 1D - Math error (balance inconsistencies) */
export function template1D(ctx: Round1TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Formal Dispute - Mathematical/Data Error - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute inaccurate information on my credit report. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**SPECIFIC ERROR:**
The reported balance and/or payment history contain mathematical or logical inconsistencies that render the tradeline inaccurate. I have identified errors in the data that cannot be correct as reported.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you investigate and either correct the erroneous information or delete this account from my credit file.

Sincerely,

${ctx.fullName}`;
}

/** 1E - Internal date conflict */
export function template1E(ctx: Round1TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Formal Dispute - Internal Date Conflict - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute inaccurate information on my credit report. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**SPECIFIC ERROR:**
The dates reported for this account are internally inconsistent (e.g., date opened equals date closed, or dates conflict with the account status). Inconsistent date reporting makes the tradeline unreliable and inaccurate.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you investigate and either correct the dates or delete this account from my credit file.

Sincerely,

${ctx.fullName}`;
}

/** 1F - Re-aging */
export function template1F(ctx: Round1TemplateContext): string {
  return `${ctx.currentAddress}
${ctx.date}

${ctx.bureauName}
${ctx.bureauAddress}

Re: Formal Dispute - Re-Aging Violation - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute inaccurate information on my credit report. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation.

**ACCOUNT IN DISPUTE:**
Creditor: ${ctx.accountName}
Account Number: ${ctx.accountNumber}
Type: ${ctx.accountType}
Balance: $${ctx.balance}
Status: ${ctx.status}
Date Opened: ${ctx.dateOpened}
Last Activity: ${ctx.lastActivity}

**SPECIFIC ERROR:**
The "Last Activity" date appears to have been re-aged—i.e., updated to make the account appear more recent than it actually is. Re-aging violates the FCRA's requirement that negative information be reported accurately and for the correct reporting period.

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you investigate and correct or delete this account. The dates must accurately reflect the true chronology of this account.

Sincerely,

${ctx.fullName}`;
}

export function fillRound1Template(
  templateId: string,
  ctx: Omit<Round1TemplateContext, 'bureauName' | 'bureauAddress'> & { bureau: string }
): string {
  const bureau = ctx.bureau.toLowerCase();
  const fullCtx: Round1TemplateContext = {
    ...ctx,
    bureauName: getBureauName(bureau),
    bureauAddress: getBureauAddress(bureau),
  };

  switch (templateId) {
    case '1A': return template1A(fullCtx);
    case '1B': return template1B(fullCtx);
    case '1C': return template1C(fullCtx);
    case '1D': return template1D(fullCtx);
    case '1E': return template1E(fullCtx);
    case '1F': return template1F(fullCtx);
    default: return template1C(fullCtx);
  }
}
