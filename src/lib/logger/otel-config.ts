/**
 * This module initializes a React-friendly logger with OpenTelemetry integration.
 *
 * Architectural choices:
 * - We use the OpenTelemetry OTLP HTTP Log Exporter to send log data from the browser.
 * - We create a LoggerProvider (from @opentelemetry/sdk-logs) with a resource that describes
 *   the service using environment values (kept in our shared configuration file).
 * - The logger is a simple wrapper that outputs logs both to the browser console and
 *   the remote OTLP endpoint.
 * - This approach enables end-to-end traceability when combined with our OpenTelemetry tracer.
 */

import {
  LoggerProvider,
  LogRecord,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import { env } from "@/config/env"; // shared configuration for the React app

// Set service metadata based on environment configuration
const serviceName = env.VITE_APP_NAME;
const serviceVersion = env.VITE_APP_VERSION;

// Create a Resource to describe this service
const resource = new Resource({
  [ATTR_SERVICE_NAME]: serviceName,
  [ATTR_SERVICE_VERSION]: serviceVersion,
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: env.VITE_APP_ENVIRONMENT,
});

// Construct the OTLP URL from the environment (e.g., VITE_LOG_ENDPOINT)
const otlpUrl = env.VITE_LOG_ENDPOINT;
if (!otlpUrl) {
  console.warn("Warning: VITE_LOG_ENDPOINT environment variable is not set");
}

// Setup the OTLP Log Exporter to send log records to the centralized logging backend.
const otlpLogExporter = new OTLPLogExporter({
  url: otlpUrl,
  headers: {
    "Content-Type": "application/json",
  },
  concurrencyLimit: 10,
  timeoutMillis: 30000,
});

// Instantiate the LoggerProvider and register the exporter with a simple log record processor.
const loggerProvider = new LoggerProvider({
  resource,
});
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(otlpLogExporter)
);

// Retrieve the OpenTelemetry logger for our service.
const otelLogger = loggerProvider.getLogger(serviceName);

/**
 * Helper function that creates a log record with the appropriate severity
 * and emits it via the OpenTelemetry logger.
 *
 * @param level - The log level as a string ('debug', 'info', 'warn', 'error').
 * @param message - The log message.
 * @param attributes - Optional extra attributes to include with the log record.
 */
export const emitLog = (
  level: string,
  body: LogRecord["body"],
  attributes: LogRecord["attributes"] = {}
) => {
  // Map log levels to severity numbers and texts as defined in the OTEL semantic conventions.
  const severityMap: Record<
    string,
    { severityNumber: number; severityText: string }
  > = {
    debug: { severityNumber: 5, severityText: "DEBUG" },
    info: { severityNumber: 9, severityText: "INFO" },
    warn: { severityNumber: 13, severityText: "WARN" },
    error: { severityNumber: 17, severityText: "ERROR" },
  };

  const severity = severityMap[level] || severityMap.info;

  // Construct a log record.
  const logRecord = {
    timestamp: Date.now(),
    body,
    severityNumber: severity.severityNumber,
    severityText: severity.severityText,
    attributes,
  };

  // Emit the log record using OpenTelemetry.
  otelLogger.emit(logRecord);
};

