import { useState } from "react";
import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useOnboarding } from "../../hooks/useOnboarding";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";

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
  const { saveGoals, skipOnboarding, isLoading } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeCommitment, setTimeCommitment] =
    useState<(typeof timeCommitments)[number]["value"]>("medium");
  const [learningStyle, setLearningStyle] =
    useState<(typeof learningStyles)[number]["value"]>("practical");
  const [experienceLevel, setExperienceLevel] =
    useState<(typeof experienceLevels)[number]["value"]>("beginner");

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError(null);

    // TODO: FIXME: This is a temporary solution to save the goals
    saveGoals(
      {
        timeCommitment,
        learningPreference: learningStyle,
        experienceLevel,
        focusAreas: [], // This will be determined by the quiz
      } as any,
      {
        onSuccess: () => {
          onNext();
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to save your goals. Please try again.";
          setError(errorMessage);
          toast.error("Error", {
            description: errorMessage,
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={skipOnboarding}
          disabled={isSubmitting}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
