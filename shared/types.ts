/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/** Partial account preview (name, last4, balance, status – no full account# or addresses). */
export interface AccountPreview {
  name: string;
  last4: string;
  balance: string;
  status: string;
  /** e.g. "Unpaid Balance" or "Past Due" */
  amountType?: string;
}

/** Preview / upload-and-analyze result (PreviewResults page contract). */
export interface LightAnalysisResult {
  totalViolations: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  categoryBreakdown: {
    collections: number;
    latePayments: number;
    chargeOffs: number;
    judgments: number;
    other: number;
  };
  /** Optional partial preview: account name, last 4, balance, status. Up to 10. */
  accountPreviews?: AccountPreview[];
  /** Optional. Current credit score from report (e.g. 587). */
  creditScore?: number;
}
