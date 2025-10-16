import React, { useState } from 'react';

interface ExpandableGuideProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

const ExpandableGuide: React.FC<ExpandableGuideProps> = ({ title, content, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition-colors"
      >
        <span className="text-sm font-semibold text-cyan-400">{title}</span>
        <svg
          className={`w-5 h-5 text-cyan-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 pt-0 text-sm text-gray-300 prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};

export default ExpandableGuide;
