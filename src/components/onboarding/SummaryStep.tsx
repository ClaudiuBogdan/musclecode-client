import { useRouter } from "@tanstack/react-router";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  WifiOff,
} from "lucide-react";

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



export function SummaryStep() {
  const router = useRouter();
  const {
    onboardingState,
    isLoading,
    getSelectedCollections,
    error,
    clearError,
  } = useOnboardingStore();

  // Get selected collections
  const selectedCollections = getSelectedCollections();

  // Handle completion
  const handleComplete = async () => {
    clearError();
    try {
      router.navigate({ to: "/" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  if (isLoading || !onboardingState) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
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
              ? "There was a problem completing your onboarding due to network connectivity issues. Please check your connection and try again."
              : "There was a problem completing your onboarding. Please try again."}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                clearError();
                handleComplete();
              }}
            >
              Retry
            </Button>
            {isNetworkError && (
              <Button
                variant="outline"
                onClick={() => {
                  clearError();
                  router.navigate({ to: "/" });
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate study time in a readable format
  const studyTime = onboardingState.goals?.studyTime || 30;
  const studyTimeFormatted =
    studyTime >= 60
      ? `${Math.floor(studyTime / 60)} hour${Math.floor(studyTime / 60) !== 1 ? "s" : ""}${studyTime % 60 > 0 ? ` ${studyTime % 60} minutes` : ""}`
      : `${studyTime} minutes`;

  // Count answered quiz questions
  const answeredQuestions = onboardingState.quizResults?.answers.length || 0;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          You're All Set!
        </h2>
        <p className="text-muted-foreground">
          We've personalized your learning experience based on your preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Your Study Plan
            </CardTitle>
            <CardDescription>
              Your personalized daily learning schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Daily Commitment</h4>
              <p className="text-sm">{studyTimeFormatted} per day</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Selected Collections</h4>
              {selectedCollections.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {selectedCollections.map((collection) => (
                    <li key={collection.id} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      {collection.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">All collections included</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Knowledge Assessment
            </CardTitle>
            <CardDescription>Based on your quiz responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Quiz Completion</h4>
              <p className="text-sm">
                {answeredQuestions > 0
                  ? `You answered ${answeredQuestions} questions`
                  : "Quiz skipped"}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What's Next</h4>
              <p className="text-sm">
                Based on your selections and quiz results, we've prepared a
                personalized learning path for you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 border">
        <h3 className="font-semibold text-lg mb-2">
          Ready to start your journey?
        </h3>
        <p className="text-muted-foreground mb-4">
          Your personalized algorithm learning experience is ready. You can
          always adjust your preferences later in your profile settings.
        </p>
        <div className="flex items-center gap-4">
          <Button onClick={handleComplete} className="gap-2">
            Start Learning
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
