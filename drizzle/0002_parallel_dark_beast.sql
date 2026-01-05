CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`zipCode` varchar(10) NOT NULL,
	`creditScoreRange` varchar(50),
	`negativeItemsCount` varchar(50),
	`bureaus` text,
	`source` varchar(100) NOT NULL DEFAULT 'quiz_funnel',
	`convertedToUser` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
