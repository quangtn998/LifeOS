import React, { useState } from 'react';
import { Quest, QuarterData } from '../types';
import HistorySection from './HistorySection';
import { ChevronDownIcon, ChevronUpIcon } from './icons/Icons';
import BattlefieldAssessment from './BattlefieldAssessment';

interface QuarterHistoryProps {
  quarterDataList: QuarterData[];
  isLoading: boolean;
}

const QuarterHistory: React.FC<QuarterHistoryProps> = ({ quarterDataList, isLoading }) => {
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set());
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set());

  const toggleQuarter = (quarter: string) => {
    const newExpanded = new Set(expandedQuarters);
    if (newExpanded.has(quarter)) {
      newExpanded.delete(quarter);
    } else {
      newExpanded.add(quarter);
    }
    setExpandedQuarters(newExpanded);
  };

  const toggleQuest = (questId: string) => {
    const newExpanded = new Set(expandedQuests);
    if (newExpanded.has(questId)) {
      newExpanded.delete(questId);
    } else {
      newExpanded.add(questId);
    }
    setExpandedQuests(newExpanded);
  };

  if (quarterDataList.length === 0 && !isLoading) {
    return (
      <HistorySection title="Quarter History / Lịch sử các Quý trước" isLoading={isLoading}>
        <p className="text-center text-gray-400 py-8">
          Chưa có dữ liệu các quý trước. Hãy hoàn thành quý hiện tại!
        </p>
      </HistorySection>
    );
  }

  return (
    <HistorySection title="Quarter History / Lịch sử các Quý trước" isLoading={isLoading}>
      <div className="space-y-6">
        {quarterDataList.map((quarterData) => {
          const isExpanded = expandedQuarters.has(quarterData.quarter);
          const workQuests = quarterData.quests.filter((q) => q.category === 'work');
          const lifeQuests = quarterData.quests.filter((q) => q.category === 'life');
          const completedCount = quarterData.quests.filter((q) => q.completed).length;
          const totalCount = quarterData.quests.length;

          return (
            <div key={quarterData.quarter} className="border border-gray-700 rounded-md bg-gray-800/30">
              <button
                onClick={() => toggleQuarter(quarterData.quarter)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/30 transition-colors rounded-md"
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-cyan-400">{quarterData.quarter}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Completed: {completedCount}/{totalCount} quests
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUpIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="text-md font-bold text-white mb-3">Work Quests</h4>
                      {workQuests.length === 0 ? (
                        <p className="text-sm text-gray-400">No work quests</p>
                      ) : (
                        <div className="space-y-3">
                          {workQuests.map((quest) => (
                            <HistoryQuestItem
                              key={quest.id}
                              quest={quest}
                              isExpanded={expandedQuests.has(quest.id)}
                              onToggle={() => toggleQuest(quest.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-md font-bold text-white mb-3">Life Quests</h4>
                      {lifeQuests.length === 0 ? (
                        <p className="text-sm text-gray-400">No life quests</p>
                      ) : (
                        <div className="space-y-3">
                          {lifeQuests.map((quest) => (
                            <HistoryQuestItem
                              key={quest.id}
                              quest={quest}
                              isExpanded={expandedQuests.has(quest.id)}
                              onToggle={() => toggleQuest(quest.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </HistorySection>
  );
};

interface HistoryQuestItemProps {
  quest: Quest;
  isExpanded: boolean;
  onToggle: () => void;
}

const HistoryQuestItem: React.FC<HistoryQuestItemProps> = ({ quest, isExpanded, onToggle }) => {
  return (
    <div className="border border-gray-700 rounded-md bg-gray-900/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/30 transition-colors rounded-md"
      >
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            {quest.type === 'main' && (
              <span className="text-xs font-bold text-cyan-400">[MAIN]</span>
            )}
            <span className={`text-sm ${quest.completed ? 'line-through text-gray-400' : 'text-white'}`}>
              {quest.title}
            </span>
          </div>
          {quest.completed && quest.completed_at && (
            <p className="text-xs text-gray-500 mt-1">
              Completed: {new Date(quest.completed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && quest.assessment && (
        <div className="px-3 pb-3">
          <BattlefieldAssessment
            quest={quest}
            assessment={quest.assessment}
            onAssessmentChange={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default QuarterHistory;
