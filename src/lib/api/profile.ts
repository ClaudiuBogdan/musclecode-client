import { z } from "zod";
import { apiClient } from "./client";
import { ApiError } from "@/types/api";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  avatar: z.string().url("Invalid URL").optional(),
  connections: z
    .object({
      github: z.boolean().default(false),
      google: z.boolean().default(false),
    })
    .default({ github: false, google: false }),
});

export type Profile = z.infer<typeof profileSchema>;

// Mock data for development
const mockProfile: Profile = {
  name: "John Doe",
  email: "john@example.com",
  bio: "Software engineer passionate about building great products",
  avatar: "https://avatars.githubusercontent.com/u/1234567",
  connections: {
    github: false,
    google: false,
  },
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof z.ZodError) {
    throw new ApiError("Invalid profile data", 422, error.issues);
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

export async function fetchProfile(): Promise<Profile> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(500); // Simulate network delay
      return mockProfile;
    }

    const { data } = await apiClient.get<Profile>("/api/profile");
    return profileSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(800); // Simulate network delay
      const updatedProfile = { ...mockProfile, ...data };
      return profileSchema.parse(updatedProfile);
    }

    const { data: responseData } = await apiClient.patch<Profile>(
      "/api/profile",
      data
    );
    return profileSchema.parse(responseData);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function connectProvider(
  provider: "github" | "google"
): Promise<Profile> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(1000); // Simulate network delay
      const updatedProfile = {
        ...mockProfile,
        connections: {
          ...mockProfile.connections,
          [provider]: true,
        },
      };
      return profileSchema.parse(updatedProfile);
    }

    const { data } = await apiClient.post<Profile>(
      `/api/profile/connect/${provider}`
    );
    return profileSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function disconnectProvider(
  provider: "github" | "google"
): Promise<Profile> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(1000); // Simulate network delay
      const updatedProfile = {
        ...mockProfile,
        connections: {
          ...mockProfile.connections,
          [provider]: false,
        },
      };
      return profileSchema.parse(updatedProfile);
    }

    const { data } = await apiClient.post<Profile>(
      `/api/profile/disconnect/${provider}`
    );
    return profileSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}
