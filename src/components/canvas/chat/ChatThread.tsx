import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { Message } from "./Message";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useChatStore,
  useCurrentChatMessages,
  useStreamingAssistantMessage,
  useStreamingToolData,
  useConnectionStatus,
} from "../store";
import { StreamingMessageRenderer } from "./StreamingMessageRenderer";

interface ChatThreadProps {
  className?: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ className }) => {
  const initializeStore = useChatStore((state) => state.initializeStore);
  const messages = useCurrentChatMessages();
  const streamingMessage = useStreamingAssistantMessage();
  const streamingToolData = useStreamingToolData();
  const connectionStatus = useConnectionStatus();
  const currentThreadId = useChatStore((state) => state.currentThreadId);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const completedMessages = useMemo(
    () => messages.filter((m) => m.id !== streamingMessage?.id),
    [messages, streamingMessage]
  );

  const totalMessages = completedMessages.length;
  const lastMessageLength =
    totalMessages > 0
      ? completedMessages[totalMessages - 1].content.length || 0
      : 0;

  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const virtualizerCount =
    completedMessages.length + (streamingMessage ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: virtualizerCount,
    useAnimationFrameWithResizeObserver: true,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 110, []),
    overscan: 5,
    scrollMargin: 50,
  });

  const scrollToBottom = useCallback(() => {
    if (!parentRef.current) return;
    if (virtualizerCount > 0) {
      virtualizer.scrollToIndex(virtualizerCount - 1, {
        align: "end",
      });
    }
  }, [virtualizerCount, virtualizer]);

  useLayoutEffect(() => {
    const isStreamingStarted =
      connectionStatus === "streaming" ||
      connectionStatus === "open" ||
      connectionStatus === "connecting";
    if (totalMessages > 0 || isStreamingStarted) {
      scrollToBottom();
    }
  }, [totalMessages, connectionStatus, scrollToBottom]);

  useEffect(() => {
    const threadElement = parentRef.current;
    if (!threadElement) return;

    const getIsNearBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = threadElement;
      return scrollHeight - scrollTop - clientHeight < 150;
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
  }, [streamingMessage, lastMessageLength]);

  const emptyState = useMemo(() => <EmptyState />, []);

  const isEffectivelyEmpty =
    completedMessages.length === 0 && !streamingMessage;

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {isEffectivelyEmpty ? (
        emptyState
      ) : (
        <div
          ref={parentRef}
          data-thread-id={currentThreadId}
          className="flex-1 overflow-y-auto px-4 scroll-smooth"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const itemIndex = virtualItem.index;
              const isStreamingSlot = itemIndex === completedMessages.length;
              const renderStreaming =
                isStreamingSlot && streamingMessage !== null;
              const message = renderStreaming
                ? streamingMessage
                : completedMessages[itemIndex];

              if (!message) {
                console.warn(
                  `No message found for index ${itemIndex}, streaming: ${renderStreaming}`
                );
                return null;
              }

              return (
                <div
                  key={message.id}
                  data-index={itemIndex}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="py-2"
                >
                  {renderStreaming || message.role === "assistant" ? (
                    <StreamingMessageRenderer
                      message={message}
                      toolData={streamingToolData}
                    />
                  ) : (
                    <Message message={message} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showScrollButton && virtualizerCount > 0 && (
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
