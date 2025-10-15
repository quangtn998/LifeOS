/*
  # Add History Tracking Fields

  1. Schema Updates
    - Add `completed_at` timestamp to `quests` table for tracking when quests were completed
    - Add fields to `focus_sessions` table to store session data:
      - `captured_thoughts` (text) - thoughts captured during focus session
      - `reflection` (text) - reflection notes after session
      - `disruptors` (jsonb) - JSON object tracking disruptor counts
      - `toolkit_usage` (jsonb) - JSON object tracking which tools were used
      - `duration_minutes` (integer) - total duration of the session
    
  2. Indexes
    - Add index on `quests.completed_at` for efficient history queries
    - Add index on `daily_plan.date` for efficient date-based queries
    - Add index on `weekly_review.week_start_date` for efficient week-based queries
    - Add index on `focus_sessions.date` for efficient date-based queries

  3. Notes
    - Uses `IF NOT EXISTS` and `DO $$ BEGIN ... END $$` blocks for safe migrations
    - All new columns have default values to avoid null issues
    - Existing data will not be affected
*/

-- Add completed_at to quests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quests' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE quests ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Add history tracking fields to focus_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'captured_thoughts'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN captured_thoughts text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'reflection'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN reflection text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'disruptors'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN disruptors jsonb DEFAULT '{"procrastination": 0, "distraction": 0, "burnout": 0, "perfectionism": 0}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'toolkit_usage'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN toolkit_usage jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN duration_minutes integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes for efficient history queries
CREATE INDEX IF NOT EXISTS idx_quests_completed_at ON quests(user_id, completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_plan_date ON daily_plan(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_review_date ON weekly_review(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_date ON focus_sessions(user_id, date DESC);