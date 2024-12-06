import React, { useEffect } from "react";
import { ChatThread } from "./ChatThread";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import useChatStore from "@/stores/chat";

interface ChatProps {
  algorithmId: string;
}

export const Chat: React.FC<ChatProps> = ({ algorithmId }) => {
  const { setActiveAlgorithmId, activeAlgorithmId } = useChatStore();

  useEffect(() => {
    if (activeAlgorithmId !== algorithmId) {
      setActiveAlgorithmId(algorithmId);
    }
  }, [algorithmId, activeAlgorithmId, setActiveAlgorithmId]);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <ChatHeader className="bg-gray-100 dark:bg-gray-900" />
      <ChatThread className="flex-1 overflow-y-auto" />
      <MessageInput className="bg-gray-100 dark:bg-gray-900" />
    </div>
  );
};
