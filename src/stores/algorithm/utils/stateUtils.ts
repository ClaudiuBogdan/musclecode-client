import type { AlgorithmState, AlgorithmId } from "../types";

export const getAlgorithmById = (
  state: AlgorithmState,
  algorithmId: AlgorithmId
) => state.algorithms[algorithmId];

export const validateAlgorithmExists = (
  state: AlgorithmState,
  algorithmId: AlgorithmId
): boolean => algorithmId in state.algorithms;

export class StateError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "StateError";
  }
}

export const withAlgorithm = <T>(
  state: AlgorithmState,
  algorithmId: AlgorithmId,
  fn: (state: AlgorithmState) => T
): T => {
  if (!validateAlgorithmExists(state, algorithmId)) {
    throw new StateError(
      `Algorithm with id ${algorithmId} not found`,
      "ALGORITHM_NOT_FOUND"
    );
  }
  return fn(state);
};
