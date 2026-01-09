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
  
  // Agency/Merchant Account Fields
  accountType: mysqlEnum("accountType", ["individual", "agency"]).default("individual").notNull(),
  agencyName: varchar("agencyName", { length: 255 }), // Business name for agencies
  agencyPlanTier: mysqlEnum("agencyPlanTier", ["starter", "professional", "enterprise"]),
  clientSlotsIncluded: int("clientSlotsIncluded").default(0), // 50, 200, or 500 based on plan
  clientSlotsUsed: int("clientSlotsUsed").default(0),
  agencyMonthlyPrice: decimal("agencyMonthlyPrice", { precision: 10, scale: 2 }), // 497, 997, or 1997
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profile with personal information for dispute letters
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Personal info
  fullName: text("fullName"),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }), // Format: YYYY-MM-DD
  ssnLast4: varchar("ssnLast4", { length: 4 }), // Last 4 digits only
  
  // Contact info
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  
  // Current address
  currentAddress: text("currentAddress"),
  currentCity: varchar("currentCity", { length: 100 }),
  currentState: varchar("currentState", { length: 50 }),
  currentZip: varchar("currentZip", { length: 20 }),
  
  // Previous address (for bureau verification)
  previousAddress: text("previousAddress"),
  previousCity: varchar("previousCity", { length: 100 }),
  previousState: varchar("previousState", { length: 50 }),
  previousZip: varchar("previousZip", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

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
  // Credit score extracted from report
  creditScore: int("creditScore"), // 300-850
  scoreModel: varchar("scoreModel", { length: 50 }), // FICO, VantageScore 3.0, etc.
});

export type CreditReport = typeof creditReports.$inferSelect;
export type InsertCreditReport = typeof creditReports.$inferInsert;

/**
 * Credit score history for tracking score changes over time
 */
