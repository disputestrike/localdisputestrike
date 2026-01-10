/**
 * DisputeStrike - Method-Specific Letter Templates
 * 
 * Each of the 43 dispute detection methods has a specialized letter template
 * that focuses on the specific violation type for maximum effectiveness.
 */
export interface MethodTemplate {
  methodNumber: number;
  methodName: string;
  category: string;
  fcraViolation: string;
  deletionProbability: number; // 0-100
  severity: 'critical' | 'high' | 'medium' | 'low';
  legalBasis: string;
  demandLanguage: string;
  argumentTemplate: string;
  evidenceRequired: string[];
  escalationPath: string;
}

// ============================================================================
// CATEGORY 1: DATE & TIMELINE METHODS (1-15)
// ============================================================================

const dateTimelineMethods: MethodTemplate[] = [
  {
    methodNumber: 1,
    methodName: 'Date Opened Discrepancy',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    legalBasis: 'FCRA § 1681e(b) requires credit bureaus to follow reasonable procedures to assure maximum possible accuracy.',
    demandLanguage: 'IMMEDIATE DELETION due to unverifiable date opened information',
    argumentTemplate: 'The Date Opened for this account is reported inconsistently across bureaus:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThis discrepancy proves the information cannot be verified and must be deleted under FCRA § 1681e(b). The original creditor clearly cannot provide consistent documentation of when this account was opened, rendering the entire tradeline unverifiable.',
    evidenceRequired: ['Credit reports from all 3 bureaus showing different dates'],
    escalationPath: 'CFPB complaint citing willful noncompliance under § 1681n'
  },
  {
    methodNumber: 2,
    methodName: 'Last Activity Date Conflict',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 80,
    severity: 'high',
    legalBasis: 'Last activity date affects the 7-year reporting period calculation.',
    demandLanguage: 'CORRECT or DELETE due to conflicting last activity dates',
    argumentTemplate: 'The Last Activity Date is reported differently across bureaus:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThis inconsistency directly impacts the 7-year reporting period calculation under FCRA § 1681c. The furnisher cannot verify when the last activity actually occurred.',
    evidenceRequired: ['Credit reports showing different last activity dates'],
    escalationPath: 'CFPB complaint for inaccurate reporting affecting deletion timeline'
  },
  {
    methodNumber: 3,
    methodName: 'Date of First Delinquency Mismatch',
    category: 'date_timeline',
    fcraViolation: '§ 1681c(c)(1)',
    deletionProbability: 85,
    severity: 'critical',
    legalBasis: 'DOFD determines the 7-year reporting period and must be accurate.',
    demandLanguage: 'IMMEDIATE DELETION - DOFD cannot be verified',
    argumentTemplate: 'The Date of First Delinquency (DOFD) is critical for determining the 7-year reporting period under FCRA § 1681c(c)(1). This account shows conflicting DOFDs:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThe furnisher cannot verify the actual DOFD, making the entire tradeline unverifiable and subject to immediate deletion.',
    evidenceRequired: ['Credit reports showing different DOFD dates', 'Historical reports if available'],
    escalationPath: 'CFPB complaint + FTC complaint for DOFD manipulation'
  },
  {
    methodNumber: 4,
    methodName: 'Closed Date Discrepancy',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'medium',
    legalBasis: 'Closed date affects account status and reporting accuracy.',
    demandLanguage: 'CORRECT closed date to accurate information',
    argumentTemplate: 'The Closed Date for this account varies across bureaus:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThis discrepancy indicates the furnisher cannot verify when this account was actually closed, violating FCRA § 1681e(b) accuracy requirements.',
    evidenceRequired: ['Credit reports showing different closed dates'],
    escalationPath: 'Direct dispute to furnisher with documentation request'
  },
  {
    methodNumber: 5,
    methodName: 'Last Payment Date Conflict',
    category: 'date_timeline',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 72,
    severity: 'high',
    legalBasis: 'Payment dates must be accurately reported by furnishers.',
    demandLanguage: 'CORRECT last payment date or DELETE tradeline',
    argumentTemplate: 'The Last Payment Date is inconsistent across bureaus:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThis proves the furnisher cannot verify payment records, violating their duty under FCRA § 1681s-2(a) to report accurate information.',
    evidenceRequired: ['Credit reports showing different payment dates', 'Bank statements if available'],
    escalationPath: 'CFPB complaint for payment reporting inaccuracy'
  },
  {
    methodNumber: 6,
    methodName: 'Date Reported Inconsistency',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 60,
    severity: 'medium',
    legalBasis: 'Reporting dates should be consistent and current.',
    demandLanguage: 'UPDATE reporting date or investigate stale data',
    argumentTemplate: 'The Date Reported shows concerning inconsistencies:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThis suggests the furnisher is not maintaining consistent reporting practices across bureaus, potentially violating FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing different reporting dates'],
    escalationPath: 'Direct dispute to furnisher'
  },
  {
    methodNumber: 7,
    methodName: 'Charge-off Date Mismatch',
    category: 'date_timeline',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 78,
    severity: 'high',
    legalBasis: 'Charge-off date is material information affecting credit decisions.',
    demandLanguage: 'CORRECT charge-off date or DELETE entire tradeline',
    argumentTemplate: 'The Charge-off Date varies significantly across bureaus:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nCharge-off date is material information that affects credit decisions. The furnisher cannot verify when this account was actually charged off.',
    evidenceRequired: ['Credit reports showing different charge-off dates'],
    escalationPath: 'CFPB complaint for material inaccuracy'
  },
  {
    methodNumber: 8,
    methodName: 'Account Status Date Conflict',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 68,
    severity: 'medium',
    legalBasis: 'Status dates must accurately reflect account history.',
    demandLanguage: 'CORRECT status date information',
    argumentTemplate: 'The Account Status Date shows discrepancies:\n- {{bureau1}}: {{date1}}\n- {{bureau2}}: {{date2}}\n- {{bureau3}}: {{date3}}\n\nThis inconsistency indicates data integrity issues with this tradeline under FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing different status dates'],
    escalationPath: 'Direct dispute to furnisher'
  },
  {
    methodNumber: 9,
    methodName: 'Verification Date Anomaly',
    category: 'date_timeline',
    fcraViolation: '§ 1681i(a)(5)',
    deletionProbability: 65,
    severity: 'medium',
    legalBasis: 'Verification must be conducted within required timeframes.',
    demandLanguage: 'PROVIDE verification documentation or DELETE',
    argumentTemplate: 'The verification date for this account raises concerns:\n- Dispute Filed: {{disputeDate}}\n- Verification Date: {{verificationDate}}\n- Days Elapsed: {{daysElapsed}}\n\nThis may indicate improper verification procedures under FCRA § 1681i(a)(5).',
    evidenceRequired: ['Dispute correspondence', 'Bureau response letters'],
    escalationPath: 'CFPB complaint for verification procedure violations'
  },
  {
    methodNumber: 10,
    methodName: 'Re-aging Detection',
    category: 'date_timeline',
    fcraViolation: '§ 1681s-2(a)(5)',
    deletionProbability: 95,
    severity: 'critical',
    legalBasis: 'Re-aging is a serious FCRA violation that extends the reporting period illegally.',
    demandLanguage: 'IMMEDIATE DELETION due to illegal re-aging violation',
    argumentTemplate: '**CRITICAL VIOLATION: ILLEGAL RE-AGING DETECTED**\n\nThis account shows evidence of illegal re-aging:\n- Original Date of First Delinquency: {{originalDofd}}\n- Currently Reported DOFD: {{currentDofd}}\n- Difference: {{difference}} months\n\nRe-aging is a SERIOUS VIOLATION of FCRA § 1681s-2(a)(5) which prohibits furnishers from reporting a date of first delinquency that is later than the actual date. This practice illegally extends the 7-year reporting period.\n\nI demand IMMEDIATE DELETION and preservation of all records related to this account for potential litigation.',
    evidenceRequired: ['Historical credit reports showing date changes', 'Documentation of original delinquency'],
    escalationPath: 'CFPB complaint + FTC complaint + State AG complaint + private lawsuit under § 1681n'
  },
  {
    methodNumber: 11,
    methodName: 'Impossible Timeline',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 92,
    severity: 'critical',
    legalBasis: 'Logically impossible dates prove the information is fabricated or corrupted.',
    demandLanguage: 'IMMEDIATE DELETION due to impossible timeline proving data corruption',
    argumentTemplate: '**CRITICAL ERROR: IMPOSSIBLE TIMELINE DETECTED**\n\nThis account contains dates that are logically impossible:\n- Last Activity Date: {{lastActivity}}\n- Date Opened: {{dateOpened}}\n- Problem: Last Activity is BEFORE Date Opened\n\nThis is physically impossible. An account cannot have activity before it was opened. This proves the data is either fabricated or severely corrupted and MUST be deleted immediately under FCRA § 1681e(b).',
    evidenceRequired: ['Credit report showing impossible date sequence'],
    escalationPath: 'CFPB complaint for willful noncompliance under § 1681n'
  },
  {
    methodNumber: 12,
    methodName: 'Future Date Reporting',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 90,
    severity: 'critical',
    legalBasis: 'Future dates are impossible and prove data fabrication.',
    demandLanguage: 'IMMEDIATE DELETION due to impossible future date',
    argumentTemplate: '**CRITICAL ERROR: FUTURE DATE DETECTED**\n\nThis account contains a date in the future:\n- Reported Date: {{futureDate}}\n- Current Date: {{currentDate}}\n\nReporting future dates is impossible and proves the data is fabricated. This is a clear violation of FCRA § 1681e(b) requiring maximum possible accuracy.',
    evidenceRequired: ['Credit report showing future date'],
    escalationPath: 'CFPB complaint for willful noncompliance'
  },
  {
    methodNumber: 13,
    methodName: 'Stale Data Detection',
    category: 'date_timeline',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'medium',
    legalBasis: 'Credit information must be current and regularly updated.',
    demandLanguage: 'UPDATE to current information or DELETE stale data',
    argumentTemplate: 'This account shows stale data that has not been updated:\n- Last Update: {{lastUpdate}}\n- Days Since Update: {{daysSinceUpdate}}\n\nFCRA § 1681e(b) requires reasonable procedures for accuracy, which includes maintaining current information. Stale data may no longer reflect the true status of this account.',
    evidenceRequired: ['Credit report showing outdated information'],
    escalationPath: 'Direct dispute to furnisher requesting update'
  },
  {
    methodNumber: 14,
    methodName: 'Reporting Period Violation',
    category: 'date_timeline',
    fcraViolation: '§ 1681c(a)',
    deletionProbability: 88,
    severity: 'critical',
    legalBasis: 'Negative information cannot be reported beyond 7 years from DOFD.',
    demandLanguage: 'IMMEDIATE DELETION - reporting period has expired',
    argumentTemplate: '**REPORTING PERIOD VIOLATION**\n\nThis account is being reported beyond the legally allowed period:\n- Date of First Delinquency: {{dofd}}\n- 7-Year Expiration: {{expirationDate}}\n- Current Date: {{currentDate}}\n- Days Past Expiration: {{daysPastExpiration}}\n\nFCRA § 1681c(a) prohibits reporting negative information more than 7 years from the date of first delinquency. This account MUST be deleted immediately.',
    evidenceRequired: ['Credit report showing account', 'Documentation of DOFD'],
    escalationPath: 'CFPB complaint + State AG complaint for willful violation'
  },
  {
    methodNumber: 15,
    methodName: 'Reporting Period Exceeded',
    category: 'date_timeline',
    fcraViolation: '§ 1681c(a)',
    deletionProbability: 98,
    severity: 'critical',
    legalBasis: 'The 7-year reporting period is absolute under FCRA.',
    demandLanguage: 'MANDATORY DELETION - 7-year period exceeded',
    argumentTemplate: '**MANDATORY DELETION REQUIRED**\n\nThis account has exceeded the maximum reporting period:\n- Original DOFD: {{dofd}}\n- Years Since DOFD: {{yearsSince}}\n- Maximum Allowed: 7 years\n\nUnder FCRA § 1681c(a), this information MUST be deleted. Continued reporting is a willful violation subject to statutory damages under § 1681n.',
    evidenceRequired: ['Credit report showing account', 'Historical documentation of DOFD'],
    escalationPath: 'CFPB complaint + immediate lawsuit for willful noncompliance'
  }
];

