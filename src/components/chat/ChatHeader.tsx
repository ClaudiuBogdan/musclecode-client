import { PlusCircle } from "lucide-react";
import React, { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useChatStore from "@/stores/chat";

import { ChatHistory } from "./ChatHistory";

interface ChatHeaderProps {
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ className }) => {
  const {
    startNewChat,
    getThreadsByAlgorithm,
    activeAlgorithmId,
    setActiveThreadId,
  } = useChatStore();

  const threads = activeAlgorithmId
    ? getThreadsByAlgorithm(activeAlgorithmId)
    : [];

  const handleStartNewChat = useCallback(() => {
    void startNewChat();
  }, [startNewChat]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
        void setActiveThreadId(threadId);
    },
    [setActiveThreadId]
  );

  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-1 flex justify-between items-center",
        className ?? ""
      )}
    >
      <ChatHistory threads={threads} onSelectThread={handleSelectThread} />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartNewChat}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <PlusCircle className="h-5 w-5 mr-1" />
        New Chat
      </Button>
    </header>
  );
};
