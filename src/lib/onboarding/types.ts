export type OnboardingStep =
  | "welcome"
  | "concepts"
  | "goals"
  | "quiz"
  | "summary";

export interface UserGoals {
  id: string;
  userId: string;
  onboardingId: string;
  learningGoals: string[];
  studyTime: number;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  preferredTopics: string[];
  createdAt: string;
  updatedAt: string;
}

interface QuizAnswer {
  topic: string;
  familiarity: "unknown" | "familiar" | "confident";
}

interface QuizMetadata {
  count: number;
  version: string;
  timestamp: string;
}

interface StudyPlanMilestone {
  week: number;
  focus: string;
  targetTopics: string[];
}

interface StudyPlan {
  focusAreas: string[];
  milestones: StudyPlanMilestone[];
  suggestedTimeAllocation: {
    review: number | null;
    theory: number | null;
    practice: number | null;
  };
}

interface QuizRecommendations {
  metadata: {
    version: string;
    generatedAt: string;
  };
  studyPlan: StudyPlan;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  recommendedTopics: string[];
  dailyAlgorithmsCount: number | null;
}

export interface QuizResults {
  id: string;
  userId: string;
  onboardingId: string;
  answers: {
    topics: QuizAnswer[];
    metadata: QuizMetadata;
  };
  score: number;
  recommendations: QuizRecommendations;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  id: string;
  userId: string;
  currentStep: OnboardingStep;
  isCompleted: boolean;
  goals?: UserGoals;
  quizResults?: QuizResults;
  createdAt: string;
  updatedAt: string;
}

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}
