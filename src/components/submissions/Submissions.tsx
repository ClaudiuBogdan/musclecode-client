"use client";

import { useState } from "react";
import { useSubmissions } from "@/services/algorithms/hooks/useSubmissions";
import { Difficulty, Submission } from "@/types/algorithm";
import { CodeEditor } from "../code/CodeEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LanguageBadge } from "./LanguageBadge";
import { NotesPopover } from "./NotesPopover";

const difficultyColors: Record<Difficulty, string> = {
  again: "bg-red-500 text-white",
  hard: "bg-orange-500 text-white",
  good: "bg-green-500 text-white",
  easy: "bg-blue-500 text-white",
};

function formatTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

interface SubmissionDetailProps {
  submission: Submission;
}

function SubmissionDetail({ submission }: SubmissionDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(submission.createdAt).toLocaleString()}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(submission.timeSpent)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageBadge language={submission.language} />
          <Badge
            variant="outline"
            className={difficultyColors[submission.difficulty]}
          >
            {submission.difficulty}
          </Badge>
        </div>
      </div>
      <div className="h-[400px] border rounded-md overflow-hidden dark:border-gray-700">
        <CodeEditor
          initialValue={submission.code}
          lang={submission.language}
          readOnly={true}
        />
      </div>
      <div className="bg-secondary p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Notes</h3>
        <p className="text-secondary-foreground">
          {submission.notes || "No notes provided."}
        </p>
      </div>
    </div>
  );
}

export default function Submissions({ algorithmId }: { algorithmId: string }) {
  const { data: submissions, isLoading, error } = useSubmissions(algorithmId);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400">
        Error loading submissions: {error.message}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        No submissions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Language</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>
                <LanguageBadge language={submission.language} />
              </TableCell>
              <TableCell>{formatTime(submission.timeSpent)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={difficultyColors[submission.difficulty]}
                >
                  {submission.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(submission.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {submission.notes && <NotesPopover notes={submission.notes} />}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      View Code
                    </Button>
                  </DialogTrigger>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
