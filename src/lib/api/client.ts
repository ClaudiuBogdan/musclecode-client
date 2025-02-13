// lib/api/client.ts
import axios from "axios";
import { ApiError } from "@/types/api";
import { getAuthService } from "../auth/auth-service";
import { env } from "@/config/env";
import { createLogger } from "../logger";

const logger = createLogger("ApiClient");

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const authService = getAuthService();
  try {
    const [user, token] = await Promise.all([
      authService.getUser(),
      authService.getToken(),
    ]);

    if (!token) {
      throw new Error("No authentication token available");
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
    throw error;
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError: ApiError = {
      name: "ApiError",
      message: error.response?.data?.message ?? "An error occurred",
      status: error.response?.status ?? 500,
    };

    // If we get a 401, the token might be invalid
    if (error.response?.status === 401) {
      logger.error("Authentication Token Invalid", {
        status: error.response.status,
        message: error.response?.data?.message,
        operation: "responseInterceptor",
      });
      const authService = getAuthService();
      await authService.logout();
    }

    throw apiError;
  }
);
