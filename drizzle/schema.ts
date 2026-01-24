import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, longtext, json } from "drizzle-orm/mysql-core";

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
  
  // Custom Auth Fields (for self-hosting without Manus OAuth)
  passwordHash: varchar("passwordHash", { length: 255 }), // bcrypt hash
  emailVerified: boolean("emailVerified").default(false),
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  emailVerificationExpires: timestamp("emailVerificationExpires"),
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  
  // Identity and Address Fields (for IdentityIQ integration)
  // firstName: varchar("firstName", { length: 255 }),
  // middleInitial: varchar("middleInitial", { length: 1 }),
  // lastName: varchar("lastName", { length: 255 }),
  // address: varchar("address", { length: 500 }),
  // city: varchar("city", { length: 255 }),
  // state: varchar("state", { length: 2 }),
  // zipCode: varchar("zipCode", { length: 10 }),
  // ssn: varchar("ssn", { length: 255 }), // Encrypted
  // dateOfBirth: varchar("dateOfBirth", { length: 10 }), // YYYY-MM-DD
  // phoneNumber: varchar("phoneNumber", { length: 20 }),
  // identityiqUserId: varchar("identityiqUserId", { length: 255 }),
  // identityiqEnrollmentDate: timestamp("identityiqEnrollmentDate"),
  
  // Address Verification (Lob)
  // addressVerified: boolean("addressVerified").default(false),
  // addressVerifiedAt: timestamp("addressVerifiedAt"),
  // lobAddressId: varchar("lobAddressId", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
  firstName: varchar("firstName", { length: 100 }),
  middleInitial: varchar("middleInitial", { length: 1 }),
  lastName: varchar("lastName", { length: 100 }),
  fullName: text("fullName"),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }), // Format: YYYY-MM-DD
  ssnLast4: varchar("ssnLast4", { length: 4 }), // Last 4 digits only
  ssnFull: varchar("ssnFull", { length: 255 }), // Encrypted full SSN for bureau verification
  
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
  
  // Digital Signature
  signatureUrl: text("signatureUrl"), // S3 URL to signature image
  signatureCreatedAt: timestamp("signatureCreatedAt"),
  
  // Address Verification (Lob)
  addressVerified: boolean("addressVerified").default(false),
  addressVerifiedAt: timestamp("addressVerifiedAt"),
  lobAddressId: varchar("lobAddressId", { length: 255 }),
  
  // Profile completion status
  isComplete: boolean("isComplete").default(false),
  completedAt: timestamp("completedAt"),
  
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
  
  // Report Source Tracking
  reportSource: mysqlEnum("reportSource", ["smartcredit", "identityiq", "annualcreditreport", "direct_upload"]).default("direct_upload"),
  
  // AI Processing Cost Tracking
  aiTokensUsed: int("aiTokensUsed"),
  aiProcessingCost: decimal("aiProcessingCost", { precision: 10, scale: 4 }), // Cost in dollars
  aiModel: varchar("aiModel", { length: 50 }), // gpt-4o, gpt-4o-mini, etc.
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending"),
  processingError: text("processingError"),
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
  creditReportId: int("creditReportId"), // Link to the credit report this account came from
  accountName: text("accountName").notNull(),
  accountNumber: varchar("accountNumber", { length: 255 }),
  accountType: varchar("accountType", { length: 100 }), // Collection, Charge-off, Late Payment, etc.
  balance: decimal("balance", { precision: 10, scale: 2 }),
  originalCreditor: text("originalCreditor"),
  dateOpened: varchar("dateOpened", { length: 50 }),
  lastActivity: varchar("lastActivity", { length: 50 }),
  status: text("status"),
  bureau: varchar("bureau", { length: 50 }), // transunion, equifax, experian
  rawData: text("rawData"), // JSON - raw extracted data from AI
  negativeReason: text("negativeReason"), // Why this account is negative
  
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
  
  // Lob Mailing Integration
  lobLetterId: varchar("lobLetterId", { length: 255 }),
  lobMailingStatus: mysqlEnum("lobMailingStatus", ["pending", "processing", "printed", "mailed", "in_transit", "delivered", "returned", "failed"]),
  lobTrackingEvents: text("lobTrackingEvents"), // JSON array of tracking events
  lobCost: decimal("lobCost", { precision: 10, scale: 2 }),
  userAuthorizedAt: timestamp("userAuthorizedAt"), // When user clicked "Authorize & Send"
  userAuthorizationIp: varchar("userAuthorizationIp", { length: 45 }), // IP address for audit
  
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


