import type { TimerState } from "../types";

export const calculateRunningTime = (timerState: TimerState): number => {
  const { initialStartTime, pausedAt, totalPausedTime } = timerState;
  const now = Date.now();

  if (pausedAt) {
    return pausedAt - initialStartTime - totalPausedTime;
  }

  return now - initialStartTime - totalPausedTime;
};

export const createInitialTimerState = (): TimerState => ({
  initialStartTime: Date.now(),
  pausedAt: null,
  totalPausedTime: 0,
});

export const calculateAdditionalPausedTime = (
  pausedAt: number,
  now: number = Date.now()
): number => now - pausedAt;
