import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { runCode, getAlgorithm, saveSubmission } from "@/lib/api/code";
import { CodeExecutionResponse } from "@/types/testRunner";
import { Difficulty } from "@/types/algorithm";

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "cpp";

export type CodeFile = string;

export type AlgorithmId = string;

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface TestResults {
  passed: boolean;
  totalTests: number;
  testResults: TestResult[];
}

interface TimerState {
  // When timer was first started
  initialStartTime: number;
  // Current pause start time if paused, null if running
  pausedAt: number | null;
  // Total accumulated time from previous pause periods
  totalPausedTime: number;
}

// Type to represent the structure of stored code
type StoredCode = Record<
  CodeLanguage,
  {
    [K in CodeFile]: string;
  }
>;

interface CodeStoreState {
  isLoading: boolean;
  algorithms: {
    [key: AlgorithmId]: {
      algorithmId: string;
      description: string;
      isExecuting: boolean;
      activeLanguage: CodeLanguage;
      languages: CodeLanguage[];
      activeTab: CodeFile;
      storedCode: StoredCode;
      executionResult: CodeExecutionResponse | null;
      startTime: number | null;
      timerState: TimerState;
      globalNotes: string;
      // The next algorithm to be run if available
      nextAlgorithm: {
        id: string;
        title: string;
      } | null;
      isSubmitting: boolean;
      submissionNotes: string;
    };
  };
}

interface CodeStoreActions {
  initializeAlgorithm: (algorithmId: string) => Promise<void>;
  setGlobalNotes: (algorithmId: string, notes: string) => void;
  setSubmissionNotes: (algorithmId: string, notes: string) => void;
  submit: (algorithmId: string, difficulty: Difficulty) => Promise<boolean>;
  setActiveLanguage: (algorithmId: string, language: CodeLanguage) => void;
  setActiveTab: (algorithmId: string, tab: CodeFile) => void;
  setCode: (algorithmId: string, code: string) => void;
  getCode: (
    algorithmId: string,
    language: CodeLanguage,
    tab: CodeFile
  ) => string;
  getFiles: (
    algorithmId: string,
    language: CodeLanguage
  ) => Array<{ name: string; readOnly?: boolean }>;
  setStartTime: (algorithmId: string, time: number) => void;
  startTimer: (algorithmId: string) => void;
  pauseTimer: (algorithmId: string) => void;
  resumeTimer: (algorithmId: string) => void;
  resetTimer: (algorithmId: string) => void;
  getTotalRunningTime: (algorithmId: string) => number;
  runCode: (algorithmId: string) => Promise<void>;
}

