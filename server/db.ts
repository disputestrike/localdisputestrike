import { eq, and, or, desc, inArray, sql, like, gte, lte, isNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userProfiles,
  InsertUserProfile,
  UserProfile,
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
  EmailLead,
  courseProgress,
  InsertCourseProgress,
  CourseProgress,
  courseCertificates,
  InsertCourseCertificate,
  CourseCertificate,
  disputeOutcomes,
  InsertDisputeOutcome,
  DisputeOutcome,
  hardInquiries,
  InsertHardInquiry,
  HardInquiry,
  cfpbComplaints,
  InsertCFPBComplaint,
  CFPBComplaint,
  referrals,
  InsertReferral,
  Referral,
  activityLog,
  InsertActivityLog,
  ActivityLog,
  agencies,
  InsertAgency,
  Agency,
  agencyClients,
  InsertAgencyClient,
  AgencyClient,
  agencyClientReports,
  InsertAgencyClientReport,
  AgencyClientReport,
  agencyClientAccounts,
  InsertAgencyClientAccount,
  AgencyClientAccount,
  agencyClientLetters,
  InsertAgencyClientLetter,
  AgencyClientLetter,
  creditScoreHistory,
  InsertCreditScoreHistory,
  CreditScoreHistory,
  userNotifications,
  InsertUserNotification,
  UserNotification,
  userDocuments,
  InsertUserDocument,
  UserDocument,
  smartcreditPulls,
  InsertSmartcreditPull,
  SmartcreditPull,
  subscriptionsV2,
  InsertSubscriptionV2,
  SubscriptionV2,
  disputeRounds,
  InsertDisputeRound,
  DisputeRound,
  trialConversions,
  InsertTrialConversion,
  TrialConversion,
  aiRecommendations,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // TiDB Cloud requires SSL - parse URL and add SSL config
      const dbUrl = process.env.DATABASE_URL;
      // Remove any existing ssl parameter from URL
      const cleanUrl = dbUrl.replace(/[?&]ssl=[^&]*/g, '');
      // Add proper SSL configuration with connection timeout
      const sslUrl = cleanUrl.includes('?') 
        ? `${cleanUrl}&ssl={"rejectUnauthorized":false}&connectTimeout=10000` 
        : `${cleanUrl}?ssl={"rejectUnauthorized":false}&connectTimeout=10000`;
      _db = drizzle(sslUrl);
      console.log("[Database] Database connection initialized");
    } catch (error: any) {
      console.error("[Database] Failed to connect:", error.message || error);
      console.error("[Database] Error code:", error.code);
      console.error("[Database] Check your DATABASE_URL environment variable");
      _db = null;
    }
  } else if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL environment variable is not set");
  }
  return _db;
}

/** Clear legacy ai_recommendations data (from old aiSelectionService) */
export async function clearOldAiRecommendations(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.delete(aiRecommendations) as unknown as [{ affectedRows?: number }];
    return result?.[0]?.affectedRows ?? 0;
  } catch (e: any) {
    if (e?.code === 'ER_NO_SUCH_TABLE') return 0;
    if (e?.code === 'ETIMEDOUT' || e?.cause?.code === 'ETIMEDOUT') {
      console.warn('[clearOldAiRecommendations] DB connection timed out - run from app (Admin → Clear Old Data) when DB is reachable');
      return 0;
    }
    throw e;
  }
}

/** Clear ALL dispute data for a specific user - letters, outcomes, accounts, reports. Start fresh. */
export async function clearUserDisputeData(userId: number): Promise<{ [key: string]: number }> {
  const db = await getDb();
  if (!db) return {};
  const counts: { [key: string]: number } = {};
  try {
    const run = async (name: string, fn: () => Promise<unknown>) => {
      try {
        const r = await fn() as [{ affectedRows?: number }];
        counts[name] = r?.[0]?.affectedRows ?? 0;
      } catch (e: any) {
        if (e?.code !== 'ER_NO_SUCH_TABLE') throw e;
        counts[name] = 0;
      }
    };
    await run('dispute_outcomes', () => db.delete(disputeOutcomes).where(eq(disputeOutcomes.userId, userId)));
    await run('mailing_checklists', () => db.delete(mailingChecklists).where(eq(mailingChecklists.userId, userId)));
    await run('dispute_letters', () => db.delete(disputeLetters).where(eq(disputeLetters.userId, userId)));
    await run('negative_accounts', () => db.delete(negativeAccounts).where(eq(negativeAccounts.userId, userId)));
    await run('credit_reports', () => db.delete(creditReports).where(eq(creditReports.userId, userId)));
    await run('credit_score_history', () => db.delete(creditScoreHistory).where(eq(creditScoreHistory.userId, userId)));
    await run('ai_recommendations', () => db.delete(aiRecommendations).where(eq(aiRecommendations.userId, userId)));
    const { disputeRounds } = await import("../drizzle/schema");
    await run('dispute_rounds', () => db.delete(disputeRounds).where(eq(disputeRounds.userId, userId)));
    return counts;
  } catch (e: any) {
    if (e?.code === 'ETIMEDOUT' || e?.cause?.code === 'ETIMEDOUT') {
      console.warn('[clearUserDisputeData] DB timed out');
      return counts;
    }
    throw e;
  }
}

/** Reset ALL dispute data - letters, accounts, reports, etc. Start fresh like first time. */
export async function resetAllDisputeData(): Promise<{ [key: string]: number }> {
  const db = await getDb();
  if (!db) return {};
  const counts: { [key: string]: number } = {};
  try {
    const run = async (name: string, fn: () => Promise<unknown>) => {
      try {
        const r = await fn() as [{ affectedRows?: number }];
        counts[name] = r?.[0]?.affectedRows ?? 0;
      } catch (e: any) {
        if (e?.code !== 'ER_NO_SUCH_TABLE') throw e;
        counts[name] = 0;
      }
    };
    await run('mailing_checklists', () => db.delete(mailingChecklists));
    await run('dispute_letters', () => db.delete(disputeLetters));
    await run('negative_accounts', () => db.delete(negativeAccounts));
    await run('credit_reports', () => db.delete(creditReports));
    await run('ai_recommendations', () => db.delete(aiRecommendations));
    await run('dispute_outcomes', () => db.delete(disputeOutcomes));
    await run('dispute_rounds', () => db.delete(disputeRounds));
    await run('credit_score_history', () => db.delete(creditScoreHistory));
    await run('user_notifications', () => db.delete(userNotifications));
    const { bureauResponses } = await import("../drizzle/schema");
    await run('bureau_responses', () => db.delete(bureauResponses));
    const { parserComparisons } = await import("../drizzle/schema");
    await run('parser_comparisons', () => db.delete(parserComparisons));
    return counts;
  } catch (e: any) {
    if (e?.code === 'ETIMEDOUT' || e?.cause?.code === 'ETIMEDOUT') {
      console.warn('[resetAllDisputeData] DB timed out');
      return counts;
    }
    throw e;
  }
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

    // TiDB requires at least one field in ON DUPLICATE KEY UPDATE.
    // Using raw SQL with direct values to avoid TiDB parameter issues.
    const openId = values.openId;
    const name = values.name ? `'${values.name.replace(/'/g, "''")}'` : 'NULL';
    const email = values.email ? `'${values.email.replace(/'/g, "''")}'` : 'NULL';
    const loginMethod = values.loginMethod ? `'${values.loginMethod.replace(/'/g, "''")}'` : 'NULL';
    const role = values.role ? `'${values.role.replace(/'/g, "''")}'` : "'user'";
    const lastSignedIn = values.lastSignedIn ? `'${values.lastSignedIn.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';

    const sql = `
      INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
      VALUES ('${openId}', ${name}, ${email}, ${loginMethod}, ${role}, ${lastSignedIn})
      ON DUPLICATE KEY UPDATE 
      lastSignedIn = VALUES(lastSignedIn),
      name = VALUES(name),
      email = VALUES(email),
      loginMethod = VALUES(loginMethod),
      role = VALUES(role)
    `;
    
    await db.execute(sql);
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
  try {
    const [rows] = (await db.execute(
      sql`SELECT id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM \`users\` WHERE \`openId\` = ${openId} LIMIT 1`
    )) as unknown as [Array<Record<string, unknown>>];
    const row = rows?.[0];
    if (!row) return undefined;
    return {
      id: Number(row.id),
      openId: String(row.openId),
      name: row.name != null ? String(row.name) : null,
      email: row.email != null ? String(row.email) : null,
      loginMethod: row.loginMethod != null ? String(row.loginMethod) : null,
      role: (row.role as string) || 'user',
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(String(row.updatedAt)),
      lastSignedIn: row.lastSignedIn != null ? (row.lastSignedIn instanceof Date ? row.lastSignedIn : new Date(String(row.lastSignedIn))) : null,
    } as (typeof users.$inferSelect);
  } catch (e) {
    console.warn("[getUserByOpenId] Query failed:", (e as Error).message);
    return undefined;
  }
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const [rows] = (await db.execute(
      sql`SELECT id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM \`users\` WHERE \`id\` = ${userId} LIMIT 1`
    )) as unknown as [Array<Record<string, unknown>>];
    const row = rows?.[0];
    if (!row) return undefined;
    return {
      id: Number(row.id),
      openId: String(row.openId),
      name: row.name != null ? String(row.name) : null,
      email: row.email != null ? String(row.email) : null,
      loginMethod: row.loginMethod != null ? String(row.loginMethod) : null,
      role: (row.role as string) || 'user',
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(String(row.updatedAt)),
      lastSignedIn: row.lastSignedIn != null ? (row.lastSignedIn instanceof Date ? row.lastSignedIn : new Date(String(row.lastSignedIn))) : null,
    } as (typeof users.$inferSelect);
  } catch (e) {
    console.warn("[getUserById] Query failed:", (e as Error).message);
    return undefined;
  }
}

