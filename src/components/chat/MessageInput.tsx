import React, { useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useChatStore from "@/stores/chat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StopButton } from "./StopButton";

interface MessageInputProps {
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ className }) => {
  const {
    sendMessage,
    status,
    inputMessage,
    updateInputMessage,
    stopStreaming,
  } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const newMessageContent = inputMessage.trim();
  const canSend = newMessageContent.length > 0 && status === "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canSend) {
      sendMessage(newMessageContent).catch(() => {
        // Error handling is managed by the store
      });
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  return (
    <form onSubmit={handleSubmit} className={cn("relative p-4", className)}>
      <AnimatePresence>
        {status === "loading" && <StopButton onStop={stopStreaming} />}
      </AnimatePresence>
      <div className="relative flex items-end bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="New message"
          className="grow min-h-[40px] max-h-[120px] bg-transparent border-0 focus:ring-0 focus:outline-hidden resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-2 pl-3 pr-10"
          maxLength={3000}
          style={{
            height: "auto",
            maxHeight: "32rem",
          }}
        />
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
