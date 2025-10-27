/*
  # Add is_early_exit field to focus_sessions table

  1. Schema Changes
    - Add `is_early_exit` boolean column to track sessions ended before 50 minutes
    - Default value is false
    - This helps distinguish between completed full sessions and early exits

  2. Notes
    - Safe migration using IF NOT EXISTS pattern
    - Backward compatible with existing data
    - All existing sessions default to is_early_exit = false
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'is_early_exit'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN is_early_exit boolean DEFAULT false NOT NULL;
  END IF;
END $$;
