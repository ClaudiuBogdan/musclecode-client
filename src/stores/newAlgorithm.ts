import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { createAlgorithm } from "@/lib/api/algorithm";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import {
  BaseAlgorithmState,
  BaseAlgorithmActions,
  createBaseAlgorithmSlice,
} from "./baseAlgorithm";

interface NewAlgorithmState extends BaseAlgorithmState {}

interface NewAlgorithmActions extends BaseAlgorithmActions {
  saveAlgorithm: () => Promise<void>;
  resetState: () => void;
}

const initialState: NewAlgorithmState = {
  isLoading: false,
  error: null,
  algorithm: {
    metadata: {
      title: "",
      difficulty: "easy",
      tags: [],
      category: "",
      summary: "",
    },
    description: "",
    files: [],
  },
};

export const useNewAlgorithmStore = create<
  NewAlgorithmState & NewAlgorithmActions
>()(
  persist(
    immer((set, get) => ({
      ...createBaseAlgorithmSlice(set, get),

      // Save action
      saveAlgorithm: async () => {
        const validation = get().validateState();
        if (!validation.isValid) {
          set((state) => {
            state.error = validation.errors[0];
          });
          throw new Error(validation.errors[0]);
        }

        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          const { algorithm } = get();

          const payload: CreateAlgorithmPayload = {
            title: algorithm.metadata.title.trim(),
            category: algorithm.metadata.category,
            summary: algorithm.metadata.summary,
            difficulty: algorithm.metadata.difficulty,
            tags: algorithm.metadata.tags,
            description: algorithm.description.trim(),
            files: algorithm.files,
          };

          await createAlgorithm(payload);
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
      name: "new-algorithm-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        algorithm: state.algorithm,
      }),
    }
  )
);
