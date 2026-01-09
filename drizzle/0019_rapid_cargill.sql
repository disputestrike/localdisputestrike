CREATE TABLE `user_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('government_id','drivers_license','passport','social_security_card','utility_bill','bank_statement','lease_agreement','mortgage_statement','pay_stub','tax_return','proof_of_address','dispute_letter','bureau_response','certified_mail_receipt','return_receipt','other') NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`description` text,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`isEncrypted` boolean DEFAULT false,
	`expiresAt` timestamp,
	`tags` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_documents_id` PRIMARY KEY(`id`)
);
