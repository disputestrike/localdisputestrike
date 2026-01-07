CREATE TABLE `parser_accuracy_metrics` (
	`id` int NOT NULL,
	`date` text NOT NULL,
	`total_comparisons` int NOT NULL,
	`perfect_matches` int,
	`good_matches` int,
	`poor_matches` int,
	`average_accuracy` int,
	`custom_parser_used` int,
	`smartcredit_used` int,
	`hybrid_used` int,
	`smartcredit_api_calls` int,
	`estimated_cost` int,
	`custom_parser_rollout_percentage` int,
	`created_at` int NOT NULL,
	CONSTRAINT `parser_accuracy_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parser_comparisons` (
	`id` int NOT NULL,
	`user_id` int NOT NULL,
	`credit_report_id` int,
	`bureau` text NOT NULL,
	`custom_parser_accounts` text,
	`custom_parser_score` int,
	`custom_parser_confidence` int,
	`smartcredit_accounts` text,
	`smartcredit_score` int,
	`differences` text,
	`match_percentage` int,
	`major_discrepancies` int,
	`selected_source` text,
	`selection_reason` text,
	`created_at` int NOT NULL,
	CONSTRAINT `parser_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smartcredit_tokens` (
	`id` int NOT NULL,
	`user_id` int NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` int,
	`smartcredit_user_id` text,
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	CONSTRAINT `smartcredit_tokens_id` PRIMARY KEY(`id`)
);
