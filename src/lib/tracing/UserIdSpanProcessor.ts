import { SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Span } from "@opentelemetry/api";
import { useAuthStore } from "@/stores/auth";
import { tracingStore } from "@/stores/tracing";

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
