import { z } from "zod";

import { ApiError } from "@/types/api";

import { apiClient } from "./client";

// Schemas
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const twoFactorStatusSchema = z.object({
  enabled: z.boolean(),
  qrCode: z.string().optional(), // Base64 QR code for setup
  secret: z.string().optional(), // Secret key for manual setup
});

export type PasswordUpdate = z.infer<typeof passwordUpdateSchema>;
export type TwoFactorStatus = z.infer<typeof twoFactorStatusSchema>;

// Mock data for development
const mockTwoFactorStatus: TwoFactorStatus = {
  enabled: false,
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof z.ZodError) {
    throw new ApiError("Invalid data", 422, error.issues);
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

export async function updatePassword(data: PasswordUpdate): Promise<void> {
  try {
    // Validate input
    passwordUpdateSchema.parse(data);

    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(1000);
      // Simulate password validation
      if (data.currentPassword === "wrong") {
        throw new ApiError("Current password is incorrect", 400);
      }
      return;
    }

    await apiClient.post("/api/security/password", data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function fetchTwoFactorStatus(): Promise<TwoFactorStatus> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(500);
      return mockTwoFactorStatus;
    }

    const { data } = await apiClient.get<TwoFactorStatus>("/api/security/2fa");
    return twoFactorStatusSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function enableTwoFactor(): Promise<TwoFactorStatus> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(1000);
      mockTwoFactorStatus.enabled = true;
      mockTwoFactorStatus.qrCode = "data:image/png;base64,iVBORw0KGgoAAAANSU"; // Mock QR code
      mockTwoFactorStatus.secret = "ABCD EFGH IJKL MNOP"; // Mock secret
      return mockTwoFactorStatus;
    }

    const { data } = await apiClient.post<TwoFactorStatus>(
      "/api/security/2fa/enable"
    );
    return twoFactorStatusSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function disableTwoFactor(): Promise<TwoFactorStatus> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(1000);
      mockTwoFactorStatus.enabled = false;
      delete mockTwoFactorStatus.qrCode;
      delete mockTwoFactorStatus.secret;
      return mockTwoFactorStatus;
    }

    const { data } = await apiClient.post<TwoFactorStatus>(
      "/api/security/2fa/disable"
    );
    return twoFactorStatusSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}
