import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  creditReports,
  InsertCreditReport,
  CreditReport,
  negativeAccounts,
  InsertNegativeAccount,
  NegativeAccount,
  disputeLetters,
  InsertDisputeLetter,
  DisputeLetter,
  payments,
  InsertPayment,
  Payment,
  subscriptions,
  InsertSubscription,
  Subscription,
  mailingChecklists,
  InsertMailingChecklist,
  MailingChecklist,
  contactSubmissions,
  InsertContactSubmission,
  ContactSubmission,
  emailLeads,
  InsertEmailLead,
  EmailLead
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// CREDIT REPORT OPERATIONS
// ============================================================================

export async function createCreditReport(report: InsertCreditReport): Promise<CreditReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(creditReports).values(report);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(creditReports).where(eq(creditReports.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted credit report");
  
  return inserted[0];
}

export async function getCreditReportsByUserId(userId: number): Promise<CreditReport[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(creditReports)
    .where(eq(creditReports.userId, userId))
    .orderBy(desc(creditReports.uploadedAt));
}

export async function getCreditReportById(reportId: number): Promise<CreditReport | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(creditReports).where(eq(creditReports.id, reportId)).limit(1);
  return result[0];
}

export async function deleteCreditReport(reportId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(creditReports).where(eq(creditReports.id, reportId));
}

export async function deleteNegativeAccountsByReportId(reportId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the report to find userId
  const report = await getCreditReportById(reportId);
  if (!report) return;

  // Delete all negative accounts for this user
  // (User will re-upload and re-parse to get fresh data)
  await db.delete(negativeAccounts)
    .where(eq(negativeAccounts.userId, report.userId));
}

export async function updateCreditReportParsedData(reportId: number, parsedData: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(creditReports)
    .set({ parsedData, isParsed: true })
    .where(eq(creditReports.id, reportId));
}

// ============================================================================
// NEGATIVE ACCOUNT OPERATIONS
// ============================================================================

export async function createNegativeAccount(account: InsertNegativeAccount): Promise<NegativeAccount> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(negativeAccounts).values(account);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(negativeAccounts).where(eq(negativeAccounts.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted negative account");
  
  return inserted[0];
}

export async function getNegativeAccountsByUserId(userId: number): Promise<NegativeAccount[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(negativeAccounts)
    .where(eq(negativeAccounts.userId, userId))
    .orderBy(desc(negativeAccounts.createdAt));
}

export async function getNegativeAccountById(accountId: number): Promise<NegativeAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(negativeAccounts).where(eq(negativeAccounts.id, accountId)).limit(1);
  return result[0];
}

export async function updateNegativeAccountConflicts(
  accountId: number, 
  hasConflicts: boolean, 
  conflictDetails: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(negativeAccounts)
    .set({ hasConflicts, conflictDetails })
    .where(eq(negativeAccounts.id, accountId));
}

// ============================================================================
// DISPUTE LETTER OPERATIONS
// ============================================================================

export async function createDisputeLetter(letter: InsertDisputeLetter): Promise<DisputeLetter> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(disputeLetters).values(letter);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(disputeLetters).where(eq(disputeLetters.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted dispute letter");
  
  return inserted[0];
}

export async function getDisputeLettersByUserId(userId: number): Promise<DisputeLetter[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(disputeLetters)
    .where(eq(disputeLetters.userId, userId))
    .orderBy(desc(disputeLetters.createdAt));
}

export async function getDisputeLetterById(letterId: number): Promise<DisputeLetter | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(disputeLetters).where(eq(disputeLetters.id, letterId)).limit(1);
  return result[0];
}

export async function updateDisputeLetterStatus(
  letterId: number,
  status: DisputeLetter["status"],
  updates?: {
    mailedAt?: Date;
    trackingNumber?: string;
    responseDeadline?: Date;
    responseReceivedAt?: Date;
    responseDetails?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(disputeLetters)
    .set({ status, ...updates })
    .where(eq(disputeLetters.id, letterId));
}

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

export async function createPayment(payment: InsertPayment): Promise<Payment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(payments).where(eq(payments.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted payment");
  
  return inserted[0];
}

export async function getPaymentsByUserId(userId: number): Promise<Payment[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

export async function getUserLatestPayment(userId: number): Promise<Payment | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  
  return result[0] || null;
}

export async function updatePaymentStatus(
  paymentId: number,
  status: Payment["status"]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments)
    .set({ status })
    .where(eq(payments.id, paymentId));
}

// ============================================================================
// SUBSCRIPTION OPERATIONS
// ============================================================================

export async function createSubscription(subscription: InsertSubscription): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(subscription);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(subscriptions).where(eq(subscriptions.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted subscription");
  
  return inserted[0];
}

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  
  return result[0];
}

export async function updateSubscriptionStatus(
  subscriptionId: number,
  status: Subscription["status"],
  updates?: {
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions)
    .set({ status, ...updates })
    .where(eq(subscriptions.id, subscriptionId));
}

// ============================================================================
// MAILING CHECKLIST OPERATIONS
// ============================================================================

export async function createMailingChecklist(checklist: InsertMailingChecklist): Promise<MailingChecklist> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mailingChecklists).values(checklist);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(mailingChecklists).where(eq(mailingChecklists.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted mailing checklist");
  
  return inserted[0];
}

export async function getMailingChecklistByDisputeId(disputeLetterId: number): Promise<MailingChecklist | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(mailingChecklists)
    .where(eq(mailingChecklists.disputeLetterId, disputeLetterId))
    .limit(1);
  
  return result[0];
}

