import { StateCreator } from "zustand";
import { AlgorithmState, ExecutionActions, StoreActions } from "../types";
import { withAlgorithm } from "../utils/stateUtils";
import { runCode } from "@/lib/api/code";
import { CodeExecutionResponse } from "@/types/testRunner";

const EXECUTION_TIMEOUT = 10000; // 10 seconds

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
        const files = storedCode[activeLanguage];

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(new Error("Code execution timed out after 10 seconds")),
            EXECUTION_TIMEOUT
          );
        });

        const codePromise = runCode({
          algorithmId,
          language: activeLanguage,
          files,
        });
        const executionResult = await Promise.race([
          codePromise,
          timeoutPromise,
        ]);

        set((state) => {
          state.algorithms[algorithmId].execution.executionResult =
            executionResult as CodeExecutionResponse;
          state.algorithms[algorithmId].execution.isExecuting = false;
          return state;
        });
      } catch (error) {
        set((state) => {
          state.algorithms[algorithmId].execution.error = error as Error;
          state.algorithms[algorithmId].execution.isExecuting = false;
          return state;
        });
        throw error;
      }
    });
  }
});
