import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { useRouter } from "@tanstack/react-router";

export function SummaryStep({ onBack }: StepProps) {
  const router = useRouter();
  const { onboardingState, isLoading, saveStep } = useOnboardingStore();

  // Handle completing onboarding and navigating to dashboard
  const handleComplete = async () => {
    // Mark onboarding as completed
    await saveStep({ isCompleted: true }, "update");
    // Navigate to dashboard
    router.navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!onboardingState?.goals) {
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
          <Button
            onClick={() => useOnboardingStore.getState().fetchOnboardingState()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { goals, quizResults } = onboardingState;

  // Default recommendations based on experience level if quizResults is null
  const defaultRecommendations = {
    beginner: {
      dailyAlgorithmsCount: 2,
      recommendedTopics: [
        "arrays",
        "strings",
        "basic-sorting",
        "linked-lists",
        "stacks-queues",
      ],
      studyPlan: {
        milestones: [
          {
            week: 1,
            focus: "Fundamentals of Data Structures",
            targetTopics: ["arrays", "strings", "basic-sorting"],
          },
          {
            week: 2,
            focus: "Linear Data Structures",
            targetTopics: ["linked-lists", "stacks-queues"],
          },
          {
            week: 3,
            focus: "Basic Algorithms",
            targetTopics: ["searching", "basic-sorting"],
          },
          {
            week: 4,
            focus: "Problem Solving Patterns",
            targetTopics: ["two-pointers", "sliding-window"],
          },
        ],
      },
    },
    intermediate: {
      dailyAlgorithmsCount: 4,
      recommendedTopics: [
        "trees",
        "graphs",
        "dynamic-programming",
        "advanced-sorting",
        "recursion",
      ],
      studyPlan: {
        milestones: [
          {
            week: 1,
            focus: "Tree Structures and Algorithms",
            targetTopics: ["binary-trees", "binary-search-trees"],
          },
          {
            week: 2,
            focus: "Graph Theory Fundamentals",
            targetTopics: ["graph-traversal", "shortest-paths"],
          },
          {
            week: 3,
            focus: "Dynamic Programming Basics",
            targetTopics: ["memoization", "tabulation"],
          },
          {
            week: 4,
            focus: "Advanced Problem Solving",
            targetTopics: ["greedy-algorithms", "divide-and-conquer"],
          },
        ],
      },
    },
    advanced: {
      dailyAlgorithmsCount: 6,
      recommendedTopics: [
        "advanced-graphs",
        "advanced-dynamic-programming",
        "bit-manipulation",
        "system-design",
        "concurrency",
      ],
      studyPlan: {
        milestones: [
          {
            week: 1,
            focus: "Advanced Graph Algorithms",
            targetTopics: ["network-flow", "minimum-spanning-trees"],
          },
          {
            week: 2,
            focus: "Complex Dynamic Programming",
            targetTopics: ["state-compression", "dp-optimization"],
          },
          {
            week: 3,
            focus: "Specialized Algorithms",
            targetTopics: ["string-algorithms", "computational-geometry"],
          },
          {
            week: 4,
            focus: "Real-world Applications",
            targetTopics: ["system-design", "distributed-algorithms"],
          },
        ],
      },
    },
  };

  // Use quiz results if available, otherwise use defaults based on experience level
  const recommendations =
    quizResults?.recommendations ||
    defaultRecommendations[goals.experienceLevel || "beginner"];

  // Calculate recommended daily problems based on study time
  const recommendedProblems =
    recommendations.dailyAlgorithmsCount ??
    {
      low: 2,
      medium: 4,
      high: 6,
    }[
      goals.studyTime >= 60 ? "high" : goals.studyTime >= 30 ? "medium" : "low"
    ];

  // Get recommended topics
  const recommendedTopics = recommendations.recommendedTopics || [];

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
                Based on your{" "}
                {quizResults ? "knowledge assessment" : "experience level"},
                we'll focus on:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {recommendedTopics.map((topic: string) => (
                  <li key={topic} className="capitalize">
                    {topic.replace(/-/g, " ")}
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

        {recommendations.studyPlan?.milestones && (
          <Card className="p-6">
            <h3 className="font-medium mb-4">4-Week Study Plan</h3>
            <div className="space-y-4">
              {recommendations.studyPlan.milestones.map((milestone) => (
                <div key={milestone.week} className="space-y-2">
                  <h4 className="text-sm font-medium">Week {milestone.week}</h4>
                  <p className="text-sm text-muted-foreground">
                    {milestone.focus}
                  </p>
                  {milestone.targetTopics &&
                    milestone.targetTopics.length > 0 && (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {milestone.targetTopics.map((topic: string) => (
                          <li
                            key={topic}
                            className="capitalize text-muted-foreground"
                          >
                            {topic.replace(/-/g, " ")}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleComplete}>Start Learning</Button>
      </div>
    </div>
  );
}
