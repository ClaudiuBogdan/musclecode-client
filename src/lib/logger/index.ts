import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth";

import { emitLog } from "./otel-config";

type ExtraInfo = Record<string, any>;

enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

const logLevel =
  LogLevel[env.VITE_LOG_LEVEL?.toUpperCase() as keyof typeof LogLevel] ??
  LogLevel.INFO;

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
    verbose(message: string, extraInfo?: ExtraInfo) {
      if (LogLevel.VERBOSE < logLevel) return;
      const attributes = getAttributes({
        message,
      });
      emitLog("verbose", { message, extraInfo }, attributes);
    },
    debug(message: string, extraInfo?: ExtraInfo) {
      if (LogLevel.DEBUG < logLevel) return;
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
      if (LogLevel.INFO < logLevel) return;
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
      if (LogLevel.WARN < logLevel) return;
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
