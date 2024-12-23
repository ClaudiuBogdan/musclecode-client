import { CodeExecutionResponse } from "@/types/testRunner";
import { apiClient } from "./client";
import {
  AlgorithmTemplate,
  AlgorithmFile,
  Submission,
} from "@/types/algorithm";

interface NextAlgorithm {
  id: string;
  title: string;
}

interface GetAlgorithmResponse {
  algorithm: AlgorithmTemplate;
  nextAlgorithm: NextAlgorithm | null;
}

export interface CodeRunRequest {
  algorithmId: string;
  language: string;
  files: AlgorithmFile[];
}

export async function runCode(
  request: CodeRunRequest
): Promise<CodeExecutionResponse> {
  const { data } = await apiClient.post<CodeExecutionResponse>(
    "/api/v1/code/run",
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
): Promise<GetAlgorithmResponse> => {
  const { data } = await apiClient.get<GetAlgorithmResponse>(
    `/api/v1/algorithms/${algorithmId}`
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
    `/api/v1/algorithms/${algorithmId}/submissions`
  );
  return data;
};