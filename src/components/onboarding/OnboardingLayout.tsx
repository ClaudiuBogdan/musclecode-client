
import { StepIndicator } from "./StepIndicator";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

import type { OnboardingStep } from "../../lib/onboarding/types";
import type { ReactNode } from "react";

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
  // Map step to title and description
  const stepInfo = {
    welcome: {
      title: "Welcome to MuscleCode 💪",
      description: "Let's set up your personalized learning experience.",
    },
    goals: {
      title: "Your Learning Goals",
      description: "Tell us what you want to learn.",
    },
    quiz: {
      title: "Quick Knowledge Check",
      description: "Let's see what you already know.",
    },
    summary: {
      title: "All Set!",
      description: "Your learning journey is ready to begin.",
    },
  };

  const { title, description } = stepInfo[currentStep];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimalist header */}
      <header className="border-b bg-background py-4 px-6 flex items-center justify-between">
        <CardTitle className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          MuscleCode
        </CardTitle>

        {currentStep !== "summary" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground"
          >
            Skip onboarding
          </Button>
        )}
      </header>

      {/* Main content */}
      <div className="container px-4 py-8 max-w-3xl mx-auto flex-1 flex flex-col">
        <Card className="rounded-lg border shadow-2xs flex-1">
          <CardHeader className="p-6 pb-4 space-y-1">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>

          {/* Step indicator */}
          <div className="px-6 py-2 border-y">
            <StepIndicator currentStep={currentStep} />
          </div>

          <CardContent className="p-6 pt-6 flex-1">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
