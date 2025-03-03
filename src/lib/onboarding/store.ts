import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  OnboardingState,
  OnboardingStep,
  UserGoals,
  QuizAnswer,
  Collection,
  QuizGroup,
} from "./types";
import { onboardingApi } from "./api";

// Define the steps sequence once
const STEPS: OnboardingStep[] = ["welcome", "goals", "quiz", "summary"];

// Define step types and their corresponding data types
type StepDataMap = {
  welcome: null;
  goals: UserGoals;
  quiz: QuizAnswer[];
};

interface OnboardingStore {
  // State
  onboardingState: OnboardingState | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // Filtered quiz questions based on selected collections
  filteredQuizQuestions: QuizGroup[];

  // Core actions
  fetchOnboardingState: () => Promise<void>;
  saveStep: <T extends keyof StepDataMap>(
    stepData: StepDataMap[T],
    stepType: T
  ) => Promise<boolean>;

  // Collection selection
  getSelectedCollections: () => Collection[];
  getAvailableCollections: () => Collection[];

  // Quiz filtering
  filterQuizQuestionsByCollections: (collectionIds: string[]) => void;

  // Navigation
  skipOnboarding: () => Promise<void>;
  skipStep: (step: OnboardingStep) => Promise<void>;

  goToNextStep: (step: OnboardingStep) => void;
  goToPreviousStep: (step: OnboardingStep) => void;

  // Error handling
  clearError: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      onboardingState: null,
      isLoading: false,
      error: null,
      initialized: false,
      filteredQuizQuestions: [],

      fetchOnboardingState: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const state = await onboardingApi.getOnboardingState();

          // Initialize with all quiz questions
          const filteredQuizQuestions = state.quizQuestions || [];

          set({
            onboardingState: state,
            filteredQuizQuestions,
            isLoading: false,
            initialized: true,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch onboarding state. Please check your internet connection.",
            isLoading: false,
          });
        }
      },

      // Unified save method for different step types
      saveStep: async <T extends keyof StepDataMap>(
        stepData: StepDataMap[T],
        stepType: T
      ) => {
        set({ isLoading: true, error: null });

        try {
          let success: boolean;
          const currentState = get().onboardingState;

          if (!currentState) {
            throw new Error("No onboarding state available");
          }

          // Declare variables outside case blocks to avoid linter errors
          let goalsData: UserGoals;
          let quizAnswers: QuizAnswer[];

          switch (stepType) {
            case "welcome":
              // Save user welcome
              success = await onboardingApi.saveUserWelcome();

              if (success) {
                // Update the local state to move to the next step
                set({
                  onboardingState: {
                    ...currentState,
                    currentStep: "goals",
                    updatedAt: new Date().toISOString(),
                  },
                  isLoading: false,
                });
              }
              break;
            case "goals":
              // Save user goals including study time and selected collections
              goalsData = stepData as UserGoals;
              success = await onboardingApi.saveUserGoals(goalsData);

              if (success) {
                // Update the local state with the new goals and move to the next step
                set({
                  onboardingState: {
                    ...currentState,
                    goals: goalsData,
                    currentStep: "quiz",
                    updatedAt: new Date().toISOString(),
                  },
                  isLoading: false,
                });
              }
              break;
            case "quiz":
              // Submit quiz answers
              quizAnswers = stepData as QuizAnswer[];
              success = await onboardingApi.submitQuiz(quizAnswers);

              if (success) {
                // Update the local state with the quiz results and move to the next step
                set({
                  onboardingState: {
                    ...currentState,
                    quizResults: {
                      answers: quizAnswers,
                    },
                    currentStep: "summary",
                    updatedAt: new Date().toISOString(),
                  },
                  isLoading: false,
                });
              }
              break;
            default:
              throw new Error(`Unknown step type: ${stepType}`);
          }

          return success;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : `Failed to save ${stepType} data. Please try again.`,
            isLoading: false,
          });
          return false;
        }
      },

      // Get selected collections from the state
      getSelectedCollections: () => {
        const { onboardingState } = get();
        if (!onboardingState || !onboardingState.collections) return [];

        const selectedIds = onboardingState.goals?.selectedCollections || [];
        return onboardingState.collections.filter((c) =>
          selectedIds.includes(c.id)
        );
      },

      // Get all available collections
      getAvailableCollections: () => {
        const { onboardingState } = get();
        return onboardingState?.collections || [];
      },

      // Filter quiz questions based on selected collections
      filterQuizQuestionsByCollections: (collectionIds: string[]) => {
        const { onboardingState } = get();
        if (!onboardingState || !onboardingState.quizQuestions) {
          set({ filteredQuizQuestions: [] });
          return;
        }

        // If no collections selected, use all questions
        if (!collectionIds.length) {
          set({ filteredQuizQuestions: onboardingState.quizQuestions });
          return;
        }

        // Filter quiz groups based on selected collections
        // This is a simplified approach - in a real implementation, you might have
        // a mapping between collections and quiz groups
        const filteredGroups = onboardingState.quizQuestions.filter((group) =>
          collectionIds.includes(group.id)
        );

        set({ filteredQuizQuestions: filteredGroups });
      },

      goToNextStep: (step: OnboardingStep) => {
        const currentState = get().onboardingState;
        if (!currentState) return;

        const nextStep = {
          welcome: "goals",
          goals: "quiz",
          quiz: "summary",
          summary: "summary",
        }[step] as OnboardingStep;

        if (nextStep) {
          set({
            onboardingState: {
              ...currentState,
              currentStep: nextStep,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      goToPreviousStep: (step: OnboardingStep) => {
        const currentState = get().onboardingState;
        if (!currentState) return;

        const previousStep = {
          welcome: "welcome",
          goals: "welcome",
          quiz: "goals",
          summary: "quiz",
        }[step] as OnboardingStep;

        if (previousStep) {
          set({
            onboardingState: {
              ...currentState,
              currentStep: previousStep,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // Skip onboarding
      skipOnboarding: async () => {
        const currentState = get().onboardingState;

        if (!currentState) {
          throw new Error("No onboarding state available");
        }

        try {
          set({ isLoading: true, error: null });
          const success = await onboardingApi.skipStep("summary");

          if (success) {
            set({
              onboardingState: {
                ...currentState,
                isCompleted: true,
                updatedAt: new Date().toISOString(),
              },
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to skip onboarding. Please try again.",
            isLoading: false,
          });
        }
      },

      // Skip a specific step
      skipStep: async (step: OnboardingStep) => {
        const currentState = get().onboardingState;

        if (!currentState) {
          throw new Error("No onboarding state available");
        }

        try {
          set({ isLoading: true, error: null });
          const success = await onboardingApi.skipStep(step);

          if (success) {
            // Find the next step after the skipped one
            const currentIndex = STEPS.indexOf(step);
            const nextStep =
              currentIndex < STEPS.length - 1
                ? STEPS[currentIndex + 1]
                : "summary";

            set({
              onboardingState: {
                ...currentState,
                currentStep: nextStep,
                updatedAt: new Date().toISOString(),
              },
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to skip step. Please try again.",
            isLoading: false,
          });
        }
      },

      // Error handling
      clearError: () => set({ error: null }),
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        // Only persist the current step for UI state continuity
        onboardingState: state.onboardingState
          ? { currentStep: state.onboardingState.currentStep }
          : null,
        initialized: state.initialized,
      }),
    }
  )
);
