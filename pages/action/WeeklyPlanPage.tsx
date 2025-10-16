import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import HistorySection from '../../components/HistorySection';
import { WeeklyReviewData, DailyTask, Quest } from '../../types';
import { PlusCircleIcon, SaveIcon, TrashIcon, ZapIcon, CheckCircleIcon } from '../../components/icons/Icons';
import { v4 as uuidv4 } from 'uuid';
import { useAutoSave } from '../../hooks/useAutoSave';
import ExpandableGuide from '../../components/ExpandableGuide';
import { GUIDE_CONTENT } from '../../constants/guideContent';

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const WeeklyPlanPage: React.FC = () => {
    const { user } = useAuth();
    const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek(new Date()));
    const weekKey = weekStartDate.toISOString().split('T')[0];
    const [review, setReview] = useState<WeeklyReviewData>({ week_start_date: weekKey, wins: '', challenges: '', nextWeekPriorities: [], quests_status: '', plan_adjustments: ''});
    const [googleCalendarUrl, setGoogleCalendarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [weeklyHistory, setWeeklyHistory] = useState<WeeklyReviewData[]>([]);

    // For Golden Thread
    const [quests, setQuests] = useState<Quest[]>([]);
    const [showQuests, setShowQuests] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const startDateStr = weekStartDate.toISOString().split('T')[0];

        // Fetch weekly review
        const { data: reviewData } = await supabase.from('weekly_review').select('*').eq('user_id', user.id).eq('week_start_date', startDateStr).maybeSingle();
        const loadedReview = reviewData
            ? {
                ...reviewData,
                nextWeekPriorities: reviewData.nextweekpriorities || []
              }
            : { week_start_date: startDateStr, wins: '', challenges: '', nextWeekPriorities: [], quests_status: '', plan_adjustments: ''};
        setReview(loadedReview);

        // Fetch Google Calendar URL
        const { data: calendarData } = await supabase.from('ideal_week').select('ical_url').eq('user_id', user.id).maybeSingle();
        const loadedCalendarUrl = calendarData?.ical_url || '';
        setGoogleCalendarUrl(loadedCalendarUrl);

        // Fetch quests for Golden Thread
        const { data: questsData } = await supabase.from('quests').select('*').eq('user_id', user.id).eq('completed', false);
        if (questsData) setQuests(questsData);

        setLoading(false);
    }, [user, weekStartDate]);

    const fetchWeeklyHistory = useCallback(async () => {
        if (!user) return;
        setHistoryLoading(true);
        try {
            const currentWeekStart = weekStartDate.toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('weekly_review')
                .select('*')
                .eq('user_id', user.id)
                .neq('week_start_date', currentWeekStart)
                .order('week_start_date', { ascending: false })
                .limit(12);
            if (error) throw error;
            const mappedHistory = (data || []).map(item => ({
                ...item,
                nextWeekPriorities: item.nextweekpriorities || []
            }));
            setWeeklyHistory(mappedHistory);
        } catch (err) {
            console.error('Error fetching weekly history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, [user, weekStartDate]);


    useEffect(() => {
        fetchData();
        fetchWeeklyHistory();
    }, [fetchData, fetchWeeklyHistory]);

    const handleSave = useCallback(async () => {
        if (!user) return;

        try {
            // Save Review
            const reviewToSave = {
                user_id: user.id,
                week_start_date: review.week_start_date,
                wins: review.wins,
                challenges: review.challenges,
                nextweekpriorities: review.nextWeekPriorities,
                quests_status: review.quests_status,
                plan_adjustments: review.plan_adjustments
            };
            const { error: reviewError } = await supabase
                .from('weekly_review')
                .upsert(reviewToSave, { onConflict: 'user_id, week_start_date' });

            if (reviewError) {
                console.error('Error saving weekly review:', reviewError);
                throw reviewError;
            }

            // Save Google Calendar URL
            const { error: calendarError } = await supabase
                .from('ideal_week')
                .upsert({ user_id: user.id, ical_url: googleCalendarUrl }, { onConflict: 'user_id' });

            if (calendarError) {
                console.error('Error saving calendar URL:', calendarError);
                throw calendarError;
            }

            setLastSaved(new Date());
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [user, review, googleCalendarUrl]);

    const currentData = React.useMemo(() => ({
        review,
        googleCalendarUrl
    }), [review, googleCalendarUrl]);

    useAutoSave(currentData, {
        onSave: handleSave,
        delay: 1000,
        enabled: !loading
    });

    const handleReviewChange = (field: keyof Omit<WeeklyReviewData, 'nextWeekPriorities'>, value: string) => {
        setReview(r => ({ ...r, [field]: value }));
    };

    // --- Priorities Handlers ---
    const addPriority = (text: string) => {
      if(!text.trim()) return;
      const newPriority: DailyTask = { id: uuidv4(), text, completed: false };
      setReview(r => ({...r, nextWeekPriorities: [...r.nextWeekPriorities, newPriority]}));
    };
    const togglePriority = (id: string) => {
      setReview(r => ({...r, nextWeekPriorities: r.nextWeekPriorities.map(p => p.id === id ? {...p, completed: !p.completed} : p)}));
    };
    const deletePriority = (id: string) => {
       setReview(r => ({...r, nextWeekPriorities: r.nextWeekPriorities.filter(p => p.id !== id)}));
    };
    const addPriorityFromQuest = (questTitle: string) => {
      addPriority(questTitle);
      setShowQuests(false);
    }

    if (loading) return <div className="text-center p-8">Loading your weekly plan...</div>;
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Weekly Plan</h1>
                <p className="mt-2 text-gray-400">Plan for {weekStartDate.toLocaleDateString()} - {new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                {lastSaved && (
                  <span className="text-xs text-gray-400">
                    Auto-saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <button onClick={handleSave} className="flex items-center justify-center px-4 py-2 font-bold text-white bg-cyan-500 rounded-md hover:bg-cyan-600">
                    <SaveIcon className="w-5 h-5 mr-2" /> Save Now
                </button>
              </div>
            </div>
            
            <Card>
                <h2 className="text-xl font-bold">Weekly Review</h2>
                <div className="mt-3">
                  <ExpandableGuide title="About the Weekly Review" content={GUIDE_CONTENT.weeklyReview} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <div><label className="font-semibold">Wins & Accomplishments</label><textarea value={review.wins} onChange={e => handleReviewChange('wins', e.target.value)} rows={4} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                    <div><label className="font-semibold">Challenges & Lessons</label><textarea value={review.challenges} onChange={e => handleReviewChange('challenges', e.target.value)} rows={4} className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/></div>
                    <div className="relative">
                        <label className="font-semibold">Top 3-5 Priorities for Next Week</label>
                        <button onClick={() => setShowQuests(!showQuests)} title="Link from Quests" className="ml-2 p-1 text-cyan-400 hover:bg-cyan-500/20 rounded-full inline-block"><ZapIcon className="w-4 h-4"/></button>
                        <PriorityList priorities={review.nextWeekPriorities} onAdd={addPriority} onToggle={togglePriority} onDelete={deletePriority} />
                        {showQuests && (
                            <div className="absolute z-10 w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                                <h4 className="text-xs font-bold text-gray-400">Active Quests</h4>
                                {quests.length > 0 ? quests.map(q => (
                                    <button key={q.id} onClick={() => addPriorityFromQuest(q.title)} className="block w-full px-2 py-1 mt-1 text-sm text-left text-white rounded-md hover:bg-gray-700">
                                      <span className="font-semibold capitalize text-cyan-400">[{q.category}]</span> {q.title}
                                    </button>
                                )) : <p className="text-xs text-gray-400">No active quests.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold">Ideal Week Calendar</h2>
                <div className="mt-3">
                  <ExpandableGuide title="About the Ideal Week Calendar" content={GUIDE_CONTENT.idealWeekCalendar} />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-semibold">Google Calendar Embed URL</label>
                  <input
                    type="url"
                    value={googleCalendarUrl}
                    onChange={e => setGoogleCalendarUrl(e.target.value)}
                    placeholder="Paste your Google Calendar embed URL here"
                    className="w-full p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    To get the embed URL: Go to Google Calendar → Settings → Select your calendar → Integrate calendar → Copy the iframe src URL (the part inside src="...").
                  </p>
                </div>
                {googleCalendarUrl && (
                  <div className="mt-4 w-full h-[500px] md:h-[700px] lg:h-[800px]">
                    <iframe
                      src={googleCalendarUrl}
                      style={{ border: 0 }}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      className="rounded-md"
                    />
                  </div>
                )}
                {!googleCalendarUrl && (
                  <div className="mt-4 p-8 bg-gray-900 rounded-md text-center text-gray-400">
                    <p>Enter your Google Calendar embed URL above to display your calendar here.</p>
                  </div>
                )}
            </Card>

            <HistorySection title="Weekly Review History" isLoading={historyLoading}>
                {weeklyHistory.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No previous weekly reviews yet. Complete your first weekly review to see history here!</p>
                ) : (
                    <div className="space-y-4">
                        {weeklyHistory.map(week => {
                            const startDate = new Date(week.week_start_date);
                            const endDate = new Date(startDate);
                            endDate.setDate(endDate.getDate() + 6);
                            return (
                                <Card key={week.id} className="bg-gray-800/30">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-white">
                                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {week.wins && (
                                            <div className="p-3 bg-gray-900 rounded-md">
                                                <p className="text-xs font-semibold text-green-400 mb-1">Wins & Accomplishments:</p>
                                                <p className="text-sm text-gray-300">{week.wins}</p>
                                            </div>
                                        )}

                                        {week.challenges && (
                                            <div className="p-3 bg-gray-900 rounded-md">
                                                <p className="text-xs font-semibold text-yellow-400 mb-1">Challenges & Lessons:</p>
                                                <p className="text-sm text-gray-300">{week.challenges}</p>
                                            </div>
                                        )}
                                    </div>

                                    {week.nextWeekPriorities && week.nextWeekPriorities.length > 0 && (
                                        <div className="mt-3 p-3 bg-gray-900 rounded-md">
                                            <p className="text-xs font-semibold text-cyan-400 mb-2">Priorities Set:</p>
                                            <div className="space-y-1">
                                                {week.nextWeekPriorities.map((priority: DailyTask) => (
                                                    <div key={priority.id} className="flex items-center text-sm">
                                                        <CheckCircleIcon className={`w-4 h-4 mr-2 ${priority.completed ? 'text-green-500' : 'text-gray-600'}`} />
                                                        <span className={priority.completed ? 'line-through text-gray-500' : 'text-gray-300'}>{priority.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </HistorySection>
        </div>
    );
};


const PriorityList: React.FC<{priorities: DailyTask[], onAdd: (text: string) => void, onToggle: (id: string) => void, onDelete: (id: string) => void}> = 
({priorities, onAdd, onToggle, onDelete}) => {
  const [newPriority, setNewPriority] = useState('');
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newPriority);
    setNewPriority('');
  }
  return (
    <div className="mt-1">
      <form onSubmit={handleAdd} className="flex items-center space-x-2">
        <input type="text" value={newPriority} onChange={e => setNewPriority(e.target.value)} placeholder="New priority..." className="w-full p-1 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <button type="submit"><PlusCircleIcon className="w-6 h-6 text-cyan-400 hover:text-cyan-300"/></button>
      </form>
      <div className="mt-2 space-y-1">
        {priorities.map(p => (
          <div key={p.id} className="flex items-center group">
            <button onClick={() => onToggle(p.id)}><CheckCircleIcon className={`w-5 h-5 mr-2 ${p.completed ? 'text-green-500' : 'text-gray-600'}`}/></button>
            <span className={`flex-grow text-sm ${p.completed ? 'line-through text-gray-500' : ''}`}>{p.text}</span>
            <button onClick={() => onDelete(p.id)} className="opacity-0 group-hover:opacity-100"><TrashIcon className="w-4 h-4 text-red-700 hover:text-red-500"/></button>
          </div>
        ))}
      </div>
    </div>
  )
}


export default WeeklyPlanPage;