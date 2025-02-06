import { context, trace, Span, SpanAttributes } from "@opentelemetry/api";
import { env } from "@/config/env";

interface LogContext {
  traceId?: string;
  spanId?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

type LogLevel = "debug" | "info" | "warn" | "error";

const getSpanContext = (): LogContext => {
  const span = trace.getSpan(context.active());
  if (!span) return {};

  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
};

const formatLogMessage = (
  level: LogLevel,
  message: string,
  context: LogContext
): string => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    environment: env.MODE,
  });
};

const logToSpan = (
  span: Span,
  level: LogLevel,
  message: string,
  context: LogContext
) => {
  const attributes: SpanAttributes = {
    "log.level": level,
    "log.message": message,
    ...Object.entries(context).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && !(value instanceof Error)) {
          acc[`log.${key}`] = JSON.stringify(value);
        }
        return acc;
      },
      {} as Record<string, string>
    ),
  };

  span.addEvent("log", attributes);
};

export const logger = {
  debug: (message: string, data?: Record<string, unknown>): void => {
    if (env.MODE === "development") {
      const spanContext = getSpanContext();
      const logContext = { ...spanContext, data };
      console.debug(formatLogMessage("debug", message, logContext));

      const currentSpan = trace.getSpan(context.active());
      if (currentSpan) logToSpan(currentSpan, "debug", message, logContext);
    }
  },

  info: (message: string, data?: Record<string, unknown>): void => {
    const spanContext = getSpanContext();
    const logContext = { ...spanContext, data };
    console.info(formatLogMessage("info", message, logContext));

    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) logToSpan(currentSpan, "info", message, logContext);
  },

  warn: (message: string, data?: Record<string, unknown>): void => {
    const spanContext = getSpanContext();
    const logContext = { ...spanContext, data };
    console.warn(formatLogMessage("warn", message, logContext));

    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) logToSpan(currentSpan, "warn", message, logContext);
  },

  error: (
    message: string,
    error?: Error,
    data?: Record<string, unknown>
  ): void => {
    const spanContext = getSpanContext();
    const logContext = { ...spanContext, error, data };
    console.error(formatLogMessage("error", message, logContext));

    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) {
      logToSpan(currentSpan, "error", message, logContext);
      if (error) currentSpan.recordException(error);
    }
  },
};
