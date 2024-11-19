import { apiClient } from "./client";
export interface CodeRunRequest {
  algorithmId: string;
  language: string;
  code: string;
}

export interface TestResult {
  passed: boolean;
  message: string;
  input?: string;
  expected?: string;
  actual?: string;
}

export interface CodeRunResponse {
  success: boolean;
  output: string;
  testResults: TestResult[];
  executionTime: number;
}

export async function runCode(
  request: CodeRunRequest
): Promise<CodeRunResponse> {
  const { data } = await apiClient.post<CodeRunResponse>(
    "/api/code/run",
    request
  );
  return data;
}
