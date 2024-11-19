import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { runCode } from "@/lib/api/code";
import { AlgorithmFile } from "@/types/algorithm";
import { CodeExecutionResponse } from "@/types/testRunner";

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "cpp";

export type CodeFile = string;

interface LayoutState {
  sizes: [number, number];
  editorSizes: [number, number];
  setSizes: (sizes: [number, number]) => void;
  setEditorSizes: (sizes: [number, number]) => void;
}

// Type to represent the structure of stored code
type StoredCode = Record<
  // algorithmId
  string,
  {
    // language
    [K in CodeLanguage]?: {
      // tab
      [K in CodeFile]: string;
    };
  }
>;

interface TimerState {
  startTime: number | null;
  pausedAt: number | null;
  totalPausedTime: number;
  isRunning: boolean;
}

interface CodeStoreState {
  algorithmId: string | null;
  activeLanguage: CodeLanguage;
  languages: CodeLanguage[];
  activeTab: CodeFile;
  storedCode: StoredCode;
  isRunning: boolean;
  executionResult: CodeExecutionResponse | null;
  startTime: Record<string, number | null>;
  timerState: Record<string, TimerState>;
  isInitialized: boolean;
}

interface CodeStoreActions {
  initializeCode: (
    algorithmId: string,
    files: Record<string, AlgorithmFile[]>
  ) => void;
  setAlgorithmId: (id: string) => void;
  setActiveLanguage: (language: CodeLanguage) => void;
  setActiveTab: (tab: CodeFile) => void;
  setCode: (code: string) => void;
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
  runCode: () => Promise<void>;
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
    (set, get) => ({
      algorithmId: null,
      activeLanguage: "typescript",
      languages: [],
      supportedLanguages: [],
      activeTab: "solution",
      storedCode: {},
      isRunning: false,
      executionResult: null,
      startTime: {},
      timerState: {},
      isInitialized: false,
      setAlgorithmId: (algorithmId) => set({ algorithmId }),

      setActiveLanguage: (language) => set({ activeLanguage: language }),

      setActiveTab: (activeTab) => set({ activeTab }),

      setCode: (code) =>
        set((state) => {
          if (!state.algorithmId) return {};

          const newStoredCode = { ...state.storedCode };

          // TODO: Remove this once we have a better way to initialize the code
          // Initialize nested structure if it doesn't exist
          if (!newStoredCode[state.algorithmId]) {
            newStoredCode[state.algorithmId] = {};
          }
          if (!newStoredCode[state.algorithmId][state.activeLanguage]) {
            newStoredCode[state.algorithmId][state.activeLanguage] = {
              solution: "",
              test: "",
            };
          }

          // Update the code for the current algorithm, language, and tab
          newStoredCode[state.algorithmId][state.activeLanguage]![
            state.activeTab
          ] = code;

          return { storedCode: newStoredCode };
        }),

      getCode: (algorithmId, language, tab) => {
        const state = get();
        return state.storedCode[algorithmId]?.[language]?.[tab] ?? "";
      },

      getFiles: (algorithmId, language) => {
        const state = get();
        return Object.keys(state.storedCode[algorithmId]?.[language] ?? {}).map(
          (name) => ({ name, readOnly: false })
        );
      },

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

      runCode: async () => {
        console.log("runCode");
        const { algorithmId, activeLanguage: language, activeTab } = get();
        if (!algorithmId) return;

        const code = get().getCode(algorithmId, language, activeTab);
        try {
          set({ isRunning: true });
          const response = await runCode({ algorithmId, language, code });
          set({ executionResult: response });
        } catch (error) {
          console.error("Failed to run code:", error);
        } finally {
          set({ isRunning: false });
        }
      },

      initializeCode: (algorithmId, files) => {
        const codeState: Record<
          string,
          Record<string, Record<string, string>>
        > = {};

        Object.entries(files).forEach(([language, languageFiles]) => {
          console.log(language, languageFiles);
          codeState[algorithmId] = codeState[algorithmId] || {};
          codeState[algorithmId][language] = {};

          languageFiles.forEach((file) => {
            codeState[algorithmId][language][file.name] = file.content;
          });
        });

        const languages = Object.keys(
          codeState[algorithmId] ?? {}
        ) as CodeLanguage[];

        set({ storedCode: codeState, isInitialized: true, languages });
      },
    }),
    {
      name: "code-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

