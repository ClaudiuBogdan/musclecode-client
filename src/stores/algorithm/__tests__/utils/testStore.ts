import { AlgorithmState, AlgorithmData } from "../../types";
import { CodeLanguage } from "@/types/algorithm";

export const createEmptyAlgorithmData = (): AlgorithmData => ({
  code: {
    activeLanguage: "javascript" as CodeLanguage,
    activeTab: "solution.js",
    storedCode: {
      javascript: { "solution.js": "" },
      typescript: { "solution.ts": "" },
      python: { "solution.py": "" },
      go: { "solution.go": "" },
      java: { "Solution.java": "" },
      cpp: { "solution.cpp": "" },
    },
    initialStoredCode: {
      javascript: { "solution.js": "" },
      typescript: { "solution.ts": "" },
      python: { "solution.py": "" },
      go: { "solution.go": "" },
      java: { "Solution.java": "" },
      cpp: { "solution.cpp": "" },
    },
  },
  timer: {
    initialStartTime: Date.now(),
    pausedAt: null,
    totalPausedTime: 0,
  },
  execution: {
    isExecuting: false,
    executionResult: null,
    error: null,
  },
  submission: {
    isSubmitting: false,
    completed: false,
    submissionNotes: "",
    globalNotes: "",
  },
  metadata: {
    algorithmId: "",
    description: "",
    nextAlgorithm: null,
  },
});

export const createInitialState = (): AlgorithmState => ({
  metadata: {
    isLoading: false,
    activeAlgorithmId: null,
    error: null,
  },
  algorithms: {},
});

export const mockAlgorithmState = (
  algorithmId: string,
  partialState?: Partial<AlgorithmData>
): AlgorithmState => ({
  metadata: {
    isLoading: false,
    activeAlgorithmId: algorithmId,
    error: null,
  },
  algorithms: {
    [algorithmId]: {
      ...createEmptyAlgorithmData(),
      metadata: {
        ...createEmptyAlgorithmData().metadata,
        algorithmId,
      },
      ...partialState,
    },
  },
});