export async function updateMailingChecklist(
  checklistId: number,
  updates: Partial<Omit<MailingChecklist, 'id' | 'userId' | 'disputeLetterId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if all required fields are true to set completedAt
  const checklist = await db.select().from(mailingChecklists).where(eq(mailingChecklists.id, checklistId)).limit(1);
  if (checklist[0]) {
    const merged = { ...checklist[0], ...updates };
    const allComplete = 
      merged.printedLetters &&
      merged.signedInBlueInk &&
      merged.handwroteEnvelope &&
      merged.includedId &&
      merged.includedUtilityBill &&
      merged.includedSupportingDocs &&
      merged.mailedFromLocalPostOffice &&
      merged.gotCertifiedReceipt &&
      merged.uploadedTrackingNumber;
    
    if (allComplete && !merged.completedAt) {
      updates.completedAt = new Date();
    }
  }

  await db.update(mailingChecklists)
    .set(updates)
    .where(eq(mailingChecklists.id, checklistId));
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllDisputeLetters() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(disputeLetters).orderBy(desc(disputeLetters.createdAt));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(payments).orderBy(desc(payments.createdAt));
}


// ============================================================================
// LEAD OPERATIONS
// ============================================================================

export async function createLead(lead: {
  email: string;
  zipCode: string;
  creditScoreRange: string;
  negativeItemsCount: string;
  bureaus: string;
  source: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { leads } = await import("../drizzle/schema");
  
  const [newLead] = await db.insert(leads).values(lead).$returningId();
  return newLead;
}

export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  
  const { leads } = await import("../drizzle/schema");
  return db.select().from(leads);
}


// ============================================================================
// CONTACT FORM OPERATIONS
// ============================================================================

export async function createContactSubmission(submission: InsertContactSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [newSubmission] = await db.insert(contactSubmissions).values(submission).$returningId();
  return newSubmission.id;
}

export async function getAllContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}


// ============================================================================
// HYBRID PARSING SYSTEM OPERATIONS
// ============================================================================

/**
 * Get SmartCredit token for user
 */
export async function getSmartCreditToken(userId: number): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
  smartcreditUserId: string | null;
} | null> {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { smartcreditTokens } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const result = await dbInstance
    .select()
    .from(smartcreditTokens)
    .where(eq(smartcreditTokens.userId, userId))
    .limit(1);

  if (result.length === 0) return null;

  const token = result[0];
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt: token.expiresAt,
    smartcreditUserId: token.smartcreditUserId,
  };
}

/**
 * Insert or update SmartCredit token
 */
export async function upsertSmartCreditToken(data: {
  userId: number;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  smartcreditUserId?: string;
}): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) return;

  const { smartcreditTokens } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Check if token exists
  const existing = await dbInstance
    .select()
    .from(smartcreditTokens)
    .where(eq(smartcreditTokens.userId, data.userId))
    .limit(1);

  const now = new Date();

  if (existing.length > 0) {
    // Update
    await dbInstance
      .update(smartcreditTokens)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null,
        expiresAt: data.expiresAt || null,
        smartcreditUserId: data.smartcreditUserId || null,
        updatedAt: now,
      })
      .where(eq(smartcreditTokens.userId, data.userId));
  } else {
    // Insert
    await dbInstance.insert(smartcreditTokens).values({
      userId: data.userId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || null,
      expiresAt: data.expiresAt || null,
      smartcreditUserId: data.smartcreditUserId || null,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Insert parser comparison log
 */
export async function insertParserComparison(data: {
  userId: number;
  creditReportId?: number;
  bureau: string;
  customParserAccounts: string;
  customParserScore: number | null;
  customParserConfidence: number;
  smartcreditAccounts: string;
  smartcreditScore: number;
  differences: string;
  matchPercentage: number;
  majorDiscrepancies: number;
  selectedSource: string;
  selectionReason: string;
}): Promise<number> {
  const dbInstance = await getDb();
  if (!dbInstance) return 0;

  const { parserComparisons } = await import("../drizzle/schema");

  const result = await dbInstance.insert(parserComparisons).values({
    userId: data.userId,
    creditReportId: data.creditReportId || null,
    bureau: data.bureau,
    customParserAccounts: data.customParserAccounts,
    customParserScore: data.customParserScore,
    customParserConfidence: data.customParserConfidence,
    smartcreditAccounts: data.smartcreditAccounts,
    smartcreditScore: data.smartcreditScore,
    differences: data.differences,
    matchPercentage: data.matchPercentage,
    majorDiscrepancies: data.majorDiscrepancies,
    selectedSource: data.selectedSource,
    selectionReason: data.selectionReason,
    createdAt: new Date(),
  });

  return Number((result as any).insertId || 0);
}

/**
 * Get parser accuracy metrics for date range
 */
export async function getParserAccuracyMetrics(startDate: string, endDate: string): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { parserAccuracyMetrics } = await import("../drizzle/schema");
  const { gte, lte, and } = await import("drizzle-orm");

  const result = await dbInstance
    .select()
    .from(parserAccuracyMetrics)
    .where(
      and(
        gte(parserAccuracyMetrics.date, startDate),
        lte(parserAccuracyMetrics.date, endDate)
      )
    );

  return result;
}

/**
 * Get recent parser comparisons for analysis
 */
export async function getRecentParserComparisons(limit: number = 100): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { parserComparisons } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");

  const result = await dbInstance
    .select()
    .from(parserComparisons)
    .orderBy(desc(parserComparisons.createdAt))
    .limit(limit);

  return result;
}

// ============================================================================
// EMAIL LEAD OPERATIONS
// ============================================================================

/**
 * Create email lead from exit-intent popup or lead magnets
 */
export async function createEmailLead(data: { email: string; source: string }): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) {
    console.warn("[Database] Cannot create email lead - no database connection");
    return;
  }

  const { emailLeads } = await import("../drizzle/schema");

  await dbInstance.insert(emailLeads).values({
    email: data.email,
    source: data.source,
  });
}

