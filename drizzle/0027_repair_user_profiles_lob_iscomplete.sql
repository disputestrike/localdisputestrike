-- Repair: Drop malformed column "lobAddressId NisComplete" if it exists (missing comma in an earlier migration),
-- then ensure lobAddressId and isComplete exist as separate columns.
-- Run this if you see "Failed query" / "lobAddressId NisComplete" when completing onboarding.

DROP PROCEDURE IF EXISTS repair_user_profiles_columns;
DELIMITER ;;
CREATE PROCEDURE repair_user_profiles_columns()
BEGIN
  -- Drop the malformed column (name with space) if it exists
  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_profiles'
      AND COLUMN_NAME = 'lobAddressId NisComplete') > 0 THEN
    ALTER TABLE `user_profiles` DROP COLUMN `lobAddressId NisComplete`;
  END IF;

  -- Add lobAddressId if missing
  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_profiles'
      AND COLUMN_NAME = 'lobAddressId') = 0 THEN
    ALTER TABLE `user_profiles` ADD COLUMN `lobAddressId` varchar(255) AFTER `addressVerifiedAt`;
  END IF;

  -- Add isComplete if missing
  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_profiles'
      AND COLUMN_NAME = 'isComplete') = 0 THEN
    ALTER TABLE `user_profiles` ADD COLUMN `isComplete` boolean DEFAULT false AFTER `lobAddressId`;
  END IF;
END;;
DELIMITER ;
CALL repair_user_profiles_columns();
DROP PROCEDURE IF EXISTS repair_user_profiles_columns;
