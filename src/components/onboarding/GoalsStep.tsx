import { Loader2, AlertCircle, WifiOff, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { useOnboardingStore } from "../../lib/onboarding/store";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

import type { StepProps } from "../../lib/onboarding/types";

const timeCommitments = [
  { value: 15, label: "15 minutes daily" },
  { value: 30, label: "30 minutes daily" },
  { value: 45, label: "45 minutes daily" },
  { value: 60, label: "60 minutes daily" },
] as const;

export function GoalsStep({ onNext }: StepProps) {
  const {
    saveStep,
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

  // State for collections visibility
  const [showCollections, setShowCollections] = useState(false);

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
        selectedCollections,
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

  const handleRetry = () => {
    clearError();
    handleSubmit();
  };

  const toggleCollection = useCallback((collectionId: string) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        return prev.filter((id) => id !== collectionId);
      }
      return [...prev, collectionId];
    });
  }, []);

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
            <CardTitle>Learning Path</CardTitle>
            <CardDescription>
              We've crafted an optimized learning path covering essential
              algorithms and data structures to help you succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availableCollections.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Our comprehensive curriculum includes all fundamental
                  algorithms and data structures.
                </div>
              ) : showCollections ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select specific algorithm collections to focus on. This is
                    completely optional - our default path is designed to cover
                    all essential topics.
                  </p>
                  {availableCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => toggleCollection(collection.id)}
                      className={`flex items-center w-full p-3 rounded-lg border transition-colors gap-3 ${
                        selectedCollections.includes(collection.id)
                          ? "border-primary bg-accent/20"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        id={`collection-${collection.id}`}
                        checked={selectedCollections.includes(collection.id)}
                        onCheckedChange={() => toggleCollection(collection.id)}
                        className="h-5 w-5 border-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      />
                      <div className="grid gap-1 text-left">
                        <Label
                          htmlFor={`collection-${collection.id}`}
                          className="text-base font-medium leading-tight"
                        >
                          {collection.name}
                        </Label>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                  <Button
                    onClick={() => setShowCollections(false)}
                    variant="outline"
                    className="mt-4"
                  >
                    Use Recommended Path
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-accent/20 rounded-lg border border-accent">
                    <div className="mr-4 shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        Recommended Learning Path
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our carefully designed curriculum covers all essential
                        algorithms and data structures
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      onClick={() => setShowCollections(true)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Advanced: Customize collections
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button onClick={handleSubmit}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
