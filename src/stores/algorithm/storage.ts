import { PersistStorage, StorageValue } from "zustand/middleware";
import { AlgorithmState, StoreActions } from "./types";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "AlgorithmStorage" });

export const STORAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type StoreState = AlgorithmState & StoreActions;

export const algorithmStorageWithTTL: PersistStorage<StoreState> = {
  getItem: (name: string) => {
    try {
      const itemStr = localStorage.getItem(name);
      if (!itemStr) {
        logger.debug("Storage Item Not Found", { key: name });
        return null;
      }

      const state = JSON.parse(itemStr);
      if (!state?.state?.algorithms) {
        logger.debug("No Algorithms In State", { key: name });
        return state;
      }

      const now = Date.now();
      const algorithms = state.state.algorithms;
      const expiredIds: string[] = [];

      // In-place modification for better performance
      for (const id in algorithms) {
        if (
          algorithms[id]._createdAt &&
          now - algorithms[id]._createdAt > STORAGE_TTL_MS
        ) {
          delete algorithms[id];
          expiredIds.push(id);
        }
      }

      if (expiredIds.length > 0) {
        logger.info("Algorithms Expired", {
          expiredIds,
          ttlMs: STORAGE_TTL_MS,
        });
      }

      return state;
    } catch (error) {
      logger.error("Storage Read Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        key: name,
      });
      return null;
    }
  },

  setItem: (name: string, value: StorageValue<StoreState>) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      logger.error("Storage Write Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        key: name,
      });
    }
  },

  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
      logger.debug("Storage Item Removed", { key: name });
    } catch (error) {
      logger.error("Storage Remove Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        key: name,
      });
    }
  },
};
