ALTER TABLE `parser_accuracy_metrics` MODIFY COLUMN `created_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `parser_comparisons` MODIFY COLUMN `custom_parser_accounts` longtext;--> statement-breakpoint
ALTER TABLE `parser_comparisons` MODIFY COLUMN `smartcredit_accounts` longtext;--> statement-breakpoint
ALTER TABLE `parser_comparisons` MODIFY COLUMN `differences` longtext;--> statement-breakpoint
ALTER TABLE `parser_comparisons` MODIFY COLUMN `created_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `smartcredit_tokens` MODIFY COLUMN `created_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `smartcredit_tokens` MODIFY COLUMN `updated_at` timestamp NOT NULL;