import { create } from "zustand";

import type { AlgorithmTemplate } from "@/types/algorithm";

interface AlgorithmsStore {
  algorithms: AlgorithmTemplate[];
  setAlgorithms: (algorithms: AlgorithmTemplate[]) => void;
  addAlgorithm: (algorithm: AlgorithmTemplate) => void;
}

export const useMockAlgorithmsStore = create<AlgorithmsStore>((set) => ({
  algorithms: [],
  setAlgorithms: (algorithms) => set({ algorithms }),
  addAlgorithm: (algorithm) =>
    set((state) => ({ algorithms: [...state.algorithms, algorithm] })),
}));
