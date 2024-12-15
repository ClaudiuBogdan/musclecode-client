// lib/api/client.ts
import axios from "axios";
import { ApiError } from "@/types/api";

export const apiClient = axios.create({
  baseURL: "http://localhost:5173",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message ?? "An error occurred",
      status: error.response?.status ?? 500,
    };
    throw apiError;
  }
);
