/*
  # Create Ideal Week Table

  1. New Tables
    - `ideal_week`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `google_calendar_url` (text) - Google Calendar embed URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `ideal_week` table
    - Add policies for authenticated users to manage their own ideal week
*/

CREATE TABLE IF NOT EXISTS ideal_week (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  google_calendar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE ideal_week ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ideal week"
  ON ideal_week FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideal week"
  ON ideal_week FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideal week"
  ON ideal_week FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideal week"
  ON ideal_week FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
