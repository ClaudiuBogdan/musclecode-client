import { RotateCcw, Edit2, BotIcon, UserIcon } from "lucide-react";
import React, { useCallback } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import { showToast } from "@/utils/toast";

import { EditMessage } from "./EditMessage";


import type { ChatMessage, TextBlock } from "../types";

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = React.memo(({ message }) => {
  // Local state for editing
  const [isEditing, setIsEditing] = React.useState(false);
  const isUser = message.role === "user";

  const handleCopy = useCallback(async () => {
    // Convert content elements to text
    const contentText = message.content
      .map((item) => {
        if (item.type === "text") {
          return (item as TextBlock).text || "";
        }
        return JSON.stringify(item);
      })
      .join("\n");

    await navigator.clipboard.writeText(contentText);
  }, [message.content]);

  const handleRetry = useCallback(() => {
    // Placeholder for retry functionality
    showToast.info("Retry functionality not yet implemented");
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    // Placeholder for edit functionality
    showToast.info("Edit functionality not yet implemented");
    setIsEditing(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Helper to get displayable content
  const getDisplayContent = useCallback(() => {
    return message.content
      .map((item) => {
        if (item.type === "text") {
          return (item as TextBlock).text || "";
        }
        return JSON.stringify(item);
      })
      .join("\n");
  }, [message.content]);

  return (
    <div
      className={cn(
        "flex group max-w-[95%] mx-auto",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex items-start space-x-2 max-w-[95%]",
          isUser && "flex-row-reverse space-x-reverse",
          isEditing && "w-full"
        )}
      >
        <Avatar
          className={cn(
            "w-8 h-8 flex items-center justify-center",
            isUser ? "bg-green-500" : "bg-blue-500"
          )}
        >
          <AvatarFallback>
            {isUser ? (
              <UserIcon className="h-4 w-4" />
            ) : (
              <BotIcon className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 flex-1 overflow-x-auto">
          {isEditing ? (
            <EditMessage
              content={getDisplayContent()}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div
              className={cn(
                "rounded-lg p-3 min-w-20 shadow-2xs",
                isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-50 dark:bg-secondary"
              )}
            >
              <Markdown
                content={getDisplayContent()}
                className={cn(
                  "prose-sm max-w-none",
                  isUser && "text-primary-foreground"
                )}
              />
              {message.status === "in_progress" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Generating...
                </p>
              )}
              {message.status === "failed" && (
                <p className="text-xs text-red-400 dark:text-red-300 mt-1">
                  Failed to send message. Please try again.
                </p>
              )}
            </div>
          )}
          <div
            className={cn(
              "flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <CopyButton
              onCopy={handleCopy}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
            {isUser && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {!isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Message.displayName = "Message";