// ============================================================================
// CATEGORY 2: BALANCE & PAYMENT METHODS (16-23)
// ============================================================================

const balancePaymentMethods: MethodTemplate[] = [
  {
    methodNumber: 16,
    methodName: 'Balance Discrepancy',
    category: 'balance_payment',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 80,
    severity: 'critical',
    legalBasis: 'Balance is a material element that must be accurate across all bureaus.',
    demandLanguage: 'DELETE or CORRECT balance discrepancy immediately',
    argumentTemplate: '**CRITICAL ERROR: BALANCE DISCREPANCY DETECTED**\n\nThe balance on this account varies significantly across bureaus:\n- {{bureau1}}: ${{balance1}}\n- {{bureau2}}: ${{balance2}}\n- {{bureau3}}: ${{balance3}}\n- Maximum Variance: ${{variance}}\n\nI cannot owe three different amounts on the same account. This proves the furnisher cannot verify the actual balance, making the entire tradeline unverifiable under FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing different balances'],
    escalationPath: 'CFPB complaint + direct dispute to furnisher'
  },
  {
    methodNumber: 17,
    methodName: 'High Credit Mismatch',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 65,
    severity: 'medium',
    legalBasis: 'High credit/credit limit must be accurately reported.',
    demandLanguage: 'CORRECT high credit amount to accurate figure',
    argumentTemplate: 'The High Credit amount is reported inconsistently:\n- {{bureau1}}: ${{amount1}}\n- {{bureau2}}: ${{amount2}}\n- {{bureau3}}: ${{amount3}}\n\nThis discrepancy affects my credit utilization calculation and overall credit score. The furnisher must verify and correct this information under FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit reports showing different high credit amounts'],
    escalationPath: 'Direct dispute to furnisher'
  },
  {
    methodNumber: 18,
    methodName: 'Credit Limit Conflict',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 70,
    severity: 'high',
    legalBasis: 'Credit limit directly affects utilization ratio calculation.',
    demandLanguage: 'CORRECT credit limit to accurate amount',
    argumentTemplate: 'The Credit Limit shows material discrepancies:\n- {{bureau1}}: ${{limit1}}\n- {{bureau2}}: ${{limit2}}\n- {{bureau3}}: ${{limit3}}\n\nCredit limit is a critical factor in credit score calculation. Inconsistent reporting artificially inflates my utilization ratio and damages my credit score. This violates FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit reports showing different limits', 'Account statements if available'],
    escalationPath: 'Direct dispute to furnisher with documentation'
  },
  {
    methodNumber: 19,
    methodName: 'Past Due Amount Discrepancy',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 75,
    severity: 'high',
    legalBasis: 'Past due amounts must be accurately reported.',
    demandLanguage: 'DELETE or CORRECT past due amount',
    argumentTemplate: 'The Past Due Amount varies across bureaus:\n- {{bureau1}}: ${{pastDue1}}\n- {{bureau2}}: ${{pastDue2}}\n- {{bureau3}}: ${{pastDue3}}\n\nI cannot be past due for three different amounts on the same account. This proves the furnisher cannot verify the actual past due amount, violating FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit reports showing different past due amounts'],
    escalationPath: 'CFPB complaint for inaccurate reporting'
  },
  {
    methodNumber: 20,
    methodName: 'Payment Amount Mismatch',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 60,
    severity: 'medium',
    legalBasis: 'Payment amounts must be accurately reported.',
    demandLanguage: 'CORRECT payment amount information',
    argumentTemplate: 'The Payment Amount is reported differently:\n- {{bureau1}}: ${{payment1}}\n- {{bureau2}}: ${{payment2}}\n- {{bureau3}}: ${{payment3}}\n\nPayment information should be consistent across all bureaus. This discrepancy indicates reporting system failures under FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit reports showing different payment amounts', 'Bank statements'],
    escalationPath: 'Direct dispute to furnisher'
  },
  {
    methodNumber: 21,
    methodName: 'Payment History Conflict',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 72,
    severity: 'high',
    legalBasis: 'Payment history is a critical factor in credit scoring.',
    demandLanguage: 'CORRECT payment history to reflect accurate records',
    argumentTemplate: 'The Payment History shows conflicts across bureaus:\n- {{bureau1}}: {{history1}}\n- {{bureau2}}: {{history2}}\n- {{bureau3}}: {{history3}}\n\nPayment history is the most important factor in credit scoring (35% of FICO score). Inconsistent reporting causes material harm to my credit profile and violates FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit reports showing different payment histories', 'Bank statements'],
    escalationPath: 'CFPB complaint for payment history inaccuracy'
  },
  {
    methodNumber: 22,
    methodName: 'Balance Increase After Charge-off',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 88,
    severity: 'critical',
    legalBasis: 'Balance cannot increase after charge-off without new credit extension.',
    demandLanguage: 'IMMEDIATE DELETION due to impossible balance increase',
    argumentTemplate: '**CRITICAL ERROR: BALANCE INCREASED AFTER CHARGE-OFF**\n\nThis account shows a balance increase after being charged off:\n- Charge-off Date: {{chargeOffDate}}\n- Balance at Charge-off: ${{originalBalance}}\n- Current Balance: ${{currentBalance}}\n- Increase: ${{increase}}\n\nA charged-off account cannot have a balance increase without new credit being extended, which would be impossible for a charged-off account. This proves data manipulation or corruption.',
    evidenceRequired: ['Credit reports showing balance increase', 'Historical reports showing original balance'],
    escalationPath: 'CFPB complaint + FDCPA complaint for phantom debt'
  },
  {
    methodNumber: 23,
    methodName: 'Phantom Balance',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 85,
    severity: 'critical',
    legalBasis: 'Reporting a balance on a paid or closed account is inaccurate.',
    demandLanguage: 'IMMEDIATE DELETION of phantom balance',
    argumentTemplate: '**CRITICAL ERROR: PHANTOM BALANCE DETECTED**\n\nThis account shows a balance despite being {{status}}:\n- Account Status: {{status}}\n- Reported Balance: ${{balance}}\n- Expected Balance: $0\n\nA {{status}} account should show a $0 balance. The phantom balance is causing ongoing damage to my credit score and violates FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit report showing balance on closed/paid account', 'Proof of payment if available'],
    escalationPath: 'CFPB complaint + direct dispute to furnisher'
  }
];

