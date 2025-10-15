import React, { useState } from 'react';
import Card from './Card';
import { ChevronDownIcon, ChevronUpIcon } from './icons/Icons';

interface HistorySectionProps {
  title: string;
  isLoading?: boolean;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  title,
  isLoading = false,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
      >
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {isLoading && <span className="text-sm text-gray-400">Loading...</span>}
          {isExpanded ? (
            <ChevronUpIcon className="w-6 h-6 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {children}
        </div>
      )}
    </Card>
  );
};

export default HistorySection;
