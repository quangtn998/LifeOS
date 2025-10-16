/*
  # Create Weekly Review Table

  1. New Tables
    - `weekly_review`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `week_start_date` (date) - The Monday of the week being reviewed
      - `wins` (text) - Wins and accomplishments
      - `challenges` (text) - Challenges and lessons learned
      - `nextWeekPriorities` (jsonb) - Array of priority tasks for next week
      - `quests_status` (text) - Status update on quarterly quests
      - `plan_adjustments` (text) - Adjustments to the plan
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `weekly_review` table
    - Add policies for authenticated users to manage their own weekly reviews
  
  3. Indexes
    - Add index on user_id and week_start_date for efficient queries
*/

CREATE TABLE IF NOT EXISTS weekly_review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  wins text DEFAULT '',
  challenges text DEFAULT '',
  "nextWeekPriorities" jsonb DEFAULT '[]'::jsonb,
  quests_status text DEFAULT '',
  plan_adjustments text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE weekly_review ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly reviews"
  ON weekly_review FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews"
  ON weekly_review FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
  ON weekly_review FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reviews"
  ON weekly_review FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_review_user_week ON weekly_review(user_id, week_start_date DESC);
