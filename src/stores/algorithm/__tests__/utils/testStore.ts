import { getLanguageExtension } from "@/lib/utils/algorithm";
import { AlgorithmState, AlgorithmData } from "../../types";
import { AlgorithmFile, CodeLanguage } from "@/types/algorithm";
import { v4 as uuidv4 } from "uuid";

const createEmptyFile = (
  name: string,
  language: CodeLanguage
): AlgorithmFile => ({
  id: uuidv4(),
  name,
  type: name.includes("test") ? "test" : "solution",
  content: "",
  language,
  extension: getLanguageExtension(language),
  readOnly: false,
  required: true,
});

const createInitialStoredCode = () => {
  const languages: Record<CodeLanguage, { fileName: string }> = {
    javascript: { fileName: "solution.js" },
    typescript: { fileName: "solution.ts" },
    python: { fileName: "solution.py" },
    go: { fileName: "solution.go" },
    java: { fileName: "Solution.java" },
    cpp: { fileName: "solution.cpp" },
  };

  return Object.entries(languages).reduce(
    (acc, [language, { fileName }]) => {
      acc[language as CodeLanguage] = {
        [fileName]: createEmptyFile(fileName, language as CodeLanguage),
      };
      return acc;
    },
    {} as Record<CodeLanguage, Record<string, AlgorithmFile>>
  );
};

export const createEmptyAlgorithmData = (): AlgorithmData => {
  const storedCode = createInitialStoredCode();

  return {
    code: {
      activeLanguage: "javascript" as CodeLanguage,
      activeTab: "solution.js",
      storedCode,
      initialStoredCode: JSON.parse(JSON.stringify(storedCode)), // Deep clone
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
    userProgress: {
      isSubmitting: false,
      completed: false,
      notes: {
        content: "",
        state: "saved",
      },
      submissionNote: "",
      lastSubmissionDate: null,
      submissions: [],
    },
    metadata: {
      algorithmId: "",
      template: null,
      nextAlgorithm: null,
    },
  };
};

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