export const useCodeStore = create<CodeStoreState & CodeStoreActions>()(
  persist(
    immer((set, get) => ({
      isLoading: false as boolean,
      algorithms: {},

      setGlobalNotes: (algorithmId, notes) =>
        set((state) => {
          if (!state.algorithms[algorithmId]) return;
          state.algorithms[algorithmId].globalNotes = notes;
        }),

      setSubmissionNotes: (algorithmId, notes) =>
        set((state) => {
          if (!state.algorithms[algorithmId]) return;
          state.algorithms[algorithmId].submissionNotes = notes;
        }),

      submit: async (algorithmId, difficulty) => {
        if (!get().algorithms[algorithmId]) return false;

        set((state) => {
          state.algorithms[algorithmId].isSubmitting = true;
        });

        const submission = {
          timeSpent: get().getTotalRunningTime(algorithmId),
          code: get().getCode(
            algorithmId,
            get().algorithms[algorithmId].activeLanguage,
            get().algorithms[algorithmId].activeTab
          ),
          difficulty,
          notes: get().algorithms[algorithmId].globalNotes,
        };

        try {
          await saveSubmission(algorithmId, submission);

          set((state) => {
            state.algorithms[algorithmId].isSubmitting = false;
          });
          return true;
        } catch (error) {
          console.error("Failed to save submission:", error);
          set((state) => {
            state.algorithms[algorithmId].isSubmitting = false;
          });
          return false;
        }
      },

      setActiveLanguage: (algorithmId, language) => {
        set((state) => {
          if (!state.algorithms[algorithmId]) return;
          state.algorithms[algorithmId].activeLanguage = language;
        });
      },

      setActiveTab: (algorithmId, tab) =>
        set((state) => {
          if (!state.algorithms[algorithmId]) return;
          state.algorithms[algorithmId].activeTab = tab;
        }),

      setCode: (algorithmId, code) =>
        set((state) => {
          const algorithm = state.algorithms[algorithmId];
          if (!algorithm) return;

          algorithm.storedCode[algorithm.activeLanguage][algorithm.activeTab] =
            code;
        }),

      getCode: (algorithmId, language, tab) => {
        const algorithm = get().algorithms[algorithmId];

        return algorithm.storedCode[language][tab] ?? "";
      },

      getFiles: (
        algorithmId,
        language
      ): { name: string; readOnly?: boolean }[] => {
        const algorithm = get().algorithms[algorithmId];
        if (!algorithm) return [];

        return Object.keys(algorithm.storedCode[language] ?? {}).map(
          (name) => ({ name, readOnly: false })
        );
      },

      setStartTime: (algorithmId, time) =>
        set((state) => ({
          ...state,
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              startTime: time,
            },
          },
        })),

      startTimer: (algorithmId) =>
        set((state) => {
          // Only start if there's no existing timer state
          if (state.algorithms[algorithmId].timerState) {
            return state;
          }

          const now = Date.now();
          return {
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                timerState: {
                  initialStartTime: now,
                  pausedAt: null,
                  totalPausedTime: 0,
                },
              },
            },
          };
        }),

      pauseTimer: (algorithmId) => {
        if (!get().algorithms[algorithmId]?.timerState) return;
        if (get().algorithms[algorithmId].timerState.pausedAt) {
          return;
        }
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              timerState: {
                ...state.algorithms[algorithmId].timerState,
                pausedAt: Date.now(),
              },
            },
          },
        }));
      },

      resumeTimer: (algorithmId) =>
        set((state) => {
          const timer = state.algorithms[algorithmId].timerState;
          if (!timer || !timer.pausedAt) return state;

          const additionalPausedTime = Date.now() - timer.pausedAt;

          return {
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                timerState: {
                  ...timer,
                  pausedAt: null,
                  totalPausedTime: timer.totalPausedTime + additionalPausedTime,
                },
              },
            },
          };
        }),

      resetTimer: (algorithmId) =>
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              timerState: {
                initialStartTime: Date.now(),
                pausedAt: null,
                totalPausedTime: 0,
              },
            },
          },
        })),

      getTotalRunningTime: (algorithmId) => {
        const timer = get().algorithms[algorithmId].timerState;
        if (!timer) return 0;

        if (timer.pausedAt) {
          const now = Date.now();
          const currentPausedTime = Date.now() - timer.pausedAt;
          return (
            now -
            timer.initialStartTime -
            timer.totalPausedTime -
            currentPausedTime
          );
        }

        const now = Date.now();
        return now - timer.initialStartTime - timer.totalPausedTime;
      },

      runCode: async (algorithmId: string) => {
        const { algorithms } = get();
        const {
          activeLanguage: language,
          activeTab,
          isExecuting,
        } = algorithms[algorithmId];
        if (!algorithmId || isExecuting) return;

        const code = get().getCode(algorithmId, language, activeTab);
        try {
          set((state) => ({
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                isExecuting: true,
              },
            },
          }));
          const response = await runCode({ algorithmId, language, code });
          set((state) => ({
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                executionResult: response,
                isExecuting: false,
              },
            },
          }));
        } catch (error) {
          console.error("Failed to run code:", error);
          set((state) => ({
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                isExecuting: false,
              },
            },
          }));
        }
      },

      initializeAlgorithm: async (algorithmId) => {
        const algorithm = get().algorithms[algorithmId];

        if (algorithm) return;

        try {
          set((state) => ({
            ...state,
            isLoading: true,
          }));
          const algorithmData = await getAlgorithm(algorithmId);
          const codeState: StoredCode = {} as StoredCode;

          // Initialize code state from API response
          Object.entries(algorithmData.files).forEach(
            ([language, languageFiles]) => {
              codeState[language as CodeLanguage] = {};
              languageFiles.forEach((file) => {
                codeState[language as CodeLanguage]![file.name] = file.content;
              });
            }
          );

          const languages = Object.keys(codeState) as CodeLanguage[];
          const firstLanguage = languages[0];
          const firstFile = Object.keys(codeState[firstLanguage])[0];

          const now = Date.now();
          set((state) => {
            state.algorithms[algorithmId] = {
              algorithmId,
              description: algorithmData.description,
              activeLanguage: firstLanguage,
              languages,
              activeTab: firstFile,
              storedCode: codeState,
              isExecuting: false,
              executionResult: null,
              startTime: null,
              globalNotes: algorithmData.notes || "",
              timerState: {
                initialStartTime: now,
                pausedAt: null,
                totalPausedTime: 0,
              },
              nextAlgorithm: algorithmData.nextAlgorithm,
              isSubmitting: false,
              submissionNotes: "",
            };
          });
        } catch (error) {
          console.error("Failed to initialize algorithm:", error);
        } finally {
          set((state) => ({
            ...state,
            isLoading: false,
          }));
        }
      },
    })),
    {
      name: "code-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
