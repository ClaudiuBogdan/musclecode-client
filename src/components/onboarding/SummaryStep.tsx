import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useOnboarding } from "../../hooks/useOnboarding";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export function SummaryStep({ onNext, onBack }: StepProps) {
  const { onboardingState, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!onboardingState?.goals || !onboardingState?.quizResults) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your personalized learning path. Please try again.
          </AlertDescription>
        </Alert>
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { goals, quizResults } = onboardingState;

  // Calculate recommended daily problems based on study time
  const recommendedProblems =
    quizResults.recommendations.dailyAlgorithmsCount ??
    {
      low: 2,
      medium: 4,
      high: 6,
    }[
      goals.studyTime >= 60 ? "high" : goals.studyTime >= 30 ? "medium" : "low"
    ];

  // Get recommended topics from the quiz results
  const recommendedTopics = quizResults.recommendations.recommendedTopics;

  // Get learning style recommendations based on study time
  const learningStyleTips = {
    visual:
      "We'll prioritize algorithm visualizations and animated explanations.",
    practical: "You'll get hands-on practice with real coding challenges.",
    theoretical:
      "We'll provide in-depth explanations and theoretical foundations.",
  }["practical"]; // Default to practical since learning preference is not in the new API

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Your Personalized Learning Path
        </h2>
        <p className="text-muted-foreground">
          Based on your preferences and current knowledge, here's our
          recommended approach
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="font-medium mb-4">Daily Practice Plan</h3>
          <div className="space-y-2">
            <p className="text-sm">
              We recommend solving{" "}
              <span className="font-medium">
                {recommendedProblems} problems
              </span>{" "}
              daily to maintain steady progress while matching your available
              time.
            </p>
            <p className="text-sm text-muted-foreground">
              You can always adjust this in your settings later.
            </p>
          </div>
        </Card>

        {recommendedTopics.length > 0 && (
          <Card className="p-6">
            <h3 className="font-medium mb-4">Focus Areas</h3>
            <div className="space-y-2">
              <p className="text-sm">
                Based on your knowledge assessment, we'll focus on:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {recommendedTopics.map((topic: string) => (
                  <li key={topic} className="capitalize">
                    {topic.replace("-", " ")}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-medium mb-4">Learning Approach</h3>
          <div className="space-y-2">
            <p className="text-sm">{learningStyleTips}</p>
            <p className="text-sm text-muted-foreground">
              Your dashboard will be customized to match your preferred learning
              style.
            </p>
          </div>
        </Card>

        {quizResults.recommendations.studyPlan.milestones && (
          <Card className="p-6">
            <h3 className="font-medium mb-4">4-Week Study Plan</h3>
            <div className="space-y-4">
              {quizResults.recommendations.studyPlan.milestones.map(
                (milestone) => (
                  <div key={milestone.week} className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Week {milestone.week}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {milestone.focus}
                    </p>
                    {milestone.targetTopics.length > 0 && (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {milestone.targetTopics.map((topic: string) => (
                          <li
                            key={topic}
                            className="capitalize text-muted-foreground"
                          >
                            {topic.replace("-", " ")}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Start Learning</Button>
      </div>
    </div>
  );
}
