import { FC, useCallback, useState } from "react";
import { NotesEditor } from "./NotesEditor";
import { NotesPreview } from "./NotesPreview";
import { NotesToolbar } from "./NotesToolbar";
import { useSubmissions } from "@/services/algorithms/hooks/useSubmissions";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { SubmissionDetail } from "../submissions/SubmissionDetail";
import { Submission } from "@/types/algorithm";
import { formatDistanceToNow } from "date-fns";
import { useAlgorithmStore } from "@/stores/algorithm";
import { cn } from "@/lib/utils";

interface NotesProps {
  algorithmId: string;
  className?: string;
}

export const Notes: FC<NotesProps> = ({ algorithmId, className }) => {
  const setGlobalNotes = useAlgorithmStore((state) => state.setGlobalNotes);
  const notes = useAlgorithmStore(
    (state) => state.algorithms[algorithmId]?.userProgress.notes
  );
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const { data: submissions } = useSubmissions(algorithmId);

  const submissionsWithNotes = submissions
    ?.filter((submission) => submission.notes?.trim())
    ?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleTogglePreview = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);

  const handleNotesChange = useCallback(
    (value: string) => {
      if (!algorithmId) return;
      setGlobalNotes(algorithmId, value);
    },
    [algorithmId, setGlobalNotes]
  );

  const handleToolbarAction = useCallback(
    (action: string) => {
      if (showPreview) return;
      let insertion = "";
      switch (action) {
        case "bold":
          insertion = "**bold text**";
          break;
        case "italic":
          insertion = "*italic text*";
          break;
        case "list":
          insertion = "\n- list item";
          break;
        case "link":
          insertion = "[link text](url)";
          break;
        case "image":
          insertion = "![alt text](image url)";
          break;
        case "code":
          insertion = "```\ncode block\n```";
          break;
      }
      handleNotesChange(notes + insertion);
    },
    [notes, handleNotesChange, showPreview]
  );

  return (
    <div className={cn("h-full w-full flex flex-col", className)}>
      <NotesToolbar
        onAction={handleToolbarAction}
        showPreview={showPreview}
        onTogglePreview={handleTogglePreview}
      />
      <div className="flex-1 overflow-hidden grid grid-rows-2 gap-4">
        <div className="overflow-hidden p-4">
          {showPreview ? (
            <NotesPreview value={notes.content} />
          ) : (
            <NotesEditor value={notes.content} onChange={handleNotesChange} />
          )}
          <div className="text-xs text-muted-foreground">
            {notes.state === "saving" && "Saving..."}
            {notes.state === "error" && "Error saving notes"}
            {notes.state === "saved" && "Saved"}
          </div>
        </div>

        <div className="overflow-hidden border-t">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4 pb-20">
              {submissionsWithNotes?.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg bg-secondary/50 overflow-hidden"
                >
                  <div className="text-sm whitespace-pre-wrap p-4">
                    {submission.notes}
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-background/50 border-t text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(submission.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{submission.rating}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs hover:bg-background"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      View Code
                    </Button>
                  </div>
                </div>
              ))}
              {(!submissionsWithNotes || submissionsWithNotes.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-20">
                  No submission notes yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            {selectedSubmission && (
              <SubmissionDetail submission={selectedSubmission} />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
