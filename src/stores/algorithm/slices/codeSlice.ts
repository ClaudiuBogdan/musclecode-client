import { StateCreator } from "zustand";
import { AlgorithmState, CodeActions, StoreActions } from "../types";
import { withAlgorithm } from "../utils/stateUtils";

export const createCodeSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  CodeActions
> = (set, get) => ({
  setCode: (algorithmId, code) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        const algorithm = state.algorithms[algorithmId];
        const { activeLanguage, activeTab } = algorithm.code;
        algorithm.code.storedCode[activeLanguage][activeTab] = code;
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

        algorithm.submission = {
          isSubmitting: false,
          completed: false,
          submissionNotes: "",
          globalNotes: algorithm.submission?.globalNotes ?? "",
        };

        return state;
      })
    ),

  getCode: (algorithmId, language, tab) => {
    const state = get();
    return withAlgorithm(state, algorithmId, () => {
      const algorithm = state.algorithms[algorithmId];
      return algorithm.code.storedCode[language]?.[tab] ?? "";
    });
  },

  getFiles: (algorithmId, language) => {
    const state = get();
    return withAlgorithm(state, algorithmId, () => {
      const algorithm = state.algorithms[algorithmId];
      const files = algorithm.code.storedCode[language] ?? {};
      return Object.keys(files).map((name) => ({ name, readOnly: false }));
    });
  },
});
