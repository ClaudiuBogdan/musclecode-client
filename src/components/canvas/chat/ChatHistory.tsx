import React, { useMemo, useCallback } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "../store";
import { ChatSession, TextElement } from "../types";
import { formatRelativeTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  className?: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ className }) => {
  const { sessions, switchSession, currentSessionId } = useChatStore();

  const validSessions = useMemo(() => {
    return Object.values(sessions)
      .filter((session) => session.messages.length > 0)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [sessions]);

  const getSessionContent = useCallback((session: ChatSession) => {
    const messages = session.messages;
    let title = "New Conversation";
    let preview = "";

    // Try to extract title from first user message
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      const textContent = firstUserMessage.content
        .filter((item) => item.type === "text")
        .map((item) => (item as TextElement).value)
        .join(" ");

      title = textContent || title;

      // Truncate if too long
      if (title.length > 50) {
        title = `${title.substring(0, 47)}...`;
      }
    }

    // Get preview from first assistant message if it exists
    const firstAssistantMessage = messages.find((m) => m.role === "assistant");
    if (firstAssistantMessage) {
      const textContent = firstAssistantMessage.content
        .filter((item) => item.type === "text")
        .map((item) => (item as TextElement).value)
        .join(" ");

      preview = textContent || "";

      // Truncate if too long
      if (preview.length > 100) {
        preview = `${preview.substring(0, 97)}...`;
      }
    }

    return { title, preview };
  }, []);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      switchSession(sessionId);
    },
    [switchSession]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
            className
          )}
        >
          <Clock className="h-5 w-5 mr-1" />
          History
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Chat History</span>
          <span className="text-xs text-gray-500">
            {validSessions.length} conversations
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {validSessions.length > 0 ? (
            validSessions.map((session) => {
              const { title, preview } = getSessionContent(session);
              const isActive = session.id === currentSessionId;

              return (
                <DropdownMenuItem
                  key={session.id}
                  onSelect={() => handleSelectSession(session.id)}
                  className={cn(
                    "flex flex-col items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0",
                    isActive && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {formatRelativeTime(
                        new Date(session.createdAt).getTime()
                      )}
                    </span>
                  </div>
                  {preview && (
                    <div className="flex justify-between w-full items-end">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {preview}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                        {session.messages.length} msgs
                      </span>
                    </div>
                  )}
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No chat history
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
