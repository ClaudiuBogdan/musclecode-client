import React, { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemDescription } from "@/components/code/ProblemDescription";
import { useCodeStore } from "@/stores/algorithm";
import { cn } from "@/lib/utils";
import { Notes } from "../notes/Notes";
import Submissions from "../submissions/Submissions";

interface InfoPanelProps {
  algorithmId: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ algorithmId }) => {
  const { setGlobalNotes } = useCodeStore();
  const algorithm = useCodeStore((state) => state.algorithms[algorithmId]);

  const handleNotesChange = useCallback(
    (value: string) => {
      if (!algorithmId) return;
      setGlobalNotes(algorithmId, value);
    },
    [algorithmId, setGlobalNotes]
  );

  const tabClassName = cn(
    "h-10 rounded-none border-0 px-4 data-[state=active]:bg-muted/50",
    "data-[state=active]:shadow-none relative",
    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
    "after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100",
    "transition-all duration-200"
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="problem" className="w-full h-full flex flex-col">
        <TabsList className="h-10 w-full flex justify-start shrink-0 bg-background border-b border-border rounded-none p-0">
          <TabsTrigger value="problem" className={tabClassName}>
            Description
          </TabsTrigger>
          <TabsTrigger value="notes" className={tabClassName}>
            Notes
          </TabsTrigger>
          <TabsTrigger value="submissions" className={tabClassName}>
            Submissions
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="problem"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <ProblemDescription
            problemDescription={algorithm?.description ?? ""}
          />
        </TabsContent>
        <TabsContent
          value="notes"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <Notes
            value={algorithm?.globalNotes ?? ""}
            onChange={handleNotesChange}
          />
        </TabsContent>
        <TabsContent
          value="submissions"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <Submissions algorithmId={algorithmId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
