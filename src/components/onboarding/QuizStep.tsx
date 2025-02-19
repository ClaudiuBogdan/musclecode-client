import { useState } from "react";
import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useOnboarding } from "../../hooks/useOnboarding";

interface Question {
  id: string;
  algorithm: string;
  question: string;
  options: {
    id: string;
    text: string;
    level: "unknown" | "familiar" | "confident";
  }[];
}

const questions: Question[] = [
  {
    id: "sorting",
    algorithm: "Sorting Algorithms",
    question:
      "How comfortable are you with sorting algorithms (e.g., QuickSort, MergeSort)?",
    options: [
      {
        id: "1",
        text: "I'm not familiar with these algorithms",
        level: "unknown",
      },
      {
        id: "2",
        text: "I understand the basics but need practice",
        level: "familiar",
      },
      {
        id: "3",
        text: "I can implement and explain them confidently",
        level: "confident",
      },
    ],
  },
  {
    id: "graphs",
    algorithm: "Graph Algorithms",
    question:
      "What's your experience with graph algorithms (e.g., DFS, BFS, Dijkstra's)?",
    options: [
      {
        id: "1",
        text: "I haven't worked with graph algorithms",
        level: "unknown",
      },
      {
        id: "2",
        text: "I know the concepts but need more practice",
        level: "familiar",
      },
      {
        id: "3",
        text: "I can solve graph problems confidently",
        level: "confident",
      },
    ],
  },
  {
    id: "dp",
    algorithm: "Dynamic Programming",
    question: "How would you rate your dynamic programming skills?",
    options: [
      { id: "1", text: "I'm new to dynamic programming", level: "unknown" },
      { id: "2", text: "I can solve basic DP problems", level: "familiar" },
      { id: "3", text: "I can tackle complex DP problems", level: "confident" },
    ],
  },
];

export function QuizStep({ onNext, onBack }: StepProps) {
  const { updateOnboarding } = useOnboarding();
  const [answers, setAnswers] = useState<
    Record<string, Question["options"][number]["level"]>
  >({});

  const handleSubmit = () => {
    const score = Object.values(answers).reduce((acc, level) => {
      return acc + (level === "confident" ? 2 : level === "familiar" ? 1 : 0);
    }, 0);

    updateOnboarding({
      quizResults: {
        algorithmKnowledge: answers,
        score,
        completedAt: new Date().toISOString(),
      },
    });
    onNext();
  };

  const isComplete = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Quick Knowledge Check
        </h2>
        <p className="text-muted-foreground">
          Help us understand your current algorithm knowledge to better
          personalize your learning path
        </p>
      </div>

      <div className="grid gap-6">
        {questions.map((question) => (
          <Card key={question.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{question.algorithm}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {question.question}
                </p>
              </div>

              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value: Question["options"][number]["level"]) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: value }))
                }
                className="grid gap-2"
              >
                {question.options.map((option) => (
                  <Label
                    key={option.id}
                    className="flex items-center gap-2 rounded-lg border p-4 cursor-pointer [&:has(:checked)]:border-primary"
                  >
                    <RadioGroupItem value={option.level} />
                    {option.text}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!isComplete}>
          Continue
        </Button>
      </div>
    </div>
  );
}
