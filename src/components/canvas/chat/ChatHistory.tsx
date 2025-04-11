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
import { Thread } from "@/types/chat";
import { formatRelativeTime } from "@/lib/dateUtils";

interface ChatHistoryProps {
  threads: Thread[];
  onSelectThread: (threadId: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  threads,
  onSelectThread,
}) => {
  const validThreads = useMemo(
    () =>
      threads
        .filter((thread) => thread.messages.length > 0)
        .sort((a, b) => b.createdAt - a.createdAt),
    [threads]
  );

  const getThreadContent = (thread: Thread) => {
    const messages = thread.messages;
    const title = messages[0]?.content || "New Conversation";
    let preview = "";

    // Get preview from second message if it exists, otherwise use empty string
    if (messages.length > 1) {
      preview =
        messages[1].content.length > 100
          ? `${messages[1].content.substring(0, 100)}...`
          : messages[1].content;
    }

    return { title: title.substring(0, 50), preview };
  };

  const memoizedOnSelectThread = useCallback(
    (threadId: string) => {
      onSelectThread(threadId);
    },
    [onSelectThread]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
              return (
                <DropdownMenuItem
                  key={thread.id}
                  onSelect={() => memoizedOnSelectThread(thread.id)}
                  className="flex flex-col items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {formatRelativeTime(thread.createdAt)}
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
