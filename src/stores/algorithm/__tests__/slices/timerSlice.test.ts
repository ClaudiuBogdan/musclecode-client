import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AlgorithmState, StoreActions } from "../../types";
import { mockAlgorithmState } from "../utils/testStore";
import { createTimerSlice } from "../../slices/timerSlice";
import { createAlgorithmSlice } from "../..";
import { createCodeSlice } from "../../slices/codeSlice";
import { createExecutionSlice } from "../../slices/executionSlice";
import { createSubmissionSlice } from "../../slices/submissionSlice";

type TestStore = AlgorithmState & StoreActions;

const DEFAULT_ALGORITHM_ID = "test-algorithm";

const createTestStore = (
  initialState = mockAlgorithmState(DEFAULT_ALGORITHM_ID, {
    timer: {
      initialStartTime: null,
      pausedAt: null,
      totalPausedTime: 0,
    },
  })
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api = {} as any;
  return create<TestStore>()(
    immer((set, get) => ({
      ...initialState,
      ...createAlgorithmSlice(set, get, api),
      ...createCodeSlice(set, get, api),
      ...createTimerSlice(set, get, api),
      ...createExecutionSlice(set, get, api),
      ...createSubmissionSlice(set, get, api),
    }))
  );
};

describe("Timer Slice", () => {
  const algorithmId = "test-algorithm";
  let store: ReturnType<typeof createTestStore>;
  const mockDate = new Date("2024-01-01T10:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    store = createTestStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("startTimer", () => {
    it("should initialize timer when starting first time", () => {
      store.getState().startTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).toBe(mockDate.getTime());
      expect(timer.pausedAt).toBeNull();
      expect(timer.totalPausedTime).toBe(0);
    });

    it("should not reinitialize timer if already started", () => {
      store.getState().startTimer(algorithmId);
      const initialStartTime =
        store.getState().algorithms[algorithmId].timer.initialStartTime;

      vi.advanceTimersByTime(1000);
      store.getState().startTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).toBe(initialStartTime);
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().startTimer("non-existent");
      }).toThrow();
    });
  });

  describe("pauseTimer", () => {
    it("should pause running timer", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);

      store.getState().pauseTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.pausedAt).toBe(mockDate.getTime() + 5000);
    });

    it("should not affect already paused timer", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);
      store.getState().pauseTimer(algorithmId);
      const pausedAt = store.getState().algorithms[algorithmId].timer.pausedAt;

      vi.advanceTimersByTime(1000);
      store.getState().pauseTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.pausedAt).toBe(pausedAt);
    });

    it("should not affect timer that hasn't started", () => {
      store.getState().pauseTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).toBeNull();
      expect(timer.pausedAt).toBeNull();
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().pauseTimer("non-existent");
      }).toThrow();
    });
  });

  describe("resumeTimer", () => {
    it("should resume paused timer and calculate paused time", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);
      store.getState().pauseTimer(algorithmId);
      vi.advanceTimersByTime(2000);

      store.getState().resumeTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.pausedAt).toBeNull();
      expect(timer.totalPausedTime).toBe(2000);
    });

    it("should not affect running timer", () => {
      store.getState().startTimer(algorithmId);
      const initialStartTime =
        store.getState().algorithms[algorithmId].timer.initialStartTime;

      vi.advanceTimersByTime(1000);
      store.getState().resumeTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).toBe(initialStartTime);
      expect(timer.pausedAt).toBeNull();
    });

    it("should not affect timer that hasn't started", () => {
      store.getState().resumeTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).toBeNull();
      expect(timer.pausedAt).toBeNull();
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().resumeTimer("non-existent");
      }).toThrow();
    });
  });

  describe("resetTimer", () => {
    it("should reset timer to initial state", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);
      store.getState().pauseTimer(algorithmId);

      store.getState().resetTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).toEqual(expect.any(Number));
      expect(timer.pausedAt).toBeNull();
      expect(timer.totalPausedTime).toBe(0);
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().resetTimer("non-existent");
      }).toThrow();
    });
  });

  describe("getTotalRunningTime", () => {
    it("should calculate running time for active timer", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);

      const time = store.getState().getTotalRunningTime(algorithmId);
      expect(time).toBe(5000);
    });

    it("should calculate time for paused timer", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);
      store.getState().pauseTimer(algorithmId);

      const time = store.getState().getTotalRunningTime(algorithmId);
      expect(time).toBe(5000);
    });

    it("should calculate cumulative time after pause and resume", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(5000);
      store.getState().pauseTimer(algorithmId);
      vi.advanceTimersByTime(2000);
      store.getState().resumeTimer(algorithmId);
      vi.advanceTimersByTime(3000);

      const time = store.getState().getTotalRunningTime(algorithmId);
      expect(time).toBe(8000); // 5000 + 3000 (excluding 2000 paused time)
    });

    it("should throw error for non-existent algorithm", () => {
      expect(() => {
        store.getState().getTotalRunningTime("non-existent");
      }).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle multiple pause/resume cycles", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(2000);
      store.getState().pauseTimer(algorithmId);
      vi.advanceTimersByTime(1000);
      store.getState().resumeTimer(algorithmId);
      vi.advanceTimersByTime(3000);
      store.getState().pauseTimer(algorithmId);
      vi.advanceTimersByTime(1000);
      store.getState().resumeTimer(algorithmId);
      vi.advanceTimersByTime(2000);

      const time = store.getState().getTotalRunningTime(algorithmId);
      expect(time).toBe(7000); // 2000 + 3000 + 2000 (excluding paused times)
    });

    it("should maintain timer state consistency", () => {
      store.getState().startTimer(algorithmId);
      vi.advanceTimersByTime(2000);
      store.getState().pauseTimer(algorithmId);

      const timer = store.getState().algorithms[algorithmId].timer;
      expect(timer.initialStartTime).not.toBeNull();
      expect(timer.pausedAt).not.toBeNull();
      expect(timer.totalPausedTime).toBe(0);
      expect(store.getState().getTotalRunningTime(algorithmId)).toBe(2000);
    });

    it("should handle concurrent timer operations", () => {
      store.getState().startTimer(algorithmId);
      store.getState().startTimer(algorithmId); // Should not affect the timer
      vi.advanceTimersByTime(1000);

      const time1 = store.getState().getTotalRunningTime(algorithmId);
      expect(time1).toBe(1000);

      store.getState().pauseTimer(algorithmId);
      store.getState().pauseTimer(algorithmId); // Should not affect the timer
      vi.advanceTimersByTime(1000);

      const time2 = store.getState().getTotalRunningTime(algorithmId);
      expect(time2).toBe(1000); // Time should not increase while paused
    });
  });
});
