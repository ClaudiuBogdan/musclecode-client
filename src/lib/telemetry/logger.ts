import { env } from "@/config/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

function isLevelEnabled(
  currentLevel: LogLevel,
  messageLevel: LogLevel
): boolean {
  return LOG_LEVELS.indexOf(messageLevel) >= LOG_LEVELS.indexOf(currentLevel);
}

export type LogMetadata = {
  [key: string]: string | number | boolean | null | LogMetadata;
};

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: LogMetadata;
  context?: {
    service: string;
    environment: string;
    version: string;
  };
}

class Logger {
  private currentLevel: LogLevel;
  private endpoint: string;

  constructor() {
    this.currentLevel = env.VITE_LOG_LEVEL;
    this.endpoint = env.VITE_LOG_ENDPOINT;
  }

  private async sendLog(payload: LogPayload): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ...payload,
          // context: {
          //   service: "musclecode-client",
          //   environment: env.MODE,
          //   version: "1.0.0",
          // },
          ts: new Date().toISOString(),
          severity: "INFO",
          body: { message: "Hello, world!" },
          attributes: {
            attributes: { context: "NestFactory" },
            extraInfo: "NestApplication",
          },
        }),
      });
    } catch (error) {
      // Only log to console in development to avoid infinite loops
      if (env.MODE === "development") {
        console.error("Failed to send log:", error);
      }
    }
  }

  private log(level: LogLevel, message: string, meta?: LogMetadata) {
    if (!isLevelEnabled(this.currentLevel, level)) return;

    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };

    // Log to console in development mode
    if (env.MODE === "development") {
      const consoleMethod = level === "debug" ? "log" : level;
      console[consoleMethod](message, meta);
    }

    void this.sendLog(payload);
  }

  debug(message: string, meta?: LogMetadata) {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: LogMetadata) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: LogMetadata) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: LogMetadata) {
    this.log("error", message, meta);
  }
}

// Export a singleton instance
export const logger = new Logger();
