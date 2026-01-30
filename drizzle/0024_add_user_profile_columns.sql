ALTER TABLE `user_profiles`
ADD COLUMN `firstName` varchar(100),
ADD COLUMN `middleInitial` varchar(1),
ADD COLUMN `lastName` varchar(100),
ADD COLUMN `ssnFull` varchar(255),
ADD COLUMN `signatureUrl` text,
ADD COLUMN `signatureCreatedAt` timestamp,
ADD COLUMN `addressVerified` boolean DEFAULT false,
ADD COLUMN `addressVerifiedAt` timestamp,
ADD COLUMN `lobAddressId` varchar(255),
ADD COLUMN `isComplete` boolean DEFAULT false,
ADD COLUMN `completedAt` timestamp;
