import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { NotebookTabsIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DifficultySelectorProps {
  nextAlgorithmId?: string;
  onSubmit: (difficulty: number, notes?: string) => Promise<void>;
}

const DIFFICULTIES = [
  {
    value: 1,
    label: "Again",
    color: "text-red-500 hover:bg-red-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 10),
    description: "You had significant difficulty with this problem",
  },
  {
    value: 2,
    label: "Hard",
    color: "text-orange-500 hover:bg-orange-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    description: "You solved it with some struggle",
  },
  {
    value: 3,
    label: "Good",
    color: "text-green-500 hover:bg-green-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    description: "You solved it with minor hesitation",
  },
  {
    value: 4,
    label: "Easy",
    color: "text-blue-500 hover:bg-blue-500/10",
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 * 30),
    description: "You solved it without any difficulty",
  },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  nextAlgorithmId,
  onSubmit,
}) => {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const handleSubmit = async (difficulty: number) => {
    await onSubmit(difficulty, notes);
    if (nextAlgorithmId) {
      router.navigate({
        to: "/algorithm/$id",
        params: { id: nextAlgorithmId },
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
        {DIFFICULTIES.map((difficulty) => (
          <TooltipProvider key={difficulty.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] bg-[#252526] border-[#2D2D2D] text-sm resize-none focus:ring-1 focus:ring-blue-500 text-white"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
