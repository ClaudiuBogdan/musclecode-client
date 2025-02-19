export type OnboardingStep =
  | "welcome"
  | "concepts"
  | "goals"
  | "quiz"
  | "summary";

export interface UserGoals {
  learningPreference: "visual" | "practical" | "theoretical";
  timeCommitment: "low" | "medium" | "high";
  focusAreas: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
}

export interface QuizResults {
  algorithmKnowledge: Record<string, "unknown" | "familiar" | "confident">;
  score: number;
  completedAt: string;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  goals?: UserGoals;
  quizResults?: QuizResults;
}

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}
