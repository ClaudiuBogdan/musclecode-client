import React, { useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { PredefinedQuestions } from "./PredefinedQuestions";
import { ChatHeader } from "./ChatHeader";
import useChatStore from "@/stores/chat";

export const ChatContainer: React.FC = () => {
  const { messages, sendMessage, startNewChat } = useChatStore();
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = useCallback(
    (content: string) => {
      sendMessage(content);
      setInputValue("");
    },
    [sendMessage]
  );

  const handlePredefinedQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question);
    },
    [handleSendMessage]
  );

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        algorithmName={"algorithmContext.name"}
        onNewChat={startNewChat}
      />
      <PredefinedQuestions onSelectQuestion={handlePredefinedQuestion} />
      <MessageList messages={Object.values(messages)} />
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
      />
    </div>
  );
};
