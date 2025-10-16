/*
  # Add Important Things and Principles to Life Compass

  1. Schema Updates
    - Add `important_things` (jsonb) - Array of important reminders/things to remember
    - Add `principles` (jsonb) - Array of guiding principles
    
  2. Structure
    Each entry contains:
    - `id` (string) - Unique identifier
    - `title` (string) - Title/heading of the item
    - `details` (string) - Detailed description/content

  3. Notes
    - Uses `IF NOT EXISTS` for safe migrations
    - Default to empty arrays for new columns
    - Existing data will not be affected
*/

-- Add important_things column to life_compass table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'life_compass' AND column_name = 'important_things'
  ) THEN
    ALTER TABLE life_compass ADD COLUMN important_things jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add principles column to life_compass table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'life_compass' AND column_name = 'principles'
  ) THEN
    ALTER TABLE life_compass ADD COLUMN principles jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;