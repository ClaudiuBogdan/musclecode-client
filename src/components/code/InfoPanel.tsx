import { useNavigate } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";

import { ProblemDescription } from "@/components/code/ProblemDescription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { useAlgorithmStore } from "@/stores/algorithm";
import {
  selectAlgorithmLessons,
  selectAlgorithmSubmissions,
} from "@/stores/algorithm/selectors";
import useChatStore from "@/stores/chat";

import { Chat } from "../chat/Chat";
import { Notes } from "../notes/Notes";
import Submissions from "../submissions/Submissions";


const logger = createLogger({ context: "InfoPanel" });

interface InfoPanelProps {
  algorithmId: string;
  tab: string;
  className?: string;
}

// Valid tab values
type TabValue = "description" | "notes" | "submissions" | "chat";

export const InfoPanel: React.FC<InfoPanelProps> = ({
  algorithmId,
  tab,
  className,
}) => {
  const state = useAlgorithmStore();
  const { syncThreads } = useChatStore();

  // Trigger thread synchronization when the component mounts
  useEffect(() => {
    logger.info("InfoPanel mounted, triggering thread synchronization");
    syncThreads().catch((error) => {
      logger.error("Failed to sync threads on InfoPanel mount", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }, [syncThreads]);

  const lessons = useMemo(
    () => selectAlgorithmLessons(state, algorithmId),
    [state, algorithmId]
  );
  const submissions = useMemo(
    () => selectAlgorithmSubmissions(state, algorithmId),
    [state, algorithmId]
  );

  const navigate = useNavigate();

  const handleTabChange = (value: TabValue | string) => {
    // Update the URL when tab changes
    navigate({
      to: ".",
      search: (current) => ({ ...current, tab: value }),
      replace: true,
    });
  };

  const tabClassName = cn(
    "h-10 rounded-none border-0 px-4 data-[state=active]:bg-muted/50",
    "data-[state=active]:shadow-none relative",
    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
    "after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100",
    "transition-all duration-200"
  );

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="h-10 w-full flex justify-start shrink-0 bg-background border-b border-border rounded-none p-0">
          <TabsTrigger value="description" className={tabClassName}>
            Description
          </TabsTrigger>
          <TabsTrigger value="notes" className={tabClassName}>
            Notes
          </TabsTrigger>
          <TabsTrigger value="submissions" className={tabClassName}>
            Submissions
          </TabsTrigger>
          <TabsTrigger value="chat" className={tabClassName}>
            Chat
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="description"
          className="grow m-0 overflow-auto border-none outline-hidden"
        >
          <ProblemDescription lessons={lessons} />
        </TabsContent>
        <TabsContent
          value="notes"
          className="grow m-0 overflow-auto border-none outline-hidden"
        >
          <Notes algorithmId={algorithmId} />
        </TabsContent>
        <TabsContent
          value="submissions"
          className="grow m-0 overflow-auto border-none outline-hidden"
        >
          <Submissions submissions={submissions} />
        </TabsContent>
        <TabsContent
          value="chat"
          className="grow m-0 overflow-auto border-none outline-hidden"
        >
          <Chat />
        </TabsContent>
      </Tabs>
    </div>
  );
};
