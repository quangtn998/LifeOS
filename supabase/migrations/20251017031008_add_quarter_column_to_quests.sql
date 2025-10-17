/*
  # Add quarter column to quests table

  1. Changes
    - Add `quarter` column to `quests` table with default value
    - The column will store quarter information like "Q1 2025", "Q4 2024", etc.
    - Set default to empty string to handle existing records
    - Add index for better query performance on quarter filtering
  
  2. Notes
    - Existing quests will have empty quarter field
    - New quests will be assigned current quarter automatically by the application
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quests' AND column_name = 'quarter'
  ) THEN
    ALTER TABLE quests ADD COLUMN quarter text DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quests_quarter ON quests(user_id, quarter);