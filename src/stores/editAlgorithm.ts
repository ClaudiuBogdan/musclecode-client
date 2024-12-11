import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateAlgorithm } from "@/lib/api/algorithm";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import {
  BaseAlgorithmState,
  BaseAlgorithmActions,
  createBaseAlgorithmSlice,
} from "./baseAlgorithm";

interface EditAlgorithmState extends BaseAlgorithmState {
  algorithmId: string | null;
}

interface EditAlgorithmActions extends BaseAlgorithmActions {
  setAlgorithmId: (id: string) => void;
  saveAlgorithm: () => Promise<void>;
  resetState: () => void;
}

const initialState: EditAlgorithmState = {
  isLoading: false,
  error: null,
  algorithmId: null,
  algorithm: {
    metadata: {
      title: "",
      difficulty: "easy",
      tags: [],
    },
    description: {
      content: "",
    },
    languages: [],
  },
};

export const useEditAlgorithmStore = create<
  EditAlgorithmState & EditAlgorithmActions
>()(
  persist(
    immer((set, get) => ({
      ...createBaseAlgorithmSlice(set, get),
      algorithmId: null,

      setAlgorithmId: (id: string) =>
        set((state) => {
          state.algorithmId = id;
        }),

      // Save action
      saveAlgorithm: async () => {
        const validation = get().validateState();
        if (!validation.isValid) {
          set((state) => {
            state.error = validation.errors[0];
          });
          throw new Error(validation.errors[0]);
        }

        const { algorithmId } = get();
        if (!algorithmId) {
          throw new Error("Algorithm ID is required for editing");
        }

        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          const { algorithm } = get();
          const payload: CreateAlgorithmPayload = {
            title: algorithm.metadata.title.trim(),
            difficulty: algorithm.metadata.difficulty,
            tags: algorithm.metadata.tags,
            description: algorithm.description.content.trim(),
            languages: algorithm.languages.reduce(
              (acc, lang) => {
                acc[lang.language] = {
                  solution: lang.solutionFile.content,
                  test: lang.testFile.content,
                };
                return acc;
              },
              {} as CreateAlgorithmPayload["languages"]
            ),
          };

          await updateAlgorithm(algorithmId, payload);
          get().resetState();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to save algorithm";
          set((state) => {
            state.error = errorMessage;
          });
          throw error;
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      // Reset action
      resetState: () => {
        set(initialState);
      },
    })),
    {
      name: "edit-algorithm-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        algorithm: state.algorithm,
        algorithmId: state.algorithmId,
      }),
    }
  )
);
