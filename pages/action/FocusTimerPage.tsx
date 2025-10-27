import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusTimer } from '../../contexts/FocusTimerContext';
import Card from '../../components/Card';
import HistorySection from '../../components/HistorySection';
import SessionCompletionDialog from '../../components/SessionCompletionDialog';
import SessionHistoryGrouped from '../../components/SessionHistoryGrouped';
import PlanStepIndicator from '../../components/PlanStepIndicator';
import { PlayIcon, PauseIcon, RefreshCwIcon, PlusCircleIcon, TrashIcon, SkipForwardIcon, VolumeIcon, VolumeOffIcon, CheckIcon } from '../../components/icons/Icons';
import { CustomTool, DailyPlan } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import ExpandableGuide from '../../components/ExpandableGuide';
import { GUIDE_CONTENT } from '../../constants/guideContent';
import AutoResizeTextarea from '../../components/AutoResizeTextarea';
import { getTodayLocal, getWeekRange } from '../../utils/dateUtils';

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

const PHASES = {
  PLAN: { name: 'PLAN & ORGANIZE', color: 'text-yellow-400' },
  FOCUS: { name: 'FOCUS', color: 'text-cyan-400' },
  REFLECT: { name: 'REFLECT & RECHARGE', color: 'text-green-400' },
};

const DEFAULT_TOOLS = {
  activation: [{id: 'd1', text: 'Listen to favorite music'}, {id: 'd2', text: '3-minute breathing'}, {id: 'd3', text: 'Do a super easy admin task'}],
  reactivation: [{id: 'd4', text: '60-second stretch/jump'}, {id: 'd5', text: 'Change music/scenery'}, {id: 'd6', text: 'Move phone to another room'}]
};

const DEFAULT_RECHARGE = [
  {id: 'r1', text: 'Take a 10-minute walk'},
  {id: 'r2', text: 'Stretch or do light yoga'},
  {id: 'r3', text: 'Make a cup of tea/coffee'},
  {id: 'r4', text: 'Listen to music'},
  {id: 'r5', text: 'Step outside for fresh air'}
];

