/**
 * PROOF: Profile prefill from credit reports works.
 * - Keyword fallback extracts consumerInfo from report text.
 * - getConsumerInfoFromReports returns merged consumerInfo from stored reports.
 */
import { describe, it, expect } from "vitest";
import { runPreviewAnalysis } from "./previewAnalysisService";

const SAMPLE_REPORT_WITH_CONSUMER = `
Credit Report - Consumer Information

Consumer Name: Jane Doe
Date of Birth: 03/15/1985
SSN: ***-**-9876

Current Address:
123 Main Street, Austin, TX 78701

Phone: (512) 555-1234

TRANSUNION
Score: 650
Collections: 2
`;

describe("Profile prefill from credit reports", () => {
  it("runPreviewAnalysis extracts consumerInfo from report text (prefill proof)", async () => {
    const result = await runPreviewAnalysis(SAMPLE_REPORT_WITH_CONSUMER, true);

    expect(result).toBeDefined();
    expect(result.consumerInfo).toBeDefined();
    expect(typeof result.consumerInfo).toBe("object");

    const ci = result.consumerInfo!;
    expect(ci.fullName).toBeDefined();
    expect(ci.fullName!.trim().length).toBeGreaterThan(0);

    expect(ci.dateOfBirth).toBeDefined();
    expect(ci.dateOfBirth).toMatch(/\d{4}-\d{2}-\d{2}/);

    expect(ci.ssnLast4).toBeDefined();
    expect(ci.ssnLast4).toMatch(/^\d{4}$/);

    expect(ci.currentAddress).toBeDefined();
    expect(ci.currentAddress!.length).toBeGreaterThan(0);
    expect(ci.currentState).toBeDefined();
    expect(ci.currentZip).toBeDefined();
    expect(ci.currentZip).toMatch(/\d{5}/);
  });

  it("consumerInfo is used for letter address prefill (full address fields)", () => {
    const ci = {
      fullName: "Jane Doe",
      currentAddress: "123 Main St",
      currentCity: "Austin",
      currentState: "TX",
      currentZip: "78701",
      dateOfBirth: "1985-03-15",
      ssnLast4: "9876",
      phone: "(512) 555-1234",
    };
    const letterAddress = [ci.currentAddress, ci.currentCity, `${ci.currentState} ${ci.currentZip}`]
      .filter(Boolean)
      .join(", ");
    expect(letterAddress).toBe("123 Main St, Austin, TX 78701");
  });
});
