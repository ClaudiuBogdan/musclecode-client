import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";
import React, { useRef, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


import { StopButton } from "./StopButton";
import { useChatStore } from "../store";

interface MessageInputProps {
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ className }) => {
  const { currentThreadId, sendMessage } = useChatStore();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const newMessageContent = inputMessage.trim();
  const canSend = newMessageContent.length > 0 && !isLoading && currentThreadId;

  // Execute commands and send message
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (canSend) {
        setIsLoading(true);

        try {
          // Create a text content element
          await sendMessage({
            content: [
              {
                type: "text",
                text: newMessageContent,
              },
            ],
            threadId: currentThreadId,
          });

          // Clear the input
          setInputMessage("");
        } catch (error) {
          console.error("Failed to send message:", error);
        } finally {
          setIsLoading(false);
        }

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    },
    [canSend, newMessageContent, sendMessage, currentThreadId]
  );

  // Handle input changes
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInputMessage(value);

      // Adjust textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    },
    []
  );

  const handleStopStreaming = useCallback(() => {
    // Would need to implement stop streaming functionality with the new chat store
    console.info("Stop streaming not implemented yet");
    setIsLoading(false);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn("relative p-4", className)}>
      <AnimatePresence>
        {isLoading && <StopButton onStop={handleStopStreaming} />}
      </AnimatePresence>

      <div
        ref={inputContainerRef}
        className="relative flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200"
      >
        <div className="relative w-full">
          {/* Input textarea */}
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInput}
            placeholder="Type a message..."
            className="w-full min-h-[40px] max-h-[120px] bg-transparent border-0 focus:ring-0 focus:outline-hidden resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-2 pl-3 pr-10 text-gray-900 dark:text-gray-100"
            maxLength={50_000}
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
          {isLoading && (
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
