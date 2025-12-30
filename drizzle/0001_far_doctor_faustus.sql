CREATE TABLE `credit_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`parsedData` text,
	`isParsed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `credit_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dispute_letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian','furnisher') NOT NULL,
	`recipientName` text,
	`recipientAddress` text,
	`letterContent` text NOT NULL,
	`accountsDisputed` text NOT NULL,
	`round` int NOT NULL DEFAULT 1,
	`letterType` enum('initial','followup','escalation','cfpb') NOT NULL DEFAULT 'initial',
	`status` enum('generated','downloaded','mailed','response_received','resolved') NOT NULL DEFAULT 'generated',
	`mailedAt` timestamp,
	`trackingNumber` varchar(100),
	`responseDeadline` timestamp,
	`responseReceivedAt` timestamp,
	`responseDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispute_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mailing_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`disputeLetterId` int NOT NULL,
	`printedLetters` boolean NOT NULL DEFAULT false,
	`signedInBlueInk` boolean NOT NULL DEFAULT false,
	`handwroteEnvelope` boolean NOT NULL DEFAULT false,
	`includedId` boolean NOT NULL DEFAULT false,
	`includedUtilityBill` boolean NOT NULL DEFAULT false,
	`includedSupportingDocs` boolean NOT NULL DEFAULT false,
	`mailedFromLocalPostOffice` boolean NOT NULL DEFAULT false,
	`gotCertifiedReceipt` boolean NOT NULL DEFAULT false,
	`uploadedTrackingNumber` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mailing_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `negative_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountName` text NOT NULL,
	`accountNumber` varchar(255),
	`accountType` varchar(100),
	`balance` decimal(10,2),
	`originalCreditor` text,
	`dateOpened` varchar(50),
	`lastActivity` varchar(50),
	`status` text,
	`transunionData` text,
	`equifaxData` text,
	`experianData` text,
	`hasConflicts` boolean NOT NULL DEFAULT false,
	`conflictDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `negative_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentId` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`tier` enum('diy_quick','diy_complete','white_glove','subscription_monthly','subscription_annual') NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentId_unique` UNIQUE(`stripePaymentId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`tier` enum('monthly','annual') NOT NULL,
	`status` enum('active','canceled','past_due','expired') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
