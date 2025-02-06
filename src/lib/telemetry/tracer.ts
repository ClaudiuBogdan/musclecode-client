import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { env } from "@/config/env";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
// Create the OTLP exporter using the TRACE_ENDPOINT
const exporter = new OTLPTraceExporter({
  url: env.VITE_TRACE_ENDPOINT,
});

// Initialize the WebTracerProvider with a Resource
const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "musclecode-client",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.MODE,
  }),
  spanProcessors: [
    new BatchSpanProcessor(exporter),
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
});

// Register auto-instrumentations to capture document load and fetch events
registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
    new FetchInstrumentation({
      // Ignore telemetry endpoints to prevent infinite loops
      ignoreUrls: [env.VITE_LOG_ENDPOINT, env.VITE_TRACE_ENDPOINT],
      // Add custom headers or modify requests if needed
      applyCustomAttributesOnSpan: (span) => {
        span.setAttribute("app.version", "1.0.0");
      },
    }),
  ],
  tracerProvider: provider,
});

provider.register({
  contextManager: new ZoneContextManager(),
});

// Export a singleton tracer
export const tracer = provider.getTracer(env.VITE_APP_NAME);
