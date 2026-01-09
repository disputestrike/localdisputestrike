import { describe, it, expect } from "vitest";
import { detectConflicts, generateMultiAngleArgument } from "./conflictDetector";
import type { ParsedAccount } from "./creditReportParser";

describe("Comprehensive Violation Detection", () => {
  describe("detectConflicts", () => {
    it("should detect impossible timeline (activity before account opened)", () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: "PROCOLLECT INC",
          accountNumber: "12345",
          balance: 5614,
          status: "Collection",
          bureau: "experian",
          dateOpened: new Date("2025-02-20"),
          lastActivity: new Date("2025-02-01"), // 19 days BEFORE opened
          accountType: "Collection",
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should detect impossible timeline
      const impossibleTimeline = result.conflicts.find(c => c.type === "impossible_timeline");
      expect(impossibleTimeline).toBeDefined();
      expect(impossibleTimeline?.severity).toBe("critical");
      expect(impossibleTimeline?.deletionProbability).toBe(100);
    });

    it("should detect balance discrepancy across bureaus", () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: "CAPITAL ONE",
          accountNumber: "12345",
          balance: 5000,
          status: "Charge Off",
          bureau: "experian",
          dateOpened: new Date("2020-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Credit Card",
        },
        {
          accountName: "CAPITAL ONE",
          accountNumber: "12345",
          balance: 3500, // $1500 difference
          status: "Charge Off",
          bureau: "transunion",
          dateOpened: new Date("2020-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Credit Card",
        },
      ];

      const result = detectConflicts(accounts);
      
      const balanceConflict = result.conflicts.find(c => c.type === "balance");
      expect(balanceConflict).toBeDefined();
      expect(balanceConflict?.severity).toBe("critical"); // >$1000 difference
    });

    it("should detect status conflicts across bureaus", () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: "PROCOLLECT",
          accountNumber: "12345",
          balance: 5614,
          status: "Charge Off",
          bureau: "experian",
          dateOpened: new Date("2024-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Collection",
        },
        {
          accountName: "PROCOLLECT",
          accountNumber: "12345",
          balance: 5614,
          status: "Open", // Contradicts Charge Off
          bureau: "equifax",
          dateOpened: new Date("2024-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Collection",
        },
      ];

      const result = detectConflicts(accounts);
      
      const statusConflict = result.conflicts.find(c => c.type === "status");
      expect(statusConflict).toBeDefined();
      expect(statusConflict?.severity).toBe("critical");
    });

    it("should detect unverifiable balance on collections (multi-bureau)", () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: "MIDLAND CREDIT",
          accountNumber: "12345",
          balance: 2500,
          status: "Collection",
          bureau: "experian",
          dateOpened: new Date("2024-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Collection",
        },
        {
          accountName: "MIDLAND CREDIT",
          accountNumber: "12345",
          balance: 2500,
          status: "Collection",
          bureau: "transunion",
          dateOpened: new Date("2024-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Collection",
        },
      ];

      const result = detectConflicts(accounts);
      
      const unverifiable = result.conflicts.find(c => c.type === "unverifiable_balance");
      expect(unverifiable).toBeDefined();
      expect(unverifiable?.severity).toBe("high");
    });

    it("should detect missing documentation on collections", () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: "PORTFOLIO RECOVERY",
          accountNumber: "12345",
          balance: 3000,
          status: "Collection",
          bureau: "transunion",
          dateOpened: new Date("2024-01-01"),
          lastActivity: new Date("2024-06-01"),
          accountType: "Collection",
        },
      ];

      const result = detectConflicts(accounts);
      
      const missingDocs = result.conflicts.find(c => c.type === "missing_documentation");
      expect(missingDocs).toBeDefined();
      expect(missingDocs?.severity).toBe("high");
    });

    it("should stack multiple violations for same account", () => {
      const accounts: ParsedAccount[] = [
        {
          accountName: "PROCOLLECT INC",
          accountNumber: "12345",
          balance: 5614,
          status: "Collection",
          bureau: "experian",
          dateOpened: new Date("2025-02-20"),
          lastActivity: new Date("2025-02-01"), // Impossible timeline
          accountType: "Collection",
        },
        {
          accountName: "PROCOLLECT INC",
          accountNumber: "12345",
          balance: 4000, // Different balance
          status: "Open", // Different status
          bureau: "transunion",
          dateOpened: new Date("2024-12-01"),
          lastActivity: new Date("2024-12-01"),
          accountType: "Collection",
        },
      ];

      const result = detectConflicts(accounts);
      
      // Should have multiple violations
      expect(result.totalConflicts).toBeGreaterThanOrEqual(3);
      expect(result.criticalConflicts).toBeGreaterThanOrEqual(1);
    });
  });

  describe("generateMultiAngleArgument", () => {
    it("should generate comprehensive argument with severity grouping", () => {
      const conflicts = [
        {
          type: "impossible_timeline" as const,
          severity: "critical" as const,
          accountName: "PROCOLLECT",
          description: "Activity 19 days before account opened",
          bureaus: ["experian"],
          details: {},
          fcraViolation: "§ 1681i(a)(5)(A)",
          deletionProbability: 100,
          argument: "This is physically impossible and requires immediate deletion.",
        },
        {
          type: "balance" as const,
          severity: "critical" as const,
          accountName: "PROCOLLECT",
          description: "$1,614 balance discrepancy",
          bureaus: ["experian", "transunion"],
          details: {},
          fcraViolation: "§ 1681s-2(a)(1)(A)",
          deletionProbability: 90,
          argument: "A debt cannot be both $5,614 AND $4,000.",
        },
        {
          type: "unverifiable_balance" as const,
          severity: "high" as const,
          accountName: "PROCOLLECT",
          description: "No payment history available",
          bureaus: ["experian"],
          details: {},
          fcraViolation: "§ 1681i(a)(4)",
          deletionProbability: 75,
          argument: "Balance cannot be verified without payment history.",
        },
      ];

      const argument = generateMultiAngleArgument("PROCOLLECT", conflicts);
      
      expect(argument).toContain("CRITICAL ERRORS");
      expect(argument).toContain("HIGH PRIORITY VIOLATIONS");
      expect(argument).toContain("3 documented violation");
    });

    it("should return empty string for no conflicts", () => {
      const argument = generateMultiAngleArgument("TEST", []);
      expect(argument).toBe("");
    });
  });
});
