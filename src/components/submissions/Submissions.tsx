"use client";

import { useState } from "react";
import { useSubmissions } from "@/services/algorithms/hooks/useSubmissions";
import { Submission } from "@/types/algorithm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubmissionDetail } from "./SubmissionDetail";
import { SubmissionsTable } from "./SubmissionsTable";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

export default function Submissions({ algorithmId }: { algorithmId: string }) {
  const {
    data: submissions,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSubmissions(algorithmId);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  if (isLoading || isRefetching) {
    return <LoadingState />;
  }

  if (error) {
    const errorMessage =
      error.message === "Invalid server response"
        ? "Unable to load submissions. Please try again."
        : `Error loading submissions: ${error.message}`;

    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

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
        submissions={submissions.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )}
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
