import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("creditReports router", () => {
  it("should list credit reports for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const reports = await caller.creditReports.list();
    
    expect(Array.isArray(reports)).toBe(true);
  });

  // Skip upload test - requires S3 integration
  it.skip("should upload credit report", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const report = await caller.creditReports.upload({
      bureau: "transunion",
      fileUrl: "https://example.com/test.pdf",
      fileKey: "test-key-123",
      fileName: "test-report.pdf",
      mimeType: "application/pdf",
    });

    expect(report).toBeDefined();
    expect(report.bureau).toBe("transunion");
  });
});

describe("negativeAccounts router", () => {
  it("should list negative accounts for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const accounts = await caller.negativeAccounts.list();
    
    expect(Array.isArray(accounts)).toBe(true);
  });

  it("should create negative account", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const account = await caller.negativeAccounts.create({
      accountName: "Test Collection Account",
      accountNumber: "123456789",
      accountType: "Collection",
      balance: "5000",
      status: "Unpaid",
      bureau: "transunion", // Required field
    });

    expect(account).toBeDefined();
    expect(account.accountName).toBe("Test Collection Account");
    expect(account.userId).toBe(ctx.user!.id);
  });
});

describe("disputeLetters router", () => {
  it("should list dispute letters for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const letters = await caller.disputeLetters.list();
    
    expect(Array.isArray(letters)).toBe(true);
  });

  // Skip generate test - requires paid procedure and AI integration
  it.skip("should generate dispute letters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a test account with all required fields
    const account = await caller.negativeAccounts.create({
      accountName: "Test Account for Letter",
      accountNumber: "TEST123",
      accountType: "Collection",
      status: "Unpaid",
      balance: "1000",
      bureau: "transunion",
    });

    // Generate letters with correct input schema
    const result = await caller.disputeLetters.generate({
      currentAddress: "123 Test St, Test City, TS 12345",
      bureaus: ["transunion"],
      accountIds: [account.id],
    });

    expect(result).toBeDefined();
  });
});

describe("payments router", () => {
  // Skip payment tests - requires Stripe integration
  it.skip("should create payment intent", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const intent = await caller.payments.createCheckoutSession({
      tier: "diy_quick",
    });

    expect(intent).toBeDefined();
  });

  it("should list user payments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const payments = await caller.payments.list();
    
    expect(Array.isArray(payments)).toBe(true);
  });
});
