import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useOnboarding } from "../../hooks/useOnboarding";

export function SummaryStep({ onNext, onBack }: StepProps) {
  const { onboardingState } = useOnboarding();

  if (!onboardingState?.goals || !onboardingState?.quizResults) {
    return null;
  }

  const { goals, quizResults } = onboardingState;

  // Calculate recommended daily problems based on time commitment
  const recommendedProblems = {
    low: 2,
    medium: 4,
    high: 6,
  }[goals.timeCommitment];

  // Determine focus areas based on quiz results
  const focusAreas = Object.entries(quizResults.algorithmKnowledge)
    .filter(([, level]) => level !== "confident")
    .map(([algorithm]) => algorithm);

  // Get learning style recommendations
  const learningStyleTips = {
    visual:
      "We'll prioritize algorithm visualizations and animated explanations.",
    practical: "You'll get hands-on practice with real coding challenges.",
    theoretical:
      "We'll provide in-depth explanations and theoretical foundations.",
  }[goals.learningPreference];

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

        <Card className="p-6">
          <h3 className="font-medium mb-4">Focus Areas</h3>
          <div className="space-y-2">
            <p className="text-sm">
              Based on your knowledge assessment, we'll focus on:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {focusAreas.map((area) => (
                <li key={area} className="capitalize">
                  {area.replace("-", " ")}
                </li>
              ))}
            </ul>
          </div>
        </Card>

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
