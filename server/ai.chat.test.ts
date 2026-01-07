import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("AI Chat", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    // Mock authenticated user context
    const mockContext: TrpcContext = {
      user: {
        id: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        openId: "test-openid",
        createdAt: Date.now(),
      },
    };

    caller = appRouter.createCaller(mockContext);
  });

  it("should respond to credit dispute questions", async () => {
    const result = await caller.ai.chat({
      message: "What is FCRA?",
      conversationHistory: [],
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for LLM calls

  it("should maintain conversation context", async () => {
    const result = await caller.ai.chat({
      message: "How do I dispute a negative account?",
      conversationHistory: [
        {
          role: "user",
          content: "What is FCRA?",
        },
        {
          role: "assistant",
          content: "FCRA stands for Fair Credit Reporting Act...",
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(typeof result.response).toBe("string");
  }, 30000);

  it("should handle empty conversation history", async () => {
    const result = await caller.ai.chat({
      message: "Tell me about cross-bureau conflicts",
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(typeof result.response).toBe("string");
  }, 30000);
});
