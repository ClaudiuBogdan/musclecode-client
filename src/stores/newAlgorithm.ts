import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { createAlgorithm } from "@/lib/mocks/api/algorithms/createAlgorithm";
import {
  NewAlgorithm,
  NewAlgorithmLanguageFiles,
  CreateAlgorithmPayload,
} from "@/types/newAlgorithm";
import { CodeLanguage } from "./algorithm";
import { v4 as uuidv4 } from "uuid";

interface NewAlgorithmState {
  isLoading: boolean;
  error: string | null;
  algorithm: NewAlgorithm;
}

interface NewAlgorithmActions {
  // Metadata actions
  setTitle: (title: string) => void;
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
  setTags: (tags: string[]) => void;

  // Description actions
  setDescription: (content: string) => void;

  // Language actions
  addLanguage: (language: CodeLanguage) => void;
  removeLanguage: (languageId: string) => void;
  updateSolutionFile: (languageId: string, content: string) => void;
  updateTestFile: (languageId: string, content: string) => void;

  // Save action
  saveAlgorithm: () => Promise<void>;

  // Reset action
  resetState: () => void;

  // Validation
  validateState: () => { isValid: boolean; errors: string[] };
}

const initialState: NewAlgorithmState = {
  isLoading: false,
  error: null,
  algorithm: {
    metadata: {
      title: "",
      difficulty: "easy",
      tags: [],
    },
    description: {
      content: "",
    },
    languages: [],
  },
};

const MAX_TITLE_LENGTH = 100;
const MAX_TAG_LENGTH = 30;
const MAX_TAGS = 10;
const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_CODE_LENGTH = 50000;

export const useNewAlgorithmStore = create<
  NewAlgorithmState & NewAlgorithmActions
>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Metadata actions
      setTitle: (title) =>
        set((state) => {
          state.algorithm.metadata.title = title.slice(0, MAX_TITLE_LENGTH);
          state.error = null;
        }),

      setDifficulty: (difficulty) =>
        set((state) => {
          state.algorithm.metadata.difficulty = difficulty;
          state.error = null;
        }),

      setTags: (tags) =>
        set((state) => {
          state.algorithm.metadata.tags = tags
            .slice(0, MAX_TAGS)
            .map((tag) => tag.slice(0, MAX_TAG_LENGTH));
          state.error = null;
        }),

      // Description actions
      setDescription: (content) =>
        set((state) => {
          state.algorithm.description.content = content.slice(
            0,
            MAX_DESCRIPTION_LENGTH
          );
          state.error = null;
        }),

      // Language actions
      addLanguage: (language) =>
        set((state) => {
          // Check if language already exists
          if (state.algorithm.languages.some((l) => l.language === language)) {
            state.error = `Language ${language} already exists`;
            return;
          }

          const newLanguage: NewAlgorithmLanguageFiles = {
            id: uuidv4(),
            language,
            solutionFile: {
              content: getLanguageTemplate(language, "solution"),
            },
            testFile: {
              content: getLanguageTemplate(language, "test"),
            },
          };

          state.algorithm.languages.push(newLanguage);
          state.error = null;
        }),

      removeLanguage: (languageId) =>
        set((state) => {
          state.algorithm.languages = state.algorithm.languages.filter(
            (l) => l.id !== languageId
          );
          state.error = null;
        }),

      updateSolutionFile: (languageId, content) =>
        set((state) => {
          const language = state.algorithm.languages.find(
            (l) => l.id === languageId
          );
          if (language) {
            language.solutionFile.content = content.slice(0, MAX_CODE_LENGTH);
            state.error = null;
          }
        }),

      updateTestFile: (languageId, content) =>
        set((state) => {
          const language = state.algorithm.languages.find(
            (l) => l.id === languageId
          );
          if (language) {
            language.testFile.content = content.slice(0, MAX_CODE_LENGTH);
            state.error = null;
          }
        }),

      validateState: () => {
        const { algorithm } = get();
        const errors: string[] = [];

        // Validate title
        if (!algorithm.metadata.title.trim()) {
          errors.push("Title is required");
        }
        if (algorithm.metadata.title.length > MAX_TITLE_LENGTH) {
          errors.push(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
        }

        // Validate tags
        if (algorithm.metadata.tags.length > MAX_TAGS) {
          errors.push(`Maximum ${MAX_TAGS} tags allowed`);
        }
        if (
          algorithm.metadata.tags.some((tag) => tag.length > MAX_TAG_LENGTH)
        ) {
          errors.push(
            `Tag length must be less than ${MAX_TAG_LENGTH} characters`
          );
        }

        // Validate description
        if (!algorithm.description.content.trim()) {
          errors.push("Description is required");
        }
        if (algorithm.description.content.length > MAX_DESCRIPTION_LENGTH) {
          errors.push(
            `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
          );
        }

        // Validate languages
        if (algorithm.languages.length === 0) {
          errors.push("At least one language is required");
        }

        // Validate code length
        for (const lang of algorithm.languages) {
          if (lang.solutionFile.content.length > MAX_CODE_LENGTH) {
            errors.push(
              `Solution code for ${lang.language} must be less than ${MAX_CODE_LENGTH} characters`
            );
          }
          if (lang.testFile.content.length > MAX_CODE_LENGTH) {
            errors.push(
              `Test code for ${lang.language} must be less than ${MAX_CODE_LENGTH} characters`
            );
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },

      // Save action
      saveAlgorithm: async () => {
        const validation = get().validateState();
        if (!validation.isValid) {
          set((state) => {
            state.error = validation.errors[0];
          });
          throw new Error(validation.errors[0]);
        }

        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          const { algorithm } = get();
          const payload: CreateAlgorithmPayload = {
            title: algorithm.metadata.title.trim(),
            difficulty: algorithm.metadata.difficulty,
            tags: algorithm.metadata.tags,
            description: algorithm.description.content.trim(),
            languages: algorithm.languages.reduce(
              (acc, lang) => {
                acc[lang.language] = {
                  solution: lang.solutionFile.content,
                  test: lang.testFile.content,
                };
                return acc;
              },
              {} as CreateAlgorithmPayload["languages"]
            ),
          };

          await createAlgorithm(payload);
          get().resetState();
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to save algorithm";
          set((state) => {
            state.error = errorMessage;
          });
          throw error;
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      // Reset action
      resetState: () => {
        set(initialState);
      },
    })),
    {
      name: "new-algorithm-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        algorithm: state.algorithm,
      }),
    }
  )
);

function getLanguageTemplate(
  language: CodeLanguage,
  type: "solution" | "test"
): string {
  switch (language) {
    case "typescript":
      return type === "solution"
        ? `function solution() {
  // Your solution here
}`
        : `test('solution', () => {
  // Your test here
});`;

    case "python":
      return type === "solution"
        ? `def solution():
    # Your solution here
    pass`
        : `def test_solution():
    # Your test here
    pass`;

    case "javascript":
      return type === "solution"
        ? `function solution() {
  // Your solution here
}`
        : `test('solution', () => {
  // Your test here
});`;

    case "java":
      return type === "solution"
        ? `public class Solution {
    public static void solution() {
        // Your solution here
    }
}`
        : `public class Test {
    @Test
    public void testSolution() {
        // Your test here
    }
}`;

    case "cpp":
      return type === "solution"
        ? `void solution() {
    // Your solution here
}`
        : `TEST_CASE("solution") {
    // Your test here
}`;

    default:
      return "";
  }
}
