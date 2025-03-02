import { createLazyFileRoute } from "@tanstack/react-router";
import { useOnboarding } from "../../hooks/useOnboarding";
import { OnboardingLayout } from "../../components/onboarding/OnboardingLayout";
import { WelcomeStep } from "../../components/onboarding/WelcomeStep";
import { ConceptsStep } from "../../components/onboarding/ConceptsStep";
import { GoalsStep } from "../../components/onboarding/GoalsStep";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { SummaryStep } from "../../components/onboarding/SummaryStep";
import { Loader2 } from "lucide-react";

function OnboardingPage() {
  const { onboardingState, isLoading, skipOnboarding, handleNext, handleBack } =
    useOnboarding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!onboardingState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          Failed to load onboarding
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const steps = {
    welcome: WelcomeStep,
    concepts: ConceptsStep,
    goals: GoalsStep,
    quiz: QuizStep,
    summary: SummaryStep,
  };

  const CurrentStep = steps[onboardingState.currentStep];

  return (
    <OnboardingLayout
      currentStep={onboardingState.currentStep}
      onSkip={skipOnboarding}
    >
      <CurrentStep
        onNext={handleNext}
        onBack={handleBack}
        onSkip={skipOnboarding}
      />
    </OnboardingLayout>
  );
}

export const Route = createLazyFileRoute("/onboarding/")({
  component: OnboardingPage,
});
