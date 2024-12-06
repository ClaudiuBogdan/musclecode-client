import React, { useState } from "react";
import { Message as MessageType } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Edit2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import useChatStore from "@/stores/chat";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/utils/toast";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const { retryMessage, voteMessage, editMessage } = useChatStore();
  const isUser = message.sender === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    showToast.success("Message copied to clipboard");
  };

  const handleRetry = () => {
    retryMessage(message.id);
  };

  const handleVote = (isUpvote: boolean) => {
    voteMessage(message.id, isUpvote);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() !== message.content) {
      try {
        await editMessage(message.id, editContent);
        showToast.success("Message updated successfully");
      } catch {
        showToast.error("Failed to update message");
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // Function to detect and format code blocks
  const formatContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || "typescript";
      const codeContent = match[2];
      parts.push(
        <div
          key={`code-${match.index}`}
          className="relative my-2 rounded-md group"
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => navigator.clipboard.writeText(codeContent)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            className="rounded-md"
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>
      );
    }

    return parts;
  };

  return (
    <div className={cn("flex group", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex items-start space-x-2",
          isUser && "flex-row-reverse space-x-reverse"
        )}
      >
        <Avatar
          className={cn("w-8 h-8", isUser ? "bg-blue-500" : "bg-gray-500")}
        >
          <AvatarFallback>{isUser ? "U" : "A"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              "max-w-md rounded-lg p-3",
              isUser
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            )}
          >
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm">{formatContent(message.content)}</div>
            )}
            {message.status === "error" && (
              <p className="text-xs text-red-500 mt-1">
                Error: Failed to send message
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {isUser && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {!isUser && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  className={cn(
                    "h-8 px-2",
                    message.votes?.userVote === "up" && "text-green-500"
                  )}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {message.votes?.upvotes || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(false)}
                  className={cn(
                    "h-8 px-2",
                    message.votes?.userVote === "down" && "text-red-500"
                  )}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {message.votes?.downvotes || 0}
                </Button>
                {message.status === "error" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
