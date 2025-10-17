import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { QuarterlyBattlefieldAssessment } from '../types';
import Card from './Card';
import QuarterlyBattlefieldAssessmentComponent from './QuarterlyBattlefieldAssessment';
import { ChevronDownIcon, ChevronUpIcon } from './icons/Icons';

interface QuarterlyAssessmentSectionProps {
  currentQuarter: string;
}

const QuarterlyAssessmentSection: React.FC<QuarterlyAssessmentSectionProps> = ({ currentQuarter }) => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<QuarterlyBattlefieldAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isExpanded, setIsExpanded] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchAssessment = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quarterly_battlefield_assessment')
        .select('*')
        .eq('user_id', user.id)
        .eq('quarter', currentQuarter)
        .maybeSingle();

      if (error) throw error;
      setAssessment(data);
    } catch (err: any) {
      console.error('Error fetching quarterly assessment:', err);
    } finally {
      setLoading(false);
    }
  }, [user, currentQuarter]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const handleAssessmentChange = async (field: keyof QuarterlyBattlefieldAssessment, value: string) => {
    if (!user) return;

    const updatedAssessment = assessment
      ? { ...assessment, [field]: value, updated_at: new Date().toISOString() }
      : {
          id: '',
          user_id: user.id,
          quarter: currentQuarter,
          [field]: value,
          work_step1_terrain_weather: '',
          work_step1_mission_objectives: '',
          work_step1_strategic_plays: '',
          work_step2_frontline_review: '',
          work_step2_sprint_goals: '',
          work_step2_action_plan: '',
          work_step3_weekly_huddle: '',
          work_step3_weekly_tasks: '',
          work_step3_weekly_debrief: '',
          life_step1_personal_swot: '',
          life_step1_quarterly_mission: '',
          life_step1_habits_projects: '',
          life_step2_progress_review: '',
          life_step2_monthly_milestone: '',
          life_step2_schedule: '',
          life_step3_self_reflection: '',
          life_step3_big_three: '',
          life_step3_prepare_success: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

    setAssessment(updatedAssessment as QuarterlyBattlefieldAssessment);

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    setSaveStatus('saving');

    const timeout = setTimeout(async () => {
      try {
        if (assessment) {
          const { error } = await supabase
            .from('quarterly_battlefield_assessment')
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('quarter', currentQuarter);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('quarterly_battlefield_assessment')
            .insert({
              user_id: user.id,
              quarter: currentQuarter,
              [field]: value
            })
            .select()
            .single();
          if (error) throw error;
          setAssessment(data);
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err: any) {
        console.error('Error saving quarterly assessment:', err);
        setSaveStatus('idle');
      }
    }, 2000);

    setSaveTimeout(timeout);
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-4 text-gray-400">Loading Battlefield Assessment...</div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div>
          <h2 className="text-xl font-bold text-white">
            Quarterly Battlefield Assessment
          </h2>
          

          <p className="text-xs text-gray-400 mt-1">
        <br />
        Tại Sao Phải "Đánh Giá Chiến Trường" Mỗi Quý?
        <br /><br />
        Chúng ta làm việc này vì một lý do đơn giản: Để ngừng làm một <em>người lính</em> bị cuốn vào những trận đánh vụn vặt hàng ngày, và trở thành một vị tướng đứng trên ngọn đồi, nhìn toàn cảnh và quyết định trận đánh nào đáng để tham gia.
        <br /><br />
        Nếu không có nó, chúng ta sẽ rơi vào cảnh "bận rộn nhưng không hiệu quả" – chạy khắp nơi dập lửa mà không chiếm được thêm một tấc đất nào.
        <br /><br />
        Bản đánh giá này mang lại 3 sức mạnh cốt lõi:
        <br /><br />
        1. Từ Sương Mù ra Ánh Sáng (Clarity) 🗺️<br />
        Nó biến sự hỗn loạn của 100 việc phải làm thành một tấm bản đồ chiến lược rõ ràng. Bạn sẽ biết chính xác đâu là "thành trì" quan trọng nhất cần phải chiếm trong 90 ngày tới. Mọi thứ khác chỉ là thứ yếu.
        <br /><br />
        2. Tập Trung Hỏa Lực (Focus) 🎯<br />
        Bạn không thể dàn quân ra mọi mặt trận. Bản đánh giá này buộc bạn phải dồn toàn bộ nguồn lực (thời gian, năng lượng, tiền bạc) vào những mục tiêu tạo ra tác động lớn nhất. Thay vì bắn 100 viên đạn đi khắp nơi, bạn sẽ bắn 10 viên trúng vào tim địch.
        <br /><br />
        3. Giành Lại Quyền Chỉ Huy (Control) 🕹️<br />
        Nó giúp bạn chuyển từ thế bị động phản ứng với hoàn cảnh sang thế chủ động kiến tạo tương lai. Bạn sẽ lường trước được "quân địch" (thách thức), tận dụng "địa lợi" (cơ hội) và chỉ huy "quân ta" (chính bản thân/đội nhóm) một cách có chủ đích.
        <br /><br />
        Nói đơn giản: Ngừng làm nạn nhân của hoàn cảnh và trở thành người kiến tạo nên chiến thắng của chính mình. Đó là lý do chúng ta phải làm việc này.
        <br /><br />
        <em>Đánh giá toàn diện hàng quý cho cả Công việc và Cuộc sống (thực hiện mỗi quý một lần hoặc khi nào cần thiết)</em>
    </p>

          
        </div>

        <div className="mt-6">
          <QuarterlyBattlefieldAssessmentComponent
            assessment={assessment}
            onAssessmentChange={handleAssessmentChange}
          />
        </div>
      </Card>

      {saveStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 shadow-lg z-50">
          <p className="text-sm text-white">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved!'}
          </p>
        </div>
      )}
    </>
  );
};

export default QuarterlyAssessmentSection;