// ============================================================================
// CATEGORY 3: CREDITOR & OWNERSHIP METHODS (24-28)
// ============================================================================

const creditorOwnershipMethods: MethodTemplate[] = [
  {
    methodNumber: 24,
    methodName: 'Creditor Name Discrepancy',
    category: 'creditor_ownership',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    legalBasis: 'Creditor identity must be accurate and consistent.',
    demandLanguage: 'CORRECT creditor name or DELETE tradeline',
    argumentTemplate: 'The Creditor Name is reported inconsistently:\n- {{bureau1}}: {{creditor1}}\n- {{bureau2}}: {{creditor2}}\n- {{bureau3}}: {{creditor3}}\n\nI cannot owe money to three different creditors for the same account. This proves the debt ownership chain is broken or unverifiable under FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing different creditor names'],
    escalationPath: 'CFPB complaint + debt validation request'
  },
  {
    methodNumber: 25,
    methodName: 'Original Creditor Mismatch',
    category: 'creditor_ownership',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 78,
    severity: 'high',
    legalBasis: 'Original creditor information must be accurate for debt validation.',
    demandLanguage: 'PROVIDE original creditor documentation or DELETE',
    argumentTemplate: 'The Original Creditor is reported differently:\n- {{bureau1}}: {{original1}}\n- {{bureau2}}: {{original2}}\n- {{bureau3}}: {{original3}}\n\nWithout accurate original creditor information, the debt cannot be properly validated. This violates FCRA § 1681s-2(a) and potentially FDCPA § 1692g.',
    evidenceRequired: ['Credit reports showing different original creditors', 'Debt validation documentation'],
    escalationPath: 'CFPB complaint + FDCPA complaint to FTC'
  },
  {
    methodNumber: 26,
    methodName: 'Debt Buyer Chain Break',
    category: 'creditor_ownership',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 82,
    severity: 'critical',
    legalBasis: 'Complete chain of title must be documentable for debt collection.',
    demandLanguage: 'PROVIDE complete chain of title or DELETE immediately',
    argumentTemplate: '**CHAIN OF TITLE BREAK DETECTED**\n\nThis debt has been sold multiple times with broken documentation:\n- Original Creditor: {{originalCreditor}}\n- Current Holder: {{currentHolder}}\n- Missing Links: {{missingLinks}}\n\nWithout a complete, documented chain of title, the current holder cannot prove legal ownership of this debt. This tradeline must be deleted under FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports', 'Debt validation requests', 'Chain of title documentation'],
    escalationPath: 'CFPB complaint + FDCPA lawsuit for collection without proof of ownership'
  },
  {
    methodNumber: 27,
    methodName: 'Collection Agency Conflict',
    category: 'creditor_ownership',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 80,
    severity: 'high',
    legalBasis: 'Only one entity can legally collect on a debt at a time.',
    demandLanguage: 'CLARIFY collection ownership or DELETE duplicate entries',
    argumentTemplate: 'Multiple collection agencies are reporting this same debt:\n- {{agency1}}: ${{amount1}}\n- {{agency2}}: ${{amount2}}\n\nThis indicates either duplicate reporting or improper debt assignment. Only one entity can legally collect on a debt at a time. This violates FCRA § 1681s-2(a) and potentially FDCPA.',
    evidenceRequired: ['Credit reports showing multiple collectors', 'Debt validation requests to each'],
    escalationPath: 'CFPB complaint + FDCPA complaint for duplicate collection'
  },
  {
    methodNumber: 28,
    methodName: 'Subscriber Code Mismatch',
    category: 'creditor_ownership',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'medium',
    legalBasis: 'Subscriber codes must accurately identify the reporting entity.',
    demandLanguage: 'CORRECT subscriber information or DELETE',
    argumentTemplate: 'The Subscriber Code for this account shows discrepancies:\n- {{bureau1}}: {{code1}}\n- {{bureau2}}: {{code2}}\n- {{bureau3}}: {{code3}}\n\nInconsistent subscriber codes indicate data integrity issues that violate FCRA § 1681e(b) accuracy requirements.',
    evidenceRequired: ['Credit reports showing different subscriber codes'],
    escalationPath: 'Direct dispute to bureaus'
  }
];

