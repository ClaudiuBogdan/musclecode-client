declare module "@opentelemetry/instrumentation-xml-http-request" {
  import {
    InstrumentationBase,
    InstrumentationConfig,
  } from "@opentelemetry/instrumentation";

  export interface XMLHttpRequestInstrumentationConfig
    extends InstrumentationConfig {
    propagateTraceHeaderCorsUrls?: string[];
  }

  export class XMLHttpRequestInstrumentation extends InstrumentationBase<XMLHttpRequestInstrumentationConfig> {
    constructor(config?: XMLHttpRequestInstrumentationConfig);
  }
}
