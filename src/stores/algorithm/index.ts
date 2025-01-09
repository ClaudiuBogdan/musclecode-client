import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  AlgorithmActions,
  AlgorithmState,
  StoreActions,
  StoredCode,
} from "./types";
import { createCodeSlice } from "./slices/codeSlice";
import { createTimerSlice } from "./slices/timerSlice";
import { createExecutionSlice } from "./slices/executionSlice";
import { createSubmissionSlice } from "./slices/submissionSlice";
import { getAlgorithm } from "@/lib/api/code";
import { createInitialState } from "./__tests__/utils/testStore";
import { CodeLanguage } from "@/types/algorithm";
import { endOfDay } from "date-fns";
import { algorithmStorageWithTTL } from "./storage";

export const createAlgorithmSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  AlgorithmActions
> = (set, get) => ({
  initializeAlgorithm: async (algorithmId: string) => {
    try {
      // Set loading state and clear any previous errors
      const isInitialized = get().algorithms[algorithmId] !== undefined;
      set((state: AlgorithmState) => {
        state.metadata.isLoading = true;
        state.metadata.error = null;
        // Initialize an empty placeholder to prevent "not found" errors during loading
        state.algorithms[algorithmId] = state.algorithms[algorithmId] || {
          code: {
            activeLanguage: "javascript",
            activeTab: "",
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
            notes: {
              content: "",
              state: "saved",
            },
            dailyProgress: null,
            lastSubmissionDate: null,
            submissions: [],
          },
          metadata: {
            algorithmId,
            template: null,
            nextAlgorithm: null,
            ratingSchedule: {
              again: 0,
              hard: 0,
              good: 0,
              easy: 0,
            },
          },
        };
        return state;
      });

      const response = await getAlgorithm(algorithmId);

      const algorithmTemplate = response.algorithmTemplate;
      const submissions = response.submissions;
      const completed = new Date(response.due) > endOfDay(new Date());

      const codeState = algorithmTemplate.files.reduce<StoredCode>(
        (acc, file) => {
          const language = file.language as keyof StoredCode;
          if (!acc[language]) {
            acc[language] = {};
          }
          acc[language][file.name] = file;
          return acc;
        },
        {} as StoredCode
      );

      const languages = Object.keys(codeState) as CodeLanguage[];
      if (languages.length === 0) {
        const error = new Error(
          `No language files found for algorithm ${algorithmId}`
        );
        set((state: AlgorithmState) => {
          state.metadata.error = error.message;
          state.metadata.isLoading = false;
          delete state.algorithms[algorithmId];
          return state;
        });
        throw error;
      }

      const firstLanguage = languages[0];
      const firstFile = Object.keys(codeState[firstLanguage])[0];

      if (!isInitialized) {
        set((state: AlgorithmState) => {
          state.algorithms[algorithmId] = {
            _createdAt: Date.now(),
            code: {
              activeLanguage: firstLanguage,
              activeTab: firstFile,
              storedCode: codeState,
              initialStoredCode: codeState,
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
              completed,
              notes: {
                content: response.notes || "",
                state: "saved",
              },
              submissionNote: "",
              lastSubmissionDate: null,
              submissions: submissions,
            },
            metadata: {
              algorithmId,
              template: algorithmTemplate,
              nextAlgorithm: response.nextAlgorithm,
              ratingSchedule: response.ratingSchedule,
            },
          };
          state.metadata.activeAlgorithmId = algorithmId;
          state.metadata.isLoading = false;
          return state;
        });
      } else {
        set((state: AlgorithmState) => {
          state.algorithms[algorithmId] = {
            ...state.algorithms[algorithmId],
            userProgress: {
              isSubmitting: false,
              completed,
              notes: {
                content: response.notes || "",
                state: "saved",
              },
              submissionNote: "",
              lastSubmissionDate: null,
              submissions: submissions,
            },
            metadata: {
              algorithmId,
              template: algorithmTemplate,
              nextAlgorithm: response.nextAlgorithm,
              ratingSchedule: response.ratingSchedule,
            },
          };
          state.metadata.activeAlgorithmId = algorithmId;
          state.metadata.isLoading = false;
          return state;
        });
      }
    } catch (error) {
      console.error("Failed to initialize algorithm:", error);
      set((state: AlgorithmState) => {
        state.metadata.error =
          error instanceof Error
            ? error.message
            : "Failed to initialize algorithm";
        state.metadata.isLoading = false;
        // Clean up the placeholder on error
        delete state.algorithms[algorithmId];
        return state;
      });
      throw error; // Re-throw the error to ensure promise rejection
    }
  },
});

export const useAlgorithmStore = create<AlgorithmState & StoreActions>()(
  persist(
    immer((set, get, api) => ({
      ...createInitialState(),
      ...createAlgorithmSlice(set, get, api),
      ...createCodeSlice(set, get, api),
      ...createTimerSlice(set, get, api),
      ...createExecutionSlice(set, get, api),
      ...createSubmissionSlice(set, get, api),
    })),
    {
      name: "algorithm-store",
      storage: algorithmStorageWithTTL,
      partialize: (state) => ({
        ...state,
        algorithms: Object.fromEntries(
          Object.entries(state.algorithms).map(([id, algo]) => [
            id,
            {
              ...algo,
              execution: {
                ...algo.execution,
                error: null,
                isExecuting: false,
              },
              userProgress: {
                ...algo.userProgress,
                isSubmitting: false,
              },
              timer: {
                ...algo.timer,
                pausedAt: Date.now(), // Pause timer on storage
              },
            },
          ])
        ),
      }),
    }
  )
);