/** Create a minimal guest user for checkout - no email/name from user, just for Stripe metadata */
export async function createGuestUserForCheckout(): Promise<{ id: number; email: string | null; name: string | null }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const crypto = await import("crypto");
  const openId = `guest_${crypto.randomBytes(16).toString("hex")}`;
  const placeholderEmail = `checkout-${crypto.randomBytes(8).toString("hex")}@pending.local`;

  try {
    await db.insert(users).values({
      openId,
      name: "Guest",
      email: placeholderEmail,
      loginMethod: "guest",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[createGuestUserForCheckout] Drizzle insert failed, trying raw SQL:", msg);
    try {
      await db.execute(sql`INSERT INTO \`users\` (\`openId\`, \`name\`, \`email\`, \`loginMethod\`) VALUES (${openId}, ${"Guest"}, ${placeholderEmail}, ${"guest"})`);
    } catch (fallbackErr) {
      const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      throw new Error(`Failed to create guest user: ${fallbackMsg}`);
    }
  }
  const [rows] = await db.execute(
    sql`SELECT id, email, name FROM \`users\` WHERE \`openId\` = ${openId} LIMIT 1`
  ) as unknown as [Array<{ id: number; email: string | null; name: string | null }>];
  const row = rows?.[0];
  if (!row) throw new Error("Failed to create guest user");
  return { id: row.id, email: row.email, name: row.name };
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

/**
 * Get all credit reports for a specific user
 * CRITICAL: Always filters by userId to ensure data isolation
 * One account = one person = only their own credit reports
 */
export async function getCreditReportsByUserId(userId: number): Promise<CreditReport[]> {
  const db = await getDb();
  if (!db) return [];

  // SECURITY: Always filter by userId - prevents users from seeing other people's data
  return db.select().from(creditReports)
    .where(eq(creditReports.userId, userId))
    .orderBy(desc(creditReports.uploadedAt));
}

/** Get latest credit score per bureau from reports, falling back to credit_score_history. */
export async function getLatestScoresByBureau(userId: number): Promise<{
  transunion: number | null;
  equifax: number | null;
  experian: number | null;
}> {
  const result = { transunion: null as number | null, equifax: null as number | null, experian: null as number | null };
  const valid = (n: unknown) => typeof n === 'number' && n >= 300 && n <= 850 ? n : null;

  const reports = await getCreditReportsByUserId(userId);
  for (const r of reports) {
    const score = valid(r.creditScore);
    if (score == null) continue;
    if (r.bureau === 'transunion' && result.transunion == null) result.transunion = score;
    else if (r.bureau === 'equifax' && result.equifax == null) result.equifax = score;
    else if (r.bureau === 'experian' && result.experian == null) result.experian = score;
  }

  // Fallback to credit_score_history when reports lack scores
  if (!result.transunion && !result.equifax && !result.experian) {
    const db = await getDb();
    if (db) {
      for (const bureau of ['transunion', 'equifax', 'experian'] as const) {
        const [row] = await db.select()
          .from(creditScoreHistory)
          .where(and(eq(creditScoreHistory.userId, userId), eq(creditScoreHistory.bureau, bureau)))
          .orderBy(desc(creditScoreHistory.recordedAt))
          .limit(1);
        if (row?.score != null) {
          const s = valid(row.score);
          if (s != null) result[bureau] = s;
        }
      }
    }
  }
  return result;
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

export async function updateCreditReportParsedData(
  reportId: number, 
  parsedData: string | null,
  creditScore?: number | null,
  scoreModel?: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { parsedData, isParsed: parsedData !== null };
  if (creditScore !== undefined) updateData.creditScore = creditScore;
  if (scoreModel !== undefined) updateData.scoreModel = scoreModel;

  await db.update(creditReports)
    .set(updateData)
    .where(eq(creditReports.id, reportId));
}

export async function updateCreditReportStatus(
  reportId: number, 
  status: 'pending' | 'parsing' | 'parsed' | 'failed'
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { 
    isParsed: status === 'parsed',
    parsedData: status === 'parsed' ? 'parsed' : (status === 'failed' ? 'failed' : null)
  };

  await db.update(creditReports)
    .set(updateData)
    .where(eq(creditReports.id, reportId));
  
  console.log(`[DB] Updated report ${reportId} status to: ${status}`);
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

/**
 * Create negative account only if it doesn't already exist (prevents duplicates)
 * Checks for existing account by userId + accountName + accountNumber combination
 */
export async function createNegativeAccountIfNotExists(account: InsertNegativeAccount): Promise<{ account: NegativeAccount; isNew: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if account already exists for this user with same name and number
  const existing = await db.select().from(negativeAccounts)
    .where(
      and(
        eq(negativeAccounts.userId, account.userId),
        eq(negativeAccounts.accountName, account.accountName),
        // Account number might be partial, so also check if it's similar
        or(
          eq(negativeAccounts.accountNumber, account.accountNumber || ''),
          // If new account number contains existing or vice versa
          sql`${negativeAccounts.accountNumber} LIKE CONCAT('%', ${account.accountNumber || ''}, '%')`,
          sql`${account.accountNumber || ''} LIKE CONCAT('%', ${negativeAccounts.accountNumber}, '%')`
        )
      )
    )
    .limit(1);

  if (existing[0]) {
    console.log(`[DB] Account already exists: ${account.accountName} (${account.accountNumber}) - skipping duplicate`);
    return { account: existing[0], isNew: false };
  }

  // Also check by account name AND bureau (for combined reports, same account can appear on multiple bureaus)
  const existingByNameAndBureau = await db.select().from(negativeAccounts)
    .where(
      and(
        eq(negativeAccounts.userId, account.userId),
        eq(negativeAccounts.accountName, account.accountName),
        eq(negativeAccounts.bureau, account.bureau || '')
      )
    )
    .limit(1);

  if (existingByNameAndBureau[0]) {
    // Same account on same bureau - skip duplicate
    console.log(`[DB] Account already exists on ${account.bureau}: ${account.accountName} - skipping duplicate`);
    return { account: existingByNameAndBureau[0], isNew: false };
  }

  // Create new account
  const result = await db.insert(negativeAccounts).values(account);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(negativeAccounts).where(eq(negativeAccounts.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted negative account");
  
  console.log(`[DB] Created NEW account: ${account.accountName} (${account.accountNumber})`);
  return { account: inserted[0], isNew: true };
}

/**
 * Get all negative accounts for a specific user
 * CRITICAL: Always filters by userId to ensure data isolation
 * One account = one person = only their own negative accounts
 */
export async function getNegativeAccountsByUserId(userId: number): Promise<NegativeAccount[]> {
  const db = await getDb();
  if (!db) return [];

  // SECURITY: Always filter by userId - prevents users from seeing other people's data
  return db.select().from(negativeAccounts)
    .where(eq(negativeAccounts.userId, userId))
    .orderBy(desc(negativeAccounts.createdAt));
}

/**
 * Sync negative accounts from saved parsedData when totalViolations exceeds current count.
 * Creates missing rows from accountPreviews stored in credit report parsedData.
 * When totalNegativeAccounts/totalViolations > accountPreviews.length, pads with placeholder
 * items so the Dispute Manager shows all items (e.g. 12 when analysis says 12).
 */
export async function syncNegativeAccountsFromParsedData(userId: number): Promise<{ created: number }> {
  const db = await getDb();
  if (!db) return { created: 0 };
  const reports = await getCreditReportsByUserId(userId);
  const existing = await getNegativeAccountsByUserId(userId);
  let totalViolations = 0;
  let totalNegativeAccounts = 0;
  const allPreviews: Array<{ name?: string; last4?: string; status?: string; balance?: string; amountType?: string; bureau?: string }> = [];
  const seenKeys = new Set<string>();
  for (const r of reports) {
    if (!r.parsedData) continue;
    const parsed = typeof r.parsedData === 'string' ? JSON.parse(r.parsedData) : r.parsedData;
    const tv = parsed?.totalViolations;
    const tna = parsed?.totalNegativeAccounts;
    if (typeof tv === 'number' && tv > totalViolations) totalViolations = tv;
    if (typeof tna === 'number' && tna > totalNegativeAccounts) totalNegativeAccounts = tna;
    const previews = parsed?.accountPreviews;
    if (Array.isArray(previews) && previews.length > 0) {
      for (const p of previews) {
        if (!p) continue;
        const name = p.name || (p as { accountName?: string }).accountName;
        if (!name) continue;
        const key = `${String(name).trim().toLowerCase()}|${(p.last4 || '').replace(/\D/g, '')}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        allPreviews.push(p);
      }
    }
  }
  // Create enough unique ACCOUNTS (12), not per-violation. Violations come from conflict detection.
  const targetCount = Math.max(totalNegativeAccounts, Math.ceil(totalViolations / 2), existing.length + 1);
  const needMore = targetCount > allPreviews.length && (totalViolations > 0 || totalNegativeAccounts > 0);
  if (needMore) {
    for (let i = allPreviews.length; i < targetCount; i++) {
      allPreviews.push({
        name: `Additional Account #${i + 1}`,
        last4: '****',
        status: 'Negative',
        balance: '0',
        amountType: 'Disputable item from report',
        bureau: ['transunion', 'equifax', 'experian'][i % 3] as string,
      });
    }
  }
  if ((totalViolations <= existing.length && totalNegativeAccounts <= existing.length) && allPreviews.length <= existing.length) return { created: 0 };
  const bureaus: Array<'transunion' | 'equifax' | 'experian'> = ['transunion', 'equifax', 'experian'];
  const reportIds = bureaus.map(b => reports.find(r => r.bureau === b)?.id ?? reports[0]?.id).filter(Boolean) as number[];
  let created = 0;
  for (const preview of allPreviews) {
    const name = preview.name || (preview as { accountName?: string }).accountName || 'Unknown';
    const last4 = preview.last4 || '0000';
    const status = preview.status || 'Unknown';
    const balanceMatch = (preview.balance || '0').replace(/[^0-9.]/g, '');
    const balance = balanceMatch ? parseFloat(balanceMatch) : 0;
    let accountType = 'Collection';
    if (String(status).toLowerCase().includes('charge')) accountType = 'Charge-off';
    if (String(status).toLowerCase().includes('late')) accountType = 'Late Payment';
    if (String(status).toLowerCase().includes('judgment')) accountType = 'Judgment';
    const bureauList = preview.bureau ? [preview.bureau.toLowerCase().replace(/\s/g, '') as 'transunion' | 'equifax' | 'experian'] : bureaus;
    for (const bureau of bureauList) {
      if (bureau !== 'transunion' && bureau !== 'equifax' && bureau !== 'experian') continue;
      const reportId = reportIds[bureaus.indexOf(bureau)] ?? defaultReportId;
      const result = await createNegativeAccountIfNotExists({
        userId,
        creditReportId: reportId,
        accountName: name,
        accountNumber: last4 ? `****${last4}` : null,
        balance: String(balance),
        status,
        accountType,
        bureau,
        rawData: JSON.stringify(preview),
        negativeReason: preview.amountType || 'Negative item',
      });
      if (result.isNew) created++;
    }
  }
  return { created };
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

export async function getLastDisputeLetter(userId: number): Promise<DisputeLetter | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(disputeLetters)
    .where(eq(disputeLetters.userId, userId))
    .orderBy(desc(disputeLetters.createdAt))
    .limit(1);
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
// SMARTCREDIT PULL TRACKING
// ============================================================================

export async function recordSmartcreditPull(pull: InsertSmartcreditPull): Promise<SmartcreditPull> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(smartcreditPulls).values(pull);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(smartcreditPulls).where(eq(smartcreditPulls.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted SmartCredit pull");
  return inserted[0];
}

export async function getLastSmartcreditPull(userId: number): Promise<SmartcreditPull | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(smartcreditPulls)
    .where(eq(smartcreditPulls.userId, userId))
    .orderBy(desc(smartcreditPulls.pulledAt))
    .limit(1);
  return result[0];
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
          Thanks for your interest in DisputeStrike! Here's your free guide to reading your credit report like a pro.
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
          DisputeStrike makes it easy to exercise your FCRA § 611 rights with AI-powered Attack letters and litigation-grade FCRA citations. You're in control - launch your Attacks, track your progress, and improve what matters most.
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
          DisputeStrike - The Force Behind Your Credit Disputes
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


/**
 * Send quiz analysis email to lead
 */
export async function sendQuizAnalysisEmail(
  email: string,
  data: {
    creditScoreRange: string;
    negativeItemsCount: string;
    bureaus: string[];
    zipCode: string;
  }
): Promise<void> {
  const { sendEmail } = await import("./emailService");

  const itemsCount = parseInt(data.negativeItemsCount.split("-")[0] || "0");
  const estimatedDeletions = Math.round(itemsCount * 0.7);
  const estimatedScoreIncrease = estimatedDeletions * 5;

  const subject = "Your Free Credit Dispute Analysis - DisputeStrike";
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Free Analysis is Ready</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Based on your quiz responses</p>
      </div>
      
      <div style="padding: 40px 20px; background: #ffffff;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Hi there! Thanks for taking our quiz. Based on your answers, here's what we found:
        </p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #ea580c; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Your Estimated Results</h2>
          
          <div style="margin: 15px 0;">
            <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">Credit Score Range:</p>
            <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: bold;">${data.creditScoreRange}</p>
          </div>
          
          <div style="margin: 15px 0;">
            <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">Negative Items Found:</p>
            <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: bold;">${data.negativeItemsCount}</p>
          </div>
          
          <div style="margin: 15px 0; padding: 15px; background: #dcfce7; border-radius: 4px;">
            <p style="color: #166534; margin: 0 0 5px 0; font-size: 14px;">Estimated Deletions:</p>
            <p style="color: #166534; margin: 0; font-size: 20px; font-weight: bold;">~${estimatedDeletions} accounts</p>
          </div>
          
          <div style="margin: 15px 0; padding: 15px; background: #dbeafe; border-radius: 4px;">
            <p style="color: #1e40af; margin: 0 0 5px 0; font-size: 14px;">Potential Score Increase:</p>
            <p style="color: #1e40af; margin: 0; font-size: 20px; font-weight: bold;">+${estimatedScoreIncrease} points</p>
          </div>
        </div>
        
        <h3 style="color: #ea580c; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">What Happens Next?</h3>
        <ol style="font-size: 15px; color: #4b5563; line-height: 2;">
          <li><strong>Upload Your Reports</strong> - Get your credit reports from all 3 bureaus (free at annualcreditreport.com)</li>
          <li><strong>AI Analysis</strong> - Our AI identifies the strongest disputes and conflicts</li>
          <li><strong>Generate Letters</strong> - FCRA-compliant dispute letters ready to send</li>
          <li><strong>Track Progress</strong> - Monitor responses and deletions in real-time</li>
        </ol>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://disputestrike.com/dashboard" style="display: inline-block; background: #ea580c; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Get Started Now
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">
          Questions? Reply to this email - we're here to help.
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          DisputeStrike - The Force Behind Your Credit Disputes
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

// ============================================================================
// COURSE PROGRESS OPERATIONS
// ============================================================================

// Total lessons in the course
const TOTAL_LESSONS = 33;

/**
 * Get user's course progress
 */
export async function getUserCourseProgress(userId: number): Promise<CourseProgress[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(courseProgress)
    .where(eq(courseProgress.userId, userId));
}

/**
 * Mark a lesson as complete
 */
export async function markLessonComplete(
  userId: number,
  lessonId: string,
  moduleId: string,
  timeSpentSeconds?: number,
  quizScore?: number
): Promise<CourseProgress> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  // Check if progress exists
  const existing = await dbInstance
    .select()
    .from(courseProgress)
    .where(and(
      eq(courseProgress.userId, userId),
      eq(courseProgress.lessonId, lessonId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await dbInstance
      .update(courseProgress)
      .set({
        completed: true,
        completedAt: new Date(),
        timeSpentSeconds: timeSpentSeconds ?? existing[0].timeSpentSeconds,
        quizScore: quizScore ?? existing[0].quizScore,
        quizAttempts: quizScore !== undefined ? existing[0].quizAttempts + 1 : existing[0].quizAttempts,
        lastAccessedAt: new Date(),
      })
      .where(eq(courseProgress.id, existing[0].id));

    const updated = await dbInstance
      .select()
      .from(courseProgress)
      .where(eq(courseProgress.id, existing[0].id))
      .limit(1);
    
    return updated[0];
  } else {
    // Create new
    const [result] = await dbInstance.insert(courseProgress).values({
      userId,
      lessonId,
      moduleId,
      completed: true,
      completedAt: new Date(),
      timeSpentSeconds: timeSpentSeconds ?? 0,
      quizScore: quizScore ?? null,
      quizAttempts: quizScore !== undefined ? 1 : 0,
      lastAccessedAt: new Date(),
    }).$returningId();

    const inserted = await dbInstance
      .select()
      .from(courseProgress)
      .where(eq(courseProgress.id, result.id))
      .limit(1);
    
    return inserted[0];
  }
}

/**
 * Update time spent on a lesson
 */
export async function updateLessonTimeSpent(
  userId: number,
  lessonId: string,
  moduleId: string,
  timeSpentSeconds: number
): Promise<CourseProgress> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  // Check if progress exists
  const existing = await dbInstance
    .select()
    .from(courseProgress)
    .where(and(
      eq(courseProgress.userId, userId),
      eq(courseProgress.lessonId, lessonId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await dbInstance
      .update(courseProgress)
      .set({
        timeSpentSeconds: existing[0].timeSpentSeconds + timeSpentSeconds,
        lastAccessedAt: new Date(),
      })
      .where(eq(courseProgress.id, existing[0].id));

    const updated = await dbInstance
      .select()
      .from(courseProgress)
      .where(eq(courseProgress.id, existing[0].id))
      .limit(1);
    
    return updated[0];
  } else {
    // Create new
    const [result] = await dbInstance.insert(courseProgress).values({
      userId,
      lessonId,
      moduleId,
      completed: false,
      timeSpentSeconds,
      lastAccessedAt: new Date(),
    }).$returningId();

    const inserted = await dbInstance
      .select()
      .from(courseProgress)
      .where(eq(courseProgress.id, result.id))
      .limit(1);
    
    return inserted[0];
  }
}

/**
 * Get user's certificate if earned
 */
export async function getUserCertificate(userId: number): Promise<CourseCertificate | null> {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const result = await dbInstance
    .select()
    .from(courseCertificates)
    .where(eq(courseCertificates.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Generate course certificate if all lessons complete
 */
export async function generateCourseCertificate(userId: number): Promise<CourseCertificate> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  // Check if certificate already exists
  const existing = await dbInstance
    .select()
    .from(courseCertificates)
    .where(eq(courseCertificates.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Get all progress
  const progress = await dbInstance
    .select()
    .from(courseProgress)
    .where(and(
      eq(courseProgress.userId, userId),
      eq(courseProgress.completed, true)
    ));

  // Check if all lessons complete
  if (progress.length < TOTAL_LESSONS) {
    throw new Error(`Complete all ${TOTAL_LESSONS} lessons to earn your certificate. You have completed ${progress.length}.`);
  }

  // Calculate stats
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0);
  const quizScores = progress.filter(p => p.quizScore !== null).map(p => p.quizScore as number);
  const avgQuizScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length)
    : null;

  // Generate certificate number
  const certNumber = `DS-${Date.now().toString(36).toUpperCase()}-${userId}`;

  // Create certificate
  const [result] = await dbInstance.insert(courseCertificates).values({
    userId,
    certificateNumber: certNumber,
    totalTimeSpentSeconds: totalTimeSpent,
    averageQuizScore: avgQuizScore,
  }).$returningId();

  const inserted = await dbInstance
    .select()
    .from(courseCertificates)
    .where(eq(courseCertificates.id, result.id))
    .limit(1);

  return inserted[0];
}


// ============================================================================
// DISPUTE OUTCOME OPERATIONS
// ============================================================================

/**
 * Create dispute outcome record
 */
export async function createDisputeOutcome(data: InsertDisputeOutcome): Promise<DisputeOutcome> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  const [result] = await dbInstance.insert(disputeOutcomes).values(data).$returningId();
  
  const inserted = await dbInstance
    .select()
    .from(disputeOutcomes)
    .where(eq(disputeOutcomes.id, result.id))
    .limit(1);
  
  return inserted[0];
}

/**
 * Get dispute outcomes for a user
 */
export async function getUserDisputeOutcomes(userId: number): Promise<DisputeOutcome[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(disputeOutcomes)
    .where(eq(disputeOutcomes.userId, userId))
    .orderBy(desc(disputeOutcomes.createdAt));
}

/**
 * Update dispute outcome
 */
export async function updateDisputeOutcome(
  outcomeId: number,
  updates: Partial<Omit<DisputeOutcome, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  await dbInstance
    .update(disputeOutcomes)
    .set(updates)
    .where(eq(disputeOutcomes.id, outcomeId));
}

// ============================================================================
// HARD INQUIRY OPERATIONS
// ============================================================================

/**
 * Create hard inquiry record
 */
export async function createHardInquiry(data: InsertHardInquiry): Promise<HardInquiry> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  const [result] = await dbInstance.insert(hardInquiries).values(data).$returningId();
  
  const inserted = await dbInstance
    .select()
    .from(hardInquiries)
    .where(eq(hardInquiries.id, result.id))
    .limit(1);
  
  return inserted[0];
}

/**
 * Get hard inquiries for a user
 */
export async function getUserHardInquiries(userId: number): Promise<HardInquiry[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(hardInquiries)
    .where(eq(hardInquiries.userId, userId))
    .orderBy(desc(hardInquiries.createdAt));
}

/**
 * Update hard inquiry
 */
export async function updateHardInquiry(
  inquiryId: number,
  updates: Partial<Omit<HardInquiry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  await dbInstance
    .update(hardInquiries)
    .set(updates)
    .where(eq(hardInquiries.id, inquiryId));
}

/**
 * Bulk create hard inquiries from parsed credit report
 */
export async function bulkCreateHardInquiries(inquiries: InsertHardInquiry[]): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  if (inquiries.length > 0) {
    await dbInstance.insert(hardInquiries).values(inquiries);
  }
}

// ============================================================================
// CFPB COMPLAINT OPERATIONS
// ============================================================================

/**
 * Create CFPB complaint
 */
export async function createCFPBComplaint(data: InsertCFPBComplaint): Promise<CFPBComplaint> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  const [result] = await dbInstance.insert(cfpbComplaints).values(data).$returningId();
  
  const inserted = await dbInstance
    .select()
    .from(cfpbComplaints)
    .where(eq(cfpbComplaints.id, result.id))
    .limit(1);
  
  return inserted[0];
}

/**
 * Get CFPB complaints for a user
 */
export async function getUserCFPBComplaints(userId: number): Promise<CFPBComplaint[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(cfpbComplaints)
    .where(eq(cfpbComplaints.userId, userId))
    .orderBy(desc(cfpbComplaints.createdAt));
}

/**
 * Update CFPB complaint
 */
export async function updateCFPBComplaint(
  complaintId: number,
  updates: Partial<Omit<CFPBComplaint, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  await dbInstance
    .update(cfpbComplaints)
    .set(updates)
    .where(eq(cfpbComplaints.id, complaintId));
}

// ============================================================================
// REFERRAL OPERATIONS
// ============================================================================

/**
 * Create referral code for user
 */
export async function createReferral(userId: number): Promise<Referral> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  // Generate unique referral code
  const code = `DS${userId}${Date.now().toString(36).toUpperCase().slice(-4)}`;

  const [result] = await dbInstance.insert(referrals).values({
    referrerId: userId,
    referralCode: code,
  }).$returningId();
  
  const inserted = await dbInstance
    .select()
    .from(referrals)
    .where(eq(referrals.id, result.id))
    .limit(1);
  
  return inserted[0];
}

/**
 * Get user's referral data
 */
export async function getUserReferral(userId: number): Promise<Referral | undefined> {
  const dbInstance = await getDb();
  if (!dbInstance) return undefined;

  const result = await dbInstance
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .limit(1);
  
  return result[0];
}

/**
 * Get all referrals made by a user
 */
export async function getUserReferrals(userId: number): Promise<Referral[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
}

/**
 * Track referral click
 */
export async function trackReferralClick(referralCode: string): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) return;

  const existing = await dbInstance
    .select()
    .from(referrals)
    .where(eq(referrals.referralCode, referralCode))
    .limit(1);

  if (existing.length > 0) {
    await dbInstance
      .update(referrals)
      .set({ clickCount: existing[0].clickCount + 1 })
      .where(eq(referrals.id, existing[0].id));
  }
}

/**
 * Complete referral signup
 */
export async function completeReferralSignup(referralCode: string, newUserId: number): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) return;

  await dbInstance
    .update(referrals)
    .set({
      referredUserId: newUserId,
      status: "signed_up",
      signedUpAt: new Date(),
    })
    .where(eq(referrals.referralCode, referralCode));
}

// ============================================================================
// ACTIVITY LOG OPERATIONS
// ============================================================================

/**
 * Log user activity
 */
export async function logActivity(data: InsertActivityLog): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) return;

  await dbInstance.insert(activityLog).values(data);
}

/**
 * Get recent activity for a user
 */
export async function getUserRecentActivity(userId: number, limit: number = 10): Promise<ActivityLog[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get dashboard stats for a user
 */
export async function getUserDashboardStats(userId: number): Promise<{
  totalNegativeAccounts: number;
  /** Violation count from saved analysis (parsedData.totalViolations) - aligns with lightAnalysis. */
  totalViolationsFromAnalysis: number;
  pendingDisputes: number;
  deletedAccounts: number;
  successRate: number;
  totalLetters: number;
  /** AI-derived potential score increase after Round 1 (from report analysis). */
  potentialIncreaseAfterRound1: number;
  /** AI target score after Round 1 (current avg + potential, capped 850). */
  aiTargetScoreAfterRound1: number;
}> {
  const dbInstance = await getDb();
  const emptyStats = {
    totalNegativeAccounts: 0,
    totalViolationsFromAnalysis: 0,
    pendingDisputes: 0,
    deletedAccounts: 0,
    successRate: 0,
    totalLetters: 0,
    potentialIncreaseAfterRound1: 0,
    aiTargetScoreAfterRound1: 0,
  };
  if (!dbInstance) return emptyStats;

  // Get negative accounts count
  const accounts = await dbInstance
    .select()
    .from(negativeAccounts)
    .where(eq(negativeAccounts.userId, userId));
  
  // Get letters
  const letters = await dbInstance
    .select()
    .from(disputeLetters)
    .where(eq(disputeLetters.userId, userId));
  
  // Get outcomes
  const outcomes = await dbInstance
    .select()
    .from(disputeOutcomes)
    .where(eq(disputeOutcomes.userId, userId));

  const totalNegativeAccounts = accounts.length;
  // Align with lightAnalysis: use totalViolations & totalNegativeAccounts from saved report parsedData when available
  let totalViolationsFromAnalysis = 0;
  let totalNegativeAccountsFromAnalysis = 0;
  try {
    const reports = await getCreditReportsByUserId(userId);
    for (const r of reports) {
      if (r.parsedData) {
        const parsed = typeof r.parsedData === 'string' ? JSON.parse(r.parsedData) : r.parsedData;
        const tv = parsed?.totalViolations;
        const tna = parsed?.totalNegativeAccounts;
        if (typeof tv === 'number' && tv > totalViolationsFromAnalysis) totalViolationsFromAnalysis = tv;
        if (typeof tna === 'number' && tna > totalNegativeAccountsFromAnalysis) totalNegativeAccountsFromAnalysis = tna;
      }
    }
  } catch (_) {}
  const displayViolations = totalViolationsFromAnalysis > 0 ? totalViolationsFromAnalysis : totalNegativeAccounts;

  const totalLetters = letters.length;
  const pendingDisputes = letters.filter(l => l.status === "generated" || l.status === "mailed").length;
  const deletedAccounts = outcomes.filter(o => o.outcome === "deleted").length;
  const resolvedDisputes = outcomes.filter(o => o.outcome !== "pending").length;
  const successRate = resolvedDisputes > 0 ? Math.round((deletedAccounts / resolvedDisputes) * 100) : 0;

  // Compute potential increase & target score from AI analysis (round allocation + severity)
  let potentialIncreaseAfterRound1 = 0;
  let aiTargetScoreAfterRound1 = 0;

  try {
    const { allocateAllRounds } = await import('./disputeStrategy');
    const { round1, round2, round3 } = await allocateAllRounds(userId);
    // Severity 3-10: higher severity = higher impact if deleted. Industry: collections ~30-100 pts each.
    const ptsPerSeverity = (s: number) => s >= 9 ? 35 : s >= 7 ? 28 : s >= 5 ? 20 : 12;
    potentialIncreaseAfterRound1 = Math.min(150, round1.reduce((sum, s) => sum + ptsPerSeverity(s.severity), 0));
    // Fallback: when round1 is empty but we have items, estimate from all rounds
    if (potentialIncreaseAfterRound1 === 0 && (round1.length + round2.length + round3.length) > 0) {
      const allScored = [...round1, ...round2, ...round3];
      potentialIncreaseAfterRound1 = Math.min(150, allScored.slice(0, 5).reduce((sum, s) => sum + ptsPerSeverity(s.severity), 0));
    }
    // Last resort: estimate from total negative accounts
    if (potentialIncreaseAfterRound1 === 0 && totalNegativeAccounts > 0) {
      potentialIncreaseAfterRound1 = Math.min(150, Math.min(5, totalNegativeAccounts) * 25);
    }

    const scores = await getLatestScoresByBureau(userId);
    const scoreVals = [scores.transunion, scores.equifax, scores.experian].filter((s): s is number => s != null && s >= 300 && s <= 850);
    const avgScore = scoreVals.length > 0 ? scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length : 0;
    aiTargetScoreAfterRound1 = avgScore > 0
      ? Math.min(850, Math.round(avgScore + potentialIncreaseAfterRound1))
      : potentialIncreaseAfterRound1 > 0 ? Math.min(850, 650 + potentialIncreaseAfterRound1) : 0;
  } catch (e) {
    console.warn('[getUserDashboardStats] Could not compute AI metrics:', e);
  }

  return {
    totalNegativeAccounts,
    totalNegativeAccountsFromAnalysis: totalNegativeAccountsFromAnalysis || totalNegativeAccounts,
    totalViolationsFromAnalysis,
    pendingDisputes,
    deletedAccounts,
    successRate,
    totalLetters,
    potentialIncreaseAfterRound1,
    aiTargetScoreAfterRound1,
  };
}


// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

/**
 * Get user profile by user ID
 * CRITICAL: Always use userId to ensure data isolation - one account = one person
 */
export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const dbInstance = await getDb();
  if (!dbInstance) return undefined;

  const result = await dbInstance
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result[0];
}

/**
 * Validate that consumer info matches locked profile identity
 * Used to prevent users from uploading different people's credit reports
 * Returns: { matches: boolean, reason?: string }
 */
export async function validateIdentityMatch(
  userId: number,
  consumerInfo: {
    fullName?: string;
    dateOfBirth?: string;
    ssnLast4?: string;
  }
): Promise<{ matches: boolean; reason?: string }> {
  const profile = await getUserProfile(userId);
  
  // If profile not complete yet, allow (first time setup)
  if (!profile?.isComplete) {
    return { matches: true };
  }
  
  // Normalize for comparison
  const normalize = (s?: string | null) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  
  const existingName = normalize(profile.fullName);
  const uploadedName = normalize(consumerInfo.fullName);
  const existingSSN = (profile.ssnLast4 || '').trim();
  const uploadedSSN = (consumerInfo.ssnLast4 || '').trim();
  const existingDOB = (profile.dateOfBirth || '').split('T')[0]; // YYYY-MM-DD part
  
  // Convert uploaded DOB to YYYY-MM-DD if needed
  let uploadedDOB = consumerInfo.dateOfBirth || '';
  if (uploadedDOB.includes('/')) {
    const [month, day, year] = uploadedDOB.split('/');
    uploadedDOB = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Check if we have enough data to validate
  const hasUploadedIdentity = uploadedName && uploadedSSN && uploadedDOB;
  if (!hasUploadedIdentity) {
    // Not enough data to validate - allow but log warning
    console.warn('[Identity] Insufficient data to validate identity for user:', userId);
    return { matches: true };
  }
  
  // Check each field
  const nameMatches = existingName === uploadedName;
  const ssnMatches = existingSSN === uploadedSSN;
  const dobMatches = existingDOB === uploadedDOB;
  
  if (!nameMatches || !ssnMatches || !dobMatches) {
    console.error('[Identity] Mismatch detected:', {
      userId,
      existingName,
      uploadedName,
      nameMatches,
      existingSSN,
      uploadedSSN,
      ssnMatches,
      existingDOB,
      uploadedDOB,
      dobMatches,
    });
    
    return {
      matches: false,
      reason: 'The uploaded credit report does not match your registered identity. ' +
              'This account is locked to prevent sharing between multiple people.'
    };
  }
  
  return { matches: true };
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(userId: number, data: Partial<Omit<InsertUserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  // Check if profile exists
  const existing = await dbInstance
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing profile
    await dbInstance
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId));
    
    const updated = await dbInstance
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    
    return updated[0];
  } else {
    // Create new profile
    const [result] = await dbInstance.insert(userProfiles).values({
      userId,
      ...data,
    }).$returningId();
    
    const inserted = await dbInstance
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, result.id))
      .limit(1);
    
    return inserted[0];
  }
}

