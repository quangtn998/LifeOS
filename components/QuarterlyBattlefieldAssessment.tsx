import React, { useState } from 'react';
import { QuarterlyBattlefieldAssessment as AssessmentType } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from './icons/Icons';

interface QuarterlyBattlefieldAssessmentProps {
  assessment: AssessmentType | null;
  onAssessmentChange: (field: keyof AssessmentType, value: string) => void;
}

const QuarterlyBattlefieldAssessment: React.FC<QuarterlyBattlefieldAssessmentProps> = ({
  assessment,
  onAssessmentChange,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [activeCategory, setActiveCategory] = useState<'work' | 'life'>('work');

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-400">
          Battlefield Assessment / Đánh giá Chiến trường
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory('work')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'work'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Work
          </button>
          <button
            onClick={() => setActiveCategory('life')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'life'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Life
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {activeCategory === 'work' ? (
          <>
            <AssessmentStep
              stepNumber={1}
              title="Bước 1: Đánh giá Chiến trường Quý / Quarter Assessment"
              subtitle="Thực hiện 1 lần vào tuần cuối của quý trước"
              isExpanded={expandedStep === 1}
              onToggle={() => toggleStep(1)}
            >
              <WorkStep1Fields assessment={assessment} onChange={onAssessmentChange} />
            </AssessmentStep>

            <AssessmentStep
              stepNumber={2}
              title="Bước 2: Triển khai Kế hoạch Tháng / Monthly Plan"
              subtitle="Thực hiện vào ngày đầu tiên của tháng"
              isExpanded={expandedStep === 2}
              onToggle={() => toggleStep(2)}
            >
              <WorkStep2Fields assessment={assessment} onChange={onAssessmentChange} />
            </AssessmentStep>

            <AssessmentStep
              stepNumber={3}
              title="Bước 3: Tác chiến Hàng tuần / Weekly Execution"
              subtitle="Thực hiện vào sáng thứ Hai hàng tuần"
              isExpanded={expandedStep === 3}
              onToggle={() => toggleStep(3)}
            >
              <WorkStep3Fields assessment={assessment} onChange={onAssessmentChange} />
            </AssessmentStep>
          </>
        ) : (
          <>
            <AssessmentStep
              stepNumber={1}
              title="Bước 1: Đánh giá Nội tại Quý / Quarter Self Assessment"
              subtitle="Thực hiện 1 lần vào cuối mỗi quý"
              isExpanded={expandedStep === 1}
              onToggle={() => toggleStep(1)}
            >
              <LifeStep1Fields assessment={assessment} onChange={onAssessmentChange} />
            </AssessmentStep>

            <AssessmentStep
              stepNumber={2}
              title="Bước 2: Kế hoạch Tháng / Monthly Plan"
              subtitle="Thực hiện vào Chủ nhật cuối tháng"
              isExpanded={expandedStep === 2}
              onToggle={() => toggleStep(2)}
            >
              <LifeStep2Fields assessment={assessment} onChange={onAssessmentChange} />
            </AssessmentStep>

            <AssessmentStep
              stepNumber={3}
              title="Bước 3: Hành động Hàng tuần / Weekly Action"
              subtitle="Thực hiện vào tối Chủ nhật hàng tuần"
              isExpanded={expandedStep === 3}
              onToggle={() => toggleStep(3)}
            >
              <LifeStep3Fields assessment={assessment} onChange={onAssessmentChange} />
            </AssessmentStep>
          </>
        )}
      </div>
    </div>
  );
};

interface AssessmentStepProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AssessmentStep: React.FC<AssessmentStepProps> = ({
  title,
  subtitle,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border border-gray-700 rounded-md bg-gray-800/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/30 transition-colors rounded-md"
      >
        <div className="flex-1">
          <span className="text-sm font-medium text-white block">{title}</span>
          {subtitle && (
            <span className="text-xs text-gray-400 mt-1 block italic">{subtitle}</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

interface FieldProps {
  assessment: AssessmentType | null;
  onChange: (field: keyof AssessmentType, value: string) => void;
}

const WorkStep1Fields: React.FC<FieldProps> = ({ assessment, onChange }) => {
  return (
    <>
      <AssessmentField
        label="1.1. Xác định Địa hình & Thời tiết / Market & Trends Analysis"
        helper="Địa hình (Thị trường): Khách hàng đang ở đâu? Kênh nào hiệu quả nhất? | Địa thế: Cao điểm (điểm mạnh) và đầm lầy (điểm yếu) của team? | Thời tiết: Có cơn bão hay luồng gió thuận nào? | Đối thủ: Quân địch đang tập kết ở đâu?"
        placeholder="Phân tích thị trường, xu hướng, cơ hội và thách thức trong quý này..."
        value={assessment?.work_step1_terrain_weather || ''}
        onChange={(val) => onChange('work_step1_terrain_weather', val)}
      />
      <AssessmentField
        label="1.2. Xác định Mục tiêu Chiến dịch / Define Mission Objectives (OKRs)"
        helper="Objective: Chọn MỘT mục tiêu quan trọng nhất cho quý này | Key Results: Những cứ điểm nào cần phá hủy để đạt mục tiêu?"
        placeholder="Mục tiêu cụ thể và kết quả then chốt cần đạt được trong quý..."
        value={assessment?.work_step1_mission_objectives || ''}
        onChange={(val) => onChange('work_step1_mission_objectives', val)}
      />
      <AssessmentField
        label="1.3. Vạch định Kế hoạch Tấn công / Formulate Strategic Plays"
        helper="Mũi giáp công: Sẽ mở những mặt trận nào? | Phân bổ Binh lực: Ai chỉ huy? Cần bao nhiêu ngân sách và công cụ?"
        placeholder="Chiến lược và kế hoạch hành động để đạt được mục tiêu..."
        value={assessment?.work_step1_strategic_plays || ''}
        onChange={(val) => onChange('work_step1_strategic_plays', val)}
      />
    </>
  );
};

const WorkStep2Fields: React.FC<FieldProps> = ({ assessment, onChange }) => {
  return (
    <>
      <AssessmentField
        label="2.1. Review Mặt trận / Frontline Check-in"
        helper="So với kế hoạch Quý, đang thắng hay thua? Mặt trận nào tiến triển tốt? Nào bị đình trệ? Có thông tin tình báo mới?"
        placeholder="Đánh giá tình hình hiện tại, những gì đã làm được và chưa làm được..."
        value={assessment?.work_step2_frontline_review || ''}
        onChange={(val) => onChange('work_step2_frontline_review', val)}
      />
      <AssessmentField
        label="2.2. Mục tiêu Xung kích / Sprint Goals"
        helper="Dựa trên kế hoạch Quý, mục tiêu ưu tiên số 1 của tháng này là gì?"
        placeholder="Mục tiêu cụ thể cần đạt trong tháng này..."
        value={assessment?.work_step2_sprint_goals || ''}
        onChange={(val) => onChange('work_step2_sprint_goals', val)}
      />
      <AssessmentField
        label="2.3. Lịch Tác chiến / Action Calendar"
        helper="Chia nhỏ mục tiêu tháng thành các trận đánh theo tuần. Ai chịu trách nhiệm cho trận đánh nào?"
        placeholder="Lịch trình và kế hoạch hành động chi tiết cho tháng..."
        value={assessment?.work_step2_action_plan || ''}
        onChange={(val) => onChange('work_step2_action_plan', val)}
      />
    </>
  );
};

const WorkStep3Fields: React.FC<FieldProps> = ({ assessment, onChange }) => {
  return (
    <>
      <AssessmentField
        label="3.1. Giao ban Chỉ huy / Weekly Command Huddle"
        helper="Tuần trước mỗi người đã hoàn thành nhiệm vụ gì? Gặp khó khăn, thiệt hại gì? Có trận hỏa hoạn nào cần dập tắt ngay?"
        placeholder="Điểm lại tình hình tuần trước, điều chỉnh kế hoạch nếu cần..."
        value={assessment?.work_step3_weekly_huddle || ''}
        onChange={(val) => onChange('work_step3_weekly_huddle', val)}
      />
      <AssessmentField
        label="3.2. Nhiệm vụ Tuần / Weekly Mission Tasks"
        helper="Mỗi cá nhân xác định 3 nhiệm vụ quan trọng nhất trong tuần này. Cần ai hỗ trợ gì? Có rào cản nào?"
        placeholder="Danh sách nhiệm vụ cụ thể cần hoàn thành trong tuần..."
        value={assessment?.work_step3_weekly_tasks || ''}
        onChange={(val) => onChange('work_step3_weekly_tasks', val)}
      />
      <AssessmentField
        label="3.3. Tổng kết / Weekly Debrief"
        helper="(Thực hiện vào chiều thứ Sáu) Tuần này thắng ở đâu, thua ở đâu? Bài học kinh nghiệm là gì?"
        placeholder="Rút kinh nghiệm từ tuần vừa qua, chuẩn bị cho tuần tiếp theo..."
        value={assessment?.work_step3_weekly_debrief || ''}
        onChange={(val) => onChange('work_step3_weekly_debrief', val)}
      />
    </>
  );
};

const LifeStep1Fields: React.FC<FieldProps> = ({ assessment, onChange }) => {
  return (
    <>
      <AssessmentField
        label="1.1. Địa hình Nội tại (SWOT) / Personal SWOT Analysis"
        helper="Strengths: Kỹ năng tốt nhất? Thói quen nào giúp bạn tiến bộ? | Weaknesses: Kỹ năng nào cần cải thiện? Thói quen xấu nào kéo bạn lại? | Opportunities: Khóa học, mối quan hệ, dự án nào tiềm năng? | Threats: Điều gì làm bạn kiệt sức? Rủi ro nào?"
        placeholder="Phân tích điểm mạnh, điểm yếu, cơ hội và thách thức cá nhân..."
        value={assessment?.life_step1_personal_swot || ''}
        onChange={(val) => onChange('life_step1_personal_swot', val)}
      />
      <AssessmentField
        label="1.2. Thành trì cần Chinh phục / Fortress to Conquer"
        helper="Chọn 1-2 Lĩnh vực Ưu tiên: Sự nghiệp, Sức khỏe, Tài chính, Mối quan hệ, Phát triển bản thân | Thiết lập Mục tiêu cụ thể cho mỗi lĩnh vực"
        placeholder="Mục tiêu lớn cần đạt được trong quý về mặt cá nhân..."
        value={assessment?.life_step1_quarterly_mission || ''}
        onChange={(val) => onChange('life_step1_quarterly_mission', val)}
      />
      <AssessmentField
        label="1.3. Binh chủng (Thói quen & Dự án) / Habits & Projects"
        helper="Dự án Chính: Cần thực hiện những dự án nào để đạt mục tiêu? | Thói quen Hỗ trợ: Cần xây dựng thói quen nào?"
        placeholder="Thói quen và dự án cá nhân cần xây dựng/thực hiện..."
        value={assessment?.life_step1_habits_projects || ''}
        onChange={(val) => onChange('life_step1_habits_projects', val)}
      />
    </>
  );
};

const LifeStep2Fields: React.FC<FieldProps> = ({ assessment, onChange }) => {
  return (
    <>
      <AssessmentField
        label="2.1. Review Tiến độ / Progress Review"
        helper="So với mục tiêu Quý, bạn đang ở đâu trên bản đồ? Điều gì hiệu quả? Điều gì không?"
        placeholder="Đánh giá tiến độ thực hiện các mục tiêu cá nhân..."
        value={assessment?.life_step2_progress_review || ''}
        onChange={(val) => onChange('life_step2_progress_review', val)}
      />
      <AssessmentField
        label="2.2. Cột mốc Tháng / Monthly Milestone"
        helper="Chia nhỏ mục tiêu Quý thành các cột mốc cụ thể cho tháng này"
        placeholder="Cột mốc quan trọng cần đạt trong tháng này..."
        value={assessment?.life_step2_monthly_milestone || ''}
        onChange={(val) => onChange('life_step2_monthly_milestone', val)}
      />
      <AssessmentField
        label="2.3. Lịch trình / Schedule"
        helper="Đưa các dự án và thói quen vào lịch của bạn. Thời gian nào trong ngày/tuần bạn sẽ dành cho chúng?"
        placeholder="Lịch trình cho các hoạt động cá nhân trong tháng..."
        value={assessment?.life_step2_schedule || ''}
        onChange={(val) => onChange('life_step2_schedule', val)}
      />
    </>
  );
};

const LifeStep3Fields: React.FC<FieldProps> = ({ assessment, onChange }) => {
  return (
    <>
      <AssessmentField
        label="3.1. Giao ban với Chỉ huy (Self-check) / Self Reflection"
        helper="Tuần qua bạn đã làm được gì tốt? Điều gì đã làm bạn xao nhãng? Cảm xúc của bạn thế nào?"
        placeholder="Tự đánh giá bản thân, những gì đã làm tốt và cần cải thiện..."
        value={assessment?.life_step3_self_reflection || ''}
        onChange={(val) => onChange('life_step3_self_reflection', val)}
      />
      <AssessmentField
        label="3.2. 3 Nhiệm vụ Tối quan trọng / Big Three Tasks"
        helper="Dựa trên mục tiêu tháng, chọn ra 3 nhiệm vụ quan trọng nhất phải hoàn thành trong tuần tới. Đây là những trận đánh sẽ tạo ra tác động lớn nhất"
        placeholder="Ba nhiệm vụ quan trọng nhất cần hoàn thành trong tuần..."
        value={assessment?.life_step3_big_three || ''}
        onChange={(val) => onChange('life_step3_big_three', val)}
      />
      <AssessmentField
        label="3.3. Chuẩn bị Vũ khí / Prepare for Success"
        helper="Lên lịch cụ thể: Đặt 3 nhiệm vụ vào các khung giờ cố định | Dọn dẹp: Loại bỏ yếu tố gây xao nhãng | Chuẩn bị sẵn (chuẩn bị đồ đi tập, dọn dẹp bàn làm việc...)"
        placeholder="Chuẩn bị những gì cần thiết để thành công trong tuần..."
        value={assessment?.life_step3_prepare_success || ''}
        onChange={(val) => onChange('life_step3_prepare_success', val)}
      />
    </>
  );
};

interface AssessmentFieldProps {
  label: string;
  helper?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const AssessmentField: React.FC<AssessmentFieldProps> = ({
  label,
  helper,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1.5">{label}</label>
      {helper && (
        <p className="text-xs text-gray-400 mb-2 leading-relaxed">{helper}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
        rows={4}
      />
    </div>
  );
};

export default QuarterlyBattlefieldAssessment;
