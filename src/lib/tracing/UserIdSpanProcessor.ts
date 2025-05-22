import { useAuthStore } from "@/stores/auth";
import { tracingStore } from "@/stores/tracing";

import type { Span } from "@opentelemetry/api";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";


export class UserIdSpanProcessor implements SpanProcessor {
  onStart(span: Span): void {
    const authStore = useAuthStore.getState();
    const userId = authStore.user?.id ?? null;
    if (userId) {
      span.setAttribute("user.id", userId);
    }
    tracingStore.getState().setContext({
      traceId: span.spanContext().traceId,
      spanId: span.spanContext().spanId,
      userId,
    });
  }

  onEnd(): void {}

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
