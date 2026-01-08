CREATE TABLE `course_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificateNumber` varchar(50) NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`totalTimeSpentSeconds` int NOT NULL DEFAULT 0,
	`averageQuizScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_certificates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `course_certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `course_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` varchar(100) NOT NULL,
	`moduleId` varchar(50) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`quizScore` int,
	`quizAttempts` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int NOT NULL DEFAULT 0,
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_progress_id` PRIMARY KEY(`id`)
);
