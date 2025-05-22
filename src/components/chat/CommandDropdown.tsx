import { motion } from "framer-motion";
import { CommandIcon, HelpCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import type { Command } from "@/types/chat";

interface CommandDropdownProps {
  query: string;
  commands: Command[];
  onSelect: (command: Command) => void;
  position: { left: number; top: number; width?: number } | null;
  onDismiss: () => void;
}

export const CommandDropdown: React.FC<CommandDropdownProps> = ({
  query,
  commands,
  onSelect,
  position,
  onDismiss,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter commands whose name starts with the query (case-insensitive)
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().startsWith(query.toLowerCase())
  );

  // Reset selection index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!position) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onSelect(filteredCommands[selectedIndex]);
          }
          break;
        case "Tab":
          e.preventDefault();
          if (filteredCommands.length > 0) {
            onSelect(filteredCommands[0]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onDismiss();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onDismiss, position]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onDismiss();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onDismiss]);

  if (!position || filteredCommands.length === 0) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.15 }}
      style={{
        width: position.width || "auto",
        maxWidth: "100%",
      }}
      className="bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <CommandIcon className="w-4 h-4 mr-2" />
          Commands
        </h3>
      </div>

      <ul className="py-1 max-h-64 overflow-y-auto">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((cmd, index) => (
            <li
              key={cmd.command}
              onClick={() => onSelect(cmd)}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between text-sm ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono">{cmd.command}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {cmd.description}
              </span>
            </li>
          ))
        ) : (
          <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <HelpCircle className="w-4 h-4 mr-2" />
            No matching commands
          </li>
        )}
      </ul>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
        <span>
          Press{" "}
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
            Tab
          </kbd>{" "}
          to select first command
        </span>
      </div>
    </motion.div>
  );
};