/**
 * Send free guide email to captured lead
 */
export async function sendFreeGuideEmail(email: string): Promise<void> {
  const { sendEmail } = await import("./emailService");

  const subject = "Your Free Guide: How to Read Your Credit Report Like a Pro";
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Free Guide is Here!</h1>
      </div>
      
      <div style="padding: 40px 20px; background: #ffffff;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Thanks for your interest in DisputeForce! Here's your free guide to reading your credit report like a pro.
        </p>
        
        <h2 style="color: #1f2937; font-size: 22px; margin-top: 30px;">How to Read Your Credit Report Like a Pro</h2>
        
        <h3 style="color: #ea580c; font-size: 18px; margin-top: 25px;">The 7 Most Common Credit Report Errors</h3>
        <ol style="font-size: 15px; color: #4b5563; line-height: 1.8;">
          <li><strong>Accounts that don't belong to you</strong> - Identity theft or mixed files</li>
          <li><strong>Incorrect late payment dates</strong> - Payments marked late when they were on time</li>
          <li><strong>Duplicate accounts</strong> - Same debt listed multiple times</li>
          <li><strong>Incorrect balances</strong> - Higher than actual balance owed</li>
          <li><strong>Closed accounts listed as open</strong> - Accounts you closed showing as active</li>
          <li><strong>Outdated negative items</strong> - Items older than 7 years still reporting</li>
          <li><strong>Cross-bureau conflicts</strong> - Different information on different bureaus</li>
        </ol>
        
        <h3 style="color: #ea580c; font-size: 18px; margin-top: 25px;">Your FCRA § 611 Rights</h3>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.8;">
          Under the Fair Credit Reporting Act (FCRA) Section 611, you have the legal right to dispute any information in your credit report that you believe is inaccurate, incomplete, or unverifiable. Credit bureaus MUST investigate your disputes within 30 days.
        </p>
        
        <h3 style="color: #ea580c; font-size: 18px; margin-top: 25px;">Step-by-Step Review Checklist</h3>
        <ul style="font-size: 15px; color: #4b5563; line-height: 1.8;">
          <li>✓ Verify your personal information (name, address, SSN)</li>
          <li>✓ Check all account numbers and balances</li>
          <li>✓ Review payment history for each account</li>
          <li>✓ Look for duplicate accounts</li>
          <li>✓ Verify all inquiries are authorized</li>
          <li>✓ Compare reports from all 3 bureaus for conflicts</li>
          <li>✓ Check dates - negative items should fall off after 7 years</li>
        </ul>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
          <p style="margin: 0; font-size: 15px; color: #78350f;">
            <strong>Pro Tip:</strong> Cross-bureau conflicts are one of the strongest arguments for deletion. If Equifax shows a balance of $500 but Experian shows $1,000 for the same account, both can't be accurate - demand deletion.
          </p>
        </div>
        
        <h3 style="color: #ea580c; font-size: 18px; margin-top: 25px;">Ready to Take Action?</h3>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.8;">
          DisputeForce makes it easy to exercise your FCRA § 611 rights with AI-powered Attack letters and litigation-grade FCRA citations. You're in control - launch your Attacks, track your progress, and improve what matters most.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://disputestrike.com/quiz" style="display: inline-block; background: #ea580c; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Start Your Journey Free
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">
          Questions? Reply to this email - we're here to help.
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          DisputeForce - The Force Behind Your Credit Disputes
        </p>
        <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">
          <a href="https://disputestrike.com" style="color: #ea580c; text-decoration: none;">disputestrike.com</a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html: htmlContent,
  });
}
