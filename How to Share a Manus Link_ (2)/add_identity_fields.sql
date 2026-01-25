-- Add identity and address fields to users table for IdentityIQ integration
ALTER TABLE `users` 
ADD COLUMN `firstName` VARCHAR(255) AFTER `name`,
ADD COLUMN `middleInitial` VARCHAR(1) AFTER `firstName`,
ADD COLUMN `lastName` VARCHAR(255) AFTER `middleInitial`,
ADD COLUMN `address` VARCHAR(500) AFTER `lastName`,
ADD COLUMN `city` VARCHAR(255) AFTER `address`,
ADD COLUMN `state` VARCHAR(2) AFTER `city`,
ADD COLUMN `zipCode` VARCHAR(10) AFTER `state`,
ADD COLUMN `ssn` VARCHAR(255) AFTER `zipCode`, -- Encrypted
ADD COLUMN `dateOfBirth` DATE AFTER `ssn`,
ADD COLUMN `phoneNumber` VARCHAR(20) AFTER `dateOfBirth`,
ADD COLUMN `identityiqUserId` VARCHAR(255) AFTER `phoneNumber`,
ADD COLUMN `identityiqEnrollmentDate` TIMESTAMP AFTER `identityiqUserId`,
ADD COLUMN `identityiqStatus` ENUM('pending', 'active', 'cancelled', 'failed') DEFAULT 'pending' AFTER `identityiqEnrollmentDate`;

-- Add index for IdentityIQ user ID lookups
CREATE INDEX `idx_identityiq_user_id` ON `users` (`identityiqUserId`);
