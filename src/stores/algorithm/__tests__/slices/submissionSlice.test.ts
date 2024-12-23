import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { create } from "zustand";
import { createSubmissionSlice } from "../../slices/submissionSlice";
import { AlgorithmState, StoreActions } from "../../types";
import { mockAlgorithmState } from "../utils/testStore";
import { saveSubmission } from "@/lib/api/code";
import { AlgorithmFile, Rating } from "@/types/algorithm";
import { createAlgorithmSlice } from "../..";
import { createCodeSlice } from "../../slices/codeSlice";
import { createTimerSlice } from "../../slices/timerSlice";
import { createExecutionSlice } from "../../slices/executionSlice";
import { immer } from "zustand/middleware/immer";

// Mock the API call and UUID generation
vi.mock("@/lib/api/code");
vi.mock("uuid", () => ({
  v4: () => "test-uuid",
}));

const mockSaveSubmission = saveSubmission as unknown as ReturnType<
  typeof vi.fn
>;

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

describe("Submission Slice", () => {
  const algorithmId = "test-algorithm";
  let store = createTestStore();
  const mockDate = new Date("2024-01-01T10:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    store = createTestStore();
    vi.mocked(mockSaveSubmission).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("submit", () => {
    const difficulty: Rating = "easy";
    const mockFile: AlgorithmFile = {
      id: "test-uuid",
      name: "solution",
      content: "function solution() { return true; }",
      type: "solution",
      language: "javascript",
      extension: "js",
    };

    beforeEach(() => {
      const state = store.getState();
      const { activeLanguage, activeTab } = state.algorithms[algorithmId].code;
      state.algorithms[algorithmId].code.storedCode[activeLanguage][activeTab] =
        mockFile;
    });

    it("should submit code successfully", async () => {
      vi.mocked(mockSaveSubmission).mockResolvedValueOnce(undefined);

      const result = await store.getState().submit(algorithmId, difficulty);

      expect(result).toBe(true);
      const submissionState =
        store.getState().algorithms[algorithmId].userProgress;
      expect(submissionState.isSubmitting).toBe(false);
      expect(submissionState.completed).toBe(true);

      // Verify submission data
      expect(mockSaveSubmission).toHaveBeenCalledWith(
        algorithmId,
        expect.objectContaining({
          id: "test-uuid",
          algorithmId,
          difficulty,
          code: mockFile.content,
          createdAt: mockDate.toISOString(),
        })
      );
    });

    it("should handle submission failure", async () => {
      vi.mocked(mockSaveSubmission).mockRejectedValueOnce(
        new Error("Submission failed")
      );

      const result = await store.getState().submit(algorithmId, difficulty);

      expect(result).toBe(false);
      const submissionState =
        store.getState().algorithms[algorithmId].userProgress;
      expect(submissionState.isSubmitting).toBe(false);
      expect(submissionState.completed).toBe(false);
    });

    it("should prevent concurrent submissions", async () => {
      vi.mocked(mockSaveSubmission).mockImplementationOnce(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
      );

      const firstSubmission = store.getState().submit(algorithmId, difficulty);
      const secondSubmission = store.getState().submit(algorithmId, difficulty);

      expect(
        store.getState().algorithms[algorithmId].userProgress.isSubmitting
      ).toBe(true);

      vi.advanceTimersByTime(100);
      await Promise.all([firstSubmission, secondSubmission]);

      expect(mockSaveSubmission).toHaveBeenCalledTimes(1);
    });

    it("should include submission notes in submission", async () => {
      const testNotes = "Test submission notes";
      store.getState().setSubmissionNotes(algorithmId, testNotes);

      await store.getState().submit(algorithmId, difficulty);

      expect(mockSaveSubmission).toHaveBeenCalledWith(
        algorithmId,
        expect.objectContaining({
          notes: testNotes,
        })
      );
    });

    it("should throw error for non-existent algorithm", async () => {
      await expect(
        store.getState().submit("non-existent", difficulty)
      ).rejects.toThrow();
    });

    it("should update submission state during lifecycle", async () => {
      vi.mocked(mockSaveSubmission).mockResolvedValueOnce(undefined);

      const submissionPromise = store
        .getState()
        .submit(algorithmId, difficulty);

      // Check initial state
      expect(
        store.getState().algorithms[algorithmId].userProgress.isSubmitting
      ).toBe(true);
      expect(
        store.getState().algorithms[algorithmId].userProgress.completed
      ).toBe(false);

      await submissionPromise;

      // Check final state
      const submissionState =
        store.getState().algorithms[algorithmId].userProgress;
      expect(submissionState.isSubmitting).toBe(false);
      expect(submissionState.completed).toBe(true);
    });
  });

  describe("setGlobalNotes", () => {
    it("should update global notes", () => {
      const testNotes = "Test global notes";
      store.getState().setGlobalNotes(algorithmId, testNotes);

      const globalNotes =
        store.getState().algorithms[algorithmId].userProgress.notes;
      expect(globalNotes).toBe(testNotes);
    });

    it("should maintain global notes through submission", async () => {
      const testNotes = "Test global notes";
      store.getState().setGlobalNotes(algorithmId, testNotes);

      vi.mocked(mockSaveSubmission).mockResolvedValueOnce(undefined);
      await store.getState().submit(algorithmId, "easy");

      const globalNotes =
        store.getState().algorithms[algorithmId].userProgress.notes;
      expect(globalNotes).toBe(testNotes);
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().setGlobalNotes("non-existent", "test");
      }).toThrow();
    });
  });

  describe("setSubmissionNotes", () => {
    it("should update submission notes", () => {
      const testNotes = "Test submission notes";
      store.getState().setSubmissionNotes(algorithmId, testNotes);

      const submissionNotes =
        store.getState().algorithms[algorithmId].userProgress.notes;
      expect(submissionNotes).toBe(testNotes);
    });

    it("should maintain separate submission and global notes", () => {
      const globalNotes = "Global notes";
      const submissionNotes = "Submission notes";

      store.getState().setGlobalNotes(algorithmId, globalNotes);
      store.getState().setSubmissionNotes(algorithmId, submissionNotes);

      const state = store.getState().algorithms[algorithmId].userProgress;
      expect(state.notes).toBe(submissionNotes);
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().setSubmissionNotes("non-existent", "test");
      }).toThrow();
    });

    it("should maintain submission notes after successful submission", async () => {
      const testNotes = "Test submission notes";
      store.getState().setSubmissionNotes(algorithmId, testNotes);

      vi.mocked(mockSaveSubmission).mockResolvedValueOnce(undefined);
      await store.getState().submit(algorithmId, "easy");

      const submissionNotes: string =
        store.getState().algorithms[algorithmId].userProgress.notes;

      expect(submissionNotes).toBe(testNotes);
    });
  });
});
