import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { FocusLogData } from '../types';

const FocusHeatmap: React.FC = () => {
  const { user } = useAuth();
  const [focusLog, setFocusLog] = useState<FocusLogData>({});
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; minutes: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchFocusLog = async () => {
      if (!user) return;
      setLoading(true);

      const { data } = await supabase
        .from('focus_log')
        .select('data')
        .eq('user_id', user.id)
        .single();

      setFocusLog(data?.data || {});
      setLoading(false);
    };

    fetchFocusLog();
  }, [user]);

  const getColorClass = (minutes: number): string => {
    if (minutes === 0) return 'bg-gray-800';
    if (minutes <= 30) return 'bg-green-900/50';
    if (minutes <= 60) return 'bg-green-700/70';
    if (minutes <= 120) return 'bg-green-500';
    return 'bg-green-400';
  };

  const generateYearData = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364);

    const weeks: Array<Array<{ date: string; minutes: number }>> = [];
    let currentWeek: Array<{ date: string; minutes: number }> = [];

    const startDay = oneYearAgo.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: '', minutes: 0 });
    }

    const currentDate = new Date(oneYearAgo);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const minutes = focusLog[dateStr] || 0;

      currentWeek.push({ date: dateStr, minutes });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', minutes: 0 });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getMonthLabels = () => {
    const today = new Date();
    const months: Array<{ label: string; weekIndex: number }> = [];
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364);

    let currentMonth = oneYearAgo.getMonth();
    let weekIndex = 0;

    const currentDate = new Date(oneYearAgo);
    while (currentDate <= today) {
      const month = currentDate.getMonth();

      if (month !== currentMonth && currentDate.getDate() <= 7) {
        months.push({
          label: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        });
        currentMonth = month;
      }

      if (currentDate.getDay() === 6) {
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return months;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-400">Loading heatmap...</p>
      </div>
    );
  }

  const weeks = generateYearData();
  const monthLabels = getMonthLabels();
  const totalMinutes = Object.values(focusLog).reduce((sum, min) => sum + min, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const daysWithActivity = Object.values(focusLog).filter(min => min > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-400">Total Hours: </span>
            <span className="font-bold text-white">{totalHours}h</span>
          </div>
          <div>
            <span className="text-gray-400">Active Days: </span>
            <span className="font-bold text-white">{daysWithActivity}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-900/50 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-700/70 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="relative">
            <div className="flex gap-1 mb-2 ml-6">
              {monthLabels.map((month, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400"
                  style={{
                    position: 'absolute',
                    left: `${month.weekIndex * 14}px`,
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            <div className="flex gap-1 mt-6">
              <div className="flex flex-col justify-around text-xs text-gray-400 mr-1">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="flex gap-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-cyan-400 ${
                          day.date ? getColorClass(day.minutes) : 'bg-transparent'
                        }`}
                        onMouseEnter={() =>
                          day.date && setHoveredCell({ date: day.date, minutes: day.minutes })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        onMouseMove={handleMouseMove}
                        title={
                          day.date
                            ? `${new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}: ${day.minutes} minutes`
                            : ''
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hoveredCell && (
        <div
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y + 10}px`,
          }}
        >
          <div className="font-semibold">
            {new Date(hoveredCell.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-cyan-400">
            {hoveredCell.minutes} minutes
            {hoveredCell.minutes > 0 && ` (${Math.round(hoveredCell.minutes / 60)} hours)`}
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusHeatmap;
