import React, { KeyboardEvent } from 'react';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onSend }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <div className="p-4 border-t">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
        className="w-full p-2 border rounded resize-none"
        rows={3}
      />
      <button 
        onClick={() => onSend(value)} 
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
    </div>
  );
};

