import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AlgorithmState, StoreActions } from "../../types";
import { mockAlgorithmState } from "../utils/testStore";
import { CodeLanguage } from "@/types/algorithm";
import { CodeExecutionResponse, TestResult } from "@/types/testRunner";
import { createCodeSlice } from "../../slices/codeSlice";
import { createTimerSlice } from "../../slices/timerSlice";
import { createExecutionSlice } from "../../slices/executionSlice";
import { createSubmissionSlice } from "../../slices/submissionSlice";
import { createAlgorithmSlice } from "../..";
import { v4 as uuidv4 } from "uuid";
import { getLanguageExtension } from "@/lib/utils/algorithm";

type TestStore = AlgorithmState & StoreActions;

const DEFAULT_ALGORITHM_ID = "test-algorithm";

const createTestStore = (
  initialState = mockAlgorithmState(DEFAULT_ALGORITHM_ID)
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api = {} as any;
  return create<TestStore>()(
    immer((set, get) => ({
      ...initialState,
      ...createAlgorithmSlice(set, get, api),
      ...createCodeSlice(set, get, api),
      ...createTimerSlice(set, get, api),
      ...createExecutionSlice(set, get, api),
      ...createSubmissionSlice(set, get, api),
    }))
  );
};

describe("Code Slice", () => {
  const DEFAULT_ALGORITHM_ID = "test-algorithm";
  const DEFAULT_TEST_CODE = "function solution() { return true; }";
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // Helper function to create a state with specific code for testing
  const setupStoreWithCode = (
    algorithmId: string,
    language: CodeLanguage,
    tab: string,
    code: string
  ) => {
    const state = mockAlgorithmState(algorithmId);
    state.algorithms[algorithmId].code.activeLanguage = language;
    state.algorithms[algorithmId].code.activeTab = tab;
    state.algorithms[algorithmId].code.storedCode[language][tab] = {
      id: `${algorithmId}-${uuidv4()}`,
      name: tab,
      type: tab.includes("test") ? "test" : "solution",
      content: code,
      extension: getLanguageExtension(language),
      language,
      readOnly: false,
      required: true,
    };
    return createTestStore(state);
  };

  describe("Code Management", () => {
    describe("setCode", () => {
      const testCases: Array<{
        language: CodeLanguage;
        tab: string;
        code: string;
      }> = [
        {
          language: "javascript",
          tab: "solution.js",
          code: "function solution() {}",
        },
        { language: "python", tab: "solution.py", code: "def solution():" },
        {
          language: "typescript",
          tab: "solution.ts",
          code: "function solution(): boolean {}",
        },
      ];

      testCases.forEach(({ language, tab, code }) => {
        it(`should correctly set code for ${language}/${tab}`, () => {
          store = setupStoreWithCode(DEFAULT_ALGORITHM_ID, language, tab, "");

          store.getState().setCode(DEFAULT_ALGORITHM_ID, code);

          const updatedCode = store
            .getState()
            .getCode(DEFAULT_ALGORITHM_ID, language, tab);
          expect(updatedCode).toBe(code);
        });
      });

      it("should maintain other language codes when updating specific language", () => {
        const initialState = mockAlgorithmState(DEFAULT_ALGORITHM_ID);
        const pythonCode = "def solution(): pass";
        initialState.algorithms[DEFAULT_ALGORITHM_ID].code.storedCode.python[
          "solution.py"
        ] = {
          id: `${DEFAULT_ALGORITHM_ID}-${uuidv4()}`,
          name: "solution.py",
          type: "solution",
          content: pythonCode,
          language: "python",
          extension: "py",
          readOnly: false,
          required: true,
        };
        store = createTestStore(initialState);

        store.getState().setCode(DEFAULT_ALGORITHM_ID, DEFAULT_TEST_CODE);

        expect(
          store
            .getState()
            .getCode(DEFAULT_ALGORITHM_ID, "python", "solution.py")
        ).toBe(pythonCode);
      });

      it("should throw error for non-existent algorithm", () => {
        expect(() => {
          store.getState().setCode("non-existent", DEFAULT_TEST_CODE);
        }).toThrow("Algorithm with id non-existent not found");
      });
    });

    describe("Code Reset", () => {
      it("should reset code to initial state while preserving metadata", () => {
        const state = store.getState();
        const { activeLanguage, activeTab } =
          state.algorithms[DEFAULT_ALGORITHM_ID].code;

        // Setup modified state using proper actions
        store.getState().setCode(DEFAULT_ALGORITHM_ID, DEFAULT_TEST_CODE);

        // Create a mock execution result
        const mockExecutionResult: CodeExecutionResponse = {
          type: "execution success",
          stdout: "test",
          stderr: "",
          exitCode: 0,
          wallTime: 100,
          timedOut: false,
          message: "Success",
          token: "test-token",
          result: {} as TestResult,
        };

        // Use set to modify the state through Immer
        store.setState((state) => {
          state.algorithms[DEFAULT_ALGORITHM_ID].execution.isExecuting = true;
          state.algorithms[DEFAULT_ALGORITHM_ID].execution.executionResult =
            mockExecutionResult;
          state.algorithms[DEFAULT_ALGORITHM_ID].execution.error = null;
          state.algorithms[DEFAULT_ALGORITHM_ID].submission.globalNotes =
            "test notes";
        });

        // Reset code
        store.getState().resetCode(DEFAULT_ALGORITHM_ID);

        const resetState = store.getState().algorithms[DEFAULT_ALGORITHM_ID];
        expect(
          resetState.code.storedCode[activeLanguage][activeTab].content
        ).toBe(
          resetState.code.initialStoredCode[activeLanguage][activeTab].content
        );
        expect(resetState.execution.isExecuting).toBe(false);
        expect(resetState.execution.executionResult).toBeNull();
        expect(resetState.submission.globalNotes).toBe("test notes");
      });
    });

    describe("Code Retrieval", () => {
      it("should correctly retrieve code for all supported languages", () => {
        const testCases: Array<{
          language: CodeLanguage;
          tab: string;
          code: string;
        }> = [
          { language: "javascript", tab: "solution.js", code: "js code" },
          { language: "python", tab: "solution.py", code: "py code" },
          { language: "typescript", tab: "solution.ts", code: "ts code" },
        ];

        const initialState = mockAlgorithmState(DEFAULT_ALGORITHM_ID);
        testCases.forEach(({ language, tab, code }) => {
          initialState.algorithms[DEFAULT_ALGORITHM_ID].code.storedCode[
            language
          ][tab] = {
            id: `${DEFAULT_ALGORITHM_ID}-${uuidv4()}`,
            name: tab,
            type: tab.includes("test") ? "test" : "solution",
            content: code,
            language,
            extension: getLanguageExtension(language),
            readOnly: false,
            required: true,
          };
        });
        store = createTestStore(initialState);

        testCases.forEach(({ language, tab, code }) => {
          expect(
            store.getState().getCode(DEFAULT_ALGORITHM_ID, language, tab)
          ).toBe(code);
        });
      });

      it("should return empty string for non-existent language/tab combinations", () => {
        expect(
          store
            .getState()
            .getCode(DEFAULT_ALGORITHM_ID, "javascript", "nonexistent.js")
        ).toBe("");
      });
    });
  });
});
