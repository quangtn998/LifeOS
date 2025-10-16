/*
  # Create Quests Table

  1. New Tables
    - `quests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text) - Quest title
      - `category` (text) - Quest category (professional, health, relationships, personal)
      - `completed` (boolean) - Whether the quest is completed
      - `completed_at` (timestamptz) - When the quest was completed
      - `quarter` (text) - Which quarter this quest is for (e.g., "Q1 2025")
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `quests` table
    - Add policies for authenticated users to manage their own quests
*/

CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  quarter text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
  ON quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests"
  ON quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
  ON quests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quests_user_completed ON quests(user_id, completed, created_at DESC);
