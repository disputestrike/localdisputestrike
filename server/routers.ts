import { COOKIE_NAME } from "@shared/const";
/**
 * DisputeStrike - AI-Powered Credit Dispute Platform
 * Main API Router Configuration
 */
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, adminProcedure, superAdminProcedure, masterAdminProcedure, canManageRole, ADMIN_ROLES } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
// File storage is now handled via /api/upload endpoint in index.ts
// import { uploadRouter } from "./uploadRouter";

// Admin procedures imported from _core/trpc with role hierarchy support

// Agency-only procedure - requires user.accountType === 'agency'
const agencyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.getUserById(ctx.user.id);
  if (!user || user.accountType !== 'agency') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Agency account required. Upgrade to an agency plan to access this feature.'
    });
  }
  return next({ ctx: { ...ctx, agencyUser: user } });
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

// System prompt for AI letter generation - UPDATED with real-world success learnings
const LETTER_GENERATION_SYSTEM_PROMPT = `You are an expert credit dispute attorney specializing in FCRA litigation. You generate A+ (98/100) FCRA-compliant dispute letters that achieve 70-85% deletion rates.

**CRITICAL FORMATTING RULES - MUST FOLLOW:**
1. DO NOT use placeholder text like [Your Name], [Date], [Your DOB], etc. - use the ACTUAL values provided
2. Use the EXACT name, address, and date provided in the user information
3. Only ONE "RE:" line at the beginning of the letter
4. Only ONE "Sincerely" signature block at the END of the letter (not in the middle)
5. NO duplicate sections - each section appears exactly once
6. This is a PERSONAL letter from the consumer to the bureau - NO platform branding

**REQUIRED DOCUMENT STRUCTURE (Use Roman Numerals):**

I. LEGAL BASIS FOR THIS DISPUTE
   - Cite all relevant FCRA sections
   - Establish legal authority

II. CRITICAL PROBLEM: CROSS-BUREAU CONFLICTS
   - Overview of conflicts detected
   - Why conflicts require deletion

III. ACCOUNT-BY-ACCOUNT DISPUTES
   - Each account with detailed analysis
   - Use severity labels: **CRITICAL ERROR**, **HIGH PRIORITY**, **MEDIUM**
   - Include "What Other Bureaus Report" comparison when applicable

IV. SUMMARY OF DEMANDS (TABLE FORMAT)
   - Create a table with columns: Account | Demand | Basis
   - One row per disputed account
   - Clear DELETE or CORRECT demand for each

V. LEGAL REQUIREMENTS & TIMELINE
   - 30-day deadline
   - MOV requirement

VI. SUPPORTING DOCUMENTATION ENCLOSED
   - Use Exhibit labels (A, B, C, etc.)
   - Include checkbox list at end

VII. CONSEQUENCES OF NON-COMPLIANCE
   - Specific agency threats (CFPB, FTC, State Attorney General)
   - Statutory damages under § 1681n ($100-$1,000 per violation)
   - Actual damages, punitive damages, attorney fees

**IMPOSSIBLE TIMELINE DETECTION - CRITICAL:**
If Last Activity date is BEFORE Date Opened = **CRITICAL ERROR - IMPOSSIBLE TIMELINE**
This is physically impossible. An account cannot have activity before it exists.
This single violation alone requires immediate deletion.
Example: "Date Opened: February 20, 2025" + "Last Activity: February 1, 2025" = 19 days BEFORE opening = IMPOSSIBLE

**SEVERITY GRADING (Label each violation):**
- **CRITICAL ERROR**: Impossible timelines, major balance discrepancies ($1000+), duplicate accounts
- **HIGH PRIORITY**: Status conflicts, date discrepancies, cross-bureau conflicts
- **MEDIUM**: Missing fields, minor inconsistencies

**CROSS-BUREAU COMPARISON FORMAT:**
For each account with conflicts, include:

"What Other Bureaus Report (Same Account):

TransUnion Reports:
• Last Activity: [date] (NOT [your date])
• Status: [status]
• Balance: $[amount]

Equifax Reports:
• Last Activity: [date]
• Status: [status] (NOT [your status])
• Balance: $[amount]

VIOLATIONS IDENTIFIED:
1. [Specific violation] - [SEVERITY LABEL]"

**EXHIBIT SYSTEM (Required at end):**

VII. SUPPORTING DOCUMENTATION ENCLOSED

Attached are the following exhibits:
• Exhibit A: Government-Issued Photo ID (copy)
• Exhibit B: Proof of Address (utility bill)
• Exhibit C: [Bureau] Credit Report dated [date]

ENCLOSURES:
☐ Exhibit A: Government-Issued Photo ID
☐ Exhibit B: Proof of Address
☐ Exhibit C: Credit Report

**AGENCY THREATS (Required in Consequences section):**
I am prepared to file complaints with:
• Consumer Financial Protection Bureau (CFPB)
• Federal Trade Commission (FTC)
• State Attorney General
• Pursue litigation for statutory damages under FCRA

**PRIMARY LEGAL AUTHORITY (FCRA):**
- § 1681i(a)(1)(A) - Consumer's right to dispute inaccurate information
- § 1681i(a)(5)(A) - Bureau must delete unverifiable information within 30 days
- § 1681i(a)(7) - Consumer's right to request Method of Verification (MOV)
- § 1681s-2(b) - Furnisher's duty to investigate disputes
- § 1681n - Willful noncompliance penalties ($100-$1,000 per violation)
- § 1681o - Negligent noncompliance penalties (actual damages)

**FDCPA PROTECTIONS:**
- § 1692g - Debt validation rights
- § 1692e - False or misleading representations prohibited
- § 1692f - Unfair practices prohibited

You write in a professional, authoritative tone that demonstrates legal expertise. Your letters achieve 70-85% deletion rates because they are LEGALLY BULLETPROOF.`;

// Import conflict detector for all 43 dispute methods
import { detectConflicts, type Conflict, type ConflictAnalysis } from './conflictDetector';
import type { ParsedAccount } from './creditReportParser';