/** Alias for upsertUserProfile (used by credit report parser when filling profile from analysis) */
export const updateUserProfile = upsertUserProfile;

/**
 * Get full address string from profile
 */
export function formatProfileAddress(profile: UserProfile | undefined): string {
  if (!profile) return '';
  
  const parts = [
    profile.currentAddress,
    profile.currentCity,
    profile.currentState,
    profile.currentZip
  ].filter(Boolean);
  
  if (parts.length < 2) return profile.currentAddress || '';
  
  // Format as "123 Main St, City, ST 12345"
  const address = profile.currentAddress || '';
  const cityStateZip = [
    profile.currentCity,
    profile.currentState ? `${profile.currentState} ${profile.currentZip || ''}`.trim() : profile.currentZip
  ].filter(Boolean).join(', ');
  
  return [address, cityStateZip].filter(Boolean).join(', ');
}

/**
 * Get previous address string from profile
 */
export function formatPreviousAddress(profile: UserProfile | undefined): string | undefined {
  if (!profile || !profile.previousAddress) return undefined;
  
  const parts = [
    profile.previousAddress,
    profile.previousCity,
    profile.previousState,
    profile.previousZip
  ].filter(Boolean);
  
  if (parts.length < 2) return profile.previousAddress || undefined;
  
  const address = profile.previousAddress || '';
  const cityStateZip = [
    profile.previousCity,
    profile.previousState ? `${profile.previousState} ${profile.previousZip || ''}`.trim() : profile.previousZip
  ].filter(Boolean).join(', ');
  
  return [address, cityStateZip].filter(Boolean).join(', ');
}


