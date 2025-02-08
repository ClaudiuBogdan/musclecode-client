import { ReadableSpan, SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Span } from "@opentelemetry/api";
import { useAuthStore } from "@/stores/auth";
export class UserIdSpanProcessor implements SpanProcessor {
  onStart(span: Span): void {
    const authStore = useAuthStore.getState();
    const userId = authStore.user?.id;
    if (userId) {
      span.setAttribute("user.id", userId);
    }
    console.log("start traceId", span.spanContext().traceId);
  }

  onEnd(span: ReadableSpan): void {
    const traceId = span.spanContext().traceId;
    console.log("end traceId", traceId);
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
