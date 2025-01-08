import { PersistStorage, StorageValue } from "zustand/middleware";
import { AlgorithmState, StoreActions } from "./types";

export const STORAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type StoreState = AlgorithmState & StoreActions;

export const algorithmStorageWithTTL: PersistStorage<StoreState> = {
  getItem: (name: string) => {
    try {
      const itemStr = localStorage.getItem(name);
      if (!itemStr) return null;

      const state = JSON.parse(itemStr);
      if (!state?.state?.algorithms) return state;

      const now = Date.now();
      const algorithms = state.state.algorithms;

      // In-place modification for better performance
      for (const id in algorithms) {
        if (
          algorithms[id]._createdAt &&
          now - algorithms[id]._createdAt > STORAGE_TTL_MS
        ) {
          delete algorithms[id];
          console.log(`Expiring algorithm ${id} from local storage.`);
        }
      }

      return state;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  setItem: (name: string, value: StorageValue<StoreState>) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },

  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};
