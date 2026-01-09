import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock db functions
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getCreditReportById: vi.fn().mockResolvedValue({
      id: 1,
      userId: 1,
      bureau: "transunion",
      fileUrl: "https://example.com/report.pdf",
      isParsed: true,
    }),
    updateCreditReportParsedData: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock creditReportParser
vi.mock("./creditReportParser", () => ({
  parseAndSaveReport: vi.fn().mockResolvedValue(undefined),
}));

function createAuthContext(userId = 1) {
  return {
    ctx: {
      user: { id: userId, name: "Test User", email: "test@example.com" },
    },
  };
}

describe("creditReports.reparse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should re-parse an existing credit report", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.creditReports.reparse({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Re-parsing started");
  });

  it("should reject re-parse for non-existent report", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Mock to return null for non-existent report
    const db = await import("./db");
    (db.getCreditReportById as any).mockResolvedValueOnce(null);

    await expect(caller.creditReports.reparse({ id: 999 })).rejects.toThrow(
      "Report not found or access denied"
    );
  });

  it("should reject re-parse for report owned by different user", async () => {
    const { ctx } = createAuthContext(2); // Different user
    const caller = appRouter.createCaller(ctx);

    // Report is owned by user 1, but we're user 2
    const db = await import("./db");
    (db.getCreditReportById as any).mockResolvedValueOnce({
      id: 1,
      userId: 1, // Different from ctx.user.id
      bureau: "transunion",
      fileUrl: "https://example.com/report.pdf",
      isParsed: true,
    });

    await expect(caller.creditReports.reparse({ id: 1 })).rejects.toThrow(
      "Report not found or access denied"
    );
  });
});
