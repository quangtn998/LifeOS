/*
  # Add Recharge Menu Support

  1. Schema Updates
    - Add `recharge_usage` (jsonb) to `focus_sessions` table to track recharge activities used
  
  2. New Tables
    - `custom_recharge` table to store user's custom recharge activities
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `activities` (jsonb) - array of custom recharge activities
  
  3. Security
    - Enable RLS on `custom_recharge` table
    - Add policies for authenticated users to manage their own recharge menu
  
  4. Notes
    - Uses `IF NOT EXISTS` for safe migrations
    - Default empty objects/arrays to avoid null issues
*/

-- Add recharge_usage to focus_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'focus_sessions' AND column_name = 'recharge_usage'
  ) THEN
    ALTER TABLE focus_sessions ADD COLUMN recharge_usage jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create custom_recharge table
CREATE TABLE IF NOT EXISTS custom_recharge (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  activities jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE custom_recharge ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_recharge
CREATE POLICY "Users can view own recharge menu"
  ON custom_recharge FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recharge menu"
  ON custom_recharge FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recharge menu"
  ON custom_recharge FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recharge menu"
  ON custom_recharge FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);