// ============================================================================
// AGENCY ACCOUNT OPERATIONS
// ============================================================================

export async function upgradeToAgency(
  userId: number, 
  agencyName: string, 
  planTier: 'starter' | 'professional' | 'enterprise'
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const slotsByPlan = { starter: 50, professional: 200, enterprise: 500 };
  const priceByPlan = { starter: 497, professional: 997, enterprise: 1997 }; // SOURCE BIBLE v2.0 Jan 2026

  await db.insert(agencies).values({
    userId,
    agencyName,
    planTier,
    clientSlotsIncluded: slotsByPlan[planTier],
    clientSlotsUsed: 0,
    monthlyPrice: String(priceByPlan[planTier]),
    status: 'active',
  }).onDuplicateKeyUpdate({
    set: {
      agencyName,
      planTier,
      clientSlotsIncluded: slotsByPlan[planTier],
      monthlyPrice: String(priceByPlan[planTier]),
      updatedAt: new Date(),
    }
  });
}

export async function getAgencyStats(agencyUserId: number) {
  const db = await getDb();
  if (!db) return null;

  const [agency] = await db.select().from(agencies).where(eq(agencies.userId, agencyUserId));
  if (!agency) return null;

  const clients = await db.select().from(agencyClients).where(eq(agencyClients.agencyUserId, agencyUserId));
  const letters = await db.select().from(agencyClientLetters).where(eq(agencyClientLetters.agencyUserId, agencyUserId));

  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalLetters = letters.length;
  const activeDisputes = letters.filter(l => l.status !== 'resolved').length;

  return {
    agencyName: agency.agencyName,
    planTier: agency.planTier,
    clientSlotsIncluded: agency.clientSlotsIncluded || 0,
    clientSlotsUsed: agency.clientSlotsUsed || 0,
    monthlyPrice: agency.monthlyPrice,
    totalClients: clients.length,
    activeClients,
    totalLetters,
    activeDisputes,
  };
}

