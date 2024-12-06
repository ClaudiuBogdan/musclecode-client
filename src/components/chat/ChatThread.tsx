import React from "react";
import { Message } from "./Message";
import useChatStore from "@/stores/chat";
import { cn } from "@/lib/utils";

interface ChatThreadProps {
  className?: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ className }) => {
  const { getActiveThread } = useChatStore();
  const thread = getActiveThread();

  const messages = thread?.messages || [];

  return (
    <div
      className={cn("flex flex-col space-y-4 p-4 overflow-y-auto", className)}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};
