import { useState } from "react";

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

// Mock API call
const mockRunCode = async (
  request: CodeRunRequest
): Promise<CodeRunResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    output: `Executed ${request.language} code for ${request.algorithmId}`,
    testResults: [
      {
        passed: true,
        message: "Test case 1 passed",
        input: "[1, 2, 3]",
        expected: "6",
        actual: "6",
      },
    ],
    executionTime: 100,
  };
};

export function useRunCode() {
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async (request: CodeRunRequest) => {
    try {
      setIsRunning(true);
      const response = await mockRunCode(request);
      return response;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runCode,
    isRunning,
  };
}
