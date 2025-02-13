import { emitLog } from "./otel-config";
import { useAuthStore } from "@/stores/auth";

interface ExtraInfo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * A simple logger interface that writes to the console and emits logs via OpenTelemetry.
 */
export const createLogger = (args: { context: string } | string) => {
  const extraArgs = typeof args === "string" ? { context: args } : args;

  const getAttributes = (attrs: { message: string }) => {
    return {
      "user.id": useAuthStore.getState().user?.id,
      ...extraArgs,
      ...attrs,
    };
  };

  return {
    debug(message: string, extraInfo?: ExtraInfo) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("debug", body, attributes);
    },
    info(message: string, extraInfo?: ExtraInfo) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("info", body, attributes);
    },
    warn(message: string, extraInfo?: ExtraInfo) {
      const attributes = getAttributes({
        message,
      });
      const body = {
        message,
        extraInfo,
      };
      emitLog("warn", body, attributes);
    },
    error(message: string, extraInfo?: ExtraInfo) {
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
