import React from "react";
import { MessageSquare } from "lucide-react";

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
      <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
      <p className="text-sm text-center">
        Start a conversation by typing a message below.
      </p>
    </div>
  );
};
