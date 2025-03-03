import { useEffect } from "react";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { WelcomeStep } from "./WelcomeStep";
import { GoalsStep } from "./GoalsStep";
import { QuizStep } from "./QuizStep";
import { SummaryStep } from "./SummaryStep";
import { OnboardingLayout } from "./OnboardingLayout";
import { Loader2, WifiOff, AlertCircle } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

/**
 * Top-level component that manages the onboarding flow and renders the appropriate step
 * based on the current state in the Zustand store.
 */
export function OnboardingProvider() {
  const router = useRouter();
  const {
    onboardingState,
    isLoading,
    error,
    goToNextStep,
    goToPreviousStep,
    skipOnboarding,
    fetchOnboardingState,
    clearError,
  } = useOnboardingStore();

  // Fetch onboarding state on mount
  useEffect(() => {
    // Always fetch on mount to ensure we have the latest state
    fetchOnboardingState();
  }, [fetchOnboardingState]);

  // Check if onboarding is completed and redirect to dashboard
  useEffect(() => {
    if (onboardingState?.isCompleted) {
      router.navigate({ to: "/" });
    }
  }, [onboardingState?.isCompleted, router]);

  // Handle navigation after completing or skipping onboarding
  const handleSkip = async () => {
    await skipOnboarding();
    router.navigate({ to: "/" });
  };

  // Create wrapper functions that don't pass parameters
  const handleNext = () => {
    if (onboardingState?.currentStep) {
      goToNextStep(onboardingState.currentStep);
    }
  };

  const handleBack = () => {
    if (onboardingState?.currentStep) {
      goToPreviousStep(onboardingState.currentStep);
    }
  };

  // Loading state
  if (isLoading && !onboardingState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state without specific onboarding UI
  if (error && !onboardingState) {
    const isNetworkError =
      error.toLowerCase().includes("network") ||
      error.toLowerCase().includes("internet") ||
      error.toLowerCase().includes("connection") ||
      error.toLowerCase().includes("offline") ||
      error.toLowerCase().includes("failed to fetch");

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 rounded-lg border border-destructive p-6 text-center max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold text-lg">
              {isNetworkError ? "Network Error" : "Error Loading Onboarding"}
            </AlertTitle>
            <AlertDescription>
              {isNetworkError ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <WifiOff className="h-5 w-5" />
                    <span>Connection problem detected</span>
                  </div>
                  <p>{error}</p>
                  <p className="text-sm">
                    Please check your internet connection and try again.
                  </p>
                </div>
              ) : (
                error
              )}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => {
                clearError();
                fetchOnboardingState();
              }}
            >
              Try Again
            </Button>
            {isNetworkError && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.navigate({ to: "/" })}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default to welcome step if no state exists yet
  const currentStep = onboardingState?.currentStep || "welcome";

  // Render the appropriate step based on the current state
  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WelcomeStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case "goals":
        return (
          <GoalsStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case "quiz":
        return (
          <QuizStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case "summary":
        return <SummaryStep onBack={handleBack} onSkip={handleSkip} />;
      default:
        return (
          <WelcomeStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep} onSkip={handleSkip}>
      {/* Display error banner if there's an error but we have onboarding state */}
      {error && onboardingState && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearError();
                fetchOnboardingState();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {renderStep()}
    </OnboardingLayout>
  );
}
