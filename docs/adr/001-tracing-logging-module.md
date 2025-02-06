# ADR 001: Tracing and Logging Module with OpenTelemetry and SigNoz

**Date:** 2024-03-XX

## Context

Our React application requires robust distributed tracing and logging to facilitate monitoring, debugging, and performance analysis. Following industry best practices, we decided to instrument the application using OpenTelemetry for distributed tracing and build a custom logging module that correlates logs with trace identifiers. This approach allows for a comprehensive view of the application's behavior.

## Decision

1. **Distributed Tracing:**
   - Use OpenTelemetry to initialize a WebTracerProvider with service resource information.
   - Configure an OTLP trace exporter directed to the SigNoz ingestion endpoint.
   - Register automatic instrumentations for XHR and Fetch API with CORS support.
   - Provide helper functions for manual span creation and management:
     - `runWithSpan`: Wrapper for async operations with automatic error handling
     - `getCurrentSpan`: Get the current active span
     - `createChildSpan`: Create a new span as a child of the current span

2. **Logging:**
   - Implement a structured logging module with the following features:
     - JSON-formatted logs with timestamp, level, message, and context
     - Automatic trace context injection (traceId, spanId)
     - Log level support: debug, info, warn, error
     - Automatic span event recording for all logs
     - Error tracking with exception recording in spans
   - Environment-aware logging (debug logs only in development)
   - Correlation between logs and traces via traceId and spanId

3. **Configuration:**
   - Use environment variables for configuration:
     - `VITE_TRACE_ENDPOINT`: SigNoz OTLP endpoint
     - `VITE_API_URL`: API URL for CORS configuration
     - `MODE`: Environment mode (development/production)
   - Service identification:
     - Service name and version tracking
     - Environment tagging

## Consequences

### Positive

- **Enhanced Observability:** Linking logs with trace ids enhances the correlation between application events and their associated distributed traces.
- **Standardization:** OpenTelemetry implementation follows industry standards and best practices.
- **Developer Experience:** Helper functions simplify manual instrumentation and span management.
- **Structured Logging:** Consistent JSON format makes logs easier to parse and analyze.
- **Error Tracking:** Automatic error recording in spans improves debugging capabilities.

### Negative

- **Bundle Size:** Additional dependencies increase the application bundle size.
- **Complexity:** More sophisticated logging and tracing setup requires proper documentation and team training.

## Technical Details

### Dependencies

```json
{
  "@opentelemetry/api": "^1.x",
  "@opentelemetry/sdk-trace-web": "^1.x",
  "@opentelemetry/resources": "^1.x",
  "@opentelemetry/semantic-conventions": "^1.x",
  "@opentelemetry/instrumentation": "^0.x",
  "@opentelemetry/instrumentation-fetch": "^0.x",
  "@opentelemetry/instrumentation-xml-http-request": "^0.x"
}
```

### Usage Example

```typescript
import { tracer, runWithSpan } from '@/telemetry/tracer';
import { logger } from '@/telemetry/logger';

// Automatic tracing of async operations
await runWithSpan('fetchUserData', async (span) => {
  logger.info('Fetching user data', { userId: '123' });
  const response = await fetch('/api/users/123');
  const data = await response.json();
  logger.info('User data fetched', { data });
  return data;
});
```

## Alternatives Considered

- **Other Tracing Tools:** Alternatives like Jaeger or Zipkin were evaluated; however, SigNoz integration via OpenTelemetry was chosen due to its seamless export capabilities and ease of use in a React environment.
- **Winston/Pino:** Considered using established Node.js logging libraries, but opted for a custom solution better suited for browser environments and OpenTelemetry integration.

## Future Considerations

- Add sampling configuration for production environments
- Implement trace filtering and custom sampling logic
- Add support for custom span attributes and semantic conventions
- Consider adding performance metrics collection

## Assumptions

- The SigNoz server is set up and accessible at the OTLP endpoint (http://localhost:4318/v1/traces), though this may need adjustment in production environments.
- Future updates to instrumentations or logging requirements can follow a similar modular pattern. 