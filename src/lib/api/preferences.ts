import { z } from "zod";
import { apiClient } from "./client";
import { ApiError } from "@/types/api";

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  dailyAlgorithms: z.number().min(1).max(10),
  difficulty: z.enum(["easy", "medium", "hard", "all"]),
});

export type Preferences = z.infer<typeof preferencesSchema>;

// Mock data for development
const mockPreferences: Preferences = {
  theme: "system",
  dailyAlgorithms: 3,
  difficulty: "all",
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof z.ZodError) {
    throw new ApiError("Invalid preferences", 422, error.issues);
  }
  if (error instanceof ApiError) {
    throw error;
  }
  throw new ApiError(
    "An unexpected error occurred",
    500,
    error instanceof Error ? error.message : String(error)
  );
};

export async function fetchPreferences(): Promise<Preferences> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(500); // Simulate network delay
      return mockPreferences;
    }

    const { data } = await apiClient.get<Preferences>("/api/preferences");
    return preferencesSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updatePreferences(
  preferences: Partial<Preferences>
): Promise<Preferences> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(800); // Simulate network delay
      return {
        ...mockPreferences,
        ...preferences,
      };
    }

    const { data } = await apiClient.patch<Preferences>(
      "/api/preferences",
      preferences
    );
    return preferencesSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}
