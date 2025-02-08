import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
} from "@opentelemetry/semantic-conventions";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { env } from "@/config/env";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { UserIdSpanProcessor } from "./UserIdSpanProcessor";

// Create a Resource describing this service
const resource = new Resource({
  [ATTR_SERVICE_NAME]: env.VITE_APP_NAME || "musclecode-client",
  [ATTR_SERVICE_VERSION]: env.VITE_APP_VERSION,
  environment: env.VITE_APP_ENVIRONMENT,
  [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
  [ATTR_TELEMETRY_SDK_LANGUAGE]: "webjs",
});

// Configure the OTLP Trace Exporter with proper headers
const collectorOptions = {
  url: env.VITE_TRACE_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
};

const exporter = new OTLPTraceExporter(collectorOptions);

// Initialize the Web Tracer Provider with resource info
const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [new UserIdSpanProcessor(), new BatchSpanProcessor(exporter)],
});

const propagator = new W3CTraceContextPropagator();

// Combine API URLs for CORS configuration using RegExp for partial matches
const corsUrls = [
  new RegExp(env.VITE_API_URL?.replace(/https?:\/\//, "")), // Match subpaths
  new RegExp(env.VITE_EXECUTION_API_URL?.replace(/https?:\/\//, "")),
].filter((r) => r.source !== "(?:)"); // Filter out empty regexps

// Register instrumentations BEFORE provider registration
registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation({
      eventNames: [
        "click",
        "mousedown",
        "submit",
        "focus",
        "blur",
        "input",
        "keypress",
      ],
    }),
    new XMLHttpRequestInstrumentation({
      // @ts-expect-error - it should accept regexes
      propagateTraceHeaderCorsUrls: corsUrls,
    }),
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: corsUrls,
      clearTimingResources: true,
    }),
  ],
});

// Link the traces using the userid.

// Register provider with proper context management
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: propagator,
});

// Export the tracer for manual instrumentation
export const tracer = provider.getTracer(env.VITE_APP_NAME);
