import type { AlgorithmState } from "../types";
import type { CodeExecutionResponse } from "@/types/testRunner";


export const selectExecutionState = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.execution ?? null;
};

export const selectIsExecuting = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const execution = selectExecutionState(state, algorithmId);
  return execution?.isExecuting ?? false;
};

export const selectExecutionResult = (
  state: AlgorithmState,
  algorithmId: string
): CodeExecutionResponse | null => {
  const execution = selectExecutionState(state, algorithmId);
  return execution?.executionResult ?? null;
};

export const selectExecutionError = (
  state: AlgorithmState,
  algorithmId: string
): Error | null => {
  const execution = selectExecutionState(state, algorithmId);
  return execution?.error ?? null;
};

export const selectTestResults = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const result = selectExecutionResult(state, algorithmId);
  return result?.result ?? null;
};
