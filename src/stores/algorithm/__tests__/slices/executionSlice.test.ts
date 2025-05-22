import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { runCode } from "@/lib/api/code";

import { createAlgorithmSlice, createHintSlice } from "../..";
import { createCodeSlice } from "../../slices/codeSlice";
import { createExecutionSlice } from "../../slices/executionSlice";
import { createSubmissionSlice } from "../../slices/submissionSlice";
import { createTimerSlice } from "../../slices/timerSlice";
import { mockAlgorithmState } from "../utils/testStore";

import type { AlgorithmState, StoreActions } from "../../types";
import type { AlgorithmFile } from "@/types/algorithm";
import type { CodeExecutionResponse, TestResult } from "@/types/testRunner";




// Mock the API call
vi.mock("@/lib/api/code");
const mockRunCode = vi.mocked(runCode);

type TestStore = AlgorithmState & StoreActions;

const DEFAULT_ALGORITHM_ID = "test-algorithm";

const createTestStore = (
  initialState = mockAlgorithmState(DEFAULT_ALGORITHM_ID)
) => {
  // eslint-disable-next-line
  const api = {} as any;
  return create<TestStore>()(
    immer((set, get) => {
      return {
        ...initialState,
        ...createAlgorithmSlice(set, get, api),
        ...createCodeSlice(set, get, api),
        ...createTimerSlice(set, get, api),
        ...createExecutionSlice(set, get, api),
        ...createSubmissionSlice(set, get, api),
        ...createHintSlice(set, get, api),
      };
    })
  );
};

describe("Execution Slice", () => {
  const algorithmId = "test-algorithm";
  let store = createTestStore();

  const mockResult: CodeExecutionResponse = {
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

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
    mockRunCode.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("runCode", () => {
    it("should execute code successfully", async () => {
      mockRunCode.mockResolvedValueOnce(mockResult);

      await store.getState().runCode(algorithmId);

      const executionState = store.getState().algorithms[algorithmId].execution;
      expect(executionState.isExecuting).toBe(false);
      expect(executionState.executionResult).toEqual(mockResult);
      expect(executionState.error).toBeNull();
    });

    it("should handle execution failure", async () => {
      const error = new Error("Execution failed");
      mockRunCode.mockRejectedValueOnce(error);

      await expect(store.getState().runCode(algorithmId)).rejects.toThrow(
        error
      );

      const executionState = store.getState().algorithms[algorithmId].execution;
      expect(executionState.isExecuting).toBe(false);
      expect(executionState.executionResult).toBeNull();
      expect(executionState.error).toEqual(error);
    });

    it("should prevent concurrent executions", async () => {
      mockRunCode.mockImplementationOnce(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockResult), 100))
      );

      const firstExecution = store.getState().runCode(algorithmId);
      const secondExecution = store.getState().runCode(algorithmId);

      expect(
        store.getState().algorithms[algorithmId].execution.isExecuting
      ).toBe(true);

      await firstExecution;
      await secondExecution;

      expect(mockRunCode).toHaveBeenCalledTimes(1);
    });

    it("should handle execution timeout", async () => {
      vi.useFakeTimers();

      mockRunCode.mockImplementationOnce(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockResult), 15000))
      );

      const execution = store.getState().runCode(algorithmId);

      // Run all pending timers immediately
      vi.runAllTimers();

      await expect(execution).rejects.toThrow(
        "Code execution timed out after 10 seconds"
      );

      const executionState = store.getState().algorithms[algorithmId].execution;
      expect(executionState.isExecuting).toBe(false);
      expect(executionState.executionResult).toBeNull();
      expect(executionState.error).toBeDefined();
      expect(executionState.error?.message).toBe(
        "Code execution timed out after 10 seconds"
      );
    });

    it("should pass correct parameters to runCode", async () => {
      mockRunCode.mockResolvedValueOnce(mockResult);

      const state = store.getState();
      const { activeLanguage, activeTab } = state.algorithms[algorithmId].code;
      const mockFile: AlgorithmFile = {
        id: "test-uuid",
        name: "solution",
        content: "function solution() { return true; }",
        type: "solution",
        language: "javascript",
        extension: "js",
      };
      state.algorithms[algorithmId].code.storedCode[activeLanguage][activeTab] =
        mockFile;

      await store.getState().runCode(algorithmId);

      expect(mockRunCode).toHaveBeenCalledWith({
        algorithmId,
        language: activeLanguage,
        files: [
          state.algorithms[algorithmId].code.storedCode[activeLanguage][
            activeTab
          ],
        ],
      });
    });

    it("should throw error for non-existent algorithm", async () => {
      await expect(store.getState().runCode("non-existent")).rejects.toThrow();
    });

    it("should update execution state during lifecycle", async () => {
      mockRunCode.mockResolvedValueOnce(mockResult);

      const executionPromise = store.getState().runCode(algorithmId);

      expect(
        store.getState().algorithms[algorithmId].execution.isExecuting
      ).toBe(true);
      expect(
        store.getState().algorithms[algorithmId].execution.executionResult
      ).toBeNull();
      expect(
        store.getState().algorithms[algorithmId].execution.error
      ).toBeNull();

      await executionPromise;

      const executionState = store.getState().algorithms[algorithmId].execution;
      expect(executionState.isExecuting).toBe(false);
      expect(executionState.executionResult).toEqual(mockResult);
      expect(executionState.error).toBeNull();
    });

    it("should maintain execution history", async () => {
      const firstResult = { ...mockResult, wallTime: 100 };
      mockRunCode.mockResolvedValueOnce(firstResult);
      await store.getState().runCode(algorithmId);

      const secondResult = { ...mockResult, wallTime: 200 };
      mockRunCode.mockResolvedValueOnce(secondResult);
      await store.getState().runCode(algorithmId);

      const executionState = store.getState().algorithms[algorithmId].execution;
      expect(executionState.executionResult).toEqual(secondResult);
    });
  });
});
