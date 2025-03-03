import { useState, useEffect } from "react";
import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { Checkbox } from "../ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Slider } from "../ui/slider";

const timeCommitments = [
  { value: 15, label: "15 minutes daily" },
  { value: 30, label: "30 minutes daily" },
  { value: 45, label: "45 minutes daily" },
  { value: 60, label: "60 minutes daily" },
  { value: 90, label: "90 minutes daily" },
  { value: 120, label: "2 hours daily" },
] as const;

export function GoalsStep({ onNext, onBack }: StepProps) {
  const router = useRouter();
  const {
    saveStep,
    skipOnboarding,
    isLoading,
    error,
    clearError,
    onboardingState,
    getAvailableCollections,
    filterQuizQuestionsByCollections,
  } = useOnboardingStore();

  // State for study time
  const [studyTime, setStudyTime] = useState<number>(30);

  // State for selected collections
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Get available collections
  const availableCollections = getAvailableCollections();

  // Initialize selected collections if we have goals data
  useEffect(() => {
    if (onboardingState?.goals?.selectedCollections) {
      setSelectedCollections(onboardingState.goals.selectedCollections);
    }

    if (onboardingState?.goals?.studyTime) {
      setStudyTime(onboardingState.goals.studyTime);
    }
  }, [onboardingState?.goals]);

  const handleSubmit = async () => {
    clearError();

    // Filter quiz questions based on selected collections
    filterQuizQuestionsByCollections(selectedCollections);

    // Save goals
    const success = await saveStep(
      {
        studyTime,
        selectedCollections:
          selectedCollections.length > 0
            ? selectedCollections
            : availableCollections.map((c) => c.id), // Select all if none selected
      },
      "goals"
    );

    if (success && onNext) {
      onNext();
    } else if (!success) {
      // Error will be set in store and displayed via the Alert component
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
    clearError();
    handleSubmit();
  };

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        return prev.filter((id) => id !== collectionId);
      } else {
        return [...prev, collectionId];
      }
    });
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
    const isNetworkError =
      error.toLowerCase().includes("network") ||
      error.toLowerCase().includes("internet") ||
      error.toLowerCase().includes("connection") ||
      error.toLowerCase().includes("offline") ||
      error.toLowerCase().includes("failed to fetch");

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
            <p>{error}</p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <p className="text-muted-foreground text-center max-w-md">
            {isNetworkError
              ? "There was a problem saving your goals due to network connectivity issues. Please check your connection and try again."
              : "There was a problem saving your goals. Please try again."}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleRetry}>Retry</Button>
            {isNetworkError && (
              <Button variant="outline" onClick={() => clearError()}>
                Continue Editing
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
          Customize Your Learning Journey
        </h2>
        <p className="text-muted-foreground">
          Help us personalize your experience by sharing your preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Study Time</CardTitle>
            <CardDescription>
              How much time can you dedicate to learning algorithms each day?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Slider
                value={[studyTime]}
                onValueChange={(values) => setStudyTime(values[0])}
                min={5}
                max={240}
                step={5}
                className="my-6"
              />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">5 min</span>
                <span className="font-medium">{studyTime} minutes daily</span>
                <span className="text-sm text-muted-foreground">4 hours</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {timeCommitments.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={studyTime === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStudyTime(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Collections</CardTitle>
            <CardDescription>
              Select the algorithm collections you want to focus on. If none are
              selected, all collections will be included.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availableCollections.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No collections available. The default collection will include
                  all algorithms.
                </div>
              ) : (
                availableCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-start space-x-3 space-y-0"
                  >
                    <Checkbox
                      id={`collection-${collection.id}`}
                      checked={selectedCollections.includes(collection.id)}
                      onCheckedChange={() => toggleCollection(collection.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`collection-${collection.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {collection.name}
                      </Label>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
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
