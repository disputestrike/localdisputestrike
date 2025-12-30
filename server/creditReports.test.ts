import { describe, expect, it } from "vitest";
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

  it("should upload credit report", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small test file (1x1 transparent PNG)
    const testFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const report = await caller.creditReports.upload({
      bureau: "transunion",
      fileData: testFileBase64,
      fileName: "test-report.png",
      mimeType: "image/png",
    });

    expect(report).toBeDefined();
    expect(report.bureau).toBe("transunion");
    expect(report.userId).toBe(ctx.user!.id);
    expect(report.fileUrl).toBeDefined();
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

  it("should generate dispute letters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a test account
    const account = await caller.negativeAccounts.create({
      accountName: "Test Account for Letter",
      balance: "1000",
    });

    // Generate letters (this will create dispute letters)
    const result = await caller.disputeLetters.generate({
      accountIds: [account.id],
      round: 1,
      userInfo: {
        name: "Test User",
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        zip: "12345",
      },
    });

    // The result should have a count and letters array
    expect(result).toBeDefined();
    expect(result.count).toBeDefined();
    expect(Array.isArray(result.letters)).toBe(true);
  });
});

describe("payments router", () => {
  it("should create payment intent", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const intent = await caller.payments.createIntent({
      tier: "diy_quick",
    });

    expect(intent).toBeDefined();
    expect(intent.amount).toBe(29);
    expect(intent.tier).toBe("diy_quick");
  });

  it("should list user payments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const payments = await caller.payments.list();
    
    expect(Array.isArray(payments)).toBe(true);
  });
});
