import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Quest, FocusLogData } from '../types';
import { ZapIcon, ClockIcon } from '../components/icons/Icons';
import FocusHeatmap from '../components/FocusHeatmap';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [mainQuests, setMainQuests] = useState<Quest[]>([]);
  const [focusLog, setFocusLog] = useState<FocusLogData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch main quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'main')
        .eq('completed', false);

      setMainQuests(questsData || []);

      // Fetch focus log
      const { data: focusLogData } = await supabase
        .from('focus_log')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      setFocusLog(focusLogData?.data || {});

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
  }).reverse();

  const focusChartData = last7Days.map(date => ({
      date,
      minutes: focusLog[date] || 0
  }));

  const maxMinutes = Math.max(...focusChartData.map(d => d.minutes), 60);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">
        Welcome back, {user?.email?.split('@')[0] || 'User'}!
      </h1>
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
            <Card>
                <h2 className="flex items-center text-xl font-bold text-white"><ZapIcon className="w-5 h-5 mr-2 text-cyan-400"/> Your Main Quests</h2>
                <p className="mt-2 text-gray-400">Your primary focus for this quarter. Make them count.</p>
                <div className="mt-4 space-y-3">
                    {loading ? (
                        <p className="text-gray-400">Loading quests...</p>
                    ) : mainQuests.length > 0 ? (
                        mainQuests.map(quest => (
                            <div key={quest.id} className="p-3 rounded-md bg-cyan-500/10">
                                <span className="font-semibold capitalize text-cyan-400">{quest.category}: </span>
                                <span className="text-white">{quest.title}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No active main quests. <Link to="/vision/quarterly-quests" className="text-cyan-400 hover:underline">Set one now!</Link></p>
                    )}
                </div>
            </Card>
            <Card>
                <h2 className="flex items-center text-xl font-bold text-white"><ClockIcon className="w-5 h-5 mr-2 text-green-400"/> 7-Day Focus Log</h2>
                <p className="mt-2 text-gray-400">Your deep work consistency over the last week.</p>
                <div className="mt-4 h-48 flex items-end justify-between gap-2">
                    {loading ? <p className="text-gray-400">Loading log...</p> : focusChartData.map(item => (
                        <div key={item.date} className="flex flex-col items-center flex-1 h-full">
                           <div className="w-full h-full flex items-end">
                             <div 
                                className="w-full bg-green-400 rounded-t-sm" 
                                style={{ height: `${(item.minutes / maxMinutes) * 100}%`}}
                                title={`${item.minutes} minutes`}
                              ></div>
                           </div>
                           <span className="mt-1 text-xs text-gray-400">{new Date(item.date).getDate()}</span>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h2 className="flex items-center text-xl font-bold text-white">
                  <ClockIcon className="w-5 h-5 mr-2 text-green-400"/> Annual Focus Activity
                </h2>
                <p className="mt-2 text-gray-400">Your deep work consistency over the past year. Each cell represents a day.</p>
                <div className="mt-4">
                  <FocusHeatmap />
                </div>
            </Card>
        </div>
        <div className="space-y-6 xl:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-white">Quick Links</h2>
            <div className="mt-4 space-y-2">
              <Link to="/vision/life-compass" className="block text-cyan-400 hover:underline">Define Vision</Link>
              <Link to="/vision/quarterly-quests" className="block text-cyan-400 hover:underline">Plan Quests</Link>
              <Link to="/action/daily-plan" className="block text-cyan-400 hover:underline">Plan Your Day</Link>
              <Link to="/action/focus-timer" className="block text-cyan-400 hover:underline">Start Focusing</Link>
              <Link to="/learn" className="block text-cyan-400 hover:underline">Learn the Framework</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;