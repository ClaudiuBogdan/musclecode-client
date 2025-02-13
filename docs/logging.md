# Structured Logging Guidelines

This document outlines our approach to structured logging in React components.

## Core Principles

1. Log **why** something happened, not just what happened
2. Use static event types for identical events
3. Keep `extraInfo` small and PII-free (no personally identifiable information)
4. Leverage OpenTelemetry context instead of duplicate fields

## Logger Implementation

```typescript
export const createLogger = (context: string) => ({
  debug: (message: string, extraInfo?: Record<string, unknown>) => {
    emitLog("debug", { message, extraInfo }, { context });
  },
  
  info: (message: string, extraInfo?: Record<string, unknown>) => {
    emitLog("info", { message, extraInfo }, { context });
  },

  error: (message: string, error: Error, extraInfo?: Record<string, unknown>) => {
    emitLog("error", { 
      message,
      error: error.message,
      stack: error.stack 
    }, { 
      context,
      ...extraInfo
    });
  }
});

// Component-specific logger instances
export const apiLogger = createLogger("API");
export const authLogger = createLogger("Auth");
export const formLogger = createLogger("Form");
```

## Static Event Types with Structured Context

The core principle of our logging strategy is to use *static event types* combined with *structured context*:

### Message Field
- A concise, human-readable string describing the event type
- Must be a *static string* (no variable data)
- Acts as a summary/category of the event
- Examples: `"User Logged In"`, `"Cache Miss"`, `"API Request Failed"`

### ExtraInfo Field
- Contains all *dynamic* information about the event
- Explains *why* the event happened
- Should be:
  - **Low-Cardinality:** Limited, known set of possible values
  - **Essential:** Only include information needed for understanding/debugging
  - **PII-Free:** Never include personally identifiable information

## Strategic Logging Examples

### API Calls
```typescript
// ✅ Good - Static event type with structured context
apiLogger.info("API Request Started", {
  endpoint: "/user/profile",
  method: "GET"
});

apiLogger.debug("Cache Miss", { 
  key: "user:123",
  ttl: "300s" 
});

// Error handling with mandatory Error object
try {
  await fetchData();
} catch (error) {
  apiLogger.error("API Request Failed", error, {
    retryCount: 3,
    statusCode: error.response?.status
  });
}
```

### User Actions
```typescript
// ✅ Good - Essential context only
authLogger.info("Login Attempt", {
  provider: "google",
  deviceType: "mobile"
});

// ✅ Good - Targeted validation info
formLogger.info("Settings Updated", {
  changedFields: ["theme", "notifications"],
  validationErrors: 0
});
```

## OpenTelemetry Integration

```typescript
const emitLog = (
  level: string, 
  body: object, 
  attributes: Record<string, unknown>
) => {
  // OpenTelemetry automatically injects:
  // - traceId
  // - spanId
  // - userId (from auth context)
  console[level](JSON.stringify({ body, attributes }));
};
```

## Log Levels

- **DEBUG**: Cache operations, conditional branches, non-critical warnings
- **INFO**: User-initiated actions, state changes, API lifecycle events  
- **ERROR**: Unhandled exceptions, failed retries, critical service outages

## Anti-Patterns to Avoid

```typescript
// ❌ Bad - Dynamic message string
logger.info(`User ${userId} logged in`);
// ✅ Good - Static event type with structured data
authLogger.info("User Logged In", { userId });

// ❌ Bad - High cardinality, potentially sensitive data
logger.debug("State Update", { fullState: store.getState() });
// ✅ Good - Essential context only
formLogger.debug("State Changed", { 
  changedKeys: ["theme", "language"]
});

// ❌ Bad - Free-form text in extraInfo
apiLogger.info("API Error", { 
  details: `Failed to load user data for ${email}` 
});
// ✅ Good - Structured error data
apiLogger.error("API Request Failed", error, {
  operation: "loadUserData",
  statusCode: 404
});

// ❌ Bad - Large objects, high cardinality
userLogger.info("User Action", { userData: userObject });
// ✅ Good - Selected relevant fields
userLogger.info("User Profile Updated", {
  updatedFields: ["displayName", "avatar"]
});
```

## Key Benefits

1. Removed redundant context (userId/traceId handled by OTEL)
2. Enforced structured messages without string interpolation
3. Added error-specific signature with mandatory Error object
4. Created domain-specific loggers for better filtering
5. Limited extraInfo to essential context (< 5 fields)