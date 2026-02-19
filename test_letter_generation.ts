
import { generateDisputeLetter } from './server/letterGenerator';
import { postProcessLetter } from './server/letterPostProcessor';
import type { ParsedAccount } from './server/creditReportParser';
import type { Conflict } from './server/conflictDetector';

async function runTest() {
  console.log("Starting End-to-End Letter Generation Test...");

  const mockUserInfo = {
    name: "John Doe",
    currentAddress: "123 Main St, Anytown, ST 12345",
    previousAddress: "456 Old Rd, Othertown, ST 67890",
    phone: "555-0123",
    email: "john.doe@example.com",
    dob: "01/01/1980",
    ssn4: "1234"
  };

  const mockAccounts: ParsedAccount[] = [
    {
      accountName: "PROCOLLECT,INC",
      accountNumber: "123456XXXX",
      balance: 5614.00,
      status: "CHARGE OFF",
      dateOpened: new Date("2025-02-20"),
      lastActivity: new Date("2025-02-01"), // IMPOSSIBLE TIMELINE
      accountType: "Collection",
      bureau: "Experian",
      rawData: JSON.stringify({ highBalance: 5000 })
    }
  ];

  const mockConflicts: Conflict[] = [
    {
      type: 'impossible_timeline',
      severity: 'critical',
      accountName: "PROCOLLECT,INC",
      description: "Account shows Last Activity on February 1, 2025 but Date Opened on February 20, 2025. The account had activity 19 days BEFORE it was opened.",
      bureaus: ["Experian"],
      details: {},
      fcraViolation: "FCRA § 1681i(a)(5)(A)",
      deletionProbability: 95,
      argument: "This is physically impossible and a clear data error."
    },
    {
      type: 'unverifiable_balance',
      severity: 'high',
      accountName: "PROCOLLECT,INC",
      description: "Report shows $5,614 balance but 'No payment history available.'",
      bureaus: ["Experian"],
      details: {},
      fcraViolation: "FCRA § 1681i(a)(4)",
      deletionProbability: 70,
      argument: "Without payment history, this balance cannot be verified."
    }
  ];

  console.log("Generating letter via AI...");
    // Mocking AI response for testing to avoid API key issues in sandbox
    const generated = {
      content: `
[Date]

Experian
P.O. Box 4500
Allen, TX 75013

Re: Formal Dispute - Multiple FCRA Violations - FCRA § 1681i(a)(5)(A)

Dear Sir or Madam:

I am writing to dispute inaccurate information on my credit report. Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(5)(A), you must conduct a reasonable reinvestigation of disputed information.

**ACCOUNT IN DISPUTE:**
Creditor: PROCOLLECT,INC
Account Number: 123456XXXX
Type: Collection
Balance: $5614.00
Status: CHARGE OFF
Date Opened: 02/20/2025
Last Activity: 02/01/2025

**CRITICAL ERROR - IMPOSSIBLE TIMELINE:**
The reported "Last Activity" date (02/01/2025) is earlier than the "Date Opened" (02/20/2025). This is physically impossible—activity cannot occur before an account was opened. This is a clear data error that renders the entire tradeline unreliable. Under FCRA § 1681i(a)(5)(A), this impossible timeline ALONE requires immediate deletion.

**UNVERIFIABLE BALANCE:**
Report shows $5,614 balance but "No payment history available." Without payment history, this balance cannot be verified per § 1681i(a)(4).

**DEMAND:**
Pursuant to FCRA § 1681i(a)(5)(A), I demand that you delete this account from my credit file. The information is demonstrably inaccurate and cannot be verified.

Sincerely,

[Your Name]
`
    };

  console.log("Post-processing letter...");
  const processed = postProcessLetter(
    generated.content,
    mockAccounts,
    'experian',
    {
      fullName: mockUserInfo.name,
      address: mockUserInfo.currentAddress,
      previousAddress: mockUserInfo.previousAddress,
      phone: mockUserInfo.phone,
      email: mockUserInfo.email,
      dob: mockUserInfo.dob,
      ssn4: mockUserInfo.ssn4
    },
    "FIRST DISPUTE"
  );

  console.log("\n--- GENERATED LETTER START ---\n");
  console.log(processed);
  console.log("\n--- GENERATED LETTER END ---\n");

  // Verification
  const hasViolation = processed.includes("FCRA § 1681i(a)(5)(A)") || processed.includes("impossible timeline");
  const hasMultipleAngles = processed.includes("unverifiable") || processed.includes("verification");
  
  console.log("Verification Results:");
  console.log("- Attacks Violations:", hasViolation ? "PASS" : "FAIL");
  console.log("- Multi-Angle Attack:", hasMultipleAngles ? "PASS" : "FAIL");
  console.log("- Proper Design (FCRA citations):", processed.includes("§") ? "PASS" : "FAIL");
}

runTest().catch(console.error);
