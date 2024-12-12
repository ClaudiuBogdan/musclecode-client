import { Algorithm, Submission, TestResults, AlgorithmFile } from "../../types";
import { CodeLanguage, Difficulty } from "@/types/algorithm";

export const createMockAlgorithmFile = (
  overrides?: Partial<AlgorithmFile>
): AlgorithmFile => ({
  name: "index.js",
  language: "javascript" as CodeLanguage,
  content: "function solution() {}",
  readOnly: false,
  ...overrides,
});

export const createMockAlgorithm = (
  overrides?: Partial<Algorithm>
): Algorithm => ({
  id: "test-algorithm",
  title: "Test Algorithm",
  description: "Test algorithm description",
  difficulty: "easy" as Difficulty,
  files: [createMockAlgorithmFile()],
  completed: false,
  notes: "",
  ...overrides,
});

export const createMockSubmission = (
  overrides?: Partial<Submission>
): Submission => ({
  id: "test-submission",
  algorithmId: "test-algorithm",
  language: "javascript" as CodeLanguage,
  code: "function solution() {}",
  timeSpent: 0,
  difficulty: "easy" as Difficulty,
  notes: "",
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockTestResults = (
  overrides?: Partial<TestResults>
): TestResults => ({
  passed: true,
  totalTests: 1,
  testResults: [
    {
      name: "Test case 1",
      passed: true,
      message: "Test passed successfully",
    },
  ],
  ...overrides,
});
