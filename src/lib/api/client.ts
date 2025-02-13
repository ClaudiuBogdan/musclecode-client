// lib/api/client.ts
import axios from "axios";
import { ApiError } from "@/types/api";
import { getAuthService } from "../auth/auth-service";
import { env } from "@/config/env";
import { createLogger } from "../logger";
import { AuthErrorCode, AuthError } from "../auth/errors";
import { AppError, createAuthError } from "@/lib/errors/types";

const logger = createLogger("ApiClient");

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authService = getAuthService();

apiClient.interceptors.request.use(async (config) => {
  try {
    const [user, token] = await Promise.all([
      authService.getUser(),
      authService.getToken(),
    ]);

    if (!token) {
      logger.error("No Authentication Token Available");
      const authError = createAuthError(
        AuthErrorCode.TOKEN_NOT_FOUND,
        "No authentication token available"
      );
      throw authError;
    }

    config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-User-Id"] = user?.id;

    return config;
  } catch (error) {
    // If we can't get a token, we should redirect to login or handle appropriately
    logger.error("Authentication Token Retrieval Failed", {
      error: error instanceof Error ? error.message : String(error),
      operation: "requestInterceptor",
    });

    // Ensure we're throwing an AuthError
    if (error instanceof AuthError) {
      throw error;
    }

    const authError = createAuthError(
      AuthErrorCode.UNAUTHORIZED,
      "Failed to authenticate request"
    );
    throw authError;
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        logger.error("Authentication Token Invalid", {
          status: error.response.status,
          message: error.response?.data?.message,
          operation: "responseInterceptor",
        });

        // Try to refresh token or redirect to login
        try {
          await authService.login();
          const authError = createAuthError(
            AuthErrorCode.SESSION_EXPIRED,
            "Session expired. Please log in again."
          );
          throw authError;
        } catch {
          const authError = createAuthError(
            AuthErrorCode.SESSION_EXPIRED,
            "Session expired. Please log in again."
          );
          throw authError;
        }
      }

      // Handle permission errors
      if (error.response?.status === 403) {
        const authError = createAuthError(
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          "You don't have permission to perform this action"
        );
        throw authError;
      }

      // Handle other API errors
      const apiError: ApiError = {
        name: "ApiError",
        message: error.response?.data?.message ?? "An error occurred",
        status: error.response?.status ?? 500,
      };
      throw AppError.fromError(new Error(apiError.message), "api");
    }

    // Handle non-axios errors
    if (error instanceof AuthError) {
      throw error;
    }

    throw AppError.fromError(
      error instanceof Error ? error : new Error(String(error)),
      "runtime"
    );
  }
);
