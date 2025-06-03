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

import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider
} from "@opentelemetry/sdk-logs";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";

import { env } from "@/config/env"; // shared configuration for the React app

import type {
  LogRecord} from "@opentelemetry/sdk-logs";

// Set service metadata based on environment configuration
const serviceName = env.VITE_APP_NAME;
const serviceVersion = env.VITE_APP_VERSION;

// Create a Resource to describe this service
const resource = resourceFromAttributes({
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

// Configure batch processing with optimized parameters
const batchProcessor = new BatchLogRecordProcessor(otlpLogExporter, {
  maxQueueSize: 1000, // Maximum queue size before dropping logs
  maxExportBatchSize: 100, // Maximum batch size per export
  scheduledDelayMillis: 5000, // Maximum wait time before exporting
  exportTimeoutMillis: 30000, // Maximum time to wait for export to complete
});

// Instantiate the LoggerProvider and register the exporter with a simple log record processor.
const loggerProvider = new LoggerProvider({
  resource,
});
loggerProvider.addLogRecordProcessor(batchProcessor);


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

