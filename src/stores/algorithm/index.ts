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

const createAlgorithmSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  AlgorithmActions
> = (set, get) => ({
  initializeAlgorithm: async (algorithmId: string) => {
    const state = get();
    if (state.algorithms[algorithmId]) return;

    try {
      set((state: AlgorithmState) => {
        state.metadata.isLoading = true;
        return state;
      });

      const { algorithm, nextAlgorithm } = await getAlgorithm(algorithmId);
      const codeState = algorithm.files.reduce<StoredCode>((acc, file) => {
        const language = file.language as keyof StoredCode;
        if (!acc[language]) {
          acc[language] = {};
        }
        acc[language][file.name] = file.content;
        return acc;
      }, {} as StoredCode);

      const languages = Object.keys(codeState) as CodeLanguage[];
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
        return state;
      });
    } catch (error) {
      console.error("Failed to initialize algorithm:", error);
    } finally {
      set((state: AlgorithmState) => {
        state.metadata.isLoading = false;
        return state;
      });
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
