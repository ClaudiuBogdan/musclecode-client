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

    if (algorithm.metadata.tags.length > 10) {
      validationErrors.push({
        tab: "metadata",
        field: "tags",
        message: "Maximum 10 tags allowed",
      });
    }

    if (algorithm.metadata.tags.some((tag) => tag.length > 30)) {
      validationErrors.push({
        tab: "metadata",
        field: "tags",
        message: "Each tag must be less than 30 characters",
      });
    }

    // Description tab validation
    if (!algorithm.description.content.trim()) {
      validationErrors.push({
        tab: "description",
        field: "content",
        message: "Description is required",
      });
    }

    if (algorithm.description.content.length > 10000) {
      validationErrors.push({
        tab: "description",
        field: "content",
        message: "Description must be less than 10,000 characters",
      });
    }

    // Solutions tab validation
    if (algorithm.languages.length === 0) {
      validationErrors.push({
        tab: "solutions",
        field: "languages",
        message: "At least one language is required",
      });
    }

    algorithm.languages.forEach((lang) => {
      if (lang.solutionFile.content.length > 50000) {
        validationErrors.push({
          tab: "solutions",
          field: `${lang.language}-solution`,
          message: `Solution code for ${lang.language} must be less than 50,000 characters`,
        });
      }
      if (lang.testFile.content.length > 50000) {
        validationErrors.push({
          tab: "solutions",
          field: `${lang.language}-test`,
          message: `Test code for ${lang.language} must be less than 50,000 characters`,
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
