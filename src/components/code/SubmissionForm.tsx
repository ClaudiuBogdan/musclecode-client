import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Lightbulb, ThumbsUp, Zap, RotateCcw } from "lucide-react";

type Difficulty = "again" | "hard" | "good" | "easy";

const difficultyConfig: Record<
  Difficulty,
  { label: string; days: number; color: string; icon: React.ReactNode }
> = {
  again: {
    label: "Again",
    days: 0,
    color: "bg-red-500 hover:bg-red-600",
    icon: <RotateCcw className="w-6 h-6" />,
  },
  hard: {
    label: "Hard",
    days: 1,
    color: "bg-orange-500 hover:bg-orange-600",
    icon: <Zap className="w-6 h-6" />,
  },
  good: {
    label: "Good",
    days: 3,
    color: "bg-blue-500 hover:bg-blue-600",
    icon: <ThumbsUp className="w-6 h-6" />,
  },
  easy: {
    label: "Easy",
    days: 7,
    color: "bg-green-500 hover:bg-green-600",
    icon: <Lightbulb className="w-6 h-6" />,
  },
};

export const SubmissionForm: React.FC = () => {
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const isTestPassed = true;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isTestPassed && formRef.current) {
      formRef.current.focus();
    }
  }, [isTestPassed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (difficulty) {
      console.log("Submitting:", { difficulty, notes });
      // Here you would typically send the submission data to your backend
    }
  };

  if (!isTestPassed) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <CardTitle className="text-3xl font-bold text-center">
          How well did you grasp this concept?
        </CardTitle>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
              <Button
                key={diff}
                type="button"
                className={cn(
                  "h-28 text-white font-semibold transition-all flex flex-col items-center justify-center rounded-lg shadow-md",
                  difficultyConfig[diff].color,
                  difficulty === diff &&
                    "ring-4 ring-offset-2 ring-blue-300 dark:ring-blue-700 transform scale-105"
                )}
                onClick={() => setDifficulty(diff)}
              >
                <div className="bg-white bg-opacity-20 p-2 rounded-full mb-2">
                  {difficultyConfig[diff].icon}
                </div>
                <div>{difficultyConfig[diff].label}</div>
                <div className="text-xs mt-1 opacity-80">
                  {diff === "again"
                    ? "< 10 min"
                    : `${difficultyConfig[diff].days} day${difficultyConfig[diff].days > 1 ? "s" : ""}`}
                </div>
              </Button>
            ))}
          </div>
          {difficulty && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                {difficulty === "again"
                  ? "You'll review this concept again in less than 10 minutes."
                  : `Next review scheduled in ${difficultyConfig[difficulty].days} day${difficultyConfig[difficulty].days > 1 ? "s" : ""}.`}
              </p>
            </div>
          )}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="notes" className="border-b-0">
              <AccordionTrigger
                onClick={() => setShowNotes(!showNotes)}
                className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 rounded-t-lg px-4 py-2 shadow-sm"
              >
                Add Personal Notes (Optional)
              </AccordionTrigger>
              <AccordionContent className="bg-white dark:bg-gray-800 rounded-b-lg px-4 py-2 shadow-sm">
                <div className="space-y-2">
                  <Label
                    htmlFor="notes"
                    className="text-gray-700 dark:text-gray-200"
                  >
                    Your thoughts on this concept:
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes, insights, or questions about the concept..."
                    className="min-h-[100px] bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="bg-gray-100 dark:bg-gray-800 p-6">
          <Button
            type="submit"
            className={cn(
              "w-full max-w-md mx-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105",
              !difficulty && "opacity-50 cursor-not-allowed"
            )}
            disabled={!difficulty}
          >
            Submit and Continue Learning
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

