import React from 'react';
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
}

interface SessionHistoryGroupedProps {
  sessions: FocusSessionHistory[];
}

const SessionHistoryGrouped: React.FC<SessionHistoryGroupedProps> = ({ sessions }) => {
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
        const totalMinutes = daySessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0);
        const dateObj = new Date(date);

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-sm text-gray-400">
                  {daySessions.length} session{daySessions.length > 1 ? 's' : ''} • {totalMinutes} minutes total
                </p>
              </div>
            </div>

            <div className="space-y-3 pl-4">
              {daySessions.map((session, index) => (
                <Card key={session.id} className="bg-gray-800/30">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-700 px-2 py-1 rounded">
                          #{session.session_number}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                          {session.actual_duration_minutes || session.duration_minutes || 50} min
                        </span>
                        {session.actual_duration_minutes && session.actual_duration_minutes < (session.duration_minutes || 50) && (
                          <span className="text-xs text-yellow-400">
                            {Math.round((session.actual_duration_minutes / (session.duration_minutes || 50)) * 100)}% completed
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-semibold text-cyan-400">{session.goal || 'No goal set'}</h4>
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
                            <p key={key} className="text-xs text-gray-400 truncate">"{key}": {val}</p>
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
                            <p key={key} className="text-xs text-gray-400 truncate">"{key}": {val}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">None</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionHistoryGrouped;
