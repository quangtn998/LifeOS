import React from 'react';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  minRows = 4,
  maxRows = 30,
}) => {
  const calculateRows = (text: string) => {
    if (!text) return minRows;
    const lineBreaks = (text.match(/\n/g) || []).length;
    const estimatedLines = Math.ceil(text.length / 80);
    const totalLines = Math.max(lineBreaks + 1, estimatedLines);
    return Math.max(minRows, Math.min(totalLines, maxRows));
  };

  const defaultClassName = 'w-full p-2.5 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-y';
  const finalClassName = className || defaultClassName;

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={finalClassName}
      rows={calculateRows(value)}
    />
  );
};

export default AutoResizeTextarea;
