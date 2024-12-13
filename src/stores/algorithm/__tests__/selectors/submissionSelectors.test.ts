import {
  selectSubmissionState,
  selectIsSubmitting,
  selectIsCompleted,
  selectGlobalNotes,
  selectSubmissionNotes,
} from "../../selectors/submissionSelectors";
import { mockAlgorithmState } from "../utils/testStore";
import { AlgorithmState, SubmissionState } from "../../types";

describe("Submission Selectors", () => {
  const algorithmId = "test-algorithm";
  let state: AlgorithmState;

  beforeEach(() => {
    state = mockAlgorithmState(algorithmId);
  });

  describe("selectSubmissionState", () => {
    it("should return submission state for existing algorithm", () => {
      const submissionState = selectSubmissionState(state, algorithmId);
      expect(submissionState).toBeDefined();
      expect(submissionState).toEqual<SubmissionState>({
        isSubmitting: false,
        completed: false,
        submissionNotes: "",
        globalNotes: "",
      });
    });

    it("should return null for non-existent algorithm", () => {
      const submissionState = selectSubmissionState(state, "non-existent");
      expect(submissionState).toBeNull();
    });

    it("should handle empty state", () => {
      const emptyState = {
        algorithms: {},
      } as AlgorithmState;
      const submissionState = selectSubmissionState(emptyState, algorithmId);
      expect(submissionState).toBeNull();
    });
  });

  describe("selectIsSubmitting", () => {
    it("should return false by default", () => {
      const isSubmitting = selectIsSubmitting(state, algorithmId);
      expect(isSubmitting).toBe(false);
    });

    it("should return true when submission is in progress", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              isSubmitting: true,
            },
          },
        },
      };
      const isSubmitting = selectIsSubmitting(state, algorithmId);
      expect(isSubmitting).toBe(true);
    });

    it("should return false for non-existent algorithm", () => {
      const isSubmitting = selectIsSubmitting(state, "non-existent");
      expect(isSubmitting).toBe(false);
    });

    it("should handle state transitions", () => {
      // Start submission
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              isSubmitting: true,
            },
          },
        },
      };
      expect(selectIsSubmitting(state, algorithmId)).toBe(true);

      // End submission
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              isSubmitting: false,
            },
          },
        },
      };
      expect(selectIsSubmitting(state, algorithmId)).toBe(false);
    });
  });

  describe("selectIsCompleted", () => {
    it("should return false by default", () => {
      const isCompleted = selectIsCompleted(state, algorithmId);
      expect(isCompleted).toBe(false);
    });

    it("should return true when algorithm is completed", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              completed: true,
            },
          },
        },
      };
      const isCompleted = selectIsCompleted(state, algorithmId);
      expect(isCompleted).toBe(true);
    });

    it("should return false for non-existent algorithm", () => {
      const isCompleted = selectIsCompleted(state, "non-existent");
      expect(isCompleted).toBe(false);
    });

    it("should maintain completion state after multiple submissions", () => {
      // Complete the algorithm
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              completed: true,
            },
          },
        },
      };
      expect(selectIsCompleted(state, algorithmId)).toBe(true);

      // Start new submission
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              isSubmitting: true,
            },
          },
        },
      };
      expect(selectIsCompleted(state, algorithmId)).toBe(true);
    });
  });

  describe("selectGlobalNotes", () => {
    const testNotes = "Test global notes";

    it("should return empty string by default", () => {
      const notes = selectGlobalNotes(state, algorithmId);
      expect(notes).toBe("");
    });

    it("should return global notes when available", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              globalNotes: testNotes,
            },
          },
        },
      };
      const notes = selectGlobalNotes(state, algorithmId);
      expect(notes).toBe(testNotes);
    });

    it("should return empty string for non-existent algorithm", () => {
      const notes = selectGlobalNotes(state, "non-existent");
      expect(notes).toBe("");
    });

    it("should handle whitespace in notes", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              globalNotes: "   " + testNotes + "   ",
            },
          },
        },
      };
      const notes = selectGlobalNotes(state, algorithmId);
      expect(notes).toBe("   " + testNotes + "   ");
    });
  });

  describe("selectSubmissionNotes", () => {
    const testNotes = "Test submission notes";

    it("should return empty string by default", () => {
      const notes = selectSubmissionNotes(state, algorithmId);
      expect(notes).toBe("");
    });

    it("should return submission notes when available", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              submissionNotes: testNotes,
            },
          },
        },
      };
      const notes = selectSubmissionNotes(state, algorithmId);
      expect(notes).toBe(testNotes);
    });

    it("should return empty string for non-existent algorithm", () => {
      const notes = selectSubmissionNotes(state, "non-existent");
      expect(notes).toBe("");
    });

    it("should handle null or undefined notes", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              submissionNotes: undefined as unknown as string,
            },
          },
        },
      };
      expect(selectSubmissionNotes(state, algorithmId)).toBe("");

      state.algorithms[algorithmId].submission.submissionNotes =
        null as unknown as string;
      expect(selectSubmissionNotes(state, algorithmId)).toBe("");
    });

    it("should preserve notes through state transitions", () => {
      // Set initial notes
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              submissionNotes: testNotes,
            },
          },
        },
      };
      expect(selectSubmissionNotes(state, algorithmId)).toBe(testNotes);

      // Start submission
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            submission: {
              ...state.algorithms[algorithmId].submission,
              isSubmitting: true,
            },
          },
        },
      };
      expect(selectSubmissionNotes(state, algorithmId)).toBe(testNotes);
    });
  });
});
