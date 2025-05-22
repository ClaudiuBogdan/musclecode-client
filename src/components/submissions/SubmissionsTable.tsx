import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { difficultyColors } from "@/lib/constants/styles";
import { formatTime } from "@/lib/utils/time";


import { LanguageBadge } from "./LanguageBadge";
import { NotesPopover } from "./NotesPopover";

import type { Submission } from "@/types/algorithm";


interface SubmissionsTableProps {
  submissions: Submission[];
  onViewCode: (submission: Submission) => void;
}

export function SubmissionsTable({
  submissions,
  onViewCode,
}: SubmissionsTableProps) {
  return (
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
                className={difficultyColors[submission.rating]}
              >
                {submission.rating}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(submission.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {submission.notes && <NotesPopover notes={submission.notes} />}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewCode(submission)}
              >
                View Code
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
