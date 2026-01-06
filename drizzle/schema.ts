import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credit reports uploaded by users
 */
export const creditReports = mysqlTable("credit_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: text("fileName"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  parsedData: longtext("parsedData"), // JSON string of parsed credit report data (can be large)
  isParsed: boolean("isParsed").default(false).notNull(),
});

export type CreditReport = typeof creditReports.$inferSelect;
export type InsertCreditReport = typeof creditReports.$inferInsert;

/**
 * Negative accounts extracted from credit reports
 */
export const negativeAccounts = mysqlTable("negative_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountName: text("accountName").notNull(),
  accountNumber: varchar("accountNumber", { length: 255 }),
  accountType: varchar("accountType", { length: 100 }), // Collection, Charge-off, Late Payment, etc.
  balance: decimal("balance", { precision: 10, scale: 2 }),
  originalCreditor: text("originalCreditor"),
  dateOpened: varchar("dateOpened", { length: 50 }),
  lastActivity: varchar("lastActivity", { length: 50 }),
  status: text("status"),
  
  // Bureau-specific data
  transunionData: text("transunionData"), // JSON
  equifaxData: text("equifaxData"), // JSON
  experianData: text("experianData"), // JSON
  
  // Conflict detection
  hasConflicts: boolean("hasConflicts").default(false).notNull(),
  conflictDetails: text("conflictDetails"), // JSON array of conflicts
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NegativeAccount = typeof negativeAccounts.$inferSelect;
export type InsertNegativeAccount = typeof negativeAccounts.$inferInsert;

/**
 * Dispute letters generated for users
 */
export const disputeLetters = mysqlTable("dispute_letters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian", "furnisher"]).notNull(),
  recipientName: text("recipientName"), // For furnisher disputes
  recipientAddress: text("recipientAddress"),
  
  letterContent: text("letterContent").notNull(), // Full letter content
  accountsDisputed: text("accountsDisputed").notNull(), // JSON array of account IDs
  
  round: int("round").default(1).notNull(), // Dispute round (1, 2, 3, etc.)
  letterType: mysqlEnum("letterType", ["initial", "followup", "escalation", "cfpb"]).default("initial").notNull(),
  
  status: mysqlEnum("status", ["generated", "downloaded", "mailed", "response_received", "resolved"]).default("generated").notNull(),
  
  mailedAt: timestamp("mailedAt"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  responseDeadline: timestamp("responseDeadline"),
  responseReceivedAt: timestamp("responseReceivedAt"),
  responseDetails: text("responseDetails"), // JSON
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DisputeLetter = typeof disputeLetters.$inferSelect;
export type InsertDisputeLetter = typeof disputeLetters.$inferInsert;

/**
 * Success stories for marketing (with user permission)
 */
export const successStories = mysqlTable("success_stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // User consent
  userConsent: boolean("userConsent").default(false).notNull(),
  consentDate: timestamp("consentDate"),
  anonymizationLevel: mysqlEnum("anonymizationLevel", ["full_name", "first_name", "initials", "anonymous"]).default("first_name").notNull(),
  
  // Success metrics
  scoreBefore: int("scoreBefore"),
  scoreAfter: int("scoreAfter"),
  scoreIncrease: int("scoreIncrease"),
  accountsDeleted: int("accountsDeleted").default(0).notNull(),
  accountsVerified: int("accountsVerified").default(0).notNull(),
  daysToResults: int("daysToResults"), // Days from first letter to final results
  
  // Generated content
  testimonialText: text("testimonialText"), // AI-generated or user-provided testimonial
  isAIGenerated: boolean("isAIGenerated").default(true).notNull(),
  
  // Display settings
  isPublished: boolean("isPublished").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  displayName: varchar("displayName", { length: 100 }), // e.g., "Benjamin P.", "B.P.", "Anonymous"
  
  // Social media assets
  socialMediaImageUrl: text("socialMediaImageUrl"),
  
  // Admin notes
  adminNotes: text("adminNotes"),
  approvedBy: int("approvedBy"), // Admin user ID
  approvedAt: timestamp("approvedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = typeof successStories.$inferInsert;

/**
 * Payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  
  tier: mysqlEnum("tier", ["diy_quick", "diy_complete", "white_glove", "subscription_monthly", "subscription_annual"]).notNull(),
  
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * User subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  
  tier: mysqlEnum("tier", ["monthly", "annual"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "expired"]).default("active").notNull(),
  
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  canceledAt: timestamp("canceledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Mailing checklist tracking
 */
export const mailingChecklists = mysqlTable("mailing_checklists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  disputeLetterId: int("disputeLetterId").notNull(),
  
  printedLetters: boolean("printedLetters").default(false).notNull(),
  signedInBlueInk: boolean("signedInBlueInk").default(false).notNull(),
  handwroteEnvelope: boolean("handwroteEnvelope").default(false).notNull(),
  includedId: boolean("includedId").default(false).notNull(),
  includedUtilityBill: boolean("includedUtilityBill").default(false).notNull(),
  includedSupportingDocs: boolean("includedSupportingDocs").default(false).notNull(),
  mailedFromLocalPostOffice: boolean("mailedFromLocalPostOffice").default(false).notNull(),
  gotCertifiedReceipt: boolean("gotCertifiedReceipt").default(false).notNull(),
  uploadedTrackingNumber: boolean("uploadedTrackingNumber").default(false).notNull(),
  
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MailingChecklist = typeof mailingChecklists.$inferSelect;
export type InsertMailingChecklist = typeof mailingChecklists.$inferInsert;

/**
 * Lead capture from quiz funnel (no auth required)
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  creditScoreRange: varchar("creditScoreRange", { length: 50 }),
  negativeItemsCount: varchar("negativeItemsCount", { length: 50 }),
  bureaus: text("bureaus"), // Comma-separated list
  source: varchar("source", { length: 100 }).default("quiz_funnel").notNull(),
  convertedToUser: boolean("convertedToUser").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Contact form submissions
 */
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
