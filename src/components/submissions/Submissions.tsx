"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


import { SubmissionDetail } from "./SubmissionDetail";
import { SubmissionsTable } from "./SubmissionsTable";

import type { Submission } from "@/types/algorithm";

interface SubmissionsProps {
  submissions: Submission[];
}

export default function Submissions({ submissions }: SubmissionsProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center w-full h-64 flex items-center justify-center">
        No submissions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SubmissionsTable
        submissions={submissions}
        onViewCode={setSelectedSubmission}
      />

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
}
