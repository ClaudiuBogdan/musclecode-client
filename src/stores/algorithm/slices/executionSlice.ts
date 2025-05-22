
import { runCode } from "@/lib/api/code";

import { withAlgorithm } from "../utils/stateUtils";

import type { AlgorithmState, ExecutionActions, StoreActions } from "../types";
import type { CodeExecutionResponse } from "@/types/testRunner";
import type { StateCreator } from "zustand";

const EXECUTION_TIMEOUT_SECONDS = 20; 

export const createExecutionSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  ExecutionActions
> = (set, get) => ({
  runCode: async (algorithmId) => {
    const state = get();

    return withAlgorithm(state, algorithmId, async () => {
      const algorithm = state.algorithms[algorithmId];
      const { activeLanguage, storedCode } = algorithm.code;

      if (algorithm.execution.isExecuting) {
        return;
      }

      // Set executing state
      set((state) => {
        state.algorithms[algorithmId].execution.isExecuting = true;
        state.algorithms[algorithmId].execution.error = null;
        state.algorithms[algorithmId].execution.executionResult = null;
        return state;
      });

      try {
        const files = Object.values(storedCode[activeLanguage]).filter(
          (file) => !file.hidden
        );

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  `Code execution timed out after ${EXECUTION_TIMEOUT_SECONDS} seconds`
                )
              ),
            EXECUTION_TIMEOUT_SECONDS * 1000
          );
        });

        const codePromise = runCode({
          algorithmId,
          language: activeLanguage,
          files,
        });
        const result = await Promise.race([codePromise, timeoutPromise]);

        // The timeout promise only throws an error, so we can safely cast the result to CodeExecutionResponse
        const executionResult = result as CodeExecutionResponse;

        set((state) => {
          state.algorithms[algorithmId].execution.executionResult =
            executionResult;
          state.algorithms[algorithmId].execution.isExecuting = false;
          return state;
        });
      } catch (error) {
        set((state) => {
          state.algorithms[algorithmId].execution.error = error as Error;
          state.algorithms[algorithmId].execution.isExecuting = false;
          return state;
        });
      }
    });
  },
});
