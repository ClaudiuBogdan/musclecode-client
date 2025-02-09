// lib/api/client.ts
import axios from "axios";
import { ApiError } from "@/types/api";
import { getAuthService } from "../auth/auth-service";
import { env } from "@/config/env";

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const authService = getAuthService();
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
    console.error("[API Client] Failed to get authentication token:", error);
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

    // If we get a 401/403, the token might be invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      const authService = getAuthService();
      await authService.logout();
    }

    throw apiError;
  }
);
