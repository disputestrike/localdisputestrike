ALTER TABLE `success_stories` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `success_stories` ADD `videoThumbnailUrl` text;--> statement-breakpoint
ALTER TABLE `success_stories` ADD `videoDuration` int;--> statement-breakpoint
ALTER TABLE `success_stories` ADD `hasVideo` boolean DEFAULT false NOT NULL;