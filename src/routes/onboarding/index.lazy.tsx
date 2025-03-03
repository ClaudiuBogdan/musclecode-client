import { createLazyFileRoute } from "@tanstack/react-router";
import { OnboardingLayout } from "../../components/onboarding/OnboardingLayout";
import { WelcomeStep } from "../../components/onboarding/WelcomeStep";
import { GoalsStep } from "../../components/onboarding/GoalsStep";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { SummaryStep } from "../../components/onboarding/SummaryStep";
import { Loader2 } from "lucide-react";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { useRouter } from "@tanstack/react-router";
import { OnboardingStep, StepProps } from "../../lib/onboarding/types";
import { useEffect } from "react";
import { NetworkStatusMonitor } from "../../components/onboarding/NetworkStatusMonitor";

function OnboardingPage() {
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

  // Always fetch onboarding state when the component mounts
  useEffect(() => {
    fetchOnboardingState();
  }, [fetchOnboardingState]);

  const handleGoToNextStep = () => {
    if (onboardingState?.currentStep) {
      goToNextStep(onboardingState.currentStep);
    }
  };

  const handleGoToPreviousStep = () => {
    if (onboardingState?.currentStep) {
      goToPreviousStep(onboardingState.currentStep);
    }
  };

  // Handle navigation after completing or skipping onboarding
  const handleSkip = async () => {
    await skipOnboarding();
    router.navigate({ to: "/" });
  };

  if (isLoading && !onboardingState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !onboardingState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          Failed to load onboarding: {error}
        </p>
        <button
          onClick={() => fetchOnboardingState()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // If we still don't have onboarding state, show a loading indicator
  if (!onboardingState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const steps: Record<OnboardingStep, React.ComponentType<StepProps>> = {
    welcome: WelcomeStep,
    goals: GoalsStep,
    quiz: QuizStep,
    summary: SummaryStep,
  };

  const CurrentStep = steps[onboardingState.currentStep];

  return (
    <>
      <NetworkStatusMonitor />
      <OnboardingLayout
        currentStep={onboardingState.currentStep}
        onSkip={handleSkip}
      >
        <CurrentStep
          onNext={handleGoToNextStep}
          onBack={handleGoToPreviousStep}
          onSkip={handleSkip}
        />
      </OnboardingLayout>
    </>
  );
}

export const Route = createLazyFileRoute("/onboarding/")({
  component: OnboardingPage,
});
