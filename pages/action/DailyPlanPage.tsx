import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import { PlusCircleIcon, TrashIcon, CheckCircleIcon, ZapIcon } from '../../components/icons/Icons';
import { DailyPlan, DailyTask, WeeklyReviewData } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { useAutoSave } from '../../hooks/useAutoSave';
import useLocalStorage from '../../hooks/useLocalStorage';

const getToday = () => new Date().toISOString().split('T')[0];

const DailyPlanPage: React.FC = () => {
    const { user } = useAuth();
    const [draft, setDraft] = useLocalStorage<DailyPlan | null>(`daily-plan-draft-${user?.id}-${getToday()}`, null);
    const [plan, setPlan] = useState<DailyPlan>({
        date: getToday(),
        manifesto: { feeling: '', gratitude: '', adventure: '' },
        tasks: [],
        shutdown: { accomplished: '', learned: '', tomorrow: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // For Golden Thread
    const [weeklyPriorities, setWeeklyPriorities] = useState<DailyTask[]>([]);
    const [showPriorities, setShowPriorities] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const today = getToday();

        // Fetch today's plan
        const { data, error } = await supabase
            .from('daily_plan')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        const loadedData = data || { date: today, manifesto: { feeling: '', gratitude: '', adventure: '' }, tasks: [], shutdown: { accomplished: '', learned: '', tomorrow: '' } };

        if (draft && JSON.stringify(draft) !== JSON.stringify(loadedData)) {
            setPlan(draft);
        } else {
            setPlan(loadedData);
            setDraft(null);
        }
        
        // Fetch weekly priorities for Golden Thread
        const weekStartDate = getStartOfWeek(new Date()).toISOString().split('T')[0];
        const { data: reviewData } = await supabase.from('weekly_review').select('nextWeekPriorities').eq('user_id', user.id).eq('week_start_date', weekStartDate).single();
        if(reviewData) {
            setWeeklyPriorities(reviewData.nextWeekPriorities || []);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = useCallback(async () => {
      if (!user) return;
      setSaving(true);
      const { error } = await supabase
        .from('daily_plan')
        .upsert({ ...plan, user_id: user.id }, { onConflict: 'user_id, date' });
      if (error) console.error("Save error:", error);
      else {
        setLastSaved(new Date());
        setDraft(null);
      }
      setSaving(false);
    }, [user, plan, setDraft]);

    useAutoSave(plan, {
        onSave: handleSave,
        delay: 2000,
        enabled: !loading
    });

    useEffect(() => {
        if (!loading && user) {
            setDraft(plan);
        }
    }, [plan, loading, user, setDraft]);

    const handleManifestoChange = (field: keyof DailyPlan['manifesto'], value: string) => {
        setPlan(p => ({ ...p, manifesto: { ...p.manifesto, [field]: value } }));
    };
    const handleShutdownChange = (field: keyof DailyPlan['shutdown'], value: string) => {
        setPlan(p => ({ ...p, shutdown: { ...p.shutdown, [field]: value } }));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask: DailyTask = { id: uuidv4(), text: newTaskText, completed: false };
        setPlan(p => ({ ...p, tasks: [...p.tasks, newTask] }));
        setNewTaskText('');
    };

    const toggleTask = (id: string) => {
        setPlan(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
    };

    const deleteTask = (id: string) => {
        setPlan(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) }));
    };
    
    const setAdventureFromPriority = (priorityText: string) => {
        handleManifestoChange('adventure', priorityText);
        setShowPriorities(false);
    };

    if (loading) return <div className="text-center p-8">Loading your daily plan...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-white">Daily Plan for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h1>
                {lastSaved && (
                    <span className="text-sm text-gray-400 mt-2 md:mt-0">
                        Auto-saved {lastSaved.toLocaleTimeString()}
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-white">Morning Manifesto</h2>
                    <div className="mt-4 space-y-3">
                        <div><label className="text-sm font-medium text-gray-400">How am I feeling?</label><input type="text" value={plan.manifesto.feeling} onChange={e => handleManifestoChange('feeling', e.target.value)} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                        <div><label className="text-sm font-medium text-gray-400">What am I grateful for?</label><input type="text" value={plan.manifesto.gratitude} onChange={e => handleManifestoChange('gratitude', e.target.value)} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-400">What is my adventure today? (MIT)</label>
                            <div className="flex items-center">
                                <input type="text" value={plan.manifesto.adventure} onChange={e => handleManifestoChange('adventure', e.target.value)} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/>
                                <button onClick={() => setShowPriorities(!showPriorities)} title="Link from Weekly Priorities" className="ml-2 p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-full"><ZapIcon className="w-5 h-5"/></button>
                            </div>
                            {showPriorities && (
                                <div className="absolute z-10 w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                                    <h4 className="text-xs font-bold text-gray-400">Weekly Priorities</h4>
                                    {weeklyPriorities.length > 0 ? weeklyPriorities.map(p => (
                                        <button key={p.id} onClick={() => setAdventureFromPriority(p.text)} className="block w-full px-2 py-1 mt-1 text-sm text-left text-white rounded-md hover:bg-gray-700">{p.text}</button>
                                    )) : <p className="text-xs text-gray-400">No weekly priorities set.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-white">Focus Tasks</h2>
                    <form onSubmit={addTask} className="flex items-center mt-4 space-x-2">
                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a focus task..." className="flex-grow p-2 text-white bg-gray-900 border-gray-700 rounded-md"/>
                        <button type="submit" className="p-2 text-white bg-cyan-500 rounded-full hover:bg-cyan-600"><PlusCircleIcon className="w-6 h-6"/></button>
                    </form>
                    <div className="mt-4 space-y-2">
                        {plan.tasks.map(task => (
                            <div key={task.id} className="flex items-center p-2 rounded-md bg-gray-800/50">
                                <button onClick={() => toggleTask(task.id)} className="mr-3"><CheckCircleIcon className={`w-6 h-6 ${task.completed ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`} /></button>
                                <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>{task.text}</span>
                                <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        {plan.tasks.length === 0 && <p className="text-sm text-center text-gray-400 py-4">No tasks yet.</p>}
                    </div>
                </Card>
                
                <Card className="lg:col-span-3">
                    <h2 className="text-xl font-bold text-white">Evening Shutdown</h2>
                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
                        <div><label className="text-sm font-medium text-gray-400">What did I accomplish?</label><textarea value={plan.shutdown.accomplished} onChange={e => handleShutdownChange('accomplished', e.target.value)} rows={4} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                        <div><label className="text-sm font-medium text-gray-400">What did I learn?</label><textarea value={plan.shutdown.learned} onChange={e => handleShutdownChange('learned', e.target.value)} rows={4} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                        <div><label className="text-sm font-medium text-gray-400">What's the plan for tomorrow?</label><textarea value={plan.shutdown.tomorrow} onChange={e => handleShutdownChange('tomorrow', e.target.value)} rows={4} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}


export default DailyPlanPage;