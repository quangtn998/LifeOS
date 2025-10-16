import React from 'react';
import { FocusSessionStats } from '../types';

interface SessionCompletionDialogProps {
  isOpen: boolean;
  sessionGoal: string;
  actualDuration: number;
  plannedDuration: number;
  sessionStats: FocusSessionStats;
  onStartNew: () => void;
  onDone: () => void;
}

const SessionCompletionDialog: React.FC<SessionCompletionDialogProps> = ({
  isOpen,
  sessionGoal,
  actualDuration,
  plannedDuration,
  sessionStats,
  onStartNew,
  onDone,
}) => {
  if (!isOpen) return null;

  const completionPercentage = Math.round((actualDuration / plannedDuration) * 100);
  const totalDisruptors = Object.values(sessionStats.disruptors).reduce((sum, val) => sum + val, 0);
  const totalTools = Object.values(sessionStats.toolkit).reduce((sum, val) => sum + val, 0);

  const getMessage = () => {
    if (completionPercentage >= 90) return "Outstanding! You stayed fully focused.";
    if (completionPercentage >= 75) return "Great work! You maintained solid focus.";
    if (completionPercentage >= 50) return "Good effort! Keep building that focus muscle.";
    return "You started! That's what matters. Try again.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg p-8 mx-4 space-y-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-500/20 rounded-full">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Focus Session Complete!</h2>
          <p className="mt-2 text-cyan-400">{getMessage()}</p>
        </div>

        <div className="p-4 space-y-3 bg-gray-900 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-400">Goal:</span>
            <span className="font-semibold text-white max-w-xs truncate">{sessionGoal || 'No goal set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time Focused:</span>
            <span className="font-semibold text-cyan-400">{actualDuration} min / {plannedDuration} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Completion:</span>
            <span className={`font-semibold ${completionPercentage >= 75 ? 'text-green-400' : completionPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {completionPercentage}%
            </span>
          </div>
          {totalDisruptors > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Disruptors:</span>
              <span className="font-semibold text-red-400">{totalDisruptors}</span>
            </div>
          )}
          {totalTools > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Tools Used:</span>
              <span className="font-semibold text-green-400">{totalTools}</span>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={onStartNew}
            className="w-full px-6 py-3 font-semibold text-white transition-colors bg-cyan-500 rounded-lg hover:bg-cyan-600"
          >
            Start New Session
          </button>
          <button
            onClick={onDone}
            className="w-full px-6 py-3 font-semibold text-gray-300 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Done for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionCompletionDialog;
