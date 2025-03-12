import { useMemo } from "react";
import { NewAlgorithm, ValidationError } from "@/types/newAlgorithm";

export function useAlgorithmValidation(algorithm: NewAlgorithm) {
  const errors = useMemo(() => {
    const validationErrors: ValidationError[] = [];

    // Metadata tab validation
    if (!algorithm.metadata.title.trim()) {
      validationErrors.push({
        tab: "metadata",
        field: "title",
        message: "Title is required",
      });
    }

    if (algorithm.metadata.title.length > 100) {
      validationErrors.push({
        tab: "metadata",
        field: "title",
        message: "Title must be less than 100 characters",
      });
    }

    if (algorithm.metadata.summary.length > 1000) {
      validationErrors.push({
        tab: "metadata",
        field: "summary",
        message: "Summary must be less than 1000 characters",
      });
    }

    if (algorithm.metadata.summary.length === 0) {
      validationErrors.push({
        tab: "metadata",
        field: "summary",
        message: "Summary is required",
      });
    }

    // Category validation
    if (algorithm.metadata.categories?.length === 0) {
      validationErrors.push({
        tab: "metadata",
        field: "categories",
        message: "At least one category is required",
      });
    }

    // Difficulty validation
    if (!algorithm.metadata.difficulty?.trim()) {
      validationErrors.push({
        tab: "metadata",
        field: "difficulty",
        message: "Difficulty is required",
      });
    } else if (
      !["easy", "medium", "hard"].includes(algorithm.metadata.difficulty)
    ) {
      validationErrors.push({
        tab: "metadata",
        field: "difficulty",
        message: "Invalid difficulty level",
      });
    }

    if (algorithm.metadata.tags.some((tag) => tag.length > 30)) {
      validationErrors.push({
        tab: "metadata",
        field: "tags",
        message: "Each tag must be less than 30 characters",
      });
    }

    // Lessons tab validation
    if (algorithm.lessons.length === 0) {
      validationErrors.push({
        tab: "description",
        field: "lessons",
        message: "At least one lesson is required",
      });
    }

    // Validate each lesson
    algorithm.lessons.forEach((lesson) => {
      if (!lesson.title.trim()) {
        validationErrors.push({
          tab: "description",
          field: "lessons",
          message: "Lesson title is required",
        });
      }

      if (lesson.title.length > 100) {
        validationErrors.push({
          tab: "description",
          field: "lessons",
          message: `Lesson title must be less than 100 characters`,
        });
      }

      if (!lesson.content.trim()) {
        validationErrors.push({
          tab: "description",
          field: "lessons",
          message: "Lesson content is required",
        });
      }

      if (lesson.content.length > 10000) {
        validationErrors.push({
          tab: "description",
          field: "lessons",
          message: `Lesson content must be less than 10,000 characters`,
        });
      }
    });

    // Solutions tab validation
    if (algorithm.files.length === 0) {
      validationErrors.push({
        tab: "solutions",
        field: "languages",
        message: "At least one language is required",
      });
    }

    algorithm.files.forEach((file) => {
      if (file.type === "solution" && file.content.length > 50000) {
        validationErrors.push({
          tab: "solutions",
          field: `${file.language}-solution`,
          message: `Solution code for ${file.language} must be less than 50,000 characters`,
        });
      }

      if (file.type === "test" && file.content.length > 50000) {
        validationErrors.push({
          tab: "solutions",
          field: `${file.language}-test`,
          message: `Test code for ${file.language} must be less than 50,000 characters`,
        });
      }
    });

    return validationErrors;
  }, [algorithm]);

  const getErrorsForTab = (tab: "metadata" | "description" | "solutions") => {
    return errors.filter((error) => error.tab === tab);
  };

  const getErrorsForField = (field: string) => {
    return errors.filter((error) => error.field === field);
  };

  const hasErrorsInTab = (tab: "metadata" | "description" | "solutions") => {
    return errors.some((error) => error.tab === tab);
  };

  const firstErrorTab = errors.length > 0 ? errors[0].tab : null;

  return {
    errors,
    getErrorsForTab,
    getErrorsForField,
    hasErrorsInTab,
    firstErrorTab,
    isValid: errors.length === 0,
  };
}
