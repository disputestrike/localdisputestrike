CREATE TABLE `user_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deadline_reminder','response_received','letter_generated','payment_confirmed','account_deleted','system_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` enum('dispute_letter','negative_account','credit_report','payment'),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_notifications_id` PRIMARY KEY(`id`)
);
