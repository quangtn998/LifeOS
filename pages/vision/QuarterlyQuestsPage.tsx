import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Quest } from '../../types';
import Card from '../../components/Card';
import HistorySection from '../../components/HistorySection';
import { PlusCircleIcon, TrashIcon, CheckCircleIcon, EditIcon, SaveIcon } from '../../components/icons/Icons';

const QuarterlyQuestsPage: React.FC = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestCategory, setNewQuestCategory] = useState<'work' | 'life'>('work');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setQuests(data?.map(q => ({...q, editing: false})) || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [user]);

  const fetchCompletedQuests = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      setCompletedQuests(data || []);
    } catch (err: any) { setError(err.message); }
    finally { setHistoryLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchQuests();
    fetchCompletedQuests();
  }, [fetchQuests, fetchCompletedQuests]);

  const addQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim() || !user) return;
    
    const isMainQuest = quests.filter(q => q.category === newQuestCategory && q.type === 'main').length === 0;

    try {
      const { data, error } = await supabase
        .from('quests')
        .insert({ 
            title: newQuestTitle, 
            user_id: user.id, 
            category: newQuestCategory,
            type: isMainQuest ? 'main' : 'side',
            completed: false
        })
        .select()
        .single();
      if (error) throw error;
      setQuests(prev => [...prev, {...data, editing: false}]);
      setNewQuestTitle('');
    } catch (err: any) { setError(err.message); }
  };

  const toggleQuest = async (id: string, completed: boolean) => {
    try {
      const updateData: any = { completed: !completed };
      if (!completed) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
      const { data, error } = await supabase.from('quests').update(updateData).eq('id', id).select().single();
      if (error) throw error;

      if (!completed) {
        setQuests(quests.filter(q => q.id !== id));
        setCompletedQuests([data, ...completedQuests]);
      } else {
        setCompletedQuests(completedQuests.filter(q => q.id !== id));
        setQuests([...quests, {...data, editing: false}]);
      }
    } catch (err: any) { setError(err.message); }
  };
  
  const updateQuestTitle = async (id: string, title: string) => {
    try {
      const { data, error } = await supabase.from('quests').update({ title }).eq('id', id).select().single();
      if (error) throw error;
      setQuests(quests.map(q => q.id === id ? {...data, editing: false} : q));
    } catch (err: any) { setError(err.message); }
  };

  const deleteQuest = async (id: string) => {
    try {
      const { error } = await supabase.from('quests').delete().eq('id', id);
      if (error) throw error;
      setQuests(quests.filter(q => q.id !== id));
    } catch (err: any) { setError(err.message); }
  };

  const toggleEditing = (id: string) => {
    setQuests(quests.map(q => q.id === id ? { ...q, editing: !q.editing } : q));
  };
  
  const handleTitleChange = (id: string, newTitle: string) => {
    setQuests(quests.map(q => q.id === id ? { ...q, title: newTitle } : q));
  };


  const renderQuestList = (category: 'work' | 'life') => {
    const mainQuest = quests.find(q => q.category === category && q.type === 'main');
    const sideQuests = quests.filter(q => q.category === category && q.type === 'side');

    return (
      <Card>
        <h2 className="text-xl font-bold text-white capitalize">{category} Quests</h2>
        <div className="mt-4 space-y-2">
            {mainQuest ? (
                <QuestItem quest={mainQuest} onToggle={toggleQuest} onDelete={deleteQuest} onEdit={toggleEditing} onTitleChange={handleTitleChange} onSave={updateQuestTitle} isMain />
            ) : <p className="text-sm text-gray-400">No main quest. The next quest added here will be the main one.</p>}
        </div>
        <div className="mt-4 space-y-2">
            {sideQuests.map(quest => (
                <QuestItem key={quest.id} quest={quest} onToggle={toggleQuest} onDelete={deleteQuest} onEdit={toggleEditing} onTitleChange={handleTitleChange} onSave={updateQuestTitle} />
            ))}
        </div>
      </Card>
    );
  };
  
  if (loading) return <div className="text-center p-8">Loading quests...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Quarterly Quests</h1>
      <p className="text-gray-400 max-w-3xl">This is the bridge between Vision and Action. Define one Main Quest and several Side Quests for Work and Life.</p>
      
      {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md">Error: {error}</p>}
      
      <Card>
        <form onSubmit={addQuest} className="flex flex-col gap-3 sm:flex-row">
          <input 
            type="text" value={newQuestTitle} onChange={(e) => setNewQuestTitle(e.target.value)}
            placeholder="Add a new quest..."
            className="flex-grow p-2 text-white bg-gray-900 border-gray-700 rounded-md"
          />
          <select value={newQuestCategory} onChange={(e) => setNewQuestCategory(e.target.value as 'work'|'life')} className="p-2 text-white bg-gray-900 border-gray-700 rounded-md">
            <option value="work">Work</option>
            <option value="life">Life</option>
          </select>
          <button type="submit" className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600">
            <PlusCircleIcon className="w-5 h-5 mr-2"/> Add Quest
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {renderQuestList('work')}
        {renderQuestList('life')}
      </div>

      <HistorySection title="Completed Quests History" isLoading={historyLoading}>
        {completedQuests.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No completed quests yet. Keep working on your goals!</p>
        ) : (
          <div className="space-y-4">
            {['work', 'life'].map(category => {
              const categoryQuests = completedQuests.filter(q => q.category === category);
              if (categoryQuests.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-lg font-bold text-cyan-400 capitalize mb-2">{category} Quests</h3>
                  <div className="space-y-2">
                    {categoryQuests.map(quest => (
                      <div key={quest.id} className="flex items-center p-3 rounded-md bg-gray-800/50">
                        <button onClick={() => toggleQuest(quest.id, quest.completed)} className="mr-3 flex-shrink-0">
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        </button>
                        <div className="flex-grow">
                          <span className="text-white line-through">
                            {quest.type === 'main' && <span className="font-bold text-cyan-400">[MAIN] </span>}
                            {quest.title}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            Completed: {quest.completed_at ? new Date(quest.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                        <button onClick={() => deleteQuest(quest.id)} className="text-gray-400 hover:text-red-500 ml-3">
                          <TrashIcon className="w-5 h-5"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </HistorySection>
    </div>
  );
};

const QuestItem: React.FC<{quest: Quest, onToggle: Function, onDelete: Function, onEdit: Function, onTitleChange: Function, onSave: Function, isMain?: boolean}> = 
({ quest, onToggle, onDelete, onEdit, onTitleChange, onSave, isMain }) => (
    <div className={`flex items-center p-3 rounded-md transition-colors ${isMain ? 'bg-cyan-500/10' : 'bg-gray-800/50'}`}>
      <button onClick={() => onToggle(quest.id, quest.completed)} className="mr-3 flex-shrink-0">
        {quest.completed ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <div className="w-6 h-6 border-2 border-gray-500 rounded-full transition-colors hover:border-cyan-400"></div>}
      </button>

      {quest.editing ? (
        <input type="text" value={quest.title} onChange={e => onTitleChange(quest.id, e.target.value)} className="flex-grow text-white bg-gray-700 p-1 rounded-md"/>
      ) : (
        <span className={`flex-grow ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
          {isMain && <span className="font-bold text-cyan-400">[MAIN] </span>}
          {quest.title}
        </span>
      )}
      
      <div className="flex items-center flex-shrink-0 ml-3 space-x-2">
        {quest.editing ? (
            <button onClick={() => onSave(quest.id, quest.title)} className="text-gray-400 hover:text-green-500"><SaveIcon className="w-5 h-5"/></button>
        ) : (
            <button onClick={() => onEdit(quest.id)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
        )}
        <button onClick={() => onDelete(quest.id)} className="text-gray-400 hover:text-red-500">
          <TrashIcon className="w-5 h-5"/>
        </button>
      </div>
    </div>
);


export default QuarterlyQuestsPage;