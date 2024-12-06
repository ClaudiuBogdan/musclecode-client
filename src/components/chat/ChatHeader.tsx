import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import useChatStore from "@/stores/chat";

interface ChatHeaderProps {
  className?: string;
}

const PREDEFINED_QUESTIONS = [
  "How does this algorithm work?",
  "What's the time complexity?",
  "Can you show me an example?",
  "What are common use cases?",
];

export const ChatHeader: React.FC<ChatHeaderProps> = ({ className }) => {
  const { sendMessage } = useChatStore();

  const handlePredefinedQuestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Chat Interface
        </h1>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_QUESTIONS.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            onClick={() => handlePredefinedQuestionClick(question)}
            className="text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </header>
  );
};

