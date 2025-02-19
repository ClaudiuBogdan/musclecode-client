import { OnboardingState } from "./types";

// In-memory store for the mock API
let mockOnboardingState: OnboardingState = {
  currentStep: "welcome",
  isCompleted: false,
};

export const mockApi = {
  getOnboardingState: async (): Promise<OnboardingState> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockOnboardingState;
  },

  updateOnboardingState: async (
    data: Partial<OnboardingState>
  ): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockOnboardingState = { ...mockOnboardingState, ...data };
  },

  completeOnboarding: async (): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockOnboardingState = {
      ...mockOnboardingState,
      isCompleted: true,
    };
  },
};
