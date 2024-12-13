import {
  selectTimerState,
  selectIsTimerRunning,
  selectRunningTime,
  selectIsPaused,
} from "../../selectors/timerSelectors";
import { mockAlgorithmState } from "../utils/testStore";
import { AlgorithmState, TimerState } from "../../types";

describe("Timer Selectors", () => {
  const algorithmId = "test-algorithm";
  let state: AlgorithmState;
  const mockStartTime = new Date("2024-01-01T10:00:00Z").getTime();
  const mockPausedTime = new Date("2024-01-01T10:30:00Z").getTime();

  beforeEach(() => {
    state = mockAlgorithmState(algorithmId);
  });

  describe("selectTimerState", () => {
    it("should return timer state for existing algorithm", () => {
      const timerState = selectTimerState(state, algorithmId);
      expect(timerState).toBeDefined();
      expect(timerState).toEqual<TimerState>({
        initialStartTime: expect.any(Number),
        pausedAt: null,
        totalPausedTime: 0,
      });
    });

    it("should return null for non-existent algorithm", () => {
      const timerState = selectTimerState(state, "non-existent");
      expect(timerState).toBeNull();
    });

    it("should handle empty state", () => {
      const emptyState: AlgorithmState = {
        algorithms: {},
        metadata: {
          isLoading: false,
          error: null,
          activeAlgorithmId: null,
        },
      };
      const timerState = selectTimerState(emptyState, algorithmId);
      expect(timerState).toBeNull();
    });
  });

  describe("selectIsTimerRunning", () => {
    it("should return true by default", () => {
      const isRunning = selectIsTimerRunning(state, algorithmId);
      expect(isRunning).toBe(true);
    });

    it("should return true when timer is running", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            timer: {
              initialStartTime: mockStartTime,
              pausedAt: null,
              totalPausedTime: 0,
            },
          },
        },
      };
      const isRunning = selectIsTimerRunning(state, algorithmId);
      expect(isRunning).toBe(true);
    });

    it("should return false for non-existent algorithm", () => {
      const isRunning = selectIsTimerRunning(state, "non-existent");
      expect(isRunning).toBe(false);
    });

    it("should handle state transitions", () => {
      // Start timer
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            timer: {
              initialStartTime: mockStartTime,
              pausedAt: null,
              totalPausedTime: 0,
            },
          },
        },
      };
      expect(selectIsTimerRunning(state, algorithmId)).toBe(true);

      // Pause timer
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            timer: {
              initialStartTime: mockStartTime,
              pausedAt: mockPausedTime,
              totalPausedTime: 0,
            },
          },
        },
      };
      expect(selectIsTimerRunning(state, algorithmId)).toBe(false);
    });
  });

  describe("selectIsPaused", () => {
    it("should return false by default", () => {
      const isPaused = selectIsPaused(state, algorithmId);
      expect(isPaused).toBe(false);
    });

    it("should return true when timer is paused", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            timer: {
              initialStartTime: mockStartTime,
              pausedAt: mockPausedTime,
              totalPausedTime: 0,
            },
          },
        },
      };
      const isPaused = selectIsPaused(state, algorithmId);
      expect(isPaused).toBe(true);
    });

    it("should return false for non-existent algorithm", () => {
      const isPaused = selectIsPaused(state, "non-existent");
      expect(isPaused).toBe(false);
    });
  });

  describe("selectRunningTime", () => {
    it("should return 0 by default", () => {
      const runningTime = selectRunningTime(state, algorithmId);
      expect(runningTime).toBe(0);
    });

    it("should calculate running time for active timer", () => {
      const now = Date.now();
      const startTime = now - 5000; // 5 seconds ago

      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            timer: {
              initialStartTime: startTime,
              pausedAt: null,
              totalPausedTime: 0,
            },
          },
        },
      };

      const runningTime = selectRunningTime(state, algorithmId);
      expect(runningTime).toBeGreaterThanOrEqual(5000);
      expect(runningTime).toBeLessThan(5100); // Allow small delay in test execution
    });

    it("should calculate running time for paused timer", () => {
      state = {
        ...state,
        algorithms: {
          ...state.algorithms,
          [algorithmId]: {
            ...state.algorithms[algorithmId],
            timer: {
              initialStartTime: mockStartTime,
              pausedAt: mockPausedTime,
              totalPausedTime: 0,
            },
          },
        },
      };

      const runningTime = selectRunningTime(state, algorithmId);
      expect(runningTime).toBe(mockPausedTime - mockStartTime);
    });

    it("should return 0 for non-existent algorithm", () => {
      const runningTime = selectRunningTime(state, "non-existent");
      expect(runningTime).toBe(0);
    });
  });
});
