
import { withAlgorithm } from "../utils/stateUtils";
import {
  calculateRunningTime,
  createInitialTimerState,
  calculateAdditionalPausedTime,
} from "../utils/timerUtils";

import type { AlgorithmState, StoreActions, TimerActions } from "../types";
import type { StateCreator } from "zustand";

export const createTimerSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  TimerActions
> = (set, get) => ({
  startTimer: (algorithmId) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        const algorithm = state.algorithms[algorithmId];
        if (algorithm.timer.initialStartTime) return state;

        algorithm.timer = createInitialTimerState();
        return state;
      })
    ),

  pauseTimer: (algorithmId) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        const algorithm = state.algorithms[algorithmId];
        const { timer } = algorithm;

        if (!timer.initialStartTime || timer.pausedAt) return state;

        timer.pausedAt = Date.now();
        return state;
      })
    ),

  resumeTimer: (algorithmId) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        const algorithm = state.algorithms[algorithmId];
        const { timer } = algorithm;

        if (!timer.pausedAt) return state;

        const additionalPausedTime = calculateAdditionalPausedTime(
          timer.pausedAt
        );
        timer.totalPausedTime += additionalPausedTime;
        timer.pausedAt = null;

        return state;
      })
    ),

  resetTimer: (algorithmId) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].timer = createInitialTimerState();
        return state;
      })
    ),

  getTotalRunningTime: (algorithmId) => {
    const state = get();
    return withAlgorithm(state, algorithmId, () => {
      const algorithm = state.algorithms[algorithmId];
      return calculateRunningTime(algorithm.timer);
    });
  },
});
