import React, { useRef, useEffect, useState } from "react";
import { Message } from "./Message";
import useChatStore from "@/stores/chat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatThreadProps {
  className?: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ className }) => {
  const { getActiveThread } = useChatStore();
  const thread = getActiveThread();
  const messages = thread?.messages || [];

  const threadRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const threadElement = threadRef.current;
    if (!threadElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = threadElement;
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight / 4 < clientHeight;
      setShowScrollButton(!isNearBottom);
    };

    threadElement.addEventListener("scroll", handleScroll);
    return () => threadElement.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const threadElement = threadRef.current;
    if (!threadElement) return;

    const { scrollTop, scrollHeight, clientHeight } = threadElement;
    const isNearBottom =
      scrollHeight - scrollTop - clientHeight / 4 < clientHeight;

    if (isNearBottom) {
      scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  }, [messages.length]);

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 smooth-scroll"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Message message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showScrollButton && (
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
