import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, NotebookTabsIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAlgorithmStore } from "@/stores/algorithm";
import {
  selectIsSubmitting,
  selectSubmissionNotes,
} from "@/stores/algorithm/selectors";
import { Difficulty } from "@/types/algorithm";
import { useToast } from "@/hooks/use-toast";

interface DifficultySelectorProps {
  algorithmId: string;
  nextAlgorithmId?: string;
}

const DIFFICULTIES = [
  {
    value: "again" as Difficulty,
    label: "Again",
    color: "text-red-500 hover:bg-red-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 10),
    description: "You had significant difficulty with this problem",
  },
  {
    value: "hard" as Difficulty,
    label: "Hard",
    color: "text-orange-500 hover:bg-orange-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    description: "You solved it with some struggle",
  },
  {
    value: "good" as Difficulty,
    label: "Good",
    color: "text-green-500 hover:bg-green-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    description: "You solved it with minor hesitation",
  },
  {
    value: "easy" as Difficulty,
    label: "Easy",
    color: "text-blue-500 hover:bg-blue-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 * 30),
    description: "You solved it without any difficulty",
  },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  algorithmId,
  nextAlgorithmId,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const isSubmitting = useAlgorithmStore((state) =>
    selectIsSubmitting(state, algorithmId)
  );
  const submissionNotes = useAlgorithmStore((state) =>
    selectSubmissionNotes(state, algorithmId)
  );
  const { setSubmissionNotes, submit } = useAlgorithmStore();
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const handleSubmit = async (difficulty: Difficulty) => {
    const hasSubmitted = await submit(algorithmId, difficulty);
    if (!hasSubmitted) {
      toast({
        title: "Submission Failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Submission Saved",
      description: "Your progress has been saved successfully.",
      variant: "default",
    });

    if (nextAlgorithmId) {
      router.navigate({
        to: "/algorithms/$algorithmId",
        params: { algorithmId: nextAlgorithmId },
      });
    } else {
      router.navigate({
        to: "/",
      });
    }
  };

  const formatReviewDate = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const minutes = Math.round(diff / (1000 * 60));
    const hours = Math.round(diff / (1000 * 60 * 60));
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.round(diff / (1000 * 60 * 60 * 24 * 7));
    const months = Math.round(diff / (1000 * 60 * 60 * 24 * 30));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 4) return `${weeks}w`;
    return `${months}mo`;
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {isSubmitting && (
          <Loader2Icon className="h-4 w-4 animate-spin text-gray-400" />
        )}
        {DIFFICULTIES.map((difficulty) => (
          <TooltipProvider key={difficulty.value}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  disabled={isSubmitting}
                  variant="ghost"
                  className={`${difficulty.color} h-8 px-3 font-medium transition-colors duration-150 hover:text-white flex py-1`}
                  onClick={() => handleSubmit(difficulty.value)}
                >
                  <span>{difficulty.label}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    {formatReviewDate(difficulty.nextReviewDate)}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E1E1E] border border-[#252526] p-3 max-w-xs">
                <p className="text-sm text-gray-200 mb-1">
                  {difficulty.description}
                </p>
                <p className="text-xs text-gray-400">
                  Next review: {formatFullDate(difficulty.nextReviewDate)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        <Popover open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <PopoverTrigger asChild>
            <Button
              disabled={isSubmitting}
              variant="ghost"
              className="h-8 px-2 hover:bg-[#2D2D2D] transition-colors duration-150"
            >
              <NotebookTabsIcon size={18} className="text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 bg-[#1E1E1E] border border-[#252526] shadow-lg">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Notes</label>
              <Textarea
                placeholder="Add your notes here..."
                value={submissionNotes}
                onChange={(e) =>
                  setSubmissionNotes(algorithmId, e.target.value)
                }
                className="min-h-[120px] bg-[#252526] border-[#2D2D2D] text-sm resize-none focus:ring-1 focus:ring-blue-500 text-white"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