// ============================================================================
// CATEGORY 4: STATUS & CLASSIFICATION METHODS (29-34)
// ============================================================================

const statusClassificationMethods: MethodTemplate[] = [
  {
    methodNumber: 29,
    methodName: 'Account Status Conflict',
    category: 'status_classification',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 78,
    severity: 'high',
    legalBasis: 'Account status directly affects credit decisions.',
    demandLanguage: 'CORRECT account status or DELETE tradeline',
    argumentTemplate: 'The Account Status is reported inconsistently:\n- {{bureau1}}: {{status1}}\n- {{bureau2}}: {{status2}}\n- {{bureau3}}: {{status3}}\n\nAn account cannot simultaneously be in multiple statuses. This proves the furnisher cannot verify the actual status, violating FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing different statuses'],
    escalationPath: 'CFPB complaint for status reporting inaccuracy'
  },
  {
    methodNumber: 30,
    methodName: 'Payment Status Mismatch',
    category: 'status_classification',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 75,
    severity: 'high',
    legalBasis: 'Payment status is a critical factor in credit scoring.',
    demandLanguage: 'CORRECT payment status to accurate designation',
    argumentTemplate: 'The Payment Status varies across bureaus:\n- {{bureau1}}: {{payStatus1}}\n- {{bureau2}}: {{payStatus2}}\n- {{bureau3}}: {{payStatus3}}\n\nPayment status directly impacts credit scores. The furnisher must verify and correct this information under FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit reports showing different payment statuses', 'Payment records'],
    escalationPath: 'CFPB complaint for payment status inaccuracy'
  },
  {
    methodNumber: 31,
    methodName: 'Account Type Discrepancy',
    category: 'status_classification',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 65,
    severity: 'medium',
    legalBasis: 'Account type affects credit mix calculations.',
    demandLanguage: 'CORRECT account type classification',
    argumentTemplate: 'The Account Type is classified differently:\n- {{bureau1}}: {{type1}}\n- {{bureau2}}: {{type2}}\n- {{bureau3}}: {{type3}}\n\nAccount type affects credit mix calculations (10% of FICO score). Inconsistent classification violates FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing different account types', 'Original account agreement'],
    escalationPath: 'Direct dispute to furnisher'
  },
  {
    methodNumber: 32,
    methodName: 'Closed Account Reporting Active',
    category: 'status_classification',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 82,
    severity: 'critical',
    legalBasis: 'Closed accounts must be reported as closed.',
    demandLanguage: 'IMMEDIATELY UPDATE to closed status',
    argumentTemplate: '**CRITICAL ERROR: CLOSED ACCOUNT REPORTED AS ACTIVE**\n\nThis account was closed but is still being reported as active:\n- Actual Status: Closed on {{closedDate}}\n- Reported Status: {{reportedStatus}}\n\nThis is causing ongoing damage to my credit utilization ratio and overall credit score. The furnisher must immediately correct this under FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit report showing active status', 'Proof of account closure'],
    escalationPath: 'CFPB complaint for willful inaccuracy'
  },
  {
    methodNumber: 33,
    methodName: 'Paid Account Showing Delinquent',
    category: 'status_classification',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 85,
    severity: 'critical',
    legalBasis: 'Paid accounts must show current/paid status.',
    demandLanguage: 'IMMEDIATELY CORRECT to paid status',
    argumentTemplate: '**CRITICAL ERROR: PAID ACCOUNT SHOWING DELINQUENT**\n\nThis account was paid in full but shows delinquent status:\n- Payment Date: {{paymentDate}}\n- Payment Amount: ${{paymentAmount}}\n- Current Reported Status: {{reportedStatus}}\n\nI have documentation proving this account was paid. The continued delinquent reporting is causing severe damage to my credit score.',
    evidenceRequired: ['Proof of payment', 'Credit report showing delinquent status'],
    escalationPath: 'CFPB complaint + direct dispute with payment proof'
  },
  {
    methodNumber: 34,
    methodName: 'Paid Account Showing Balance',
    category: 'balance_payment',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 85,
    severity: 'critical',
    legalBasis: 'Paid accounts must show $0 balance.',
    demandLanguage: 'IMMEDIATE CORRECTION to $0 balance',
    argumentTemplate: '**CRITICAL ERROR: PAID ACCOUNT SHOWING BALANCE**\n\nThis account was paid in full but still shows a balance:\n- Payment Date: {{paymentDate}}\n- Payment Amount: ${{paymentAmount}}\n- Current Reported Balance: ${{reportedBalance}}\n\nI have documentation proving this account was paid in full. The continued reporting of a balance is causing ongoing damage to my credit score.',
    evidenceRequired: ['Proof of payment', 'Credit report showing balance'],
    escalationPath: 'CFPB complaint + direct dispute with payment proof'
  }
];

