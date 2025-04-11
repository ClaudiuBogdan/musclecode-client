import React from "react";
import { cn } from "../../../lib/utils";
import type {
  ChatMessage as ChatMessageType,
  ContentElement,
  TextElement,
  CodeElement,
} from "../chat/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
  onRetry?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLoading = false,
  onRetry,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderContentElement = (element: ContentElement, index: number) => {
    if (element.type === "text") {
      const textElement = element as TextElement;
      return (
        <div
          key={element.id || index}
          className="prose dark:prose-invert max-w-none"
        >
          <Markdown content={textElement.value} />
        </div>
      );
    }

    if (element.type === "code") {
      const codeElement = element as CodeElement;
      return (
        <div key={element.id || index} className="relative">
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => copyToClipboard(codeElement.value)}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Markdown
            content={`\`\`\`${codeElement.language || "text"}\n${codeElement.value}\n\`\`\``}
          />
        </div>
      );
    }

    // Add more cases for other content element types
    return null;
  };

  return (
    <div
      className={cn(
        "py-4 px-4 flex gap-4",
        isUser ? "bg-muted/40" : "bg-background",
        isLoading && "opacity-70"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/assistant-avatar.png" alt="AI Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col flex-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2 w-full max-w-4xl",
            isUser && "items-end"
          )}
        >
          {message.content.map((element, index) => (
            <div
              key={element.id || index}
              className={cn("w-full", isUser && "flex justify-end")}
            >
              <div className={cn(isUser ? "max-w-[85%]" : "w-full")}>
                {renderContentElement(element, index)}
              </div>
            </div>
          ))}

          {isAssistant && onRetry && (
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="text-xs"
              >
                Regenerate response
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
