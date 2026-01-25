CREATE TABLE `ai_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`negativeAccountId` int NOT NULL,
	`roundId` int,
	`isRecommended` boolean NOT NULL DEFAULT false,
	`priority` int,
	`winProbability` int,
	`recommendationReason` text,
	`factors` text,
	`methodsTriggered` text,
	`wasDisputed` boolean DEFAULT false,
	`outcome` enum('pending','deleted','verified','updated','no_response'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`status` enum('success','failure','pending') NOT NULL DEFAULT 'success',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bureau_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roundId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` text,
	`responseDate` timestamp,
	`receivedDate` timestamp,
	`isParsed` boolean DEFAULT false,
	`parsedData` text,
	`itemsDeleted` int DEFAULT 0,
	`itemsVerified` int DEFAULT 0,
	`itemsUpdated` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bureau_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dispute_rounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roundNumber` int NOT NULL,
	`status` enum('pending','active','letters_generated','mailed','awaiting_response','responses_uploaded','complete') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`lettersGeneratedAt` timestamp,
	`mailedAt` timestamp,
	`lockedUntil` timestamp,
	`unlockedEarly` boolean DEFAULT false,
	`itemsDisputed` int DEFAULT 0,
	`disputedItemIds` text,
	`itemsDeleted` int DEFAULT 0,
	`itemsVerified` int DEFAULT 0,
	`itemsUpdated` int DEFAULT 0,
	`itemsNoResponse` int DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispute_rounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identity_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('drivers_license','passport','state_id','utility_bill','bank_statement','ssn_card') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` text,
	`isVerified` boolean DEFAULT false,
	`verifiedAt` timestamp,
	`verifiedBy` int,
	`expirationDate` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `identity_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`partner` enum('identityiq','smartcredit','myscoreiq') DEFAULT 'identityiq',
	`partnerUserId` varchar(255),
	`status` enum('pending','active','suspended','canceled') DEFAULT 'pending',
	`lastCreditPullAt` timestamp,
	`nextScheduledPull` timestamp,
	`transunionScore` int,
	`equifaxScore` int,
	`experianScore` int,
	`scoresUpdatedAt` timestamp,
	`alertsEnabled` boolean DEFAULT true,
	`lastAlertAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `monitoring_accounts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`step1_personalInfo` boolean DEFAULT false,
	`step2_address` boolean DEFAULT false,
	`step3_identityDocs` boolean DEFAULT false,
	`step4_creditReports` boolean DEFAULT false,
	`step5_planSelection` boolean DEFAULT false,
	`currentStep` int DEFAULT 1,
	`isComplete` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboarding_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions_v2` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`tier` enum('trial','starter','professional','complete') NOT NULL,
	`status` enum('trial','trial_expired','active','past_due','canceled','paused') NOT NULL DEFAULT 'trial',
	`trialStartedAt` timestamp,
	`trialEndsAt` timestamp,
	`trialConvertedAt` timestamp,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`cancelReason` text,
	`monitoringPartnerId` varchar(255),
	`monitoringStatus` enum('pending','active','suspended','canceled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_v2_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_v2_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `trial_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trialStartedAt` timestamp NOT NULL,
	`trialEndsAt` timestamp NOT NULL,
	`converted` boolean DEFAULT false,
	`convertedAt` timestamp,
	`convertedToTier` enum('starter','professional','complete'),
	`expiredAt` timestamp,
	`day1EmailSent` boolean DEFAULT false,
	`day3EmailSent` boolean DEFAULT false,
	`day5EmailSent` boolean DEFAULT false,
	`day6EmailSent` boolean DEFAULT false,
	`day7EmailSent` boolean DEFAULT false,
	`creditReportsPulled` boolean DEFAULT false,
	`negativeItemsViewed` boolean DEFAULT false,
	`aiRecommendationsViewed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trial_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credit_reports` ADD `reportSource` enum('smartcredit','identityiq','annualcreditreport','direct_upload') DEFAULT 'direct_upload';--> statement-breakpoint
ALTER TABLE `credit_reports` ADD `aiTokensUsed` int;--> statement-breakpoint
ALTER TABLE `credit_reports` ADD `aiProcessingCost` decimal(10,4);--> statement-breakpoint
ALTER TABLE `credit_reports` ADD `aiModel` varchar(50);--> statement-breakpoint
ALTER TABLE `credit_reports` ADD `processingStatus` enum('pending','processing','completed','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `credit_reports` ADD `processingError` text;--> statement-breakpoint
ALTER TABLE `dispute_letters` ADD `lobLetterId` varchar(255);--> statement-breakpoint
ALTER TABLE `dispute_letters` ADD `lobMailingStatus` enum('pending','processing','printed','mailed','in_transit','delivered','returned','failed');--> statement-breakpoint
ALTER TABLE `dispute_letters` ADD `lobTrackingEvents` text;--> statement-breakpoint
ALTER TABLE `dispute_letters` ADD `lobCost` decimal(10,2);--> statement-breakpoint
ALTER TABLE `dispute_letters` ADD `userAuthorizedAt` timestamp;--> statement-breakpoint
ALTER TABLE `dispute_letters` ADD `userAuthorizationIp` varchar(45);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `firstName` varchar(100);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `middleInitial` varchar(1);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `lastName` varchar(100);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `ssnFull` varchar(255);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `signatureUrl` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `signatureCreatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `addressVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `addressVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `lobAddressId` varchar(255);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `isComplete` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `completedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `middleInitial` varchar(1);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `zipCode` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `ssn` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `identityiqUserId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `identityiqEnrollmentDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `identityiqStatus` enum('pending','active','cancelled','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `creditConcern` enum('collections','late_payments','charge_offs','inaccuracies','all_of_above','not_sure');--> statement-breakpoint
ALTER TABLE `users` ADD `creditGoal` enum('600_650','650_700','700_plus','clean_reports');--> statement-breakpoint
ALTER TABLE `users` ADD `signatureUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `signatureCreatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `affiliateSource` enum('smartcredit','identityiq','direct_upload','none') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `users` ADD `affiliateClickedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `processingFeePaid` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `processingFeeAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `users` ADD `processingFeePaidAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `addressVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `addressVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `lobAddressId` varchar(255);