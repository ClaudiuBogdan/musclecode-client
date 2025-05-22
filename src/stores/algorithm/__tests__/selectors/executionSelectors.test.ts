import { createMockTestResponse } from "@/lib/mocks/api/code/utils";


import {
  selectExecutionState,
  selectIsExecuting,
  selectExecutionResult,
  selectExecutionError,
} from "../../selectors/executionSelectors";
import { mockAlgorithmState } from "../utils/testStore";

import type { AlgorithmState, ExecutionState } from "../../types";
import type { CodeExecutionResponse } from "@/types/testRunner";

describe("Execution Selectors", () => {
  const algorithmId = "test-algorithm";
  let state: AlgorithmState;
  const mockExecutionResult: CodeExecutionResponse = createMockTestResponse("");

  beforeEach(() => {
    state = mockAlgorithmState(algorithmId);
  });

  describe("selectExecutionState", () => {
    it("should return execution state for existing algorithm", () => {
      const executionState = selectExecutionState(state, algorithmId);
      expect(executionState).toBeDefined();
      expect(executionState).toEqual<ExecutionState>({
        isExecuting: false,
        executionResult: null,
        error: null,
      });
    });

    it("should return null for non-existent algorithm", () => {
      const executionState = selectExecutionState(state, "non-existent");
      expect(executionState).toBeNull();
    });

    it("should handle empty state", () => {
      const emptyState: AlgorithmState = {
        algorithms: {},
        metadata: {
          isLoading: false,
          error: null,
          activeAlgorithmId: null,
        },
      };
      const executionState = selectExecutionState(emptyState, algorithmId);
      expect(executionState).toBeNull();
    });
  });

  describe("selectIsExecuting", () => {
    it("should return false by default", () => {
      const isExecuting = selectIsExecuting(state, algorithmId);
      expect(isExecuting).toBe(false);
    });

    it("should return true when execution is in progress", () => {
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: true,
          executionResult: null,
          error: null,
        },
      });
      const isExecuting = selectIsExecuting(state, algorithmId);
      expect(isExecuting).toBe(true);
    });

    it("should return false for non-existent algorithm", () => {
      const isExecuting = selectIsExecuting(state, "non-existent");
      expect(isExecuting).toBe(false);
    });

    it("should handle state transitions", () => {
      // Start execution
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: true,
          executionResult: null,
          error: null,
        },
      });
      expect(selectIsExecuting(state, algorithmId)).toBe(true);

      // Complete execution
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: false,
          executionResult: mockExecutionResult,
          error: null,
        },
      });
      expect(selectIsExecuting(state, algorithmId)).toBe(false);
    });
  });

  describe("selectExecutionResult", () => {
    it("should return null by default", () => {
      const result = selectExecutionResult(state, algorithmId);
      expect(result).toBeNull();
    });

    it("should return execution result when available", () => {
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: false,
          executionResult: mockExecutionResult,
          error: null,
        },
      });
      const result = selectExecutionResult(state, algorithmId);
      expect(result).toEqual(mockExecutionResult);
    });

    it("should return null for non-existent algorithm", () => {
      const result = selectExecutionResult(state, "non-existent");
      expect(result).toBeNull();
    });

    it("should handle failed execution result", () => {
      const failedResult = mockExecutionResult;
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: false,
          executionResult: failedResult,
          error: null,
        },
      });
      const result = selectExecutionResult(state, algorithmId);
      expect(result).toEqual(failedResult);
    });
  });

  describe("selectExecutionError", () => {
    it("should return null by default", () => {
      const error = selectExecutionError(state, algorithmId);
      expect(error).toBeNull();
    });

    it("should return error when execution fails", () => {
      const testError = new Error("Test execution error");
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: false,
          executionResult: null,
          error: testError,
        },
      });
      const error = selectExecutionError(state, algorithmId);
      expect(error).toBe(testError);
    });

    it("should return null for non-existent algorithm", () => {
      const error = selectExecutionError(state, "non-existent");
      expect(error).toBeNull();
    });

    it("should be cleared after successful execution", () => {
      // Set error
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: false,
          executionResult: null,
          error: new Error("Initial error"),
        },
      });
      expect(selectExecutionError(state, algorithmId)).toBeInstanceOf(Error);

      // Successful execution
      state = mockAlgorithmState(algorithmId, {
        execution: {
          isExecuting: false,
          executionResult: mockExecutionResult,
          error: null,
        },
      });
      expect(selectExecutionError(state, algorithmId)).toBeNull();
    });
  });
});
