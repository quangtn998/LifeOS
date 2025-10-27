import React, { useMemo } from 'react';
import Card from './Card';

interface FocusSessionHistory {
  id: string;
  date: string;
  session_number: number;
  goal: string;
  captured_thoughts: string;
  reflection: string;
  disruptors: {
    procrastination: number;
    distraction: number;
    burnout: number;
    perfectionism: number;
  };
  toolkit_usage: Record<string, number>;
  recharge_usage: Record<string, number>;
  duration_minutes: number;
  actual_duration_minutes: number;
  completed: boolean;
  start_time?: string;
  end_time?: string;
  total_pause_duration_seconds?: number;
  is_early_exit?: boolean;
}

interface AllSessionsStatsProps {
  sessions: FocusSessionHistory[];
}

const AllSessionsStats: React.FC<AllSessionsStatsProps> = ({ sessions }) => {
  const stats = useMemo(() => {
    const completedSessions = sessions.filter(s => s.completed);
    const earlyExitSessions = completedSessions.filter(s => s.is_early_exit);

    const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const avgDuration = completedSessions.length > 0
      ? Math.round(totalMinutes / completedSessions.length)
      : 0;

    const completionRate = sessions.length > 0
      ? Math.round((completedSessions.length / sessions.length) * 100)
      : 0;

    const allDisruptors = completedSessions.reduce((acc, s) => {
      Object.entries(s.disruptors || {}).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
      return acc;
    }, {} as Record<string, number>);

    const topDisruptor = Object.entries(allDisruptors).sort(([, a], [, b]) => b - a)[0];

    const allTools = completedSessions.reduce((acc, s) => {
      Object.entries(s.toolkit_usage || {}).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
      return acc;
    }, {} as Record<string, number>);

    const topTools = Object.entries(allTools).sort(([, a], [, b]) => b - a).slice(0, 3);

    const uniqueDays = new Set(completedSessions.map(s => s.date)).size;

    const dayOfWeekStats = completedSessions.reduce((acc, s) => {
      const date = new Date(s.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      acc[dayName] = (acc[dayName] || 0) + (s.actual_duration_minutes || s.duration_minutes || 0);
      return acc;
    }, {} as Record<string, number>);

    const bestDay = Object.entries(dayOfWeekStats).sort(([, a], [, b]) => b - a)[0];

    const longestSession = completedSessions.reduce((max, s) => {
      const duration = s.actual_duration_minutes || s.duration_minutes || 0;
      return duration > (max?.actual_duration_minutes || max?.duration_minutes || 0) ? s : max;
    }, completedSessions[0]);

    const totalPauseMinutes = Math.floor(
      completedSessions.reduce((sum, s) => sum + (s.total_pause_duration_seconds || 0), 0) / 60
    );

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      earlyExitSessions: earlyExitSessions.length,
      totalHours,
      remainingMinutes,
      avgDuration,
      completionRate,
      topDisruptor,
      topTools,
      uniqueDays,
      bestDay,
      longestSession,
      totalPauseMinutes,
      allDisruptors,
    };
  }, [sessions]);

  const getInsights = () => {
    const insights = [];

    if (stats.completionRate >= 80) {
      insights.push({ type: 'success', message: `Outstanding consistency! ${stats.completionRate}% completion rate shows great discipline.` });
    } else if (stats.completionRate < 50) {
      insights.push({ type: 'warning', message: `Your completion rate is ${stats.completionRate}%. Try setting shorter initial goals to build momentum.` });
    }

    if (stats.topDisruptor) {
      const [disruptor, count] = stats.topDisruptor;
      if (count > stats.completedSessions * 0.5) {
        insights.push({ type: 'info', message: `${disruptor.charAt(0).toUpperCase() + disruptor.slice(1)} is your main challenge (${count} occurrences). Consider using focus tools more actively.` });
      }
    }

    if (stats.bestDay) {
      const [day, minutes] = stats.bestDay;
      insights.push({ type: 'success', message: `You focus best on ${day}s (${Math.round(minutes / 60)}h total). Schedule important work on this day.` });
    }

    if (stats.avgDuration < 30 && stats.completedSessions > 0) {
      insights.push({ type: 'warning', message: `Your average session is ${stats.avgDuration} minutes. Try building up to longer focus periods gradually.` });
    } else if (stats.avgDuration >= 45) {
      insights.push({ type: 'success', message: `Excellent focus stamina! ${stats.avgDuration} minutes average is above the standard.` });
    }

    if (stats.earlyExitSessions > stats.completedSessions * 0.3 && stats.completedSessions > 0) {
      insights.push({ type: 'info', message: `${Math.round((stats.earlyExitSessions / stats.completedSessions) * 100)}% of your sessions ended early. This is natural - keep experimenting with your environment and timing.` });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Overall Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.completedSessions} completed</p>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Total Focus Time</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.totalHours}h {stats.remainingMinutes}m</p>
            <p className="text-xs text-gray-500 mt-1">Avg: {stats.avgDuration}m/session</p>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-green-400">{stats.completionRate}%</p>
            {stats.earlyExitSessions > 0 && (
              <p className="text-xs text-orange-400 mt-1">{stats.earlyExitSessions} early exits</p>
            )}
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Active Days</p>
            <p className="text-3xl font-bold text-purple-400">{stats.uniqueDays}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.completedSessions > 0 ? (stats.completedSessions / stats.uniqueDays).toFixed(1) : 0} sessions/day</p>
          </div>
        </div>
      </Card>

      {insights.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Insights & Recommendations</h3>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success'
                    ? 'bg-green-900/20 border-green-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-500'
                    : 'bg-cyan-900/20 border-cyan-500'
                }`}
              >
                <p className="text-sm text-gray-300">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Top Disruptors</h3>
          {stats.topDisruptor ? (
            <div className="space-y-3">
              {Object.entries(stats.allDisruptors)
                .sort(([, a], [, b]) => b - a)
                .filter(([, val]) => val > 0)
                .map(([key, val]) => {
                  const total = Object.values(stats.allDisruptors).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((val / total) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm capitalize text-gray-300">{key}</span>
                        <span className="text-sm font-semibold text-red-400">{val} times</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No disruptors logged yet. Keep tracking!</p>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Most Used Tools</h3>
          {stats.topTools.length > 0 ? (
            <div className="space-y-3">
              {stats.topTools.map(([tool, count], idx) => (
                <div key={tool} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-400">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate" title={tool}>{tool}</p>
                    <p className="text-xs text-gray-400">Used {count} times</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tools logged yet. Try using the focus toolkit!</p>
          )}
        </Card>
      </div>

      {stats.longestSession && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Personal Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 rounded-lg border border-yellow-500/30">
              <p className="text-xs font-semibold text-yellow-400 mb-2">Longest Session</p>
              <p className="text-2xl font-bold text-white mb-1">
                {stats.longestSession.actual_duration_minutes || stats.longestSession.duration_minutes} min
              </p>
              <p className="text-xs text-gray-400 truncate">{stats.longestSession.goal}</p>
            </div>

            {stats.bestDay && (
              <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-lg border border-purple-500/30">
                <p className="text-xs font-semibold text-purple-400 mb-2">Best Day</p>
                <p className="text-2xl font-bold text-white mb-1">{stats.bestDay[0]}</p>
                <p className="text-xs text-gray-400">{Math.round(stats.bestDay[1] / 60)}h {stats.bestDay[1] % 60}m total</p>
              </div>
            )}

            <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 rounded-lg border border-cyan-500/30">
              <p className="text-xs font-semibold text-cyan-400 mb-2">Total Paused</p>
              <p className="text-2xl font-bold text-white mb-1">{stats.totalPauseMinutes}m</p>
              <p className="text-xs text-gray-400">
                Avg: {stats.completedSessions > 0 ? Math.round(stats.totalPauseMinutes / stats.completedSessions) : 0}m/session
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AllSessionsStats;
