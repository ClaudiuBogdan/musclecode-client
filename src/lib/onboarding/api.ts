import { OnboardingState, UserGoals, QuizResults } from "./types";
import { apiClient } from "../api/client";

const API_BASE = "/api/v1/onboarding";

export const onboardingApi = {
  getOnboardingState: async (): Promise<OnboardingState> => {
    const { data } = await apiClient.get<OnboardingState>(API_BASE);
    return data;
  },

  updateOnboardingState: async (
    data: Partial<OnboardingState>
  ): Promise<OnboardingState> => {
    const { data: response } = await apiClient.patch<OnboardingState>(
      API_BASE,
      data
    );
    return response;
  },

  saveUserGoals: async (goals: UserGoals): Promise<OnboardingState> => {
    const { data } = await apiClient.post<OnboardingState>(
      `${API_BASE}/goals`,
      goals
    );
    return data;
  },

  submitQuiz: async (
    answers: QuizResults["algorithmKnowledge"]
  ): Promise<OnboardingState> => {
    const { data } = await apiClient.post<OnboardingState>(`${API_BASE}/quiz`, {
      answers,
    });
    return data;
  },
};