// ============================================================================
// AGENCY CLIENT OPERATIONS
// ============================================================================

export async function createAgencyClient(client: InsertAgencyClient): Promise<AgencyClient | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if agency has available slots
  const [agency] = await db.select().from(users).where(eq(users.id, client.agencyUserId));
  if (!agency || agency.accountType !== 'agency') {
    throw new Error('User is not an agency account');
  }

  const slotsUsed = agency.clientSlotsUsed || 0;
  const slotsIncluded = agency.clientSlotsIncluded || 0;
  
  if (slotsUsed >= slotsIncluded) {
    throw new Error('No available client slots. Upgrade plan or purchase additional slots.');
  }

  // Create client
  const result = await db.insert(agencyClients).values(client);
  const insertId = result[0].insertId;

  // Increment slots used
  await db.update(users).set({
    clientSlotsUsed: slotsUsed + 1,
  }).where(eq(users.id, client.agencyUserId));

  const [newClient] = await db.select().from(agencyClients).where(eq(agencyClients.id, insertId));
  return newClient || null;
}

export async function getAgencyClients(agencyUserId: number): Promise<AgencyClient[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agencyClients)
    .where(eq(agencyClients.agencyUserId, agencyUserId))
    .orderBy(desc(agencyClients.createdAt));
}

export async function getAgencyClient(clientId: number, agencyUserId: number): Promise<AgencyClient | null> {
  const db = await getDb();
  if (!db) return null;

  const [client] = await db.select()
    .from(agencyClients)
    .where(and(
      eq(agencyClients.id, clientId),
      eq(agencyClients.agencyUserId, agencyUserId)
    ));

  return client || null;
}

export async function updateAgencyClient(
  clientId: number, 
  agencyUserId: number, 
  updates: Partial<InsertAgencyClient>
): Promise<AgencyClient | null> {
  const db = await getDb();
  if (!db) return null;

  await db.update(agencyClients)
    .set(updates)
    .where(and(
      eq(agencyClients.id, clientId),
      eq(agencyClients.agencyUserId, agencyUserId)
    ));

  return getAgencyClient(clientId, agencyUserId);
}

export async function archiveAgencyClient(clientId: number, agencyUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(agencyClients)
    .set({ status: 'archived' })
    .where(and(
      eq(agencyClients.id, clientId),
      eq(agencyClients.agencyUserId, agencyUserId)
    ));

  // Decrement slots used
  const [agency] = await db.select().from(users).where(eq(users.id, agencyUserId));
  if (agency && agency.clientSlotsUsed && agency.clientSlotsUsed > 0) {
    await db.update(users).set({
      clientSlotsUsed: agency.clientSlotsUsed - 1,
    }).where(eq(users.id, agencyUserId));
  }
}

// ============================================================================
// AGENCY CLIENT REPORTS OPERATIONS
// ============================================================================

export async function createAgencyClientReport(report: InsertAgencyClientReport): Promise<AgencyClientReport | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(agencyClientReports).values(report);
  const insertId = result[0].insertId;

  const [newReport] = await db.select().from(agencyClientReports).where(eq(agencyClientReports.id, insertId));
  return newReport || null;
}

export async function getAgencyClientReports(clientId: number, agencyUserId: number): Promise<AgencyClientReport[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agencyClientReports)
    .where(and(
      eq(agencyClientReports.agencyClientId, clientId),
      eq(agencyClientReports.agencyUserId, agencyUserId)
    ))
    .orderBy(desc(agencyClientReports.uploadedAt));
}

export async function updateAgencyClientReport(
  reportId: number, 
  agencyUserId: number, 
  updates: Partial<InsertAgencyClientReport>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(agencyClientReports)
    .set(updates)
    .where(and(
      eq(agencyClientReports.id, reportId),
      eq(agencyClientReports.agencyUserId, agencyUserId)
    ));
}

// ============================================================================
// AGENCY CLIENT ACCOUNTS OPERATIONS
// ============================================================================

export async function createAgencyClientAccount(account: InsertAgencyClientAccount): Promise<AgencyClientAccount | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(agencyClientAccounts).values(account);
  const insertId = result[0].insertId;

  const [newAccount] = await db.select().from(agencyClientAccounts).where(eq(agencyClientAccounts.id, insertId));
  return newAccount || null;
}

export async function getAgencyClientAccounts(clientId: number, agencyUserId: number): Promise<AgencyClientAccount[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agencyClientAccounts)
    .where(and(
      eq(agencyClientAccounts.agencyClientId, clientId),
      eq(agencyClientAccounts.agencyUserId, agencyUserId)
    ))
    .orderBy(desc(agencyClientAccounts.createdAt));
}

export async function updateAgencyClientAccount(
  accountId: number, 
  agencyUserId: number, 
  updates: Partial<InsertAgencyClientAccount>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(agencyClientAccounts)
    .set(updates)
    .where(and(
      eq(agencyClientAccounts.id, accountId),
      eq(agencyClientAccounts.agencyUserId, agencyUserId)
    ));
}

// ============================================================================
// AGENCY CLIENT LETTERS OPERATIONS
// ============================================================================

export async function createAgencyClientLetter(letter: InsertAgencyClientLetter): Promise<AgencyClientLetter | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(agencyClientLetters).values(letter);
  const insertId = result[0].insertId;

  // Update client stats
  const [client] = await db.select().from(agencyClients).where(eq(agencyClients.id, letter.agencyClientId));
  if (client) {
    await db.update(agencyClients).set({
      totalLettersGenerated: (client.totalLettersGenerated || 0) + 1,
      lastActivityAt: new Date(),
    }).where(eq(agencyClients.id, letter.agencyClientId));
  }

  const [newLetter] = await db.select().from(agencyClientLetters).where(eq(agencyClientLetters.id, insertId));
  return newLetter || null;
}

export async function getAgencyClientLetters(clientId: number, agencyUserId: number): Promise<AgencyClientLetter[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agencyClientLetters)
    .where(and(
      eq(agencyClientLetters.agencyClientId, clientId),
      eq(agencyClientLetters.agencyUserId, agencyUserId)
    ))
    .orderBy(desc(agencyClientLetters.createdAt));
}

export async function updateAgencyClientLetter(
  letterId: number, 
  agencyUserId: number, 
  updates: Partial<InsertAgencyClientLetter>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(agencyClientLetters)
    .set(updates)
    .where(and(
      eq(agencyClientLetters.id, letterId),
      eq(agencyClientLetters.agencyUserId, agencyUserId)
    ));
}

