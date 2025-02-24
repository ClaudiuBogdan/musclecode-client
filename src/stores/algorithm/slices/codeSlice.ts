import { StateCreator } from "zustand";
import { AlgorithmState, CodeActions, StoreActions } from "../types";
import { withAlgorithm } from "../utils/stateUtils";
import { createLogger } from "@/lib/logger";

const logger = createLogger({
  context: "CodeSlice",
});

export const createCodeSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  CodeActions
> = (set, get) => ({
  setCode: (algorithmId, language, fileId, code) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        const algorithm = state.algorithms[algorithmId];
        const file = algorithm.code.storedCode[language][fileId];

        if (!file) {
          logger.error("File not found", {
            method: "setCode",
            algorithmId,
            language,
            fileId,
          });
          throw new Error("File not found");
        }

        algorithm.code.storedCode[language][fileId] = {
          ...file,
          content: code,
        };
        return state;
      })
    ),

  setActiveLanguage: (algorithmId, language) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].code.activeLanguage = language;
        return state;
      })
    ),

  setActiveTab: (algorithmId, tab) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].code.activeTab = tab;
        return state;
      })
    ),

  resetCode: (algorithmId) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        const algorithm = state.algorithms[algorithmId];
        algorithm.code.storedCode = { ...algorithm.code.initialStoredCode };

        algorithm.execution = {
          isExecuting: false,
          executionResult: null,
          error: null,
        };

        algorithm.userProgress = {
          ...algorithm.userProgress,
          isSubmitting: false,
          completed: false,
          lastSubmissionDate: null,
        };

        return state;
      })
    ),

  getActiveFile: (algorithmId, language, tab) => {
    const state = get();
    return withAlgorithm(state, algorithmId, () => {
      const algorithm = state.algorithms[algorithmId];
      const file = algorithm.code.storedCode[language]?.[tab];
      if (!file) {
        logger.error("File not found", {
          method: "getActiveFile",
          algorithmId,
          language,
          tab,
        });
        throw new Error("File not found");
      }
      return file;
    });
  },

  getFiles: (algorithmId, language) => {
    const state = get();
    return withAlgorithm(state, algorithmId, () => {
      const algorithm = state.algorithms[algorithmId];
      const files = algorithm.code.storedCode[language] ?? {};
      return Object.values(files);
    });
  },
});
