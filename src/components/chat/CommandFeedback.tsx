import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CommandFeedbackProps {
  feedback: {
    command: string;
    message: string;
    type: "success" | "error" | "info";
  };
}

export const CommandFeedback: React.FC<CommandFeedbackProps> = ({
  feedback,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-4 py-2 rounded-md shadow-md text-sm font-medium z-50",
        {
          "bg-green-100 text-green-800 border border-green-200":
            feedback.type === "success",
          "bg-red-100 text-red-800 border border-red-200":
            feedback.type === "error",
          "bg-blue-100 text-blue-800 border border-blue-200":
            feedback.type === "info",
        }
      )}
    >
      <div className="flex items-center space-x-2">
        {feedback.type === "success" && (
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {feedback.type === "error" && (
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {feedback.type === "info" && (
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>{feedback.message}</span>
      </div>
    </motion.div>
  );
};
