CREATE TABLE `agency_client_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agencyClientId` int NOT NULL,
	`agencyUserId` int NOT NULL,
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
	CONSTRAINT `agency_client_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agency_client_letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agencyClientId` int NOT NULL,
	`agencyUserId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian','furnisher','collector','creditor','legal') NOT NULL,
	`recipientName` text,
	`recipientAddress` text,
	`letterContent` text NOT NULL,
	`accountsDisputed` text NOT NULL,
	`round` int NOT NULL DEFAULT 1,
	`letterType` enum('initial','followup','escalation','cfpb','cease_desist','pay_for_delete','intent_to_sue','estoppel','debt_validation') NOT NULL DEFAULT 'initial',
	`status` enum('generated','downloaded','mailed','response_received','resolved') NOT NULL DEFAULT 'generated',
	`mailedAt` timestamp,
	`trackingNumber` varchar(100),
	`responseDeadline` timestamp,
	`responseReceivedAt` timestamp,
	`responseDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agency_client_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agency_client_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agencyClientId` int NOT NULL,
	`agencyUserId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`parsedData` longtext,
	`isParsed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `agency_client_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agency_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agencyUserId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`clientPhone` varchar(20),
	`dateOfBirth` varchar(20),
	`ssnLast4` varchar(4),
	`currentAddress` text,
	`currentCity` varchar(100),
	`currentState` varchar(50),
	`currentZip` varchar(20),
	`previousAddress` text,
	`previousCity` varchar(100),
	`previousState` varchar(50),
	`previousZip` varchar(20),
	`status` enum('active','archived','paused') NOT NULL DEFAULT 'active',
	`totalLettersGenerated` int NOT NULL DEFAULT 0,
	`totalAccountsDisputed` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp,
	`internalNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agency_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('individual','agency') DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `agencyName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `agencyPlanTier` enum('starter','professional','enterprise');--> statement-breakpoint
ALTER TABLE `users` ADD `clientSlotsIncluded` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `clientSlotsUsed` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `agencyMonthlyPrice` decimal(10,2);