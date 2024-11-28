import { CodeExecutionResponse } from "@/types/testRunner";
import { apiClient } from "./client";
import { Algorithm } from "@/types/algorithm";

export interface CodeRunRequest {
  algorithmId: string;
  language: string;
  code: string;
}

export interface SubmissionRequest {
  timeSpent: number;
  code: string;
  difficulty: Difficulty;
  notes: string;
}

export interface TestResult {
  passed: boolean;
  message: string;
  input?: string;
  expected?: string;
  actual?: string;
}

export async function runCode(
  request: CodeRunRequest
): Promise<CodeExecutionResponse> {
  const { data } = await apiClient.post<CodeExecutionResponse>(
    "/api/code/run",
    request
  );
  return data;
}

export const getAlgorithm = async (algorithmId: string): Promise<Algorithm> => {
  const { data } = await apiClient.get<Algorithm>(
    `/api/algorithms/${algorithmId}`
  );
  return data;
};

export const saveSubmission = async (
  algorithmId: string,
  submission: SubmissionRequest
): Promise<void> => {
  const response = await fetch(`/api/algorithms/${algorithmId}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error("Failed to save submission");
  }
};
