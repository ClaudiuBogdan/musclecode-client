import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center",
        className
      )}
    >
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
        Chat Interface
      </h1>
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>
    </header>
  );
};

