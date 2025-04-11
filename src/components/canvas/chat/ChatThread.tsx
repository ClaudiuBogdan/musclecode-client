import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { Message } from "./Message";
import useChatStore from "@/stores/chat";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { useVirtualizer } from "@tanstack/react-virtual";

interface ChatThreadProps {
  className?: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ className }) => {
  const { getActiveThread } = useChatStore();

  const thread = getActiveThread();
  const messages = useMemo(() => {
    if (!thread?.messages || thread.messages.length === 0) return [];

    // Create a map: key = parentId, value = child message with the most recent timestamp
    const childMap = new Map();
    thread.messages.forEach((msg) => {
      childMap.set(msg.parentId, msg);
    });

    const root = childMap.get(null);
    if (!root) return [];

    // Construct the branch from the root using the childMap
    const branch = [root];
    let current = root;
    while (childMap.has(current.id)) {
      const child = childMap.get(current.id);
      branch.push(child);
      current = child;
      if (child.parentId === child.id) {
        break;
      }
    }

    return branch;
  }, [thread?.messages]);
  const totalMessages = messages.length;
  const lastMessageLength = messages[totalMessages - 1]?.content.length || 0;

  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    useAnimationFrameWithResizeObserver: true,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 100, []),
    overscan: 5,
    scrollMargin: 50,
  });

  const scrollToBottom = useCallback(() => {
    if (!parentRef.current) return;

    virtualizer.scrollToIndex(messages.length - 1, {
      align: "end",
    });
  }, [messages.length, virtualizer]);

  // Scroll to bottom if user sends new message
  useLayoutEffect(() => {
    scrollToBottom();
  }, [totalMessages, scrollToBottom]);

  // Show scroll icon and handle scroll position
  useEffect(() => {
    const threadElement = parentRef.current;
    if (!threadElement) return;

    const getIsNearBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = threadElement;
      return scrollHeight - scrollTop - clientHeight < 100;
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

  // Memoize empty state to prevent unnecessary re-renders
  const emptyState = useMemo(() => <EmptyState />, []);

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {messages.length === 0 ? (
        emptyState
      ) : (
        <div
          ref={parentRef}
          data-thread-id={thread?.id}
          className="flex-1 overflow-auto px-4"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={messages[virtualItem.index].id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                hidden={messages[virtualItem.index].content.trim() === ""}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="py-2"
              >
                <Message message={messages[virtualItem.index]} />
              </div>
            ))}
          </div>
        </div>
      )}
      {showScrollButton && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-4 right-4 z-10"
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
    </div>
  );
};
