import { calculateRunningTime } from "../utils/timerUtils";

import type { AlgorithmState } from "../types";

export const selectTimerState = (
  state: AlgorithmState,
  algorithmId: string
) => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.timer ?? null;
};

export const selectRunningTime = (
  state: AlgorithmState,
  algorithmId: string
): number => {
  const timer = selectTimerState(state, algorithmId);
  if (!timer) return 0;

  return calculateRunningTime(timer);
};

export const selectIsTimerRunning = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const timer = selectTimerState(state, algorithmId);
  if (!timer) return false;

  return timer.initialStartTime !== null && timer.pausedAt === null;
};

export const selectIsPaused = (
  state: AlgorithmState,
  algorithmId: string
): boolean => {
  const timer = selectTimerState(state, algorithmId);
  if (!timer) return false;

  return timer.pausedAt !== null;
};
