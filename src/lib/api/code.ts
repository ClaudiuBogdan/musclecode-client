import { CodeExecutionResponse } from "@/types/testRunner";
import { apiClient } from "./client";
import {
  AlgorithmTemplate,
  AlgorithmFile,
  Submission,
  AlgorithmPreview,
  RatingSchedule,
} from "@/types/algorithm";
import axios from "axios";

export interface GetAlgorithmResponse {
  id: string;
  algorithmTemplate: AlgorithmTemplate;
  submissions: Submission[];
  notes: string;
  due: string;
  ratingSchedule: RatingSchedule;
  nextAlgorithm: AlgorithmPreview;
}

export interface CodeRunRequest {
  algorithmId: string;
  language: string;
  files: AlgorithmFile[];
}

export async function runCode(
  request: CodeRunRequest
): Promise<CodeExecutionResponse> {
  const executingApi = axios.create({
    baseURL: "http://localhost:3002",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { data } = await executingApi.post<CodeExecutionResponse>("/execute", {
    ...request,
    submissionId: "submissionId-123",
    userId: "userId-123",
  });
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