// ============================================================================
// CATEGORY 5: ACCOUNT IDENTIFICATION METHODS (35-36)
// ============================================================================

const accountIdentificationMethods: MethodTemplate[] = [
  {
    methodNumber: 35,
    methodName: 'Account Number Mismatch',
    category: 'account_identification',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 72,
    severity: 'high',
    legalBasis: 'Account numbers must be consistent for proper identification.',
    demandLanguage: 'CORRECT account number or DELETE tradeline',
    argumentTemplate: 'The Account Number is reported differently:\n- {{bureau1}}: {{acctNum1}}\n- {{bureau2}}: {{acctNum2}}\n- {{bureau3}}: {{acctNum3}}\n\nInconsistent account numbers make it impossible to verify this is the same account. This violates FCRA § 1681e(b) accuracy requirements.',
    evidenceRequired: ['Credit reports showing different account numbers'],
    escalationPath: 'Direct dispute to furnisher and bureaus'
  },
  {
    methodNumber: 36,
    methodName: 'Duplicate Account Detection',
    category: 'account_identification',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 90,
    severity: 'critical',
    legalBasis: 'Duplicate reporting artificially damages credit scores.',
    demandLanguage: 'IMMEDIATE DELETION of duplicate entry',
    argumentTemplate: '**CRITICAL ERROR: DUPLICATE ACCOUNT DETECTED**\n\nThe same account appears to be reported multiple times:\n- Entry 1: {{entry1}}\n- Entry 2: {{entry2}}\n- Similarity Score: {{similarityScore}}%\n\nDuplicate reporting artificially inflates my debt-to-income ratio and damages my credit score. One of these entries must be deleted immediately under FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports showing duplicate entries'],
    escalationPath: 'CFPB complaint for duplicate reporting'
  }
];

