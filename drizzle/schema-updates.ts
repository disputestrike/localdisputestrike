/**
 * NEW SCHEMA ADDITIONS FOR DISPUTESTRIKE V2
 * 
 * Features:
 * - $1 Trial Funnel with 7-day expiration
 * - 3-Tier Monthly Subscriptions: Starter ($49), Professional ($69.95), Complete ($99.95)
 * - Round Locking System (Starter: 2 rounds, Pro: 3 rounds, Complete: unlimited)
 * - AI Auto-Selection for dispute items
 * - Response Upload and Analysis
 * - Onboarding Wizard with identity verification
 */

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

// ============================================
// SUBSCRIPTION TIERS (REPLACE OLD subscriptions TABLE)
// ============================================

/**
 * New subscription tiers with trial support
 */
export const subscriptionsV2 = mysqlTable("subscriptions_v2", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  // Subscription tier: starter ($49/mo), professional ($69.95/mo), complete ($99.95/mo)
  tier: mysqlEnum("tier", ["trial", "starter", "professional", "complete"]).notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "trial",           // $1 trial active
    "trial_expired",   // Trial ended without conversion
    "active",          // Paid subscription active
    "past_due",        // Payment failed
    "canceled",        // User canceled
    "paused"           // Subscription paused
  ]).default("trial").notNull(),
  
  // Trial tracking
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),        // 7 days after trial start
  trialConvertedAt: timestamp("trialConvertedAt"), // When they upgraded from trial
  
  // Billing cycle
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  
  // Cancellation
  canceledAt: timestamp("canceledAt"),
  cancelReason: text("cancelReason"),
  
  // Monitoring partner (IdentityIQ)
  monitoringPartnerId: varchar("monitoringPartnerId", { length: 255 }), // IdentityIQ user ID
  monitoringStatus: mysqlEnum("monitoringStatus", ["pending", "active", "suspended", "canceled"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionV2 = typeof subscriptionsV2.$inferSelect;
export type InsertSubscriptionV2 = typeof subscriptionsV2.$inferInsert;

// ============================================
// DISPUTE ROUNDS TRACKING
// ============================================

/**
 * Tracks each dispute round with locking logic
 */
export const disputeRounds = mysqlTable("dispute_rounds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Round number (1, 2, 3, etc.)
  roundNumber: int("roundNumber").notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "pending",           // Not started yet
    "active",            // Currently in progress
    "letters_generated", // Letters created, waiting to be mailed
    "mailed",            // Letters mailed, waiting for responses
    "awaiting_response", // 30-day wait period
    "responses_uploaded", // User uploaded bureau responses
    "complete"           // Round finished
  ]).default("pending").notNull(),
  
  // Timing
  startedAt: timestamp("startedAt"),
  lettersGeneratedAt: timestamp("lettersGeneratedAt"),
  mailedAt: timestamp("mailedAt"),
  
  // Round locking (30-day wait)
  lockedUntil: timestamp("lockedUntil"),  // When next round unlocks
  unlockedEarly: boolean("unlockedEarly").default(false), // If unlocked by uploading responses
  
  // Items disputed in this round
  itemsDisputed: int("itemsDisputed").default(0),
  
  // Results (after responses uploaded)
  itemsDeleted: int("itemsDeleted").default(0),
  itemsVerified: int("itemsVerified").default(0),
  itemsUpdated: int("itemsUpdated").default(0),
  itemsNoResponse: int("itemsNoResponse").default(0),
  
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DisputeRound = typeof disputeRounds.$inferSelect;
export type InsertDisputeRound = typeof disputeRounds.$inferInsert;

// ============================================
// AI RECOMMENDATIONS FOR DISPUTE ITEMS
// ============================================

/**
 * AI-generated recommendations for which items to dispute
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  negativeAccountId: int("negativeAccountId").notNull(),
  roundId: int("roundId"),  // Which round this recommendation is for
  
  // AI Selection
  isRecommended: boolean("isRecommended").default(false).notNull(),
  priority: int("priority"),  // 1 = highest priority
  
  // Win probability (0-100)
  winProbability: int("winProbability"),
  
  // Reason for recommendation
  recommendationReason: text("recommendationReason"),
  
  // Factors that influenced the recommendation
  factors: text("factors"),  // JSON array of factors
  
  // Which detection methods triggered
  methodsTriggered: text("methodsTriggered"),  // JSON array of method numbers
  
  // Was this item actually disputed?
  wasDisputed: boolean("wasDisputed").default(false),
  
  // Outcome (if disputed)
  outcome: mysqlEnum("outcome", ["pending", "deleted", "verified", "updated", "no_response"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

// ============================================
// BUREAU RESPONSE UPLOADS
// ============================================

/**
 * Bureau response letters uploaded by users
 */
export const bureauResponses = mysqlTable("bureau_responses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  roundId: int("roundId").notNull(),
  
  // Bureau that responded
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  
  // File info
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: text("fileName"),
  
  // Response date
  responseDate: timestamp("responseDate"),
  receivedDate: timestamp("receivedDate"),
  
  // AI-parsed results
  isParsed: boolean("isParsed").default(false),
  parsedData: text("parsedData"),  // JSON with extracted info
  
  // Summary of results
  itemsDeleted: int("itemsDeleted").default(0),
  itemsVerified: int("itemsVerified").default(0),
  itemsUpdated: int("itemsUpdated").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BureauResponse = typeof bureauResponses.$inferSelect;
export type InsertBureauResponse = typeof bureauResponses.$inferInsert;

// ============================================
// ONBOARDING WIZARD TRACKING
// ============================================

/**
 * Tracks user progress through onboarding wizard
 */
export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Wizard steps completed
  step1_personalInfo: boolean("step1_personalInfo").default(false),
  step2_address: boolean("step2_address").default(false),
  step3_identityDocs: boolean("step3_identityDocs").default(false),
  step4_creditReports: boolean("step4_creditReports").default(false),
  step5_planSelection: boolean("step5_planSelection").default(false),
  
  // Current step (1-5)
  currentStep: int("currentStep").default(1),
  
  // Overall completion
  isComplete: boolean("isComplete").default(false),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

// ============================================
// IDENTITY DOCUMENTS
// ============================================

/**
 * Identity verification documents (ID, utility bills)
 */
export const identityDocuments = mysqlTable("identity_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Document type
  documentType: mysqlEnum("documentType", [
    "drivers_license",
    "passport",
    "state_id",
    "utility_bill",
    "bank_statement",
    "ssn_card"
  ]).notNull(),
  
  // File info
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: text("fileName"),
  
  // Verification status
  isVerified: boolean("isVerified").default(false),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),  // Admin who verified
  
  // Expiration (for IDs)
  expirationDate: varchar("expirationDate", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IdentityDocument = typeof identityDocuments.$inferSelect;
export type InsertIdentityDocument = typeof identityDocuments.$inferInsert;

// ============================================
// TRIAL CONVERSION TRACKING
// ============================================

/**
 * Tracks $1 trial to paid conversion funnel
 */
export const trialConversions = mysqlTable("trial_conversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Trial info
  trialStartedAt: timestamp("trialStartedAt").notNull(),
  trialEndsAt: timestamp("trialEndsAt").notNull(),
  
  // Conversion
  converted: boolean("converted").default(false),
  convertedAt: timestamp("convertedAt"),
  convertedToTier: mysqlEnum("convertedToTier", ["starter", "professional", "complete"]),
  
  // If not converted
  expiredAt: timestamp("expiredAt"),
  
  // Email sequence tracking
  day1EmailSent: boolean("day1EmailSent").default(false),
  day3EmailSent: boolean("day3EmailSent").default(false),
  day5EmailSent: boolean("day5EmailSent").default(false),
  day7EmailSent: boolean("day7EmailSent").default(false),
  
  // Engagement during trial
  creditReportsPulled: boolean("creditReportsPulled").default(false),
  negativeItemsViewed: boolean("negativeItemsViewed").default(false),
  aiRecommendationsViewed: boolean("aiRecommendationsViewed").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialConversion = typeof trialConversions.$inferSelect;
export type InsertTrialConversion = typeof trialConversions.$inferInsert;

// ============================================
// MONITORING PARTNER INTEGRATION (IdentityIQ)
// ============================================

/**
 * IdentityIQ integration data
 */
export const monitoringAccounts = mysqlTable("monitoring_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Partner info
  partner: mysqlEnum("partner", ["identityiq", "smartcredit", "myscoreiq"]).default("identityiq"),
  partnerUserId: varchar("partnerUserId", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "active", "suspended", "canceled"]).default("pending"),
  
  // Last credit pull
  lastCreditPullAt: timestamp("lastCreditPullAt"),
  nextScheduledPull: timestamp("nextScheduledPull"),
  
  // Scores (from monitoring)
  transunionScore: int("transunionScore"),
  equifaxScore: int("equifaxScore"),
  experianScore: int("experianScore"),
  scoresUpdatedAt: timestamp("scoresUpdatedAt"),
  
  // Alerts
  alertsEnabled: boolean("alertsEnabled").default(true),
  lastAlertAt: timestamp("lastAlertAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonitoringAccount = typeof monitoringAccounts.$inferSelect;
export type InsertMonitoringAccount = typeof monitoringAccounts.$inferInsert;
