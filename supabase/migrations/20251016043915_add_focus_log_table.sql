/*
  # Create Focus Log Table

  1. New Tables
    - `focus_log`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `data` (jsonb) - JSON object mapping dates (YYYY-MM-DD) to total minutes focused
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `focus_log` table
    - Add policies for authenticated users to manage their own focus log
  
  3. Notes
    - Uses JSONB for flexible date-to-minutes mapping
    - One row per user containing all their focus log data
    - Default empty object to avoid null issues
*/

CREATE TABLE IF NOT EXISTS focus_log (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE focus_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus log"
  ON focus_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus log"
  ON focus_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus log"
  ON focus_log FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus log"
  ON focus_log FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);