const FocusTimerPage: React.FC = () => {
    const { user } = useAuth();
    const {
        secondsLeft,
        isActive,
        currentPhase,
        planStep,
        sessionGoal,
        sessionStats,
        capturedThoughts,
        reflection,
        showCompletionDialog,
        actualDurationMinutes,
        currentSessionNumber,
        soundEnabled,
        workspaceOrganized,
        focusStartTime,
        totalPauseDuration,
        setSessionGoal,
        setCapturedThoughts,
        setReflection,
        setSoundEnabled,
        setWorkspaceOrganized,
        setPlanStep,
        toggleTimer,
        resetTimer,
        skipToNextPhase,
        endSession,
        trackDisruptor,
        trackToolUsage,
        trackRechargeUsage,
        formatTime,
        handleSessionComplete,
    } = useFocusTimer();

    const [dailyAdventure, setDailyAdventure] = useState<string | null>(null);
    const [customTools, setCustomTools] = useState<{activation: CustomTool[], reactivation: CustomTool[]}>({activation: [], reactivation: []});
    const [customRecharge, setCustomRecharge] = useState<CustomTool[]>([]);
    const [sessionHistory, setSessionHistory] = useState<FocusSessionHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showEarlyExitDialog, setShowEarlyExitDialog] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const { data: toolsData } = await supabase.from('custom_tools').select('*').eq('user_id', user.id).single();
        if (toolsData) {
            setCustomTools({
                activation: toolsData.activation || [],
                reactivation: toolsData.reactivation || [],
            });
        }
        const { data: rechargeData } = await supabase.from('custom_recharge').select('*').eq('user_id', user.id).single();
        if (rechargeData) {
            setCustomRecharge(rechargeData.activities || []);
        }
        const today = getTodayLocal();
        const { data: planData } = await supabase.from('daily_plan').select('manifesto').eq('user_id', user.id).eq('date', today).single();
        if (planData) {
            setDailyAdventure((planData.manifesto as DailyPlan['manifesto'])?.adventure || null);
        }
        const { data: sessionData } = await supabase.from('focus_sessions').select('goal').eq('user_id', user.id).eq('date', today).maybeSingle();
        if (sessionData?.goal) {
            setSessionGoal(sessionData.goal);
        }
    }, [user, setSessionGoal]);

    const fetchSessionHistory = useCallback(async () => {
        if (!user) return;
        setHistoryLoading(true);
        try {
            const weekRange = getWeekRange();
            const { data, error } = await supabase
                .from('focus_sessions')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', weekRange.start)
                .lte('date', weekRange.end)
                .order('date', { ascending: false })
                .order('session_number', { ascending: false });
            if (error) throw error;
            setSessionHistory(data || []);
        } catch (err) {
            console.error('Error fetching session history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
        fetchSessionHistory();
    }, [fetchData, fetchSessionHistory]);

    // --- Custom Tools ---
    const addCustomTool = async (type: 'activation' | 'reactivation', text: string) => {
      if (!text.trim() || !user) return;
      const newTool: CustomTool = { id: uuidv4(), text };
      const updatedTools = {...customTools, [type]: [...customTools[type], newTool]};
      setCustomTools(updatedTools);
      await supabase.from('custom_tools').upsert({ user_id: user.id, ...updatedTools }, { onConflict: 'user_id'});
    };

    const deleteCustomTool = async (type: 'activation' | 'reactivation', id: string) => {
        if(!user) return;
        const updatedTools = {...customTools, [type]: customTools[type].filter(t => t.id !== id)};
        setCustomTools(updatedTools);
        await supabase.from('custom_tools').upsert({ user_id: user.id, ...updatedTools }, { onConflict: 'user_id'});
    };

    // --- Custom Recharge ---
    const addCustomRecharge = async (text: string) => {
        if (!text.trim() || !user) return;
        const newActivity: CustomTool = { id: uuidv4(), text };
        const updatedRecharge = [...customRecharge, newActivity];
        setCustomRecharge(updatedRecharge);
        await supabase.from('custom_recharge').upsert({ user_id: user.id, activities: updatedRecharge }, { onConflict: 'user_id'});
    };

    const deleteCustomRecharge = async (id: string) => {
        if(!user) return;
        const updatedRecharge = customRecharge.filter(t => t.id !== id);
        setCustomRecharge(updatedRecharge);
        await supabase.from('custom_recharge').upsert({ user_id: user.id, activities: updatedRecharge }, { onConflict: 'user_id'});
    };

    const phase = PHASES[currentPhase];

    const handleConfirmEarlyExit = () => {
        setShowEarlyExitDialog(false);
        endSession();
    };

    return (
        <div className="space-y-6">
            {showEarlyExitDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 mx-4 space-y-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-yellow-500/20 rounded-full">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">End Session Early?</h3>
                            <p className="text-gray-300 text-sm mb-1">You'll move to the Reflect phase to complete your session.</p>
                            <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                                <p className="text-xs text-gray-400">Time focused so far:</p>
                                <p className="text-2xl font-bold text-cyan-400">{Math.round((focusStartTime ? (Date.now() - focusStartTime) / 1000 - totalPauseDuration : 0) / 60)} minutes</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={handleConfirmEarlyExit}
                                className="w-full px-6 py-2 font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Yes, Reflect Now
                            </button>
                            <button
                                onClick={() => setShowEarlyExitDialog(false)}
                                className="w-full px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <SessionCompletionDialog
                isOpen={showCompletionDialog}
                sessionGoal={sessionGoal}
                actualDuration={actualDurationMinutes}
                plannedDuration={50}
                sessionStats={sessionStats}
                onStartNew={() => handleSessionComplete(true, fetchSessionHistory)}
                onDone={() => handleSessionComplete(false, fetchSessionHistory)}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Focus Timer</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                            soundEnabled
                                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={soundEnabled ? 'Sound notifications enabled' : 'Sound notifications disabled'}
                    >
                        {soundEnabled ? <VolumeIcon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
                        <span className="hidden sm:inline">Sound</span>
                    </button>
                    {currentPhase === 'PLAN' && !isActive && (
                        <button
                            onClick={resetTimer}
                            className="px-6 py-2 font-bold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 flex items-center justify-center gap-2"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Start New Session
                        </button>
                    )}
                </div>
            </div>

            <Card className="w-full text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <h2 className={`text-2xl font-bold ${phase.color}`}>{phase.name}</h2>
                    {currentPhase !== 'PLAN' && currentSessionNumber > 0 && (
                        <span className="px-3 py-1 text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full border-2 border-cyan-400 shadow-lg">
                            Today's Session #{currentSessionNumber}
                        </span>
                    )}
                </div>
                {currentPhase !== 'PLAN' && (
                    <>
                        <div className={`my-6 text-7xl md:text-8xl font-mono font-bold ${phase.color}`}>
                            {formatTime(secondsLeft)}
                        </div>
                        <div className="flex justify-center items-center space-x-4">
                            <button onClick={resetTimer} title="Reset" className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600"><RefreshCwIcon className="w-6 h-6"/></button>
                            <button onClick={toggleTimer} className="p-4 bg-cyan-500 rounded-full text-white hover:bg-cyan-600">
                                {isActive ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                            </button>
                            {currentPhase !== 'REFLECT' && (
                                <button onClick={skipToNextPhase} title="Skip to next phase" className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600">
                                    <SkipForwardIcon className="w-6 h-6"/>
                                </button>
                            )}
                        </div>
                    </>
                )}
                {currentPhase === 'FOCUS' && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowEarlyExitDialog(true)}
                            className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                        >
                            End Session Early
                        </button>
                    </div>
                )}
            </Card>

            {currentPhase === 'PLAN' && (
                <div className="space-y-6">
                    <Card>
                        <PlanStepIndicator currentStep={planStep} totalSteps={2} />

                        <h3 className="text-xl font-bold text-white mb-4">Plan & Organize (5 minutes)</h3>
                        <div className="mb-4">
                          <ExpandableGuide title="About the Focus Hour Formula" content={GUIDE_CONTENT.focusHourFormula} />
                        </div>

                        {planStep === 1 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-yellow-400 mb-2">Step 1: Set Your Goal</h4>
                                    <p className="text-sm text-gray-300 mb-3">"In the next 50 minutes, what exactly do I want to accomplish?" Write down one clear, specific goal. This trains your brain for intentionality.</p>

                                    {dailyAdventure && (
                                        <div className="p-3 mb-3 text-sm text-center rounded-md bg-gray-800 border border-cyan-500/30">
                                            <p className="text-gray-400">Today's Adventure:</p>
                                            <p className="font-semibold text-white">"{dailyAdventure}"</p>
                                            <button onClick={() => setSessionGoal(dailyAdventure)} className="px-3 py-1 mt-2 text-xs font-bold text-black bg-cyan-400 rounded-full hover:bg-cyan-300">Focus on this</button>
                                        </div>
                                    )}

                                    <input
                                        value={sessionGoal}
                                        onChange={e => setSessionGoal(e.target.value)}
                                        className="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-md focus:border-cyan-500 focus:outline-none"
                                        placeholder="e.g., Write first draft of report"
                                    />
                                    {!sessionGoal.trim() && (
                                        <p className="mt-2 text-xs text-red-400">Please enter a goal to continue</p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setPlanStep(2)}
                                        disabled={!sessionGoal.trim()}
                                        className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                                            sessionGoal.trim()
                                                ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Next: Organize Workspace
                                    </button>
                                </div>
                            </div>
                        )}

                        {planStep === 2 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-yellow-400 mb-2">Step 2: Organize Your Workspace</h4>
                                    <p className="text-sm text-gray-300 mb-4">Spend 1-2 minutes clearing your workspace. A cluttered desk leads to a cluttered mind. Remove anything you don't need.</p>

                                    <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                                        <p className="text-sm text-cyan-400 mb-3">Your Goal:</p>
                                        <p className="text-white font-medium">{sessionGoal}</p>
                                    </div>

                                    <label className="flex items-center gap-3 mt-4 p-3 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-750 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={workspaceOrganized}
                                            onChange={(e) => setWorkspaceOrganized(e.target.checked)}
                                            className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                        />
                                        <span className="text-white font-medium">I've organized my workspace</span>
                                        {workspaceOrganized && <CheckIcon className="w-5 h-5 text-green-500 ml-auto" />}
                                    </label>
                                    {!workspaceOrganized && (
                                        <p className="mt-2 text-xs text-gray-400">Check this box when you're ready to begin</p>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setPlanStep(1)}
                                        className="px-6 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={skipToNextPhase}
                                        disabled={!workspaceOrganized}
                                        className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                                            workspaceOrganized
                                                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Start Focus Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {currentPhase === 'FOCUS' && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <h3 className="font-bold text-white">Session Goal</h3>
                      <p className="p-3 mt-2 text-cyan-400 rounded-md bg-gray-900">{sessionGoal || "No goal set."}</p>

                      <h3 className="mt-4 font-bold text-white">Capture System</h3>
                      <p className="text-sm text-gray-400">Jot down distracting thoughts here.</p>
                      <div className="mt-2">
                        <AutoResizeTextarea value={capturedThoughts} onChange={setCapturedThoughts} placeholder="Capture distracting thoughts here..." minRows={4} />
                      </div>
                    </Card>
                    <Card>
                        <h3 className="font-bold text-white">Focus Toolkit</h3>
                        <div className="mt-2 space-y-2">
                          <ExpandableGuide title="About the Focus Toolkit" content={GUIDE_CONTENT.focusToolkit} />
                          <ExpandableGuide title="About Focus Disruptors" content={GUIDE_CONTENT.focusDisruptors} />
                        </div>
                        <div className="mt-2">
                          <h4 className="font-semibold text-yellow-400">Activation Menu (to start)</h4>
                          <ToolList type="activation" defaultTools={DEFAULT_TOOLS.activation} customTools={customTools.activation} onToolClick={trackToolUsage} onAddTool={addCustomTool} onDeleteTool={deleteCustomTool} toolkitUsage={sessionStats.toolkit} />
                        </div>
                         <div className="mt-4">
                          <h4 className="font-semibold text-green-400">Reactivation Menu (to refocus)</h4>
                          <ToolList type="reactivation" defaultTools={DEFAULT_TOOLS.reactivation} customTools={customTools.reactivation} onToolClick={trackToolUsage} onAddTool={addCustomTool} onDeleteTool={deleteCustomTool} toolkitUsage={sessionStats.toolkit} />
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-red-400">Focus Disruptors</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Object.keys(sessionStats.disruptors).map(key => (
                                    <button key={key} onClick={() => trackDisruptor(key as keyof FocusSessionStats['disruptors'])} className="px-2 py-1 text-xs text-white capitalize bg-red-800/50 rounded-md hover:bg-red-700/50">
                                        {key} ({sessionStats.disruptors[key as keyof FocusSessionStats['disruptors']]})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            
            {currentPhase === 'REFLECT' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-4">Reflect & Recharge</h3>
                            <div className="mb-4">
                              <ExpandableGuide title="About the Recharge Menu" content={GUIDE_CONTENT.rechargeMenu} />
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-yellow-400 mb-2">Reflect (Required):</h4>
                                    <p className="text-sm text-gray-300 mb-3">"What worked? What distracted me? What can I adjust for next time to focus better?" Small changes can make a big impact.</p>
                                    <AutoResizeTextarea value={reflection} onChange={setReflection} placeholder="Write your reflections here..." minRows={4} className="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-md focus:border-green-500 focus:outline-none" />
                                    {!reflection.trim() && (
                                        <p className="mt-2 text-xs text-red-400">Reflection is required to complete the session</p>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-green-400 mb-2">Recharge Menu (Optional):</h4>
                                    <p className="text-sm text-gray-300 mb-3">Stand up, stretch, take a walk, make some tea. Have your own "Recharge Menu".</p>
                                    <RechargeList defaultActivities={DEFAULT_RECHARGE} customActivities={customRecharge} onActivityClick={trackRechargeUsage} onAddActivity={addCustomRecharge} onDeleteActivity={deleteCustomRecharge} rechargeUsage={sessionStats.recharge} />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={endSession}
                                        disabled={!reflection.trim()}
                                        className={`w-full px-6 py-3 font-semibold rounded-lg transition-all ${
                                            reflection.trim()
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Complete Session
                                    </button>
                                    {!reflection.trim() && (
                                        <p className="mt-2 text-xs text-center text-gray-400">Please complete your reflection to finish the session</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <h3 className="font-bold text-white">Session Summary</h3>
                        <div className="mt-2 space-y-2 text-sm">
                            <h4 className="font-semibold text-red-400">Disruptors Logged:</h4>
                            {(Object.entries(sessionStats.disruptors) as [string, number][]).filter(([, val]) => val > 0).map(([key, val]) => <p key={key} className="text-gray-400"><span className="capitalize">{key}:</span> {val} times</p>)}
                            {Object.values(sessionStats.disruptors).every(v => v === 0) && <p className="text-gray-400">None. Great focus!</p>}

                            <h4 className="mt-4 font-semibold text-green-400">Toolkit Used:</h4>
                            {(Object.entries(sessionStats.toolkit) as [string, number][]).filter(([, val]) => val > 0).map(([key, val]) => <p key={key} className="text-gray-400">"{key}": {val} times</p>)}
                             {Object.values(sessionStats.toolkit).length === 0 && <p className="text-gray-400">None.</p>}
                        </div>
                    </Card>
                    </div>
                 </div>
            )}

            <HistorySection title="This Week's Focus Sessions" isLoading={historyLoading}>
                {sessionHistory.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No focus sessions this week yet. Start your first session to build momentum!</p>
                ) : (
                    <div className="space-y-6">
                        <WeeklyStats sessions={sessionHistory} />
                        <SessionHistoryGrouped sessions={sessionHistory} />
                    </div>
                )}
            </HistorySection>
        </div>
    );
};


const ToolList: React.FC<{type: 'activation'|'reactivation', defaultTools: CustomTool[], customTools: CustomTool[], onToolClick: (text: string) => void, onAddTool: (type: 'activation'|'reactivation', text: string) => void, onDeleteTool: (type: 'activation'|'reactivation', id: string) => void, toolkitUsage: Record<string, number>}> =
({type, defaultTools, customTools, onToolClick, onAddTool, onDeleteTool, toolkitUsage}) => {
    const [newToolText, setNewToolText] = useState('');
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTool(type, newToolText);
        setNewToolText('');
    };
    return (
        <div className="mt-2 space-y-2">
            {[...defaultTools, ...customTools].map(tool => (
                <div key={tool.id} className="flex items-center group">
                    <button onClick={() => onToolClick(tool.text)} className="flex-grow px-2 py-1 text-xs text-left text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition-colors">
                        <span className="flex items-center justify-between">
                            <span>- {tool.text}</span>
                            {toolkitUsage[tool.text] > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-600/70 text-white rounded-full">
                                    {toolkitUsage[tool.text]}
                                </span>
                            )}
                        </span>
                    </button>
                    {!defaultTools.find(t => t.id === tool.id) && (
                        <button onClick={() => onDeleteTool(type, tool.id)} className="ml-2 text-red-800 opacity-0 group-hover:opacity-100 hover:text-red-500">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    )}
                </div>
            ))}
            <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2">
                <input value={newToolText} onChange={e => setNewToolText(e.target.value)} type="text" placeholder="Add your own..." className="flex-grow w-full p-1 text-xs text-white bg-gray-900 border-gray-700 rounded-md"/>
                <button type="submit" className="p-1 text-white bg-cyan-800 rounded-full hover:bg-cyan-700"><PlusCircleIcon className="w-5 h-5"/></button>
            </form>
        </div>
    );
};

const RechargeList: React.FC<{defaultActivities: CustomTool[], customActivities: CustomTool[], onActivityClick: (text: string) => void, onAddActivity: (text: string) => void, onDeleteActivity: (id: string) => void, rechargeUsage: Record<string, number>}> =
({defaultActivities, customActivities, onActivityClick, onAddActivity, onDeleteActivity, rechargeUsage}) => {
    const [newActivityText, setNewActivityText] = useState('');
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAddActivity(newActivityText);
        setNewActivityText('');
    };
    return (
        <div className="mt-2 space-y-2">
            {[...defaultActivities, ...customActivities].map(activity => (
                <div key={activity.id} className="flex items-center group">
                    <button onClick={() => onActivityClick(activity.text)} className="flex-grow px-2 py-1 text-xs text-left text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition-colors">
                        <span className="flex items-center justify-between">
                            <span>- {activity.text}</span>
                            {rechargeUsage[activity.text] > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-cyan-600/70 text-white rounded-full">
                                    {rechargeUsage[activity.text]}
                                </span>
                            )}
                        </span>
                    </button>
                    {!defaultActivities.find(t => t.id === activity.id) && (
                        <button onClick={() => onDeleteActivity(activity.id)} className="ml-2 text-red-800 opacity-0 group-hover:opacity-100 hover:text-red-500">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    )}
                </div>
            ))}
            <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2">
                <input value={newActivityText} onChange={e => setNewActivityText(e.target.value)} type="text" placeholder="Add your own recharge activity..." className="flex-grow w-full p-1 text-xs text-white bg-gray-900 border-gray-700 rounded-md"/>
                <button type="submit" className="p-1 text-white bg-cyan-800 rounded-full hover:bg-cyan-700"><PlusCircleIcon className="w-5 h-5"/></button>
            </form>
        </div>
    );
};

const WeeklyStats: React.FC<{sessions: FocusSessionHistory[]}> = ({ sessions }) => {
    const completedSessions = sessions.filter(s => s.completed);
    const incompleteSessions = sessions.filter(s => !s.completed);
    const earlyExitSessions = completedSessions.filter(s => s.is_early_exit);
    const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const completionRate = sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0;
    const avgDuration = completedSessions.length > 0
        ? Math.round(totalMinutes / completedSessions.length)
        : 0;
    const totalPauseTime = completedSessions.reduce((sum, s) => sum + (s.total_pause_duration_seconds || 0), 0);
    const totalPauseMinutes = Math.floor(totalPauseTime / 60);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold text-white">{sessions.length}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                        {completedSessions.length > 0 && (
                            <span className="text-green-400">{completedSessions.length} completed</span>
                        )}
                        {incompleteSessions.length > 0 && (
                            <span className="text-yellow-400">{incompleteSessions.length} in progress</span>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Focus Time</p>
                    {completedSessions.length > 0 ? (
                        <>
                            <p className="text-2xl font-bold text-cyan-400">{totalHours}h {remainingMinutes}m</p>
                            <p className="text-xs text-gray-500 mt-1">Avg: {avgDuration} min</p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-500">-</p>
                            <p className="text-xs text-gray-500 mt-1">No completed sessions</p>
                        </>
                    )}
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
                    {earlyExitSessions.length > 0 && (
                        <p className="text-xs text-orange-400 mt-1">{earlyExitSessions.length} early exit{earlyExitSessions.length > 1 ? 's' : ''}</p>
                    )}
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Total Paused</p>
                    {completedSessions.length > 0 && totalPauseMinutes > 0 ? (
                        <>
                            <p className="text-2xl font-bold text-yellow-400">{totalPauseMinutes}m</p>
                            <p className="text-xs text-gray-500 mt-1">Avg: {Math.round(totalPauseMinutes / completedSessions.length)}m/session</p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-500">-</p>
                            <p className="text-xs text-gray-500 mt-1">No pauses recorded</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FocusTimerPage;