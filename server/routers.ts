import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { uploadRouter } from "./uploadRouter";

// System prompt for Manus AI letter generation
const LETTER_GENERATION_SYSTEM_PROMPT = `You are an expert credit repair attorney specializing in FCRA litigation. You generate 10/10 litigation-grade dispute letters that achieve 70-85% deletion rates.

Your letters MUST include:
1. Complete FCRA citations (§ 1681i, § 1681s-2, etc.)
2. Cross-bureau conflicts as primary argument
3. Account-by-account detailed analysis
4. Specific violations with exact data points
5. Legal consequences section
6. Professional formatting
7. Clear demands (DELETE vs CORRECT)

You write in a professional, authoritative tone that demonstrates legal expertise while remaining accessible.`;

// Build letter generation prompt
function buildLetterPrompt(
  userName: string,
  bureau: 'transunion' | 'equifax' | 'experian',
  currentAddress: string,
  previousAddress: string | undefined,
  accounts: any[]
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
  
  return `Generate a litigation-grade FCRA dispute letter for ${bureauNames[bureau]}.

User Information:
- Name: ${userName}
- Current Address: ${currentAddress}
${previousAddress ? `- Previous Address: ${previousAddress}` : ''}

Bureau Address:
${bureauNames[bureau]}
${bureauAddresses[bureau]}

Negative Accounts to Dispute (${accounts.length} total):
${accounts.map((acc, i) => `
${i + 1}. ${acc.creditorName}
   - Account: ${acc.accountNumber}
   - Type: ${acc.accountType}
   - Status: ${acc.status}
   - Balance: $${acc.balance}
   - Date Opened: ${acc.dateOpened}
   - Last Activity: ${acc.lastActivity || 'Unknown'}`).join('\n')}

Generate a complete, professional dispute letter that:
1. Opens with legal authority (FCRA § 1681i(a)(1)(A))
2. States the dispute clearly
3. Analyzes each account with specific violations
4. Demands deletion of unverifiable items
5. Includes exhibits list
6. Ends with 30-day deadline

Format the letter professionally with proper letterhead, date, and signature block.`;
}

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
  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Forbidden');
      
      const { getAllUsers, getAllDisputeLetters, getAllPayments } = await import('./db');
      
      const users = await getAllUsers();
      const letters = await getAllDisputeLetters();
      const payments = await getAllPayments();
      
      const now = Date.now();
      const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      
      return {
        totalUsers: users.length,
        newUsersThisMonth: users.filter(u => u.createdAt.getTime() >= thisMonthStart).length,
        totalLetters: letters.length,
        lettersThisMonth: letters.filter(l => l.createdAt.getTime() >= thisMonthStart).length,
        totalRevenue: payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        revenueThisMonth: payments.filter(p => p.createdAt.getTime() >= thisMonthStart).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        successRate: 78, // Placeholder - would calculate from actual dispute outcomes
        completedDisputes: letters.filter(l => l.status === 'mailed').length,
        lettersByBureau: {
          transunion: letters.filter(l => l.bureau === 'transunion').length,
          equifax: letters.filter(l => l.bureau === 'equifax').length,
          experian: letters.filter(l => l.bureau === 'experian').length,
        },
        conflictTypes: {
          balance: 0, // Would calculate from actual conflict data
          status: 0,
          date: 0,
          reaging: 0,
        },
      };
    }),
    listUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Forbidden');
      
      const { getAllUsers, getAllDisputeLetters } = await import('./db');
      
      const users = await getAllUsers();
      const letters = await getAllDisputeLetters();
      
      return users.map(u => ({
        ...u,
        letterCount: letters.filter(l => l.userId === u.id).length,
        hasActiveSubscription: false, // Would check subscriptions table
      }));
    }),
    recentLetters: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Forbidden');
      
      const { getAllDisputeLetters, getAllUsers } = await import('./db');
      
      const letters = await getAllDisputeLetters();
      const users = await getAllUsers();
      
      return letters
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 50)
        .map(l => {
          const user = users.find(u => u.id === l.userId);
          return {
            ...l,
            userName: user?.name || 'Unknown',
            hasConflicts: false, // Would check negative_accounts for conflicts
          };
        });
    }),
  }),
  ai: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import('./_core/llm');
        
        const messages = [
          {
            role: 'system' as const,
            content: `You are an expert credit repair AI assistant with deep knowledge of:
- FCRA law (§ 1681i, § 1681s-2, § 1681n, § 1681o)
- Cross-bureau conflict detection
- Litigation-grade dispute strategies
- Credit bureau procedures
- Furnisher responsibilities

You help users understand their credit reports, identify violations, and develop winning dispute strategies. You explain complex legal concepts in clear, accessible language while maintaining professional expertise.`,
          },
          ...(input.conversationHistory || []),
          {
            role: 'user' as const,
            content: input.message,
          },
        ];
        
        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const responseText = typeof rawContent === 'string' ? rawContent : 'I apologize, but I encountered an error. Please try again.';
        
        return {
          response: responseText,
        };
      }),
  }),
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
        
        // Import Manus AI letter generator
        const { invokeLLM } = await import('./_core/llm');
        
        // Generate AI-powered letters using Manus LLM
        const letters = [];
        
        for (const bureau of input.bureaus) {
          // Build prompt for Manus AI
          const prompt = buildLetterPrompt(userName, bureau, input.currentAddress, input.previousAddress, accounts);
          
          // Generate letter using Manus AI
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: LETTER_GENERATION_SYSTEM_PROMPT,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          });
          
          const rawContent = response.choices[0]?.message?.content;
          const letterContent = typeof rawContent === 'string' 
            ? rawContent 
            : generatePlaceholderLetter(userName, bureau, input.currentAddress, accounts.length);
          
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
