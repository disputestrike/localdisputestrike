CREATE TABLE `smartcredit_pulls` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` int NOT NULL,
  `pulled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` enum('smartcredit','annualcreditreport','direct_upload') NOT NULL DEFAULT 'smartcredit'
);
