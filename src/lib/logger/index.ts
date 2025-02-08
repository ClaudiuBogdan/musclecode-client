import { ValueType } from "@opentelemetry/api";
import { emitLog } from "./otel-config";
import { useAuthStore } from "@/stores/auth";

/**
 * A simple logger interface that writes to the console and emits logs via OpenTelemetry.
 */
export const createLogger = (args: { context: string }) => {
  const getAttributes = (attrs: { message: string }) => {
    return {
      "user.id": useAuthStore.getState().user?.id,
      context: args?.context,
      ...attrs,
    };
  };

  return {
    debug(message: string, extraInfo?: Record<string, ValueType>) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("debug", body, attributes);
    },
    info(message: string, extraInfo?: Record<string, ValueType>) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("info", body, attributes);
    },
    warn(message: string, extraInfo?: Record<string, ValueType>) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("warn", body, attributes);
    },
    error(message: string, extraInfo?: Record<string, ValueType>) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("error", body, attributes);
    },
  };
};

export const logger = createLogger({ context: "Logger" });
