import { StateCreator } from "zustand";
import { AlgorithmFile, CodeLanguage } from "@/types/algorithm";
import { v4 as uuidv4 } from "uuid";
import { NewAlgorithm } from "@/types/newAlgorithm";
import { getLanguageExtension } from "@/lib/utils/algorithm";

// Constants
export const MAX_TITLE_LENGTH = 100;
export const MAX_SUMMARY_LENGTH = 1000;
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
  setSummary: (summary: string) => void;
  setCategories: (categories: string[]) => void;
  setTags: (tags: string[]) => void;

  // Description actions
  setDescription: (content: string) => void;

  // Language actions
  addLanguage: (language: CodeLanguage) => void;
  addFiles: (files: AlgorithmFile[]) => void;
  removeLanguage: (languageId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;

  // Validation
  validateState: () => { isValid: boolean; errors: string[] };
}

export const createBaseAlgorithmSlice: StateCreator<
  BaseAlgorithmState & BaseAlgorithmActions
> = (set, get) => ({
  algorithm: {
    metadata: {
      title: "",
      categories: [],
      summary: "",
      difficulty: "easy",
      tags: [],
    },
    description: "",
    files: [],
  },
  isLoading: false as boolean,
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

  setSummary: (summary) =>
    set((state) => {
      state.algorithm.metadata.summary = summary.slice(0, MAX_SUMMARY_LENGTH);
      state.error = null;
      return state;
    }),

  setCategories: (categories) =>
    set((state) => {
      state.algorithm.metadata.categories = categories;
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
      state.algorithm.description = content.slice(0, MAX_DESCRIPTION_LENGTH);
      state.error = null;
      return state;
    }),

  // Language actions
  addLanguage: (language) =>
    set((state) => {
      if (state.algorithm.files.some((l) => l.language === language)) {
        state.error = `Language ${language} already exists`;
        return state;
      }
      const files: AlgorithmFile[] = [
        {
          id: uuidv4(),
          name: "solution",
          type: "solution",
          language,
          content: getLanguageTemplate(language, "solution"),
          readOnly: false,
          required: true,
          extension: getLanguageExtension(language),
        },
        {
          id: uuidv4(),
          language,
          content: getLanguageTemplate(language, "test"),
          name: "test",
          type: "test",
          readOnly: true,
          required: true,
          extension: getLanguageExtension(language),
        },
      ];

      state.algorithm.files.push(...files);
      state.error = null;
      return state;
    }),

  addFiles: (files: AlgorithmFile[]) => {
    set((state) => {
      state.algorithm.files = [...files];
      state.error = null;
      return state;
    });
  },

  removeLanguage: (language) =>
    set((state) => {
      state.algorithm.files = state.algorithm.files.filter(
        (file) => file.language !== language
      );
      state.error = null;
      return state;
    }),

  updateFileContent: (fileId, content) =>
    set((state) => {
      const file = state.algorithm.files.find((l) => l.id === fileId);
      if (file) {
        file.content = content.slice(0, MAX_CODE_LENGTH);
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
    if (!algorithm.description.trim()) {
      errors.push("Description is required");
    }
    if (algorithm.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
      );
    }

    // Validate languages
    if (algorithm.files.length === 0) {
      errors.push("At least one language is required");
    }

    // Validate code length
    for (const file of algorithm.files) {
      if (file.content.length > MAX_CODE_LENGTH) {
        errors.push(
          `Code for ${file.language} must be less than ${MAX_CODE_LENGTH} characters`
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