/**
 * Document vault for storing user documents (ID, proof of address, etc.)
 */
export const userDocuments = mysqlTable("user_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Document info
  documentType: mysqlEnum("documentType", [
    "government_id",
    "drivers_license", 
    "passport",
    "social_security_card",
    "utility_bill",
    "bank_statement",
    "lease_agreement",
    "mortgage_statement",
    "pay_stub",
    "tax_return",
    "proof_of_address",
    "dispute_letter",
    "bureau_response",
    "certified_mail_receipt",
    "return_receipt",
    "other"
  ]).notNull(),
  
  documentName: varchar("documentName", { length: 255 }).notNull(),
  description: text("description"),
  
  // File storage
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 key
  fileUrl: text("fileUrl"), // Presigned URL (temporary)
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"), // Size in bytes
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Security
  isEncrypted: boolean("isEncrypted").default(false),
  expiresAt: timestamp("expiresAt"), // For documents with expiration dates
  
  // Metadata
  tags: json("tags").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserDocument = typeof userDocuments.$inferSelect;
export type InsertUserDocument = typeof userDocuments.$inferInsert;


/**
 * Method triggers - tracks which of the 43 dispute detection methods are triggered
 * Used for analytics dashboard to show most effective methods
 */
export const methodTriggers = mysqlTable("method_triggers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId"), // Reference to negative account
  letterId: int("letterId"), // Reference to dispute letter
  
  // Method identification
  methodNumber: int("methodNumber").notNull(), // 1-43
  methodName: varchar("methodName", { length: 255 }).notNull(),
  methodCategory: mysqlEnum("methodCategory", [
    "date_timeline",
    "balance_payment", 
    "creditor_ownership",
    "status_classification",
    "account_identification",
    "legal_procedural",
    "statistical_pattern"
  ]).notNull(),
  
  // Detection details
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  deletionProbability: int("deletionProbability"), // 0-100 percentage
  fcraViolation: varchar("fcraViolation", { length: 100 }), // e.g., "§ 1681e(b)"
  
  // Outcome tracking (updated after dispute resolution)
  outcome: mysqlEnum("outcome", ["pending", "deleted", "verified", "updated", "no_response"]).default("pending"),
  outcomeDate: timestamp("outcomeDate"),
  
  // Timestamps
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
});

export type MethodTrigger = typeof methodTriggers.$inferSelect;
export type InsertMethodTrigger = typeof methodTriggers.$inferInsert;

/**
 * Method analytics - daily aggregated stats for the 43 methods
 */
