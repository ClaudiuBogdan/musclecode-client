import { z } from "zod";

import { ApiError } from "@/types/api";

import { apiClient } from "./client";

export const notificationSettingsSchema = z.object({
  email: z.object({
    marketing: z.boolean(),
    security: z.boolean(),
    updates: z.boolean(),
    weeklyReport: z.boolean(),
  }),
  push: z.object({
    newAlgorithm: z.boolean(),
    algorithmUpdates: z.boolean(),
    dailyProgress: z.boolean(),
  }),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

// Mock data for development
const mockNotificationSettings: NotificationSettings = {
  email: {
    marketing: true,
    security: true,
    updates: true,
    weeklyReport: true,
  },
  push: {
    newAlgorithm: true,
    algorithmUpdates: false,
    dailyProgress: true,
  },
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof z.ZodError) {
    throw new ApiError("Invalid notification settings", 422, error.issues);
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

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(500); // Simulate network delay
      return mockNotificationSettings;
    }

    const { data } = await apiClient.get<NotificationSettings>(
      "/api/notifications/settings"
    );
    return notificationSettingsSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(800); // Simulate network delay
      return {
        ...mockNotificationSettings,
        ...settings,
      };
    }

    const { data } = await apiClient.patch<NotificationSettings>(
      "/api/notifications/settings",
      settings
    );
    return notificationSettingsSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}
