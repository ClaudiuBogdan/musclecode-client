import { createStore } from "zustand";

interface TracingState {
  traceId: string | null;
  spanId: string | null;
  userId: string | null;
}

interface TracingActions {
  setContext: (context: {
    traceId: string | null;
    spanId: string | null;
    userId: string | null;
  }) => void;
  getContext: () => {
    traceId: string | null;
    spanId: string | null;
    userId: string | null;
  };
}

export const tracingStore = createStore<TracingState & TracingActions>(
  (set, get) => ({
    traceId: null,
    spanId: null,
    userId: null,
    setContext: (context: {
      traceId: string | null;
      spanId: string | null;
      userId: string | null;
    }) => set(context),
    getContext: () => ({
      traceId: get().traceId,
      spanId: get().spanId,
      userId: get().userId,
    }),
  })
);
