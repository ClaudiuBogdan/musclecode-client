import type { AlgorithmState } from "../types";
import type { AlgorithmLesson, Submission } from "@/types/algorithm";


export const selectIsLoading = (state: AlgorithmState): boolean => {
  return state.metadata.isLoading;
};

export const selectActiveAlgorithmId = (
  state: AlgorithmState
): string | null => {
  return state.metadata.activeAlgorithmId;
};

export const selectAlgorithmMetadata = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.metadata ?? null;
};

export const selectAlgorithmLessons = (
  state: AlgorithmState,
  algorithmId: string
): AlgorithmLesson[] => {
  const metadata = selectAlgorithmMetadata(state, algorithmId);
  return metadata?.template?.lessons ?? []; // This may cause infinite loop. The array pointer should be the same
};

export const selectAlgorithmSubmissions = (
  state: AlgorithmState,
  algorithmId: string
): Submission[] => {
  return state.algorithms[algorithmId]?.userProgress.submissions;
};

export const selectNextAlgorithm = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const metadata = selectAlgorithmMetadata(state, algorithmId);
  return metadata?.nextAlgorithm ?? null;
};

export const selectRatingSchedule = (
  state: AlgorithmState,
  algorithmId: string
) => {
  return state.algorithms[algorithmId]?.metadata.ratingSchedule;
};
