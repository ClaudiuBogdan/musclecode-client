import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createAlgorithmTemplate } from "@/lib/api/algorithm";

import {
  createBaseAlgorithmSlice,
} from "./baseAlgorithm";

import type {
  BaseAlgorithmState,
  BaseAlgorithmActions} from "./baseAlgorithm";
import type { CreateAlgorithmPayload } from "@/types/newAlgorithm";



interface NewAlgorithmActions extends BaseAlgorithmActions {
  saveAlgorithm: () => Promise<void>;
  resetState: () => void;
}

const initialState: BaseAlgorithmState = {
  isLoading: false as boolean,
  error: null,
  algorithm: {
    metadata: {
      title: "",
      difficulty: "easy",
      tags: [],
      categories: [],
      summary: "",
    },
    lessons: [],
    files: [],
  },
};

export const useNewAlgorithmStore = create<
  BaseAlgorithmState & NewAlgorithmActions
>()(
  persist(
    immer((set, get, store) => ({
      // @ts-expect-error TODO: fix this
      ...createBaseAlgorithmSlice(set, get, store),

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
            categories: algorithm.metadata.categories,
            summary: algorithm.metadata.summary.trim(),
            difficulty: algorithm.metadata.difficulty,
            tags: algorithm.metadata.tags,
            lessons: algorithm.lessons,
            files: algorithm.files,
          };

          await createAlgorithmTemplate(payload);
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
