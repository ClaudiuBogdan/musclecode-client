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
  return metadata?.description ?? "";
};

export const selectNextAlgorithm = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const metadata = selectAlgorithmMetadata(state, algorithmId);
  return metadata?.nextAlgorithm ?? null;
};
