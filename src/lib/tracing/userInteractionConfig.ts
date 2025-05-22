import { EventCache } from "./EventCache";
import { getElementText, getXPath } from "./utils";

import type { Span } from "@opentelemetry/api";
import type {
  UserInteractionInstrumentationConfig,
  ShouldPreventSpanCreation,
} from "@opentelemetry/instrumentation-user-interaction";

const eventCache = new EventCache();

interface UserInteractionConfig extends UserInteractionInstrumentationConfig {
  eventNames?: (keyof HTMLElementEventMap)[];
  shouldPreventSpanCreation?: ShouldPreventSpanCreation;
}

// Configuration for user interaction instrumentation
export const userInteractionConfig: UserInteractionConfig = {
  eventNames: ["click", "submit", "change", "keypress", "focus"] as const,
  shouldPreventSpanCreation: (
    eventType: string,
    element: Element,
    span: Span
  ): boolean => {
    // Check if this event should be deduplicated
    if (eventCache.shouldDeduplicate(eventType, element)) {
      return true;
    }

    // Add basic element information
    span.setAttribute("ui.tag", element.tagName.toLowerCase());
    span.setAttribute("ui.id", element.id || "");
    span.setAttribute("ui.class", element.className || "");

    // Add element text/value (being careful with sensitive data)
    const text = getElementText(element) || "";
    if (text) {
      const maxLength = 100;
      const maskedText =
        text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
      span.setAttribute("ui.text", maskedText);
    }

    // Add accessibility attributes
    if (element instanceof HTMLElement) {
      const role = element.getAttribute("role");
      if (role) {
        span.setAttribute("ui.role", role);
      }

      // Add data attributes that start with 'data-'
      Object.entries(element.dataset).forEach(([key, value]) => {
        if (value) {
          span.setAttribute(`ui.data.${key}`, value);
        }
      });

      // Add aria labels for accessibility context
      const ariaLabel = element.getAttribute("aria-label");
      if (ariaLabel) {
        span.setAttribute("ui.aria.label", ariaLabel);
      }
    }

    // Add form context if the element is part of a form
    const form = element.closest("form");
    if (form) {
      span.setAttribute("ui.form.id", form.id || "");
      span.setAttribute("ui.form.name", form.getAttribute("name") || "");
    }

    // Add XPath for unique identification
    span.setAttribute("ui.xpath", getXPath(element));

    // Add event specific attributes
    span.setAttribute("ui.event.type", eventType);

    // Don't prevent span creation
    return false;
  },
};
