import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import HistorySection from '../../components/HistorySection';
import { WeeklyReviewData, IdealBlock, DailyTask, Quest, CalendarEvent } from '../../types';
import { PlusCircleIcon, SaveIcon, TrashIcon, ZapIcon, CheckCircleIcon } from '../../components/icons/Icons';
import { v4 as uuidv4 } from 'uuid';
import { useAutoSave } from '../../hooks/useAutoSave';
import useLocalStorage from '../../hooks/useLocalStorage';
import ExpandableGuide from '../../components/ExpandableGuide';
import { GUIDE_CONTENT } from '../../constants/guideContent';

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const COLORS = ['bg-red-500/70', 'bg-yellow-500/70', 'bg-green-500/70', 'bg-blue-500/70', 'bg-indigo-500/70', 'bg-purple-500/70', 'bg-pink-500/70'];

const WeeklyPlanPage: React.FC = () => {
    const { user } = useAuth();
    const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek(new Date()));
    const weekKey = weekStartDate.toISOString().split('T')[0];
    const [draft, setDraft] = useLocalStorage<{review: WeeklyReviewData, blocks: IdealBlock[], ical: string} | null>(`weekly-plan-draft-${user?.id}-${weekKey}`, null);
    const [review, setReview] = useState<WeeklyReviewData>({ week_start_date: weekKey, wins: '', challenges: '', nextWeekPriorities: [], quests_status: '', plan_adjustments: ''});
    const [idealBlocks, setIdealBlocks] = useState<IdealBlock[]>([]);
    const [icalUrl, setIcalUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [fetchingEvents, setFetchingEvents] = useState(false);
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
        const loadedReview = reviewData || { week_start_date: startDateStr, wins: '', challenges: '', nextWeekPriorities: [], quests_status: '', plan_adjustments: ''};

        // Fetch ideal week
        const { data: weekData } = await supabase.from('ideal_week').select('blocks, ical_url').eq('user_id', user.id).maybeSingle();
        const loadedBlocks = weekData?.blocks || [];
        const loadedIcal = weekData?.ical_url || '';

        if (draft && (JSON.stringify(draft.review) !== JSON.stringify(loadedReview) || JSON.stringify(draft.blocks) !== JSON.stringify(loadedBlocks))) {
            setReview(draft.review);
            setIdealBlocks(draft.blocks);
            setIcalUrl(draft.ical);
        } else {
            setReview(loadedReview);
            setIdealBlocks(loadedBlocks);
            setIcalUrl(loadedIcal);
            setDraft(null);
        }

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
            setWeeklyHistory(data || []);
        } catch (err) {
            console.error('Error fetching weekly history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, [user, weekStartDate]);

    const fetchCalendarEvents = useCallback(async () => {
        if (!icalUrl || !user) return;
        setFetchingEvents(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-ical`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ icalUrl }),
                }
            );
            const data = await response.json();
            console.log('Fetched calendar data:', data);
            if (data.events) {
                console.log(`Total events received: ${data.events.length}`);
                setCalendarEvents(data.events);
            } else if (data.error) {
                console.error('iCal fetch error:', data.error);
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            setFetchingEvents(false);
        }
    }, [icalUrl, user]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (icalUrl) {
                fetchCalendarEvents();
            } else {
                setCalendarEvents([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [icalUrl, fetchCalendarEvents]);

    useEffect(() => {
        fetchData();
        fetchWeeklyHistory();
    }, [fetchData, fetchWeeklyHistory]);

    const handleSave = useCallback(async () => {
        if (!user) return;

        // Save Review
        await supabase.from('weekly_review').upsert({ ...review, user_id: user.id }, { onConflict: 'user_id, week_start_date' });

        // Save Ideal Week
        await supabase.from('ideal_week').upsert({ user_id: user.id, blocks: idealBlocks, ical_url: icalUrl }, { onConflict: 'user_id' });

        setLastSaved(new Date());
        setDraft(null);
    }, [user, review, idealBlocks, icalUrl, setDraft]);

    const currentData = React.useMemo(() => ({
        review,
        blocks: idealBlocks,
        ical: icalUrl
    }), [review, idealBlocks, icalUrl]);

    useAutoSave(currentData, {
        onSave: handleSave,
        delay: 3000,
        enabled: !loading
    });

    useEffect(() => {
        if (!loading && user) {
            setDraft(currentData);
        }
    }, [review, idealBlocks, icalUrl, loading, user, setDraft]);

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
    
    // --- Calendar Handlers ---
    const addBlock = (day: number, startTime: number) => {
      const newBlock: IdealBlock = {
        id: uuidv4(), day, startTime, endTime: startTime + 1,
        title: 'New Block', color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      setIdealBlocks(b => [...b, newBlock]);
    };
    const updateBlock = (id: string, updatedBlock: Partial<IdealBlock>) => {
      setIdealBlocks(blocks => blocks.map(b => b.id === id ? {...b, ...updatedBlock} : b));
    };
    const deleteBlock = (id: string) => {
      setIdealBlocks(blocks => blocks.filter(b => b.id !== id));
    };

    // Convert calendar events to blocks for display
    const getCalendarEventBlocks = useCallback(() => {
        const weekEnd = new Date(weekStartDate);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const filtered = calendarEvents.filter(event => {
            const eventStart = new Date(event.start);
            const isInWeek = eventStart >= weekStartDate && eventStart < weekEnd;
            return isInWeek;
        });

        console.log(`Week: ${weekStartDate.toISOString()} to ${weekEnd.toISOString()}`);
        console.log(`Events in current week: ${filtered.length} out of ${calendarEvents.length}`);

        return filtered.map(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const dayOfWeek = eventStart.getDay();
            const day = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
            const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;

            console.log(`Event: ${event.summary}, Day: ${day}, Start: ${startHour}h, End: ${endHour}h`);

            return {
                id: `event-${event.start}`,
                day,
                startTime: startHour,
                endTime: endHour,
                title: event.summary,
                color: 'bg-orange-500/60',
                isCalendarEvent: true,
            };
        });
    }, [calendarEvents, weekStartDate]);

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
                <div className="relative w-full overflow-x-auto mt-4">
                    <div className="grid grid-cols-8" style={{minWidth: '800px'}}>
                        <div className="sticky left-0 z-10 bg-gray-800"></div>
                        {DAYS.map(day => <div key={day} className="py-2 font-bold text-center bg-gray-800 sticky top-0">{day}</div>)}
                        {HOURS.map((hour, hIndex) => (
                            <React.Fragment key={hour}>
                                <div className="sticky left-0 z-10 pr-2 text-xs text-right bg-gray-800 text-gray-400">{hour}</div>
                                {DAYS.map((_, dIndex) => (
                                    <div key={`${dIndex}-${hIndex}`} onClick={() => addBlock(dIndex, hIndex)} className="h-12 transition-colors border border-gray-700 bg-gray-900 hover:bg-gray-700"></div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                    {/* Render blocks */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{minWidth: '800px', paddingTop: '40px', paddingLeft: 'calc(100% / 8)'}}>
                        {/* Render ideal blocks */}
                        {idealBlocks.map(block => (
                            <div key={block.id} className={`absolute flex items-center justify-center p-1 text-xs text-white rounded-md shadow-lg cursor-pointer pointer-events-auto ${block.color}`}
                                style={{
                                    left: `${(block.day / 7) * 100}%`,
                                    top: `${(block.startTime / 24) * 100}%`,
                                    width: `${(1 / 7) * 100}%`,
                                    height: `${((block.endTime - block.startTime) / 24) * 100}%`
                                }}
                            >
                              <input type="text" value={block.title} onChange={e => updateBlock(block.id, {title: e.target.value})} className="w-full h-full text-xs text-center bg-transparent focus:outline-none"/>
                              <button onClick={() => deleteBlock(block.id)} className="absolute top-0 right-0 p-0.5 bg-black/30 rounded-full opacity-0 hover:opacity-100"><TrashIcon className="w-3 h-3"/></button>
                            </div>
                        ))}
                        {/* Render calendar events */}
                        {getCalendarEventBlocks().map(block => (
                            <div key={block.id} className={`absolute flex items-center justify-center p-1 text-xs text-white rounded-md shadow-lg border-2 border-orange-300 ${block.color}`}
                                style={{
                                    left: `${(block.day / 7) * 100}%`,
                                    top: `${(block.startTime / 24) * 100}%`,
                                    width: `${(1 / 7) * 100}%`,
                                    height: `${((block.endTime - block.startTime) / 24) * 100}%`
                                }}
                                title={`Calendar Event: ${block.title}`}
                            >
                              <span className="text-xs text-center truncate">{block.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-semibold">Google Calendar iCal URL (optional)</label>
                  <div className="flex gap-2">
                    <input type="url" value={icalUrl} onChange={e => setIcalUrl(e.target.value)} placeholder="Paste your secret iCal address here to sync events" className="flex-1 p-2 mt-1 text-white bg-gray-900 border-gray-700 rounded-md"/>
                    <button onClick={fetchCalendarEvents} disabled={!icalUrl || fetchingEvents} className="px-4 py-2 mt-1 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 disabled:opacity-50">
                      {fetchingEvents ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Note: This will fetch and overlay your Google Calendar events on the ideal calendar. Get your secret iCal URL from Google Calendar settings.</p>
                  {calendarEvents.length > 0 && <p className="mt-1 text-xs text-green-400">✓ {calendarEvents.length} events synced from this week</p>}
                  {icalUrl && calendarEvents.length === 0 && !fetchingEvents && <p className="mt-1 text-xs text-yellow-400">No events found for this week or invalid URL</p>}
                </div>
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