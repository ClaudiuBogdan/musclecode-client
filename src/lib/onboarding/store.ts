import { create } from "zustand";
import { persist } from "zustand/middleware";

import { onboardingApi } from "./api";

import type {
  OnboardingState,
  OnboardingStep,
  UserGoals,
  QuizAnswer,
  Collection,
  QuizGroup,
} from "./types";

// Define the steps sequence once
const STEPS: OnboardingStep[] = ["welcome", "goals", "quiz", "summary"];

// Define step types and their corresponding data types
interface StepDataMap {
  welcome: null;
  goals: UserGoals;
  quiz: QuizAnswer[];
}

interface OnboardingStore {
  // State
  onboardingState: OnboardingState | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // Filtered quiz questions based on selected collections
  filteredQuizQuestions: QuizGroup[];

  // Helper methods for internal use
  updateState: (partialState: Partial<OnboardingState>) => void;
  handleApiError: (error: unknown, action: string) => void;

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
      // Initial state
      onboardingState: null,
      isLoading: false,
      error: null,
      initialized: false,
      filteredQuizQuestions: [],

      // Helper functions
      updateState: (partialState: Partial<OnboardingState>) => {
        const currentState = get().onboardingState;
        if (!currentState) return;

        set({
          onboardingState: {
            ...currentState,
            ...partialState,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      handleApiError: (error: unknown, action: string) => {
        set({
          error:
            error instanceof Error
              ? error.message
              : `Failed to ${action}. Please try again.`,
          isLoading: false,
        });
      },

      // Core actions
      fetchOnboardingState: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const state = await onboardingApi.getOnboardingState();
          set({
            onboardingState: state,
            filteredQuizQuestions: state.quizQuestions ?? [],
            isLoading: false,
            initialized: true,
          });
        } catch (error) {
          get().handleApiError(error, "fetch onboarding state");
        }
      },

      saveStep: async <T extends keyof StepDataMap>(
        stepData: StepDataMap[T],
        stepType: T
      ) => {
        const { onboardingState } = get();
        if (!onboardingState) {
          set({ error: "No onboarding state available" });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          let success = false;

          // Handle API calls based on step type
          switch (stepType) {
            case "welcome":
              success = await onboardingApi.saveUserWelcome();
              if (success) get().updateState({ currentStep: "goals" });
              break;

            case "goals": {
              const goalsData = stepData as UserGoals;
              success = await onboardingApi.saveUserGoals(goalsData);
              if (success)
                {get().updateState({ goals: goalsData, currentStep: "quiz" });}
              break;
            }

            case "quiz": {
              const quizAnswers = stepData as QuizAnswer[];
              success = await onboardingApi.submitQuiz(quizAnswers);
              if (success) {
                get().updateState({
                  quizResults: { answers: quizAnswers },
                  isCompleted: true,
                  currentStep: "summary",
                });
              }
              break;
            }
          }

          set({ isLoading: false });
          return success;
        } catch (error) {
          get().handleApiError(error, `save ${stepType} data`);
          return false;
        }
      },

      // Collection selection methods
      getSelectedCollections: () => {
        const { onboardingState } = get();
        if (!onboardingState?.collections) return [];

        const selectedIds = onboardingState.goals?.selectedCollections ?? [];
        return onboardingState.collections.filter((c) =>
          selectedIds.includes(c.id)
        );
      },

      getAvailableCollections: () => get().onboardingState?.collections ?? [],

      // Quiz filtering
      filterQuizQuestionsByCollections: (collectionIds: string[]) => {
        const { onboardingState } = get();
        if (!onboardingState?.quizQuestions) {
          set({ filteredQuizQuestions: [] });
          return;
        }

        // If no collections selected, use all questions
        const filteredGroups = !collectionIds.length
          ? onboardingState.quizQuestions
          : onboardingState.quizQuestions.filter((group) =>
              collectionIds.includes(group.collectionId)
            );

        set({ filteredQuizQuestions: filteredGroups });
      },

      // Navigation methods
      goToNextStep: (step: OnboardingStep) => {
        const currentIndex = STEPS.indexOf(step);
        if (currentIndex < 0 || currentIndex >= STEPS.length - 1) return;

        get().updateState({ currentStep: STEPS[currentIndex + 1] });
      },

      goToPreviousStep: (step: OnboardingStep) => {
        const currentIndex = STEPS.indexOf(step);
        if (currentIndex <= 0) return;

        get().updateState({ currentStep: STEPS[currentIndex - 1] });
      },

      skipOnboarding: async () => {
        if (!get().onboardingState) {
          set({ error: "No onboarding state available" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const success = await onboardingApi.skipStep("summary");
          if (success) {
            get().updateState({ isCompleted: true });
          }
          set({ isLoading: false });
        } catch (error) {
          get().handleApiError(error, "skip onboarding");
        }
      },

      skipStep: async (step: OnboardingStep) => {
        if (!get().onboardingState) {
          set({ error: "No onboarding state available" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const success = await onboardingApi.skipStep(step);

          if (success) {
            const currentIndex = STEPS.indexOf(step);
            const nextStep =
              currentIndex < STEPS.length - 1
                ? STEPS[currentIndex + 1]
                : "summary";

            get().updateState({ currentStep: nextStep });
          }

          set({ isLoading: false });
        } catch (error) {
          get().handleApiError(error, "skip step");
        }
      },

      // Error handling
      clearError: () => set({ error: null }),
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        onboardingState: state.onboardingState,
        initialized: state.initialized,
      }),
    }
  )
);
