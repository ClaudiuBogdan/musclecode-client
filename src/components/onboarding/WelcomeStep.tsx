import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { useOnboardingStore } from "../../lib/onboarding/store";

export function WelcomeStep({ onNext, onSkip }: StepProps) {
  const { saveStep } = useOnboardingStore();

  const handleNext = async () => {
    await saveStep(null, "welcome");
    onNext?.();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      <p className="text-xl text-muted-foreground">
        Your personal trainer for mastering algorithms and data structures
      </p>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="mb-2 text-2xl">🧠</div>
            <h3 className="font-medium mb-1">Active Recall</h3>
            <p className="text-sm text-muted-foreground">
              Strengthen your understanding through active practice
            </p>
          </div>

          <div>
            <div className="mb-2 text-2xl">⏰</div>
            <h3 className="font-medium mb-1">Spaced Repetition</h3>
            <p className="text-sm text-muted-foreground">
              Review at optimal intervals for long-term retention
            </p>
          </div>

          <div>
            <div className="mb-2 text-2xl">📈</div>
            <h3 className="font-medium mb-1">Personalized Path</h3>
            <p className="text-sm text-muted-foreground">
              Learn at your own pace with tailored recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={onSkip}>
          Skip Setup
        </Button>
        <Button onClick={handleNext}>Get Started</Button>
      </div>
    </div>
  );
}
