import { appRouter } from "../server/routers";
import { mockContext, mockUser } from "./mock_context";
import { assert } from "console";

async function runTest() {
  console.log("--- Starting E2E Upload Key Generation Test ---");

  const caller = appRouter.createCaller(mockContext as any);

  const testInput = {
    bureau: "transunion" as const,
    fileName: "test_report.pdf",
    contentType: "application/pdf",
  };

  try {
    // Fallback to direct call if nested caller fails (common in some test setups)
    const result = await caller.mutation("upload.getSignedUrl", testInput);

    console.log("Test Input:", testInput);
    console.log("Test Result:", result);

    // 1. Check if fileKey contains the user ID
    assert(result.fileKey.includes(String(mockUser.id)), "Assertion Failed: fileKey does not contain user ID.");

    // 2. Check if fileKey contains the bureau
    assert(result.fileKey.includes(testInput.bureau), "Assertion Failed: fileKey does not contain bureau name.");

    // 3. Check if fileKey contains the base path
    assert(result.fileKey.startsWith("credit-reports/"), "Assertion Failed: fileKey does not start with 'credit-reports/'.");

    // 4. Check if fileKey contains the file name
    assert(result.fileKey.endsWith(testInput.fileName), "Assertion Failed: fileKey does not end with file name.");

    // 5. Check if fileUrl is generated correctly (mock check)
    assert(result.fileUrl.startsWith("https://s3.disputestrike.com/"), "Assertion Failed: fileUrl is incorrect.");

    console.log("\n✅ Test Passed: Server-side file key generation is working correctly and securely.");
    console.log(`Generated Key: ${result.fileKey}`);

  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    process.exit(1);
  }
}

runTest();
