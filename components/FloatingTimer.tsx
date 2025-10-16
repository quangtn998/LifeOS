import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFocusTimer } from '../contexts/FocusTimerContext';
import { PlayIcon, PauseIcon, XIcon } from './icons/Icons';

const PHASES = {
  PLAN: { name: 'PLAN', color: 'bg-yellow-500' },
  FOCUS: { name: 'FOCUS', color: 'bg-cyan-500' },
  REFLECT: { name: 'REFLECT', color: 'bg-green-500' },
};

const FloatingTimer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { secondsLeft, isActive, currentPhase, currentSessionNumber, toggleTimer, resetTimer, formatTime, isTimerRunning } = useFocusTimer();
  const [isMinimized, setIsMinimized] = useState(false);

  const isFocusTimerPage = location.pathname === '/action/focus-timer';

  if (!isTimerRunning || isFocusTimerPage) {
    return null;
  }

  const phase = PHASES[currentPhase];

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed z-50 p-2 text-white transition-all cursor-pointer bottom-6 right-6 bg-gray-800/95 backdrop-blur-sm rounded-full shadow-2xl hover:scale-105"
      >
        <div className={`w-3 h-3 rounded-full ${phase.color} ${isActive ? 'animate-pulse' : ''}`}></div>
      </div>
    );
  }

  return (
    <div className="fixed z-50 overflow-hidden transition-all bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl bottom-6 right-6">
      <div className={`h-1 ${phase.color} transition-all`} style={{ width: `${isActive ? '100%' : '0%'}` }}></div>

      <div className="p-4 space-y-3 w-72">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${phase.color} ${isActive ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs font-semibold text-gray-300">{phase.name}</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-cyan-600 text-white rounded-full">
              #{currentSessionNumber}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-400 transition-colors rounded-full hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={resetTimer}
              className="p-1 text-gray-400 transition-colors rounded-full hover:bg-gray-700 hover:text-white"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          onClick={() => navigate('/action/focus-timer')}
          className="text-4xl font-mono font-bold text-center text-white transition-colors cursor-pointer hover:text-cyan-400"
        >
          {formatTime(secondsLeft)}
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={toggleTimer}
            className={`p-3 ${phase.color} rounded-full text-white hover:opacity-90 transition-opacity`}
          >
            {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/action/focus-timer')}
          className="w-full py-2 text-xs font-medium text-center text-gray-300 transition-colors rounded-lg hover:bg-gray-700"
        >
          Open Full Timer
        </button>
      </div>
    </div>
  );
};

export default FloatingTimer;
