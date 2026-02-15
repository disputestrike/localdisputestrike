import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  /** Claude Hybrid status & cost - verify API is running */
  claudeStatus: publicProcedure.query(async () => {
    const { isClaudeAvailable } = await import("../claude");
    const { getSessionTotal, getRecordsByOperation } = await import("../claude/costTracker");
    const available = isClaudeAvailable();
    const total = getSessionTotal();
    const byOp = getRecordsByOperation();
    return {
      available: !!process.env.ANTHROPIC_API_KEY,
      useHybrid: process.env.USE_CLAUDE_HYBRID !== "false",
      totalCostUsd: total.totalCostUsd,
      totalCalls: total.totalCalls,
      byOperation: byOp,
    };
  }),

  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
