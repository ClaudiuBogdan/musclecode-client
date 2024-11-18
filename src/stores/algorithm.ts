import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "cpp";
export type CodeTab = "solution" | "test";

interface LayoutStore {
  sizes: number[];
  setSizes: (sizes: number[]) => void;
}

// Type to represent the structure of stored code
type StoredCode = Record<
  string,
  {
    // algorithmId
    [K in CodeLanguage]?: {
      // language
      solution: string;
      test: string;
    };
  }
>;

interface TimerState {
  startTime: number | null;
  pausedAt: number | null;
  totalPausedTime: number;
  isRunning: boolean;
}

interface CodeStore {
  algorithmId: string | null;
  language: CodeLanguage;
  activeTab: CodeTab;
  storedCode: StoredCode;
  executionResult: string;
  startTime: Record<string, number | null>;
  timerState: Record<string, TimerState>;
  setAlgorithmId: (id: string) => void;
  setLanguage: (language: CodeLanguage) => void;
  setActiveTab: (tab: CodeTab) => void;
  setCode: (code: string) => void;
  getCode: (
    algorithmId: string,
    language: CodeLanguage,
    tab: CodeTab
  ) => string;
  setExecutionResult: (result: string) => void;
  setStartTime: (algorithmId: string, time: number) => void;
  startTimer: (algorithmId: string) => void;
  pauseTimer: (algorithmId: string) => void;
  resumeTimer: (algorithmId: string) => void;
  resetTimer: (algorithmId: string) => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sizes: [50, 50],
      setSizes: (sizes) => set({ sizes }),
    }),
    {
      name: "layout-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useCodeStore = create<CodeStore>()(
  persist(
    (set, get) => ({
      algorithmId: null,
      language: "typescript",
      activeTab: "solution",
      storedCode: {},
      executionResult: "",
      startTime: {},
      timerState: {},

      setAlgorithmId: (algorithmId) => set({ algorithmId }),

      setLanguage: (language) => set({ language }),

      setActiveTab: (activeTab) => set({ activeTab }),

      setCode: (code) =>
        set((state) => {
          if (!state.algorithmId) return {};

          const newStoredCode = { ...state.storedCode };

          // Initialize nested structure if it doesn't exist
          if (!newStoredCode[state.algorithmId]) {
            newStoredCode[state.algorithmId] = {};
          }
          if (!newStoredCode[state.algorithmId][state.language]) {
            newStoredCode[state.algorithmId][state.language] = {
              solution: "",
              test: "",
            };
          }

          // Update the code for the current algorithm, language, and tab
          newStoredCode[state.algorithmId][state.language]![state.activeTab] =
            code;

          return { storedCode: newStoredCode };
        }),

      getCode: (algorithmId, language, tab) => {
        const state = get();
        return state.storedCode[algorithmId]?.[language]?.[tab] ?? "";
      },

      setExecutionResult: (executionResult) => set({ executionResult }),

      setStartTime: (algorithmId, time) =>
        set((state) => ({
          startTime: {
            ...state.startTime,
            [algorithmId]: time,
          },
        })),

      startTimer: (algorithmId) =>
        set((state) => {
          // Only start if there's no existing timer state
          if (state.timerState[algorithmId]) {
            return state;
          }

          return {
            timerState: {
              ...state.timerState,
              [algorithmId]: {
                startTime: Date.now(),
                pausedAt: null,
                totalPausedTime: 0,
                isRunning: true,
              },
            },
          };
        }),

      pauseTimer: (algorithmId) =>
        set((state) => ({
          timerState: {
            ...state.timerState,
            [algorithmId]: {
              ...state.timerState[algorithmId],
              pausedAt: Date.now(),
              isRunning: false,
            },
          },
        })),

      resumeTimer: (algorithmId) =>
        set((state) => {
          const timer = state.timerState[algorithmId];
          if (!timer || !timer.pausedAt) return state;

          const additionalPausedTime = Date.now() - timer.pausedAt;

          return {
            timerState: {
              ...state.timerState,
              [algorithmId]: {
                ...timer,
                pausedAt: null,
                totalPausedTime: timer.totalPausedTime + additionalPausedTime,
                isRunning: true,
              },
            },
          };
        }),

      resetTimer: (algorithmId) =>
        set((state) => ({
          timerState: {
            ...state.timerState,
            [algorithmId]: {
              startTime: Date.now(),
              pausedAt: null,
              totalPausedTime: 0,
              isRunning: true,
            },
          },
        })),
    }),
    {
      name: "code-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
