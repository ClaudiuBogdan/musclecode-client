import React from 'react';
import { NewChatButton } from './NewChatButton';

interface ChatHeaderProps {
  algorithmName: string;
  onNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ algorithmName, onNewChat }) => {
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <h2 className="text-xl font-bold">{algorithmName}</h2>
      <NewChatButton onNewChat={onNewChat} />
    </div>
  );
};