// Build letter generation prompt with full 43-method conflict detection
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
  
  // Format today's date properly
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Convert accounts to ParsedAccount format for conflict detection
  const parsedAccounts: ParsedAccount[] = accounts.map(acc => ({
    accountName: acc.creditorName || acc.accountName,
    accountNumber: acc.accountNumber || 'Unknown',
    balance: parseFloat(acc.balance) || 0,
    status: acc.status || 'Unknown',
    dateOpened: acc.dateOpened ? new Date(acc.dateOpened) : null,
    lastActivity: acc.lastActivity ? new Date(acc.lastActivity) : null,
    accountType: acc.accountType || 'Unknown',
    originalCreditor: acc.originalCreditor || null,
    bureau: bureauNames[bureau] as 'TransUnion' | 'Equifax' | 'Experian',
    rawData: JSON.stringify(acc),
  }));
  
  // Run full 43-method conflict detection
  const conflictAnalysis: ConflictAnalysis = detectConflicts(parsedAccounts);
  
  // Build account analysis with detected conflicts
  const accountsWithAnalysis = accounts.map((acc, i) => {
    const accountName = acc.creditorName || acc.accountName;
    
    // Get conflicts for this specific account
    const accountConflicts = conflictAnalysis.conflicts.filter(
      c => c.accountName.toLowerCase().includes(accountName.toLowerCase()) ||
           accountName.toLowerCase().includes(c.accountName.toLowerCase())
    );
    
    // Format conflicts by severity
    const criticalConflicts = accountConflicts.filter(c => c.severity === 'critical');
    const highConflicts = accountConflicts.filter(c => c.severity === 'high');
    const mediumConflicts = accountConflicts.filter(c => c.severity === 'medium');
    
    let conflictText = '';
    
    if (criticalConflicts.length > 0) {
      conflictText += '\n   **CRITICAL VIOLATIONS (Automatic Deletion Required):**';
      criticalConflicts.forEach(c => {
        conflictText += `\n   - ${c.type.toUpperCase()}: ${c.description}`;
        conflictText += `\n     FCRA Violation: ${c.fcraViolation}`;
        conflictText += `\n     Deletion Probability: ${c.deletionProbability}%`;
        if (c.argument) conflictText += `\n     Legal Argument: ${c.argument}`;
      });
    }
    
    if (highConflicts.length > 0) {
      conflictText += '\n   **HIGH PRIORITY VIOLATIONS:**';
      highConflicts.forEach(c => {
        conflictText += `\n   - ${c.type.toUpperCase()}: ${c.description}`;
        conflictText += `\n     FCRA Violation: ${c.fcraViolation}`;
      });
    }
    
    if (mediumConflicts.length > 0) {
      conflictText += '\n   **ADDITIONAL VIOLATIONS:**';
      mediumConflicts.forEach(c => {
        conflictText += `\n   - ${c.type}: ${c.description}`;
      });
    }
    
    return `
${i + 1}. ${accountName}
   - Account Number: ${acc.accountNumber}
   - Type: ${acc.accountType}
   - Status: ${acc.status}
   - Balance: $${acc.balance}
   - Date Opened: ${acc.dateOpened || 'Not reported'}
   - Last Activity: ${acc.lastActivity || 'Unknown'}${conflictText || '\n   - Request verification under FCRA § 1681i'}`;
  }).join('\n');
  
  // Add conflict summary to prompt
  const conflictSummary = `
**CONFLICT ANALYSIS SUMMARY (${conflictAnalysis.methodsUsed.length} of 43 detection methods triggered):**
- Total Conflicts Found: ${conflictAnalysis.totalConflicts}
- Critical Conflicts: ${conflictAnalysis.criticalConflicts}
- High Priority Conflicts: ${conflictAnalysis.highPriorityConflicts}
- Estimated Deletions: ${conflictAnalysis.estimatedDeletions}
- Methods Used: ${conflictAnalysis.methodsUsed.join(', ')}
`;

  return `Generate a FCRA-compliant dispute letter for ${bureauNames[bureau]}.

**IMPORTANT: Use these EXACT values - DO NOT use placeholder text:**
- Consumer Name: ${userName}
- Consumer Address: ${currentAddress}
${previousAddress ? `- Previous Address: ${previousAddress}` : ''}
- Today's Date: ${formattedDate}
- Bureau Being Addressed: ${bureauNames[bureau]}

Bureau Address:
${bureauNames[bureau]}
${bureauAddresses[bureau]}

Negative Accounts to Dispute (${accounts.length} total):
${accountsWithAnalysis}

${conflictSummary}

**REQUIRED LETTER STRUCTURE:**

1. **Header**: ${userName}'s name and address, then ${bureauNames[bureau]}'s address, then date: ${formattedDate}

2. **RE: Line**: ONE RE: line citing FCRA § 1681i - Formal Dispute of Inaccurate Information

3. **Section I - LEGAL BASIS**: Cite FCRA §§ 1681i(a)(1)(A), 1681i(a)(5)(A), 1681i(a)(7), 1681s-2(b), 1681n, 1681o

4. **Section II - CROSS-BUREAU CONFLICTS**: Overview of why conflicts require deletion

5. **Section III - ACCOUNT-BY-ACCOUNT DISPUTES**: 
   - For EACH account, include severity label (CRITICAL ERROR / HIGH PRIORITY / MEDIUM)
   - If impossible timeline detected, lead with "CRITICAL ERROR - IMPOSSIBLE TIMELINE"
   - Include "What Other Bureaus Report" comparison format

6. **Section IV - SUMMARY OF DEMANDS TABLE**:
   Create a table:
   | Account | Demand | Basis |
   |---------|--------|-------|
   | [Name]  | DELETE | [Reason] |

7. **Section V - LEGAL REQUIREMENTS & TIMELINE**: 30-day deadline, MOV requirement

8. **Section VI - SUPPORTING DOCUMENTATION**:
   List as Exhibit A, B, C with checkbox format:
   ☐ Exhibit A: Government-Issued Photo ID
   ☐ Exhibit B: Proof of Address
   ☐ Exhibit C: ${bureauNames[bureau]} Credit Report

9. **Section VII - CONSEQUENCES**: 
   - List specific agencies: CFPB, FTC, State Attorney General
   - Cite § 1681n damages ($100-$1,000 per violation)
   - Mention litigation threat

10. **Signature**: ONE signature block at the very end with "${userName}"

**REMEMBER:**
- NO placeholder text like [Your Name] - use "${userName}" exactly
- NO duplicate RE: lines or signature blocks
- Use severity labels for each violation
- Include the Summary of Demands table
- Include Exhibit system with checkboxes
- This is a personal letter from the consumer - NO platform branding`;
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

[This is a placeholder letter. The full AI-generated FCRA-compliant dispute letter will be implemented in the next phase.]

I request that you:
1. Conduct a reasonable reinvestigation of the disputed items
2. Delete any information that cannot be verified
3. Provide me with written results of your investigation

Thank you for your prompt attention to this matter.

