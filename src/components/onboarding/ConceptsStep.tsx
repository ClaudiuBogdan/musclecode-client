import { StepProps } from "../../lib/onboarding/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function ConceptsStep({ onNext, onBack }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          How MuscleCode Works
        </h2>
        <p className="text-muted-foreground">
          Our platform uses proven learning techniques to help you master
          algorithms effectively
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 py-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Recall</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Instead of passive reading, you'll actively engage with algorithm
            problems through:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Solving coding challenges that test your understanding
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Explaining concepts in your own words</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Identifying patterns and use cases in real problems</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Spaced Repetition</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We optimize your learning schedule based on scientific principles:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Review concepts just before you're likely to forget them
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Gradually increase intervals between practice sessions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Focus more time on challenging algorithms</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
