import React from "react";
import { Message as MessageType } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
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
        <div
          className={cn(
            "max-w-md rounded-lg p-3",
            isUser
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          )}
        >
          <p className="text-sm">{message.content}</p>
          {message.status === "error" && (
            <p className="text-xs text-red-500 mt-1">
              Error: Failed to send message
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