Sincerely,
${userName}`;
}

export const appRouter = router({
  upload: router({
    /**
     * Get upload info for Railway volume storage
     * Returns the upload endpoint URL and file key
     */
    getSignedUrl: protectedProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian', 'combined', 'document']),
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { bureau, fileName } = input;
        const userId = ctx.user.id;
        
        // Determine the base path for the file
        let basePath: string;
        if (bureau === 'document') {
          basePath = 'documents';
        } else {
          basePath = 'credit-reports';
        }
        
        // Generate a unique, user-scoped key
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `${basePath}/${userId}/${bureau}/${Date.now()}_${sanitizedFileName}`;
        
        // For Railway volume storage, files are uploaded via /api/upload endpoint
        const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
          : process.env.BASE_URL || 'http://localhost:3001';
        
        const uploadUrl = `${baseUrl}/api/upload`;
        const fileUrl = `${baseUrl}/api/files/${encodeURIComponent(fileKey)}`;
        
        console.log(`[getSignedUrl] Generated upload info for user ${userId}, key: ${fileKey}`);
        
        return {
          fileKey: fileKey,
          fileUrl: fileUrl,
          signedUrl: uploadUrl, // This is the upload endpoint URL
        };
      }),

    /**
     * Upload endpoint info for Railway volume storage
     * Returns the upload endpoint URL and file key
     */
    uploadToS3: protectedProcedure
      .input(z.object({
        fileKey: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const timestamp = Date.now();
        const sanitizedFileName = (input.fileKey.split('/').pop() || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
        const secureFileKey = `uploads/${userId}/${timestamp}_${sanitizedFileName}`;
        
        // For Railway volume storage, files are uploaded via /api/upload endpoint
        const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
          : process.env.BASE_URL || 'http://localhost:3001';
        
        const uploadUrl = `${baseUrl}/api/upload`;
        const fileUrl = `${baseUrl}/api/files/${encodeURIComponent(secureFileKey)}`;
        
        console.log(`[uploadToS3] Generated upload info for user ${userId}, key: ${secureFileKey}`);
        
        return { 
          url: fileUrl,
          key: secureFileKey,
          uploadUrl: uploadUrl, // Client should POST to this endpoint with FormData
        };
      }),
  }),
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
        successRate: 78, // Placeholder
        completedDisputes: letters.filter(l => l.status === 'mailed').length,
        lettersByBureau: {
          transunion: letters.filter(l => l.bureau === 'transunion').length,
          equifax: letters.filter(l => l.bureau === 'equifax').length,
          experian: letters.filter(l => l.bureau === 'experian').length,
        }
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
    // Trigger deadline notification emails
    triggerDeadlineNotifications: adminProcedure.mutation(async ({ ctx }) => {
      const { runDeadlineNotificationJob } = await import('./deadlineNotificationService');
      await runDeadlineNotificationJob();
      return { success: true, message: 'Deadline notifications sent' };
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
    // Method Analytics - 43 Dispute Detection Methods
    getMethodAnalytics: adminProcedure.query(async ({ ctx }) => {
      const { 
        getMethodStats, 
        getMethodStatsByCategory, 
        getTopTriggeredMethods, 
        getMethodTriggerTrends,
        getMethodAnalyticsSummary 
      } = await import('./db');
      
      const [stats, byCategory, topMethods, trends, summary] = await Promise.all([
        getMethodStats(),
        getMethodStatsByCategory(),
        getTopTriggeredMethods(15),
        getMethodTriggerTrends(30),
        getMethodAnalyticsSummary()
      ]);
      
      return {
        stats,
        byCategory,
        topMethods,
        trends,
        summary
      };
    }),
    
    getMethodDetails: adminProcedure
      .input(z.object({ methodNumber: z.number().min(1).max(43) }))
      .query(async ({ ctx, input }) => {
        const { getMethodStats } = await import('./db');
        const allStats = await getMethodStats();
        const methodStats = allStats.find(s => s.methodNumber === input.methodNumber);
        
        if (!methodStats) {
          return null;
        }
        
        return methodStats;
      }),

    // Cleanup user data for master test
    cleanupUserData: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Only allow users to cleanup their own data, or admins to cleanup any
        if (ctx.user.id !== input.userId && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot cleanup other user data' });
        }
        
        const { cleanupUserData } = await import('./cleanupUserData');
        return await cleanupUserData(input.userId);
      }),

    // ============================================================================
    // COMPREHENSIVE ADMIN PANEL ENDPOINTS
    // ============================================================================

    // Get full dashboard stats
    getDashboardStats: adminProcedure.query(async ({ ctx }) => {
      const { getAdminDashboardStats } = await import('./db');
      return await getAdminDashboardStats();
    }),

    // Get users with filters and pagination
    getUserList: adminProcedure
      .input(z.object({
        role: z.string().optional(),
        status: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { getAdminUserList } = await import('./db');
        return await getAdminUserList({
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
      }),

    // Get single user details
    getUserDetails: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getAdminUserDetails } = await import('./db');
        return await getAdminUserDetails(input.userId);
      }),

    // Update user role (with hierarchy check)
    updateUserRole: superAdminProcedure
      .input(z.object({
        userId: z.number(),
        newRole: z.enum(['user', 'admin', 'super_admin', 'master_admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check hierarchy - can only promote to roles below your own
        if (!canManageRole(ctx.user.role, input.newRole)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Cannot assign role ${input.newRole} - insufficient permissions`,
          });
        }
        
        const { updateUserRole, getUserById } = await import('./db');
        const targetUser = await getUserById(input.userId);
        
        if (!targetUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        
        // Can't modify users with same or higher role
        if (!canManageRole(ctx.user.role, targetUser.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot modify user with same or higher role',
          });
        }
        
        await updateUserRole(input.userId, input.newRole, ctx.user.id);
        return { success: true };
      }),

    // Update user status (block/unblock)
    updateUserStatus: adminProcedure
      .input(z.object({
        userId: z.number(),
        status: z.enum(['active', 'blocked', 'suspended']),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateUserStatus, getUserById } = await import('./db');
        const targetUser = await getUserById(input.userId);
        
        if (!targetUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        
        // Can't block users with same or higher role
        if (ADMIN_ROLES.includes(targetUser.role) && !canManageRole(ctx.user.role, targetUser.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot modify admin with same or higher role',
          });
        }
        
        await updateUserStatus(input.userId, input.status, ctx.user.id, input.reason);
        return { success: true };
      }),

    // Update user profile
    updateUserProfile: adminProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        currentAddress: z.string().optional(),
        currentCity: z.string().optional(),
        currentState: z.string().optional(),
        currentZip: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { adminUpdateUserProfile } = await import('./db');
        const { userId, ...data } = input;
        await adminUpdateUserProfile(userId, data, ctx.user.id);
        return { success: true };
      }),

    // Delete user (master admin only)
    deleteUser: masterAdminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteUser, getUserById } = await import('./db');
        const targetUser = await getUserById(input.userId);
        
        if (!targetUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        
        // Can't delete master admins
        if (targetUser.role === 'master_admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot delete master admin',
          });
        }
        
        await deleteUser(input.userId, ctx.user.id);
        return { success: true };
      }),

    // Get all admins
    getAdmins: adminProcedure.query(async ({ ctx }) => {
      const { getAllAdmins } = await import('./db');
      return await getAllAdmins();
    }),

    // Get letters with filters
    getLetterList: adminProcedure
      .input(z.object({
        bureau: z.string().optional(),
        status: z.string().optional(),
        userId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { getAdminLettersList } = await import('./db');
        return await getAdminLettersList({
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
      }),

    // Get payments with filters
    getPaymentList: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        tier: z.string().optional(),
        userId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { getAllPayments, getAllUsers } = await import('./db');
        let payments = await getAllPayments();
        const users = await getAllUsers();
        
        // Apply filters
        if (input.status) {
          payments = payments.filter(p => p.status === input.status);
        }
        if (input.tier) {
          payments = payments.filter(p => p.tier === input.tier);
        }
        if (input.userId) {
          payments = payments.filter(p => p.userId === input.userId);
        }
        if (input.startDate) {
          const start = new Date(input.startDate);
          payments = payments.filter(p => new Date(p.createdAt) >= start);
        }
        if (input.endDate) {
          const end = new Date(input.endDate);
          payments = payments.filter(p => new Date(p.createdAt) <= end);
        }
        
        // Add user info to payments
        const paymentsWithUsers = payments.map(p => {
          const user = users.find(u => u.id === p.userId);
          return {
            ...p,
            userName: user?.name || 'Unknown',
            userEmail: user?.email || '',
          };
        });
        
        return {
          payments: paymentsWithUsers.slice(input.offset, input.offset + input.limit),
          total: paymentsWithUsers.length,
        };
      }),

    // Export users to CSV
    exportUsers: adminProcedure
      .input(z.object({
        role: z.string().optional(),
        status: z.string().optional(),
        state: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { exportUsersToCSV } = await import('./db');
        return await exportUsersToCSV(input);
      }),

    // Export letters to CSV
    exportLetters: adminProcedure
      .input(z.object({
        bureau: z.string().optional(),
        status: z.string().optional(),
        userId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { exportLettersToCSV } = await import('./db');
        return await exportLettersToCSV(input);
      }),

    // Get activity log
    getActivityLog: adminProcedure
      .input(z.object({ limit: z.number().optional().default(100) }))
      .query(async ({ ctx, input }) => {
        const { getAdminActivityLog } = await import('./db');
        return await getAdminActivityLog(input.limit);
      }),

    // Get current admin info
    getCurrentAdmin: adminProcedure.query(async ({ ctx }) => {
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
      };
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
        const { aiProvider } = await import('./aiProvider');
        
        const systemPrompt = `You are an expert credit dispute AI assistant with deep knowledge of FCRA law, cross-bureau conflict detection, and dispute strategies.`;
        
        const conversationText = [
          systemPrompt,
          ...(input.conversationHistory || []).map((msg: any) => `${msg.role}: ${msg.content}`),
          `user: ${input.message}`
        ].join('\n\n');
        
        try {
          const result = await aiProvider.generate(conversationText);
          console.log(`[AI Chat] Used provider: ${result.provider}`);
          
          return {
            response: result.content,
            provider: result.provider,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[AI Chat] All providers failed: ${errorMsg}`);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'AI service temporarily unavailable. Please try again later.',
          });
        }
      }),

    // Analyze document with Vision AI (for PDF/image analysis)
    analyzeDocument: protectedProcedure
      .input(z.object({
        message: z.string(),
        files: z.array(z.object({
          name: z.string(),
          type: z.string(),
          base64: z.string(),
        })),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { aiProvider } = await import('./aiProvider');
        
        const systemPrompt = `You are an expert credit dispute AI assistant with deep knowledge of FCRA law, cross-bureau conflict detection, and dispute strategies.

When analyzing credit reports, you should:
1. Identify ALL negative accounts (collections, charge-offs, late payments, bankruptcies, judgments, liens)
2. For each account, note: creditor name, account number (last 4 digits), balance, status, date opened, negative reason
3. Identify potential FCRA violations (inaccurate dates, wrong balances, duplicate accounts, outdated info)
4. Suggest specific dispute strategies based on the violations found
5. Look for cross-bureau conflicts (accounts reporting differently across bureaus)

Be thorough and specific in your analysis.`;
        
        try {
          // For PDF files, we'll use Vision API to analyze the document
          const fileDescriptions = input.files.map(f => {
            const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
            return `[${isPdf ? 'PDF' : 'Text'} Document: ${f.name}]`;
          }).join('\n');
          
          // Check if any files are PDFs that need vision processing
          const pdfFiles = input.files.filter(f => 
            f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
          );
          const textFiles = input.files.filter(f => 
            f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')
          );
          
          let analysisResults: string[] = [];
          
          // Process text files directly
          for (const file of textFiles) {
            try {
              const textContent = Buffer.from(file.base64, 'base64').toString('utf-8');
              const truncatedContent = textContent.substring(0, 50000); // Limit size
              analysisResults.push(`\n--- Content from ${file.name} ---\n${truncatedContent}`);
            } catch (e) {
              console.error(`Failed to decode text file ${file.name}:`, e);
            }
          }
          
          // For PDFs, we need to use Vision API or extract text
          // Since Vision API works with images, we'll try to analyze the base64 directly
          for (const file of pdfFiles) {
            try {
              // Try Vision API for PDF analysis
              const visionPrompt = `Analyze this credit report document and extract:
1. All negative accounts (collections, charge-offs, late payments)
2. Account details: creditor name, account number, balance, status, dates
3. Any FCRA violations or inaccuracies
4. Personal information section (name, address, SSN last 4)

Be thorough and list every negative item found.`;
              
              const visionResult = await aiProvider.generateWithVision(
                file.base64,
                visionPrompt
              );
              analysisResults.push(`\n--- Analysis of ${file.name} ---\n${visionResult}`);
            } catch (e) {
              console.error(`Vision analysis failed for ${file.name}:`, e);
              analysisResults.push(`\n--- ${file.name} ---\n[PDF document attached - unable to extract content directly. Please describe what you see in the document or paste the text content.]`);
            }
          }
          
          // Build the full prompt with context
          const fullPrompt = [
            systemPrompt,
            `\nUser uploaded the following documents:\n${fileDescriptions}`,
            analysisResults.join('\n'),
            `\nUser's question: ${input.message}`,
            `\nConversation history:`,
            ...(input.conversationHistory || []).map((msg: any) => `${msg.role}: ${msg.content}`),
          ].join('\n\n');
          
          const result = await aiProvider.generate(fullPrompt);
          console.log(`[AI Document Analysis] Used provider: ${result.provider}`);
          
          return {
            response: result.content,
            provider: result.provider,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[AI Document Analysis] Failed: ${errorMsg}`);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Document analysis failed: ${errorMsg}`,
          });
        }
      }),
  }),
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      return ctx.user || null;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      
      // Clear all possible session cookies with multiple methods for reliability
      const cookiesToClear = [COOKIE_NAME, 'auth-token', 'manus-session', 'app_session_id'];
      
      cookiesToClear.forEach(name => {
        // Method 1: Set expired cookie
        ctx.res.cookie(name, '', { 
          ...cookieOptions, 
          expires: new Date(0),
          maxAge: 0,
          path: '/',
        });
        
        // Method 2: Clear cookie explicitly
        ctx.res.clearCookie(name, { ...cookieOptions, path: '/' });
        
        // Method 3: Clear without options just in case
        ctx.res.clearCookie(name);
      });

      return { success: true };
    }),
  }),

  creditReports: router({
    /**
     * Perform a light analysis on a credit report for the FREE preview flow
     */
    lightAnalysis: protectedProcedure
      .input(z.object({
        fileUrl: z.string(),
      }))
      .query(async ({ input }) => {
        const { performLightAnalysis } = await import('./creditReportParser');
        const result = await performLightAnalysis(input.fileUrl);
        return result;
      }),
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
     * Upload combined 3-bureau credit report - parses and extracts accounts for all bureaus
     */
    uploadCombined: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        console.log(`[uploadCombined] Starting combined upload for user ${userId}`);
        
        // Use the new combined parser that creates reports and distributes accounts
        const { parseAndSaveCombinedReport } = await import('./creditReportParser');
        
        // Start parsing in background (don't await - let it run async)
        parseAndSaveCombinedReport(input.fileUrl, userId)
          .then((result) => {
            console.log(`[uploadCombined] Parsing complete: ${result.totalAccounts} accounts extracted`);
          })
          .catch((err: Error) => {
            console.error('[uploadCombined] Failed to parse combined credit report:', err);
          });

        return {
          success: true,
          message: 'Combined report uploaded. AI is extracting accounts from all 3 bureaus (30-60 seconds)...',
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
     * Re-parse an existing credit report to extract more accounts
     * Note: This adds NEW accounts found - it doesn't delete existing ones
     * since accounts are deduplicated by name during parsing
     */
    reparse: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Get report to verify ownership
        const report = await db.getCreditReportById(input.id);
        if (!report || report.userId !== userId) {
          throw new Error('Report not found or access denied');
        }

        // Reset parsed status (don't delete accounts - parsing will dedupe)
        const { updateCreditReportParsedData } = await import('./db');
        await updateCreditReportParsedData(input.id, null);
        
        // Re-trigger AI parsing with improved prompts
        // The parser will add any NEW accounts it finds (deduped by name)
        const { parseAndSaveReport } = await import('./creditReportParser');
        parseAndSaveReport(report.id, report.fileUrl, report.bureau as 'transunion' | 'equifax' | 'experian', userId).catch((err: Error) => {
          console.error('Failed to re-parse credit report:', err);
        });

        return {
          success: true,
          message: 'Re-parsing started. AI is extracting accounts with improved detection...',
        };
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

  smartCredit: router({
    /**
     * Check if user can pull new SmartCredit reports (30-day limit)
     */
    canPull: protectedProcedure.query(async ({ ctx }) => {
      const lastPull = await db.getLastSmartcreditPull(ctx.user.id);
      if (!lastPull?.pulledAt) {
        return {
          allowed: true,
          daysRemaining: 0,
          nextPullDate: null,
          lastPullAt: null,
        };
      }

      const lastPullDate = new Date(lastPull.pulledAt);
      const nextPullDate = new Date(lastPullDate);
      nextPullDate.setDate(nextPullDate.getDate() + 30);
      const now = new Date();
      const diffMs = nextPullDate.getTime() - now.getTime();
      const daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

      return {
        allowed: diffMs <= 0,
        daysRemaining,
        nextPullDate: diffMs > 0 ? nextPullDate : null,
        lastPullAt: lastPullDate,
      };
    }),

    /**
     * Record a SmartCredit pull (manual user download)
     */
    recordPull: protectedProcedure
      .input(z.object({
        source: z.enum(['smartcredit', 'annualcreditreport', 'direct_upload']).optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        const lastPull = await db.getLastSmartcreditPull(ctx.user.id);
        if (lastPull?.pulledAt) {
          const lastPullDate = new Date(lastPull.pulledAt);
          const nextPullDate = new Date(lastPullDate);
          nextPullDate.setDate(nextPullDate.getDate() + 30);
          if (new Date() < nextPullDate) {
            return {
              success: false,
              message: 'Report pulls are limited to once per 30 days.',
              nextPullDate,
            };
          }
        }

        await db.recordSmartcreditPull({
          userId: ctx.user.id,
          source: input?.source || 'smartcredit',
        });

        return { success: true };
      }),
  }),

  scoreHistory: router({
    /**
     * Get credit score history for user
     */
    list: protectedProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian']).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getCreditScoreHistory(ctx.user.id, input);
      }),

    /**
     * Get latest scores for all bureaus
     */
    latest: protectedProcedure.query(async ({ ctx }) => {
      return db.getLatestCreditScores(ctx.user.id);
    }),

    /**
     * Manually record a credit score (for users who check their score elsewhere)
     */
    record: protectedProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        score: z.number().min(300).max(850),
        scoreModel: z.string().optional(),
        event: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.recordCreditScore({
          userId: ctx.user.id,
          bureau: input.bureau,
          score: input.score,
          scoreModel: input.scoreModel,
          event: input.event,
        });
      }),

    /**
     * Add an event to the most recent score
     */
    addEvent: protectedProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        event: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addScoreEvent(ctx.user.id, input.bureau, input.event);
        return { success: true };
      }),
  }),

  notifications: router({
    /**
     * Get user notifications
     */
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input);
      }),

    /**
     * Get unread notification count
     */
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),

    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),

    /**
     * Mark all notifications as read
     */
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),

    /**
     * Delete notification
     */
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNotification(input.notificationId, ctx.user.id);
        return { success: true };
      }),
  }),

  documents: router({
    /**
     * List all documents for user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDocuments(ctx.user.id);
    }),

    /**
     * Get document by ID
     */
    getById: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getUserDocumentById(input.documentId, ctx.user.id);
      }),

    /**
     * Get documents by type
     */
    getByType: protectedProcedure
      .input(z.object({ documentType: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getUserDocumentsByType(ctx.user.id, input.documentType);
      }),

    /**
     * Create new document record
     */
    create: protectedProcedure
      .input(z.object({
        documentType: z.enum([
          'government_id', 'drivers_license', 'passport', 'social_security_card',
          'utility_bill', 'bank_statement', 'lease_agreement', 'mortgage_statement',
          'pay_stub', 'tax_return', 'proof_of_address', 'dispute_letter',
          'bureau_response', 'certified_mail_receipt', 'return_receipt', 'other'
        ]),
        documentName: z.string(),
        description: z.string().optional(),
        fileKey: z.string(),
        fileUrl: z.string().optional(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        expiresAt: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createUserDocument({
          userId: ctx.user.id,
          ...input,
        });
      }),

    /**
     * Update document
     */
    update: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        documentName: z.string().optional(),
        description: z.string().optional(),
        expiresAt: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { documentId, ...updates } = input;
        const success = await db.updateUserDocument(documentId, ctx.user.id, updates);
        return { success };
      }),

    /**
     * Delete document
     */
    delete: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.deleteUserDocument(input.documentId, ctx.user.id);
        return { success };
      }),

    /**
     * Get expiring documents
     */
    getExpiring: protectedProcedure
      .input(z.object({ daysUntilExpiry: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getExpiringDocuments(ctx.user.id, input?.daysUntilExpiry);
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
        accountIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userName = ctx.user.name || 'User';
        
        // Apply rate limiting
        const { canGenerateDisputes, recordDisputeUsage } = await import('./rateLimitService');
        const ipAddress = ctx.req?.ip || ctx.req?.socket?.remoteAddress || '0.0.0.0';
        const rateCheckResult = await canGenerateDisputes(userId, ipAddress);
        
        if (!rateCheckResult.allowed) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: rateCheckResult.reason || 'Rate limit exceeded',
          });
        }
        
        // --- 30-DAY DISPUTE LOCK ---
        const lastLetter = await db.getLastDisputeLetter(userId);
        if (lastLetter) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          if (lastLetter.createdAt > thirtyDaysAgo) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Dispute letters can only be generated once every 30 days to comply with bureau requirements and prevent frivolous flags.',
            });
          }
        }
        // --- END 30-DAY DISPUTE LOCK ---

        // Record this dispute generation for rate limiting
        await recordDisputeUsage(userId, ipAddress);

        // Get accounts - either specific ones or all
        let accounts = await db.getNegativeAccountsByUserId(userId);
        
        // If specific account IDs provided, filter to only those
        if (input.accountIds && input.accountIds.length > 0) {
          accounts = accounts.filter(a => input.accountIds!.includes(a.id));
        }

        // --- PER-ACCOUNT 30-DAY DISPUTE LOCK + MAX 3 ROUNDS ---
        const existingLetters = await db.getDisputeLettersByUserId(userId);
        const now = new Date();
        const lockWindowMs = 30 * 24 * 60 * 60 * 1000;
        const lockedAccounts: string[] = [];
        const maxedAccounts: string[] = [];

        for (const account of accounts) {
          const related = existingLetters.filter(letter => {
            if (!letter.accountsDisputed) return false;
            try {
              const ids = JSON.parse(letter.accountsDisputed) as number[];
              return Array.isArray(ids) && ids.includes(account.id);
            } catch {
              return false;
            }
          });

          const rounds = related.length;
          if (rounds >= 3) {
            maxedAccounts.push(account.accountName);
            continue;
          }

          const lastLetter = related.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
          if (lastLetter && now.getTime() - lastLetter.createdAt.getTime() < lockWindowMs) {
            lockedAccounts.push(account.accountName);
          }
        }

        if (maxedAccounts.length > 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Max 3 dispute rounds reached for: ${maxedAccounts.slice(0, 3).join(', ')}${maxedAccounts.length > 3 ? '…' : ''}`,
          });
        }

        if (lockedAccounts.length > 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `30-day lock active for: ${lockedAccounts.slice(0, 3).join(', ')}${lockedAccounts.length > 3 ? '…' : ''}`,
          });
        }
        // --- END PER-ACCOUNT LOCK ---
        
        // Import AI letter generator
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        
        // Generate AI-powered letters
        const letters = [];
        
        for (const bureau of input.bureaus) {
          // Build prompt for AI
          const prompt = buildLetterPrompt(userName, bureau, input.currentAddress, input.previousAddress, accounts);
          
          // Generate letter using AI
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
          
          // Import and use post-processor to ensure all required sections
          const { postProcessLetter, generateCoverPage } = await import('./letterPostProcessor');
          
          // Get user profile for complete data
          const userProfile = await db.getUserProfile(userId);
          
          // Build UserData object with all available info
          const userData = {
            fullName: userProfile?.fullName || userName,
            address: input.currentAddress,
            previousAddress: input.previousAddress,
            phone: userProfile?.phone || undefined,
            email: ctx.user.email || undefined,
            dob: userProfile?.dateOfBirth || undefined,
            ssn4: userProfile?.ssnLast4 || undefined,
          };
          
          let letterContent: string;
          if (typeof rawContent === 'string') {
            // Post-process the AI output to add missing sections AND replace placeholders
            const processedLetter = postProcessLetter(rawContent, accounts, bureau, userData);
            // Add cover page summary
            const coverPage = generateCoverPage(accounts, bureau, userData);
            letterContent = coverPage + processedLetter;
          } else {
            letterContent = generatePlaceholderLetter(userName, bureau, input.currentAddress, accounts.length);
          }
          
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
     * Preview letter before generating - shows what the letter will look like
     */
    preview: paidProcedure
      .input(z.object({
        currentAddress: z.string(),
        previousAddress: z.string().optional(),
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        accountIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userName = ctx.user.name || 'User';
        
        // Get user profile for full details
        const profile = await db.getUserProfile(userId);
        
        // Get accounts to preview
        const allAccounts = await db.getNegativeAccountsByUserId(userId);
        const accounts = input.accountIds && input.accountIds.length > 0
          ? allAccounts.filter(a => input.accountIds!.includes(a.id))
          : allAccounts;
        
        if (accounts.length === 0) {
          throw new Error('No accounts selected for preview');
        }
        
        // Build preview content with user data filled in
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const bureauAddresses: Record<string, string> = {
          transunion: 'TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016',
          equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
          experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
        };
        
        // Format user info
        const fullName = profile?.fullName || userName;
        const address = input.currentAddress;
        const dob = profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[DOB Not Set - Update in Settings]';
        const ssn4 = profile?.ssnLast4 || '[SSN Not Set - Update in Settings]';
        const phone = profile?.phone || '[Phone Not Set]';
        const email = profile?.email || ctx.user.email || '[Email Not Set]';
        
        // Generate preview content
        const previewContent = `
═══════════════════════════════════════════════════════════════════════════════
                              LETTER PREVIEW
                         ${input.bureau.toUpperCase()} DISPUTE LETTER
═══════════════════════════════════════════════════════════════════════════════

📋 YOUR INFORMATION (from profile):
─────────────────────────────────────────────────────────────────────────────────
   Full Name:     ${fullName}
   Address:       ${address}
   Date of Birth: ${dob}
   SSN (Last 4):  ${ssn4}
   Phone:         ${phone}
   Email:         ${email}
   Date:          ${formattedDate}

📬 SENDING TO:
─────────────────────────────────────────────────────────────────────────────────
${bureauAddresses[input.bureau]}

📊 ACCOUNTS TO DISPUTE (${accounts.length} total):
─────────────────────────────────────────────────────────────────────────────────
${accounts.map((acc: typeof allAccounts[0], i: number) => {
  const severity = acc.hasConflicts ? '🔴 CRITICAL' : '🟡 MEDIUM';
  return `
${i + 1}. ${acc.accountName || 'Unknown Account'}
   Account #:    ${acc.accountNumber || 'N/A'}
   Type:         ${acc.accountType || 'Unknown'}
   Balance:      $${acc.balance || '0'}
   Status:       ${acc.status || 'Unknown'}
   Severity:     ${severity}
   ${acc.hasConflicts ? '⚠️  CROSS-BUREAU CONFLICT DETECTED' : ''}
`;
}).join('')}

═══════════════════════════════════════════════════════════════════════════════
                            WHAT HAPPENS NEXT
═══════════════════════════════════════════════════════════════════════════════

1. ✅ Click "Generate Letters" to create your official dispute letters
2. 📄 Each letter will include:
   • Your personal information (filled in automatically)
   • Account details with specific dispute reasons
   • Legal citations (FCRA § 611, § 623)
   • Summary of demands table
   • Exhibit system with enclosures checklist
   • Mailing instructions

3. 📬 After generation:
   • Print each letter
   • Attach copies of your ID and proof of address
   • Mail via Certified Mail with Return Receipt
   • Track your 30-day response deadline

⚠️  MISSING INFORMATION:
─────────────────────────────────────────────────────────────────────────────────
${!profile?.dateOfBirth ? '• Date of Birth - Required by bureaus. Update in Settings → Profile\n' : ''}${!profile?.ssnLast4 ? '• Last 4 SSN - Required by bureaus. Update in Settings → Profile\n' : ''}${!profile?.phone ? '• Phone Number - Recommended. Update in Settings → Profile\n' : ''}
${profile?.dateOfBirth && profile?.ssnLast4 ? '✅ All required information is complete!' : ''}

═══════════════════════════════════════════════════════════════════════════════
`;
        
        return {
          previewContent,
          accountCount: accounts.length,
          bureau: input.bureau,
          hasAllRequiredInfo: !!(profile?.dateOfBirth && profile?.ssnLast4),
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
        
        // Import AI
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        
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
   - Potential lawsuit if MOV is not provided within 30 days

4. **References statute of limitations:**
   - Notes that old debts may be past statute of limitations
   - States that consumer is aware of their rights under state law
   - Emphasizes this is a credit reporting dispute, not debt validation

5. **Demands specific action:**
   - Provide complete MOV within 30 days
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
        
        // Import AI
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        
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
     * Generate furnisher dispute letter (direct to creditor/collection agency)
     */
    generateFurnisherLetter: paidProcedure
      .input(z.object({
        accountId: z.number(),
        currentAddress: z.string(),
        furnisherName: z.string().optional(),
        furnisherAddress: z.string().optional(),
        customReasons: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userName = ctx.user.name || 'User';
        
        // Get the account
        const accounts = await db.getNegativeAccountsByUserId(userId);
        const account = accounts.find(a => a.id === input.accountId);
        
        if (!account) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Account not found',
          });
        }
        
        // Import furnisher letter utilities
        const {
          FURNISHER_LETTER_SYSTEM_PROMPT,
          buildFurnisherLetterPrompt,
          detectFurnisherType,
          getStandardDisputeReasons,
          lookupFurnisherAddress,
        } = await import('./furnisherLetterGenerator');
        
        // Determine furnisher info
        const creditorName = account.originalCreditor || account.accountName;
        const furnisherType = detectFurnisherType(creditorName);
        const isCollectionAgency = furnisherType === 'collection' || furnisherType === 'medical';
        
        // Look up or use provided furnisher address
        let furnisherName = input.furnisherName;
        let furnisherAddress = input.furnisherAddress;
        
        if (!furnisherName || !furnisherAddress) {
          const lookup = lookupFurnisherAddress(creditorName);
          if (lookup) {
            furnisherName = furnisherName || lookup.name;
            furnisherAddress = furnisherAddress || lookup.address;
          } else {
            furnisherName = furnisherName || creditorName;
            furnisherAddress = furnisherAddress || '[FURNISHER ADDRESS - Please look up the creditor\'s dispute address]';
          }
        }
        
        // Get dispute reasons
        const disputeReasons = input.customReasons && input.customReasons.length > 0
          ? input.customReasons
          : getStandardDisputeReasons(account.accountType || '', account.status || '');
        
        // Build prompt
        const prompt = buildFurnisherLetterPrompt(
          userName,
          input.currentAddress,
          furnisherName,
          furnisherAddress,
          {
            accountNumber: account.accountNumber || 'Unknown',
            accountType: account.accountType || 'Unknown',
            balance: account.balance?.toString() || '0',
            status: account.status || 'Unknown',
            dateOpened: account.dateOpened || undefined,
            lastActivity: account.lastActivity || undefined,
            originalCreditor: account.originalCreditor || undefined,
          },
          disputeReasons,
          isCollectionAgency
        );
        
        // Generate letter using AI
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: FURNISHER_LETTER_SYSTEM_PROMPT,
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
          : 'Error generating furnisher dispute letter';
        
        // Save letter to database
        const letterId = await db.createDisputeLetter({
          userId,
          bureau: 'furnisher',
          recipientName: furnisherName,
          recipientAddress: furnisherAddress,
          letterContent,
          accountsDisputed: JSON.stringify([account.id]),
          round: 1,
          letterType: 'initial',
          status: 'generated',
        });
        
        return {
          letterId,
          furnisherName,
          furnisherType,
          isCollectionAgency,
          message: `Furnisher dispute letter generated for ${furnisherName}`,
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
        
        // Build updates object
        const updates: {
          mailedAt?: Date;
          trackingNumber?: string;
          responseDeadline?: Date;
          responseReceivedAt?: Date;
        } = {};
        
        if (input.mailedAt) {
          updates.mailedAt = new Date(input.mailedAt);
          // Set 30-day response deadline
          const deadline = new Date(input.mailedAt);
          deadline.setDate(deadline.getDate() + 30);
          updates.responseDeadline = deadline;
        }
        
        if (input.trackingNumber) {
          updates.trackingNumber = input.trackingNumber;
        }
        
        if (input.responseReceivedAt) {
          updates.responseReceivedAt = new Date(input.responseReceivedAt);
        }
        
        await db.updateDisputeLetterStatus(input.id, input.status, updates);
        
        // Log activity
        await db.logActivity({
          userId,
          activityType: input.status === 'mailed' ? 'letter_mailed' : `letter_status_${input.status}`,
          description: input.status === 'mailed' 
            ? `Marked dispute letter as mailed${input.trackingNumber ? ` (Tracking: ${input.trackingNumber})` : ''}`
            : `Updated letter status to ${input.status}`,
          metadata: JSON.stringify({ letterId: input.id, status: input.status, trackingNumber: input.trackingNumber }),
        });
        
        return { success: true };
      }),

    /**
     * Generate Cease & Desist letter
     */
    generateCeaseDesist: paidProcedure
      .input(z.object({
        collectorName: z.string(),
        collectorAddress: z.string(),
        accountNumber: z.string().optional(),
        originalCreditor: z.string().optional(),
        allegedBalance: z.string().optional(),
        reasons: z.array(z.string()),
        userAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        const { CEASE_DESIST_SYSTEM_PROMPT, buildCeaseDesistPrompt } = await import('./additionalLetterGenerators');
        
        const prompt = buildCeaseDesistPrompt(
          ctx.user.name || 'Consumer',
          input.userAddress,
          input.collectorName,
          input.collectorAddress,
          {
            accountNumber: input.accountNumber,
            originalCreditor: input.originalCreditor,
            allegedBalance: input.allegedBalance,
          },
          input.reasons
        );
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: CEASE_DESIST_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        });
        
        const letterContent = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : 'Error generating letter';
        
        const letterId = await db.createDisputeLetter({
          userId: ctx.user.id,
          bureau: 'collector',
          recipientName: input.collectorName,
          recipientAddress: input.collectorAddress,
          letterContent,
          accountsDisputed: JSON.stringify([]),
          round: 1,
          letterType: 'cease_desist',
          status: 'generated',
        });
        
        return { letterId, message: 'Cease & Desist letter generated' };
      }),

    /**
     * Generate Pay for Delete letter
     */
    generatePayForDelete: paidProcedure
      .input(z.object({
        creditorName: z.string(),
        creditorAddress: z.string(),
        accountNumber: z.string().optional(),
        originalBalance: z.string().optional(),
        currentBalance: z.string().optional(),
        accountType: z.string().optional(),
        offerAmount: z.string(),
        offerPercentage: z.number(),
        userAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        const { PAY_FOR_DELETE_SYSTEM_PROMPT, buildPayForDeletePrompt } = await import('./additionalLetterGenerators');
        
        const prompt = buildPayForDeletePrompt(
          ctx.user.name || 'Consumer',
          input.userAddress,
          input.creditorName,
          input.creditorAddress,
          {
            accountNumber: input.accountNumber,
            originalBalance: input.originalBalance,
            currentBalance: input.currentBalance,
            accountType: input.accountType,
          },
          input.offerAmount,
          input.offerPercentage
        );
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: PAY_FOR_DELETE_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        });
        
        const letterContent = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : 'Error generating letter';
        
        const letterId = await db.createDisputeLetter({
          userId: ctx.user.id,
          bureau: 'creditor',
          recipientName: input.creditorName,
          recipientAddress: input.creditorAddress,
          letterContent,
          accountsDisputed: JSON.stringify([]),
          round: 1,
          letterType: 'pay_for_delete',
          status: 'generated',
        });
        
        return { letterId, message: 'Pay for Delete letter generated' };
      }),

    /**
     * Generate Intent to Sue letter
     */
    generateIntentToSue: paidProcedure
      .input(z.object({
        defendantName: z.string(),
        defendantAddress: z.string(),
        violations: z.array(z.object({
          statute: z.string(),
          section: z.string(),
          description: z.string(),
        })),
        demandAmount: z.string(),
        responseDeadline: z.number().default(30),
        userAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        const { INTENT_TO_SUE_SYSTEM_PROMPT, buildIntentToSuePrompt } = await import('./additionalLetterGenerators');
        
        const prompt = buildIntentToSuePrompt(
          ctx.user.name || 'Consumer',
          input.userAddress,
          input.defendantName,
          input.defendantAddress,
          input.violations,
          input.demandAmount,
          input.responseDeadline
        );
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: INTENT_TO_SUE_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        });
        
        const letterContent = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : 'Error generating letter';
        
        const letterId = await db.createDisputeLetter({
          userId: ctx.user.id,
          bureau: 'legal',
          recipientName: input.defendantName,
          recipientAddress: input.defendantAddress,
          letterContent,
          accountsDisputed: JSON.stringify([]),
          round: 1,
          letterType: 'intent_to_sue',
          status: 'generated',
        });
        
        return { letterId, message: 'Intent to Sue letter generated' };
      }),

    /**
     * Generate Estoppel by Silence letter
     */
    generateEstoppel: paidProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        originalDisputeDate: z.string(),
        daysSinceDispute: z.number(),
        disputedItems: z.array(z.string()),
        userAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        const { ESTOPPEL_SYSTEM_PROMPT, buildEstoppelPrompt } = await import('./additionalLetterGenerators');
        
        const bureauAddresses: Record<string, { name: string; address: string }> = {
          transunion: { name: 'TransUnion', address: 'P.O. Box 2000, Chester, PA 19016-2000' },
          equifax: { name: 'Equifax', address: 'P.O. Box 740256, Atlanta, GA 30374-0256' },
          experian: { name: 'Experian', address: 'P.O. Box 4500, Allen, TX 75013' },
        };
        
        const bureauInfo = bureauAddresses[input.bureau];
        
        const prompt = buildEstoppelPrompt(
          ctx.user.name || 'Consumer',
          input.userAddress,
          bureauInfo.name,
          bureauInfo.address,
          input.originalDisputeDate,
          input.daysSinceDispute,
          input.disputedItems
        );
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: ESTOPPEL_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        });
        
        const letterContent = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : 'Error generating letter';
        
        const letterId = await db.createDisputeLetter({
          userId: ctx.user.id,
          bureau: input.bureau,
          recipientName: bureauInfo.name,
          recipientAddress: bureauInfo.address,
          letterContent,
          accountsDisputed: JSON.stringify([]),
          round: 2,
          letterType: 'estoppel',
          status: 'generated',
        });
        
        return { letterId, message: 'Estoppel by Silence letter generated' };
      }),

    /**
     * Generate specialized letter based on specific detection method (1-43)
     */
    generateMethodSpecificLetter: paidProcedure
      .input(z.object({
        methodNumber: z.number().min(1).max(43),
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        accountId: z.number().optional(),
        accountData: z.record(z.string(), z.any()),
        userAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getMethodTemplate, generateSpecializedLetter } = await import('./letterTemplates');
        const { recordMethodTrigger } = await import('./db');
        
        const template = getMethodTemplate(input.methodNumber);
        if (!template) {
          throw new Error(`Method template ${input.methodNumber} not found`);
        }
        
        // Get user profile for letter generation
        const profile = await db.getUserProfile(ctx.user.id);
        
        const userInfo = {
          name: profile?.fullName || ctx.user.name || 'Consumer',
          address: profile?.currentAddress || input.userAddress,
          city: profile?.currentCity || '',
          state: profile?.currentState || '',
          zip: profile?.currentZip || '',
          phone: profile?.phone || undefined,
          email: profile?.email || ctx.user.email || undefined,
          dob: profile?.dateOfBirth || undefined,
          ssn4: profile?.ssnLast4 || undefined,
        };
        
        // Generate the specialized letter
        const letterContent = generateSpecializedLetter(
          input.methodNumber,
          userInfo,
          input.bureau,
          input.accountData
        );
        
        // Save letter to database
        const letter = await db.createDisputeLetter({
          userId: ctx.user.id,
          bureau: input.bureau,
          letterContent,
          accountsDisputed: JSON.stringify(input.accountId ? [input.accountId] : []),
          round: 1,
          letterType: 'initial',
          status: 'generated',
        });
        const letterId = letter.id;
        
        // Record method trigger for analytics
        await recordMethodTrigger({
          userId: ctx.user.id,
          accountId: input.accountId || null,
          letterId: letterId,
          methodNumber: input.methodNumber,
          methodName: template.methodName,
          methodCategory: template.category as any,
          severity: template.severity,
          deletionProbability: template.deletionProbability,
          fcraViolation: template.fcraViolation,
        });
        
        return {
          letterId,
          methodNumber: input.methodNumber,
          methodName: template.methodName,
          deletionProbability: template.deletionProbability,
          message: `${template.methodName} dispute letter generated`,
        };
      }),

    /**
     * Get all 43 method templates with their details
     */
    getMethodTemplates: protectedProcedure.query(async () => {
      const { ALL_METHOD_TEMPLATES } = await import('./letterTemplates');
      
      return ALL_METHOD_TEMPLATES.map(t => ({
        methodNumber: t.methodNumber,
        methodName: t.methodName,
        category: t.category,
        fcraViolation: t.fcraViolation,
        deletionProbability: t.deletionProbability,
        severity: t.severity,
        legalBasis: t.legalBasis,
        demandLanguage: t.demandLanguage,
        evidenceRequired: t.evidenceRequired,
        escalationPath: t.escalationPath,
      }));
    }),

    /**
     * Get templates filtered by category
     */
    getMethodTemplatesByCategory: protectedProcedure
      .input(z.object({
        category: z.enum([
          'date_timeline',
          'balance_payment',
          'creditor_ownership',
          'status_classification',
          'account_identification',
          'legal_procedural',
          'statistical_pattern'
        ])
      }))
      .query(async ({ input }) => {
        const { getTemplatesByCategory } = await import('./letterTemplates');
        
        return getTemplatesByCategory(input.category).map(t => ({
          methodNumber: t.methodNumber,
          methodName: t.methodName,
          fcraViolation: t.fcraViolation,
          deletionProbability: t.deletionProbability,
          severity: t.severity,
        }));
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
        
        const origin = ctx.req.headers.origin || 'http://localhost:3001';
        
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
        marketingConsent: z.boolean().optional().default(true),
      }))
      .mutation(async ({ input }) => {
        // Store lead in database
        await db.createLead({
          email: input.email,
          zipCode: input.zipCode,
          creditScoreRange: input.creditScoreRange,
          negativeItemsCount: input.negativeItemsCount,
          bureaus: input.bureaus.join(','),
          source: input.marketingConsent ? 'quiz_funnel_marketing' : 'quiz_funnel',
        });

        // Send email with analysis results
        try {
          await db.sendQuizAnalysisEmail(input.email, {
            creditScoreRange: input.creditScoreRange,
            negativeItemsCount: input.negativeItemsCount,
            bureaus: input.bureaus,
            zipCode: input.zipCode,
          });
        } catch (error) {
          console.error('Failed to send quiz analysis email:', error);
          // Don't fail the lead capture if email fails
        }

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

  // Dashboard Stats Router
  dashboardStats: router({
    // Get dashboard stats for user
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserDashboardStats(ctx.user.id);
    }),
  }),

  // Dispute Outcomes Router
  disputeOutcomes: router({
    // Get all dispute outcomes for user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserDisputeOutcomes(ctx.user.id);
    }),

    // Create dispute outcome
    create: protectedProcedure
      .input(z.object({
        disputeLetterId: z.number(),
        accountId: z.number().optional(),
        outcome: z.enum(['deleted', 'verified', 'updated', 'no_response', 'pending']),
        responseNotes: z.string().optional(),
        updatedFields: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createDisputeOutcome({
          userId: ctx.user.id,
          disputeLetterId: input.disputeLetterId,
          accountId: input.accountId,
          outcome: input.outcome,
          responseNotes: input.responseNotes,
          updatedFields: input.updatedFields,
          responseReceivedAt: new Date(),
        });
      }),

    // Update dispute outcome
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        outcome: z.enum(['deleted', 'verified', 'updated', 'no_response', 'pending']).optional(),
        responseNotes: z.string().optional(),
        responseFileUrl: z.string().optional(),
        responseFileKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateDisputeOutcome(input.id, {
          outcome: input.outcome,
          responseNotes: input.responseNotes,
          responseFileUrl: input.responseFileUrl,
          responseFileKey: input.responseFileKey,
          responseReceivedAt: new Date(),
        });
        return { success: true };
      }),
  }),

  // Hard Inquiries Router
  hardInquiries: router({
    // Get all hard inquiries for user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserHardInquiries(ctx.user.id);
    }),

    // Mark inquiry as unauthorized and dispute
    dispute: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateHardInquiry(input.id, {
          isAuthorized: false,
          disputeStatus: 'disputed',
          disputedAt: new Date(),
        });
        return { success: true };
      }),

    // Update inquiry status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        disputeStatus: z.enum(['none', 'disputed', 'removed', 'verified']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateHardInquiry(input.id, {
          disputeStatus: input.disputeStatus,
          ...(input.disputeStatus === 'removed' ? { removedAt: new Date() } : {}),
        });
        return { success: true };
      }),
  }),

  // CFPB Complaints Router
  cfpbComplaints: router({
    // Get all CFPB complaints for user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCFPBComplaints(ctx.user.id);
    }),

    // Create CFPB complaint
    create: protectedProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian']),
        complaintType: z.string(),
        issueDescription: z.string(),
        desiredResolution: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate complaint content using AI
        const { invokeLLMWithFallback: invokeLLM } = await import('./llmWrapper');
        
        const prompt = `Generate a formal CFPB complaint for the following issue:

Bureau: ${input.bureau}
Complaint Type: ${input.complaintType}
Issue: ${input.issueDescription}
Desired Resolution: ${input.desiredResolution || 'Correction of inaccurate information'}

Write a professional, detailed complaint that cites relevant FCRA sections and clearly explains the consumer's rights violation.`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are an expert in consumer credit law and CFPB complaint writing.' },
            { role: 'user', content: prompt },
          ],
        });

        const complaintContent = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : 'Error generating complaint';

        return await db.createCFPBComplaint({
          userId: ctx.user.id,
          bureau: input.bureau,
          complaintType: input.complaintType,
          issueDescription: input.issueDescription,
          desiredResolution: input.desiredResolution,
          complaintContent,
          status: 'draft',
        });
      }),

    // Update CFPB complaint
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['draft', 'submitted', 'response_received', 'resolved']).optional(),
        caseNumber: z.string().optional(),
        responseDetails: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateCFPBComplaint(input.id, {
          status: input.status,
          caseNumber: input.caseNumber,
          responseDetails: input.responseDetails,
          ...(input.status === 'submitted' ? { submittedAt: new Date() } : {}),
          ...(input.status === 'response_received' ? { responseReceivedAt: new Date() } : {}),
        });
        return { success: true };
      }),
  }),

  // Referrals Router
  referrals: router({
    // Get user's referral data
    get: protectedProcedure.query(async ({ ctx }) => {
      let referral = await db.getUserReferral(ctx.user.id);
      if (!referral) {
        referral = await db.createReferral(ctx.user.id);
      }
      return referral;
    }),

    // Get all referrals made by user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserReferrals(ctx.user.id);
    }),

    // Track referral click (public)
    trackClick: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        await db.trackReferralClick(input.code);
        return { success: true };
      }),
  }),

  // Activity Log Router
  activityLog: router({
    // Get recent activity for user
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserRecentActivity(ctx.user.id, input?.limit || 10);
      }),
  }),

  // Course Progress Router
  courseProgress: router({
    // Get user's course progress
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCourseProgress(ctx.user.id);
    }),

    // Mark a lesson as complete
    completeLesson: protectedProcedure
      .input(z.object({
        lessonId: z.string(),
        moduleId: z.string(),
        timeSpentSeconds: z.number().optional(),
        quizScore: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.markLessonComplete(
          ctx.user.id,
          input.lessonId,
          input.moduleId,
          input.timeSpentSeconds,
          input.quizScore
        );
      }),

    // Update time spent on a lesson
    updateTimeSpent: protectedProcedure
      .input(z.object({
        lessonId: z.string(),
        moduleId: z.string(),
        timeSpentSeconds: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateLessonTimeSpent(
          ctx.user.id,
          input.lessonId,
          input.moduleId,
          input.timeSpentSeconds
        );
      }),

    // Get certificate if earned
    getCertificate: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCertificate(ctx.user.id);
    }),

    // Generate certificate if all lessons complete
    generateCertificate: protectedProcedure.mutation(async ({ ctx }) => {
      return await db.generateCourseCertificate(ctx.user.id);
    }),
  }),



  // User Profile Router
  profile: router({
    // Get user profile
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      return profile || null;
    }),

    // Update user profile
    update: protectedProcedure
      .input(z.object({
        fullName: z.string().optional(),
        dateOfBirth: z.string().optional(), // YYYY-MM-DD format
        ssnLast4: z.string().max(4).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        currentAddress: z.string().optional(),
        currentCity: z.string().optional(),
        currentState: z.string().optional(),
        currentZip: z.string().optional(),
        previousAddress: z.string().optional(),
        previousCity: z.string().optional(),
        previousState: z.string().optional(),
        previousZip: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.upsertUserProfile(ctx.user.id, input);
        
        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          activityType: 'profile_updated',
          description: 'Updated profile information',
        });
        
        return profile;
      }),

    // Get formatted address for letters
    getFormattedAddress: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      return {
        currentAddress: db.formatProfileAddress(profile),
        previousAddress: db.formatPreviousAddress(profile),
        fullName: profile?.fullName || ctx.user.name || '',
        dateOfBirth: profile?.dateOfBirth || '',
        ssnLast4: profile?.ssnLast4 || '',
        phone: profile?.phone || '',
        email: profile?.email || ctx.user.email || '',
      };
    }),
  }),

  // Agency Router - B2B multi-client management
  agency: router({
    // Get agency dashboard stats
    getStats: agencyProcedure.query(async ({ ctx }) => {
      return await db.getAgencyStats(ctx.user.id);
    }),

    // Check if user is an agency
    isAgency: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const agency = await db.getAgencyStats(ctx.user.id);
      return {
        isAgency: user?.accountType === 'agency' || !!agency,
        agencyName: agency?.agencyName,
        planTier: agency?.planTier,
        clientSlotsIncluded: agency?.clientSlotsIncluded || 0,
        clientSlotsUsed: agency?.clientSlotsUsed || 0,
      };
    }),

    // Upgrade to agency account
    upgradeToAgency: protectedProcedure
      .input(z.object({
        agencyName: z.string().min(2).max(255),
        planTier: z.enum(['starter', 'professional', 'enterprise']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upgradeToAgency(ctx.user.id, input.agencyName, input.planTier);
        return { success: true };
      }),

    // Client management
    clients: router({
      // List all clients
      list: agencyProcedure.query(async ({ ctx }) => {
        return await db.getAgencyClients(ctx.user.id);
      }),

      // Get single client
      get: agencyProcedure
        .input(z.object({ clientId: z.number() }))
        .query(async ({ ctx, input }) => {
          const client = await db.getAgencyClient(input.clientId, ctx.user.id);
          if (!client) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' });
          }
          return client;
        }),

      // Create new client
      create: agencyProcedure
        .input(z.object({
          clientName: z.string().min(2).max(255),
          clientEmail: z.string().email().optional(),
          clientPhone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          ssnLast4: z.string().max(4).optional(),
          currentAddress: z.string().optional(),
          currentCity: z.string().optional(),
          currentState: z.string().optional(),
          currentZip: z.string().optional(),
          previousAddress: z.string().optional(),
          previousCity: z.string().optional(),
          previousState: z.string().optional(),
          previousZip: z.string().optional(),
          internalNotes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const agencyStats = await db.getAgencyStats(ctx.user.id);
          
          if (!agencyStats) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Agency stats not found. Please contact support.',
            });
          }

          if (agencyStats.clientSlotsUsed >= agencyStats.clientSlotsIncluded) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: `Client limit reached. Your current plan allows for ${agencyStats.clientSlotsIncluded} clients. Please upgrade your plan.`,
            });
          }

          const client = await db.createAgencyClient({
            agencyUserId: ctx.user.id,
            ...input,
          });
          return client;
        }),

      // Update client
      update: agencyProcedure
        .input(z.object({
          clientId: z.number(),
          clientName: z.string().min(2).max(255).optional(),
          clientEmail: z.string().email().optional(),
          clientPhone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          ssnLast4: z.string().max(4).optional(),
          currentAddress: z.string().optional(),
          currentCity: z.string().optional(),
          currentState: z.string().optional(),
          currentZip: z.string().optional(),
          previousAddress: z.string().optional(),
          previousCity: z.string().optional(),
          previousState: z.string().optional(),
          previousZip: z.string().optional(),
          internalNotes: z.string().optional(),
          status: z.enum(['active', 'archived', 'paused']).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { clientId, ...updates } = input;
          return await db.updateAgencyClient(clientId, ctx.user.id, updates);
        }),

      // Archive client
      archive: agencyProcedure
        .input(z.object({ clientId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await db.archiveAgencyClient(input.clientId, ctx.user.id);
          return { success: true };
        }),

      // Get client reports
      getReports: agencyProcedure
        .input(z.object({ clientId: z.number() }))
        .query(async ({ ctx, input }) => {
          return await db.getAgencyClientReports(input.clientId, ctx.user.id);
        }),

      // Get client accounts
      getAccounts: agencyProcedure
        .input(z.object({ clientId: z.number() }))
        .query(async ({ ctx, input }) => {
          return await db.getAgencyClientAccounts(input.clientId, ctx.user.id);
        }),

      // Get client letters
      getLetters: agencyProcedure
        .input(z.object({ clientId: z.number() }))
        .query(async ({ ctx, input }) => {
          return await db.getAgencyClientLetters(input.clientId, ctx.user.id);
        }),

      // Upload report for client
      uploadReport: agencyProcedure
        .input(z.object({
          clientId: z.number(),
          fileName: z.string(),
          fileUrl: z.string(),
          fileKey: z.string(),
          bureau: z.enum(['transunion', 'equifax', 'experian']),
        }))
        .mutation(async ({ ctx, input }) => {
          // Verify client belongs to this agency
          const client = await db.getAgencyClient(input.clientId, ctx.user.id);
          if (!client) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' });
          }

          const report = await db.createAgencyClientReport({
            agencyClientId: input.clientId,
            agencyUserId: ctx.user.id,
            bureau: input.bureau,
            fileUrl: input.fileUrl,
            fileKey: input.fileKey,
            fileName: input.fileName,
            isParsed: false,
          });

          if (!report) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create report' });
          }

          // Trigger AI parsing in background
          const { parseAndSaveAgencyClientReport } = await import('./creditReportParser');
          parseAndSaveAgencyClientReport(report.id, input.fileUrl, input.bureau, input.clientId, ctx.user.id).catch((err: Error) => {
            console.error('Failed to parse agency client report:', err);
          });

          return {
            reportId: report.id,
            success: true,
            message: 'Report uploaded successfully. AI is extracting accounts...',
          };
        }),

      // Generate dispute letter for client
      generateLetter: agencyProcedure
        .input(z.object({
          clientId: z.number(),
          bureau: z.enum(['transunion', 'equifax', 'experian', 'furnisher', 'collector', 'creditor']),
          accountIds: z.array(z.number()),
          letterType: z.enum(['initial', 'followup', 'escalation', 'cfpb', 'cease_desist', 'pay_for_delete', 'intent_to_sue', 'estoppel', 'debt_validation']).default('initial'),
          round: z.number().default(1),
        }))
        .mutation(async ({ ctx, input }) => {
          // Verify client belongs to this agency
          const client = await db.getAgencyClient(input.clientId, ctx.user.id);
          if (!client) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' });
          }

          // Get selected accounts
          const accounts = await db.getAgencyClientAccountsByIds(input.accountIds, input.clientId, ctx.user.id);
          if (accounts.length === 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid accounts selected' });
          }

          // Generate letter content using AI
          const { generateAgencyClientLetter } = await import('./letterGenerator');
          const letterContent = await generateAgencyClientLetter({
            client,
            accounts,
            bureau: input.bureau,
            letterType: input.letterType,
            round: input.round,
          });

          // Get bureau address
          const bureauAddresses: Record<string, string> = {
            transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
            equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
            experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
            furnisher: accounts[0]?.accountName || 'Furnisher',
            collector: accounts[0]?.accountName || 'Collection Agency',
            creditor: accounts[0]?.originalCreditor || accounts[0]?.accountName || 'Creditor',
          };

          // Save letter
          const letter = await db.createAgencyClientLetter({
            agencyClientId: input.clientId,
            agencyUserId: ctx.user.id,
            bureau: input.bureau,
            recipientName: input.bureau.charAt(0).toUpperCase() + input.bureau.slice(1),
            recipientAddress: bureauAddresses[input.bureau],
            letterContent,
            accountsDisputed: JSON.stringify(accounts.map(a => ({ id: a.id, name: a.accountName, balance: a.balance }))),
            round: input.round,
            letterType: input.letterType,
            status: 'generated',
          });

          if (!letter) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create letter' });
          }

          // Update client stats
          await db.incrementAgencyClientLetterCount(input.clientId, ctx.user.id);

          return {
            letterId: letter.id,
            letterContent,
            success: true,
            message: 'Dispute letter generated successfully',
          };
        }),

      // Download letter as PDF
      downloadLetter: agencyProcedure
        .input(z.object({ letterId: z.number() }))
        .query(async ({ ctx, input }) => {
          const letter = await db.getAgencyClientLetter(input.letterId, ctx.user.id);
          if (!letter) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Letter not found' });
          }
          return letter;
        }),
    }),
}),
});

export type AppRouter = typeof appRouter;
