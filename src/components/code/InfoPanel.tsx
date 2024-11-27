import React, { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemDescription } from "@/components/code/ProblemDescription";
import { NotesEditor } from "@/components/code/NotesEditor";
import { useCodeStore } from "@/stores/algorithm";
import { cn } from "@/lib/utils";

interface InfoPanelProps {
  algorithmId: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ algorithmId }) => {
  const { setNotes } = useCodeStore();
  const algorithm = useCodeStore((state) => state.algorithms[algorithmId]);

  const handleNotesChange = useCallback(
    (value: string) => {
      if (!algorithmId) return;
      setNotes(algorithmId, value);
    },
    [algorithmId, setNotes]
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="problem" className="w-full h-full flex flex-col ">
        <TabsList className="h-10 w-full flex justify-start shrink-0 bg-background border-b border-border rounded-none p-0">
          <TabsTrigger
            value="problem"
            className={cn(
              "h-10 rounded-none border-0 px-4 data-[state=active]:bg-muted/50",
              "data-[state=active]:shadow-none relative",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
              "after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100",
              "transition-all duration-200"
            )}
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className={cn(
              "h-10 rounded-none border-0 px-4 data-[state=active]:bg-muted/50",
              "data-[state=active]:shadow-none relative",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
              "after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100",
              "transition-all duration-200"
            )}
          >
            Notes
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="problem"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <ProblemDescription />
        </TabsContent>
        <TabsContent
          value="notes"
          className="flex-grow m-0 overflow-auto border-none outline-none"
        >
          <NotesEditor value={algorithm.notes} onChange={handleNotesChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
