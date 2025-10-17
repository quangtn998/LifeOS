/*
  # Create Quest Assessments Table

  1. New Tables
    - `quest_assessments`
      - `id` (uuid, primary key)
      - `quest_id` (uuid, foreign key to quests)
      - `user_id` (uuid, foreign key to auth.users)
      - `quarter` (text) - Quarter identifier (e.g., "Q1 2025")
      
      Work Assessment Fields:
      - `work_step1_terrain_weather` (text) - Địa hình & Thời tiết / Market & Trends Analysis
      - `work_step1_mission_objectives` (text) - Mục tiêu Chiến dịch / Mission Objectives (OKRs)
      - `work_step1_strategic_plays` (text) - Kế hoạch Tấn công / Strategic Plays
      - `work_step2_frontline_review` (text) - Review Mặt trận / Frontline Check
      - `work_step2_sprint_goals` (text) - Mục tiêu Xung kích / Sprint Goals
      - `work_step2_action_plan` (text) - Lịch Tác chiến / Action Plan
      - `work_step3_weekly_huddle` (text) - Giao ban Chỉ huy / Weekly Huddle
      - `work_step3_weekly_tasks` (text) - Nhiệm vụ Tuần / Weekly Tasks
      - `work_step3_weekly_debrief` (text) - Tổng kết / Weekly Debrief
      
      Life Assessment Fields:
      - `life_step1_personal_swot` (text) - Địa hình Nội tại SWOT / Personal SWOT
      - `life_step1_quarterly_mission` (text) - Thành trì cần chinh phục / Quarterly Mission
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
    - Enable RLS on `quest_assessments` table
    - Add policies for authenticated users to manage their own assessments
*/

CREATE TABLE IF NOT EXISTS quest_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quarter text DEFAULT '',
  
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

ALTER TABLE quest_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quest assessments"
  ON quest_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest assessments"
  ON quest_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest assessments"
  ON quest_assessments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quest assessments"
  ON quest_assessments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quest_assessments_user_quest ON quest_assessments(user_id, quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_assessments_quarter ON quest_assessments(user_id, quarter);

-- Ensure each quest can only have one assessment
CREATE UNIQUE INDEX IF NOT EXISTS idx_quest_assessments_unique_quest ON quest_assessments(quest_id);