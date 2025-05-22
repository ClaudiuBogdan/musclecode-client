import axios from "axios";

import { env } from "@/config/env";

import { apiClient, getAuthHeaders } from "./client";

import type {
  AlgorithmTemplate,
  AlgorithmFile,
  Submission,
  AlgorithmPreview,
  RatingSchedule,
  DailyAlgorithm,
} from "@/types/algorithm";
import type { CodeExecutionResponse } from "@/types/testRunner";



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
  baseURL: env.VITE_EXECUTION_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

executionApi.interceptors.request.use(async (config) => {
  // Use the centralized auth headers function
  const headers = await getAuthHeaders();

  // Apply the headers to the config
  config.headers.Authorization = headers.Authorization;
  config.headers["X-User-Id"] = headers["X-User-Id"];

  return config;
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
