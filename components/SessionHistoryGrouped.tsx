import React from 'react';
import Card from './Card';
import { ClockIcon } from './icons/Icons';

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

interface SessionHistoryGroupedProps {
  sessions: FocusSessionHistory[];
}

const SessionHistoryGrouped: React.FC<SessionHistoryGroupedProps> = ({ sessions }) => {
  const today = new Date().toISOString().split('T')[0];

  const groupedByDate = sessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {} as Record<string, FocusSessionHistory[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedDates.map(date => {
        const daySessions = groupedByDate[date];
        const completedSessions = daySessions.filter(s => s.completed);
        const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0);
        const dateObj = new Date(date);
        const isToday = date === today;

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {isToday && <span className="px-2 py-1 text-xs font-bold bg-cyan-500 text-white rounded-full">Today</span>}
                  {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-sm text-gray-400">
                  {daySessions.length} session{daySessions.length > 1 ? 's' : ''} ({completedSessions.length} completed) • {totalMinutes} minutes total
                </p>
              </div>
            </div>

            <div className="space-y-3 pl-4">
              {daySessions.map((session, index) => {
                const pauseMinutes = session.total_pause_duration_seconds ? Math.floor(session.total_pause_duration_seconds / 60) : 0;
                const pauseSeconds = session.total_pause_duration_seconds ? session.total_pause_duration_seconds % 60 : 0;
                const actualFocusTime = session.actual_duration_minutes && session.total_pause_duration_seconds
                  ? session.actual_duration_minutes - pauseMinutes
                  : session.actual_duration_minutes;

                let borderColorClass = 'border-gray-600/50';
                if (session.completed) {
                  if (session.is_early_exit) {
                    borderColorClass = 'border-orange-500/50';
                  } else {
                    borderColorClass = 'border-green-500/50';
                  }
                } else {
                  borderColorClass = 'border-yellow-500/50';
                }

                return (
                  <Card key={session.id} className={`bg-gray-800/30 border-l-4 ${borderColorClass}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-300 bg-gray-700 px-2 py-1 rounded">
                            Session #{session.session_number}
                          </span>
                          {session.completed ? (
                            session.is_early_exit ? (
                              <span className="text-xs font-semibold text-orange-400 bg-orange-900/30 px-2 py-1 rounded border border-orange-500/30 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Early Exit
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Completed
                              </span>
                            )
                          ) : (
                            <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/30">
                              Incomplete
                            </span>
                          )}

                          {session.start_time && session.end_time && (
                            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {new Date(session.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              {' → '}
                              {new Date(session.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-cyan-400 mb-2">{session.goal || 'No goal set'}</h4>

                        {session.completed && (
                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-1 text-gray-400">
                              <span className="font-semibold text-cyan-400">Focus Time:</span>
                              <span className="font-mono">{session.actual_duration_minutes || session.duration_minutes || 50} min</span>
                            </div>

                            {session.total_pause_duration_seconds !== undefined && session.total_pause_duration_seconds > 0 && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-yellow-400">Paused:</span>
                                <span className="font-mono">{pauseMinutes}m {pauseSeconds}s</span>
                              </div>
                            )}

                            {session.is_early_exit && session.duration_minutes && (
                              <div className="flex items-center gap-1 text-orange-400">
                                <span className="font-semibold">Completion:</span>
                                <span className="font-mono">{Math.round((session.actual_duration_minutes / session.duration_minutes) * 100)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  {session.reflection && (
                    <div className="mt-3 p-3 bg-gray-900 rounded-md">
                      <p className="text-xs font-semibold text-green-400 mb-1">Reflection:</p>
                      <p className="text-sm text-gray-300">{session.reflection}</p>
                    </div>
                  )}

                  {session.captured_thoughts && (
                    <div className="mt-2 p-3 bg-gray-900 rounded-md">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Captured Thoughts:</p>
                      <p className="text-xs text-gray-400">{session.captured_thoughts}</p>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">Disruptors:</p>
                      {session.disruptors && Object.entries(session.disruptors).filter(([, val]) => val > 0).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(session.disruptors).filter(([, val]) => val > 0).map(([key, val]) => (
                            <p key={key} className="text-xs text-gray-400 capitalize">{key}: {val}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">None</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-400 mb-1">Tools Used:</p>
                      {session.toolkit_usage && Object.keys(session.toolkit_usage).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(session.toolkit_usage).slice(0, 3).map(([key, val]) => (
                            <p key={key} className="text-xs text-gray-400 truncate" title={key}>"{key}": {val}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">None</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-cyan-400 mb-1">Recharge:</p>
                      {session.recharge_usage && Object.keys(session.recharge_usage).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(session.recharge_usage).slice(0, 3).map(([key, val]) => (
                            <p key={key} className="text-xs text-gray-400 truncate" title={key}>"{key}": {val}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">None</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionHistoryGrouped;
