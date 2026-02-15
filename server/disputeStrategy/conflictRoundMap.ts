/**
 * Maps conflict types to dispute rounds.
 * Cross-bureau conflicts = HIGHEST success (75-85%) -> Round 1.
 * Internal logic errors (impossible timeline etc) = Round 1.
 * Within-bureau conflicts = Round 2. CFPB escalation = Round 3.
 */

import type { Conflict } from '../conflictDetector';

export const CONFLICT_TYPE_TO_ROUND: Record<string, 1 | 2 | 3> = {
  // Round 1 - Cross-bureau (STRONGEST) + internal logic errors
  cross_bureau_date: 1,
  balance: 1,
  contradictory_status: 1,
  inconsistent_chargeoff_dates: 1,
  impossible_timeline: 1,
  last_activity_predates_opened: 1,
  date_opened_equals_closed: 1,
  math_error_balance_exceeds_high_balance: 1,
  unverifiable_balance: 1,
  duplicate: 1,
  beyond_7_year: 1,
  missing_dates: 1,
  future_dated: 1,
  impossible_chargeoff_timeline: 1,
  payment_after_chargeoff: 1,
  zero_balance_negative: 1,
  medical_debt_under_500: 1,
  medical_debt_under_1_year: 1,
  paid_medical_collection: 1,
  medical_debt_insurance_pending: 1,
  hipaa_violation: 1,
  multiple_collectors: 1,
  creditor_name_inconsistencies: 1,

  // Round 2 - Internal conflicts within bureau
  're-aging': 2,
  opening_date_conflicts: 2,
  closed_account_activity: 2,
  inconsistent_delinquency: 2,
  account_age_exceeds_history: 2,
  balance_increase_post_chargeoff: 2,
  payment_history_mismatch: 2,
  status_correction: 2,
  incorrect_account_type: 2,
  account_number_conflicts: 2,
  same_number_different_debts: 2,
  lack_of_standing: 2,
  original_creditor_not_reporting: 2,
  inadequate_reinvestigation: 2,
  failure_to_provide_mov: 2,

  // Round 3 - CFPB escalation, identity, etc
  statute_of_limitations: 3,
  unverifiable_deficiency: 3,
  collection_exceeds_original: 3,
  mixed_files: 3,
  late_payments_after_payoff: 3,
  disputed_status_not_reflected: 3,

  // Metro2, identity, etc -> Round 2 or 3
  missing_metro2_fields: 2,
  invalid_account_status_code: 2,
  payment_rating_mismatch: 2,
  ssn_mismatch: 3,
  address_never_lived: 3,
  name_variation_suspicious: 3,
  dob_mismatch: 3,
  fraud_alert_ignored: 3,
  identity_theft_indicator: 3,
  authorized_user_misreported: 3,

  // Fallback
  date: 3,
  previously_disputed: 3,
  missing_documentation: 3,
  anomalous_utilization: 2,
  impossible_payment_patterns: 2,
  high_concentration_single_day: 3,
  synchronized_late_payments: 2,
  inquiry_without_purpose: 2,
  written_off_amount_conflicts: 2,
  compliance_condition_code_error: 2,
  ecoa_code_violation: 2,
  special_comment_conflict: 2,
  consumer_info_indicator_error: 2,
  account_type_code_mismatch: 2,
};

export function getRoundForConflict(conflict: Conflict): 1 | 2 | 3 {
  return CONFLICT_TYPE_TO_ROUND[conflict.type] ?? 3;
}

export function getSeverityForConflict(conflict: Conflict): number {
  switch (conflict.severity) {
    case 'critical': return 10;
    case 'high': return 8;
    case 'medium': return 6;
    default: return 5;
  }
}
