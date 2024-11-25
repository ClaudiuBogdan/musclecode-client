import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { runCode, getAlgorithm } from "@/lib/api/code";
import { CodeExecutionResponse } from "@/types/testRunner";

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "cpp";

export type CodeFile = string;

export type AlgorithmId = string;

interface LayoutState {
  sizes: [number, number];
  editorSizes: [number, number];
  setSizes: (sizes: [number, number]) => void;
  setEditorSizes: (sizes: [number, number]) => void;
}

// Type to represent the structure of stored code
type StoredCode = Record<
  CodeLanguage,
  {
    [K in CodeFile]: string;
  }
>;

interface TimerState {
  startTime: number | null;
  pausedAt: number | null;
  totalPausedTime: number;
  isRunning: boolean;
}

interface CodeStoreState {
  isLoading: boolean;
  algorithms: {
    [key: AlgorithmId]: {
      algorithmId: string;
      isRunning: boolean;
      activeLanguage: CodeLanguage;
      languages: CodeLanguage[];
      activeTab: CodeFile;
      storedCode: StoredCode;
      executionResult: CodeExecutionResponse | null;
      startTime: number | null;
      timerState: TimerState;
      // The next algorithm to be run if available
      nextAlgorithm: {
        id: string;
        title: string;
      } | null;
    };
  };
}

interface CodeStoreActions {
  initializeAlgorithm: (algorithmId: string) => void;
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
  runCode: (algorithmId: string) => Promise<void>;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sizes: [40, 60],
      editorSizes: [70, 30],
      setSizes: (sizes: [number, number]) => {
        if (Math.abs(sizes[0] + sizes[1] - 100) > 1) {
          console.error("Invalid sizes", sizes);
          return;
        }
        set({ sizes });
      },
      setEditorSizes: (sizes: [number, number]) => {
        console.log("setEditorSizes", sizes);
        if (Math.abs(sizes[0] + sizes[1] - 100) > 1) {
          console.error("Invalid sizes", sizes);
          return;
        }
        set({ editorSizes: sizes });
      },
    }),
    {
      name: "layout-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useCodeStore = create<CodeStoreState & CodeStoreActions>()(
  persist(
    immer((set, get) => ({
      isLoading: false,
      algorithms: {},
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

      getFiles: (algorithmId, language) => {
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

          return {
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                timerState: {
                  startTime: Date.now(),
                  pausedAt: null,
                  totalPausedTime: 0,
                  isRunning: true,
                },
              },
            },
          };
        }),

      pauseTimer: (algorithmId) =>
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithmId]: {
              ...state.algorithms[algorithmId],
              timerState: {
                ...state.algorithms[algorithmId].timerState,
                pausedAt: Date.now(),
                isRunning: false,
              },
            },
          },
        })),

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
                  isRunning: true,
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
                startTime: Date.now(),
                pausedAt: null,
                totalPausedTime: 0,
                isRunning: true,
              },
            },
          },
        })),
      runCode: async (algorithmId: string) => {
        const { algorithms } = get();
        const {
          activeLanguage: language,
          activeTab,
          isRunning,
        } = algorithms[algorithmId];
        if (!algorithmId || isRunning) return;

        const code = get().getCode(algorithmId, language, activeTab);
        try {
          set((state) => ({
            algorithms: {
              ...state.algorithms,
              [algorithmId]: {
                ...state.algorithms[algorithmId],
                isRunning: true,
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
                isRunning: false,
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
                isRunning: false,
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

          set((state) => {
            state.algorithms[algorithmId] = {
              algorithmId,
              activeLanguage: firstLanguage,
              languages,
              activeTab: firstFile,
              storedCode: codeState,
              isRunning: false,
              executionResult: null,
              startTime: null,
              timerState: {
                startTime: Date.now(),
                pausedAt: null,
                totalPausedTime: 0,
                isRunning: true,
              },
              nextAlgorithm: algorithmData.nextAlgorithm,
            };
          });
        } catch (error) {
          console.error("Failed to initialize algorithm:", error);
          // Optionally set an error state here
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

