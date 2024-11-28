import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AlgorithmState {
  algorithms: {
    [key: string]: {
      id: string;
      completed: boolean;
    };
  };
  setCompleted: (id: string, completed: boolean) => void;
}

export const mockedAlgorithmsStore = create<AlgorithmState>()(
  persist(
    (set) => ({
      algorithms: {},
      setCompleted: (id: string, completed: boolean) => {
        set((state) => ({
          algorithms: { ...state.algorithms, [id]: { id, completed } },
        }));
      },
    }),
    {
      name: "mocked-algorithms-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
