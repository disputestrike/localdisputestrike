CREATE TABLE `admin_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` enum('admin','super_admin','master_admin') NOT NULL DEFAULT 'admin',
	`status` enum('active','blocked','suspended') NOT NULL DEFAULT 'active',
	`lastLogin` timestamp,
	`loginAttempts` int DEFAULT 0,
	`lockedUntil` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_accounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `admin_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`targetType` varchar(50),
	`targetId` int,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `negative_accounts` ADD `creditReportId` int;--> statement-breakpoint
ALTER TABLE `negative_accounts` ADD `bureau` varchar(50);--> statement-breakpoint
ALTER TABLE `negative_accounts` ADD `rawData` text;--> statement-breakpoint
ALTER TABLE `negative_accounts` ADD `negativeReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationExpires` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpires` timestamp;