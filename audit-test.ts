/**
 * Comprehensive Audit Test Script
 * Tests all critical user flows and API endpoints
 */

import { appRouter } from "./server/routers";
import type { TrpcContext } from "./server/_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 999,
    openId: "audit-test-user",
    email: "audit@test.com",
    name: "Audit Test User",
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

async function runAudit() {
  console.log("🔍 Starting Comprehensive Platform Audit...\n");

  const { ctx } = createTestContext();
  const caller = appRouter.createCaller(ctx);

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Auth Flow
  console.log("📋 Test 1: Authentication");
  try {
    const me = await caller.auth.me();
    if (me && me.id === 999) {
      console.log("✅ Auth.me works correctly");
      passedTests++;
    } else {
      console.log("❌ Auth.me failed");
      failedTests++;
    }
  } catch (error) {
    console.log("❌ Auth.me error:", error);
    failedTests++;
  }

  // Test 2: Credit Report Upload
  console.log("\n📋 Test 2: Credit Report Upload");
  try {
    const testFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const report = await caller.creditReports.upload({
      bureau: "transunion",
      fileData: testFileBase64,
      fileName: "audit-test.png",
      mimeType: "image/png",
    });

    if (report && report.bureau === "transunion" && report.fileUrl) {
      console.log("✅ Credit report upload works");
      passedTests++;
    } else {
      console.log("❌ Credit report upload failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ Credit report upload error:", error.message);
    failedTests++;
  }

  // Test 3: List Credit Reports
  console.log("\n📋 Test 3: List Credit Reports");
  try {
    const reports = await caller.creditReports.list();
    if (Array.isArray(reports)) {
      console.log(`✅ List credit reports works (found ${reports.length} reports)`);
      passedTests++;
    } else {
      console.log("❌ List credit reports failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ List credit reports error:", error.message);
    failedTests++;
  }

  // Test 4: Create Negative Account
  console.log("\n📋 Test 4: Create Negative Account");
  try {
    const account = await caller.negativeAccounts.create({
      accountName: "AUDIT TEST COLLECTION",
      accountNumber: "999999999",
      accountType: "Collection",
      balance: "5000",
      status: "Unpaid",
    });

    if (account && account.accountName === "AUDIT TEST COLLECTION") {
      console.log("✅ Create negative account works");
      passedTests++;
    } else {
      console.log("❌ Create negative account failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ Create negative account error:", error.message);
    failedTests++;
  }

  // Test 5: List Negative Accounts
  console.log("\n📋 Test 5: List Negative Accounts");
  try {
    const accounts = await caller.negativeAccounts.list();
    if (Array.isArray(accounts)) {
      console.log(`✅ List negative accounts works (found ${accounts.length} accounts)`);
      passedTests++;
    } else {
      console.log("❌ List negative accounts failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ List negative accounts error:", error.message);
    failedTests++;
  }

  // Test 6: Generate Dispute Letters
  console.log("\n📋 Test 6: Generate Dispute Letters");
  try {
    const accounts = await caller.negativeAccounts.list();
    if (accounts.length > 0) {
      const result = await caller.disputeLetters.generate({
        accountIds: [accounts[0]!.id],
        round: 1,
        userInfo: {
          name: "Audit Test User",
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          zip: "12345",
        },
      });

      if (result && result.count >= 0) {
        console.log(`✅ Generate dispute letters works (generated ${result.count} letters)`);
        passedTests++;
      } else {
        console.log("❌ Generate dispute letters failed");
        failedTests++;
      }
    } else {
      console.log("⚠️  Skipping (no accounts to dispute)");
    }
  } catch (error: any) {
    console.log("❌ Generate dispute letters error:", error.message);
    failedTests++;
  }

  // Test 7: List Dispute Letters
  console.log("\n📋 Test 7: List Dispute Letters");
  try {
    const letters = await caller.disputeLetters.list();
    if (Array.isArray(letters)) {
      console.log(`✅ List dispute letters works (found ${letters.length} letters)`);
      passedTests++;
    } else {
      console.log("❌ List dispute letters failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ List dispute letters error:", error.message);
    failedTests++;
  }

  // Test 8: Create Payment Intent
  console.log("\n📋 Test 8: Create Payment Intent");
  try {
    const intent = await caller.payments.createIntent({
      tier: "diy_quick",
    });

    if (intent && intent.amount === 29) {
      console.log("✅ Create payment intent works");
      passedTests++;
    } else {
      console.log("❌ Create payment intent failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ Create payment intent error:", error.message);
    failedTests++;
  }

  // Test 9: List Payments
  console.log("\n📋 Test 9: List Payments");
  try {
    const payments = await caller.payments.list();
    if (Array.isArray(payments)) {
      console.log(`✅ List payments works (found ${payments.length} payments)`);
      passedTests++;
    } else {
      console.log("❌ List payments failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ List payments error:", error.message);
    failedTests++;
  }

  // Test 10: Logout
  console.log("\n📋 Test 10: Logout");
  try {
    const result = await caller.auth.logout();
    if (result && result.success) {
      console.log("✅ Logout works");
      passedTests++;
    } else {
      console.log("❌ Logout failed");
      failedTests++;
    }
  } catch (error: any) {
    console.log("❌ Logout error:", error.message);
    failedTests++;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 AUDIT SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log("=".repeat(50));

  if (failedTests === 0) {
    console.log("\n🎉 ALL TESTS PASSED! Platform is working correctly!");
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Review errors above.`);
  }
}

runAudit().catch(console.error);
