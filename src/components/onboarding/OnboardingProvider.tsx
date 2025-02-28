import { useEffect } from "react";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { WelcomeStep } from "./WelcomeStep";
import { ConceptsStep } from "./ConceptsStep";
import { GoalsStep } from "./GoalsStep";
import { QuizStep } from "./QuizStep";
import { SummaryStep } from "./SummaryStep";
import { OnboardingLayout } from "./OnboardingLayout";
import { Loader2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 rounded-lg border border-destructive p-6 text-center max-w-md">
          <h2 className="font-semibold text-lg mb-2">
            Error Loading Onboarding
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            onClick={() => fetchOnboardingState()}
          >
            Try Again
          </button>
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
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={handleSkip}
          />
        );
      case "concepts":
        return (
          <ConceptsStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={handleSkip}
          />
        );
      case "goals":
        return (
          <GoalsStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={handleSkip}
          />
        );
      case "quiz":
        return (
          <QuizStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={handleSkip}
          />
        );
      case "summary":
        return <SummaryStep onBack={goToPreviousStep} onSkip={handleSkip} />;
      default:
        return (
          <WelcomeStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={handleSkip}
          />
        );
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep} onSkip={handleSkip}>
      {renderStep()}
    </OnboardingLayout>
  );
}
