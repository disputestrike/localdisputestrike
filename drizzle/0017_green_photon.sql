CREATE TABLE `credit_score_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bureau` enum('transunion','equifax','experian') NOT NULL,
	`score` int NOT NULL,
	`scoreModel` varchar(50),
	`creditReportId` int,
	`event` varchar(255),
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_score_history_id` PRIMARY KEY(`id`)
);
