import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { updateAlgorithmTemplate } from "@/lib/api/algorithm";

import {
  createBaseAlgorithmSlice,
} from "./baseAlgorithm";

import type {
  BaseAlgorithmState,
  BaseAlgorithmActions} from "./baseAlgorithm";
import type { CreateAlgorithmPayload } from "@/types/newAlgorithm";


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
      categories: [],
      summary: "",
    },
    lessons: [],
    files: [],
  },
};

export const useEditAlgorithmStore = create<
  EditAlgorithmState & EditAlgorithmActions
>()(
  persist(
    immer((set, get, store) => ({
      // @ts-expect-error TODO: fix this
      ...createBaseAlgorithmSlice(set, get, store),
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
            categories: algorithm.metadata.categories,
            summary: algorithm.metadata.summary.trim(),
            difficulty: algorithm.metadata.difficulty,
            tags: algorithm.metadata.tags,
            lessons: algorithm.lessons,
            files: algorithm.files,
          };

          await updateAlgorithmTemplate(algorithmId, payload);
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
