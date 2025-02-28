import { useState } from "react";
import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

const timeCommitments = [
  { value: "low", label: "15-30 minutes daily" },
  { value: "medium", label: "30-60 minutes daily" },
  { value: "high", label: "60+ minutes daily" },
] as const;

const learningStyles = [
  {
    value: "visual",
    label: "Visual Learning",
    description: "Learn through diagrams and visualizations",
  },
  {
    value: "practical",
    label: "Hands-on Practice",
    description: "Learn by solving problems",
  },
  {
    value: "theoretical",
    label: "Theoretical Understanding",
    description: "Learn through detailed explanations",
  },
] as const;

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "New to algorithms" },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Some algorithm experience",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Experienced with algorithms",
  },
] as const;

export function GoalsStep({ onNext, onBack }: StepProps) {
  const router = useRouter();
  const { saveStep, skipOnboarding, isLoading, error, clearError } =
    useOnboardingStore();

  const [timeCommitment, setTimeCommitment] =
    useState<(typeof timeCommitments)[number]["value"]>("medium");
  const [learningStyle, setLearningStyle] =
    useState<(typeof learningStyles)[number]["value"]>("practical");
  const [experienceLevel, setExperienceLevel] =
    useState<(typeof experienceLevels)[number]["value"]>("beginner");

  const handleSubmit = async () => {
    clearError();

    // Convert time commitment to study time in minutes
    const studyTimeMap = {
      low: 20,
      medium: 45,
      high: 90,
    };

    const studyTime = studyTimeMap[timeCommitment];

    // Attempt to save goals with new simplified approach
    const success = await saveStep(
      {
        timeCommitment,
        studyTime,
        experienceLevel,
        learningGoals: ["improve_skills", "prepare_for_interviews"],
        preferredTopics: [learningStyle], // Use learning style as a preferred topic
      },
      "goals"
    );

    if (success && onNext) {
      onNext();
    } else {
      // Error will be set in store and displayed
      toast.error("Failed to save goals", {
        description: "Please check your connection and try again.",
      });
    }
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.navigate({ to: "/" });
  };

  const handleRetry = () => {
    handleSubmit();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Display error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-muted-foreground text-center max-w-md">
            There was a problem saving your goals. This might be due to network
            connectivity issues.
          </p>
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Customize Your Learning Journey
        </h2>
        <p className="text-muted-foreground">
          Help us personalize your experience by sharing your preferences
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Daily Time Commitment</h3>
          <RadioGroup
            value={timeCommitment}
            onValueChange={(value: (typeof timeCommitments)[number]["value"]) =>
              setTimeCommitment(value)
            }
            className="grid gap-2"
          >
            {timeCommitments.map((option) => (
              <Label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border p-4 cursor-pointer [&:has(:checked)]:border-primary"
              >
                <RadioGroupItem value={option.value} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Preferred Learning Style</h3>
          <RadioGroup
            value={learningStyle}
            onValueChange={(value: (typeof learningStyles)[number]["value"]) =>
              setLearningStyle(value)
            }
            className="grid gap-2"
          >
            {learningStyles.map((option) => (
              <Label
                key={option.value}
                className="flex flex-col gap-1 rounded-lg border p-4 cursor-pointer [&:has(:checked)]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.value} />
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-sm text-muted-foreground pl-6">
                  {option.description}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Experience Level</h3>
          <RadioGroup
            value={experienceLevel}
            onValueChange={(
              value: (typeof experienceLevels)[number]["value"]
            ) => setExperienceLevel(value)}
            className="grid gap-2"
          >
            {experienceLevels.map((option) => (
              <Label
                key={option.value}
                className="flex flex-col gap-1 rounded-lg border p-4 cursor-pointer [&:has(:checked)]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.value} />
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-sm text-muted-foreground pl-6">
                  {option.description}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>Continue</Button>
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
