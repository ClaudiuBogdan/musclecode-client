import { AlgorithmState } from "../types";

export const selectUserProgressState = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.userProgress ?? null;
};

export const selectIsSubmitting = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const submission = selectUserProgressState(state, algorithmId);
  return submission?.isSubmitting ?? false;
};

export const selectIsCompleted = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const submission = selectUserProgressState(state, algorithmId);
  return submission?.completed ?? false;
};

export const selectUserProgressNotes = (
  state: AlgorithmState,
  algorithmId: string
): string => {
  const submission = selectUserProgressState(state, algorithmId);
  return submission?.notes ?? "";
};
