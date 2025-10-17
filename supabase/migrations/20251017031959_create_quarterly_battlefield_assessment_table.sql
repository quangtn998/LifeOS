/*
  # Create Quarterly Battlefield Assessment Table

  1. New Tables
    - `quarterly_battlefield_assessment`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `quarter` (text) - Quarter identifier (e.g., "Q4 2025")
      
      Work Assessment Fields (3 Steps):
      - `work_step1_terrain_weather` (text) - Địa hình & Thời tiết / Market & Trends Analysis
      - `work_step1_mission_objectives` (text) - Mục tiêu Chiến dịch / Mission Objectives (OKRs)
      - `work_step1_strategic_plays` (text) - Kế hoạch Tấn công / Strategic Plays
      - `work_step2_frontline_review` (text) - Review Mặt trận / Frontline Check-in
      - `work_step2_sprint_goals` (text) - Mục tiêu Xung kích / Sprint Goals
      - `work_step2_action_plan` (text) - Lịch Tác chiến / Action Calendar
      - `work_step3_weekly_huddle` (text) - Giao ban Chỉ huy / Weekly Command Huddle
      - `work_step3_weekly_tasks` (text) - Nhiệm vụ Tuần / Weekly Mission Tasks
      - `work_step3_weekly_debrief` (text) - Tổng kết / Weekly Debrief
      
      Life Assessment Fields (3 Steps):
      - `life_step1_personal_swot` (text) - Địa hình Nội tại SWOT / Personal SWOT Analysis
      - `life_step1_quarterly_mission` (text) - Thành trì cần Chinh phục / Fortress to Conquer
      - `life_step1_habits_projects` (text) - Binh chủng / Habits & Projects
      - `life_step2_progress_review` (text) - Review Tiến độ / Progress Review
      - `life_step2_monthly_milestone` (text) - Cột mốc Tháng / Monthly Milestone
      - `life_step2_schedule` (text) - Lịch trình / Schedule
      - `life_step3_self_reflection` (text) - Giao ban với Chỉ huy / Self Reflection
      - `life_step3_big_three` (text) - 3 Nhiệm vụ Tối quan trọng / Big Three Tasks
      - `life_step3_prepare_success` (text) - Chuẩn bị Vũ khí / Prepare for Success
      
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `quarterly_battlefield_assessment` table
    - Add policies for authenticated users to manage their own quarterly assessments
    
  3. Important Notes
    - This table is independent from quests - one assessment per quarter per user
    - Unique constraint ensures each user has only one assessment per quarter
    - All text fields default to empty string for easy initialization
*/

CREATE TABLE IF NOT EXISTS quarterly_battlefield_assessment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quarter text NOT NULL,
  
  -- Work Assessment Fields
  work_step1_terrain_weather text DEFAULT '',
  work_step1_mission_objectives text DEFAULT '',
  work_step1_strategic_plays text DEFAULT '',
  work_step2_frontline_review text DEFAULT '',
  work_step2_sprint_goals text DEFAULT '',
  work_step2_action_plan text DEFAULT '',
  work_step3_weekly_huddle text DEFAULT '',
  work_step3_weekly_tasks text DEFAULT '',
  work_step3_weekly_debrief text DEFAULT '',
  
  -- Life Assessment Fields
  life_step1_personal_swot text DEFAULT '',
  life_step1_quarterly_mission text DEFAULT '',
  life_step1_habits_projects text DEFAULT '',
  life_step2_progress_review text DEFAULT '',
  life_step2_monthly_milestone text DEFAULT '',
  life_step2_schedule text DEFAULT '',
  life_step3_self_reflection text DEFAULT '',
  life_step3_big_three text DEFAULT '',
  life_step3_prepare_success text DEFAULT '',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quarterly_battlefield_assessment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quarterly battlefield assessments"
  ON quarterly_battlefield_assessment FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quarterly battlefield assessments"
  ON quarterly_battlefield_assessment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quarterly battlefield assessments"
  ON quarterly_battlefield_assessment FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quarterly battlefield assessments"
  ON quarterly_battlefield_assessment FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quarterly_battlefield_user ON quarterly_battlefield_assessment(user_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_battlefield_quarter ON quarterly_battlefield_assessment(user_id, quarter);

-- Ensure each user can only have one assessment per quarter
CREATE UNIQUE INDEX IF NOT EXISTS idx_quarterly_battlefield_unique ON quarterly_battlefield_assessment(user_id, quarter);