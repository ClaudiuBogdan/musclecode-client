import { Submission, Rating } from "@/types/algorithm";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { CodeEditor } from "../code/CodeEditor";
import { LanguageBadge } from "./LanguageBadge";
import { formatTime } from "@/lib/utils/time";

const difficultyColors: Record<Rating, string> = {
  again: "bg-red-500 text-white",
  hard: "bg-orange-500 text-white",
  good: "bg-green-500 text-white",
  easy: "bg-blue-500 text-white",
};

interface SubmissionDetailProps {
  submission: Submission;
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
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
