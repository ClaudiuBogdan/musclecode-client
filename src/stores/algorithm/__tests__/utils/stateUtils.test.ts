import {
  getAlgorithmById,
  validateAlgorithmExists,
  withAlgorithm,
  StateError,
} from "../../utils/stateUtils";
import {
  createEmptyAlgorithmData,
  mockAlgorithmState,
} from "../utils/testStore";

import type { AlgorithmState } from "../../types";

describe("State Utils", () => {
  const testAlgorithmId = "test-algorithm";
  let testState: AlgorithmState;

  beforeEach(() => {
    testState = mockAlgorithmState(testAlgorithmId);
  });

  describe("getAlgorithmById", () => {
    it("should return algorithm data when it exists", () => {
      const algorithm = getAlgorithmById(testState, testAlgorithmId);
      const expectedData = {
        ...createEmptyAlgorithmData(),
        metadata: {
          ...createEmptyAlgorithmData().metadata,
          algorithmId: testAlgorithmId,
        },
        code: {
          ...createEmptyAlgorithmData().code,
          storedCode: {
            cpp: {
              "solution.cpp": {
                content: "",
                id: expect.any(String),
                language: "cpp",
                name: "solution.cpp",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            go: {
              "solution.go": {
                content: "",
                id: expect.any(String),
                language: "go",
                name: "solution.go",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            java: {
              "Solution.java": {
                content: "",
                id: expect.any(String),
                language: "java",
                name: "Solution.java",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            javascript: {
              "solution.js": {
                content: "",
                id: expect.any(String),
                language: "javascript",
                name: "solution.js",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            python: {
              "solution.py": {
                content: "",
                id: expect.any(String),
                language: "python",
                name: "solution.py",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            typescript: {
              "solution.ts": {
                content: "",
                id: expect.any(String),
                language: "typescript",
                name: "solution.ts",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
          },
          initialStoredCode: {
            cpp: {
              "solution.cpp": {
                content: "",
                id: expect.any(String),
                language: "cpp",
                name: "solution.cpp",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            go: {
              "solution.go": {
                content: "",
                id: expect.any(String),
                language: "go",
                name: "solution.go",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            java: {
              "Solution.java": {
                content: "",
                id: expect.any(String),
                language: "java",
                name: "Solution.java",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            javascript: {
              "solution.js": {
                content: "",
                id: expect.any(String),
                language: "javascript",
                name: "solution.js",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            python: {
              "solution.py": {
                content: "",
                id: expect.any(String),
                language: "python",
                name: "solution.py",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
            typescript: {
              "solution.ts": {
                content: "",
                id: expect.any(String),
                language: "typescript",
                name: "solution.ts",
                readOnly: false,
                required: true,
                type: "solution",
              },
            },
          },
        },
        timer: {
          ...createEmptyAlgorithmData().timer,
          initialStartTime: expect.any(Number),
        },
      };
      expect(algorithm).toBeDefined();
      expect(algorithm).toEqual(expectedData);
    });

    it("should return undefined for non-existent algorithm", () => {
      const algorithm = getAlgorithmById(testState, "non-existent");
      expect(algorithm).toBeUndefined();
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
      const algorithm = getAlgorithmById(emptyState, testAlgorithmId);
      expect(algorithm).toBeUndefined();
    });
  });

  describe("validateAlgorithmExists", () => {
    it("should return true when algorithm exists", () => {
      const exists = validateAlgorithmExists(testState, testAlgorithmId);
      expect(exists).toBe(true);
    });

    it("should return false when algorithm does not exist", () => {
      const exists = validateAlgorithmExists(testState, "non-existent");
      expect(exists).toBe(false);
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
      const exists = validateAlgorithmExists(emptyState, testAlgorithmId);
      expect(exists).toBe(false);
    });
  });

  describe("withAlgorithm", () => {
    it("should execute callback when algorithm exists", () => {
      const result = withAlgorithm(testState, testAlgorithmId, (state) => {
        const algorithm = state.algorithms[testAlgorithmId];
        return algorithm.metadata.algorithmId;
      });
      expect(result).toBe(testAlgorithmId);
    });

    it("should throw StateError when algorithm does not exist", () => {
      expect(() =>
        withAlgorithm(testState, "non-existent", (state) => state)
      ).toThrow(StateError);
    });

    it("should pass correct error details when algorithm not found", () => {
      try {
        withAlgorithm(testState, "non-existent", (state) => state);
        fail("Expected StateError to be thrown");
      } catch (error) {
        expect(error instanceof StateError).toBe(true);
        if (error instanceof StateError) {
          expect(error.code).toBe("ALGORITHM_NOT_FOUND");
          expect(error.message).toContain("non-existent");
        }
      }
    });

    it("should maintain state immutability", () => {
      const originalState = structuredClone(testState);
      withAlgorithm(testState, testAlgorithmId, (state) => state);
      expect(testState).toEqual(originalState);
    });

    it("should handle state modifications correctly", () => {
      const newDescription = "New Description";
      const modifiedState = withAlgorithm(
        testState,
        testAlgorithmId,
        (state) => {
          return {
            ...state,
            algorithms: {
              ...state.algorithms,
              [testAlgorithmId]: {
                ...state.algorithms[testAlgorithmId],
                metadata: {
                  ...state.algorithms[testAlgorithmId].metadata,
                  description: newDescription,
                },
              },
            },
          };
        }
      );

      expect(
        modifiedState.algorithms[testAlgorithmId].metadata.description
      ).toBe(newDescription);
      expect(
        testState.algorithms[testAlgorithmId].metadata.template?.lessons
      ).toBe("");
    });
  });

  describe("StateError", () => {
    it("should create error with correct properties", () => {
      const message = "Test error";
      const code = "TEST_ERROR";
      const error = new StateError(message, code);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.name).toBe("StateError");
    });

    it("should be catchable as a regular error", () => {
      const error = new StateError("Test error", "TEST_ERROR");
      expect(() => {
        throw error;
      }).toThrow(Error);
    });
  });
});
