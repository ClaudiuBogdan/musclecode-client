import { apiClient } from "../api/client";

import type { OnboardingState, UserGoals, QuizAnswer } from "./types";

const API_BASE = "/api/v1/onboarding";

export const onboardingApi = {
  /**
   * Get the current onboarding state including collections and quiz questions
   */
  getOnboardingState: async (): Promise<OnboardingState> => {
    const { data } = await apiClient.get<OnboardingState>(API_BASE);
    return data;
  },

  /**
   * Save user welcome
   */
  saveUserWelcome: async (): Promise<boolean> => {
    const { data } = await apiClient.post<boolean>(`${API_BASE}/welcome`);
    return data;
  },

  /**
   * Save user goals including study time and selected collections
   */
  saveUserGoals: async (goals: UserGoals): Promise<boolean> => {
    const { data } = await apiClient.post<boolean>(`${API_BASE}/goals`, {
      goals,
    });
    return data;
  },

  /**
   * Submit quiz answers
   */
  submitQuiz: async (answers: QuizAnswer[]): Promise<boolean> => {
    const { data } = await apiClient.post<boolean>(`${API_BASE}/quiz`, {
      answers,
    });
    return data;
  },

  /**
   * Skip a specific onboarding step
   */
  skipStep: async (step: string): Promise<boolean> => {
    const { data } = await apiClient.post<boolean>(`${API_BASE}/skip`, {
      step,
    });
    return data;
  },
};
