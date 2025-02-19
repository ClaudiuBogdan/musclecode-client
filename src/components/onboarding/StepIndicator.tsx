import { OnboardingStep } from "../../lib/onboarding/types";
import { cn } from "../../lib/utils";

interface StepIndicatorProps {
  currentStep: OnboardingStep;
}

const steps: { key: OnboardingStep; label: string }[] = [
  { key: "welcome", label: "Welcome" },
  { key: "concepts", label: "Core Concepts" },
  { key: "goals", label: "Your Goals" },
  { key: "quiz", label: "Knowledge Check" },
  { key: "summary", label: "Summary" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
      <ol className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                  {
                    "border-primary bg-primary text-primary-foreground":
                      isCompleted || isCurrent,
                    "border-muted-foreground bg-background":
                      !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={cn("text-sm font-medium", {
                  "text-foreground": isCurrent,
                  "text-muted-foreground": !isCurrent,
                })}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
