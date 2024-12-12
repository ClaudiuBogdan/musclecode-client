import { AlgorithmState } from "../types";

export const selectSubmissionState = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.submission ?? null;
};

export const selectIsSubmitting = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const submission = selectSubmissionState(state, algorithmId);
  return submission?.isSubmitting ?? false;
};

export const selectIsCompleted = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const submission = selectSubmissionState(state, algorithmId);
  return submission?.completed ?? false;
};

export const selectGlobalNotes = (
  state: AlgorithmState,
  algorithmId: string
): string => {
  const submission = selectSubmissionState(state, algorithmId);
  return submission?.globalNotes ?? "";
};

export const selectSubmissionNotes = (
  state: AlgorithmState,
  algorithmId: string
): string => {
  const submission = selectSubmissionState(state, algorithmId);
  return submission?.submissionNotes ?? "";
};
