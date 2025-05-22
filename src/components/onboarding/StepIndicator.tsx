import { cn } from "../../lib/utils";

import type { OnboardingStep } from "../../lib/onboarding/types";

interface StepIndicatorProps {
  currentStep: OnboardingStep;
}

const steps: { id: OnboardingStep; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "goals", label: "Goals" },
  { id: "quiz", label: "Quiz" },
  { id: "summary", label: "Summary" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step indicator */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>

            {/* Step label (only show on larger screens) */}
            <span
              className={cn(
                "ml-2 hidden text-sm sm:inline-block",
                isActive
                  ? "font-medium text-foreground"
                  : isCompleted
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-4 sm:w-10",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
