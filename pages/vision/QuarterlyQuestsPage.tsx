import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Quest, QuarterData } from '../../types';
import Card from '../../components/Card';
import { PlusCircleIcon, TrashIcon, CheckCircleIcon, EditIcon, SaveIcon, ChevronDownIcon, ChevronUpIcon } from '../../components/icons/Icons';
import ExpandableGuide from '../../components/ExpandableGuide';
import { GUIDE_CONTENT } from '../../constants/guideContent';
import QuarterHistory from '../../components/QuarterHistory';
import QuarterlyAssessmentSection from '../../components/QuarterlyAssessmentSection';
import { getCurrentQuarter, isPastQuarter } from '../../utils/quarterUtils';

const QuarterlyQuestsPage: React.FC = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [quarterHistory, setQuarterHistory] = useState<QuarterData[]>([]);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestCategory, setNewQuestCategory] = useState<'work' | 'life'>('work');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentQuarter = getCurrentQuarter();

  const fetchQuests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const currentQuarterQuests = data?.filter(q => !q.quarter || q.quarter === '' || q.quarter === currentQuarter) || [];

      const questsToUpdate = data?.filter(q => !q.quarter || q.quarter === '') || [];
      if (questsToUpdate.length > 0) {
        for (const quest of questsToUpdate) {
          await supabase
            .from('quests')
            .update({ quarter: currentQuarter })
            .eq('id', quest.id);
        }
      }

      setQuests(currentQuarterQuests.map(q => ({...q, quarter: q.quarter || currentQuarter, editing: false})));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentQuarter]);

  const fetchQuarterHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .neq('quarter', currentQuarter)
        .order('quarter', { ascending: false });

      if (questsError) throw questsError;

      if (questsData && questsData.length > 0) {
        const questIds = questsData.map(q => q.id);
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from('quest_assessments')
          .select('*')
          .in('quest_id', questIds)
          .eq('user_id', user.id);

        if (assessmentsError) throw assessmentsError;

        const quarterMap = new Map<string, Quest[]>();
        questsData.forEach(quest => {
          if (quest.quarter && isPastQuarter(quest.quarter)) {
            if (!quarterMap.has(quest.quarter)) {
              quarterMap.set(quest.quarter, []);
            }
            quarterMap.get(quest.quarter)!.push(quest);
          }
        });

        const quarterDataList: QuarterData[] = Array.from(quarterMap.entries())
          .map(([quarter, quests]) => ({ quarter, quests }))
          .sort((a, b) => b.quarter.localeCompare(a.quarter));

        setQuarterHistory(quarterDataList);
      }
    } catch (err: any) {
      console.error('Error fetching quarter history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, currentQuarter]);

  useEffect(() => {
    fetchQuests();
    fetchQuarterHistory();
  }, [fetchQuests, fetchQuarterHistory]);

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
          quarter: currentQuarter,
          completed: false
        })
        .select()
        .single();
      if (error) throw error;
      setQuests(prev => [...prev, {...data, editing: false, expanded: false}]);
      setNewQuestTitle('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleQuest = async (id: string, completed: boolean) => {
    try {
      const updateData: any = { completed: !completed };
      if (!completed) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
      const { data, error } = await supabase
        .from('quests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      setQuests(quests.map(q => q.id === id ? {...q, ...data} : q));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateQuestTitle = async (id: string, title: string) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .update({ title })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setQuests(quests.map(q => q.id === id ? {...data, editing: false, expanded: q.expanded} : q));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteQuest = async (id: string) => {
    try {
      const { error } = await supabase.from('quests').delete().eq('id', id);
      if (error) throw error;
      setQuests(quests.filter(q => q.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
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
        <div className="mt-4 space-y-3">
          {mainQuest ? (
            <QuestItem
              quest={mainQuest}
              onToggle={toggleQuest}
              onDelete={deleteQuest}
              onEdit={toggleEditing}
              onTitleChange={handleTitleChange}
              onSave={updateQuestTitle}
              isMain
            />
          ) : (
            <p className="text-sm text-gray-400">No main quest. The next quest added here will be the main one.</p>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {sideQuests.map(quest => (
            <QuestItem
              key={quest.id}
              quest={quest}
              onToggle={toggleQuest}
              onDelete={deleteQuest}
              onEdit={toggleEditing}
              onTitleChange={handleTitleChange}
              onSave={updateQuestTitle}
            />
          ))}
        </div>
      </Card>
    );
  };

  if (loading) return <div className="text-center p-8">Loading quests...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Quarterly</h1>
        <p className="text-cyan-400 text-lg font-semibold mt-2">{currentQuarter}</p>
        <p className="text-gray-400 max-w-3xl mt-2">
          This is the bridge between Vision and Action. Define one Main Quest and several Side Quests for Work and Life.
        </p>
      </div>

      {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md">Error: {error}</p>}

      <QuarterlyAssessmentSection currentQuarter={currentQuarter} />


      <h2 class="text-2xl font-bold text-white">Quarterly Quests</h2>
      
      <ExpandableGuide title="How to choose great quests" content={GUIDE_CONTENT.quarterlyQuests} />

      <Card>
        <form onSubmit={addQuest} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newQuestTitle}
            onChange={(e) => setNewQuestTitle(e.target.value)}
            placeholder="Add a new quest..."
            className="flex-grow p-2 text-white bg-gray-900 border border-gray-700 rounded-md"
          />
          <select
            value={newQuestCategory}
            onChange={(e) => setNewQuestCategory(e.target.value as 'work'|'life')}
            className="p-2 text-white bg-gray-900 border border-gray-700 rounded-md"
          >
            <option value="work">Work</option>
            <option value="life">Life</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2"/> Add Quest
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {renderQuestList('work')}
        {renderQuestList('life')}
      </div>

      <QuarterHistory quarterDataList={quarterHistory} isLoading={historyLoading} />
    </div>
  );
};

interface QuestItemProps {
  quest: Quest;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onSave: (id: string, title: string) => void;
  isMain?: boolean;
}

const QuestItem: React.FC<QuestItemProps> = ({
  quest,
  onToggle,
  onDelete,
  onEdit,
  onTitleChange,
  onSave,
  isMain
}) => (
  <div className={`rounded-md transition-colors ${isMain ? 'bg-cyan-500/10 border-2 border-cyan-500/30' : 'bg-gray-800/50 border border-gray-700'}`}>
    <div className="flex items-center p-3">
      <button
        onClick={() => onToggle(quest.id, quest.completed)}
        className="mr-3 flex-shrink-0"
      >
        {quest.completed ? (
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
        ) : (
          <div className="w-6 h-6 border-2 border-gray-500 rounded-full transition-colors hover:border-cyan-400"></div>
        )}
      </button>

      {quest.editing ? (
        <input
          type="text"
          value={quest.title}
          onChange={e => onTitleChange(quest.id, e.target.value)}
          className="flex-grow text-white bg-gray-700 p-1 rounded-md"
        />
      ) : (
        <span className={`flex-grow ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
          {isMain && <span className="font-bold text-cyan-400">[MAIN] </span>}
          {quest.title}
        </span>
      )}

      <div className="flex items-center flex-shrink-0 ml-3 space-x-2">
        {quest.editing ? (
          <button
            onClick={() => onSave(quest.id, quest.title)}
            className="text-gray-400 hover:text-green-500"
          >
            <SaveIcon className="w-5 h-5"/>
          </button>
        ) : (
          <button
            onClick={() => onEdit(quest.id)}
            className="text-gray-400 hover:text-white"
          >
            <EditIcon className="w-5 h-5"/>
          </button>
        )}
        <button
          onClick={() => onDelete(quest.id)}
          className="text-gray-400 hover:text-red-500"
        >
          <TrashIcon className="w-5 h-5"/>
        </button>
      </div>
    </div>
  </div>
);

export default QuarterlyQuestsPage;
