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
  MailingChecklist
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
