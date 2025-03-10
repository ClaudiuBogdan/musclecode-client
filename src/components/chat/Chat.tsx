import React, { useEffect } from "react";
import { ChatThread } from "./ChatThread";
import { MessageInput } from "./MessageInput";
import useChatStore from "@/stores/chat";
import { Toaster } from "sonner";
import { ChatHeader } from "./ChatHeader";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "Chat" });

interface ChatProps {
  algorithmId: string;
}

export const Chat: React.FC<ChatProps> = ({ algorithmId }) => {
  const { setActiveAlgorithmId, activeAlgorithmId } = useChatStore();

  // Set the active algorithm ID when the component mounts or algorithmId changes
  useEffect(() => {
    if (activeAlgorithmId !== algorithmId) {
      logger.info(`Setting active algorithm ID to ${algorithmId}`);
      setActiveAlgorithmId(algorithmId);
    }
  }, [algorithmId, activeAlgorithmId, setActiveAlgorithmId]);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <ChatHeader />
      <ChatThread className="flex-1 overflow-y-auto" />
      <MessageInput className="bg-gray-100 dark:bg-gray-900" />
      <Toaster />
    </div>
  );
};
