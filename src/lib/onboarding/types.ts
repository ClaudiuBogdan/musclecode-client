export type OnboardingStep = "welcome" | "goals" | "quiz" | "summary";

export interface Collection {
  id: string;
  name: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  algorithmId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizGroup {
  id: string;
  name: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: number;
}

export interface UserGoals {
  studyTime: number;
  selectedCollections?: string[];
}

export interface OnboardingState {
  id: string;
  userId: string;
  currentStep: OnboardingStep;
  isCompleted: boolean;

  // Data from the user
  goals?: UserGoals;
  quizResults?: {
    answers: QuizAnswer[];
  };

  // Data used in the onboarding process
  collections?: Collection[];
  quizQuestions?: QuizGroup[];

  createdAt: string;
  updatedAt: string;
}

export interface StepProps {
  onNext?: () => void;
  onBack: () => void;
  onSkip: () => void;
}
