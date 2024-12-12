import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemDescription } from "@/components/code/ProblemDescription";
import { useAlgorithmStore } from "@/stores/algorithm";
import { selectAlgorithmDescription } from "@/stores/algorithm/selectors";
import { cn } from "@/lib/utils";
import { Notes } from "../notes/Notes";
import Submissions from "../submissions/Submissions";
import { Chat } from "../chat/Chat";
import { useNavigate } from "@tanstack/react-router";

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
  const description = useAlgorithmStore((state) =>
    selectAlgorithmDescription(state, algorithmId)
  );
  const navigate = useNavigate();

  const handleTabChange = (value: TabValue | string) => {
    // Update the URL when tab changes
    navigate({
      to: ".", // Keep current route
      search: { tab: value },
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
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <ProblemDescription problemDescription={description} />
        </TabsContent>
        <TabsContent
          value="notes"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <Notes algorithmId={algorithmId} />
        </TabsContent>
        <TabsContent
          value="submissions"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <Submissions algorithmId={algorithmId} />
        </TabsContent>
        <TabsContent
          value="chat"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <Chat algorithmId={algorithmId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
