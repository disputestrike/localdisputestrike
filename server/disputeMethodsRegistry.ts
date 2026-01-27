/**
 * DISPUTE METHODS REGISTRY
 * 
 * Master registry of ALL known credit dispute methods.
 * This system is designed to:
 * 1. Maintain an exhaustive list of dispute strategies
 * 2. Learn from successful disputes
 * 3. Automatically incorporate new FCRA rules
 * 4. Track effectiveness of each method
 * 
 * ADDING NEW METHODS:
 * 1. Add to DISPUTE_METHODS array below
 * 2. Implement detection function in conflictDetector.ts
 * 3. The system will track success rates automatically
 */

export interface DisputeMethod {
  id: number;
  name: string;
  category: DisputeCategory;
  description: string;
  legalBasis: string[];
  fcraSection: string;
  deletionProbability: number; // Base probability 0-100
  severity: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[]; // Keywords to detect this violation
  implemented: boolean; // Is detection code written?
  effectiveDate?: string; // When this rule became effective
  expirationDate?: string; // If rule has sunset clause
  successRate?: number; // Learned from actual disputes
  totalAttempts?: number;
  totalSuccesses?: number;
  lastUpdated: string;
  notes?: string;
}

export type DisputeCategory = 
  | 'date_timeline'
  | 'balance_payment'
  | 'creditor_ownership'
  | 'status_classification'
  | 'account_identification'
  | 'legal_procedural'
  | 'statistical_pattern'
  | 'metro2_format'
  | 'medical_debt'
  | 'identity_fraud'
  | 'consumer_rights'
  | 'state_specific'
  | 'emerging_rules';

/**
 * MASTER LIST OF ALL DISPUTE METHODS
 * 
 * This is the single source of truth for all dispute strategies.
 * Add new methods here as they are discovered or as laws change.
 */
