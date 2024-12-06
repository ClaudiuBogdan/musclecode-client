import React from 'react';
import { ChatThread } from './ChatThread';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';

export const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <ChatHeader />
      <div className="flex-1 overflow-hidden">
        <ChatThread />
      </div>
      <MessageInput />
    </div>
  );
};

