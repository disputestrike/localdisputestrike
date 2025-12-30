import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

// ============================================================================
// CREDIT REPORTS ROUTER
// ============================================================================

const creditReportsRouter = router({
  // Upload credit report
  upload: protectedProcedure
    .input(z.object({
      bureau: z.enum(["transunion", "equifax", "experian"]),
      fileData: z.string(), // Base64 encoded file
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Upload file to S3
      const buffer = Buffer.from(input.fileData, 'base64');
      const fileKey = `credit-reports/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      
      // Save to database
      const report = await db.createCreditReport({
        userId: ctx.user.id,
        bureau: input.bureau,
        fileUrl: url,
        fileKey,
        fileName: input.fileName,
        isParsed: false,
      });
      
      return report;
    }),

  // Get user's credit reports
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getCreditReportsByUserId(ctx.user.id);
    }),

  // Get single credit report
  get: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ ctx, input }) => {
      const report = await db.getCreditReportById(input.reportId);
      if (!report || report.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credit report not found" });
      }
      return report;
    }),
});

// ============================================================================
// NEGATIVE ACCOUNTS ROUTER
// ============================================================================

const negativeAccountsRouter = router({
  // Create negative account (manual or from parsing)
  create: protectedProcedure
    .input(z.object({
      accountName: z.string(),
      accountNumber: z.string().optional(),
      accountType: z.string().optional(),
      balance: z.string().optional(),
      originalCreditor: z.string().optional(),
      dateOpened: z.string().optional(),
      lastActivity: z.string().optional(),
      status: z.string().optional(),
      transunionData: z.string().optional(),
      equifaxData: z.string().optional(),
      experianData: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createNegativeAccount({
        userId: ctx.user.id,
        ...input,
      });
    }),

  // List user's negative accounts
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getNegativeAccountsByUserId(ctx.user.id);
    }),

  // Analyze cross-bureau conflicts
  analyzeConflicts: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const account = await db.getNegativeAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      // Parse bureau data
      const tuData = account.transunionData ? JSON.parse(account.transunionData) : null;
      const eqData = account.equifaxData ? JSON.parse(account.equifaxData) : null;
      const exData = account.experianData ? JSON.parse(account.experianData) : null;

      const conflicts: Array<{ type: string; description: string; severity: string }> = [];

      // Check balance conflicts
      if (tuData?.balance && eqData?.balance && tuData.balance !== eqData.balance) {
        conflicts.push({
          type: "balance_discrepancy",
          description: `TransUnion reports $${tuData.balance}, Equifax reports $${eqData.balance}`,
          severity: "high"
        });
      }

      // Check status conflicts
      if (tuData?.status && eqData?.status && tuData.status !== eqData.status) {
        conflicts.push({
          type: "status_conflict",
          description: `TransUnion: "${tuData.status}", Equifax: "${eqData.status}"`,
          severity: "high"
        });
      }

      // Check date conflicts
      if (tuData?.lastActivity && eqData?.lastActivity && tuData.lastActivity !== eqData.lastActivity) {
        conflicts.push({
          type: "date_discrepancy",
          description: `Last activity dates differ by more than 30 days`,
          severity: "medium"
        });
      }

      // Update account with conflicts
      await db.updateNegativeAccountConflicts(
        input.accountId,
        conflicts.length > 0,
        JSON.stringify(conflicts)
      );

      return { conflicts, hasConflicts: conflicts.length > 0 };
    }),
});

// ============================================================================
// DISPUTE LETTERS ROUTER
// ============================================================================

const disputeLettersRouter = router({
  // Generate dispute letters using AI
  generate: protectedProcedure
    .input(z.object({
      accountIds: z.array(z.number()),
      round: z.number().default(1),
      userInfo: z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Fetch accounts
      const accounts = await Promise.all(
        input.accountIds.map(id => db.getNegativeAccountById(id))
      );

      // Verify all accounts belong to user
      if (accounts.some(acc => !acc || acc.userId !== ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid account access" });
      }

      // Generate letters for each bureau
      const bureaus = ["transunion", "equifax", "experian"] as const;
      const letters: Array<{ bureau: string; content: string }> = [];

      for (const bureau of bureaus) {
        // Build prompt for AI
        const accountsForBureau = accounts.filter(acc => {
          const bureauData = bureau === "transunion" ? acc?.transunionData :
                            bureau === "equifax" ? acc?.equifaxData :
                            acc?.experianData;
          return bureauData && bureauData !== "null";
        });

        if (accountsForBureau.length === 0) continue;

        const prompt = `Generate a professional, litigation-grade credit dispute letter for ${bureau.toUpperCase()}.

USER INFORMATION:
Name: ${input.userInfo.name}
Address: ${input.userInfo.address}, ${input.userInfo.city}, ${input.userInfo.state} ${input.userInfo.zip}

ACCOUNTS TO DISPUTE:
${accountsForBureau.map((acc, idx) => `
${idx + 1}. ${acc?.accountName}
   Account Number: ${acc?.accountNumber || "Not provided"}
   Balance: $${acc?.balance || "Unknown"}
   Status: ${acc?.status || "Unknown"}
   Conflicts: ${acc?.hasConflicts ? JSON.parse(acc.conflictDetails || "[]").map((c: any) => c.description).join("; ") : "None detected"}
`).join("\n")}

REQUIREMENTS:
1. Start with legal opening establishing FCRA rights (§ 1681i)
2. Section II: Explain cross-bureau conflicts as fundamental problem
3. For each account:
   - "Account Information You Report"
   - "What Other Bureaus Report"
   - "VIOLATIONS IDENTIFIED" (numbered list)
   - "LEGAL REQUIREMENT FOR DELETION"
   - "DEMAND" (DELETE or CORRECT)
4. Include complete FCRA citations
5. Legal consequences section (CFPB, FTC, litigation)
6. 30-day investigation requirement
7. Professional tone, no emotional language
8. Exhibits list (A-F)

Generate the complete letter now:`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert credit repair attorney specializing in FCRA law. Generate professional, litigation-grade dispute letters." },
            { role: "user", content: prompt }
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const letterContent = typeof messageContent === 'string' ? messageContent : "";

        // Save letter to database
        await db.createDisputeLetter({
          userId: ctx.user.id,
          bureau: bureau as any,
          recipientName: null,
          recipientAddress: null,
          letterContent,
          accountsDisputed: JSON.stringify(input.accountIds),
          round: input.round,
          letterType: "initial",
          status: "generated",
        });

        letters.push({ bureau, content: letterContent });
      }

      return { letters, count: letters.length };
    }),

  // List user's dispute letters
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getDisputeLettersByUserId(ctx.user.id);
    }),

  // Get single dispute letter
  get: protectedProcedure
    .input(z.object({ letterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const letter = await db.getDisputeLetterById(input.letterId);
      if (!letter || letter.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Letter not found" });
      }
      return letter;
    }),

  // Update letter status (mailed, response received, etc.)
  updateStatus: protectedProcedure
    .input(z.object({
      letterId: z.number(),
      status: z.enum(["generated", "downloaded", "mailed", "response_received", "resolved"]),
      trackingNumber: z.string().optional(),
      responseDetails: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const letter = await db.getDisputeLetterById(input.letterId);
      if (!letter || letter.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid letter access" });
      }

      const updates: any = {};
      
      if (input.status === "mailed") {
        updates.mailedAt = new Date();
        updates.responseDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        if (input.trackingNumber) {
          updates.trackingNumber = input.trackingNumber;
        }
      }

      if (input.status === "response_received") {
        updates.responseReceivedAt = new Date();
        if (input.responseDetails) {
          updates.responseDetails = input.responseDetails;
        }
      }

      await db.updateDisputeLetterStatus(input.letterId, input.status, updates);

      return { success: true };
    }),
});

// ============================================================================
// PAYMENTS ROUTER
// ============================================================================

const paymentsRouter = router({
  // Create payment intent (Stripe integration placeholder)
  createIntent: protectedProcedure
    .input(z.object({
      tier: z.enum(["diy_quick", "diy_complete", "white_glove", "subscription_monthly", "subscription_annual"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Pricing logic
      const pricing: Record<string, number> = {
        diy_quick: 29,
        diy_complete: 79,
        white_glove: 199,
        subscription_monthly: 49,
        subscription_annual: 499,
      };

      const amount = pricing[input.tier];

      // TODO: Create actual Stripe payment intent
      // For now, return mock data
      return {
        clientSecret: "mock_client_secret",
        amount,
        tier: input.tier,
      };
    }),

  // List user's payments
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getPaymentsByUserId(ctx.user.id);
    }),
});

// ============================================================================
// MAILING CHECKLIST ROUTER
// ============================================================================

const mailingChecklistRouter = router({
  // Get checklist for dispute letter
  get: protectedProcedure
    .input(z.object({ disputeLetterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const letter = await db.getDisputeLetterById(input.disputeLetterId);
      if (!letter || letter.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid letter access" });
      }

      let checklist = await db.getMailingChecklistByDisputeId(input.disputeLetterId);
      
      // Create checklist if it doesn't exist
      if (!checklist) {
        checklist = await db.createMailingChecklist({
          userId: ctx.user.id,
          disputeLetterId: input.disputeLetterId,
        });
      }

      return checklist;
    }),

  // Update checklist item
  update: protectedProcedure
    .input(z.object({
      checklistId: z.number(),
      updates: z.object({
        printedLetters: z.boolean().optional(),
        signedInBlueInk: z.boolean().optional(),
        handwroteEnvelope: z.boolean().optional(),
        includedId: z.boolean().optional(),
        includedUtilityBill: z.boolean().optional(),
        includedSupportingDocs: z.boolean().optional(),
        mailedFromLocalPostOffice: z.boolean().optional(),
        gotCertifiedReceipt: z.boolean().optional(),
        uploadedTrackingNumber: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateMailingChecklist(input.checklistId, input.updates);
      return { success: true };
    }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  creditReports: creditReportsRouter,
  negativeAccounts: negativeAccountsRouter,
  disputeLetters: disputeLettersRouter,
  payments: paymentsRouter,
  mailingChecklist: mailingChecklistRouter,
});

export type AppRouter = typeof appRouter;
