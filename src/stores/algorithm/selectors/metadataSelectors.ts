import { Submission } from "@/types/algorithm";
import { AlgorithmState } from "../types";

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

export const selectAlgorithmDescription = (
  state: AlgorithmState,
  algorithmId: string
): string => {
  const metadata = selectAlgorithmMetadata(state, algorithmId);
  return metadata?.template?.description ?? "";
};

export const selectAlgorithmSubmissions = (
  state: AlgorithmState,
  algorithmId: string
): Submission[] => {
  return state.algorithms[algorithmId]?.userProgress.submissions ?? [];
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
  return (
    state.algorithms[algorithmId]?.metadata.ratingSchedule ?? {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    }
  );
};