// ============================================================================
// CATEGORY 6: LEGAL & PROCEDURAL METHODS (37-38)
// ============================================================================

const legalProceduralMethods: MethodTemplate[] = [
  {
    methodNumber: 37,
    methodName: 'FCRA Violation Pattern',
    category: 'legal_procedural',
    fcraViolation: '§ 1681i',
    deletionProbability: 85,
    severity: 'critical',
    legalBasis: 'Pattern of FCRA violations indicates willful noncompliance.',
    demandLanguage: 'IMMEDIATE DELETION due to pattern of violations',
    argumentTemplate: '**PATTERN OF FCRA VIOLATIONS DETECTED**\n\nThis account shows a pattern of FCRA violations:\n{{violationList}}\n\nThis pattern of violations indicates willful noncompliance under FCRA § 1681n, which provides for statutory damages of $100-$1,000 per violation plus punitive damages.\n\nI demand immediate deletion and preservation of all records for potential litigation.',
    evidenceRequired: ['Documentation of each violation', 'Dispute history'],
    escalationPath: 'CFPB complaint + consultation with FCRA attorney'
  },
  {
    methodNumber: 38,
    methodName: 'FDCPA Violation',
    category: 'legal_procedural',
    fcraViolation: 'FDCPA § 1692',
    deletionProbability: 80,
    severity: 'critical',
    legalBasis: 'FDCPA violations may invalidate the debt collection.',
    demandLanguage: 'CEASE collection and DELETE tradeline',
    argumentTemplate: '**FDCPA VIOLATION DETECTED**\n\nThis collection account shows FDCPA violations:\n{{fdcpaViolations}}\n\nThese violations of the Fair Debt Collection Practices Act may invalidate this collection. I demand immediate cessation of collection activities and deletion of this tradeline.\n\nI am preserving all records for potential litigation under FDCPA § 1692k.',
    evidenceRequired: ['Collection correspondence', 'Documentation of violations'],
    escalationPath: 'CFPB complaint + FTC complaint + FDCPA lawsuit'
  }
];

