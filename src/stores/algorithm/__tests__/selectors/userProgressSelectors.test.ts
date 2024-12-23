import {
  selectUserProgressState,
  selectIsSubmitting,
  selectIsCompleted,
  selectUserProgressNotes,
} from "../../selectors";
import { mockAlgorithmState } from "../utils/testStore";
import { AlgorithmState, UserProgressState } from "../../types";
import { describe, expect, it, beforeEach } from "vitest";

describe("User Progress Selectors", () => {
  const algorithmId = "test-algorithm";
  let state: AlgorithmState;

  beforeEach(() => {
    state = mockAlgorithmState(algorithmId);
  });

  describe("selectUserProgressState", () => {
    it("should return user progress for existing algorithm", () => {
      const userProgress = selectUserProgressState(state, algorithmId);
      expect(userProgress).toBeDefined();
      expect(userProgress).toEqual<UserProgressState>({
        isSubmitting: false,
        completed: false,
        notes: {
          content: "",
          state: "saved",
        },
        submissionNote: "",
        lastSubmissionDate: null,
        submissions: [],
      });
    });

    it("should return null for non-existent algorithm", () => {
      const userProgress = selectUserProgressState(state, "non-existent");
      expect(userProgress).toBeNull();
    });

    it("should handle empty state", () => {
      const emptyState = {
        algorithms: {},
      } as AlgorithmState;
      const userProgressState = selectUserProgressState(
        emptyState,
        algorithmId
      );
      expect(userProgressState).toBeNull();
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
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
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
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
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
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
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
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
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
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
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
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
              isSubmitting: true,
            },
          },
        },
      };
      expect(selectIsCompleted(state, algorithmId)).toBe(true);
    });
  });

  // TODO: add global notes
  // describe("selectGlobalNotes", () => {
  //   const testNotes = "Test global notes";

  //   it("should return empty string by default", () => {
  //     const notes = selectGlobalNotes(state, algorithmId);
  //     expect(notes).toBe("");
  //   });

  //   it("should return global notes when available", () => {
  //     state = {
  //       ...state,
  //       algorithms: {
  //         ...state.algorithms,
  //         [algorithmId]: {
  //           ...state.algorithms[algorithmId],
  //           userProgress: {
  //             ...state.algorithms[algorithmId].userProgress,
  //             notes: testNotes,
  //           },
  //         },
  //       },
  //     };
  //     const notes = selectGlobalNotes(state, algorithmId);
  //     expect(notes).toBe(testNotes);
  //   });

  //   it("should return empty string for non-existent algorithm", () => {
  //     const notes = selectGlobalNotes(state, "non-existent");
  //     expect(notes).toBe("");
  //   });

  //   it("should handle whitespace in notes", () => {
  //     state = {
  //       ...state,
  //       algorithms: {
  //         ...state.algorithms,
  //         [algorithmId]: {
  //           ...state.algorithms[algorithmId],
  //           userProgress: {
  //             ...state.algorithms[algorithmId].userProgress,
  //             notes: "   " + testNotes + "   ",
  //           },
  //         },
  //       },
  //     };
  //     const notes = selectGlobalNotes(state, algorithmId);
  //     expect(notes).toBe("   " + testNotes + "   ");
  //   });
  // });

  describe("selectSubmissionNotes", () => {
    const testNotes = {
      content: "Test submission notes",
      state: "saved",
    };

    it("should return empty string by default", () => {
      const notes = selectUserProgressNotes(state, algorithmId);
      expect(notes).toBe("");
    });

    it("should return submission notes when available", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
              notes: {
                content: testNotes.content,
                state: testNotes.state as "saved" | "saving" | "error",
              },
            },
          },
        },
      };
      const notes = selectUserProgressNotes(state, algorithmId);
      expect(notes).toBe(testNotes);
    });

    it("should return empty string for non-existent algorithm", () => {
      const notes = selectUserProgressNotes(state, "non-existent");
      expect(notes).toBe("");
    });

    it("should handle null or undefined notes", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
              notes: undefined as unknown as {
                content: string;
                state: "saved" | "saving" | "error";
              },
            },
          },
        },
      };
      expect(selectUserProgressNotes(state, algorithmId)).toBe("");

      state.algorithms[algorithmId].userProgress.notes = null as unknown as {
        content: string;
        state: "saved" | "saving" | "error";
      };
      expect(selectUserProgressNotes(state, algorithmId)).toBe("");
    });

    it("should preserve notes through state transitions", () => {
      // Set initial notes
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
              notes: {
                content: testNotes.content,
                state: testNotes.state as "saved" | "saving" | "error",
              },
            },
          },
        },
      };
      expect(selectUserProgressNotes(state, algorithmId)).toBe(testNotes);

      // Start submission
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            userProgress: {
              ...state.algorithms[algorithmId].userProgress,
              isSubmitting: true,
            },
          },
        },
      };
      expect(selectUserProgressNotes(state, algorithmId)).toBe(testNotes);
    });
  });
});