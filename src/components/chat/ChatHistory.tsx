import React from "react";
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
  const getThreadPreview = (thread: Thread) => {
    const firstMessage = thread.messages[0]?.content || "No messages";
    return firstMessage.length > 100
      ? `${firstMessage.substring(0, 100)}...`
      : firstMessage;
  };

  const getThreadTitle = (thread: Thread) => {
    const firstUserMessage = thread.messages.find(
      (msg) => msg.sender === "user"
    );
    return firstUserMessage
      ? firstUserMessage.content.substring(0, 50)
      : "New Conversation";
  };

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
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Chat History</span>
          <span className="text-xs text-gray-500">
            {threads.length} conversations
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {threads.length > 0 ? (
            threads
              .sort((a, b) => b.createdAt - a.createdAt)
              .filter((thread) => thread.messages.length > 0)
              .map((thread) => (
                <DropdownMenuItem
                  key={thread.id}
                  onSelect={() => onSelectThread(thread.id)}
                  className="flex flex-col items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {getThreadTitle(thread)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {formatRelativeTime(thread.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between w-full items-end">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {getThreadPreview(thread)}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                      {thread.messages.length} msgs
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
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