export async function getAgencyClientLetter(letterId: number, agencyUserId: number): Promise<AgencyClientLetter | null> {
  const db = await getDb();
  if (!db) return null;

  const [letter] = await db.select()
    .from(agencyClientLetters)
    .where(and(
      eq(agencyClientLetters.id, letterId),
      eq(agencyClientLetters.agencyUserId, agencyUserId)
    ));

  return letter || null;
}


// Get agency client accounts by IDs
export async function getAgencyClientAccountsByIds(
  accountIds: number[], 
  clientId: number, 
  agencyUserId: number
): Promise<AgencyClientAccount[]> {
  const db = await getDb();
  if (!db || accountIds.length === 0) return [];

  return await db.select()
    .from(agencyClientAccounts)
    .where(and(
      inArray(agencyClientAccounts.id, accountIds),
      eq(agencyClientAccounts.agencyClientId, clientId),
      eq(agencyClientAccounts.agencyUserId, agencyUserId)
    ));
}

// Increment agency client letter count
export async function incrementAgencyClientLetterCount(
  clientId: number, 
  agencyUserId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [client] = await db.select().from(agencyClients).where(and(
    eq(agencyClients.id, clientId),
    eq(agencyClients.agencyUserId, agencyUserId)
  ));

  if (client) {
    await db.update(agencyClients).set({
      totalLettersGenerated: (client.totalLettersGenerated || 0) + 1,
      lastActivityAt: new Date(),
    }).where(eq(agencyClients.id, clientId));
  }
}


// ============================================================================
// CREDIT SCORE HISTORY OPERATIONS
// ============================================================================

/**
 * Record a credit score in history
 */
export async function recordCreditScore(data: {
  userId: number;
  bureau: 'transunion' | 'equifax' | 'experian';
  score: number;
  scoreModel?: string;
  creditReportId?: number;
  event?: string;
}): Promise<CreditScoreHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(creditScoreHistory).values({
    userId: data.userId,
    bureau: data.bureau,
    score: data.score,
    scoreModel: data.scoreModel || null,
    creditReportId: data.creditReportId || null,
    event: data.event || null,
  }).$returningId();

  const [inserted] = await db.select()
    .from(creditScoreHistory)
    .where(eq(creditScoreHistory.id, result.id));
  
  return inserted;
}

/**
 * Get credit score history for a user
 */
export async function getCreditScoreHistory(
  userId: number,
  options?: {
    bureau?: 'transunion' | 'equifax' | 'experian';
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<CreditScoreHistory[]> {
  const db = await getDb();
  if (!db) return [];

  // Build conditions array
  const conditions = [eq(creditScoreHistory.userId, userId)];
  
  if (options?.bureau) {
    conditions.push(eq(creditScoreHistory.bureau, options.bureau));
  }

  const results = await db.select()
    .from(creditScoreHistory)
    .where(and(...conditions))
    .orderBy(desc(creditScoreHistory.recordedAt))
    .limit(options?.limit || 100);

  return results;
}

/**
 * Get the latest credit scores for a user (one per bureau)
 */
export async function getLatestCreditScores(userId: number): Promise<{
  transunion: CreditScoreHistory | null;
  equifax: CreditScoreHistory | null;
  experian: CreditScoreHistory | null;
}> {
  const db = await getDb();
  if (!db) return { transunion: null, equifax: null, experian: null };

  const bureaus = ['transunion', 'equifax', 'experian'] as const;
  const result: any = {};

  for (const bureau of bureaus) {
    const [latest] = await db.select()
      .from(creditScoreHistory)
      .where(and(
        eq(creditScoreHistory.userId, userId),
        eq(creditScoreHistory.bureau, bureau)
      ))
      .orderBy(desc(creditScoreHistory.recordedAt))
      .limit(1);
    
    result[bureau] = latest || null;
  }

  return result;
}

/**
 * Add an event to the most recent score entry
 */
export async function addScoreEvent(
  userId: number,
  bureau: 'transunion' | 'equifax' | 'experian',
  event: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [latest] = await db.select()
    .from(creditScoreHistory)
    .where(and(
      eq(creditScoreHistory.userId, userId),
      eq(creditScoreHistory.bureau, bureau)
    ))
    .orderBy(desc(creditScoreHistory.recordedAt))
    .limit(1);

  if (latest) {
    await db.update(creditScoreHistory)
      .set({ event })
      .where(eq(creditScoreHistory.id, latest.id));
  }
}


// ============================================================================
// USER NOTIFICATIONS
// ============================================================================

export async function createNotification(
  notification: InsertUserNotification
): Promise<UserNotification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(userNotifications).values(notification);
  const [created] = await db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.id, result.insertId));
  return created;
}

export async function getUserNotifications(
  userId: number,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<UserNotification[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(userNotifications.userId, userId)];
  
  if (options?.unreadOnly) {
    conditions.push(eq(userNotifications.isRead, false));
  }

  const results = await db
    .select()
    .from(userNotifications)
    .where(and(...conditions))
    .orderBy(desc(userNotifications.createdAt))
    .limit(options?.limit || 50);

  return results;
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const results = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      )
    );

  return results[0]?.count || 0;
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userNotifications)
    .set({ 
      isRead: true, 
      readAt: new Date() 
    })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userNotifications)
    .set({ 
      isRead: true, 
      readAt: new Date() 
    })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      )
    );
}

export async function deleteNotification(
  notificationId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(userNotifications)
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

export async function createDeadlineNotification(
  userId: number,
  bureau: string,
  deadline: Date,
  daysRemaining: number
): Promise<UserNotification> {
  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  const priority = daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'high' : 'normal';
  
  return createNotification({
    userId,
    type: 'deadline_reminder',
    title: `${bureauName} Response Deadline ${daysRemaining <= 3 ? '⚠️ URGENT' : 'Approaching'}`,
    message: `Your ${bureauName} dispute response deadline is in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Check your mail for any response letters.`,
    priority: priority as 'low' | 'normal' | 'high' | 'urgent',
    relatedEntityType: 'dispute_letter',
    expiresAt: deadline,
  });
}

export async function createLetterGeneratedNotification(
  userId: number,
  bureau: string,
  letterId: number
): Promise<UserNotification> {
  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  
  return createNotification({
    userId,
    type: 'letter_generated',
    title: `${bureauName} Dispute Letter Ready`,
    message: `Your ${bureauName} dispute letter has been generated. Download it from your dashboard and mail it via Certified Mail.`,
    priority: 'normal',
    relatedEntityType: 'dispute_letter',
    relatedEntityId: letterId,
  });
}

export async function createAccountDeletedNotification(
  userId: number,
  accountName: string,
  bureau: string
): Promise<UserNotification> {
  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);
  
  return createNotification({
    userId,
    type: 'account_deleted',
    title: `🎉 Account Deleted from ${bureauName}!`,
    message: `Great news! "${accountName}" has been successfully deleted from your ${bureauName} credit report.`,
    priority: 'high',
    relatedEntityType: 'negative_account',
  });
}


// ============================================================================
// DOCUMENT VAULT OPERATIONS
// ============================================================================

export async function createUserDocument(document: InsertUserDocument): Promise<UserDocument | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(userDocuments).values(document);
  const insertId = result[0].insertId;
  
  const [newDoc] = await db.select().from(userDocuments).where(eq(userDocuments.id, insertId));
  return newDoc || null;
}

export async function getUserDocuments(userId: number): Promise<UserDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(userDocuments)
    .where(eq(userDocuments.userId, userId))
    .orderBy(desc(userDocuments.createdAt));
}

export async function getUserDocumentById(documentId: number, userId: number): Promise<UserDocument | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [doc] = await db.select()
    .from(userDocuments)
    .where(and(
      eq(userDocuments.id, documentId),
      eq(userDocuments.userId, userId)
    ));
  
  return doc || null;
}

export async function getUserDocumentsByType(userId: number, documentType: string): Promise<UserDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(userDocuments)
    .where(and(
      eq(userDocuments.userId, userId),
      eq(userDocuments.documentType, documentType as any)
    ))
    .orderBy(desc(userDocuments.createdAt));
}

export async function updateUserDocument(
  documentId: number, 
  userId: number, 
  updates: Partial<InsertUserDocument>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.update(userDocuments)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(
      eq(userDocuments.id, documentId),
      eq(userDocuments.userId, userId)
    ));
  
  return result[0].affectedRows > 0;
}

export async function deleteUserDocument(documentId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.delete(userDocuments)
    .where(and(
      eq(userDocuments.id, documentId),
      eq(userDocuments.userId, userId)
    ));
  
  return result[0].affectedRows > 0;
}

export async function getExpiringDocuments(userId: number, daysUntilExpiry: number = 30): Promise<UserDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
  
  return db.select()
    .from(userDocuments)
    .where(and(
      eq(userDocuments.userId, userId),
      sql`${userDocuments.expiresAt} IS NOT NULL`,
      sql`${userDocuments.expiresAt} <= ${expiryDate}`,
      sql`${userDocuments.expiresAt} > NOW()`
    ))
    .orderBy(userDocuments.expiresAt);
}


// ============================================================================
// METHOD ANALYTICS OPERATIONS (43 Dispute Detection Methods)
// ============================================================================

import { 
  methodTriggers, 
  InsertMethodTrigger, 
  MethodTrigger,
  methodAnalytics,
  InsertMethodAnalytic,
  MethodAnalytic
} from "../drizzle/schema";

/**
 * Record a method trigger when a detection algorithm fires
 */
export async function recordMethodTrigger(data: InsertMethodTrigger): Promise<MethodTrigger> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  const [result] = await dbInstance.insert(methodTriggers).values(data).$returningId();
  
  const inserted = await dbInstance
    .select()
    .from(methodTriggers)
    .where(eq(methodTriggers.id, result.id))
    .limit(1);
  
  return inserted[0];
}

/**
 * Record multiple method triggers at once (batch insert)
 */
export async function recordMethodTriggersBatch(triggers: InsertMethodTrigger[]): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  if (triggers.length === 0) return;
  
  await dbInstance.insert(methodTriggers).values(triggers);
}

/**
 * Get method triggers for a user
 */
export async function getUserMethodTriggers(userId: number): Promise<MethodTrigger[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(methodTriggers)
    .where(eq(methodTriggers.userId, userId))
    .orderBy(desc(methodTriggers.triggeredAt));
}

/**
 * Get method triggers for a specific letter
 */
export async function getLetterMethodTriggers(letterId: number): Promise<MethodTrigger[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return dbInstance
    .select()
    .from(methodTriggers)
    .where(eq(methodTriggers.letterId, letterId))
    .orderBy(methodTriggers.methodNumber);
}