export const creditScoreHistory = mysqlTable("credit_score_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  score: int("score").notNull(), // 300-850
  scoreModel: varchar("scoreModel", { length: 50 }), // FICO, VantageScore 3.0, etc.
  creditReportId: int("creditReportId"), // Link to the credit report this score came from
  event: varchar("event", { length: 255 }), // Optional event description (e.g., "Started disputes", "5 accounts deleted")
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type CreditScoreHistory = typeof creditScoreHistory.$inferSelect;
export type InsertCreditScoreHistory = typeof creditScoreHistory.$inferInsert;

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
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian", "furnisher", "collector", "creditor", "legal"]).notNull(),
  recipientName: text("recipientName"), // For furnisher disputes
  recipientAddress: text("recipientAddress"),
  
  letterContent: text("letterContent").notNull(), // Full letter content
  accountsDisputed: text("accountsDisputed").notNull(), // JSON array of account IDs
  
  round: int("round").default(1).notNull(), // Dispute round (1, 2, 3, etc.)
  letterType: mysqlEnum("letterType", ["initial", "followup", "escalation", "cfpb", "cease_desist", "pay_for_delete", "intent_to_sue", "estoppel", "debt_validation"]).default("initial").notNull(),
  
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
 */// SmartCredit OAuth tokens
export const smartcreditTokens = mysqlTable("smartcredit_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: int("expires_at"),
  smartcreditUserId: text("smartcredit_user_id"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Parser comparison logs (custom parser vs SmartCredit)
export const parserComparisons = mysqlTable("parser_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  creditReportId: int("credit_report_id"),
  bureau: text("bureau").notNull(), // transunion, equifax, experian
  
  // Custom parser results
  customParserAccounts: longtext("custom_parser_accounts"),
  customParserScore: int("custom_parser_score"),
  customParserConfidence: int("custom_parser_confidence"), // 0-100
  
  // SmartCredit results
  smartcreditAccounts: longtext("smartcredit_accounts"),
  smartcreditScore: int("smartcredit_score"),
  
  // Comparison results
  differences: longtext("differences"), // Field-level differences
  matchPercentage: int("match_percentage"), // 0-100
  majorDiscrepancies: int("major_discrepancies"), // Count of critical mismatches
  
  // Decision
  selectedSource: text("selected_source"), // custom, smartcredit, hybrid
  selectionReason: text("selection_reason"),
  
  createdAt: timestamp("created_at").notNull(),
});

// Parser accuracy metrics (tracking improvements over time)
export const parserAccuracyMetrics = mysqlTable("parser_accuracy_metrics", {
  id: int("id").autoincrement().primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  
  // Accuracy stats
  totalComparisons: int("total_comparisons").notNull(),
  perfectMatches: int("perfect_matches"), // 100% match
  goodMatches: int("good_matches"), // 90-99% match
  poorMatches: int("poor_matches"), // <90% match
  averageAccuracy: int("average_accuracy"), // 0-100
  
  // Usage stats
  customParserUsed: int("custom_parser_used"),
  smartcreditUsed: int("smartcredit_used"),
  hybridUsed: int("hybrid_used"),
  
  // Cost tracking
  smartcreditApiCalls: int("smartcredit_api_calls"),
  estimatedCost: int("estimated_cost"), // in cents
  
  // A/B test config
  customParserRolloutPercentage: int("custom_parser_rollout_percentage"), // 0-100
  
  createdAt: timestamp("created_at").notNull(),
});

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
  
  // Video testimonial
  videoUrl: text("videoUrl"),
  videoThumbnailUrl: text("videoThumbnailUrl"),
  videoDuration: int("videoDuration"), // Duration in seconds
  hasVideo: boolean("hasVideo").default(false).notNull(),
  
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

/**
 * Email leads captured from exit-intent popups and other lead magnets
 */
export const emailLeads = mysqlTable("email_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(), // exit_intent_popup, landing_page, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLead = typeof emailLeads.$inferSelect;
export type InsertEmailLead = typeof emailLeads.$inferInsert;

/**
 * Credit Education Course Progress
 */
export const courseProgress = mysqlTable("course_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Lesson tracking
  lessonId: varchar("lessonId", { length: 100 }).notNull(), // e.g., "module1-lesson1"
  moduleId: varchar("moduleId", { length: 50 }).notNull(), // e.g., "module1"
  
  // Progress
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  
  // Quiz scores (if applicable)
  quizScore: int("quizScore"), // 0-100
  quizAttempts: int("quizAttempts").default(0).notNull(),
  
  // Time tracking
  timeSpentSeconds: int("timeSpentSeconds").default(0).notNull(),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseProgress = typeof courseProgress.$inferSelect;
export type InsertCourseProgress = typeof courseProgress.$inferInsert;

/**
 * Course certificates earned
 */
export const courseCertificates = mysqlTable("course_certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Certificate details
  certificateNumber: varchar("certificateNumber", { length: 50 }).notNull().unique(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  
  // Completion stats
  totalTimeSpentSeconds: int("totalTimeSpentSeconds").default(0).notNull(),
  averageQuizScore: int("averageQuizScore"), // 0-100
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseCertificate = typeof courseCertificates.$inferSelect;
export type InsertCourseCertificate = typeof courseCertificates.$inferInsert;


/**
 * Dispute outcomes - tracks the result of each dispute
 */
export const disputeOutcomes = mysqlTable("dispute_outcomes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  disputeLetterId: int("disputeLetterId").notNull(),
  accountId: int("accountId"), // Reference to negative_accounts
  
  // Outcome status
  outcome: mysqlEnum("outcome", ["deleted", "verified", "updated", "no_response", "pending"]).default("pending").notNull(),
  
  // Response details
  responseReceivedAt: timestamp("responseReceivedAt"),
  responseFileUrl: text("responseFileUrl"), // S3 URL of uploaded response letter
  responseFileKey: text("responseFileKey"),
  responseNotes: text("responseNotes"),
  
  // For "updated" outcomes
  updatedFields: text("updatedFields"), // JSON of what was changed
  
  // Timeline
  letterMailedAt: timestamp("letterMailedAt"),
  deadlineDate: timestamp("deadlineDate"), // 30 days from mailed
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DisputeOutcome = typeof disputeOutcomes.$inferSelect;
export type InsertDisputeOutcome = typeof disputeOutcomes.$inferInsert;

/**
 * Hard inquiries extracted from credit reports
 */
export const hardInquiries = mysqlTable("hard_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  creditReportId: int("creditReportId"),
  
  // Inquiry details
  creditorName: varchar("creditorName", { length: 255 }).notNull(),
  inquiryDate: varchar("inquiryDate", { length: 50 }),
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  inquiryType: mysqlEnum("inquiryType", ["hard", "soft"]).default("hard").notNull(),
  
  // Dispute status
  isAuthorized: boolean("isAuthorized").default(true).notNull(), // User marks as authorized/unauthorized
  disputeStatus: mysqlEnum("disputeStatus", ["none", "disputed", "removed", "verified"]).default("none").notNull(),
  disputedAt: timestamp("disputedAt"),
  removedAt: timestamp("removedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HardInquiry = typeof hardInquiries.$inferSelect;
export type InsertHardInquiry = typeof hardInquiries.$inferInsert;

/**
 * CFPB complaints filed by users
 */
export const cfpbComplaints = mysqlTable("cfpb_complaints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Complaint details
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  complaintType: varchar("complaintType", { length: 100 }).notNull(), // incorrect_info, investigation_problem, etc.
  issueDescription: text("issueDescription").notNull(),
  desiredResolution: text("desiredResolution"),
  
  // Generated complaint content
  complaintContent: text("complaintContent"),
  
  // Status tracking
  status: mysqlEnum("status", ["draft", "submitted", "response_received", "resolved"]).default("draft").notNull(),
  caseNumber: varchar("caseNumber", { length: 50 }), // CFPB case number
  submittedAt: timestamp("submittedAt"),
  responseReceivedAt: timestamp("responseReceivedAt"),
  responseDetails: text("responseDetails"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CFPBComplaint = typeof cfpbComplaints.$inferSelect;
export type InsertCFPBComplaint = typeof cfpbComplaints.$inferInsert;

/**
 * Referral program tracking
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // User who referred
  referredUserId: int("referredUserId"), // User who signed up (null until signup)
  
  // Referral code
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  
  // Status
  status: mysqlEnum("status", ["pending", "signed_up", "subscribed", "paid_out"]).default("pending").notNull(),
  
  // Earnings
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).default("50.00"),
  paidOutAt: timestamp("paidOutAt"),
  
  // Tracking
  clickCount: int("clickCount").default(0).notNull(),
  signedUpAt: timestamp("signedUpAt"),
  subscribedAt: timestamp("subscribedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User activity log for dashboard
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Activity details
  activityType: varchar("activityType", { length: 50 }).notNull(), // report_uploaded, letter_generated, letter_mailed, account_deleted, etc.
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON with additional details
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;


/**
 * Agency Clients - Sub-accounts managed by agency accounts
 */
export const agencyClients = mysqlTable("agency_clients", {
  id: int("id").autoincrement().primaryKey(),
  agencyUserId: int("agencyUserId").notNull(), // The agency that owns this client
  
  // Client info
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  
  // Personal info for dispute letters
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  ssnLast4: varchar("ssnLast4", { length: 4 }),
  currentAddress: text("currentAddress"),
  currentCity: varchar("currentCity", { length: 100 }),
  currentState: varchar("currentState", { length: 50 }),
  currentZip: varchar("currentZip", { length: 20 }),
  previousAddress: text("previousAddress"),
  previousCity: varchar("previousCity", { length: 100 }),
  previousState: varchar("previousState", { length: 50 }),
  previousZip: varchar("previousZip", { length: 20 }),
  
  // Status
  status: mysqlEnum("status", ["active", "archived", "paused"]).default("active").notNull(),
  
  // Stats
  totalLettersGenerated: int("totalLettersGenerated").default(0).notNull(),
  totalAccountsDisputed: int("totalAccountsDisputed").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
  
  // Notes
  internalNotes: text("internalNotes"), // Agency's private notes about this client
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgencyClient = typeof agencyClients.$inferSelect;
export type InsertAgencyClient = typeof agencyClients.$inferInsert;

/**
 * Agency Client Credit Reports - Credit reports uploaded for agency clients
 */
export const agencyClientReports = mysqlTable("agency_client_reports", {
  id: int("id").autoincrement().primaryKey(),
  agencyClientId: int("agencyClientId").notNull(),
  agencyUserId: int("agencyUserId").notNull(), // For quick filtering
  
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: text("fileName"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  parsedData: longtext("parsedData"),
  isParsed: boolean("isParsed").default(false).notNull(),
});

export type AgencyClientReport = typeof agencyClientReports.$inferSelect;
export type InsertAgencyClientReport = typeof agencyClientReports.$inferInsert;

/**
 * Agency Client Negative Accounts - Accounts extracted from client reports
 */
export const agencyClientAccounts = mysqlTable("agency_client_accounts", {
  id: int("id").autoincrement().primaryKey(),
  agencyClientId: int("agencyClientId").notNull(),
  agencyUserId: int("agencyUserId").notNull(),
  
  accountName: text("accountName").notNull(),
  accountNumber: varchar("accountNumber", { length: 255 }),
  accountType: varchar("accountType", { length: 100 }),
  balance: decimal("balance", { precision: 10, scale: 2 }),
  originalCreditor: text("originalCreditor"),
  dateOpened: varchar("dateOpened", { length: 50 }),
  lastActivity: varchar("lastActivity", { length: 50 }),
  status: text("status"),
  
  transunionData: text("transunionData"),
  equifaxData: text("equifaxData"),
  experianData: text("experianData"),
  
  hasConflicts: boolean("hasConflicts").default(false).notNull(),
  conflictDetails: text("conflictDetails"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgencyClientAccount = typeof agencyClientAccounts.$inferSelect;
export type InsertAgencyClientAccount = typeof agencyClientAccounts.$inferInsert;

/**
 * Agency Client Dispute Letters - Letters generated for agency clients
 */
export const agencyClientLetters = mysqlTable("agency_client_letters", {
  id: int("id").autoincrement().primaryKey(),
  agencyClientId: int("agencyClientId").notNull(),
  agencyUserId: int("agencyUserId").notNull(),
  
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian", "furnisher", "collector", "creditor", "legal"]).notNull(),
  recipientName: text("recipientName"),
  recipientAddress: text("recipientAddress"),
  
  letterContent: text("letterContent").notNull(),
  accountsDisputed: text("accountsDisputed").notNull(),
  
  round: int("round").default(1).notNull(),
  letterType: mysqlEnum("letterType", ["initial", "followup", "escalation", "cfpb", "cease_desist", "pay_for_delete", "intent_to_sue", "estoppel", "debt_validation"]).default("initial").notNull(),
  
  status: mysqlEnum("status", ["generated", "downloaded", "mailed", "response_received", "resolved"]).default("generated").notNull(),
  
  mailedAt: timestamp("mailedAt"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  responseDeadline: timestamp("responseDeadline"),
  responseReceivedAt: timestamp("responseReceivedAt"),
  responseDetails: text("responseDetails"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgencyClientLetter = typeof agencyClientLetters.$inferSelect;
export type InsertAgencyClientLetter = typeof agencyClientLetters.$inferInsert;


/**
 * In-app notifications for users
 */
export const userNotifications = mysqlTable("user_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Notification content
  type: mysqlEnum("type", [
    "deadline_reminder",
    "response_received",
    "letter_generated",
    "payment_confirmed",
    "account_deleted",
    "system_alert"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Related entity (optional)
  relatedEntityType: mysqlEnum("relatedEntityType", ["dispute_letter", "negative_account", "credit_report", "payment"]),
  relatedEntityId: int("relatedEntityId"),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  // Priority
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  
  // Expiration (optional)
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;
