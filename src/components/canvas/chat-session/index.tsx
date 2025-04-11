import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../chat-message";
import ChatInput from "../chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import {
  ChatMessage as ChatMessageType,
  ChatSession as ChatSessionType,
  TextElement,
  ContextReference,
} from "../chat/types";
import { v4 as uuidv4 } from "uuid";

interface CommandArgs {
  [key: string]: string | number | boolean | object;
}

interface ChatSessionProps {
  /** Optional initial session data */
  initialSession?: ChatSessionType;
  /** Called when a message is sent */
  onSendMessageToBackend?: (
    message: ChatMessageType
  ) => Promise<ChatMessageType>;
  /** Called when the session needs to parse a command */
  onSendCommand?: (command: string, args: CommandArgs) => void;
  /** Placeholder text for the input field */
  inputPlaceholder?: string;
  /** Whether the assistant is currently generating a response */
  isLoading?: boolean;
}

export const ChatSession: React.FC<ChatSessionProps> = ({
  initialSession,
  onSendMessageToBackend,
  onSendCommand,
  inputPlaceholder = "Type a message...",
  isLoading: externalLoading = false,
}) => {
  // State for messages, loading status, and errors
  const [messages, setMessages] = useState<ChatMessageType[]>(
    initialSession?.messages || []
  );
  const [isLoading, setIsLoading] = useState(externalLoading);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update internal loading state when external state changes
  useEffect(() => {
    setIsLoading(externalLoading);
  }, [externalLoading]);

  // Helper to scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Create a new user message from text
  const createUserMessage = (
    text: string,
    contexts: ContextReference[] = []
  ): ChatMessageType => {
    const textElement: TextElement = {
      type: "text",
      id: uuidv4(),
      value: text,
    };

    return {
      id: uuidv4(),
      role: "user",
      content: [textElement],
      createdAt: new Date().toISOString(),
      attachedContext: contexts.length > 0 ? contexts : undefined,
    };
  };

  // Check if a message text is a command
  const isCommand = (text: string): boolean => {
    return text.trim().startsWith("/");
  };

  // Parse a command and its arguments
  const parseCommand = (
    text: string
  ): { command: string; args: CommandArgs } => {
    const trimmed = text.trim();
    const parts = trimmed.split(" ");
    const command = parts[0].substring(1); // Remove the leading /

    // Simple parsing for now - could be made more sophisticated
    const argsText = parts.slice(1).join(" ");
    let args: CommandArgs = {};

    try {
      // Try to parse as JSON if it looks like JSON
      if (argsText.trim().startsWith("{") && argsText.trim().endsWith("}")) {
        args = JSON.parse(argsText);
      } else {
        // Otherwise treat as a simple string argument
        args = { text: argsText };
      }
    } catch {
      // Ignore parsing errors and use text as is
      args = { text: argsText };
    }

    return { command, args };
  };

  // Handler for sending a message
  const handleSendMessage = async (
    messageText: string,
    contexts: ContextReference[] = []
  ) => {
    if (!messageText.trim()) return;

    try {
      // Reset any previous errors
      setError(null);

      // Check if it's a command
      if (isCommand(messageText) && onSendCommand) {
        const { command, args } = parseCommand(messageText);
        const userMessage = createUserMessage(messageText, contexts);

        // Add the user message to the state
        setMessages((prev) => [...prev, userMessage]);

        // Call the command handler
        onSendCommand(command, args);
        return;
      }

      // Create and add the user message
      const userMessage = createUserMessage(messageText, contexts);
      setMessages((prev) => [...prev, userMessage]);

      // If there's no backend handler, just display the user message
      if (!onSendMessageToBackend) return;

      // Set loading state while waiting for response
      setIsLoading(true);

      // Send to backend and wait for response
      const responseMessage = await onSendMessageToBackend(userMessage);

      // Add the response to the messages
      setMessages((prev) => [...prev, responseMessage]);
    } catch (err) {
      // Handle errors
      console.error("Error sending message:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred sending your message"
      );
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  // Handler for retrying a message (regenerating assistant response)
  const handleRetryMessage = async (index: number) => {
    // Find the user message that preceded the assistant message
    const userMessage = messages[index - 1];
    if (!userMessage || userMessage.role !== "user" || !onSendMessageToBackend)
      return;

    try {
      // Set loading state
      setIsLoading(true);
      setError(null);

      // Remove the existing assistant message
      setMessages((prev) => prev.slice(0, index));

      // Send the user message to get a new response
      const responseMessage = await onSendMessageToBackend(userMessage);

      // Add the new response
      setMessages((prev) => [...prev, responseMessage]);
    } catch (err) {
      console.error("Error regenerating response:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred regenerating the response"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-md">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLoading={
                isLoading &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
              onRetry={
                message.role === "assistant"
                  ? () => handleRetryMessage(index)
                  : undefined
              }
            />
          ))}

          {/* Loading indicator */}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="flex items-center space-x-2 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  AI is thinking...
                </p>
              </div>
            )}

          {/* Error message */}
          {error && (
            <div className="p-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          {/* Empty div for scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <ChatInput
          placeholder={inputPlaceholder}
          onSubmit={(value, contexts) => handleSendMessage(value, contexts)}
        />
      </div>
    </div>
  );
};

export default ChatSession;
