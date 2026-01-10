CREATE TABLE `method_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`methodNumber` int NOT NULL,
	`methodName` varchar(255) NOT NULL,
	`methodCategory` varchar(50) NOT NULL,
	`triggerCount` int NOT NULL DEFAULT 0,
	`deletionCount` int NOT NULL DEFAULT 0,
	`verifiedCount` int NOT NULL DEFAULT 0,
	`pendingCount` int NOT NULL DEFAULT 0,
	`successRate` decimal(5,2),
	`avgDeletionProbability` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `method_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `method_triggers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int,
	`letterId` int,
	`methodNumber` int NOT NULL,
	`methodName` varchar(255) NOT NULL,
	`methodCategory` enum('date_timeline','balance_payment','creditor_ownership','status_classification','account_identification','legal_procedural','statistical_pattern') NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`deletionProbability` int,
	`fcraViolation` varchar(100),
	`outcome` enum('pending','deleted','verified','updated','no_response') DEFAULT 'pending',
	`outcomeDate` timestamp,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `method_triggers_id` PRIMARY KEY(`id`)
);
