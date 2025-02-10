# ADR: New User Interaction Tracing

## Status
Accepted

## Context
The client-side application requires detailed tracing of user interactions to gain improved insights into UI operations and usage patterns. We leverage OpenTelemetry instrumentation to generate spans on user interactions such as click, submit, change, keypress, and focus. The previous implementation filtered interactions based on a set of interactive elements; however, this approach limited the scope of tracking. Furthermore, deduplication was handled using a composite key based on element properties, which sometimes led to valid events being dropped.

## Decision
We updated the user interaction tracing as follows:

1. **Expanded Event Coverage**: 
   - The configuration now captures a broader range of events by including "click", "submit", "change", "keypress", and "focus" events.
   - Removed filtering based on specific interactive element tags, allowing all qualifying DOM events to be traced unless deduplication indicates they are duplicates.

2. **Improved Deduplication**:
   - Deduplication logic now employs a dedicated `EventCache` class that uses a WeakMap keyed on the DOM element, with a secondary map for event types. This avoids collisions that previously occurred when generating composite keys based on XPath and text content.
   - A 50ms threshold is maintained so that only rapid, duplicate events on the same element (and event type) are filtered.

3. **Span Enrichment**:
   - Each span is enriched with attributes such as `ui.tag`, `ui.id`, `ui.class`, a truncated version of element text (`ui.text`), accessibility attributes, XPath (`ui.xpath`), and the event type (`ui.event.type`).

4. **Tracer Configuration Enhancements**:
   - In production, the tracer uses a `BatchSpanProcessor` with a reduced `scheduledDelayMillis` of 500ms to ensure timely exporting of spans.
   - In development, a `SimpleSpanProcessor` is used for immediate span exporting to aid in real-time debugging.
   - Lifecycle event listeners (`beforeunload` and `visibilitychange`) have been added to flush pending spans when the page unloads or becomes hidden.

## Consequences
- **Improved Trace Coverage**: All intended user interactions trigger span creation, helping to capture a more complete picture of user behavior.
- **Accurate Deduplication**: The new deduplication method reduces false filtering of valid events, ensuring that the first event in a rapid sequence is always recorded.
- **Development vs. Production Parity**: Environment-specific span processors facilitate both immediate debugging in development and efficient batch processing in production.
- **Operational Overhead**: The broader trace collection increases the volume of spans, necessitating monitoring to ensure that performance and resource usage remain within acceptable limits.

## Alternatives Considered
- **Retention of Interactive Element Filtering**: Limiting traces to only certain elements (e.g., BUTTON, A, INPUT) could reduce noise but would miss valuable interactions.
- **Composite Key Deduplication**: The previous approach using composite keys was susceptible to collisions in dynamic UIs, leading to unintended deduplication of distinct events.

## Rationale
The new design improves trace fidelity by capturing a broader set of user interactions while accurately filtering out rapid duplicates. These changes enhance our observability capabilities without sacrificing performance or overloading the tracing backend.

## Future Considerations
- Monitor deduplication thresholds and adjust as necessary to balance performance with trace accuracy.
- Evaluate the performance impact as the volume of spans increases and consider further optimizations if required.
- Expand instrumentation to capture additional context as needed based on evolving application requirements. 