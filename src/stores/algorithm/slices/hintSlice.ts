import { StateCreator } from "zustand";
import { AlgorithmState, HintActions, StoreActions } from "../types";
import { generateHint } from "@/lib/api/hints";
import { showToast } from "@/utils/toast";

export const createHintSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  HintActions
> = (set, get) => ({
  requestHint: async (algorithmId: string) => {
    try {
      const algorithmData = get().algorithms[algorithmId];

      if (!algorithmData) {
        showToast.error("Algorithm not found");
        return;
      }

      // Set loading state
      set((state) => {
        if (state.algorithms[algorithmId]) {
          state.algorithms[algorithmId].hint.isLoading = true;
          state.algorithms[algorithmId].hint.error = null;
        }
      });

      // Get all the context needed for a good hint
      const { code, execution, metadata } = algorithmData;
      const { storedCode, activeLanguage } = code;
      const { executionResult } = execution;
      const algorithmTemplate = metadata.template;

      if (!algorithmTemplate) {
        throw new Error("Algorithm template not found");
      }

      // Get the description from the template
      const description = algorithmTemplate.description;

      // Get all the files for the current language
      const languageFiles = storedCode[activeLanguage] || {};

      // Find the test file and solution file (if any)
      const testFile = Object.values(languageFiles).find(
        (file) => file.name.includes("test") || file.name.includes("Test")
      );

      const solutionFile = Object.values(languageFiles).find(
        (file) =>
          file.name.includes("solution") || file.name.includes("Solution")
      );

      // Generate the hint
      const hint = await generateHint({
        description,
        code: languageFiles,
        testFile,
        solutionFile,
        executionResult,
      });

      // Update state with the hint
      set((state) => {
        if (state.algorithms[algorithmId]) {
          state.algorithms[algorithmId].hint.isLoading = false;
          state.algorithms[algorithmId].hint.content = hint;
          state.algorithms[algorithmId].hint.lastRequestTime = Date.now();
        }
      });
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate hint";

      set((state) => {
        if (state.algorithms[algorithmId]) {
          state.algorithms[algorithmId].hint.isLoading = false;
          state.algorithms[algorithmId].hint.error = errorMessage;
        }
      });

      showToast.error("Failed to generate hint: " + errorMessage);
    }
  },

  clearHint: (algorithmId: string) => {
    set((state) => {
      if (state.algorithms[algorithmId]) {
        state.algorithms[algorithmId].hint.content = null;
        state.algorithms[algorithmId].hint.error = null;
        state.algorithms[algorithmId].hint.isLoading = false;
      }
    });
  },
});
