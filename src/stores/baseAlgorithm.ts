import { StateCreator } from "zustand";
import { CodeLanguage } from "@/types/algorithm";
import { v4 as uuidv4 } from "uuid";
import { NewAlgorithm, NewAlgorithmLanguageFiles } from "@/types/newAlgorithm";

// Constants
export const MAX_TITLE_LENGTH = 100;
export const MAX_TAG_LENGTH = 30;
export const MAX_TAGS = 10;
export const MAX_DESCRIPTION_LENGTH = 10000;
export const MAX_CODE_LENGTH = 50000;

export interface BaseAlgorithmState {
  algorithm: NewAlgorithm;
  isLoading: boolean;
  error: string | null;
}

export interface BaseAlgorithmActions {
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

  // Validation
  validateState: () => { isValid: boolean; errors: string[] };
}

export const createBaseAlgorithmSlice: StateCreator<
  BaseAlgorithmState & BaseAlgorithmActions,
  [],
  [],
  BaseAlgorithmState & BaseAlgorithmActions
> = (set, get) => ({
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
  isLoading: false,
  error: null,

  // Metadata actions
  setTitle: (title) =>
    set((state) => {
      state.algorithm.metadata.title = title.slice(0, MAX_TITLE_LENGTH);
      state.error = null;
      return state;
    }),

  setDifficulty: (difficulty) =>
    set((state) => {
      state.algorithm.metadata.difficulty = difficulty;
      state.error = null;
      return state;
    }),

  setTags: (tags) =>
    set((state) => {
      state.algorithm.metadata.tags = tags
        .slice(0, MAX_TAGS)
        .map((tag) => tag.slice(0, MAX_TAG_LENGTH));
      state.error = null;
      return state;
    }),

  // Description actions
  setDescription: (content) =>
    set((state) => {
      state.algorithm.description.content = content.slice(
        0,
        MAX_DESCRIPTION_LENGTH
      );
      state.error = null;
      return state;
    }),

  // Language actions
  addLanguage: (language) =>
    set((state) => {
      if (state.algorithm.languages.some((l) => l.language === language)) {
        state.error = `Language ${language} already exists`;
        return state;
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
      return state;
    }),

  removeLanguage: (languageId) =>
    set((state) => {
      state.algorithm.languages = state.algorithm.languages.filter(
        (l) => l.id !== languageId
      );
      state.error = null;
      return state;
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
      return state;
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
      return state;
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
    if (algorithm.metadata.tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
      errors.push(`Tag length must be less than ${MAX_TAG_LENGTH} characters`);
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
});

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
