import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  OnboardingState,
  OnboardingStep,
  UserGoals,
  AlgorithmKnowledge,
} from "./types";
import { onboardingApi } from "./api";

// Define the steps sequence once
const STEPS: OnboardingStep[] = [
  "welcome",
  "concepts",
  "goals",
  "quiz",
  "summary",
];

// Define step types and their corresponding data types
type GoalsInput = {
  learningGoals: string[];
  studyTime: number;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  preferredTopics: string[];
  timeCommitment?: string;
};

type StepDataMap = {
  goals: GoalsInput;
  quiz: AlgorithmKnowledge;
  update: Partial<OnboardingState>;
};

interface OnboardingStore {
  // State
  onboardingState: OnboardingState | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  retryCount: number;

  // Core actions
  fetchOnboardingState: () => Promise<void>;
  saveStep: <T extends keyof StepDataMap>(
    stepData: StepDataMap[T],
    stepType: T
  ) => Promise<boolean>;

  // Navigation
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => Promise<void>;
  skipOnboarding: () => Promise<void>;

  // Error handling
  clearError: () => void;
}

// Utility function to retry API calls with exponential backoff
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number
): Promise<T> => {
  let retries = 0;
  let lastError: Error;

  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;

      // Exponential backoff
      if (retries < maxRetries) {
        const delay = Math.min(1000 * 2 ** retries, 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      onboardingState: null,
      isLoading: false,
      error: null,
      initialized: false,
      retryCount: 0,

      fetchOnboardingState: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const state = await retryApiCall(
            () => onboardingApi.getOnboardingState(),
            3
          );
          set({
            onboardingState: state,
            isLoading: false,
            retryCount: 0,
            initialized: true,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch onboarding state. Please check your internet connection.",
            isLoading: false,
            retryCount: get().retryCount + 1,
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
          let updatedState: OnboardingState;

          switch (stepType) {
            case "goals": {
              // The API expects a full UserGoals object, but the backend will fill in the missing fields
              const goalsData = stepData as GoalsInput;
              updatedState = await retryApiCall(
                () =>
                  onboardingApi.saveUserGoals({
                    id: "",
                    userId: "",
                    onboardingId: "",
                    createdAt: "",
                    updatedAt: "",
                    ...goalsData,
                  } as UserGoals),
                3
              );
              break;
            }
            case "quiz":
              updatedState = await retryApiCall(
                () => onboardingApi.submitQuiz(stepData as AlgorithmKnowledge),
                3
              );
              break;
            case "update":
              updatedState = await retryApiCall(
                () =>
                  onboardingApi.updateOnboardingState(
                    stepData as Partial<OnboardingState>
                  ),
                3
              );
              break;
            default:
              throw new Error(`Unknown step type: ${stepType}`);
          }

          set({
            onboardingState: updatedState,
            isLoading: false,
            retryCount: 0,
          });
          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : `Failed to save ${stepType} data. Please try again.`,
            isLoading: false,
            retryCount: get().retryCount + 1,
          });
          return false;
        }
      },

      // Navigation: Go to next step
      goToNextStep: async () => {
        const { onboardingState } = get();
        if (!onboardingState) return;

        const currentIndex = STEPS.indexOf(onboardingState.currentStep);

        // If we're at the last step, complete onboarding
        if (currentIndex === STEPS.length - 1) {
          await get().saveStep({ isCompleted: true }, "update");
          return;
        }

        // Otherwise go to next step
        const nextStep = STEPS[currentIndex + 1];
        await get().saveStep({ currentStep: nextStep }, "update");
      },

      // Navigation: Go to previous step
      goToPreviousStep: async () => {
        const { onboardingState } = get();
        if (!onboardingState) return;

        const currentIndex = STEPS.indexOf(onboardingState.currentStep);
        if (currentIndex > 0) {
          const prevStep = STEPS[currentIndex - 1];
          await get().saveStep({ currentStep: prevStep }, "update");
        }
      },

      // Skip onboarding
      skipOnboarding: async () => {
        await get().saveStep({ isCompleted: true }, "update");
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
