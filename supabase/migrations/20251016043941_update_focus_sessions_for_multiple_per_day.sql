/*
  # Update Focus Sessions for Multiple Sessions Per Day

  1. Schema Updates
    - Drop the unique constraint on (user_id, date) to allow multiple sessions per day
    - Add `session_number` column to track which session of the day this is
    - Add `start_time` column to track when the focus phase actually started
    - Add `end_time` column to track when the focus phase ended
    - Add `actual_duration_minutes` column to store real time spent (vs planned 50 minutes)
    - Add `total_pause_duration_seconds` column to track how long user paused
    - Add `completed` boolean to indicate if session was fully completed
    - Add new unique constraint on (user_id, date, session_number)
  
  2. Data Migration
    - Set session_number = 1 for all existing records
    - Set completed = true for records with reflection data
    - Preserve all existing data
  
  3. Notes
    - Uses IF NOT EXISTS for safe migrations
    - Backward compatible with existing data
    - Session numbers start at 1 for each day
*/

-- Drop old unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'focus_sessions_user_id_date_key'
  ) THEN
    ALTER TABLE focus_sessions DROP CONSTRAINT focus_sessions_user_id_date_key;
  END IF;
END $$;

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'session_number'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN session_number integer DEFAULT 1 NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN start_time timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN end_time timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'actual_duration_minutes'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN actual_duration_minutes integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'total_pause_duration_seconds'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN total_pause_duration_seconds integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'completed'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN completed boolean DEFAULT false;
  END IF;
END $$;

-- Migrate existing data: mark sessions with reflection as completed
UPDATE focus_sessions 
SET completed = true 
WHERE reflection IS NOT NULL AND reflection != '';

-- Add new unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'focus_sessions_user_id_date_session_number_key'
  ) THEN
    ALTER TABLE focus_sessions 
    ADD CONSTRAINT focus_sessions_user_id_date_session_number_key 
    UNIQUE (user_id, date, session_number);
  END IF;
END $$;