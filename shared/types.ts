/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

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
}
