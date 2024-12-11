import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Algorithm } from "@/types/algorithm";
import { seedAlgorithms } from "../api/algorithms/seed";

interface MockAlgorithmsState {
  algorithms: Record<string, Algorithm>;
  addAlgorithm: (algorithm: Algorithm) => void;
  updateAlgorithm: (algorithm: Algorithm) => void;
  getAlgorithm: (id: string) => Algorithm | undefined;
  getAllAlgorithms: () => Algorithm[];
}

export const useMockAlgorithmsStore = create<MockAlgorithmsState>()(
  persist(
    (set, get) => ({
      algorithms: seedAlgorithms().reduce(
        (acc, algorithm) => ({
          ...acc,
          [algorithm.id]: algorithm,
        }),
        {}
      ),

      addAlgorithm: (algorithm) =>
        set((state) => ({
          algorithms: {
            ...state.algorithms,
            [algorithm.id]: algorithm,
          },
        })),

      updateAlgorithm: (algorithm) =>
        set((state) => {
          // Ensure the algorithm exists before updating
          if (!state.algorithms[algorithm.id]) {
            console.warn(`Algorithm with id ${algorithm.id} not found`);
            return state;
          }

          return {
            algorithms: {
              ...state.algorithms,
              [algorithm.id]: {
                ...state.algorithms[algorithm.id],
                ...algorithm,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      getAlgorithm: (id) => get().algorithms[id],

      getAllAlgorithms: () => Object.values(get().algorithms),
    }),
    {
      name: "mock-algorithms-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
