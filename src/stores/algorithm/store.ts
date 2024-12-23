import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AlgorithmState, AlgorithmData, StoredCode } from "./types/state";
import { AlgorithmUserProgress, DailyAlgorithm } from "@/types/algorithm";
import { getAlgorithmTemplate } from "@/lib/api/algorithm";
import { CodeExecutionResponse } from "@/types/testRunner";

const initialAlgorithmData: AlgorithmData = {
  code: {
    activeLanguage: "typescript",
    activeTab: "solution",
    storedCode: {} as StoredCode,
    initialStoredCode: {} as StoredCode,
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
    submissionNote: "",
    notes: {
      content: "",
      state: "saved",
    },
    lastSubmissionDate: null,
    submissions: [],
  },
  metadata: {
    algorithmId: "",
    template: null,
    nextAlgorithm: null,
  },
};

const initialState: AlgorithmState = {
  metadata: {
    isLoading: false,
    activeAlgorithmId: null,
    error: null,
  },
  algorithms: {},
};

export const useAlgorithmStore = create<AlgorithmState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      // Algorithm template management
      setActiveAlgorithm: async (algorithmId: string) => {
        set((state) => ({
          metadata: {
            ...state.metadata,
            isLoading: true,
            activeAlgorithmId: algorithmId,
          },
        }));

        try {
          const template = await getAlgorithmTemplate(algorithmId);

          set((state) => ({
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...initialAlgorithmData,
                metadata: {
                  algorithmId,
                  template,
                  nextAlgorithm: null, // You might want to fetch this from the API
                },
              },
            },
            metadata: {
              ...state.metadata,
              isLoading: false,
              error: null,
            },
          }));
        } catch (error) {
          set((state) => ({
            metadata: {
              ...state.metadata,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load algorithm",
            },
          }));
        }
      },

      // User progress management
      updateUserProgress: (
        algorithmId: string,
        progress: Partial<AlgorithmUserProgress>
      ) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              userProgress: {
                ...state.algorithms[algorithmId].userProgress,
                ...progress,
              },
            },
          },
        }));
      },

      updateDailyProgress: (
        algorithmId: string,
        dailyProgress: DailyAlgorithm
      ) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              userProgress: {
                ...state.algorithms[algorithmId].userProgress,
                dailyProgress,
                completed: dailyProgress.completed,
                lastSubmissionDate: dailyProgress.date,
              },
            },
          },
        }));
      },

      // Code management
      updateCode: (
        algorithmId: string,
        language: string,
        fileName: string,
        content: string
      ) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              code: {
                ...state.algorithms[algorithmId].code,
                storedCode: {
                  ...state.algorithms[algorithmId].code.storedCode,
                  [language]: {
                    ...state.algorithms[algorithmId].code.storedCode[
                      language as keyof StoredCode
                    ],
                    [fileName]: {
                      content,
                    },
                  },
                },
              },
            },
          },
        }));
      },

      // Timer management
      pauseTimer: (algorithmId: string) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              timer: {
                ...state.algorithms[algorithmId].timer,
                pausedAt: Date.now(),
              },
            },
          },
        }));
      },

      resumeTimer: (algorithmId: string) => {
        const state = get();
        const algorithm = state.algorithms[algorithmId];
        if (!algorithm.timer.pausedAt) return;

        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              timer: {
                ...state.algorithms[algorithmId].timer,
                totalPausedTime:
                  algorithm.timer.totalPausedTime +
                  (Date.now() - algorithm.timer.pausedAt!),
                pausedAt: null,
              },
            },
          },
        }));
      },

      // Execution management
      setExecuting: (algorithmId: string, isExecuting: boolean) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              execution: {
                ...state.algorithms[algorithmId].execution,
                isExecuting,
              },
            },
          },
        }));
      },

      setExecutionResult: (
        algorithmId: string,
        result: CodeExecutionResponse
      ) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              execution: {
                ...state.algorithms[algorithmId].execution,
                executionResult: result,
                error: null,
              },
            },
          },
        }));
      },

      setExecutionError: (algorithmId: string, error: Error) => {
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              execution: {
                ...state.algorithms[algorithmId].execution,
                executionResult: null,
                error,
              },
            },
          },
        }));
      },
    }),
    { name: "algorithm-store" }
  )
);
