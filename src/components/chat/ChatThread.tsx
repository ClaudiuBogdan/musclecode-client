import React from "react";
import { Message } from "./Message";
import useChatStore from "@/stores/chat";

export const ChatThread: React.FC = () => {
  const { getConversationThread } = useChatStore();
  const thread = getConversationThread();

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto h-full">
      {thread.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};
