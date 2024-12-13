import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

export const createAlgorithmSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  AlgorithmActions
> = (set, get) => ({
  initializeAlgorithm: async (algorithmId: string) => {
    const state = get();

    // If already initialized and not in error state, return early
    if (state.algorithms[algorithmId] && !state.metadata.error) {
      return;
    }

    try {
      // Set loading state and clear any previous errors
      set((state: AlgorithmState) => {
        state.metadata.isLoading = true;
        state.metadata.error = null;
        // Initialize an empty placeholder to prevent "not found" errors during loading
        state.algorithms[algorithmId] = {
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
          submission: {
            isSubmitting: false,
            completed: false,
            submissionNotes: "",
            globalNotes: "",
          },
          metadata: {
            algorithmId,
            description: "",
            nextAlgorithm: null,
          },
        };
        return state;
      });

      const { algorithm, nextAlgorithm } = await getAlgorithm(algorithmId);

      if (!algorithm) {
        throw new Error(`Algorithm with id ${algorithmId} not found`);
      }

      const codeState = algorithm.files.reduce<StoredCode>((acc, file) => {
        const language = file.language as keyof StoredCode;
        if (!acc[language]) {
          acc[language] = {};
        }
        acc[language][file.name] = file.content;
        return acc;
      }, {} as StoredCode);

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

      set((state: AlgorithmState) => {
        state.algorithms[algorithmId] = {
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
          submission: {
            isSubmitting: false,
            completed: algorithm.completed,
            submissionNotes: "",
            globalNotes: algorithm.notes || "",
          },
          metadata: {
            algorithmId,
            description: algorithm.description,
            nextAlgorithm,
          },
        };
        state.metadata.activeAlgorithmId = algorithmId;
        state.metadata.isLoading = false;
        return state;
      });
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        algorithms: Object.fromEntries(
          Object.entries(state.algorithms).map(([id, algo]) => [
            id,
            {
              ...algo,
              execution: {
                ...algo.execution,
                isExecuting: false,
              },
              submission: {
                ...algo.submission,
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
