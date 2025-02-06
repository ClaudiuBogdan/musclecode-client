import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Span, context, trace, propagation } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { env } from "@/config/env";

// Create a Resource describing this service
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]:
    env.VITE_APP_NAME || "musclecode-client",
  [SemanticResourceAttributes.SERVICE_VERSION]: env.VITE_APP_VERSION || "1.0.0",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.MODE,
  [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: "opentelemetry",
  [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: "webjs",
});

// Initialize the Web Tracer Provider with resource info
const provider = new WebTracerProvider({
  resource: resource,
});

// Configure the OTLP Trace Exporter with proper headers
const collectorOptions = {
  url: env.VITE_TRACE_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
};

const exporter = new OTLPTraceExporter(collectorOptions);

// Add a span processor to send spans to the exporter
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Set up W3C Trace Context propagation
propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// Register the provider to begin tracing
provider.register();

// Combine API URLs for CORS configuration
const corsUrls = [env.VITE_API_URL, env.VITE_EXECUTION_API_URL].filter(
  Boolean
) as string[];

// Register instrumentations for automatic XHR and fetch tracing
registerInstrumentations({
  instrumentations: [
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: corsUrls,
    }),
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: corsUrls,
      clearTimingResources: true,
    }),
  ],
  tracerProvider: provider,
});

// Export the tracer for manual instrumentation
export const tracer = provider.getTracer(
  env.VITE_APP_NAME || "musclecode-client"
);

/**
 * A helper function to create and manage a span with automatic error handling and logging
 */
export const runWithSpan = async <T>(
  spanName: string,
  fn: (span: Span) => Promise<T>,
  parentSpan?: Span
): Promise<T> => {
  const ctx = parentSpan
    ? trace.setSpan(context.active(), parentSpan)
    : context.active();
  const span = tracer.startSpan(spanName, undefined, ctx);

  try {
    const result = await fn(span);
    span.setStatus({ code: 1 }); // SUCCESS
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: 2 }); // ERROR
    throw error;
  } finally {
    span.end();
  }
};

/**
 * Helper to get the current active span
 */
export const getCurrentSpan = (): Span | undefined => {
  return trace.getSpan(context.active());
};

/**
 * Helper to create a new span as a child of the current span
 */
export const createChildSpan = (name: string): Span => {
  return tracer.startSpan(name, undefined, context.active());
};
