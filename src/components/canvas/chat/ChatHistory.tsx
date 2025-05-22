import { Clock, ChevronDown } from "lucide-react";
import React, { useMemo, useCallback } from "react";

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
import { formatRelativeTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

import { useChatStore } from "../store";

import type { ChatThread} from "../types";

interface ChatHistoryProps {
  className?: string;
  threads?: ChatThread[]; // Optional array of threads to display
  onSelectThread?: (threadId: string) => void; // Optional callback for thread selection
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  className,
  threads: providedThreads,
  onSelectThread,
}) => {
  const storeData = useChatStore();
  // If threads are provided via props, use them, otherwise get from store
  const storeThreads = storeData.threads;
  const switchThread = storeData.switchThread;
  const currentThreadId = storeData.currentThreadId;

  const validThreads = useMemo(() => {
    // If threads are provided as props, use them
    if (providedThreads) {
      return providedThreads
        .filter((thread) => thread.messages?.length > 0)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    // Otherwise, use threads from store
    return Object.values(storeThreads || {})
      .filter((thread) => thread.messages.length > 0)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [providedThreads, storeThreads]);

  const getThreadContent = useCallback((thread: ChatThread) => {
    const messages = thread.messages || [];
    let title = "New Conversation";
    let preview = "";

    // Try to extract title from first user message
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      const textContent = firstUserMessage.content
        .filter((item) => item.type === "text")
        .map((item) => (item).text)
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
        .map((item) => (item).text)
        .join(" ");

      preview = textContent || "";

      // Truncate if too long
      if (preview.length > 100) {
        preview = `${preview.substring(0, 97)}...`;
      }
    }

    return { title, preview };
  }, []);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      // If an external handler is provided, use it
      if (onSelectThread) {
        onSelectThread(threadId);
      } else {
        // Otherwise, use the built-in handler
        switchThread(threadId);
      }
    },
    [switchThread, onSelectThread]
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
            {validThreads.length} conversations
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {validThreads.length > 0 ? (
            validThreads.map((thread) => {
              const { title, preview } = getThreadContent(thread);
              const isActive = thread.id === currentThreadId;

              return (
                <DropdownMenuItem
                  key={thread.id}
                  onSelect={() => handleSelectThread(thread.id)}
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
                      {formatRelativeTime(new Date(thread.createdAt).getTime())}
                    </span>
                  </div>
                  {preview && (
                    <div className="flex justify-between w-full items-end">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {preview}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                        {thread.messages.length} msgs
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