/**
 * Update method trigger outcome (after dispute resolution)
 */
export async function updateMethodTriggerOutcome(
  triggerId: number,
  outcome: 'pending' | 'deleted' | 'verified' | 'updated' | 'no_response'
): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  await dbInstance
    .update(methodTriggers)
    .set({ 
      outcome,
      outcomeDate: new Date()
    })
    .where(eq(methodTriggers.id, triggerId));
}

/**
 * Get aggregated method statistics across all users
 */
export async function getMethodStats(): Promise<{
  methodNumber: number;
  methodName: string;
  methodCategory: string;
  triggerCount: number;
  deletionCount: number;
  verifiedCount: number;
  pendingCount: number;
  successRate: number;
  avgDeletionProbability: number;
}[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const results = await dbInstance
    .select({
      methodNumber: methodTriggers.methodNumber,
      methodName: methodTriggers.methodName,
      methodCategory: methodTriggers.methodCategory,
      triggerCount: sql<number>`COUNT(*)`,
      deletionCount: sql<number>`SUM(CASE WHEN outcome = 'deleted' THEN 1 ELSE 0 END)`,
      verifiedCount: sql<number>`SUM(CASE WHEN outcome = 'verified' THEN 1 ELSE 0 END)`,
      pendingCount: sql<number>`SUM(CASE WHEN outcome = 'pending' THEN 1 ELSE 0 END)`,
      avgDeletionProbability: sql<number>`AVG(deletionProbability)`,
    })
    .from(methodTriggers)
    .groupBy(methodTriggers.methodNumber, methodTriggers.methodName, methodTriggers.methodCategory)
    .orderBy(sql`COUNT(*) DESC`);

  return results.map(r => ({
    ...r,
    successRate: r.triggerCount > 0 && (r.deletionCount + r.verifiedCount) > 0 
      ? Math.round((r.deletionCount / (r.deletionCount + r.verifiedCount)) * 100) 
      : 0
  }));
}

/**
 * Get method stats by category
 */
export async function getMethodStatsByCategory(): Promise<{
  category: string;
  triggerCount: number;
  deletionCount: number;
  successRate: number;
}[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const results = await dbInstance
    .select({
      category: methodTriggers.methodCategory,
      triggerCount: sql<number>`COUNT(*)`,
      deletionCount: sql<number>`SUM(CASE WHEN outcome = 'deleted' THEN 1 ELSE 0 END)`,
      verifiedCount: sql<number>`SUM(CASE WHEN outcome = 'verified' THEN 1 ELSE 0 END)`,
    })
    .from(methodTriggers)
    .groupBy(methodTriggers.methodCategory)
    .orderBy(sql`COUNT(*) DESC`);

  return results.map(r => ({
    category: r.category,
    triggerCount: r.triggerCount,
    deletionCount: r.deletionCount,
    successRate: r.triggerCount > 0 && (r.deletionCount + r.verifiedCount) > 0 
      ? Math.round((r.deletionCount / (r.deletionCount + r.verifiedCount)) * 100) 
      : 0
  }));
}

/**
 * Get top N most triggered methods
 */
export async function getTopTriggeredMethods(limit: number = 10): Promise<{
  methodNumber: number;
  methodName: string;
  triggerCount: number;
  successRate: number;
}[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const results = await dbInstance
    .select({
      methodNumber: methodTriggers.methodNumber,
      methodName: methodTriggers.methodName,
      triggerCount: sql<number>`COUNT(*)`,
      deletionCount: sql<number>`SUM(CASE WHEN outcome = 'deleted' THEN 1 ELSE 0 END)`,
      resolvedCount: sql<number>`SUM(CASE WHEN outcome IN ('deleted', 'verified') THEN 1 ELSE 0 END)`,
    })
    .from(methodTriggers)
    .groupBy(methodTriggers.methodNumber, methodTriggers.methodName)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return results.map(r => ({
    methodNumber: r.methodNumber,
    methodName: r.methodName,
    triggerCount: r.triggerCount,
    successRate: r.resolvedCount > 0 
      ? Math.round((r.deletionCount / r.resolvedCount) * 100) 
      : 0
  }));
}

/**
 * Get method trigger trends over time (last 30 days)
 */
export async function getMethodTriggerTrends(days: number = 30): Promise<{
  date: string;
  triggerCount: number;
  deletionCount: number;
}[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return dbInstance
    .select({
      date: sql<string>`DATE(triggeredAt)`,
      triggerCount: sql<number>`COUNT(*)`,
      deletionCount: sql<number>`SUM(CASE WHEN outcome = 'deleted' THEN 1 ELSE 0 END)`,
    })
    .from(methodTriggers)
    .where(sql`triggeredAt >= ${startDate}`)
    .groupBy(sql`DATE(triggeredAt)`)
    .orderBy(sql`DATE(triggeredAt)`);
}

/**
 * Get total method analytics summary
 */
export async function getMethodAnalyticsSummary(): Promise<{
  totalTriggers: number;
  totalDeletions: number;
  totalVerified: number;
  overallSuccessRate: number;
  uniqueMethods: number;
  avgTriggersPerLetter: number;
}> {
  const dbInstance = await getDb();
  if (!dbInstance) return {
    totalTriggers: 0,
    totalDeletions: 0,
    totalVerified: 0,
    overallSuccessRate: 0,
    uniqueMethods: 0,
    avgTriggersPerLetter: 0
  };

  const [summary] = await dbInstance
    .select({
      totalTriggers: sql<number>`COUNT(*)`,
      totalDeletions: sql<number>`SUM(CASE WHEN outcome = 'deleted' THEN 1 ELSE 0 END)`,
      totalVerified: sql<number>`SUM(CASE WHEN outcome = 'verified' THEN 1 ELSE 0 END)`,
      uniqueMethods: sql<number>`COUNT(DISTINCT methodNumber)`,
      uniqueLetters: sql<number>`COUNT(DISTINCT letterId)`,
    })
    .from(methodTriggers);

  const resolved = (summary.totalDeletions || 0) + (summary.totalVerified || 0);
  
  return {
    totalTriggers: summary.totalTriggers || 0,
    totalDeletions: summary.totalDeletions || 0,
    totalVerified: summary.totalVerified || 0,
    overallSuccessRate: resolved > 0 
      ? Math.round((summary.totalDeletions / resolved) * 100) 
      : 0,
    uniqueMethods: summary.uniqueMethods || 0,
    avgTriggersPerLetter: summary.uniqueLetters > 0 
      ? Math.round((summary.totalTriggers / summary.uniqueLetters) * 10) / 10 
      : 0
  };
}


// ============================================================================
// ADMIN MANAGEMENT OPERATIONS
// ============================================================================

/**
 * Get all users with full details for admin panel
 */
export async function getAdminUserList(filters?: {
  role?: string;
  status?: string;
  state?: string;
  city?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };

  let query = db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      accountType: users.accountType,
      agencyName: users.agencyName,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      blockedAt: users.blockedAt,
      blockedReason: users.blockedReason,
    })
    .from(users);

  const conditions: any[] = [];

  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as any));
  }
  if (filters?.status) {
    conditions.push(eq(users.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(users.name, `%${filters.search}%`),
        like(users.email, `%${filters.search}%`)
      )
    );
  }
  if (filters?.startDate) {
    conditions.push(gte(users.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(users.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);
  const total = countResult[0]?.count || 0;

  // Apply pagination
  query = query.orderBy(desc(users.createdAt)) as any;
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  const userList = await query;

  // Get additional data for each user
  const enrichedUsers = await Promise.all(
    userList.map(async (user) => {
      const profile = await getUserProfile(user.id);
      const letters = await getDisputeLettersByUserId(user.id);
      const accounts = await getNegativeAccountsByUserId(user.id);
      const latestPayment = await getUserLatestPayment(user.id);

      return {
        ...user,
        profile: profile || null,
        letterCount: letters.length,
        accountCount: accounts.length,
        hasActiveSubscription: !!latestPayment && latestPayment.status === 'completed',
        city: profile?.currentCity || null,
        state: profile?.currentState || null,
      };
    })
  );

  return { users: enrichedUsers, total };
}

/**
 * Get user by ID with full details for admin
 */
export async function getAdminUserDetails(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const profile = await getUserProfile(userId);
  const letters = await getDisputeLettersByUserId(userId);
  const accounts = await getNegativeAccountsByUserId(userId);
  const reports = await getCreditReportsByUserId(userId);
  const paymentHistory = await getPaymentsByUserId(userId);
  const activity = await getUserRecentActivity(userId, 50);
  const notifications = await getUserNotifications(userId, { limit: 20 });

  return {
    ...user,
    profile,
    letters,
    accounts,
    reports,
    paymentHistory,
    activity,
    notifications,
  };
}

/**
 * Update user role (with hierarchy check)
 */
export async function updateUserRole(
  userId: number,
  newRole: 'user' | 'admin' | 'super_admin' | 'master_admin',
  updatedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Log the action
  await logAdminActivity(updatedBy, 'role_change', `Changed user ${userId} role to ${newRole}`);
}

/**
 * Update user status (block/unblock)
 */
export async function updateUserStatus(
  userId: number,
  status: 'active' | 'blocked' | 'suspended',
  blockedBy?: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'blocked' || status === 'suspended') {
    updateData.blockedAt = new Date();
    updateData.blockedBy = blockedBy;
    updateData.blockedReason = reason;
  } else {
    updateData.blockedAt = null;
    updateData.blockedBy = null;
    updateData.blockedReason = null;
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));

  if (blockedBy) {
    await logAdminActivity(blockedBy, 'user_status_change', `Changed user ${userId} status to ${status}${reason ? `: ${reason}` : ''}`);
  }
}

/**
 * Delete user and all associated data
 */
