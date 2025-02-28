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
    <>
      {/* Monitor network status and retry operations when connection is restored */}
      <NetworkStatusMonitor />

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">MuscleCode</h1>
            </div>
            <Button variant="ghost" onClick={onSkip}>
              Skip Onboarding
            </Button>
          </div>
        </header>

        <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <StepIndicator currentStep={currentStep} />
            <div className="bg-card rounded-lg border p-6">{children}</div>
          </div>
        </main>

        <footer className="border-t">
          <div className="container h-16 flex items-center justify-center px-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MuscleCode. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
