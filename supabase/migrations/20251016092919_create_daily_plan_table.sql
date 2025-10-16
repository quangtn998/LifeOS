/*
  # Create Daily Plan Table

  1. New Tables
    - `daily_plan`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date) - The date of the daily plan
      - `manifesto` (jsonb) - Morning manifesto (feeling, gratitude, adventure)
      - `tasks` (jsonb) - Array of focus tasks for the day
      - `shutdown` (jsonb) - Evening shutdown (accomplished, learned, tomorrow)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `daily_plan` table
    - Add policies for authenticated users to manage their own daily plans
  
  3. Indexes
    - Add index on user_id and date for efficient queries
*/

CREATE TABLE IF NOT EXISTS daily_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  manifesto jsonb DEFAULT '{"feeling": "", "gratitude": "", "adventure": ""}'::jsonb,
  tasks jsonb DEFAULT '[]'::jsonb,
  shutdown jsonb DEFAULT '{"accomplished": "", "learned": "", "tomorrow": ""}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily plans"
  ON daily_plan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily plans"
  ON daily_plan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily plans"
  ON daily_plan FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily plans"
  ON daily_plan FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_plan_user_date ON daily_plan(user_id, date DESC);
