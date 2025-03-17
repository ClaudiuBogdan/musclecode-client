import { Message as MessageType } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Edit2, BotIcon } from "lucide-react";
import useChatStore from "@/stores/chat";
import { showToast } from "@/utils/toast";
import { EditMessage } from "./EditMessage";
import { Markdown } from "@/components/ui/markdown";
import React, { useCallback } from "react";
import { CopyButton } from "../ui/copy-button";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = React.memo(({ message }) => {
  const {
    retryMessage,
    editMessage,
    editingMessageId,
    setEditMessageId,
    status,
  } = useChatStore();
  const isUser = message.sender === "user";

  const isEditing = editingMessageId === message.id;
  const isLoading = status === "loading";

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    showToast.success("Message copied to clipboard");
  }, [message.content]);

  const handleRetry = useCallback(() => {
    retryMessage(message.id);
  }, [message.id, retryMessage]);

  const handleEdit = useCallback(() => {
    setEditMessageId(message.id);
  }, [message.id, setEditMessageId]);

  const handleSaveEdit = useCallback(
    async (editedContent: string) => {
      if (editedContent.trim() !== message.content) {
        try {
          await editMessage(message.id, editedContent);
        } catch {
          return;
        }
      }
      setEditMessageId(null);
    },
    [message.id, message.content, editMessage, setEditMessageId]
  );

  const handleCancelEdit = useCallback(() => {
    setEditMessageId(null);
  }, [setEditMessageId]);

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
        {!isUser ? (
          <Avatar className="w-8 h-8 bg-blue-500 flex items-center justify-center">
            <AvatarFallback>
              <BotIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : null}
        <div className="flex flex-col gap-2 flex-1 overflow-x-auto">
          {isEditing ? (
            <EditMessage
              content={message.content}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div
              className={cn(
                "rounded-lg p-3 min-w-20 shadow-2xs",
                "bg-gray-50 dark:bg-secondary"
              )}
            >
              <Markdown
                content={message.content}
                className={cn("prose-sm max-w-none")}
              />
              {message.status === "error" && (
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
            {isUser && !isEditing && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {!isUser && !isLoading && (
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
