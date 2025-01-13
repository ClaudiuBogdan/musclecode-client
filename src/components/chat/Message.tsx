import { Message as MessageType } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Edit2, BotIcon } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import useChatStore from "@/stores/chat";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/utils/toast";
import { EditMessage } from "./EditMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { detectLanguage, cleanTheme } from "@/lib/code-detection";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const {
    retryMessage,
    editMessage,
    editingMessageId,
    setEditMessageId,
    status,
  } = useChatStore();
  const isUser = message.sender === "user";

  const isEditing = editingMessageId === message.id;
  const isLoading = status === "loading";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    showToast.success("Message copied to clipboard");
  };

  const handleRetry = () => {
    retryMessage(message.id);
  };

  const handleEdit = () => {
    setEditMessageId(message.id);
  };

  const handleSaveEdit = async (editedContent: string) => {
    if (editedContent.trim() !== message.content) {
      try {
        await editMessage(message.id, editedContent);
      } catch {
        return;
      }
    }
    setEditMessageId(null);
  };

  const handleCancelEdit = () => {
    setEditMessageId(null);
  };

  return (
    <div
      className={cn(
        "flex group max-w-2xl mx-auto",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex items-start space-x-2 max-w-[80%]",
          isUser && "flex-row-reverse space-x-reverse",
          isEditing && "w-full"
        )}
      >
        {!isUser ? (
          <Avatar className="w-8 h-8 bg-blue-500 flex items-center justify-center">
            <AvatarFallback>
              <BotIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : null}
        <div className="flex flex-col gap-2 flex-1">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <EditMessage
                content={message.content}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-lg p-3 min-w-20 prose prose-sm dark:prose-invert max-w-none",
                  isUser
                    ? "bg-blue-500 text-white prose-white [&_code]:text-white [&_code]:bg-blue-600/50"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white [&_code]:bg-gray-100 dark:[&_code]:bg-gray-700"
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { children, className, ...rest } = props;
                      const content = String(children);
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !className;

                      if (isInline) {
                        return (
                          <code
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-sm",
                              className
                            )}
                            {...rest}
                          >
                            {children}
                          </code>
                        );
                      }

                      const language = match
                        ? match[1]
                        : detectLanguage(content);
                      const style = {
                        ...vscDarkPlus,
                        ...cleanTheme,
                      };

                      return (
                        <div className="relative my-2 font-mono text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 z-10"
                            onClick={() =>
                              navigator.clipboard.writeText(content)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <SyntaxHighlighter
                            language={language || "text"}
                            style={style}
                            PreTag="div"
                            showLineNumbers={false}
                            customStyle={{
                              padding: "0.75rem",
                              fontSize: "0.875rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {content}
                          </SyntaxHighlighter>
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">
                    Error: Failed to send message
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className={cn(
              "flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {isUser && !isEditing && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {!isUser && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