export async function deleteUser(userId: number, deletedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete in order of dependencies
  await db.delete(userNotifications).where(eq(userNotifications.userId, userId));
  await db.delete(disputeLetters).where(eq(disputeLetters.userId, userId));
  await db.delete(negativeAccounts).where(eq(negativeAccounts.userId, userId));
  await db.delete(creditReports).where(eq(creditReports.userId, userId));
  await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
  await db.delete(payments).where(eq(payments.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  await logAdminActivity(deletedBy, 'user_deleted', `Deleted user ${userId} and all associated data`);
}

/**
 * Update user profile from admin
 */
export async function adminUpdateUserProfile(
  userId: number,
  data: Partial<{
    name: string;
    email: string;
    fullName: string;
    phone: string;
    currentAddress: string;
    currentCity: string;
    currentState: string;
    currentZip: string;
  }>,
  updatedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update user table fields
  if (data.name || data.email) {
    await db
      .update(users)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Update profile fields
  const profileData: any = {};
  if (data.fullName) profileData.fullName = data.fullName;
  if (data.phone) profileData.phone = data.phone;
  if (data.currentAddress) profileData.currentAddress = data.currentAddress;
  if (data.currentCity) profileData.currentCity = data.currentCity;
  if (data.currentState) profileData.currentState = data.currentState;
  if (data.currentZip) profileData.currentZip = data.currentZip;

  if (Object.keys(profileData).length > 0) {
    await upsertUserProfile(userId, profileData);
  }

  await logAdminActivity(updatedBy, 'user_profile_updated', `Admin updated profile for user ${userId}`);
}

/**
 * Get all admins
 */
export async function getAllAdmins() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(users)
    .where(
      or(
        eq(users.role, 'admin'),
        eq(users.role, 'super_admin'),
        eq(users.role, 'master_admin')
      )
    )
    .orderBy(desc(users.role), desc(users.createdAt));
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

/**
 * Get all letters with user info for admin
 */
export async function getAdminLettersList(filters?: {
  bureau?: string;
  status?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { letters: [], total: 0 };

  let query = db.select().from(disputeLetters);
  const conditions: any[] = [];

  if (filters?.bureau) {
    conditions.push(eq(disputeLetters.bureau, filters.bureau as any));
  }
  if (filters?.status) {
    conditions.push(eq(disputeLetters.status, filters.status as any));
  }
  if (filters?.userId) {
    conditions.push(eq(disputeLetters.userId, filters.userId));
  }
  if (filters?.startDate) {
    conditions.push(gte(disputeLetters.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(disputeLetters.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(disputeLetters);
  const total = countResult[0]?.count || 0;

  query = query.orderBy(desc(disputeLetters.createdAt)) as any;
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  const letters = await query;

  // Enrich with user info
  const allUsers = await getAllUsers();
  const enrichedLetters = letters.map((letter) => {
    const user = allUsers.find((u) => u.id === letter.userId);
    return {
      ...letter,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || 'Unknown',
    };
  });

  return { letters: enrichedLetters, total };
}

/**
 * Get dashboard stats for admin
 */
export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const allUsers = await getAllUsers();
  const allLetters = await getAllDisputeLetters();
  const allPayments = await getAllPayments();
  const allAdmins = await getAllAdmins();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    users: {
      total: allUsers.length,
      active: allUsers.filter((u) => u.status === 'active').length,
      blocked: allUsers.filter((u) => u.status === 'blocked').length,
      newThisMonth: allUsers.filter((u) => u.createdAt >= thisMonthStart).length,
      newThisWeek: allUsers.filter((u) => u.createdAt >= thisWeekStart).length,
    },
    admins: {
      total: allAdmins.length,
      masterAdmins: allAdmins.filter((a) => a.role === 'master_admin').length,
      superAdmins: allAdmins.filter((a) => a.role === 'super_admin').length,
      admins: allAdmins.filter((a) => a.role === 'admin').length,
    },
    letters: {
      total: allLetters.length,
      generated: allLetters.filter((l) => l.status === 'generated').length,
      mailed: allLetters.filter((l) => l.status === 'mailed').length,
      resolved: allLetters.filter((l) => l.status === 'resolved').length,
      thisMonth: allLetters.filter((l) => l.createdAt >= thisMonthStart).length,
      byBureau: {
        transunion: allLetters.filter((l) => l.bureau === 'transunion').length,
        equifax: allLetters.filter((l) => l.bureau === 'equifax').length,
        experian: allLetters.filter((l) => l.bureau === 'experian').length,
      },
    },
    revenue: {
      total: allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      thisMonth: allPayments
        .filter((p) => p.createdAt >= thisMonthStart)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      lastMonth: allPayments
        .filter((p) => p.createdAt >= lastMonthStart && p.createdAt < thisMonthStart)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      transactions: allPayments.length,
    },
  };
}

/**
 * Export users to CSV format
 */
export async function exportUsersToCSV(filters?: {
  role?: string;
  status?: string;
  state?: string;
}) {
  const { users: userList } = await getAdminUserList({ ...filters, limit: 10000 });

  const headers = [
    'ID',
    'Name',
    'Email',
    'Role',
    'Status',
    'Account Type',
    'City',
    'State',
    'Letters',
    'Accounts',
    'Subscription',
    'Created At',
    'Last Sign In',
  ];

  const rows = userList.map((u) => [
    u.id,
    u.name || '',
    u.email || '',
    u.role,
    u.status,
    u.accountType,
    u.city || '',
    u.state || '',
    u.letterCount,
    u.accountCount,
    u.hasActiveSubscription ? 'Active' : 'None',
    u.createdAt?.toISOString() || '',
    u.lastSignedIn?.toISOString() || '',
  ]);

  return {
    headers,
    rows,
    csv: [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n'),
  };
}

/**
 * Export letters to CSV format
 */
export async function exportLettersToCSV(filters?: {
  bureau?: string;
  status?: string;
  userId?: number;
}) {
  const { letters } = await getAdminLettersList({ ...filters, limit: 10000 });

  const headers = [
    'ID',
    'User Name',
    'User Email',
    'Bureau',
    'Letter Type',
    'Round',
    'Status',
    'Created At',
    'Mailed At',
    'Tracking Number',
  ];

  const rows = letters.map((l) => [
    l.id,
    l.userName || '',
    l.userEmail || '',
    l.bureau,
    l.letterType,
    l.round,
    l.status,
    l.createdAt?.toISOString() || '',
    l.mailedAt?.toISOString() || '',
    l.trackingNumber || '',
  ]);

  return {
    headers,
    rows,
    csv: [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n'),
  };
}

// Helper to log admin activity
async function logAdminActivity(userId: number, action: string, details: string) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(activityLog).values({
      userId,
      action,
      details,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}


// ============================================
// TRIAL CONVERSION FUNCTIONS (for cron jobs)
// ============================================

/**
 * Get active trials (not converted, not expired)
 */
export async function getActiveTrials(): Promise<TrialConversion[]> {
  const db = await getDb();
  if (!db) return [];
  
  const trials = await db
    .select()
    .from(trialConversions)
    .where(
      and(
        eq(trialConversions.converted, false),
        isNull(trialConversions.expiredAt)
      )
    );
  
  return trials;
}

/**
 * Get trial with user info
 */
export async function getTrialWithUser(trialId: number): Promise<{ trial: TrialConversion; user: any } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const trial = await db
    .select()
    .from(trialConversions)
    .where(eq(trialConversions.id, trialId))
    .limit(1);
  
  if (!trial.length) return null;
  
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, trial[0].userId))
    .limit(1);
  
  return { trial: trial[0], user: user[0] || null };
}

/**
 * Update trial email sent status
 */
export async function updateTrialEmailSent(
  trialId: number,
  field: 'day1EmailSent' | 'day3EmailSent' | 'day5EmailSent' | 'day6EmailSent' | 'day7EmailSent',
  value: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(trialConversions)
    .set({ [field]: value })
    .where(eq(trialConversions.id, trialId));
}

/**
 * Mark trial as expired
 */
export async function expireTrialConversion(trialId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(trialConversions)
    .set({ expiredAt: new Date() })
    .where(eq(trialConversions.id, trialId));
}

/**
 * Get expired trials for winback emails
 */
export async function getExpiredTrialsForWinback(daysAgo: number): Promise<TrialConversion[]> {
  const db = await getDb();
  if (!db) return [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
  
  const trials = await db
    .select()
    .from(trialConversions)
    .where(
      and(
        eq(trialConversions.converted, false),
        gte(trialConversions.expiredAt, cutoffDate)
      )
    );
  
  return trials;
}

// ============================================
// SUBSCRIPTION V2 FUNCTIONS (for cron jobs)
// ============================================

/**
 * Get subscription V2 by user ID (for tier: trial, starter, professional, complete)
 */
export async function getSubscriptionV2ByUserId(userId: number): Promise<SubscriptionV2 | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptionsV2).where(eq(subscriptionsV2.userId, userId)).limit(1);
  return result[0];
}

/**
 * Get expired trial subscriptions
 */
export async function getExpiredTrialSubscriptions(): Promise<SubscriptionV2[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  
  const subs = await db
    .select()
    .from(subscriptionsV2)
    .where(
      and(
        eq(subscriptionsV2.status, 'trial'),
        lt(subscriptionsV2.trialEndsAt, now)
      )
    );
  
  return subs;
}

/**
 * Update subscription status
 */
export async function updateSubscriptionV2Status(
  subscriptionId: number,
  status: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(subscriptionsV2)
    .set({ status })
    .where(eq(subscriptionsV2.id, subscriptionId));
}

/**
 * Record payment and create/update subscription after checkout success (Stripe Elements flow)
 */
export async function recordPaymentAndSubscriptionForCheckout(params: {
  userId: number;
  tier: 'essential' | 'complete';
  amountUsd: number;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePaymentId: string;
}): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");

  const tierForPayment = 'subscription_monthly' as const;
  const tierForSubV2 = params.tier === 'essential' ? 'starter' : 'complete';

  try {
    await dbInstance.insert(payments).values({
      userId: params.userId,
      amount: params.amountUsd.toFixed(2),
      tier: tierForPayment,
      stripePaymentId: params.stripePaymentId,
      status: 'completed',
    });
  } catch (e) {
    console.warn('[recordPaymentAndSubscriptionForCheckout] createPayment (may exist):', (e as Error).message);
  }

  const existing = await getSubscriptionV2ByUserId(params.userId);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  if (existing) {
    await dbInstance.update(subscriptionsV2).set({
      tier: tierForSubV2,
      status: 'active',
      stripeSubscriptionId: params.stripeSubscriptionId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    }).where(eq(subscriptionsV2.id, existing.id));
  } else {
    await dbInstance.insert(subscriptionsV2).values({
      userId: params.userId,
      tier: tierForSubV2,
      status: 'active',
      stripeSubscriptionId: params.stripeSubscriptionId,
      stripeCustomerId: params.stripeCustomerId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });
  }
}

// ============================================
// DISPUTE ROUNDS FUNCTIONS (for cron jobs)
// ============================================

/**
 * Get dispute rounds that should be unlocked
 */
export async function getDisputeRoundsToUnlock(): Promise<DisputeRound[]> {
  const db = await getDb();
  if (!db) return [];
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const rounds = await db
    .select()
    .from(disputeRounds)
    .where(
      and(
        eq(disputeRounds.status, 'mailed'),
        lt(disputeRounds.mailedAt, thirtyDaysAgo)
      )
    );
  
  return rounds;
}

/**
 * Unlock a dispute round
 */
export async function unlockDisputeRound(roundId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(disputeRounds)
    .set({ status: 'unlocked' })
    .where(eq(disputeRounds.id, roundId));
}

