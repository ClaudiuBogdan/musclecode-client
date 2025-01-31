import { CodeExecutionResponse } from "@/types/testRunner";
import { apiClient } from "./client";
import {
  AlgorithmTemplate,
  AlgorithmFile,
  Submission,
  AlgorithmPreview,
  RatingSchedule,
  DailyAlgorithm,
} from "@/types/algorithm";
import axios from "axios";
import { getAuthService } from "../auth/auth-service";

export interface GetAlgorithmResponse {
  id: string;
  algorithmTemplate: AlgorithmTemplate;
  submissions: Submission[];
  notes: string;
  due: string;
  ratingSchedule: RatingSchedule;
  nextAlgorithm: AlgorithmPreview | null;
  dailyAlgorithm: DailyAlgorithm | null;
}

export interface CodeRunRequest {
  algorithmId: string;
  language: string;
  files: AlgorithmFile[];
}

export const executionApi = axios.create({
  baseURL: process.env.VITE_EXECUTION_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

executionApi.interceptors.request.use(async (config) => {
  try {
    const authService = getAuthService();
    const token = await authService.getToken();

    if (!token) {
      throw new Error("No authentication token available");
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  } catch (error) {
    // If we can't get a token, we should redirect to login or handle appropriately
    console.error("[API Client] Failed to get authentication token:", error);
    throw error;
  }
});

export async function runCode(
  payload: CodeRunRequest
): Promise<CodeExecutionResponse> {
  const { data } = await executionApi.post<CodeExecutionResponse>(
    "/execute",
    payload
  );
  return data;
}

export const getAlgorithm = async (
  algorithmId: string
): Promise<GetAlgorithmResponse> => {
  const { data } = await apiClient.get<GetAlgorithmResponse>(
    `/api/v1/algorithms/practice/${algorithmId}`
  );
  return data;
};

export const saveSubmission = async (
  algorithmId: string,
  submission: Submission
): Promise<void> => {
  const { data } = await apiClient.post<void>(
    `/api/v1/algorithms/${algorithmId}/submissions`,
    submission
  );
  return data;
};

export const getSubmissions = async (
  algorithmId: string
): Promise<Submission[]> => {
  const { data } = await apiClient.get<Submission[]>(
    `/api/v1/algorithms/submissions/${algorithmId}/`
  );
  return data;
};
