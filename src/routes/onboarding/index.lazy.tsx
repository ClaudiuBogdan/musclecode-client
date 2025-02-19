import { createLazyFileRoute } from "@tanstack/react-router";
import { useOnboarding } from "../../hooks/useOnboarding";
import { OnboardingLayout } from "../../components/onboarding/OnboardingLayout";
import { WelcomeStep } from "../../components/onboarding/WelcomeStep";
import { ConceptsStep } from "../../components/onboarding/ConceptsStep";
import { GoalsStep } from "../../components/onboarding/GoalsStep";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { SummaryStep } from "../../components/onboarding/SummaryStep";

function OnboardingPage() {
  const { onboardingState, isLoading, skipOnboarding, handleNext, handleBack } =
    useOnboarding();

  if (isLoading || !onboardingState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
