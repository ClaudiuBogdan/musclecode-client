import { CodeExecutionResponse } from "@/types/testRunner";
import { apiClient } from "./client";
import { Algorithm, AlgorithmFile, Submission } from "@/types/algorithm";

export interface CodeRunRequest {
  algorithmId: string;
  language: string;
  files: AlgorithmFile[];
}

export async function runCode(
  request: CodeRunRequest
): Promise<CodeExecutionResponse> {
  const { data } = await apiClient.post<CodeExecutionResponse>(
    "/api/code/run",
    {
      ...request,
      submissionId: "submissionId-123",
      userId: "userId-123",
    }
  );
  return data;
}

export const getAlgorithm = async (
  algorithmId: string
): Promise<{
  algorithm: Algorithm;
  nextAlgorithm: Pick<Algorithm, "id" | "title"> | null;
}> => {
  const { data } = await apiClient.get<{
    algorithm: Algorithm;
    nextAlgorithm: Algorithm | null;
  }>(`/api/algorithms/${algorithmId}`);
  return data;
};

export const saveSubmission = async (
  algorithmId: string,
  submission: Submission
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

export const getSubmissions = async (
  algorithmId: string
): Promise<Submission[]> => {
  const { data } = await apiClient.get<Submission[]>(
    `/api/algorithms/${algorithmId}/submissions`
  );
  return data;
};