// ============================================================================
// CATEGORY 7: STATISTICAL & PATTERN METHODS (39-43)
// ============================================================================

const statisticalPatternMethods: MethodTemplate[] = [
  {
    methodNumber: 39,
    methodName: 'Statistical Outlier Detection',
    category: 'statistical_pattern',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'high',
    legalBasis: 'Statistically anomalous data suggests errors or manipulation.',
    demandLanguage: 'INVESTIGATE and CORRECT statistical anomaly',
    argumentTemplate: 'This account shows statistically anomalous data:\n- Metric: {{metric}}\n- Reported Value: {{reportedValue}}\n- Expected Range: {{expectedRange}}\n- Standard Deviations from Mean: {{stdDevs}}\n\nThis statistical anomaly suggests data errors or manipulation. The furnisher must investigate and correct under FCRA § 1681e(b).',
    evidenceRequired: ['Credit report data', 'Statistical analysis'],
    escalationPath: 'CFPB complaint with statistical evidence'
  },
  {
    methodNumber: 40,
    methodName: 'Cross-Bureau Conflict Score',
    category: 'statistical_pattern',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 85,
    severity: 'critical',
    legalBasis: 'High conflict scores indicate unverifiable information.',
    demandLanguage: 'DELETE due to high cross-bureau conflict score',
    argumentTemplate: '**HIGH CONFLICT SCORE DETECTED**\n\nThis account has a high cross-bureau conflict score:\n- Conflict Score: {{conflictScore}}/100\n- Fields in Conflict: {{conflictFields}}\n- Bureaus Compared: {{bureausCompared}}\n\nA conflict score above 50 indicates the information cannot be verified across bureaus. This tradeline must be deleted under FCRA § 1681e(b).',
    evidenceRequired: ['Credit reports from all bureaus', 'Conflict analysis'],
    escalationPath: 'CFPB complaint for unverifiable information'
  },
  {
    methodNumber: 41,
    methodName: 'Reporting Pattern Anomaly',
    category: 'statistical_pattern',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 68,
    severity: 'medium',
    legalBasis: 'Irregular reporting patterns suggest data quality issues.',
    demandLanguage: 'INVESTIGATE reporting pattern irregularities',
    argumentTemplate: 'This account shows irregular reporting patterns:\n- Pattern Type: {{patternType}}\n- Anomaly Details: {{anomalyDetails}}\n- Reporting Gaps: {{reportingGaps}}\n\nThese irregularities suggest data quality issues that violate FCRA § 1681s-2(a) furnisher accuracy requirements.',
    evidenceRequired: ['Historical credit reports', 'Reporting timeline analysis'],
    escalationPath: 'Direct dispute to furnisher'
  },
  {
    methodNumber: 42,
    methodName: 'Metro 2 Format Violation',
    category: 'statistical_pattern',
    fcraViolation: '§ 1681s-2(a)',
    deletionProbability: 75,
    severity: 'high',
    legalBasis: 'Metro 2 format compliance is required for accurate reporting.',
    demandLanguage: 'CORRECT Metro 2 format violations',
    argumentTemplate: 'This account shows Metro 2 format violations:\n{{formatViolations}}\n\nMetro 2 is the industry standard format for credit reporting. Format violations indicate systemic reporting failures that violate FCRA § 1681s-2(a).',
    evidenceRequired: ['Credit report raw data if available', 'Format analysis'],
    escalationPath: 'CFPB complaint for systemic reporting failures'
  },
  {
    methodNumber: 43,
    methodName: 'Aggregate Score Impact Analysis',
    category: 'statistical_pattern',
    fcraViolation: '§ 1681e(b)',
    deletionProbability: 72,
    severity: 'high',
    legalBasis: 'Disproportionate score impact may indicate inaccurate reporting.',
    demandLanguage: 'INVESTIGATE disproportionate score impact',
    argumentTemplate: 'This account has a disproportionate impact on my credit score:\n- Estimated Score Impact: {{scoreImpact}} points\n- Account Age: {{accountAge}}\n- Balance Ratio: {{balanceRatio}}\n- Expected Impact: {{expectedImpact}} points\n\nThe disproportionate score impact suggests inaccurate reporting that violates FCRA § 1681e(b).',
    evidenceRequired: ['Credit score analysis', 'Score simulation'],
    escalationPath: 'CFPB complaint with score impact analysis'
  }
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const ALL_METHOD_TEMPLATES: MethodTemplate[] = [
  ...dateTimelineMethods,
  ...balancePaymentMethods,
  ...creditorOwnershipMethods,
  ...statusClassificationMethods,
  ...accountIdentificationMethods,
  ...legalProceduralMethods,
  ...statisticalPatternMethods
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a specific method template by number
 */
export function getMethodTemplate(methodNumber: number): MethodTemplate | undefined {
  return ALL_METHOD_TEMPLATES.find(t => t.methodNumber === methodNumber);
}

/**
 * Get all templates for a specific category
 */
export function getTemplatesByCategory(category: string): MethodTemplate[] {
  return ALL_METHOD_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all templates by severity level
 */
export function getTemplatesBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): MethodTemplate[] {
  return ALL_METHOD_TEMPLATES.filter(t => t.severity === severity);
}

/**
 * Get templates sorted by deletion probability (highest first)
 */
export function getTemplatesByDeletionProbability(): MethodTemplate[] {
  return [...ALL_METHOD_TEMPLATES].sort((a, b) => b.deletionProbability - a.deletionProbability);
}

/**
 * Generate a method-specific section for a dispute letter
 */
export function generateMethodSection(
  template: MethodTemplate,
  variables: Record<string, string>
): string {
  let argument = template.argumentTemplate;
  
  // Replace all variables in the template
  for (const [key, value] of Object.entries(variables)) {
    argument = argument.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  
  return `
## Method #${template.methodNumber}: ${template.methodName}
**Severity:** ${template.severity.toUpperCase()} | **Deletion Probability:** ${template.deletionProbability}%
**FCRA Violation:** ${template.fcraViolation}

### Legal Basis
${template.legalBasis}

### Argument
${argument}

### Demand
${template.demandLanguage}

### Evidence Required
${template.evidenceRequired.map(e => `- ${e}`).join('\n')}

### Escalation Path
${template.escalationPath}
`;
}

/**
 * Generate a complete specialized dispute letter
 */
export function generateSpecializedLetter(
  methodNumber: number,
  userInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    email?: string;
    dob?: string;
    ssn4?: string;
  },
  bureau: 'transunion' | 'equifax' | 'experian',
  accountData: Record<string, string>
): string {
  const template = getMethodTemplate(methodNumber);
  if (!template) {
    throw new Error(`Method template ${methodNumber} not found`);
  }

  const bureauAddresses = {
    transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
    equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
    experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013'
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const methodSection = generateMethodSection(template, accountData);

  return `${userInfo.name}
${userInfo.address}
${userInfo.city}, ${userInfo.state} ${userInfo.zip}
${userInfo.phone ? `Phone: ${userInfo.phone}` : ''}
${userInfo.email ? `Email: ${userInfo.email}` : ''}

${currentDate}

${bureauAddresses[bureau]}

RE: FORMAL DISPUTE - Method #${template.methodNumber}: ${template.methodName}
${userInfo.dob ? `Date of Birth: ${userInfo.dob}` : ''}
${userInfo.ssn4 ? `SSN (Last 4): XXX-XX-${userInfo.ssn4}` : ''}

To Whom It May Concern:

I am writing to formally dispute inaccurate information on my credit report pursuant to my rights under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq.

This dispute is based on **${template.methodName}** (Detection Method #${template.methodNumber}), which has identified a ${template.severity.toUpperCase()} severity violation with a **${template.deletionProbability}% deletion probability** based on historical outcomes.

${methodSection}

---

## LEGAL NOTICE

Under FCRA § 1681i(a)(1)(A), you are required to conduct a reasonable investigation of this dispute within 30 days of receipt. Under § 1681i(a)(5)(A), you must provide me with written notice of the results of your investigation.

If you verify this information without conducting a proper investigation, you may be liable for:
- Actual damages under § 1681o
- Statutory damages of $100-$1,000 per violation under § 1681n
- Punitive damages under § 1681n
- Attorney's fees and costs

I demand that you:
1. ${template.demandLanguage}
2. Provide me with the name, address, and telephone number of any furnisher contacted
3. Provide copies of all documents used in your investigation
4. Send me an updated credit report showing the corrections

This letter serves as formal notice that I am preserving all evidence for potential litigation.

Sincerely,

_________________________
${userInfo.name}

Enclosures:
- Copy of government-issued ID
- Proof of address (utility bill)
- Credit report highlighting disputed item

SENT VIA CERTIFIED MAIL, RETURN RECEIPT REQUESTED
`;
}
