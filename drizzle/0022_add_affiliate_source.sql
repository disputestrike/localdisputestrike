ALTER TABLE `users`
ADD COLUMN `affiliateSource` enum('smartcredit','identityiq','direct_upload','none') NOT NULL DEFAULT 'direct_upload';
