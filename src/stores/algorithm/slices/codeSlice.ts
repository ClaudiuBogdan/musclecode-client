import { StateCreator } from "zustand";
import { AlgorithmState, CodeActions, StoreActions } from "../types";
import { withAlgorithm } from "../utils/stateUtils";
import { v4 as uuidv4 } from "uuid";
import { getLanguageExtension } from "@/lib/utils/algorithm";

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
        const existingFile =
          algorithm.code.storedCode[activeLanguage][activeTab];

        // Update existing file or create new one
        algorithm.code.storedCode[activeLanguage][activeTab] = {
          id: existingFile?.id || `${algorithmId}-${uuidv4()}`,
          name: activeTab,
          type: activeTab.includes("test") ? "test" : "solution",
          content: code,
          language: activeLanguage,
          extension: getLanguageExtension(activeLanguage),
          readOnly: existingFile?.readOnly || false,
          required: existingFile?.required || true,
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
      return algorithm.code.storedCode[language]?.[tab]?.content ?? "";
    });
  },

  getFiles: (algorithmId, language) => {
    const state = get();
    return withAlgorithm(state, algorithmId, () => {
      const algorithm = state.algorithms[algorithmId];
      const files = algorithm.code.storedCode[language] ?? {};
      return Object.values(files).map(({ name, readOnly }) => ({
        name,
        readOnly,
      }));
    });
  },
});
