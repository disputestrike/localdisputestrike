CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cfpb_complaints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian') NOT NULL,
	`complaintType` varchar(100) NOT NULL,
	`issueDescription` text NOT NULL,
	`desiredResolution` text,
	`complaintContent` text,
	`status` enum('draft','submitted','response_received','resolved') NOT NULL DEFAULT 'draft',
	`caseNumber` varchar(50),
	`submittedAt` timestamp,
	`responseReceivedAt` timestamp,
	`responseDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cfpb_complaints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dispute_outcomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`disputeLetterId` int NOT NULL,
	`accountId` int,
	`outcome` enum('deleted','verified','updated','no_response','pending') NOT NULL DEFAULT 'pending',
	`responseReceivedAt` timestamp,
	`responseFileUrl` text,
	`responseFileKey` text,
	`responseNotes` text,
	`updatedFields` text,
	`letterMailedAt` timestamp,
	`deadlineDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispute_outcomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hard_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creditReportId` int,
	`creditorName` varchar(255) NOT NULL,
	`inquiryDate` varchar(50),
	`bureau` enum('transunion','equifax','experian') NOT NULL,
	`inquiryType` enum('hard','soft') NOT NULL DEFAULT 'hard',
	`isAuthorized` boolean NOT NULL DEFAULT true,
	`disputeStatus` enum('none','disputed','removed','verified') NOT NULL DEFAULT 'none',
	`disputedAt` timestamp,
	`removedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hard_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`referralCode` varchar(20) NOT NULL,
	`status` enum('pending','signed_up','subscribed','paid_out') NOT NULL DEFAULT 'pending',
	`commissionAmount` decimal(10,2) DEFAULT '50.00',
	`paidOutAt` timestamp,
	`clickCount` int NOT NULL DEFAULT 0,
	`signedUpAt` timestamp,
	`subscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
