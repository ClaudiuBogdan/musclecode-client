import { useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { useState } from "react";

import { Chat } from "@/components/canvas/chat/Chat";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


interface ContentLayoutProps {
  children: React.ReactNode;
  title: string;
  backLink?: string;
  action?: React.ReactNode;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({
  children,
  title,
  backLink,
  action,
}) => {
  const navigate = useNavigate();

  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2 bg-white dark:bg-gray-950 shadow z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backLink && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void navigate({ to: backLink })}
              aria-label="Go back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {action}
          <Button
            variant="outline"
            onClick={() => setIsChatVisible(!isChatVisible)}
            className="mr-2"
          >
            {isChatVisible ? "Hide Chat" : "Show Chat"}
          </Button>
        </div>
      </header>
      
      <Separator />
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content area */}
        <div className={`${isChatVisible ? "w-full md:w-3/5" : "w-full"} overflow-y-auto transition-all duration-300 ease-in-out`}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>

        {/* Chat panel */}
        {isChatVisible && (
          <div className="hidden md:block w-2/5 border-l border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out">
            <Chat />
          </div>
        )}
        
        {/* Mobile Chat panel (overlay) */}
        {isChatVisible && (
          <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950">
            <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-medium">Chat</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatVisible(false)}
                aria-label="Close chat"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[calc(100%-44px)]">
              <Chat />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 