import React from "react";
import { X } from "lucide-react";
import { Command } from "@/types/chat";

interface CommandTagProps {
  command: Command;
  onRemove: (commandName: string) => void;
}

export const CommandTag: React.FC<CommandTagProps> = ({
  command,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
      <span>{command.command}</span>
      <button
        type="button"
        onClick={() => onRemove(command.name)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
