import { useState } from "react";
import {
  StepProps,
  QuizAnswer,
  QuizQuestion,
} from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function QuizStep({ onBack, onNext }: StepProps) {
  const {
    saveStep,
    skipStep,
    isLoading,
    filteredQuizQuestions,
    error,
    clearError,
  } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      // Format answers for the API
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const success = await saveStep(quizAnswers, "quiz");
      if (success && onNext) {
        onNext();
      } else {
        setLocalError("Failed to save your quiz results. Please try again.");
      }
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await skipStep("quiz");
    if (onNext) {
      onNext();
    }
  };

  // Count total questions across all groups
  const totalQuestions = filteredQuizQuestions.reduce(
    (total, group) => total + group.questions.length,
    0
  );

  // Check if all questions have been answered
  const answeredQuestions = Object.keys(answers).length;
  const isComplete = answeredQuestions === totalQuestions && totalQuestions > 0;

  // Calculate progress percentage
  const progressPercentage =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;

  // Handle retry
  const handleRetry = () => {
    clearError();
    setLocalError(null);
    if (isComplete) {
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no quiz questions are available
  if (filteredQuizQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Knowledge Assessment
          </h2>
          <p className="text-muted-foreground">
            No quiz questions are available for your selected collections. You
            can proceed to the next step.
          </p>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  // Display error state
  const displayError = error || localError;
  if (displayError) {
    const isNetworkError =
      displayError.toLowerCase().includes("network") ||
      displayError.toLowerCase().includes("internet") ||
      displayError.toLowerCase().includes("connection") ||
      displayError.toLowerCase().includes("offline") ||
      displayError.toLowerCase().includes("failed to fetch");

    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>{isNetworkError ? "Network Error" : "Error"}</AlertTitle>
          <AlertDescription className="space-y-2">
            {isNetworkError && (
              <div className="flex items-center gap-2 mt-1">
                <WifiOff className="h-4 w-4" />
                <span>Connection problem detected</span>
              </div>
            )}
            <p>{displayError}</p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <p className="text-muted-foreground text-center max-w-md">
            {isNetworkError
              ? "There was a problem submitting your quiz answers due to network connectivity issues. Please check your connection and try again."
              : "There was a problem submitting your quiz answers. Please try again."}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleRetry}>Retry</Button>
            {isNetworkError && (
              <Button
                variant="outline"
                onClick={() => {
                  clearError();
                  setLocalError(null);
                }}
              >
                Continue Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Knowledge Assessment
        </h2>
        <p className="text-muted-foreground">
          Answer these questions to help us assess your current knowledge level
        </p>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {answeredQuestions} of {totalQuestions} questions answered (
            {progressPercentage}%)
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {filteredQuizQuestions.map((group) => (
          <div key={group.id} className="space-y-4">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p className="text-sm text-muted-foreground">{group.description}</p>

            <div className="grid gap-4">
              {group.questions.map((question) => (
                <QuizQuestionCard
                  key={question.id}
                  question={question}
                  selectedOption={answers[question.id]}
                  onSelectOption={(optionIndex) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: optionIndex,
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isComplete}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
        <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
          Skip
        </Button>
      </div>
    </div>
  );
}

interface QuizQuestionCardProps {
  question: QuizQuestion;
  selectedOption?: number;
  onSelectOption: (optionIndex: number) => void;
}

function QuizQuestionCard({
  question,
  selectedOption,
  onSelectOption,
}: QuizQuestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={
            selectedOption !== undefined ? selectedOption.toString() : undefined
          }
          onValueChange={(value) => onSelectOption(parseInt(value, 10))}
          className="grid gap-2"
        >
          {question.options.map((option, index) => (
            <Label
              key={index}
              className="flex items-center gap-2 rounded-lg border p-4 cursor-pointer [&:has(:checked)]:border-primary"
            >
              <RadioGroupItem value={index.toString()} />
              {option}
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