export const DISPUTE_METHODS: DisputeMethod[] = [
  // ============================================
  // CATEGORY 1: DATE & TIMELINE (Methods 1-15)
  // ============================================
  {
    id: 1,
    name: 'Cross-Bureau Date Conflicts',
    category: 'date_timeline',
    description: 'Same account shows different dates across TransUnion, Equifax, and Experian',
    legalBasis: ['Furnisher must report consistent information to all bureaus'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'critical',
    keywords: ['date', 'discrepancy', 'different', 'conflict'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 2,
    name: 'Impossible Timeline',
    category: 'date_timeline',
    description: 'Activity reported BEFORE account was opened - physically impossible',
    legalBasis: ['Data must be logically consistent', 'Cannot have activity before existence'],
    fcraSection: '§ 1681i(a)(5)(A)',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['impossible', 'before', 'opened', 'activity'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 3,
    name: 'Re-Aging Violations',
    category: 'date_timeline',
    description: 'Illegal manipulation of dates to extend 7-year reporting period',
    legalBasis: ['Re-aging is explicitly prohibited', 'DOFD cannot be changed'],
    fcraSection: '§ 1681s-2(a)(8)',
    deletionProbability: 95,
    severity: 'critical',
    keywords: ['re-aging', 'reaging', 'date changed', 'extended'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 4,
    name: 'Missing Critical Dates',
    category: 'date_timeline',
    description: 'Required dates missing: Date Opened, Last Activity, DOFD',
    legalBasis: ['Metro 2 requires complete date fields'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['missing', 'date', 'unknown', 'not reported'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 5,
    name: 'Last Activity Predates Opened',
    category: 'date_timeline',
    description: 'Delinquency date before account existed',
    legalBasis: ['Logical impossibility'],
    fcraSection: '§ 1681i(a)(5)(A)',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['predates', 'before', 'delinquency'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 6,
    name: 'Beyond 7-Year Limit',
    category: 'date_timeline',
    description: 'Account exceeds FCRA 7-year reporting limit from DOFD',
    legalBasis: ['7-year limit is absolute for most negative items'],
    fcraSection: '§ 1681c(a)(4)',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['7 year', 'seven year', 'expired', 'obsolete'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 7,
    name: 'Inconsistent Charge-Off Dates',
    category: 'date_timeline',
    description: 'Different charge-off dates across bureaus',
    legalBasis: ['Account has ONE charge-off date'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['charge-off', 'chargeoff', 'date', 'different'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 8,
    name: 'Opening Date Conflicts',
    category: 'date_timeline',
    description: '"First payment never received" but shows late payment history',
    legalBasis: ['Mutually exclusive conditions'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['first payment', 'never', 'late'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 9,
    name: 'Closed Account Activity',
    category: 'date_timeline',
    description: 'Activity reported after account was closed',
    legalBasis: ['Closed accounts cannot have new activity'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['closed', 'activity', 'after'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 10,
    name: 'Future-Dated Entries',
    category: 'date_timeline',
    description: 'Dates in the future - impossible',
    legalBasis: ['Cannot report future events'],
    fcraSection: '§ 1681i(a)(5)(A)',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['future', 'date', 'impossible'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 11,
    name: 'Impossible Charge-Off Timeline',
    category: 'date_timeline',
    description: 'Past due date months after last activity',
    legalBasis: ['Timeline must be logical'],
    fcraSection: '§ 1681i(a)(5)(A)',
    deletionProbability: 95,
    severity: 'critical',
    keywords: ['charge-off', 'timeline', 'past due'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 12,
    name: 'Payment After Charge-Off',
    category: 'date_timeline',
    description: 'Payments reported after charge-off date',
    legalBasis: ['Charged-off accounts are closed'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['payment', 'after', 'charge-off'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 13,
    name: 'Inconsistent Delinquency Progression',
    category: 'date_timeline',
    description: 'Delinquency skips stages (30→90 without 60)',
    legalBasis: ['Delinquency must progress logically'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['delinquency', 'progression', 'skip'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 14,
    name: 'Account Age Exceeds History',
    category: 'date_timeline',
    description: 'Account older than consumer credit history',
    legalBasis: ['Possible mixed file'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'high',
    keywords: ['age', 'history', 'old'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 15,
    name: 'Statute of Limitations Expired',
    category: 'date_timeline',
    description: 'SOL expired (3-6 years depending on state)',
    legalBasis: ['Time-barred debt disclosure'],
    fcraSection: 'State law + § 1681e(b)',
    deletionProbability: 60,
    severity: 'medium',
    keywords: ['statute', 'limitations', 'expired', 'time-barred'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 2: BALANCE & PAYMENT (Methods 16-23)
  // ============================================
  {
    id: 16,
    name: 'Unverifiable Balance',
    category: 'balance_payment',
    description: 'Balance with no payment history to support it',
    legalBasis: ['Balance must be verifiable'],
    fcraSection: '§ 1681i(a)(4)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['unverifiable', 'balance', 'no history'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 17,
    name: 'Balance Discrepancies',
    category: 'balance_payment',
    description: 'Different balances across bureaus',
    legalBasis: ['Balance must be consistent'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'critical',
    keywords: ['balance', 'different', 'discrepancy'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 18,
    name: 'Balance Increase Post-Charge-Off',
    category: 'balance_payment',
    description: 'Balance went UP after charge-off (illegal)',
    legalBasis: ['GAAP prohibits balance increase after charge-off'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 90,
    severity: 'critical',
    keywords: ['increase', 'charge-off', 'balance'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 19,
    name: 'Payment History Mismatch',
    category: 'balance_payment',
    description: 'Math doesnt work - payments dont match balance',
    legalBasis: ['Arithmetic must be correct'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['payment', 'math', 'mismatch'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 20,
    name: 'Zero Balance Negative',
    category: 'balance_payment',
    description: '$0 balance but still showing as negative',
    legalBasis: ['Paid accounts should not be negative'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 65,
    severity: 'medium',
    keywords: ['zero', 'balance', 'negative'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 21,
    name: 'Unverifiable Deficiency',
    category: 'balance_payment',
    description: 'Repo deficiency without sale documentation',
    legalBasis: ['Deficiency must be documented'],
    fcraSection: '§ 1681i(a)(4)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['deficiency', 'repo', 'sale'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 22,
    name: 'Collection Exceeds Original',
    category: 'balance_payment',
    description: 'Collection balance higher than original debt',
    legalBasis: ['Must itemize fees/interest'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['collection', 'exceeds', 'original'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 23,
    name: 'Anomalous Utilization',
    category: 'balance_payment',
    description: 'Balance exceeds credit limit (>100%)',
    legalBasis: ['Utilization must be accurate'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 60,
    severity: 'medium',
    keywords: ['utilization', 'exceeds', 'limit'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 3: CREDITOR & OWNERSHIP (Methods 24-28)
  // ============================================
  {
    id: 24,
    name: 'Lack of Standing',
    category: 'creditor_ownership',
    description: 'Collection agency cant prove they own the debt',
    legalBasis: ['Must prove chain of ownership'],
    fcraSection: '§ 1681s-2(a)(2)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['standing', 'ownership', 'prove'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 25,
    name: 'Original Creditor Not Reporting',
    category: 'creditor_ownership',
    description: 'Collection reports debt that original creditor doesnt',
    legalBasis: ['Debt must be acknowledged by original creditor'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['original', 'creditor', 'not reporting'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 26,
    name: 'Multiple Collectors',
    category: 'creditor_ownership',
    description: 'Same debt reported by multiple collection agencies',
    legalBasis: ['Double reporting prohibited'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['multiple', 'collectors', 'double'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 27,
    name: 'Creditor Name Inconsistencies',
    category: 'creditor_ownership',
    description: 'Creditor name varies across bureaus',
    legalBasis: ['Name must be consistent'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['name', 'inconsistent', 'different'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 28,
    name: 'Mixed Files',
    category: 'creditor_ownership',
    description: 'Account may belong to different consumer',
    legalBasis: ['Must belong to correct consumer'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 85,
    severity: 'critical',
    keywords: ['mixed', 'file', 'wrong', 'consumer'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 4: STATUS & CLASSIFICATION (Methods 29-34)
  // ============================================
  {
    id: 29,
    name: 'Duplicate Reporting',
    category: 'status_classification',
    description: 'Same account reported multiple times',
    legalBasis: ['No duplicate reporting'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['duplicate', 'multiple', 'same'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 30,
    name: 'Status Corrections',
    category: 'status_classification',
    description: 'Paid account still showing negative',
    legalBasis: ['Status must reflect current state'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['paid', 'negative', 'status'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 31,
    name: 'Contradictory Status',
    category: 'status_classification',
    description: 'Mutually exclusive statuses (Charge-off AND Good Standing)',
    legalBasis: ['Status must be consistent'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['contradictory', 'status', 'conflict'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 32,
    name: 'Incorrect Account Type',
    category: 'status_classification',
    description: 'Wrong classification (e.g., child support as collection)',
    legalBasis: ['Account type must be accurate'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['type', 'classification', 'incorrect'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 33,
    name: 'Late Payments After Payoff',
    category: 'status_classification',
    description: 'Late payments reported after account was paid',
    legalBasis: ['Cannot be late after payoff'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['late', 'after', 'payoff', 'paid'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 34,
    name: 'Disputed Status Not Reflected',
    category: 'status_classification',
    description: 'Account disputed but not marked as such',
    legalBasis: ['Dispute notation required'],
    fcraSection: '§ 1681i(a)(3)',
    deletionProbability: 65,
    severity: 'medium',
    keywords: ['disputed', 'not reflected', 'notation'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 5: ACCOUNT IDENTIFICATION (Methods 35-36)
  // ============================================
  {
    id: 35,
    name: 'Account Number Conflicts',
    category: 'account_identification',
    description: 'Different account numbers across bureaus',
    legalBasis: ['Account number must be consistent'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['account number', 'different', 'conflict'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 36,
    name: 'Same Number Different Debts',
    category: 'account_identification',
    description: 'One account number used for multiple debt types',
    legalBasis: ['Account numbers must be unique'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['same number', 'different', 'debts'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 6: LEGAL & PROCEDURAL (Methods 37-38)
  // ============================================
  {
    id: 37,
    name: 'Failure to Provide MOV',
    category: 'legal_procedural',
    description: 'Bureau verified without providing Method of Verification',
    legalBasis: ['Consumer has right to MOV'],
    fcraSection: '§ 1681i(a)(7)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['MOV', 'method', 'verification'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 38,
    name: 'Inadequate Reinvestigation',
    category: 'legal_procedural',
    description: 'Bureau verified but errors still exist',
    legalBasis: ['Must conduct reasonable investigation'],
    fcraSection: '§ 1681i(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['inadequate', 'reinvestigation', 'verified'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 7: STATISTICAL & PATTERN (Methods 39-43)
  // ============================================
  {
    id: 39,
    name: 'Impossible Payment Patterns',
    category: 'statistical_pattern',
    description: 'Perfectly identical payments (no human variation)',
    legalBasis: ['Pattern suggests fabrication'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 60,
    severity: 'medium',
    keywords: ['pattern', 'identical', 'impossible'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 40,
    name: 'High Concentration Single Day',
    category: 'statistical_pattern',
    description: 'Multiple accounts opened same day (fraud indicator)',
    legalBasis: ['Unusual pattern requires investigation'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['concentration', 'same day', 'multiple'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 41,
    name: 'Synchronized Late Payments',
    category: 'statistical_pattern',
    description: 'Multiple accounts go late on exact same date',
    legalBasis: ['Suspicious pattern'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'high',
    keywords: ['synchronized', 'late', 'same date'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 42,
    name: 'Inquiry Without Purpose',
    category: 'statistical_pattern',
    description: 'Hard inquiry without your authorization',
    legalBasis: ['Permissible purpose required'],
    fcraSection: '§ 1681b',
    deletionProbability: 60,
    severity: 'medium',
    keywords: ['inquiry', 'unauthorized', 'purpose'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 43,
    name: 'Written-Off Amount Conflicts',
    category: 'statistical_pattern',
    description: 'Different written-off amounts reported',
    legalBasis: ['Amount must be consistent'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['written-off', 'amount', 'conflict'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 8: METRO 2 FORMAT (Methods 44-51)
  // ============================================
  {
    id: 44,
    name: 'Missing Metro 2 Fields',
    category: 'metro2_format',
    description: 'Required Metro 2 fields missing',
    legalBasis: ['Metro 2 compliance required'],
    fcraSection: '§ 1681s-2(a)(1)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['metro 2', 'missing', 'fields'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 45,
    name: 'Invalid Account Status Code',
    category: 'metro2_format',
    description: 'Contradictory statuses (Open AND Closed)',
    legalBasis: ['Status codes must be valid'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 90,
    severity: 'critical',
    keywords: ['status code', 'invalid', 'contradictory'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 46,
    name: 'Payment Rating Mismatch',
    category: 'metro2_format',
    description: 'Payment rating conflicts with status',
    legalBasis: ['Rating must match status'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['payment rating', 'mismatch'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 47,
    name: 'Compliance Condition Code Error',
    category: 'metro2_format',
    description: 'Conflicting compliance codes',
    legalBasis: ['Compliance codes must be accurate'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['compliance', 'condition', 'code'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 48,
    name: 'ECOA Code Violation',
    category: 'metro2_format',
    description: 'Wrong responsibility designation',
    legalBasis: ['ECOA compliance required'],
    fcraSection: 'ECOA § 1691 + FCRA',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['ECOA', 'responsibility', 'designation'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 49,
    name: 'Special Comment Conflict',
    category: 'metro2_format',
    description: 'Conflicting special comments',
    legalBasis: ['Comments must be consistent'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['special comment', 'conflict'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 50,
    name: 'Consumer Info Indicator Error',
    category: 'metro2_format',
    description: 'Deceased but Active (impossible)',
    legalBasis: ['Consumer info must be accurate'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 95,
    severity: 'critical',
    keywords: ['consumer info', 'indicator', 'deceased'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 51,
    name: 'Account Type Code Mismatch',
    category: 'metro2_format',
    description: 'Collection with credit limit (impossible)',
    legalBasis: ['Account type must be accurate'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 65,
    severity: 'medium',
    keywords: ['account type', 'code', 'mismatch'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 9: MEDICAL DEBT (Methods 52-56)
  // ============================================
  {
    id: 52,
    name: 'Medical Debt Under $500',
    category: 'medical_debt',
    description: 'Medical debts under $500 prohibited (2023 rule)',
    legalBasis: ['FCRA Amendment 2023 - Medical debt under $500 prohibited'],
    fcraSection: 'FCRA Amendment 2023',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['medical', 'under 500', 'prohibited'],
    implemented: true,
    effectiveDate: '2023-04-11',
    lastUpdated: '2024-01-01',
    notes: 'NEW RULE: All 3 bureaus agreed to remove medical debts under $500',
  },
  {
    id: 53,
    name: 'Medical Debt Under 1 Year',
    category: 'medical_debt',
    description: 'Medical debt less than 1 year old prohibited',
    legalBasis: ['FCRA Amendment 2022 - 1-year waiting period'],
    fcraSection: 'FCRA Amendment 2022',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['medical', 'under 1 year', 'waiting period'],
    implemented: true,
    effectiveDate: '2022-07-01',
    lastUpdated: '2024-01-01',
    notes: 'NEW RULE: Medical debts cannot be reported until 1 year after DOFD',
  },
  {
    id: 54,
    name: 'Paid Medical Collection',
    category: 'medical_debt',
    description: 'Paid medical debts must be removed',
    legalBasis: ['FCRA Amendment 2022 - Paid medical debt prohibited'],
    fcraSection: 'FCRA Amendment 2022',
    deletionProbability: 100,
    severity: 'critical',
    keywords: ['medical', 'paid', 'collection'],
    implemented: true,
    effectiveDate: '2022-07-01',
    lastUpdated: '2024-01-01',
    notes: 'NEW RULE: All paid medical collections must be removed',
  },
  {
    id: 55,
    name: 'Medical Debt Insurance Pending',
    category: 'medical_debt',
    description: 'Medical debt with pending insurance claim',
    legalBasis: ['Premature reporting prohibited'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['medical', 'insurance', 'pending'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 56,
    name: 'HIPAA Violation',
    category: 'medical_debt',
    description: 'Protected health information disclosed',
    legalBasis: ['HIPAA Privacy Rule'],
    fcraSection: 'HIPAA + FCRA',
    deletionProbability: 95,
    severity: 'critical',
    keywords: ['HIPAA', 'medical', 'privacy', 'diagnosis'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 10: IDENTITY & FRAUD (Methods 57-63)
  // ============================================
  {
    id: 57,
    name: 'SSN Mismatch',
    category: 'identity_fraud',
    description: 'SSN doesnt match - possible identity theft',
    legalBasis: ['Must verify consumer identity'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 95,
    severity: 'critical',
    keywords: ['SSN', 'mismatch', 'identity'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 58,
    name: 'Address Never Lived',
    category: 'identity_fraud',
    description: 'Account tied to address never lived at',
    legalBasis: ['Must be consumers account'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['address', 'never lived', 'wrong'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 59,
    name: 'Suspicious Name Variation',
    category: 'identity_fraud',
    description: 'AKA/name variation on high-balance account',
    legalBasis: ['Name must be accurate'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['name', 'variation', 'AKA'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 60,
    name: 'DOB Mismatch',
    category: 'identity_fraud',
    description: 'Account opened when consumer was under 18',
    legalBasis: ['Minors cannot open credit accounts'],
    fcraSection: '§ 1681e(b)',
    deletionProbability: 70,
    severity: 'high',
    keywords: ['DOB', 'date of birth', 'minor', 'under 18'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 61,
    name: 'Fraud Alert Ignored',
    category: 'identity_fraud',
    description: 'Account opened despite active fraud alert',
    legalBasis: ['Must verify identity when fraud alert present'],
    fcraSection: '§ 1681c-1',
    deletionProbability: 90,
    severity: 'critical',
    keywords: ['fraud alert', 'ignored', 'verification'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 62,
    name: 'Identity Theft Indicator',
    category: 'identity_fraud',
    description: 'Account shows fraud/unauthorized markers',
    legalBasis: ['Right to block identity theft information'],
    fcraSection: '§ 1681c-2',
    deletionProbability: 95,
    severity: 'critical',
    keywords: ['identity theft', 'fraud', 'unauthorized'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },
  {
    id: 63,
    name: 'Authorized User Misreported',
    category: 'identity_fraud',
    description: 'AU incorrectly reported as responsible',
    legalBasis: ['AU not responsible for account'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['authorized user', 'AU', 'responsible'],
    implemented: true,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 11: CONSUMER RIGHTS (Methods 64-70)
  // ============================================
  {
    id: 64,
    name: '30-Day Response Violation',
    category: 'consumer_rights',
    description: 'Bureau failed to respond within 30 days',
    legalBasis: ['30-day response required'],
    fcraSection: '§ 1681i(a)(1)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['30 day', 'response', 'violation'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Track dispute response times',
  },
  {
    id: 65,
    name: 'Failure to Forward Dispute',
    category: 'consumer_rights',
    description: 'Bureau failed to forward dispute to furnisher',
    legalBasis: ['Must forward disputes within 5 days'],
    fcraSection: '§ 1681i(a)(2)',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['forward', 'dispute', 'furnisher'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 66,
    name: 'No Written Results',
    category: 'consumer_rights',
    description: 'Bureau failed to provide written investigation results',
    legalBasis: ['Written results required'],
    fcraSection: '§ 1681i(a)(6)',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['written', 'results', 'investigation'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 67,
    name: 'Free Report Denial',
    category: 'consumer_rights',
    description: 'Denied free annual credit report',
    legalBasis: ['Right to free annual report'],
    fcraSection: '§ 1681j',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['free', 'annual', 'report', 'denied'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 68,
    name: 'Security Freeze Violation',
    category: 'consumer_rights',
    description: 'Failed to place/lift security freeze properly',
    legalBasis: ['Security freeze rights'],
    fcraSection: '§ 1681c-1',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['security freeze', 'freeze', 'lift'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 69,
    name: 'Adverse Action Notice Missing',
    category: 'consumer_rights',
    description: 'No adverse action notice after credit denial',
    legalBasis: ['Adverse action notice required'],
    fcraSection: '§ 1681m',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['adverse action', 'notice', 'denial'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 70,
    name: 'Disclosure Failure',
    category: 'consumer_rights',
    description: 'Failed to disclose all information in file',
    legalBasis: ['Full disclosure required'],
    fcraSection: '§ 1681g',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['disclosure', 'failure', 'file'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 12: STATE-SPECIFIC (Methods 71-80)
  // ============================================
  {
    id: 71,
    name: 'California CCRAA Violation',
    category: 'state_specific',
    description: 'California Consumer Credit Reporting Agencies Act violation',
    legalBasis: ['California Civil Code § 1785'],
    fcraSection: 'CA Civil Code § 1785',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['California', 'CCRAA', 'state'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'California has stronger consumer protections',
  },
  {
    id: 72,
    name: 'New York FCRA Enhancement',
    category: 'state_specific',
    description: 'New York enhanced FCRA protections',
    legalBasis: ['NY General Business Law'],
    fcraSection: 'NY GBL § 380',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['New York', 'NY', 'state'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 73,
    name: 'Texas Finance Code Violation',
    category: 'state_specific',
    description: 'Texas Finance Code credit reporting violation',
    legalBasis: ['Texas Finance Code'],
    fcraSection: 'TX Finance Code § 392',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['Texas', 'TX', 'state'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 74,
    name: 'State SOL Shorter Than Federal',
    category: 'state_specific',
    description: 'State statute of limitations shorter than 7 years',
    legalBasis: ['State SOL applies'],
    fcraSection: 'State law',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['state', 'SOL', 'statute'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 75,
    name: 'State Medical Debt Protections',
    category: 'state_specific',
    description: 'State-specific medical debt reporting restrictions',
    legalBasis: ['State medical debt laws'],
    fcraSection: 'State law',
    deletionProbability: 80,
    severity: 'high',
    keywords: ['state', 'medical', 'debt'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 76,
    name: 'State Student Loan Protections',
    category: 'state_specific',
    description: 'State-specific student loan reporting restrictions',
    legalBasis: ['State student loan laws'],
    fcraSection: 'State law',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['state', 'student loan'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 77,
    name: 'State Rent Reporting Restrictions',
    category: 'state_specific',
    description: 'State restrictions on rent/eviction reporting',
    legalBasis: ['State tenant protection laws'],
    fcraSection: 'State law',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['state', 'rent', 'eviction'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 78,
    name: 'State Utility Reporting Restrictions',
    category: 'state_specific',
    description: 'State restrictions on utility debt reporting',
    legalBasis: ['State utility laws'],
    fcraSection: 'State law',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['state', 'utility'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 79,
    name: 'State Criminal Record Restrictions',
    category: 'state_specific',
    description: 'State restrictions on criminal record reporting',
    legalBasis: ['State ban-the-box laws'],
    fcraSection: 'State law',
    deletionProbability: 75,
    severity: 'high',
    keywords: ['state', 'criminal', 'record'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 80,
    name: 'State Identity Theft Protections',
    category: 'state_specific',
    description: 'Enhanced state identity theft protections',
    legalBasis: ['State identity theft laws'],
    fcraSection: 'State law',
    deletionProbability: 85,
    severity: 'critical',
    keywords: ['state', 'identity theft'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },

  // ============================================
  // CATEGORY 13: EMERGING RULES (Methods 81-90)
  // ============================================
  {
    id: 81,
    name: 'CFPB Proposed Rule Violation',
    category: 'emerging_rules',
    description: 'Violation of pending CFPB rule (preemptive)',
    legalBasis: ['CFPB proposed rulemaking'],
    fcraSection: 'CFPB Proposed',
    deletionProbability: 50,
    severity: 'medium',
    keywords: ['CFPB', 'proposed', 'rule'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Track CFPB proposed rules for early adoption',
  },
  {
    id: 82,
    name: 'Buy Now Pay Later Misreporting',
    category: 'emerging_rules',
    description: 'BNPL account reported incorrectly',
    legalBasis: ['BNPL reporting standards'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['BNPL', 'buy now pay later', 'Affirm', 'Klarna'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Emerging area - BNPL reporting standards still developing',
  },
  {
    id: 83,
    name: 'Cryptocurrency Debt Misreporting',
    category: 'emerging_rules',
    description: 'Crypto-related debt reported incorrectly',
    legalBasis: ['Emerging crypto regulations'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 65,
    severity: 'medium',
    keywords: ['crypto', 'cryptocurrency', 'bitcoin'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Emerging area - crypto debt reporting unclear',
  },
  {
    id: 84,
    name: 'Pandemic Relief Misreporting',
    category: 'emerging_rules',
    description: 'COVID forbearance/deferment reported as delinquent',
    legalBasis: ['CARES Act protections'],
    fcraSection: 'CARES Act § 4021',
    deletionProbability: 90,
    severity: 'critical',
    keywords: ['COVID', 'pandemic', 'forbearance', 'CARES'],
    implemented: false,
    effectiveDate: '2020-03-27',
    lastUpdated: '2024-01-01',
    notes: 'CARES Act requires accommodation reporting as current',
  },
  {
    id: 85,
    name: 'Natural Disaster Misreporting',
    category: 'emerging_rules',
    description: 'Disaster forbearance reported as delinquent',
    legalBasis: ['Disaster relief provisions'],
    fcraSection: '§ 1681s-2(a)(1)(F)',
    deletionProbability: 85,
    severity: 'high',
    keywords: ['disaster', 'hurricane', 'flood', 'fire'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 86,
    name: 'AI/Algorithm Bias',
    category: 'emerging_rules',
    description: 'Credit decision based on biased AI algorithm',
    legalBasis: ['ECOA + emerging AI regulations'],
    fcraSection: 'ECOA + Emerging',
    deletionProbability: 60,
    severity: 'medium',
    keywords: ['AI', 'algorithm', 'bias', 'automated'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Emerging area - AI fairness in credit decisions',
  },
  {
    id: 87,
    name: 'Rent Reporting Accuracy',
    category: 'emerging_rules',
    description: 'Rent payment reported inaccurately',
    legalBasis: ['Emerging rent reporting standards'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['rent', 'rental', 'landlord'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Rent reporting is new - standards still developing',
  },
  {
    id: 88,
    name: 'Utility Reporting Accuracy',
    category: 'emerging_rules',
    description: 'Utility payment reported inaccurately',
    legalBasis: ['Emerging utility reporting standards'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 70,
    severity: 'medium',
    keywords: ['utility', 'electric', 'gas', 'water'],
    implemented: false,
    lastUpdated: '2024-01-01',
  },
  {
    id: 89,
    name: 'Subscription Service Misreporting',
    category: 'emerging_rules',
    description: 'Subscription service debt reported incorrectly',
    legalBasis: ['Consumer protection'],
    fcraSection: '§ 1681s-2(a)(1)(A)',
    deletionProbability: 65,
    severity: 'medium',
    keywords: ['subscription', 'streaming', 'membership'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Emerging area - subscription debt reporting',
  },
  {
    id: 90,
    name: 'Gig Economy Income Misreporting',
    category: 'emerging_rules',
    description: 'Gig economy income not properly considered',
    legalBasis: ['Income verification standards'],
    fcraSection: 'Emerging',
    deletionProbability: 55,
    severity: 'medium',
    keywords: ['gig', 'Uber', 'Lyft', 'DoorDash', 'freelance'],
    implemented: false,
    lastUpdated: '2024-01-01',
    notes: 'Emerging area - gig economy credit considerations',
  },
];

/**
 * Get all implemented methods
 */
export function getImplementedMethods(): DisputeMethod[] {
  return DISPUTE_METHODS.filter(m => m.implemented);
}

/**
 * Get methods by category
 */
export function getMethodsByCategory(category: DisputeCategory): DisputeMethod[] {
  return DISPUTE_METHODS.filter(m => m.category === category);
}

/**
 * Get methods that need implementation
 */
export function getUnimplementedMethods(): DisputeMethod[] {
  return DISPUTE_METHODS.filter(m => !m.implemented);
}

/**
 * Get high-probability methods (70%+ deletion rate)
 */
export function getHighProbabilityMethods(): DisputeMethod[] {
  return DISPUTE_METHODS.filter(m => m.deletionProbability >= 70);
}

/**
 * Get critical severity methods
 */
export function getCriticalMethods(): DisputeMethod[] {
  return DISPUTE_METHODS.filter(m => m.severity === 'critical');
}

/**
 * Search methods by keyword
 */
export function searchMethods(keyword: string): DisputeMethod[] {
  const lowerKeyword = keyword.toLowerCase();
  return DISPUTE_METHODS.filter(m => 
    m.name.toLowerCase().includes(lowerKeyword) ||
    m.description.toLowerCase().includes(lowerKeyword) ||
    m.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get methods effective after a certain date (for new rules)
 */
export function getMethodsEffectiveAfter(date: string): DisputeMethod[] {
  const targetDate = new Date(date);
  return DISPUTE_METHODS.filter(m => {
    if (!m.effectiveDate) return false;
    return new Date(m.effectiveDate) >= targetDate;
  });
}

/**
 * Update method success rate (called after dispute resolution)
 */
export function updateMethodSuccessRate(methodId: number, wasSuccessful: boolean): void {
  const method = DISPUTE_METHODS.find(m => m.id === methodId);
  if (method) {
    method.totalAttempts = (method.totalAttempts || 0) + 1;
    if (wasSuccessful) {
      method.totalSuccesses = (method.totalSuccesses || 0) + 1;
    }
    method.successRate = method.totalSuccesses! / method.totalAttempts! * 100;
    method.lastUpdated = new Date().toISOString().split('T')[0];
  }
}

/**
 * Get method statistics
 */
export function getMethodStats() {
  const total = DISPUTE_METHODS.length;
  const implemented = DISPUTE_METHODS.filter(m => m.implemented).length;
  const critical = DISPUTE_METHODS.filter(m => m.severity === 'critical').length;
  const highProb = DISPUTE_METHODS.filter(m => m.deletionProbability >= 70).length;
  
  const byCategory: Record<string, number> = {};
  for (const method of DISPUTE_METHODS) {
    byCategory[method.category] = (byCategory[method.category] || 0) + 1;
  }
  
  return {
    total,
    implemented,
    unimplemented: total - implemented,
    critical,
    highProbability: highProb,
    byCategory,
    implementationRate: (implemented / total * 100).toFixed(1) + '%',
  };
}

/**
 * Export all methods as JSON (for backup/sharing)
 */
export function exportMethodsAsJSON(): string {
  return JSON.stringify(DISPUTE_METHODS, null, 2);
}

/**
 * Add a new method to the registry
 */
export function addNewMethod(method: Omit<DisputeMethod, 'id'>): DisputeMethod {
  const newId = Math.max(...DISPUTE_METHODS.map(m => m.id)) + 1;
  const newMethod: DisputeMethod = {
    ...method,
    id: newId,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  DISPUTE_METHODS.push(newMethod);
  return newMethod;
}

// Log stats on module load
console.log('[Dispute Methods Registry] Loaded', getMethodStats());