export const methodAnalytics = mysqlTable("method_analytics", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  
  // Method identification
  methodNumber: int("methodNumber").notNull(), // 1-43
  methodName: varchar("methodName", { length: 255 }).notNull(),
  methodCategory: varchar("methodCategory", { length: 50 }).notNull(),
  
  // Daily stats
  triggerCount: int("triggerCount").default(0).notNull(),
  deletionCount: int("deletionCount").default(0).notNull(),
  verifiedCount: int("verifiedCount").default(0).notNull(),
  pendingCount: int("pendingCount").default(0).notNull(),
  
  // Success metrics
  successRate: decimal("successRate", { precision: 5, scale: 2 }), // Percentage
  avgDeletionProbability: decimal("avgDeletionProbability", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MethodAnalytic = typeof methodAnalytics.$inferSelect;
export type InsertMethodAnalytic = typeof methodAnalytics.$inferInsert;


/**
 * Admin accounts - separate from regular users
 * Admins login with email/password, not OAuth
 */
export const adminAccounts = mysqlTable("admin_accounts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "super_admin", "master_admin"]).default("admin").notNull(),
  status: mysqlEnum("status", ["active", "blocked", "suspended"]).default("active").notNull(),
  
  // Security
  lastLogin: timestamp("lastLogin"),
  loginAttempts: int("loginAttempts").default(0),
  lockedUntil: timestamp("lockedUntil"),
  
  // Audit
  createdBy: int("createdBy"), // ID of admin who created this account
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminAccount = typeof adminAccounts.$inferSelect;
export type InsertAdminAccount = typeof adminAccounts.$inferInsert;

/**
 * Admin activity log for audit trail
 */
export const adminActivityLog = mysqlTable("admin_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 50 }), // 'user', 'admin', 'letter', etc.
  targetId: int("targetId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminActivityLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLog.$inferInsert;


/**
 * User audit logs for SOC 2 compliance
 * Tracks all user actions for security and compliance
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'logout', 'export_data', 'delete_account', 'upload_report', etc.
  category: varchar("category", { length: 50 }).notNull(), // 'auth', 'data', 'dispute', 'settings'
  details: text("details"), // JSON string with additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  status: mysqlEnum("status", ["success", "failure", "pending"]).default("success").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================
// DISPUTESTRIKE V2 - NEW TABLES
// ============================================

/**
 * V2 Subscriptions with trial support
 * Tiers: trial, starter ($49/mo), professional ($69.95/mo), complete ($99.95/mo)
 */
export const subscriptionsV2 = mysqlTable("subscriptions_v2", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  // Subscription tier
  tier: mysqlEnum("tier", ["trial", "starter", "professional", "complete"]).notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "trial",
    "trial_expired",
    "active",
    "past_due",
    "canceled",
    "paused"
  ]).default("trial").notNull(),
  
  // Trial tracking
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  trialConvertedAt: timestamp("trialConvertedAt"),
  
  // Billing cycle
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  
  // Cancellation
  canceledAt: timestamp("canceledAt"),
  cancelReason: text("cancelReason"),
  
  // Monitoring partner
  monitoringPartnerId: varchar("monitoringPartnerId", { length: 255 }),
  monitoringStatus: mysqlEnum("monitoringStatus", ["pending", "active", "suspended", "canceled"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SubscriptionV2 = typeof subscriptionsV2.$inferSelect;
export type InsertSubscriptionV2 = typeof subscriptionsV2.$inferInsert;

/**
 * Dispute rounds tracking with locking
 */
export const disputeRounds = mysqlTable("dispute_rounds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  roundNumber: int("roundNumber").notNull(),
  
  status: mysqlEnum("status", [
    "pending",
    "active",
    "letters_generated",
    "mailed",
    "awaiting_response",
    "responses_uploaded",
    "complete"
  ]).default("pending").notNull(),
  
  // Timing
  startedAt: timestamp("startedAt"),
  lettersGeneratedAt: timestamp("lettersGeneratedAt"),
  mailedAt: timestamp("mailedAt"),
  
  // Round locking
  lockedUntil: timestamp("lockedUntil"),
  unlockedEarly: boolean("unlockedEarly").default(false),
  
  // Items
  itemsDisputed: int("itemsDisputed").default(0),
  disputedItemIds: text("disputedItemIds"), // JSON array
  
  // Results
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

/**
 * AI recommendations for dispute items
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  negativeAccountId: int("negativeAccountId").notNull(),
  roundId: int("roundId"),
  
  isRecommended: boolean("isRecommended").default(false).notNull(),
  priority: int("priority"),
  winProbability: int("winProbability"),
  recommendationReason: text("recommendationReason"),
  factors: text("factors"), // JSON array
  methodsTriggered: text("methodsTriggered"), // JSON array
  
  wasDisputed: boolean("wasDisputed").default(false),
  outcome: mysqlEnum("outcome", ["pending", "deleted", "verified", "updated", "no_response"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

/**
 * Bureau response uploads
 */
export const bureauResponses = mysqlTable("bureau_responses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  roundId: int("roundId").notNull(),
  
  bureau: mysqlEnum("bureau", ["transunion", "equifax", "experian"]).notNull(),
  
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: text("fileName"),
  
  responseDate: timestamp("responseDate"),
  receivedDate: timestamp("receivedDate"),
  
  isParsed: boolean("isParsed").default(false),
  parsedData: text("parsedData"), // JSON
  
  itemsDeleted: int("itemsDeleted").default(0),
  itemsVerified: int("itemsVerified").default(0),
  itemsUpdated: int("itemsUpdated").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BureauResponse = typeof bureauResponses.$inferSelect;
export type InsertBureauResponse = typeof bureauResponses.$inferInsert;

/**
 * Onboarding wizard progress
 */
export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  step1_personalInfo: boolean("step1_personalInfo").default(false),
  step2_address: boolean("step2_address").default(false),
  step3_identityDocs: boolean("step3_identityDocs").default(false),
  step4_creditReports: boolean("step4_creditReports").default(false),
  step5_planSelection: boolean("step5_planSelection").default(false),
  
  currentStep: int("currentStep").default(1),
  isComplete: boolean("isComplete").default(false),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

/**
 * Identity documents for verification
 */
export const identityDocuments = mysqlTable("identity_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  documentType: mysqlEnum("documentType", [
    "drivers_license",
    "passport",
    "state_id",
    "utility_bill",
    "bank_statement",
    "ssn_card"
  ]).notNull(),
  
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: text("fileName"),
  
  isVerified: boolean("isVerified").default(false),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),
  
  expirationDate: varchar("expirationDate", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type IdentityDocument = typeof identityDocuments.$inferSelect;
export type InsertIdentityDocument = typeof identityDocuments.$inferInsert;

/**
 * Trial conversion tracking
 */
export const trialConversions = mysqlTable("trial_conversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  trialStartedAt: timestamp("trialStartedAt").notNull(),
  trialEndsAt: timestamp("trialEndsAt").notNull(),
  
  converted: boolean("converted").default(false),
  convertedAt: timestamp("convertedAt"),
  convertedToTier: mysqlEnum("convertedToTier", ["starter", "professional", "complete"]),
  
  expiredAt: timestamp("expiredAt"),
  
  // Email tracking
  day1EmailSent: boolean("day1EmailSent").default(false),
  day3EmailSent: boolean("day3EmailSent").default(false),
  day5EmailSent: boolean("day5EmailSent").default(false),
  day6EmailSent: boolean("day6EmailSent").default(false),
  day7EmailSent: boolean("day7EmailSent").default(false),
  
  // Engagement
  creditReportsPulled: boolean("creditReportsPulled").default(false),
  negativeItemsViewed: boolean("negativeItemsViewed").default(false),
  aiRecommendationsViewed: boolean("aiRecommendationsViewed").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrialConversion = typeof trialConversions.$inferSelect;
export type InsertTrialConversion = typeof trialConversions.$inferInsert;

/**
 * Monitoring accounts (IdentityIQ integration)
 */
export const monitoringAccounts = mysqlTable("monitoring_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  partner: mysqlEnum("partner", ["identityiq", "smartcredit", "myscoreiq"]).default("identityiq"),
  partnerUserId: varchar("partnerUserId", { length: 255 }),
  
  status: mysqlEnum("status", ["pending", "active", "suspended", "canceled"]).default("pending"),
  
  lastCreditPullAt: timestamp("lastCreditPullAt"),
  nextScheduledPull: timestamp("nextScheduledPull"),
  
  transunionScore: int("transunionScore"),
  equifaxScore: int("equifaxScore"),
  experianScore: int("experianScore"),
  scoresUpdatedAt: timestamp("scoresUpdatedAt"),
  
  alertsEnabled: boolean("alertsEnabled").default(true),
  lastAlertAt: timestamp("lastAlertAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MonitoringAccount = typeof monitoringAccounts.$inferSelect;
export type InsertMonitoringAccount = typeof monitoringAccounts.$inferInsert;
