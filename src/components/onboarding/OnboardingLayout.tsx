import { ReactNode } from "react";
import { OnboardingStep } from "../../lib/onboarding/types";
import { StepIndicator } from "./StepIndicator";
import { Button } from "../ui/button";
import { NetworkStatusMonitor } from "./NetworkStatusMonitor";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: OnboardingStep;
  onSkip: () => void;
}

export function OnboardingLayout({
  children,
  currentStep,
  onSkip,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo and skip button */}
      <header className="border-b py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">MuscleCode</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Onboarding
          </span>
        </div>
        {currentStep !== "summary" && (
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
      </header>

      {/* Step indicator */}
      <div className="border-b">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Main content */}
      <main className="flex-1 container max-w-4xl py-8 px-4 md:py-12">
        {children}
      </main>

      {/* Network status monitor */}
      <NetworkStatusMonitor />
    </div>
  );
}
