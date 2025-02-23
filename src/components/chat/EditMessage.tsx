import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditMessageProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const EditMessage: React.FC<EditMessageProps> = React.memo(
  ({ content, onSave, onCancel }) => {
    const [editContent, setEditContent] = React.useState(content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSave();
      }
    };

    const handleSave = () => {
      if (editContent.trim() !== content) {
        onSave(editContent.trim());
      } else {
        onCancel();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="relative w-full bg-blue-50 dark:bg-gray-700 rounded-lg shadow-md">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full min-h-[8rem] max-h-[40rem] p-4 pb-16 rounded-lg resize-none overflow-y-auto",
              "bg-transparent text-gray-900 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "placeholder:text-gray-400"
            )}
            placeholder="Edit your message..."
            aria-label="Edit message"
          />
          <div className="flex justify-end gap-2  bg-blue-50 dark:bg-gray-700 p-2 rounded-b-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
              aria-label="Cancel edit"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
              aria-label="Save edit"
            >
              Save
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
);

