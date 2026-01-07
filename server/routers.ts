import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { uploadRouter } from "./uploadRouter";

// Admin-only procedure - requires user.role === 'admin'
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }
  return next({ ctx });
});

// Paid user procedure - requires completed payment
const paidProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const payment = await db.getUserLatestPayment(ctx.user.id);
  
  if (!payment || payment.status !== 'completed') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Payment required to access this feature. Please purchase a package to continue.'
    });
  }
  
  return next({ 
    ctx: { 
      ...ctx, 
      userTier: payment.tier 
    } 
  });
});

// System prompt for Manus AI letter generation - UPDATED with real-world success learnings
const LETTER_GENERATION_SYSTEM_PROMPT = `You are an expert credit dispute attorney specializing in FCRA litigation. You generate 10/10 litigation-grade dispute letters that achieve 70-85% deletion rates.

Your letters MUST include:

1. **PRIMARY LEGAL AUTHORITY (FCRA):**
   - § 1681i(a)(1)(A) - Consumer's right to dispute inaccurate information
   - § 1681i(a)(5)(A) - Bureau must delete unverifiable information within 30 days
   - § 1681i(a)(7) - Consumer's right to request Method of Verification (MOV)
   - § 1681s-2(b) - Furnisher's duty to investigate disputes
   - § 1681n - Willful noncompliance penalties ($100-$1,000 per violation)
   - § 1681o - Negligent noncompliance penalties (actual damages)

2. **FDCPA PROTECTIONS:**
   - § 1692g - Debt validation rights (creditors must verify upon request)
   - § 1692e - False or misleading representations prohibited
   - § 1692f - Unfair practices prohibited

3. **STATUTE OF LIMITATIONS:**
   - State that consumer is aware of statute of limitations for debt collection
   - Note that disputing does NOT restart statute of limitations
   - Emphasize that this is a credit reporting dispute, not debt validation

4. **CROSS-BUREAU CONFLICTS:**
   - Primary argument for deletion
   - Specific data discrepancies between bureaus
   - Legal impossibility arguments

5. **ACCOUNT-BY-ACCOUNT ANALYSIS:**
   - Detailed violations for each account
   - Specific inaccuracies with exact data points
   - FCRA section violated for each issue

6. **LEGAL CONSEQUENCES:**
   - 30-day investigation deadline (FCRA § 1681i(a)(1))
   - Mandatory deletion if unverifiable (FCRA § 1681i(a)(5))
   - Penalties for willful/negligent noncompliance
   - Potential FCRA lawsuit threat

7. **PROFESSIONAL FORMATTING:**
   - Proper letterhead with consumer's address
   - Bureau's address
   - Date
   - RE: line
   - Body with legal citations
   - Signature block

8. **CLEAR DEMANDS:**
   - DELETE unverifiable accounts
   - CORRECT inaccurate information
   - PROVIDE written results within 30 days
   - CEASE reporting disputed items as accurate

You write in a professional, authoritative tone that demonstrates legal expertise while remaining accessible. Your letters have proven results: 3+ deletions and 40+ point score increases in real-world testing.`;

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
    getStats: adminProcedure.query(async ({ ctx }) => {
      
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
    listUsers: adminProcedure.query(async ({ ctx }) => {
      
      const { getAllUsers, getAllDisputeLetters } = await import('./db');
      
      const users = await getAllUsers();
      const letters = await getAllDisputeLetters();
      
      return users.map(u => ({
        ...u,
        letterCount: letters.filter(l => l.userId === u.id).length,
        hasActiveSubscription: false, // Would check subscriptions table
      }));
    }),
    recentLetters: adminProcedure.query(async ({ ctx }) => {
      
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
    getParserMetrics: adminProcedure.query(async ({ ctx }) => {
      
      const { getRecentParserComparisons } = await import('./db');
      
      const comparisons = await getRecentParserComparisons(1000);
      
      if (comparisons.length === 0) {
        return {
          averageAccuracy: 0,
          totalComparisons: 0,
          perfectMatches: 0,
          goodMatches: 0,
          poorMatches: 0,
          customParserUsed: 0,
          smartcreditUsed: 0,
          customParserUsagePercentage: 0,
          smartcreditApiCalls: 0,
          monthlyCostSavings: 0,
        };
      }
      
      // Calculate metrics
      const perfectMatches = comparisons.filter(c => c.matchPercentage === 100).length;
      const goodMatches = comparisons.filter(c => c.matchPercentage >= 90 && c.matchPercentage < 100).length;
      const poorMatches = comparisons.filter(c => c.matchPercentage < 90).length;
      
      const customParserUsed = comparisons.filter(c => c.selectedSource === 'custom').length;
      const smartcreditUsed = comparisons.filter(c => c.selectedSource === 'smartcredit').length;
      
      const avgAccuracy = Math.round(
        comparisons.reduce((sum, c) => sum + c.matchPercentage, 0) / comparisons.length
      );
      
      const customParserUsagePercentage = Math.round((customParserUsed / comparisons.length) * 100);
      
      // Cost calculation: $5/month per SmartCredit user
      const smartcreditApiCalls = smartcreditUsed;
      const costIfAllSmartCredit = comparisons.length * 5; // $5 per comparison if all used SmartCredit
      const actualCost = smartcreditUsed * 5; // Only pay for SmartCredit calls
      const monthlyCostSavings = costIfAllSmartCredit - actualCost;
      
      return {
        averageAccuracy: avgAccuracy,
        totalComparisons: comparisons.length,
        perfectMatches,
        goodMatches,
        poorMatches,
        customParserUsed,
        smartcreditUsed,
        customParserUsagePercentage,
        smartcreditApiCalls,
        monthlyCostSavings,
      };
    }),
    getRecentComparisons: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        
        const { getRecentParserComparisons } = await import('./db');
        
        return await getRecentParserComparisons(input.limit || 50);
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
            content: `You are an expert credit dispute AI assistant with deep knowledge of:
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
     * Upload credit report - automatically parses and extracts accounts
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
        
        const report = await db.createCreditReport({
          userId,
          bureau: input.bureau,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          fileName: input.fileName,
          isParsed: false,
        });

        // Trigger AI parsing in background
        const { parseAndSaveReport } = await import('./creditReportParser');
        parseAndSaveReport(report.id, input.fileUrl, input.bureau, userId).catch((err: Error) => {
          console.error('Failed to parse credit report:', err);
        });

        return {
          reportId: report.id,
          success: true,
          message: 'Report uploaded successfully. AI is extracting accounts...',
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

    /**
     * Delete credit report and associated negative accounts
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Get report to verify ownership
        const report = await db.getCreditReportById(input.id);
        if (!report || report.userId !== userId) {
          throw new Error('Report not found or access denied');
        }

        // Delete associated negative accounts
        const { deleteNegativeAccountsByReportId, deleteCreditReport } = await import('./db');
        await deleteNegativeAccountsByReportId(input.id);
        
        // Delete the report
        await deleteCreditReport(input.id);
        
        return {
          success: true,
          message: 'Report deleted successfully',
        };
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
    generate: paidProcedure
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
     * Generate Round 2 escalation letter with Method of Verification (MOV) request
     */
    generateRound2: paidProcedure
      .input(z.object({
        originalLetterId: z.number(),
        verifiedAccounts: z.array(z.object({
          id: z.number(),
          accountName: z.string(),
          reason: z.string(), // Why this account should still be deleted
        })),
        currentAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userName = ctx.user.name || 'User';
        
        // Get original letter
        const originalLetter = await db.getDisputeLetterById(input.originalLetterId);
        if (!originalLetter || originalLetter.userId !== userId) {
          throw new Error('Letter not found');
        }
        
        const bureau = originalLetter.bureau;
        
        // Import Manus AI
        const { invokeLLM } = await import('./_core/llm');
        
        // Build Round 2 escalation prompt
        const round2Prompt = `Generate a Round 2 ESCALATION letter demanding Method of Verification (MOV) for verified accounts.

User Information:
- Name: ${userName}
- Address: ${input.currentAddress}
- Bureau: ${bureau}

Background:
- User sent initial dispute letter 30+ days ago
- Bureau responded that ${input.verifiedAccounts.length} accounts were "verified"
- User is now demanding Method of Verification (MOV) under FCRA § 1681i(a)(7)

Verified Accounts to Challenge:
${input.verifiedAccounts.map((acc, i) => `
${i + 1}. ${acc.accountName}
   - Reason for continued dispute: ${acc.reason}`).join('\n')}

Generate an AGGRESSIVE escalation letter that:

1. **Invokes FCRA § 1681i(a)(7)** - Demands complete Method of Verification documentation:
   - Who verified the account (name, title, company)
   - What documents were reviewed
   - When verification occurred
   - How verification was conducted
   - Copies of all verification documents

2. **Challenges the verification process:**
   - Questions adequacy of investigation
   - Demands proof of "reasonable investigation" under FCRA § 1681i(a)(1)(A)
   - Points out that generic responses are insufficient

3. **Cites legal consequences:**
   - FCRA § 1681n - Willful noncompliance penalties ($100-$1,000 per violation)
   - FCRA § 1681o - Negligent noncompliance (actual damages)
   - Potential lawsuit if MOV is not provided within 15 days

4. **References statute of limitations:**
   - Notes that old debts may be past statute of limitations
   - States that consumer is aware of their rights under state law
   - Emphasizes this is a credit reporting dispute, not debt validation

5. **Demands specific action:**
   - Provide complete MOV within 15 days
   - Delete accounts if MOV cannot be provided
   - Cease reporting accounts as accurate pending MOV

6. **Threatens escalation:**
   - CFPB complaint
   - State Attorney General complaint  
   - Federal lawsuit under FCRA
   - Demand for statutory damages

Tone: Professional but FIRM. Make it clear you know the law and will pursue legal action if necessary.`;
        
        // Generate Round 2 letter
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: LETTER_GENERATION_SYSTEM_PROMPT + '\n\nYou are now generating a Round 2 ESCALATION letter. Be more aggressive, cite more penalties, and make legal threats credible.',
            },
            {
              role: 'user',
              content: round2Prompt,
            },
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const letterContent = typeof rawContent === 'string' ? rawContent : 'Error generating Round 2 letter';
        
        // Create Round 2 letter
        const letterId = await db.createDisputeLetter({
          userId,
          bureau: bureau as 'transunion' | 'equifax' | 'experian' | 'furnisher',
          letterContent,
          accountsDisputed: JSON.stringify(input.verifiedAccounts.map(a => a.id)),
          round: 2,
          letterType: 'escalation',
          status: 'generated',
        });
        
        return {
          letterId,
          bureau,
          message: 'Round 2 escalation letter generated successfully',
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
     * Download letter as PDF
     */
    downloadPDF: paidProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const letter = await db.getDisputeLetterById(input.id);
        
        if (!letter || letter.userId !== ctx.user.id) {
          throw new Error('Letter not found');
        }
        
        // Import PDF generator
        const { generateLetterPDF } = await import('./pdfGenerator');
        const { storagePut } = await import('./storage');
        
        // Generate PDF
        const pdfBuffer = await generateLetterPDF({
          letterContent: letter.letterContent,
          userInfo: {
            name: ctx.user.name || 'User',
            address: 'Address on file', // TODO: Get from user profile
          },
          bureau: letter.bureau.charAt(0).toUpperCase() + letter.bureau.slice(1) as 'TransUnion' | 'Equifax' | 'Experian',
          date: new Date(letter.createdAt),
        });
        
        // Upload to S3
        const fileKey = `dispute-letters/${ctx.user.id}/${letter.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, 'application/pdf');
        
        // Update letter status to downloaded
        if (letter.status === 'generated') {
          // TODO: Update status in db
        }
        
        return { url };
      }),

    /**
     * Generate CFPB complaint for missed bureau deadline
     */
    generateCFPBComplaint: protectedProcedure
      .input(z.object({
        letterId: z.number(),
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        daysOverdue: z.number(),
        userAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userName = ctx.user.name || 'User';
        
        // Get original letter
        const originalLetter = await db.getDisputeLetterById(input.letterId);
        if (!originalLetter || originalLetter.userId !== userId) {
          throw new Error('Letter not found');
        }
        
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
        
        // Import Manus AI
        const { invokeLLM } = await import('./_core/llm');
        
        // Build CFPB complaint prompt
        const cfpbPrompt = `Generate a formal CFPB complaint letter for FCRA violations.

User Information:
- Name: ${userName}
- Address: ${input.userAddress}

Violation Details:
- Bureau: ${bureauNames[input.bureau]}
- Original Dispute Date: ${originalLetter.mailedAt ? new Date(originalLetter.mailedAt).toLocaleDateString() : 'Unknown'}
- Days Overdue: ${input.daysOverdue} days past the 30-day deadline
- FCRA Violation: § 1681i(a)(1)(A) - Failure to complete investigation within 30 days

Generate a formal CFPB complaint letter that:

1. **Addresses Consumer Financial Protection Bureau:**
   Consumer Financial Protection Bureau
   P.O. Box 4503
   Iowa City, IA 52244

2. **States the violation clearly:**
   - ${bureauNames[input.bureau]} received dispute letter on [date]
   - 30-day deadline was [date]
   - Bureau failed to respond by deadline (now ${input.daysOverdue} days overdue)
   - This violates FCRA § 1681i(a)(1)(A)

3. **Cites legal authority:**
   - FCRA § 1681i(a)(1)(A) - 30-day investigation requirement
   - FCRA § 1681i(a)(5)(A) - Mandatory deletion if unverifiable
   - FCRA § 1681n - Willful noncompliance penalties ($100-$1,000 per violation)
   - FCRA § 1681o - Negligent noncompliance (actual damages)

4. **Documents harm:**
   - Continued inaccurate reporting damages credit score
   - Inability to obtain credit, housing, or employment
   - Emotional distress from bureau's negligence
   - Request for statutory damages under FCRA § 1681n

5. **Demands action:**
   - CFPB investigate ${bureauNames[input.bureau]} for FCRA violations
   - Bureau be fined for noncompliance
   - Immediate deletion of disputed accounts
   - Compensation for damages

6. **Includes exhibits:**
   - Copy of original dispute letter
   - Proof of mailing (certified mail receipt)
   - Credit report showing inaccurate information
   - Timeline showing missed deadline

7. **Professional formatting:**
   - Proper letterhead
   - CFPB address
   - Date
   - RE: Formal Complaint Against ${bureauNames[input.bureau]}
   - Body with legal citations
   - Signature block

Tone: Formal, factual, and demanding. This is an official government complaint that could result in fines and enforcement action.`;
        
        // Generate CFPB complaint
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert FCRA attorney drafting formal CFPB complaints. Your complaints are detailed, cite specific violations, and demand enforcement action.',
            },
            {
              role: 'user',
              content: cfpbPrompt,
            },
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const complaintContent = typeof rawContent === 'string' ? rawContent : 'Error generating CFPB complaint';
        
        // Create CFPB complaint letter record
        const complaintId = await db.createDisputeLetter({
          userId,
          bureau: input.bureau,
          letterContent: complaintContent,
          accountsDisputed: originalLetter.accountsDisputed,
          round: originalLetter.round || 1,
          letterType: 'cfpb',
          status: 'generated',
        });
        
        return {
          complaintId,
          bureau: input.bureau,
          message: 'CFPB complaint generated successfully',
        };
      }),

    /**
     * Upload and parse bureau response letter
     */
    uploadBureauResponse: protectedProcedure
      .input(z.object({
        letterId: z.number(),
        fileUrl: z.string(), // S3 URL of uploaded PDF/image
        bureau: z.enum(['transunion', 'equifax', 'experian']),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Verify letter belongs to user
        const letter = await db.getDisputeLetterById(input.letterId);
        if (!letter || letter.userId !== userId) {
          throw new Error('Letter not found');
        }
        
        // Parse bureau response using AI
        const { parseBureauResponse, updateAccountStatuses } = await import('./bureauResponseParser');
        const parsed = await parseBureauResponse(input.fileUrl, input.bureau);
        
        // Update account statuses
        const updateResult = await updateAccountStatuses(userId, parsed);
        
        // TODO: Update letter status to 'response_received'
        // TODO: Store parsed response in database
        
        return {
          parsed,
          accountsMatched: updateResult.accountsMatched,
          scoreChange: updateResult.scoreChange,
        };
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
     * Create Stripe checkout session
     */
    createCheckout: protectedProcedure
      .input(z.object({
        tier: z.enum(['diy_quick', 'diy_complete', 'white_glove', 'subscription_monthly', 'subscription_annual']),
      }))
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2025-12-15.clover',
        });
        
        const { getProduct } = await import('./products');
        const product = getProduct(input.tier);
        
        if (!product) {
          throw new Error('Invalid product');
        }
        
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          mode: input.tier.includes('subscription') ? 'subscription' : 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: product.name,
                  description: product.description,
                },
                unit_amount: product.price,
                ...(input.tier.includes('subscription') && {
                  recurring: {
                    interval: input.tier === 'subscription_monthly' ? 'month' : 'year',
                  },
                }),
              },
              quantity: 1,
            },
          ],
          success_url: `${origin}/dashboard?payment=success`,
          cancel_url: `${origin}/pricing?payment=cancelled`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || '',
            customer_name: ctx.user.name || '',
            tier: input.tier,
          },
          allow_promotion_codes: true,
        });
        
        return {
          checkoutUrl: session.url || '',
          sessionId: session.id,
        };
      }),

    /**
     * List all payments for user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPaymentsByUserId(ctx.user.id);
    }),
  }),

  /**
   * Contact form router (no auth required)
   */
  contact: router({
    /**
     * Submit contact form
     */
    submit: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Save to database
        const contactId = await db.createContactSubmission({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          status: 'new',
        });

        // Send notification email to admin
        const { sendEmail } = await import('./emailService');
        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@disputestrike.com',
          subject: `New Contact Form Submission from ${input.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${input.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${input.email}">${input.email}</a></p>
            ${input.phone ? `<p><strong>Phone:</strong> <a href="tel:${input.phone}">${input.phone}</a></p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${input.message.replace(/\n/g, '<br>')}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          `,
          text: `New contact from ${input.name} (${input.email}): ${input.message}`,
        });

        return { success: true, contactId };
      }),
  }),

  /**
   * Lead capture router (no auth required)
   */
  leads: router({
    /**
     * Capture lead from quiz funnel
     */
    captureLead: publicProcedure
      .input(z.object({
        creditScoreRange: z.string(),
        negativeItemsCount: z.string(),
        bureaus: z.array(z.string()),
        email: z.string().email(),
        zipCode: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Store lead in database
        await db.createLead({
          email: input.email,
          zipCode: input.zipCode,
          creditScoreRange: input.creditScoreRange,
          negativeItemsCount: input.negativeItemsCount,
          bureaus: input.bureaus.join(','),
          source: 'quiz_funnel',
        });

        // TODO: Send email with analysis results
        // await sendLeadEmail(input.email, input);

        return { success: true };
      }),

    /**
     * Capture email from exit-intent popup or lead magnets
     */
    captureEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.string(), // exit_intent_popup, landing_page, etc.
      }))
      .mutation(async ({ input }) => {
        // Store email lead in database
        await db.createEmailLead({
          email: input.email,
          source: input.source,
        });

        // Send free guide email
        await db.sendFreeGuideEmail(input.email);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
