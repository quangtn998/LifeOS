import React, { useRef, useEffect } from 'react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 20;
      const paddingTop = 10;
      const paddingBottom = 10;
      const minHeight = minRows * lineHeight + paddingTop + paddingBottom;
      const maxHeight = maxRows * lineHeight + paddingTop + paddingBottom;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, minRows, maxRows]);

  const defaultClassName = 'w-full p-2.5 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-y overflow-hidden';
  const finalClassName = className || defaultClassName;

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={finalClassName}
    />
  );
};

export default AutoResizeTextarea;
