import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { FocusSessionStats, FocusLogData } from '../types';

const PHASES = {
  PLAN: { name: 'PLAN & ORGANIZE', duration: 5 * 60, color: 'text-yellow-400' },
  FOCUS: { name: 'FOCUS', duration: 50 * 60, color: 'text-cyan-400' },
  REFLECT: { name: 'REFLECT & RECHARGE', duration: 5 * 60, color: 'text-green-400' },
};

interface FocusTimerContextType {
  secondsLeft: number;
  isActive: boolean;
  currentPhase: 'PLAN' | 'FOCUS' | 'REFLECT';
  sessionGoal: string;
  sessionStats: FocusSessionStats;
  capturedThoughts: string;
  reflection: string;
  isTimerRunning: boolean;
  showCompletionDialog: boolean;
  actualDurationMinutes: number;
  currentSessionNumber: number;
  soundEnabled: boolean;

  setSessionGoal: (goal: string) => void;
  setCapturedThoughts: (thoughts: string) => void;
  setReflection: (reflection: string) => void;
  setSessionStats: React.Dispatch<React.SetStateAction<FocusSessionStats>>;
  setSoundEnabled: (enabled: boolean) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipToNextPhase: () => void;
  endSession: () => void;
  trackDisruptor: (disruptor: keyof FocusSessionStats['disruptors']) => void;
  trackToolUsage: (toolText: string) => void;
  trackRechargeUsage: (activityText: string) => void;
  formatTime: (seconds: number) => string;
  handleSessionComplete: (startNew: boolean) => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error('useFocusTimer must be used within FocusTimerProvider');
  }
  return context;
};

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(PHASES.PLAN.duration);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'PLAN' | 'FOCUS' | 'REFLECT'>('PLAN');
  const [sessionGoal, setSessionGoal] = useState('');
  const [capturedThoughts, setCapturedThoughts] = useState('');
  const [reflection, setReflection] = useState('');
  const [sessionStats, setSessionStats] = useState<FocusSessionStats>({
    disruptors: { procrastination: 0, distraction: 0, burnout: 0, perfectionism: 0 },
    toolkit: {},
    recharge: {}
  });
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [focusStartTime, setFocusStartTime] = useState<number | null>(null);
  const [totalPauseDuration, setTotalPauseDuration] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [actualDurationMinutes, setActualDurationMinutes] = useState(0);
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('focusTimerSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const timerRef = useRef<number | null>(null);
  const planEndAudio = useRef<HTMLAudioElement | null>(null);
  const focusEndAudio = useRef<HTMLAudioElement | null>(null);
  const reflectEndAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const createBeep = (frequency: number, duration: number, volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      return { oscillator, gainNode, duration };
    };

    const playSound = (beeps: Array<{freq: number, delay: number, duration: number}>) => {
      return () => {
        if (!soundEnabled) return;
        beeps.forEach(({freq, delay, duration}) => {
          setTimeout(() => {
            const {oscillator} = createBeep(freq, duration);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
          }, delay);
        });
      };
    };

    planEndAudio.current = {
      play: playSound([
        {freq: 440, delay: 0, duration: 0.15},
        {freq: 554, delay: 150, duration: 0.15}
      ])
    } as any;

    focusEndAudio.current = {
      play: playSound([
        {freq: 523, delay: 0, duration: 0.2},
        {freq: 659, delay: 200, duration: 0.2},
        {freq: 784, delay: 400, duration: 0.3}
      ])
    } as any;

    reflectEndAudio.current = {
      play: playSound([
        {freq: 659, delay: 0, duration: 0.2},
        {freq: 523, delay: 200, duration: 0.3}
      ])
    } as any;
  }, [soundEnabled]);

  const logFocusSession = useCallback(async (duration: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const { data: log, error: fetchError } = await supabase.from('focus_log').select('data').eq('user_id', user.id).maybeSingle();
    if(fetchError && fetchError.code !== 'PGRST116') console.error(fetchError);

    const newLogData: FocusLogData = log?.data || {};
    newLogData[today] = (newLogData[today] || 0) + duration;

    const { error } = await supabase.from('focus_log').upsert({ user_id: user.id, data: newLogData }, { onConflict: 'user_id'});
    if(error) console.error("Error logging session:", error);
  }, [user]);

  const getNextSessionNumber = useCallback(async () => {
    if (!user) return 1;
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('focus_sessions')
      .select('session_number')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('session_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data?.session_number || 0) + 1;
  }, [user]);

  const saveSessionData = useCallback(async (startTime: number | null, endTime: number, pauseDuration: number, actualMinutes: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('focus_sessions').insert({
      user_id: user.id,
      date: today,
      session_number: currentSessionNumber,
      goal: sessionGoal,
      captured_thoughts: capturedThoughts,
      reflection: reflection,
      disruptors: sessionStats.disruptors,
      toolkit_usage: sessionStats.toolkit,
      recharge_usage: sessionStats.recharge,
      duration_minutes: PHASES.FOCUS.duration / 60,
      start_time: startTime ? new Date(startTime).toISOString() : null,
      end_time: new Date(endTime).toISOString(),
      actual_duration_minutes: actualMinutes,
      total_pause_duration_seconds: pauseDuration,
      completed: true,
    });
  }, [user, currentSessionNumber, sessionGoal, capturedThoughts, reflection, sessionStats]);

  const saveSessionGoal = useCallback(async () => {
    if (!user || !sessionGoal.trim()) return;
    const today = new Date().toISOString().split('T')[0];

    const { data: existingSession } = await supabase
      .from('focus_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .eq('session_number', currentSessionNumber)
      .maybeSingle();

    if (existingSession) {
      await supabase.from('focus_sessions')
        .update({ goal: sessionGoal })
        .eq('id', existingSession.id);
    } else {
      await supabase.from('focus_sessions').insert({
        user_id: user.id,
        date: today,
        session_number: currentSessionNumber,
        goal: sessionGoal,
        completed: false,
      });
    }
  }, [user, sessionGoal, currentSessionNumber]);

  useEffect(() => {
    if (sessionGoal.trim()) {
      const timer = setTimeout(() => {
        saveSessionGoal();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionGoal, saveSessionGoal]);

  const resetTimer = useCallback(async () => {
    setIsActive(false);
    setCurrentPhase('PLAN');
    setSecondsLeft(PHASES.PLAN.duration);
    setSessionGoal('');
    setCapturedThoughts('');
    setReflection('');
    setSessionStats({ disruptors: { procrastination: 0, distraction: 0, burnout: 0, perfectionism: 0 }, toolkit: {}, recharge: {} });
    setFocusStartTime(null);
    setTotalPauseDuration(0);
    setPauseStartTime(null);
    setActualDurationMinutes(0);
    setShowCompletionDialog(false);

    const nextSessionNum = await getNextSessionNumber();
    setCurrentSessionNumber(nextSessionNum);
  }, [getNextSessionNumber]);

  const handlePhaseEnd = useCallback(async () => {
    if (currentPhase === 'PLAN') {
      planEndAudio.current?.play();
      setCurrentPhase('FOCUS');
      setSecondsLeft(PHASES.FOCUS.duration);
      setFocusStartTime(Date.now());
      setTotalPauseDuration(0);
      setPauseStartTime(null);
      setIsActive(true);
    } else if (currentPhase === 'FOCUS') {
      focusEndAudio.current?.play();

      const endTime = Date.now();
      const totalElapsed = focusStartTime ? (endTime - focusStartTime) / 1000 : PHASES.FOCUS.duration;
      const actualFocusTime = Math.max(0, totalElapsed - totalPauseDuration);
      const actualMinutes = Math.round(actualFocusTime / 60);

      setActualDurationMinutes(actualMinutes);
      await logFocusSession(actualMinutes);

      setCurrentPhase('REFLECT');
      setSecondsLeft(PHASES.REFLECT.duration);
      setIsActive(true);
    } else if (currentPhase === 'REFLECT') {
      reflectEndAudio.current?.play();

      const endTime = Date.now();
      await saveSessionData(focusStartTime, endTime, totalPauseDuration, actualDurationMinutes);

      setShowCompletionDialog(true);
      setIsActive(false);
    }
  }, [currentPhase, focusStartTime, totalPauseDuration, actualDurationMinutes, logFocusSession, saveSessionData]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  useEffect(() => {
    if(secondsLeft < 0) {
      handlePhaseEnd();
    }
  }, [secondsLeft, handlePhaseEnd]);

  const toggleTimer = useCallback(() => {
    if (currentPhase === 'FOCUS') {
      if (isActive) {
        setPauseStartTime(Date.now());
      } else {
        if (pauseStartTime) {
          const pauseDuration = (Date.now() - pauseStartTime) / 1000;
          setTotalPauseDuration(prev => prev + pauseDuration);
          setPauseStartTime(null);
        }
      }
    }
    setIsActive(!isActive);
  }, [isActive, currentPhase, pauseStartTime]);

  const skipToNextPhase = useCallback(async () => {
    setIsActive(false);
    if (currentPhase === 'FOCUS' && focusStartTime) {
      const endTime = Date.now();
      const totalElapsed = (endTime - focusStartTime) / 1000;
      const timeSpentInPhase = PHASES.FOCUS.duration - secondsLeft;
      const actualFocusTime = Math.max(0, Math.min(totalElapsed, timeSpentInPhase) - totalPauseDuration);
      const actualMinutes = Math.round(actualFocusTime / 60);
      setActualDurationMinutes(actualMinutes);
    }
    setSecondsLeft(-1);
  }, [currentPhase, focusStartTime, secondsLeft, totalPauseDuration]);

  const endSession = useCallback(async () => {
    setIsActive(false);

    if (currentPhase === 'FOCUS' && focusStartTime) {
      const endTime = Date.now();
      const totalElapsed = (endTime - focusStartTime) / 1000;
      const actualFocusTime = Math.max(0, totalElapsed - totalPauseDuration);
      const actualMinutes = Math.round(actualFocusTime / 60);

      setActualDurationMinutes(actualMinutes);
      await logFocusSession(actualMinutes);

      if (!user) return;
      const today = new Date().toISOString().split('T')[0];

      await supabase.from('focus_sessions').insert({
        user_id: user.id,
        date: today,
        session_number: currentSessionNumber,
        goal: sessionGoal,
        captured_thoughts: capturedThoughts,
        reflection: '',
        disruptors: sessionStats.disruptors,
        toolkit_usage: sessionStats.toolkit,
        recharge_usage: {},
        duration_minutes: PHASES.FOCUS.duration / 60,
        start_time: new Date(focusStartTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        actual_duration_minutes: actualMinutes,
        total_pause_duration_seconds: totalPauseDuration,
        completed: false,
      });

      await resetTimer();
    } else if (currentPhase === 'REFLECT') {
      const endTime = Date.now();
      await saveSessionData(focusStartTime, endTime, totalPauseDuration, actualDurationMinutes);
      setShowCompletionDialog(true);
    } else {
      await resetTimer();
    }
  }, [currentPhase, focusStartTime, totalPauseDuration, user, currentSessionNumber, sessionGoal, capturedThoughts, sessionStats, logFocusSession, resetTimer, saveSessionData, actualDurationMinutes]);

  const trackDisruptor = useCallback(async (disruptor: keyof FocusSessionStats['disruptors']) => {
    setSessionStats(s => ({ ...s, disruptors: {...s.disruptors, [disruptor]: s.disruptors[disruptor] + 1 }}));
  }, []);

  const trackToolUsage = useCallback(async (toolText: string) => {
    setSessionStats(s => ({ ...s, toolkit: {...s.toolkit, [toolText]: (s.toolkit[toolText] || 0) + 1 }}));
  }, []);

  const trackRechargeUsage = useCallback(async (activityText: string) => {
    setSessionStats(s => ({ ...s, recharge: {...s.recharge, [activityText]: (s.recharge[activityText] || 0) + 1 }}));
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSessionComplete = useCallback(async (startNew: boolean, onHistoryRefresh?: () => void) => {
    if (onHistoryRefresh) {
      onHistoryRefresh();
    }
    if (startNew) {
      await resetTimer();
      setIsActive(true);
    } else {
      await resetTimer();
    }
  }, [resetTimer]);

  const isTimerRunning = isActive || currentPhase !== 'PLAN' || secondsLeft !== PHASES.PLAN.duration;

  const handleSoundToggle = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('focusTimerSoundEnabled', JSON.stringify(enabled));
  }, []);

  return (
    <FocusTimerContext.Provider value={{
      secondsLeft,
      isActive,
      currentPhase,
      sessionGoal,
      sessionStats,
      capturedThoughts,
      reflection,
      isTimerRunning,
      showCompletionDialog,
      actualDurationMinutes,
      currentSessionNumber,
      soundEnabled,
      setSessionGoal,
      setCapturedThoughts,
      setReflection,
      setSessionStats,
      setSoundEnabled: handleSoundToggle,
      toggleTimer,
      resetTimer,
      skipToNextPhase,
      endSession,
      trackDisruptor,
      trackToolUsage,
      trackRechargeUsage,
      formatTime,
      handleSessionComplete,
    }}>
      {children}
    </FocusTimerContext.Provider>
  );
};
