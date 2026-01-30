ALTER TABLE `credit_reports`
ADD COLUMN `creditScore` int,
ADD COLUMN `scoreModel` varchar(50),
ADD COLUMN `reportSource` enum('smartcredit','identityiq','annualcreditreport','direct_upload') DEFAULT 'direct_upload',
ADD COLUMN `aiTokensUsed` int,
ADD COLUMN `aiProcessingCost` decimal(10,4),
ADD COLUMN `aiModel` varchar(50),
ADD COLUMN `processingStatus` enum('pending','processing','completed','failed') DEFAULT 'pending',
ADD COLUMN `processingError` text;
