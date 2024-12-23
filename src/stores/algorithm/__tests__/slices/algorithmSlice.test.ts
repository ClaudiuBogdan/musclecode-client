import { describe, it, expect, beforeEach, vi } from "vitest";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AlgorithmState, StoreActions } from "../../types";
import { mockAlgorithmState } from "../utils/testStore";
import { createAlgorithmSlice } from "../..";
import { createCodeSlice } from "../../slices/codeSlice";
import { createTimerSlice } from "../../slices/timerSlice";
import { createExecutionSlice } from "../../slices/executionSlice";
import { createSubmissionSlice } from "../../slices/submissionSlice";
import { getAlgorithm, GetAlgorithmResponse } from "@/lib/api/code";

// Mock the API call
vi.mock("@/lib/api/code");
const mockGetAlgorithm = vi.mocked(getAlgorithm);

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
      };
    })
  );
};

describe("Algorithm Slice", () => {
  const algorithmId = "test-algorithm";
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore({
      metadata: {
        isLoading: false,
        error: null,
        activeAlgorithmId: null,
      },
      algorithms: {},
    });
    vi.clearAllMocks();
    mockGetAlgorithm.mockReset();
  });

  describe("initializeAlgorithm", () => {
    const mockAlgorithmResponse: GetAlgorithmResponse = {
      id: algorithmId,
      algorithmTemplate: {
        id: algorithmId,
        title: "Test Algorithm",
        description: "Test Description",
        category: "test",
        summary: "Test Summary",
        difficulty: "easy" as const,
        tags: ["test"],
        files: [
          {
            id: "test-file-id",
            language: "javascript",
            name: "solution",
            content: "function solution() {}",
            type: "solution",
            readOnly: false,
            required: true,
            extension: "js",
          },
        ],
      },
      submissions: [],
      notes: "test notes",
      due: "2024-01-01",
    };

    it("should set loading state and initialize placeholder immediately", async () => {
      // Setup mock to delay the response
      mockGetAlgorithm.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockAlgorithmResponse), 100)
          )
      );

      // Start initialization
      const initPromise = store.getState().initializeAlgorithm(algorithmId);

      // Check immediate state changes
      const stateAfterInit = store.getState();
      expect(stateAfterInit.metadata.isLoading).toBe(true);
      expect(stateAfterInit.metadata.error).toBeNull();
      expect(stateAfterInit.algorithms[algorithmId]).toBeDefined();
      expect(stateAfterInit.algorithms[algorithmId].code.activeLanguage).toBe(
        "javascript"
      );
      expect(stateAfterInit.algorithms[algorithmId].code.storedCode).toEqual(
        {}
      );

      // Wait for initialization to complete
      await initPromise;

      // Check final state
      const finalState = store.getState();
      expect(finalState.metadata.isLoading).toBe(false);
      expect(
        finalState.algorithms[algorithmId].metadata.template?.description
      ).toBe("Test Description");
      expect(
        finalState.algorithms[algorithmId].code.storedCode.javascript[
          "solution.js"
        ].content
      ).toBe("function solution() {}");
    });

    it("should handle initialization error and clean up placeholder", async () => {
      const error = new Error("Failed to fetch algorithm");
      mockGetAlgorithm.mockRejectedValueOnce(error);

      await expect(
        store.getState().initializeAlgorithm(algorithmId)
      ).rejects.toThrow("Failed to fetch algorithm");

      const finalState = store.getState();
      expect(finalState.metadata.isLoading).toBe(false);
      expect(finalState.metadata.error).toBe(error.message);
      expect(finalState.algorithms[algorithmId]).toBeUndefined();
    });

    it("should not reinitialize if algorithm exists and has no error", async () => {
      // First initialization
      mockGetAlgorithm.mockResolvedValueOnce(mockAlgorithmResponse);
      await store.getState().initializeAlgorithm(algorithmId);

      // Reset mock to verify it's not called again
      mockGetAlgorithm.mockReset();

      // Try to initialize again
      await store.getState().initializeAlgorithm(algorithmId);

      expect(mockGetAlgorithm).not.toHaveBeenCalled();
    });

    it("should reinitialize if algorithm exists but has an error", async () => {
      // First initialization with error
      mockGetAlgorithm.mockRejectedValueOnce(new Error("Initial error"));

      // Expect the first call to fail
      await expect(
        store.getState().initializeAlgorithm(algorithmId)
      ).rejects.toThrow("Initial error");

      // Second initialization should succeed
      mockGetAlgorithm.mockResolvedValueOnce(mockAlgorithmResponse);
      await store.getState().initializeAlgorithm(algorithmId);

      const finalState = store.getState();
      expect(finalState.metadata.error).toBeNull();
      expect(finalState.algorithms[algorithmId]).toBeDefined();
      expect(
        finalState.algorithms[algorithmId].metadata.template?.description
      ).toBe("Test Description");
    });

    it("should handle empty files array", async () => {
      const responseWithNoFiles = {
        ...mockAlgorithmResponse,
        algorithmTemplate: {
          ...mockAlgorithmResponse.algorithmTemplate,
          files: [],
        },
      };
      mockGetAlgorithm.mockResolvedValueOnce(responseWithNoFiles);

      await expect(
        store.getState().initializeAlgorithm(algorithmId)
      ).rejects.toThrow(`No language files found for algorithm ${algorithmId}`);

      const finalState = store.getState();
      expect(finalState.metadata.isLoading).toBe(false);
      expect(finalState.metadata.error).toBe(
        `No language files found for algorithm ${algorithmId}`
      );
      expect(finalState.algorithms[algorithmId]).toBeUndefined();
    });
  });
});
