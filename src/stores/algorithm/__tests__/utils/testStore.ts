import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AlgorithmState, AlgorithmData, CodeLanguage } from "../../types";

export const createEmptyAlgorithmData = (): AlgorithmData => ({
  code: {
    activeLanguage: "javascript" as CodeLanguage,
    activeTab: "index.js",
    storedCode: {
      javascript: {
        "index.js": "",
      },
    },
    initialStoredCode: {
      javascript: {
        "index.js": "",
      },
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
  },
  algorithms: {},
});

export const createTestStore = () =>
  create<AlgorithmState>()(immer(() => createInitialState()));

export const mockAlgorithmState = (
  algorithmId: string,
  partialState?: Partial<AlgorithmData>
): AlgorithmState => ({
  metadata: {
    isLoading: false,
    activeAlgorithmId: algorithmId,
  },
  algorithms: {
    [algorithmId]: {
      ...createEmptyAlgorithmData(),
      ...partialState,
    },
  },
});
