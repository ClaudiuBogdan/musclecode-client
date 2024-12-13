import {
  selectActiveCode,
  selectActiveLanguage,
  selectActiveTab,
  selectCodeState,
  selectAvailableLanguages,
  selectAvailableFiles,
} from "../../selectors/codeSelectors";
import { mockAlgorithmState } from "../utils/testStore";
import { AlgorithmState, CodeState, StoredCode } from "../../types";
import { CodeLanguage } from "@/types/algorithm";

describe("Code Selectors", () => {
  const algorithmId = "test-algorithm";
  let state: AlgorithmState;
  let codeState: CodeState;

  beforeEach(() => {
    state = mockAlgorithmState(algorithmId);
    codeState = state.algorithms[algorithmId].code;
  });

  describe("selectActiveCode", () => {
    it("should return current code for active language and tab", () => {
      const code = selectActiveCode(state, algorithmId);
      expect(code).toBe(
        codeState.storedCode[codeState.activeLanguage][codeState.activeTab]
      );
    });

    it("should return empty string for non-existent algorithm", () => {
      const code = selectActiveCode(state, "non-existent");
      expect(code).toBe("");
    });

    it("should return empty string for non-existent language", () => {
      state.algorithms[algorithmId].code.activeLanguage =
        "non-existent" as CodeLanguage;
      const code = selectActiveCode(state, algorithmId);
      expect(code).toBe("");
    });
  });

  describe("selectActiveLanguage", () => {
    it("should return active language", () => {
      const language = selectActiveLanguage(state, algorithmId);
      expect(language).toBe(codeState.activeLanguage);
    });

    it("should return null for non-existent algorithm", () => {
      const language = selectActiveLanguage(state, "non-existent");
      expect(language).toBeNull();
    });
  });

  describe("selectActiveTab", () => {
    it("should return active tab", () => {
      const tab = selectActiveTab(state, algorithmId);
      expect(tab).toBe(codeState.activeTab);
    });

    it("should return null for non-existent algorithm", () => {
      const tab = selectActiveTab(state, "non-existent");
      expect(tab).toBeNull();
    });
  });

  describe("selectCodeState", () => {
    it("should return entire code state", () => {
      const selectedCodeState = selectCodeState(state, algorithmId);
      expect(selectedCodeState).toEqual(codeState);
    });

    it("should return null for non-existent algorithm", () => {
      const selectedCodeState = selectCodeState(state, "non-existent");
      expect(selectedCodeState).toBeNull();
    });
  });

  describe("selectAvailableLanguages", () => {
    it("should return list of available languages", () => {
      const languages = selectAvailableLanguages(state, algorithmId);
      expect(languages).toEqual(Object.keys(codeState.storedCode));
    });

    it("should return empty array for non-existent algorithm", () => {
      const languages = selectAvailableLanguages(state, "non-existent");
      expect(languages).toEqual([]);
    });

    it("should handle empty stored code", () => {
      state.algorithms[algorithmId].code.storedCode = {} as StoredCode;
      const languages = selectAvailableLanguages(state, algorithmId);
      expect(languages).toEqual([]);
    });
  });

  describe("selectAvailableFiles", () => {
    it("should return list of files for given language", () => {
      const files = selectAvailableFiles(state, algorithmId, "javascript");
      const expectedFiles = Object.keys(codeState.storedCode.javascript).map(
        (name) => ({
          name,
          readOnly: false,
        })
      );
      expect(files).toEqual(expectedFiles);
    });

    it("should return empty array for non-existent algorithm", () => {
      const files = selectAvailableFiles(state, "non-existent", "javascript");
      expect(files).toEqual([]);
    });

    it("should return empty array for non-existent language", () => {
      const files = selectAvailableFiles(
        state,
        algorithmId,
        "non-existent" as CodeLanguage
      );
      expect(files).toEqual([]);
    });

    it("should handle empty language files", () => {
      state.algorithms[algorithmId].code.storedCode.javascript = {};
      const files = selectAvailableFiles(state, algorithmId, "javascript");
      expect(files).toEqual([]);
    });
  });
});
