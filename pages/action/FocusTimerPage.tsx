import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusTimer } from '../../contexts/FocusTimerContext';
import Card from '../../components/Card';
import { PlayIcon, PauseIcon, RefreshCwIcon, PlusCircleIcon, TrashIcon } from '../../components/icons/Icons';
import { CustomTool, DailyPlan } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const PHASES = {
  PLAN: { name: 'PLAN & ORGANIZE', color: 'text-yellow-400' },
  FOCUS: { name: 'FOCUS', color: 'text-cyan-400' },
  REFLECT: { name: 'REFLECT & RECHARGE', color: 'text-green-400' },
};

const DEFAULT_TOOLS = {
  activation: [{id: 'd1', text: 'Listen to favorite music'}, {id: 'd2', text: '3-minute breathing'}, {id: 'd3', text: 'Do a super easy admin task'}],
  reactivation: [{id: 'd4', text: '60-second stretch/jump'}, {id: 'd5', text: 'Change music/scenery'}, {id: 'd6', text: 'Move phone to another room'}]
};

const FocusTimerPage: React.FC = () => {
    const { user } = useAuth();
    const {
        secondsLeft,
        isActive,
        currentPhase,
        sessionGoal,
        sessionStats,
        capturedThoughts,
        reflection,
        setSessionGoal,
        setCapturedThoughts,
        setReflection,
        toggleTimer,
        resetTimer,
        trackDisruptor,
        trackToolUsage,
        formatTime,
    } = useFocusTimer();

    const [dailyAdventure, setDailyAdventure] = useState<string | null>(null);
    const [customTools, setCustomTools] = useState<{activation: CustomTool[], reactivation: CustomTool[]}>({activation: [], reactivation: []});

    const fetchData = useCallback(async () => {
        if (!user) return;
        const { data: toolsData } = await supabase.from('custom_tools').select('*').eq('user_id', user.id).single();
        if (toolsData) {
            setCustomTools({
                activation: toolsData.activation || [],
                reactivation: toolsData.reactivation || [],
            });
        }
        const today = new Date().toISOString().split('T')[0];
        const { data: planData } = await supabase.from('daily_plan').select('manifesto').eq('user_id', user.id).eq('date', today).single();
        if (planData) {
            setDailyAdventure((planData.manifesto as DailyPlan['manifesto'])?.adventure || null);
        }
        const { data: sessionData } = await supabase.from('focus_sessions').select('goal').eq('user_id', user.id).eq('date', today).maybeSingle();
        if (sessionData?.goal) {
            setSessionGoal(sessionData.goal);
        }
    }, [user, setSessionGoal]);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const phase = PHASES[currentPhase];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Focus Timer</h1>

            <Card className="w-full text-center">
                <h2 className={`text-2xl font-bold ${phase.color}`}>{phase.name}</h2>
                <div className={`my-6 text-7xl md:text-8xl font-mono font-bold ${phase.color}`}>
                    {formatTime(secondsLeft)}
                </div>
                <div className="flex justify-center space-x-4">
                    <button onClick={resetTimer} title="Reset" className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600"><RefreshCwIcon className="w-6 h-6"/></button>
                    <button onClick={toggleTimer} className="p-4 bg-cyan-500 rounded-full text-white hover:bg-cyan-600">
                        {isActive ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                    </button>
                </div>
            </Card>

            {currentPhase === 'PLAN' && (
                <Card>
                    <h3 className="font-bold text-white">What is your single focus for the next 50 minutes?</h3>
                    {dailyAdventure && (
                      <div className="p-3 my-3 text-sm text-center rounded-md bg-gray-900">
                        <p className="text-gray-400">Today's Adventure:</p>
                        <p className="font-semibold text-white">"{dailyAdventure}"</p>
                        <button onClick={() => setSessionGoal(dailyAdventure)} className="px-2 py-1 mt-2 text-xs font-bold text-black bg-cyan-400 rounded-full hover:bg-cyan-300">Focus on this</button>
                      </div>
                    )}
                    <input value={sessionGoal} onChange={e => setSessionGoal(e.target.value)} className="w-full p-2 mt-2 text-white bg-gray-900 border-gray-700 rounded-md" placeholder="e.g., Write first draft of report"/>
                </Card>
            )}

            {currentPhase === 'FOCUS' && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <h3 className="font-bold text-white">Session Goal</h3>
                      <p className="p-3 mt-2 text-cyan-400 rounded-md bg-gray-900">{sessionGoal || "No goal set."}</p>
                      
                      <h3 className="mt-4 font-bold text-white">Capture System</h3>
                      <p className="text-sm text-gray-400">Jot down distracting thoughts here.</p>
                      <textarea value={capturedThoughts} onChange={e => setCapturedThoughts(e.target.value)} rows={4} className="w-full p-2 mt-2 text-white bg-gray-900 border-gray-700 rounded-md"/>
                    </Card>
                    <Card>
                        <h3 className="font-bold text-white">Focus Toolkit</h3>
                        <div className="mt-2">
                          <h4 className="font-semibold text-yellow-400">Activation Menu (to start)</h4>
                          <ToolList type="activation" defaultTools={DEFAULT_TOOLS.activation} customTools={customTools.activation} onToolClick={trackToolUsage} onAddTool={addCustomTool} onDeleteTool={deleteCustomTool} />
                        </div>
                         <div className="mt-4">
                          <h4 className="font-semibold text-green-400">Reactivation Menu (to refocus)</h4>
                          <ToolList type="reactivation" defaultTools={DEFAULT_TOOLS.reactivation} customTools={customTools.reactivation} onToolClick={trackToolUsage} onAddTool={addCustomTool} onDeleteTool={deleteCustomTool} />
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
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <h3 className="font-bold text-white">Session Summary</h3>
                        <div className="mt-2 space-y-2 text-sm">
                            <h4 className="font-semibold text-red-400">Disruptors Logged:</h4>
                            {/* FIX: Cast result of Object.entries to resolve type inference issue. */}
                            {(Object.entries(sessionStats.disruptors) as [string, number][]).filter(([, val]) => val > 0).map(([key, val]) => <p key={key} className="text-gray-400"><span className="capitalize">{key}:</span> {val} times</p>)}
                            {Object.values(sessionStats.disruptors).every(v => v === 0) && <p className="text-gray-400">None. Great focus!</p>}
                            
                            <h4 className="mt-4 font-semibold text-green-400">Toolkit Used:</h4>
                            {/* FIX: Cast result of Object.entries to resolve type inference issue. */}
                            {(Object.entries(sessionStats.toolkit) as [string, number][]).filter(([, val]) => val > 0).map(([key, val]) => <p key={key} className="text-gray-400">"{key}": {val} times</p>)}
                             {Object.values(sessionStats.toolkit).length === 0 && <p className="text-gray-400">None.</p>}
                        </div>
                    </Card>
                     <Card>
                        <h3 className="font-bold text-white">Reflection</h3>
                        <p className="text-sm text-gray-400">What went well? What was distracting? What can you improve?</p>
                        <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={5} className="w-full p-2 mt-2 text-white bg-gray-900 border-gray-700 rounded-md"/>
                    </Card>
                 </div>
            )}

        </div>
    );
};


const ToolList: React.FC<{type: 'activation'|'reactivation', defaultTools: CustomTool[], customTools: CustomTool[], onToolClick: (text: string) => void, onAddTool: (type: 'activation'|'reactivation', text: string) => void, onDeleteTool: (type: 'activation'|'reactivation', id: string) => void}> = 
({type, defaultTools, customTools, onToolClick, onAddTool, onDeleteTool}) => {
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
                    <button onClick={() => onToolClick(tool.text)} className="flex-grow px-2 py-1 text-xs text-left text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50">
                        - {tool.text}
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

export default FocusTimerPage;