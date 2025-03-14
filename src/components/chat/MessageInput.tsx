import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command } from "@/types/chat";
import useChatStore from "@/stores/chat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StopButton } from "./StopButton";
import { CommandDropdown } from "./CommandDropdown";
import { CommandTag } from "./CommandTag";
import { CommandFeedback } from "./CommandFeedback";
import { INPUT_COMMANDS } from "./commands";
import { getAlgorithmContext } from "@/utils/getAlgorithmContext";

interface MessageInputProps {
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ className }) => {
  const {
    sendMessage,
    status,
    inputMessage,
    activeAlgorithmId,
    updateInputMessage,
    stopStreaming,
  } = useChatStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // State for command handling
  const [commandQuery, setCommandQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const [activeCommands, setActiveCommands] = useState<Command[]>([]);
  const [commandFeedback, setCommandFeedback] = useState<{
    command: string;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const newMessageContent = inputMessage.trim();
  const canSend = newMessageContent.length > 0 && status === "idle";

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!inputContainerRef.current || !showDropdown) return null;
    const containerRect = inputContainerRef.current.getBoundingClientRect();
    return {
      left: 0,
      top: 0,
      width: containerRect.width,
    };
  }, [showDropdown]);

  // Update dropdown position when needed
  useEffect(() => {
    if (showDropdown) {
      setDropdownPosition(calculateDropdownPosition());
    } else {
      setDropdownPosition(null);
    }
  }, [showDropdown, calculateDropdownPosition]);

  // Handle command selection
  const handleSelectCommand = useCallback(
    (command: Command) => {
      if (!textareaRef.current) return;

      // Insert command text at cursor position
      const cursorPos = textareaRef.current.selectionStart || 0;
      const currentValue = inputMessage;
      const textBeforeCursor = currentValue.substring(0, cursorPos);
      const lastSlashIndex = textBeforeCursor.lastIndexOf("/");

      let newCursorPos: number | null = null;
      if (lastSlashIndex !== -1) {
        const textAfterCursor = currentValue.substring(cursorPos);
        const completedCommand = command.command;
        const newMessage =
          textBeforeCursor.substring(0, lastSlashIndex) +
          completedCommand +
          " " +
          textAfterCursor;

        newCursorPos = lastSlashIndex + completedCommand.length + 1;
        updateInputMessage(newMessage);
      }

      // Add to active commands if not already present
      setActiveCommands((prev) => {
        if (prev.some((cmd) => cmd.name === command.name)) {
          return prev;
        }
        return [...prev, command];
      });

      // Hide dropdown and reset query
      setShowDropdown(false);
      setCommandQuery("");

      // Focus textarea and position cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          if (newCursorPos !== null) {
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }
      }, 0);
    },
    [inputMessage, updateInputMessage]
  );

  // Dismiss command dropdown
  const dismissDropdown = useCallback(() => {
    setShowDropdown(false);
    setCommandQuery("");
  }, []);

  // Remove a command from active commands
  const removeCommand = useCallback((commandName: string) => {
    setActiveCommands((prev) => prev.filter((cmd) => cmd.name !== commandName));
  }, []);

  // Clear command feedback after a delay
  useEffect(() => {
    if (commandFeedback) {
      const timer = setTimeout(() => {
        setCommandFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [commandFeedback]);

  // Sync active commands with input text
  useEffect(() => {
    setActiveCommands((prevCommands) =>
      prevCommands.filter((cmd) => inputMessage.includes(cmd.command))
    );
  }, [inputMessage]);

  // Execute commands and send message
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (canSend) {
        // Send message
        try {
          await sendMessage({
            message: newMessageContent,
            commands: activeCommands,
            context: activeAlgorithmId
              ? getAlgorithmContext(activeAlgorithmId)
              : undefined,
          });
        } catch (error) {
          console.error("Failed to send message:", error);
        }

        // Reset state
        setActiveCommands([]);

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    },
    [canSend, activeCommands, newMessageContent, sendMessage]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (not Shift+Enter)
      if (e.key === "Enter" && !e.shiftKey && !showDropdown) {
        e.preventDefault();
        handleSubmit(e);
      }

      // Tab to select first command
      if (e.key === "Tab" && showDropdown) {
        e.preventDefault();
        const filteredCommands = INPUT_COMMANDS.filter((cmd) =>
          cmd.name.toLowerCase().startsWith(commandQuery.toLowerCase())
        );
        if (filteredCommands.length > 0) {
          handleSelectCommand(filteredCommands[0]);
        }
      }

      // Prevent key propagation for dropdown navigation
      if (
        showDropdown &&
        ["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)
      ) {
        e.preventDefault();
      }

      // Show dropdown when typing slash
      if (e.key === "/" && !showDropdown) {
        const cursorPos = e.currentTarget.selectionStart || 0;

        // Only show if slash is at word boundary
        if (
          cursorPos === 0 ||
          inputMessage[cursorPos - 1] === " " ||
          inputMessage[cursorPos - 1] === "\n"
        ) {
          setCommandQuery("");
          setTimeout(() => {
            setShowDropdown(true);
          }, 10);
        }
      }
    },
    [
      showDropdown,
      handleSubmit,
      commandQuery,
      inputMessage,
      handleSelectCommand,
    ]
  );

  // Detect command typing and show dropdown
  const detectCommandTyping = useCallback(
    (value: string, cursorPos: number) => {
      const textBeforeCursor = value.substring(0, cursorPos);
      const lastSlashIndex = textBeforeCursor.lastIndexOf("/");

      if (lastSlashIndex !== -1) {
        // Check if slash is at word boundary
        const isAtStart = lastSlashIndex === 0;
        const isAfterWhitespace =
          lastSlashIndex > 0 &&
          (textBeforeCursor[lastSlashIndex - 1] === " " ||
            textBeforeCursor[lastSlashIndex - 1] === "\n");

        if (isAtStart || isAfterWhitespace) {
          // Get potential command text
          const potentialCommand = textBeforeCursor.substring(
            lastSlashIndex + 1
          );

          // Only show dropdown for incomplete commands
          if (!potentialCommand.includes(" ")) {
            setCommandQuery(potentialCommand);
            setShowDropdown(true);
            return true;
          }
        }
      }

      return false;
    },
    []
  );

  // Handle input changes
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      updateInputMessage(value);

      // Adjust textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }

      // Check for command typing
      const cursorPos = e.target.selectionStart || 0;
      const isTypingCommand = detectCommandTyping(value, cursorPos);

      // Hide dropdown if not typing a command
      if (!isTypingCommand) {
        setShowDropdown(false);
      }
    },
    [updateInputMessage, detectCommandTyping]
  );

  return (
    <form onSubmit={handleSubmit} className={cn("relative p-4", className)}>
      <AnimatePresence>
        {status === "loading" && <StopButton onStop={stopStreaming} />}
      </AnimatePresence>

      {/* Command feedback toast */}
      <AnimatePresence>
        {commandFeedback && <CommandFeedback feedback={commandFeedback} />}
      </AnimatePresence>

      <div
        ref={inputContainerRef}
        className="relative flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200"
      >
        {/* Command dropdown */}
        <div className="absolute bottom-full w-full mb-1">
          <AnimatePresence>
            {showDropdown && (
              <CommandDropdown
                query={commandQuery}
                commands={INPUT_COMMANDS}
                onSelect={handleSelectCommand}
                position={dropdownPosition}
                onDismiss={dismissDropdown}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Active command tags */}
        {activeCommands.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
            {activeCommands.map((cmd) => (
              <CommandTag
                key={cmd.name}
                command={cmd}
                onRemove={removeCommand}
              />
            ))}
          </div>
        )}

        <div className="relative w-full">
          {/* Input textarea */}
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoFocus={true}
            placeholder="Type a message or use / for commands..."
            className="w-full min-h-[40px] max-h-[120px] bg-transparent border-0 focus:ring-0 focus:outline-hidden resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-2 pl-3 pr-10 text-gray-900 dark:text-gray-100"
            maxLength={3000}
            style={{
              height: "auto",
              maxHeight: "32rem",
            }}
          />
        </div>

        {/* Send button */}
        <AnimatePresence mode="wait">
          {canSend && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-2 right-2"
            >
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
              >
                <motion.div
                  whileHover={{ rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUp className="h-4 w-4" />
                </motion.div>
                <span className="sr-only">Send message</span>
              </Button>
            </motion.div>
          )}

          {/* Loading indicator */}
          {status === "loading" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-2 right-2"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="h-4 w-4 text-white" />
                </motion.div>
                <span className="sr-only">Sending message</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};
