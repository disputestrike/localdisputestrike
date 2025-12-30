import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { uploadRouter } from "./uploadRouter";

// Helper function to generate placeholder letters
function generatePlaceholderLetter(
  userName: string,
  bureau: 'transunion' | 'equifax' | 'experian',
  address: string,
  accountCount: number
): string {
  const bureauNames = {
    transunion: 'TransUnion',
    equifax: 'Equifax',
    experian: 'Experian',
  };
  
  const bureauAddresses = {
    transunion: 'P.O. Box 2000, Chester, PA 19016-2000',
    equifax: 'P.O. Box 740256, Atlanta, GA 30374-0256',
    experian: 'P.O. Box 4500, Allen, TX 75013',
  };
  
  return `${userName}
${address}

Date: ${new Date().toLocaleDateString()}

${bureauNames[bureau]}
${bureauAddresses[bureau]}

Re: Formal Dispute of Inaccurate Information

Dear Sir/Madam,

Pursuant to the Fair Credit Reporting Act (FCRA) § 1681i(a)(1)(A), I am writing to dispute inaccurate information appearing on my credit report.

I have identified ${accountCount} account(s) that contain inaccuracies and request immediate investigation and deletion of these items.

[This is a placeholder letter. The full AI-generated litigation-grade dispute letter will be implemented in the next phase.]

I request that you:
1. Conduct a reasonable reinvestigation of the disputed items
2. Delete any information that cannot be verified
3. Provide me with written results of your investigation

Thank you for your prompt attention to this matter.

Sincerely,
${userName}`;
}

export const appRouter = router({
  system: systemRouter,
  upload: uploadRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  creditReports: router({
    /**
     * Upload credit report (placeholder - will implement full parsing later)
     */
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
        bureau: z.enum(['transunion', 'equifax', 'experian']),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        const reportId = await db.createCreditReport({
          userId,
          bureau: input.bureau,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          fileName: input.fileName,
          isParsed: false,
        });

        return {
          reportId,
          success: true,
        };
      }),

    /**
     * List all credit reports for user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCreditReportsByUserId(ctx.user.id);
    }),

    /**
     * Get credit report details
     */
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getCreditReportById(input.id);
      }),
  }),

  negativeAccounts: router({
    /**
     * List all negative accounts for user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNegativeAccountsByUserId(ctx.user.id);
    }),

    /**
     * Manually add negative account
     */
    create: protectedProcedure
      .input(z.object({
        accountName: z.string(),
        accountNumber: z.string().optional(),
        accountType: z.string(),
        balance: z.string(),
        status: z.string(),
        dateOpened: z.string().optional(),
        lastActivity: z.string().optional(),
        originalCreditor: z.string().optional(),
        bureau: z.enum(['transunion', 'equifax', 'experian']),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Store bureau-specific data
        const bureauData = JSON.stringify({
          balance: input.balance,
          status: input.status,
          dateOpened: input.dateOpened,
          lastActivity: input.lastActivity,
        });

        const data: any = {
          userId,
          accountName: input.accountName,
          accountNumber: input.accountNumber,
          accountType: input.accountType,
          balance: input.balance,
          status: input.status,
          dateOpened: input.dateOpened,
          lastActivity: input.lastActivity,
          originalCreditor: input.originalCreditor,
        };

        // Set bureau-specific data field
        if (input.bureau === 'transunion') {
          data.transunionData = bureauData;
        } else if (input.bureau === 'equifax') {
          data.equifaxData = bureauData;
        } else if (input.bureau === 'experian') {
          data.experianData = bureauData;
        }

        return db.createNegativeAccount(data);
      }),
  }),

  disputeLetters: router({
    /**
     * Generate dispute letters (placeholder - will implement AI generation later)
     */
    generate: protectedProcedure
      .input(z.object({
        currentAddress: z.string(),
        previousAddress: z.string().optional(),
        bureaus: z.array(z.enum(['transunion', 'equifax', 'experian'])),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userName = ctx.user.name || 'User';

        // Get all accounts
        const accounts = await db.getNegativeAccountsByUserId(userId);
        
        // TODO: Implement full AI letter generation with GPT-4
        // For now, generate structured placeholder letters
        const letters = [];
        
        for (const bureau of input.bureaus) {
          const letterContent = generatePlaceholderLetter(userName, bureau, input.currentAddress, accounts.length);
          
          const letterId = await db.createDisputeLetter({
            userId,
            bureau,
            letterContent,
            accountsDisputed: JSON.stringify(accounts.map(a => a.id)),
            round: 1,
            letterType: 'initial',
            status: 'generated',
          });

          letters.push({
            id: letterId,
            bureau,
          });
        }

        return {
          letters,
          totalAccounts: accounts.length,
        };
      }),

    /**
     * List all dispute letters for user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getDisputeLettersByUserId(ctx.user.id);
    }),

    /**
     * Get dispute letter details
     */
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getDisputeLetterById(input.id);
      }),

    /**
     * Update letter status (mailed, response received, etc.)
     */
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['generated', 'downloaded', 'mailed', 'response_received', 'resolved']),
        trackingNumber: z.string().optional(),
        mailedAt: z.string().optional(),
        responseReceivedAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // TODO: Implement update in db.ts
        return { success: true };
      }),
  }),

  payments: router({
    /**
     * Create payment intent (placeholder for Stripe integration)
     */
    createIntent: protectedProcedure
      .input(z.object({
        tier: z.enum(['diy_quick', 'diy_complete', 'white_glove', 'subscription_monthly', 'subscription_annual']),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        const amounts: Record<string, string> = {
          diy_quick: '29.00',
          diy_complete: '79.00',
          white_glove: '199.00',
          subscription_monthly: '39.99',
          subscription_annual: '399.00',
        };

        const amount = amounts[input.tier];

        // In production, create Stripe payment intent here
        // For now, create payment record with placeholder Stripe ID
        const paymentId = await db.createPayment({
          userId,
          amount,
          tier: input.tier,
          stripePaymentId: `placeholder_${Date.now()}`,
          status: 'pending',
        });

        return {
          paymentId,
          amount,
          // clientSecret: 'pk_test_...' // Stripe client secret
        };
      }),

    /**
     * List all payments for user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPaymentsByUserId(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
