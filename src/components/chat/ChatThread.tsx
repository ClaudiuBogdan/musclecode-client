import React, { useRef, useEffect, useState } from "react";
import { Message } from "./Message";
import useChatStore from "@/stores/chat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";

interface ChatThreadProps {
  className?: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ className }) => {
  const { getActiveThread } = useChatStore();
  const thread = getActiveThread();
  const messages = thread?.messages || [];
  const totalMessages = messages.length;
  const lastMessageLength = messages[totalMessages - 1]?.content.length || 0;

  const threadRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (!threadRef.current) {
      return;
    }
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  };

  // Scroll to bottom if user sends new message
  useEffect(() => {
    scrollToBottom();
  }, [totalMessages]);

  // Show scroll icon
  useEffect(() => {
    const threadElement = threadRef.current;
    if (!threadElement) return;

    const getIsNearBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = threadElement;
      return scrollHeight - scrollTop - clientHeight < 25;
    };

    const isNearBottom = getIsNearBottom();
    if (!isNearBottom) {
      setShowScrollButton(true);
    }

    const handleScroll = () => {
      const isNearBottom = getIsNearBottom();
      setShowScrollButton(!isNearBottom);
    };
    threadElement.addEventListener("scroll", handleScroll);
    return () => {
      threadElement.removeEventListener("scroll", handleScroll);
    };
  }, [lastMessageLength]);

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          ref={threadRef}
          data-thread-id={thread?.id}
          className="flex-1 overflow-y-auto space-y-4 p-4"
        >
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      )}
      <AnimatePresence>
        {showScrollButton && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollToBottom}
              className="rounded-full shadow-md"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
